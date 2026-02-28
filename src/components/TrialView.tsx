import type { TrialResult } from '../types';

interface TrialViewProps {
  trial: TrialResult;
}

export default function TrialView({ trial }: TrialViewProps) {
  const { type, title, narrative, survived, reason, epitaph, finalScore } = trial;

  return (
    <div className="trial">
      <div className="trial__type">{type}</div>
      <h2 className="trial__title">{title}</h2>
      <p className="trial__narrative">{narrative}</p>

      {survived !== undefined && (
        <>
          <div className={`trial__result ${survived ? 'trial__result--survived' : 'trial__result--extinct'}`}>
            {survived ? '생존' : '멸종'}
          </div>
          <p className="trial__reason">{reason}</p>
          <div className="trial__score">최종 점수: {finalScore}</div>
          <p className="trial__epitaph">"{epitaph}"</p>
        </>
      )}
    </div>
  );
}
