import type { TrialResult } from '../types';

interface TrialViewProps {
  trial: TrialResult;
}

export default function TrialView({ trial }: TrialViewProps) {
  const { trialName, trialDescription, narrative, survived, reason, epitaph, finalScore } = trial;

  return (
    <div className="trial">
      <div className="trial__type">시련</div>
      <h2 className="trial__title">{trialName}</h2>
      <p className="trial__description">{trialDescription}</p>
      <p className="trial__narrative">{narrative}</p>

      <div className={`trial__result ${survived ? 'trial__result--survived' : 'trial__result--extinct'}`}>
        {survived ? '생존' : '멸종'}
      </div>
      <p className="trial__reason">{reason}</p>
      <div className="trial__score">최종 점수: {finalScore}</div>
      <p className="trial__epitaph">"{epitaph}"</p>
    </div>
  );
}
