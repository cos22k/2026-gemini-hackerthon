import { useState } from 'react';
import './styles/global.css';
import './styles/intro.css';
import './styles/stage.css';
import './styles/modal.css';
import './styles/components.css';

import type { Creature, Environment, EvolutionResult, TrialResult, HistoryEvent, ActionButton } from './types';
import { generateCreature, generateEnvironment, generateEvolution, generateTrial } from './api/gemini';
import { getChaosLevel } from './game/environment';
import IntroScreen from './components/IntroScreen';
import MainStage from './components/MainStage';
import HistoryPanel from './components/HistoryPanel';
import ChoiceModal from './components/ChoiceModal';

function App() {
  const [phase, setPhase] = useState('intro');
  const [showModal, setShowModal] = useState(false);
  const [creature, setCreature] = useState<Creature | null>(null);
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [evolution, setEvolution] = useState<EvolutionResult | null>(null);
  const [trial, setTrial] = useState<TrialResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [history, setHistory] = useState<HistoryEvent[]>([]);

  const chaosLevel = getChaosLevel(creature?.generation ?? 1);

  const handleStart = async (k1: string, k2: string) => {
    // 1. Generate creature
    setPhase('birth');
    setLoading(true);
    setLoadingMessage('생명의 씨앗을 심는 중...');
    setHistory([]);
    setEvolution(null);
    setTrial(null);
    setEnvironment(null);

    const newCreature = await generateCreature(k1, k2);
    console.log('[Creature]', newCreature);

    if (!newCreature) {
      console.error('Creature generation failed');
      setLoading(false);
      setLoadingMessage('');
      return;
    }

    setCreature(newCreature);
    setHistory([{ type: 'birth', title: '탄생', summary: `${newCreature.name} — ${k1} × ${k2}` }]);

    // 2. Generate environment
    setLoadingMessage('환경이 변화하고 있습니다...');
    const env = await generateEnvironment(newCreature, getChaosLevel(newCreature.generation ?? 1));
    console.log('[Environment]', env);

    if (env) {
      setEnvironment(env);
      setHistory((prev) => [
        ...prev,
        { type: 'environment', title: env.eventName, summary: `불안정 지수 ${env.instabilityIndex}` },
      ]);
      setLoading(false);
      setPhase('environment');
      setShowModal(true);
    } else {
      console.error('Environment generation failed');
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

    // 3. Generate evolution
    const evo = await generateEvolution(creature, environment);
    console.log('[Evolution]', evo);

    if (!evo) {
      console.error('Evolution generation failed');
      setLoading(false);
      return;
    }

    setEvolution(evo);

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

    setHistory((prev) => [
      ...prev,
      { type: 'evolution', title: evo.newName, summary: evo.poeticLine },
    ]);
    setLoading(false);

    // Auto-proceed to trial after a brief moment
    setTimeout(async () => {
      setLoading(true);
      setLoadingMessage('시련이 다가오고 있습니다...');

      // 4. Generate trial
      const trialResult = await generateTrial(evolvedCreature, environment, chaosLevel);
      console.log('[Trial]', trialResult);

      if (trialResult) {
        setTrial(trialResult);
        setHistory((prev) => [
          ...prev,
          {
            type: 'trial',
            title: trialResult.trialName,
            summary: trialResult.survived
              ? `생존 — 점수 ${trialResult.finalScore}`
              : `멸종 — 점수 ${trialResult.finalScore}`,
          },
        ]);
        setLoading(false);
        setPhase('trial');
      } else {
        console.error('Trial generation failed');
        setLoading(false);
      }
    }, 2000);
  };

  const handleRestart = () => {
    setPhase('intro');
    setShowModal(false);
    setCreature(null);
    setEnvironment(null);
    setEvolution(null);
    setTrial(null);
    setHistory([]);
  };

  // Intro screen
  if (phase === 'intro') {
    return <IntroScreen onStart={handleStart} />;
  }

  // Build action buttons based on phase
  const actionButtons: ActionButton[] = [];
  if (phase === 'trial') {
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
      />
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

export default App;
