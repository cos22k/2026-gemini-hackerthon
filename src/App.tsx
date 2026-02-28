import { useState, useRef, useCallback, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "./styles/global.css";
import "./styles/intro.css";
import "./styles/stage.css";
import "./styles/modal.css";
import "./styles/components.css";
import "./styles/world.css";
import "./styles/effects.css";

import type {
  Creature,
  Environment,
  EvolutionResult,
  TrialResult,
  HistoryEvent,
  ActionButton,
} from "./types";
import type { CreatureSpec } from "./world/types";
import {
  generateCreature,
  generateEnvironment,
  generateEvolution,
  generateTrial,
  generateSynthesis,
} from "./api/gemini";
import { getChaosLevel } from "./game/environment";
import { executeWorldEvents } from "./game/worldEventExecutor";
import { normalizeCreatureSpec } from "./api/schemas";
import { useAuth } from "./lib/auth";
import { createSession, saveGameEvent } from "./game/firestorePersistence";

function mergeCreatureSpec(
  current: CreatureSpec | undefined,
  mutation?: Partial<CreatureSpec>,
): CreatureSpec {
  const base = current ?? normalizeCreatureSpec(undefined);
  if (!mutation) return base;
  return normalizeCreatureSpec({
    body: { ...base.body, ...mutation.body },
    eyes: { ...base.eyes, ...mutation.eyes },
    mouth: { ...base.mouth, ...mutation.mouth },
    additions: mutation.additions ?? base.additions,
    movement: mutation.movement ?? base.movement,
  } as Record<string, unknown>);
}
import IntroScreen from "./components/IntroScreen";
import MainStage from "./components/MainStage";
import HistoryPanel from "./components/HistoryPanel";
import SynthesisView from "./components/SynthesisView";
import EpilogueView from "./components/EpilogueView";
import SandboxPage from "./pages/SandboxPage";
import type { WorldSceneHandle } from "./world/WorldScene";

function GamePage() {
  const { uid } = useAuth();
  const worldRef = useRef<WorldSceneHandle>(null);
  const envTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [phase, setPhase] = useState("intro");
  const [creature, setCreature] = useState<Creature | null>(null);
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [evolution, setEvolution] = useState<EvolutionResult | null>(null);
  const [trial, setTrial] = useState<TrialResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [round, setRound] = useState(1);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (envTimerRef.current) clearTimeout(envTimerRef.current);
    };
  }, []);

  const dispatchWorldEvents = async (events?: unknown[]) => {
    if (!events || !Array.isArray(events) || !worldRef.current) return;
    const validTypes = [
      "addBody",
      "removeBody",
      "setGravity",
      "setWind",
      "applyForce",
      "shake",
      "clear",
    ];
    const cmds = events.filter(
      (e): e is import("./world/types").PhysicsCommand =>
        typeof e === "object" &&
        e !== null &&
        validTypes.includes((e as Record<string, unknown>).type as string),
    );
    if (cmds.length > 0) {
      await executeWorldEvents(worldRef.current.dispatch, cmds);
    }
  };

  const persistEvent = async (event: HistoryEvent) => {
    if (uid && sessionId) {
      saveGameEvent(uid, sessionId, event).catch(console.error);
    }
  };

  // Start environment phase with auto-timer
  const startEnvironmentPhase = useCallback((env: Environment) => {
    setEnvironment(env);
    const envEvent: HistoryEvent = {
      type: "environment",
      title: env.eventName,
      summary: `불안정 지수 ${env.instabilityIndex}`,
    };
    setHistory((prev) => [...prev, envEvent]);
    persistEvent(envEvent);
    setLoading(false);
    setPhase("environment");
    dispatchWorldEvents(env.worldEvents);

    // Auto-proceed after AI-decided duration
    if (envTimerRef.current) clearTimeout(envTimerRef.current);
    envTimerRef.current = setTimeout(() => {
      handleProceedFromEnvironment();
    }, env.durationSeconds * 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = async (k1: string, k2: string) => {
    setPhase("birth");
    setLoading(true);
    setLoadingMessage("생명의 씨앗을 심는 중...");
    setHistory([]);
    setEvolution(null);
    setTrial(null);
    setEnvironment(null);
    setRound(1);

    // Create Firestore session
    if (uid) {
      const sid = await createSession(uid).catch(() => null);
      if (sid) setSessionId(sid);
    }

    const newCreature = await generateCreature(k1, k2);
    console.log("[Creature]", newCreature);

    if (!newCreature) {
      setLoading(false);
      setLoadingMessage("");
      return;
    }

    setCreature(newCreature);
    const birthEvent: HistoryEvent = {
      type: "birth",
      title: "탄생",
      summary: `${newCreature.name} — ${k1} × ${k2}`,
    };
    setHistory([birthEvent]);
    persistEvent(birthEvent);

    // Show creature on stage (no loading overlay), generate env in background
    setLoading(false);
    setPhase("birth");

    const env = await generateEnvironment(
      newCreature,
      getChaosLevel(newCreature.generation ?? 1),
    );
    console.log("[Environment]", env);

    if (env) {
      startEnvironmentPhase(env);
    }
  };

  const handleProceedFromEnvironment = useCallback(async () => {
    // Clear auto-timer
    if (envTimerRef.current) {
      clearTimeout(envTimerRef.current);
      envTimerRef.current = null;
    }

    setPhase("evolving");
    // No loading overlay — show evolving visual effect instead

    // We need the latest creature and environment
    const currentCreature = creatureRef.current;
    const currentEnvironment = environmentRef.current;
    if (!currentCreature || !currentEnvironment) return;

    const evo = await generateEvolution(currentCreature, currentEnvironment);
    console.log("[Evolution]", evo);

    if (!evo) return;

    setEvolution(evo);
    await dispatchWorldEvents(evo.worldEvents);

    // Update creature with evolved stats and visual mutation
    const evolvedCreature: Creature = {
      ...currentCreature,
      name: evo.newName,
      traits: [
        ...currentCreature.traits.filter((t) => !evo.lostTraits.includes(t)),
        ...evo.newTraits,
      ],
      stats: {
        hp: Math.max(1, currentCreature.stats.hp + evo.statChanges.hp),
        adaptability: Math.max(
          0,
          currentCreature.stats.adaptability + evo.statChanges.adaptability,
        ),
        resilience: Math.max(
          0,
          currentCreature.stats.resilience + evo.statChanges.resilience,
        ),
        structure: Math.max(
          0,
          currentCreature.stats.structure + evo.statChanges.structure,
        ),
      },
      creatureSpec: mergeCreatureSpec(
        creature?.creatureSpec,
        evo.creatureSpecMutation,
      ),
    };
    setCreature(evolvedCreature);

    const evoEvent: HistoryEvent = {
      type: "evolution",
      title: evo.newName,
      summary: evo.poeticLine,
    };
    setHistory((prev) => [...prev, evoEvent]);
    persistEvent(evoEvent);

    // Auto-proceed to trial after showing evolution results
    setTimeout(async () => {
      setLoading(true);
      setLoadingMessage("시련이 다가오고 있습니다...");

      const trialResult = await generateTrial(
        evolvedCreature,
        currentEnvironment,
        getChaosLevel(evolvedCreature.generation ?? round),
      );
      console.log("[Trial]", trialResult);

      if (trialResult) {
        setTrial(trialResult);
        await dispatchWorldEvents(trialResult.worldEvents);
        const trialEvent: HistoryEvent = {
          type: "trial",
          title: trialResult.trialName,
          summary: trialResult.survived
            ? `생존 — 점수 ${trialResult.finalScore}`
            : `멸종 — 점수 ${trialResult.finalScore}`,
        };
        setHistory((prev) => [...prev, trialEvent]);
        persistEvent(trialEvent);
        setLoading(false);
        setPhase(trialResult.survived ? "synthesis" : "epilogue");
      } else {
        setLoading(false);
      }
    }, 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  // Refs to access latest state in callbacks
  const creatureRef = useRef(creature);
  creatureRef.current = creature;
  const environmentRef = useRef(environment);
  environmentRef.current = environment;

  const handleSynthesis = async (keyword: string) => {
    if (!creature || !trial) return;

    setLoading(true);
    setLoadingMessage("새로운 물질과 합성하는 중...");

    const result = await generateSynthesis(creature, trial, keyword);
    console.log("[Synthesis]", result);

    if (result) {
      await dispatchWorldEvents(result.worldEvents);

      const synthesizedCreature: Creature = {
        ...creature,
        name: result.newName,
        traits: [...creature.traits, ...result.newTraits],
        vulnerabilities: result.modifiedVulnerabilities,
        energyStrategy: result.energyStrategy,
        stats: {
          hp: Math.max(1, creature.stats.hp + result.statChanges.hp),
          adaptability: Math.max(
            0,
            creature.stats.adaptability + result.statChanges.adaptability,
          ),
          resilience: Math.max(
            0,
            creature.stats.resilience + result.statChanges.resilience,
          ),
          structure: Math.max(
            0,
            creature.stats.structure + result.statChanges.structure,
          ),
        },
        generation: (creature.generation ?? 1) + 1,
        creatureSpec: mergeCreatureSpec(
          creature.creatureSpec,
          result.creatureSpecMutation,
        ),
      };
      setCreature(synthesizedCreature);

      const synthEvent: HistoryEvent = {
        type: "synthesis",
        title: `+${keyword}`,
        summary: result.fusionLine,
      };
      setHistory((prev) => [...prev, synthEvent]);
      persistEvent(synthEvent);

      // Start next round — generate env in background
      setRound((r) => r + 1);
      setEvolution(null);
      setTrial(null);

      // Show creature on stage while env generates
      setPhase("birth");
      setLoading(false);

      const env = await generateEnvironment(
        synthesizedCreature,
        getChaosLevel(synthesizedCreature.generation ?? 1),
      );
      console.log("[Environment R" + (round + 1) + "]", env);

      if (env) {
        startEnvironmentPhase(env);
      }
    } else {
      setLoading(false);
    }
  };

  const handleSkipSynthesis = async () => {
    if (!creature) return;

    setRound((r) => r + 1);
    setEvolution(null);
    setTrial(null);

    const nextCreature = {
      ...creature,
      generation: (creature.generation ?? 1) + 1,
    };
    setCreature(nextCreature);

    // Show creature on stage while env generates
    setPhase("birth");

    const env = await generateEnvironment(
      nextCreature,
      getChaosLevel(nextCreature.generation ?? 1),
    );
    if (env) {
      startEnvironmentPhase(env);
    }
  };

  const handleRestart = () => {
    if (envTimerRef.current) clearTimeout(envTimerRef.current);
    setPhase("intro");
    setCreature(null);
    setEnvironment(null);
    setEvolution(null);
    setTrial(null);
    setHistory([]);
    setSessionId(null);
    setRound(1);
  };

  if (phase === "intro") {
    return <IntroScreen onStart={handleStart} />;
  }

  const actionButtons: ActionButton[] = [];
  if (phase === "epilogue") {
    actionButtons.push({
      label: "새로운 생명 창조",
      onClick: handleRestart,
      primary: true,
    });
  }

  return (
    <div className="game-layout">
      {/* SVG sketchy filter (used by world.css .physics-body) */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="sketchy">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.03"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>
      </svg>

      {loading && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "var(--text-lg)",
                color: "var(--text-secondary)",
              }}
            >
              {loadingMessage}
            </p>
          </div>
        </div>
      )}

      <MainStage
        phase={phase}
        creature={creature ?? undefined}
        environment={environment ?? undefined}
        evolution={evolution ?? undefined}
        trial={trial ?? undefined}
        actionButtons={actionButtons}
        worldRef={worldRef}
        onProceed={handleProceedFromEnvironment}
        durationSeconds={environment?.durationSeconds}
      >
        {phase === "synthesis" && trial && creature && (
          <SynthesisView
            creature={creature}
            trial={trial}
            onSynthesize={handleSynthesis}
            onSkip={handleSkipSynthesis}
          />
        )}
        {phase === "epilogue" && trial && (
          <EpilogueView
            trial={trial}
            creature={creature}
            onRestart={handleRestart}
          />
        )}
      </MainStage>

      <HistoryPanel history={history} activeIndex={history.length - 1} />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<GamePage />} />
      <Route path="/sandbox" element={<SandboxPage />} />
    </Routes>
  );
}

export default App;
