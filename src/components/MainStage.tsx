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
  isDead?: boolean;
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
  isDead = false,
  children,
}: MainStageProps) {
  const bgClass =
    phase === 'birth' ? 'stage__background--birth' :
    phase === 'environment' ? 'stage__background--environment' :
    phase === 'evolving' ? 'stage__background--evolution' :
    phase === 'trial' || phase === 'synthesis' || phase === 'epilogue' ? 'stage__background--trial' :
    'stage__background--birth';

  const showEffects = !!environment && ['environment', 'evolving', 'trial'].includes(phase);

  // Map environment to world weather + atmosphere
  const envWeather: import('../world/types').Weather =
    environment?.envVariables?.temperature === 'extreme_low' || environment?.envVariables?.temperature === 'low' ? 'snow' :
    environment?.envVariables?.solvent === 'saturated' || environment?.envVariables?.solvent === 'submerged' ? 'rain' :
    environment?.envVariables?.luminosity === 'scorching' || environment?.envVariables?.luminosity === 'bright' ? 'sun' :
    'none';
  const envAtmosphereColor = showEffects ? environment?.visualTone?.primaryColor : undefined;
  const showEvolvingVisual = phase === 'evolving' && !evolution;
  const showEvolutionTransition = phase === 'evolving' && !!evolution;

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

      {/* Evolving ink morph visual (during API wait) */}
      {showEvolvingVisual && (
        <>
          <div className="evolving-effect" />
          <div className="evolving-flash" />
        </>
      )}

      {/* Evolution transition effect (when result arrives) */}
      {showEvolutionTransition && (
        <div className="evolution-morph" />
      )}

      <div className="stage__content">
        {phase === 'trial' && trial ? (
          <TrialView trial={trial} />
        ) : phase === 'synthesis' || phase === 'epilogue' ? (
          children
        ) : (
          creature && (
            <>
              <div className={`stage__creature-area${showEvolutionTransition ? ' stage__creature-area--morphing' : ''}`}>
                <WorldScene
                  ref={worldRef}
                  weather={showEffects ? envWeather : 'none'}
                  theme="light"
                  creatureSpec={creature.creatureSpec}
                  atmosphereColor={envAtmosphereColor}
                  atmosphereOpacity={showEffects ? 0.2 : 0}
                  isDead={isDead}
                />
              </div>
              {phase === 'birth' && creature.birthWords && (
                <p className="stage__birth-words">"{creature.birthWords}"</p>
              )}
            </>
          )
        )}
      </div>

      {/* Evolution name toast overlay */}
      {showEvolutionTransition && evolution && (
        <div className="evolution-toast">
          <span className="evolution-toast__name">{evolution.newName}</span>
          <span className="evolution-toast__poetic">"{evolution.poeticLine}"</span>
        </div>
      )}

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
