import type { RefObject, ReactNode } from 'react';
import type { Creature, EvolutionResult, TrialResult, ActionButton } from '../types';
import { WorldScene, type WorldSceneHandle } from '../world/WorldScene';
import TrialView from './TrialView';
import ActionButtons from './ActionButtons';

interface MainStageProps {
  phase: string;
  creature?: Creature;
  evolution?: EvolutionResult;
  trial?: TrialResult;
  actionButtons?: ActionButton[];
  worldRef?: RefObject<WorldSceneHandle | null>;
  children?: ReactNode;
}

export default function MainStage({
  phase,
  creature,
  evolution,
  trial,
  actionButtons,
  worldRef,
  children,
}: MainStageProps) {
  const bgClass =
    phase === 'birth' ? 'stage__background--birth' :
    phase === 'environment' ? 'stage__background--environment' :
    phase === 'evolving' ? 'stage__background--evolution' :
    phase === 'trial' || phase === 'synthesis' || phase === 'epilogue' ? 'stage__background--trial' :
    'stage__background--birth';

  return (
    <div className="stage">
      <div className={`stage__background ${bgClass}`} />
      <div className="stage__content">
        {phase === 'evolving' && evolution ? (
          <div className="evolution">
            <h2 className="evolution__name">{evolution.newName}</h2>
            <p className="evolution__summary">{evolution.evolutionSummary}</p>
            <div className="evolution__tradeoffs">
              {evolution.tradeoffs.map((t, i) => (
                <p key={i} className="evolution__tradeoff">{t}</p>
              ))}
            </div>
            <p className="evolution__poetic">"{evolution.poeticLine}"</p>
          </div>
        ) : phase === 'trial' && trial ? (
          <TrialView trial={trial} />
        ) : phase === 'synthesis' || phase === 'epilogue' ? (
          children
        ) : (
          creature && (
            <>
              <div className="stage__creature-area">
                <WorldScene
                  ref={worldRef}
                  weather="none"
                  creatureSpec={creature.creatureSpec}
                />
              </div>
              {phase === 'birth' && creature.birthWords && (
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
