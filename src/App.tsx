import { useState } from 'react';
import './styles/global.css';
import './styles/intro.css';
import './styles/stage.css';
import './styles/modal.css';
import './styles/components.css';

import type { Creature, Environment, EvolutionResult, TrialResult, HistoryEvent, ActionButton } from './types';
import IntroScreen from './components/IntroScreen';
import MainStage from './components/MainStage';
import HistoryPanel from './components/HistoryPanel';
import ChoiceModal from './components/ChoiceModal';

// Mock data for layout preview
const MOCK_CREATURE: Creature = {
  name: '페로-솔라리스',
  species: 'Ferro-solaris rosaeum',
  description:
    '금속성 세포벽을 가진 광합성 생명체. 철 이온을 흡수하여 꽃잎 형태의 태양광 수집판을 형성한다. 어둠 속에서도 빛을 기억하는 존재.',
  traits: ['금속 세포벽', '자기장 감응', '전자기파 소통'],
  vulnerabilities: ['산성 환경 부식', '고온 구조 붕괴'],
  stats: { hp: 100, adaptability: 55, resilience: 65, structure: 80 },
  imageUrl: null,
  birthWords: '차가운 금속 사이로 처음 빛이 들어왔을 때, 나는 그것이 따뜻하다는 것을 알았습니다.',
};

const MOCK_ENVIRONMENT: Environment = {
  eventName: '산성안개',
  pressure: 'high',
  oxygen: 'low',
  temperature: 'normal',
  instabilityIndex: 72,
  narrative:
    '대기 중 황산 미세입자의 농도가 급격히 상승하고 있다. 짙은 안개가 지표면을 뒤덮으며 pH 3.2 수준의 산성 강하물이 관측된다. 광합성에 필요한 가시광선의 투과율이 40% 이하로 떨어졌다.',
  threatDetail: '금속 세포벽의 표면 부식이 시작될 수 있으며, 광합성 효율이 심각하게 저하된다',
};

const MOCK_NATURAL: EvolutionResult = {
  newName: '페로-솔라리스 점액종',
  evolutionSummary:
    '산성 안개에 노출된 페로-솔라리스는 금속 세포벽 위에 점액질 보호막을 분비하기 시작했다. 빛을 포기한 날, 그것은 처음으로 어둠 속에서 웃었다.',
  tradeoffs: ['산성 내성을 얻었으나 광합성 효율 60% 감소'],
  statChanges: { hp: 90, adaptability: 70, resilience: 75, structure: 65 },
  poeticLine: '빛을 포기한 자만이 어둠에서 살아남는다.',
  imageUrl: null,
};

const MOCK_INTERVENED: EvolutionResult = {
  newName: '페로-솔라리스 아르마투스',
  evolutionSummary:
    '산소 보충으로 안정된 환경에서 페로-솔라리스는 기존 구조를 강화하는 방향으로 진화했다. 그러나 야생의 적응력은 감소했다.',
  tradeoffs: ['구조 안정성 증가, 야생 적응력 감소'],
  statChanges: { hp: 100, adaptability: 45, resilience: 70, structure: 85 },
  poeticLine: '보호받은 자는 강하지만, 스스로 길을 찾지 못한다.',
  imageUrl: null,
};

const MOCK_TRIAL: TrialResult = {
  type: '시련',
  title: '산성비',
  narrative:
    '하늘이 노랗게 물들더니 pH 2.1의 강산성 비가 쏟아지기 시작했다. 점액 보호막이 첫 번째 파도를 막아냈지만, 지속적인 강하에 점액이 희석되기 시작했다.',
  survived: true,
  reason:
    '점액 보호막이 1차 방어를 수행했고, 부식된 금속 이온이 토양과 반응하여 2차 중화층을 만들었다.',
  finalScore: 72,
  epitaph: '상처가 갑옷이 되는 데는 시간이 필요하다.',
};

const MOCK_HISTORY: HistoryEvent[] = [
  { type: 'birth', title: '탄생', summary: '페로-솔라리스 — 금속 × 장미' },
  { type: 'environment', title: '산성안개', summary: '불안정 지수 72' },
  { type: 'intervention', title: '개입: 산소 보충', summary: '산소 수준 안정화' },
  { type: 'evolution', title: '진화 분기', summary: '점액종 vs 아르마투스' },
  { type: 'trial', title: '산성비', summary: '생존 — 점수 72' },
];

// Demo phases for previewing layout
const DEMO_PHASES = ['birth', 'environment', 'comparison', 'trial'] as const;

function App() {
  const [phase, setPhase] = useState('intro');
  const [showModal, setShowModal] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);

  const handleStart = () => {
    setPhase('birth');
    setDemoIndex(0);
  };

  const handleNextPhase = () => {
    const next = demoIndex + 1;
    if (next < DEMO_PHASES.length) {
      setDemoIndex(next);
      setPhase(DEMO_PHASES[next]);
      if (DEMO_PHASES[next] === 'environment') {
        setShowModal(true);
      }
    }
  };

  const handleObserve = () => {
    setShowModal(false);
    setPhase('comparison');
    setDemoIndex(2);
  };

  const handleIntervene = () => {
    setShowModal(false);
    setPhase('comparison');
    setDemoIndex(2);
  };

  const handleChoosePath = () => {
    setPhase('trial');
    setDemoIndex(3);
  };

  const handleRestart = () => {
    setPhase('intro');
    setShowModal(false);
    setDemoIndex(0);
  };

  // Intro screen
  if (phase === 'intro') {
    return <IntroScreen onStart={handleStart} />;
  }

  // Build action buttons based on phase
  const actionButtons: ActionButton[] = [];
  if (phase === 'birth' || phase === 'environment') {
    actionButtons.push({ label: '다음 단계 →', onClick: handleNextPhase, primary: true });
  }
  if (phase === 'trial') {
    actionButtons.push({ label: '🌱 새로운 생명 창조', onClick: handleRestart, primary: true });
  }

  return (
    <div className="game-layout">
      <MainStage
        phase={phase}
        creature={MOCK_CREATURE}
        natural={MOCK_NATURAL}
        intervened={MOCK_INTERVENED}
        trial={MOCK_TRIAL}
        actionButtons={actionButtons}
        onChooseNatural={handleChoosePath}
        onChooseIntervened={handleChoosePath}
      />
      <HistoryPanel
        history={MOCK_HISTORY.slice(0, demoIndex + 1)}
        activeIndex={demoIndex}
      />
      {showModal && (
        <ChoiceModal
          environment={MOCK_ENVIRONMENT}
          interventionUsed={false}
          onObserve={handleObserve}
          onIntervene={handleIntervene}
        />
      )}
    </div>
  );
}

export default App;
