import type { RefObject, ReactNode } from 'react';
import type { Creature, Environment, EvolutionResult, TrialResult, ActionButton } from '../types';
import { WorldScene, type WorldSceneHandle } from '../world/WorldScene';
import TrialView from './TrialView';
import ActionButtons from './ActionButtons';
import EnvironmentEffects from './EnvironmentEffects';

interface MainStageProps {
  phase: string;
  creature?: Creature;
  environment?: Environment;
  evolution?: EvolutionResult;
  trial?: TrialResult;
  actionButtons?: ActionButton[];
  worldRef?: RefObject<WorldSceneHandle | null>;
  onProceed?: () => void;
  durationSeconds?: number;
  children?: ReactNode;
}

export default function MainStage({
  phase,
  creature,
  environment,
  evolution,
  trial,
  actionButtons,
  worldRef,
  onProceed,
  durationSeconds,
  children,
}: MainStageProps) {
  const bgClass =
    phase === 'birth' ? 'stage__background--birth' :
    phase === 'environment' ? 'stage__background--environment' :
    phase === 'evolving' ? 'stage__background--evolution' :
    phase === 'trial' || phase === 'synthesis' || phase === 'epilogue' ? 'stage__background--trial' :
    'stage__background--birth';

  const showEffects = !!environment && ['environment', 'evolving', 'trial'].includes(phase);
  const showEvolvingVisual = phase === 'evolving' && !evolution;

  return (
    <div className="stage">
      <div className={`stage__background ${bgClass}`} />

      {/* Environment effects overlay */}
      {showEffects && (
        <EnvironmentEffects
          envTags={environment.envTags}
          active={showEffects}
        />
      )}

      {/* Evolving ink morph visual */}
      {showEvolvingVisual && (
        <>
          <div className="evolving-effect" />
          <div className="evolving-flash" />
        </>
      )}

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
                  theme="light"
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

      {/* Environment info banner (replaces modal) */}
      {phase === 'environment' && environment && (
        <div className="env-banner">
          <div className="env-banner__title">{environment.eventName}</div>
          <div className="env-banner__narrative">{environment.narrative}</div>
          {onProceed && (
            <button className="env-banner__proceed" onClick={onProceed}>
              진화를 지켜본다
            </button>
          )}
          {durationSeconds && (
            <div className="env-timer">
              <div
                className="env-timer__bar"
                style={{ animationDuration: `${durationSeconds}s` }}
              />
            </div>
          )}
        </div>
      )}

      {actionButtons && actionButtons.length > 0 && <ActionButtons buttons={actionButtons} />}
    </div>
  );
}
