import type { EvolutionResult } from '../types';
import StatBar from './StatBar';
import CreatureSVG from './CreatureSVG';

interface ColumnProps {
  data: EvolutionResult;
  variant: 'natural' | 'intervened';
  onChoose: () => void;
}

function Column({ data, variant, onChoose }: ColumnProps) {
  const isNatural = variant === 'natural';
  const label = isNatural ? '자연' : '개입';

  return (
    <div className={`comparison__column comparison__column--${variant}`}>
      <div className={`comparison__label comparison__label--${variant}`}>
        {isNatural ? '🌿' : '⚡'} {label}
      </div>

      <div className="comparison__image-wrapper">
        {data.imageUrl ? (
          <img src={data.imageUrl} alt={data.newName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <CreatureSVG name={data.newName} />
        )}
      </div>

      <div className="comparison__name">{data.newName}</div>
      <p className="comparison__summary">{data.evolutionSummary}</p>
      <p className="comparison__tradeoffs">
        {data.tradeoffs?.map((t, i) => <span key={i}>{t}<br /></span>)}
      </p>

      <div className="comparison__stats">
        {data.statChanges &&
          Object.entries(data.statChanges).map(([key, val]) => (
            <StatBar key={key} stat={key} value={val} />
          ))}
      </div>

      <p className="comparison__poetic">{data.poeticLine}</p>

      <button
        className={`comparison__choose-btn comparison__choose-btn--${variant}`}
        onClick={onChoose}
      >
        이 경로 선택
      </button>
    </div>
  );
}

interface ComparisonViewProps {
  natural: EvolutionResult;
  intervened?: EvolutionResult;
  onChooseNatural: () => void;
  onChooseIntervened: () => void;
}

export default function ComparisonView({ natural, intervened, onChooseNatural, onChooseIntervened }: ComparisonViewProps) {
  return (
    <div className="comparison">
      <Column data={natural} variant="natural" onChoose={onChooseNatural} />
      {intervened && (
        <Column data={intervened} variant="intervened" onChoose={onChooseIntervened} />
      )}
    </div>
  );
}
