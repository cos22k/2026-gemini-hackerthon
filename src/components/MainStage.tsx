import type { Creature, EvolutionResult, TrialResult, ActionButton } from '../types';
import CreatureCard from './CreatureCard';
import ComparisonView from './ComparisonView';
import TrialView from './TrialView';
import ActionButtons from './ActionButtons';

interface MainStageProps {
  phase: string;
  creature?: Creature;
  natural?: EvolutionResult;
  intervened?: EvolutionResult;
  trial?: TrialResult;
  actionButtons?: ActionButton[];
  onChooseNatural?: () => void;
  onChooseIntervened?: () => void;
}

export default function MainStage({
  phase,
  creature,
  natural,
  intervened,
  trial,
  actionButtons,
  onChooseNatural,
  onChooseIntervened,
}: MainStageProps) {
  const bgClass =
    phase === 'birth' ? 'stage__background--birth' :
    phase === 'environment' || phase === 'choice' ? 'stage__background--environment' :
    phase === 'evolving' || phase === 'comparison' ? 'stage__background--evolution' :
    phase === 'trial' || phase === 'result' ? 'stage__background--trial' :
    'stage__background--birth';

  return (
    <div className="stage">
      <div className={`stage__background ${bgClass}`} />
      <div className="stage__content">
        {/* Comparison mode */}
        {phase === 'comparison' && natural ? (
          <ComparisonView
            natural={natural}
            intervened={intervened}
            onChooseNatural={onChooseNatural!}
            onChooseIntervened={onChooseIntervened!}
          />
        ) : phase === 'trial' || phase === 'result' ? (
          /* Trial mode */
          trial && <TrialView trial={trial} />
        ) : (
          /* Default: creature display */
          creature && (
            <>
              <div className="stage__creature-area">
                <CreatureCard creature={creature} />
              </div>
              {creature.birthWords && (
                <p className="stage__birth-words">"{creature.birthWords}"</p>
              )}
            </>
          )
        )}
      </div>

      {actionButtons && actionButtons.length > 0 && <ActionButtons buttons={actionButtons} />}
    </div>
  );
}
