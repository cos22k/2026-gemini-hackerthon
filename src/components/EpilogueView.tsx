import type { Creature, TrialResult } from '../types';

interface EpilogueViewProps {
  trial: TrialResult;
  creature: Creature | null;
  onRestart: () => void;
}

export default function EpilogueView({ trial, creature, onRestart }: EpilogueViewProps) {
  return (
    <div className="epilogue">
      <div className="epilogue__header">멸종</div>
      {creature && (
        <h2 className="epilogue__creature-name">{creature.name}</h2>
      )}
      <p className="epilogue__narrative">{trial.narrative}</p>
      <p className="epilogue__reason">{trial.reason}</p>
      <div className="epilogue__score">최종 점수: {trial.finalScore}</div>
      <p className="epilogue__epitaph">"{trial.epitaph}"</p>
      <p className="epilogue__mutation">{trial.damageOrMutation}</p>

      <button className="epilogue__btn" onClick={onRestart}>
        새로운 생명 창조
      </button>
    </div>
  );
}
