import { useState, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import './styles/global.css';
import './styles/intro.css';
import './styles/stage.css';
import './styles/modal.css';
import './styles/components.css';
import './styles/world.css';

import type { Creature, Environment, EvolutionResult, TrialResult, HistoryEvent, ActionButton } from './types';
import { generateCreature, generateEnvironment, generateEvolution, generateTrial, generateSynthesis } from './api/gemini';
import { getChaosLevel } from './game/environment';
import { executeWorldEvents } from './game/worldEventExecutor';
import { useAuth } from './lib/auth';
import { createSession, saveGameState, saveGameEvent } from './game/firestorePersistence';
import IntroScreen from './components/IntroScreen';
import MainStage from './components/MainStage';
import HistoryPanel from './components/HistoryPanel';
import ChoiceModal from './components/ChoiceModal';
import SynthesisView from './components/SynthesisView';
import EpilogueView from './components/EpilogueView';
import SandboxPage from './pages/SandboxPage';
import type { WorldSceneHandle } from './world/WorldScene';
import type { SynthesisResult } from './game/types';

function GamePage() {
  const { uid } = useAuth();
  const worldRef = useRef<WorldSceneHandle>(null);

  const [phase, setPhase] = useState('intro');
  const [showModal, setShowModal] = useState(false);
  const [creature, setCreature] = useState<Creature | null>(null);
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [evolution, setEvolution] = useState<EvolutionResult | null>(null);
  const [trial, setTrial] = useState<TrialResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [round, setRound] = useState(1);

  const chaosLevel = getChaosLevel(creature?.generation ?? round);

  const dispatchWorldEvents = async (events?: unknown[]) => {
    if (!events || !Array.isArray(events) || !worldRef.current) return;
    const validTypes = ['addBody', 'removeBody', 'setGravity', 'setWind', 'applyForce', 'shake', 'clear'];
    const cmds = events.filter(
      (e): e is import('./world/types').PhysicsCommand =>
        typeof e === 'object' && e !== null && validTypes.includes((e as Record<string, unknown>).type as string),
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

  const handleStart = async (k1: string, k2: string) => {
    setPhase('birth');
    setLoading(true);
    setLoadingMessage('생명의 씨앗을 심는 중...');
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
    console.log('[Creature]', newCreature);

    if (!newCreature) {
      setLoading(false);
      setLoadingMessage('');
      return;
    }

    setCreature(newCreature);
    const birthEvent: HistoryEvent = { type: 'birth', title: '탄생', summary: `${newCreature.name} — ${k1} × ${k2}` };
    setHistory([birthEvent]);
    persistEvent(birthEvent);

    // Generate environment
    setLoadingMessage('환경이 변화하고 있습니다...');
    const env = await generateEnvironment(newCreature, getChaosLevel(newCreature.generation ?? 1));
    console.log('[Environment]', env);

    if (env) {
      setEnvironment(env);
      const envEvent: HistoryEvent = { type: 'environment', title: env.eventName, summary: `불안정 지수 ${env.instabilityIndex}` };
      setHistory((prev) => [...prev, envEvent]);
      persistEvent(envEvent);
      setLoading(false);
      setPhase('environment');
      setShowModal(true);
      await dispatchWorldEvents(env.worldEvents);
    } else {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleProceedFromEnvironment = async () => {
    if (!creature || !environment) return;

    setShowModal(false);
    setPhase('evolving');
    setLoading(true);
    setLoadingMessage('진화가 진행되고 있습니다...');

    const evo = await generateEvolution(creature, environment);
    console.log('[Evolution]', evo);

    if (!evo) {
      setLoading(false);
      return;
    }

    setEvolution(evo);
    await dispatchWorldEvents(evo.worldEvents);

    // Update creature with evolved stats
    const evolvedCreature: Creature = {
      ...creature,
      name: evo.newName,
      traits: [
        ...creature.traits.filter((t) => !evo.lostTraits.includes(t)),
        ...evo.newTraits,
      ],
      stats: {
        hp: Math.max(1, creature.stats.hp + evo.statChanges.hp),
        adaptability: Math.max(0, creature.stats.adaptability + evo.statChanges.adaptability),
        resilience: Math.max(0, creature.stats.resilience + evo.statChanges.resilience),
        structure: Math.max(0, creature.stats.structure + evo.statChanges.structure),
      },
    };
    setCreature(evolvedCreature);

    const evoEvent: HistoryEvent = { type: 'evolution', title: evo.newName, summary: evo.poeticLine };
    setHistory((prev) => [...prev, evoEvent]);
    persistEvent(evoEvent);
    setLoading(false);

    // Auto-proceed to trial
    setTimeout(async () => {
      setLoading(true);
      setLoadingMessage('시련이 다가오고 있습니다...');

      const trialResult = await generateTrial(evolvedCreature, environment, chaosLevel);
      console.log('[Trial]', trialResult);

      if (trialResult) {
        setTrial(trialResult);
        await dispatchWorldEvents(trialResult.worldEvents);
        const trialEvent: HistoryEvent = {
          type: 'trial',
          title: trialResult.trialName,
          summary: trialResult.survived
            ? `생존 — 점수 ${trialResult.finalScore}`
            : `멸종 — 점수 ${trialResult.finalScore}`,
        };
        setHistory((prev) => [...prev, trialEvent]);
        persistEvent(trialEvent);
        setLoading(false);
        setPhase(trialResult.survived ? 'synthesis' : 'epilogue');
      } else {
        setLoading(false);
      }
    }, 2000);
  };

  const handleSynthesis = async (keyword: string) => {
    if (!creature || !trial) return;

    setLoading(true);
    setLoadingMessage('새로운 물질과 합성하는 중...');

    const result = await generateSynthesis(creature, trial, keyword);
    console.log('[Synthesis]', result);

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
          adaptability: Math.max(0, creature.stats.adaptability + result.statChanges.adaptability),
          resilience: Math.max(0, creature.stats.resilience + result.statChanges.resilience),
          structure: Math.max(0, creature.stats.structure + result.statChanges.structure),
        },
        generation: (creature.generation ?? 1) + 1,
      };
      setCreature(synthesizedCreature);

      const synthEvent: HistoryEvent = { type: 'synthesis', title: `+${keyword}`, summary: result.fusionLine };
      setHistory((prev) => [...prev, synthEvent]);
      persistEvent(synthEvent);

      // Start next round
      setRound((r) => r + 1);
      setEvolution(null);
      setTrial(null);

      setLoadingMessage('환경이 변화하고 있습니다...');
      const env = await generateEnvironment(synthesizedCreature, getChaosLevel((synthesizedCreature.generation ?? 1)));
      console.log('[Environment R' + (round + 1) + ']', env);

      if (env) {
        setEnvironment(env);
        const envEvent: HistoryEvent = { type: 'environment', title: env.eventName, summary: `불안정 지수 ${env.instabilityIndex}` };
        setHistory((prev) => [...prev, envEvent]);
        persistEvent(envEvent);
        setLoading(false);
        setPhase('environment');
        setShowModal(true);
        await dispatchWorldEvents(env.worldEvents);
      } else {
        setLoading(false);
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
    setLoading(true);
    setLoadingMessage('환경이 변화하고 있습니다...');

    const nextCreature = { ...creature, generation: (creature.generation ?? 1) + 1 };
    setCreature(nextCreature);

    const env = await generateEnvironment(nextCreature, getChaosLevel(nextCreature.generation ?? 1));
    if (env) {
      setEnvironment(env);
      const envEvent: HistoryEvent = { type: 'environment', title: env.eventName, summary: `불안정 지수 ${env.instabilityIndex}` };
      setHistory((prev) => [...prev, envEvent]);
      persistEvent(envEvent);
      setLoading(false);
      setPhase('environment');
      setShowModal(true);
      await dispatchWorldEvents(env.worldEvents);
    } else {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setPhase('intro');
    setShowModal(false);
    setCreature(null);
    setEnvironment(null);
    setEvolution(null);
    setTrial(null);
    setHistory([]);
    setSessionId(null);
    setRound(1);
  };

  if (phase === 'intro') {
    return <IntroScreen onStart={handleStart} />;
  }

  const actionButtons: ActionButton[] = [];
  if (phase === 'epilogue') {
    actionButtons.push({ label: '새로운 생명 창조', onClick: handleRestart, primary: true });
  }

  return (
    <div className="game-layout">
      {loading && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
              {loadingMessage}
            </p>
          </div>
        </div>
      )}

      <MainStage
        phase={phase}
        creature={creature ?? undefined}
        evolution={evolution ?? undefined}
        trial={trial ?? undefined}
        actionButtons={actionButtons}
        worldRef={worldRef}
      >
        {phase === 'synthesis' && trial && creature && (
          <SynthesisView
            creature={creature}
            trial={trial}
            onSynthesize={handleSynthesis}
            onSkip={handleSkipSynthesis}
          />
        )}
        {phase === 'epilogue' && trial && (
          <EpilogueView trial={trial} creature={creature} onRestart={handleRestart} />
        )}
      </MainStage>

      <HistoryPanel
        history={history}
        activeIndex={history.length - 1}
      />

      {showModal && environment && (
        <ChoiceModal
          environment={environment}
          onProceed={handleProceedFromEnvironment}
        />
      )}
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
