import { useMemo, useCallback, forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import { CreatureRenderer } from './CreatureRenderer';
import {
  usePhysicsWorld,
  CANVAS,
  PLANET_R,
  PLANET_CENTER,
  wobblyCirclePath,
  wobblyRectPath,
} from './usePhysicsWorld';
import type { CreatureSpec, PhysicsBodySnapshot, PhysicsCommand, Weather } from './types';
import { serializeWorldState, type WorldSnapshot } from './serialization';

// ── Theme color palettes ──────────────────────────────────

export type WorldTheme = 'dark' | 'light';

interface ThemePalette {
  planetOutline: string;
  hatch1: string;
  hatch2: string;
  craterStroke: string;
  craterInner: string;
  squiggle: string;
  bodyFill: { stone: string; ball: string; crate: string };
  bodyStroke: string;
  bodyDetail: string;
}

const PALETTES: Record<WorldTheme, ThemePalette> = {
  dark: {
    planetOutline: 'rgba(255,255,255,0.15)',
    hatch1: 'rgba(255,255,255,0.08)',
    hatch2: 'rgba(255,255,255,0.06)',
    craterStroke: 'rgba(255,255,255,0.15)',
    craterInner: 'rgba(255,255,255,0.1)',
    squiggle: 'rgba(255,255,255,0.1)',
    bodyFill: { stone: '#c8c8c8', ball: '#e0ddd8', crate: '#8a8578' },
    bodyStroke: 'rgba(255,255,255,0.3)',
    bodyDetail: 'rgba(255,255,255,0.15)',
  },
  light: {
    planetOutline: '#222',
    hatch1: '#222',
    hatch2: '#222',
    craterStroke: '#222',
    craterInner: '#222',
    squiggle: '#222',
    bodyFill: { stone: '#e8e8e8', ball: '#faf9f6', crate: '#d4cfc5' },
    bodyStroke: '#222',
    bodyDetail: '#222',
  },
};

// ── Doodly SVG shapes for physics bodies ──────────────────

function DoodlyStone({ radius, seed, palette }: { radius?: number; seed?: number; palette: ThemePalette }) {
  const r = radius || 14;
  const d = wobblyCirclePath(r, seed, 8);
  return (
    <svg
      width={r * 2 + 6}
      height={r * 2 + 6}
      viewBox={`${-r - 3} ${-r - 3} ${r * 2 + 6} ${r * 2 + 6}`}
    >
      <path d={d} fill={palette.bodyFill.stone} stroke={palette.bodyStroke} strokeWidth="2" strokeLinejoin="round" />
      <path
        d={wobblyCirclePath(r * 0.45, (seed ?? 1) + 7, 5)}
        fill="none"
        stroke={palette.bodyDetail}
        strokeWidth="0.8"
        opacity="0.3"
      />
    </svg>
  );
}

function DoodlyBall({ radius, seed, palette }: { radius?: number; seed?: number; palette: ThemePalette }) {
  const r = radius || 12;
  const d = wobblyCirclePath(r, seed, 12);
  return (
    <svg
      width={r * 2 + 6}
      height={r * 2 + 6}
      viewBox={`${-r - 3} ${-r - 3} ${r * 2 + 6} ${r * 2 + 6}`}
    >
      <path d={d} fill={palette.bodyFill.ball} stroke={palette.bodyStroke} strokeWidth="2" strokeLinejoin="round" />
      <path
        d={wobblyCirclePath(r * 0.3, (seed ?? 1) + 3, 6)}
        fill="none"
        stroke={palette.bodyDetail}
        strokeWidth="0.8"
        opacity="0.25"
        transform="translate(-2,-2)"
      />
    </svg>
  );
}

function DoodlyCrate({ width, height, seed, palette }: { width?: number; height?: number; seed?: number; palette: ThemePalette }) {
  const w = width || 22,
    h = height || 22;
  const d = wobblyRectPath(w, h, seed);
  return (
    <svg
      width={w + 8}
      height={h + 8}
      viewBox={`${-w / 2 - 4} ${-h / 2 - 4} ${w + 8} ${h + 8}`}
    >
      <path d={d} fill={palette.bodyFill.crate} stroke={palette.bodyStroke} strokeWidth="2" strokeLinejoin="round" />
      <line
        x1={-w * 0.38}
        y1={-h * 0.38}
        x2={w * 0.38}
        y2={h * 0.38}
        stroke={palette.bodyDetail}
        strokeWidth="1"
        opacity="0.3"
      />
      <line
        x1={w * 0.38}
        y1={-h * 0.38}
        x2={-w * 0.38}
        y2={h * 0.38}
        stroke={palette.bodyDetail}
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  );
}

type BodyRendererProps = { radius?: number; width?: number; height?: number; seed?: number; palette: ThemePalette };
const BODY_RENDERERS: Record<string, React.FC<BodyRendererProps>> = {
  stone: DoodlyStone,
  ball: DoodlyBall,
  crate: DoodlyCrate,
};

function PhysicsBody({ body, palette }: { body: PhysicsBodySnapshot; palette: ThemePalette }) {
  const Renderer = BODY_RENDERERS[body.variant ?? 'stone'] || DoodlyStone;
  return (
    <div
      className="physics-body"
      style={{
        left: body.x,
        top: body.y,
        transform: `translate(-50%, -50%) rotate(${body.angle}rad)`,
      }}
    >
      <Renderer radius={body.radius} width={body.width} height={body.height} seed={body.seed} palette={palette} />
    </div>
  );
}

// ── Little Prince planet ─────────────────────────────────

const CRATERS = [
  { angle: -0.35, dist: 0.9, r: 32, seed: 101 },
  { angle: -0.12, dist: 0.93, r: 20, seed: 202 },
  { angle: 0.22, dist: 0.88, r: 38, seed: 303 },
  { angle: 0.5, dist: 0.91, r: 24, seed: 404 },
  { angle: -0.55, dist: 0.89, r: 28, seed: 505 },
  { angle: 0.7, dist: 0.87, r: 26, seed: 606 },
  { angle: -0.75, dist: 0.92, r: 18, seed: 707 },
  { angle: 0.05, dist: 0.86, r: 34, seed: 808 },
];

function Planet({ palette }: { palette: ThemePalette }) {
  const R = PLANET_R;
  const svgSize = R * 2 + 20;
  const planetPath = wobblyCirclePath(R, 42, 512, 0.005);

  return (
    <div
      className="planet-wrap"
      style={{
        left: PLANET_CENTER.x,
        top: PLANET_CENTER.y,
      }}
    >
      <svg width={svgSize} height={svgSize} viewBox={`${-R - 10} ${-R - 10} ${svgSize} ${svgSize}`}>
        <defs>
          <clipPath id="planet-clip">
            <path d={planetPath} />
          </clipPath>
        </defs>

        {/* Crosshatch fill clipped to planet */}
        <g clipPath="url(#planet-clip)">
          {Array.from({ length: 40 }, (_, i) => {
            const offset = -R + i * ((R * 2) / 40);
            return (
              <line
                key={`h1-${i}`}
                x1={offset - R}
                y1={-R}
                x2={offset + R}
                y2={R}
                stroke={palette.hatch1}
                strokeWidth="0.8"
                opacity="0.5"
              />
            );
          })}
          {Array.from({ length: 40 }, (_, i) => {
            const offset = -R + i * ((R * 2) / 40);
            return (
              <line
                key={`h2-${i}`}
                x1={offset + R}
                y1={-R}
                x2={offset - R}
                y2={R}
                stroke={palette.hatch2}
                strokeWidth="0.6"
                opacity="0.4"
              />
            );
          })}

          {/* Craters */}
          {CRATERS.map((c, i) => {
            const cx = Math.sin(c.angle) * R * c.dist;
            const cy = -Math.cos(c.angle) * R * c.dist;
            return (
              <g key={i} transform={`translate(${cx.toFixed(1)},${cy.toFixed(1)})`}>
                <path
                  d={wobblyCirclePath(c.r, c.seed, 8)}
                  fill="none"
                  stroke={palette.craterStroke}
                  strokeWidth="1.2"
                  opacity="0.6"
                />
                <path
                  d={wobblyCirclePath(c.r * 0.6, c.seed + 50, 6)}
                  fill="none"
                  stroke={palette.craterInner}
                  strokeWidth="0.7"
                  opacity="0.4"
                  transform="translate(2,2)"
                />
              </g>
            );
          })}

          {/* Surface squiggly lines */}
          <path
            d="M-120,-580 Q-80,-574 -40,-582 Q0,-588 40,-578"
            fill="none"
            stroke={palette.squiggle}
            strokeWidth="1"
            opacity="0.5"
          />
          <path
            d="M100,-570 Q140,-564 180,-572 Q220,-578 260,-568"
            fill="none"
            stroke={palette.squiggle}
            strokeWidth="0.8"
            opacity="0.4"
          />
          <path
            d="M-280,-540 Q-240,-534 -200,-542"
            fill="none"
            stroke={palette.squiggle}
            strokeWidth="0.8"
            opacity="0.35"
          />
        </g>

        {/* Planet outline */}
        <path
          d={planetPath}
          fill="none"
          stroke={palette.planetOutline}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ── Weather overlays (ink-style, dark-adapted) ────────────

function SunRays() {
  return (
    <div className="weather-sun">
      <div className="sun-orb" />
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="sun-ray" style={{ transform: `rotate(${i * 45}deg)` }} />
      ))}
    </div>
  );
}

function Snowflakes() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${((i * 2.6 + 1) % 100)}%`,
        delay: `${-((i * 0.5) % 7)}s`,
        duration: `${4 + (i % 5)}s`,
        size: 3 + (i % 4),
      })),
    [],
  );
  return (
    <div className="weather-snow">
      {flakes.map((f) => (
        <div
          key={f.id}
          className="snowflake"
          style={{
            left: f.left,
            animationDelay: f.delay,
            animationDuration: f.duration,
            width: f.size,
            height: f.size,
          }}
        />
      ))}
    </div>
  );
}

function Raindrops() {
  const drops = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${((i * 3.5 + 2) % 100)}%`,
        delay: `${-((i * 0.25) % 2)}s`,
        duration: `${0.6 + (i % 3) * 0.15}s`,
      })),
    [],
  );
  return (
    <div className="weather-rain">
      {drops.map((d) => (
        <div
          key={d.id}
          className="raindrop"
          style={{
            left: d.left,
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
    </div>
  );
}

const WeatherEffects: Record<string, React.FC> = {
  sun: SunRays,
  snow: Snowflakes,
  rain: Raindrops,
};

// ── Default creature spec ─────────────────────────────────

const DEFAULT_SPEC: CreatureSpec = {
  body: { shape: 'blob', width: 120, height: 100, color: '#ffffff', stroke: '#222' },
  eyes: { variant: 'dot', size: 18, spacing: 36, offsetY: -15, count: 2 },
  mouth: { variant: 'smile', width: 20, offsetY: 15 },
  additions: [],
  limbs: [
    { type: 'leg', anchorX: -0.4, anchorY: 0.9, length: 30, width: 6, color: '#222', restAngle: -15 },
    { type: 'leg', anchorX: 0.4, anchorY: 0.9, length: 30, width: 6, color: '#222', restAngle: 15 },
  ],
  movement: 'waddle',
};

// ── WorldScene (scene only, no controls) ──────────────────

export interface WorldSceneProps {
  weather?: Weather;
  creatureSpec?: CreatureSpec;
  creatureSize?: number;
  theme?: WorldTheme;
  /** Atmosphere tint color from environment visual_tone (e.g. "#ff4400") */
  atmosphereColor?: string;
  /** Atmosphere opacity 0-1 */
  atmosphereOpacity?: number;
  /** Whether the creature is dead (flipped, X eyes, no upright torque) */
  isDead?: boolean;
}

export interface WorldSceneHandle {
  dispatch: (cmd: PhysicsCommand) => number | null;
  getWorldState: () => WorldSnapshot;
}

export const WorldScene = forwardRef<WorldSceneHandle, WorldSceneProps>(function WorldScene(
  { weather = 'none', creatureSpec, creatureSize = 220, theme = 'dark', atmosphereColor, atmosphereOpacity = 0.15, isDead = false },
  ref,
) {
  const spec = creatureSpec ?? DEFAULT_SPEC;
  const palette = PALETTES[theme];
  const { bodies, creaturePos, dispatch, getWorldParams } = usePhysicsWorld(isDead);

  const getWorldState = useCallback((): WorldSnapshot => {
    const params = getWorldParams();
    return serializeWorldState(bodies, creaturePos, weather, params.gravityScale, params.wind);
  }, [bodies, creaturePos, weather, getWorldParams]);

  useImperativeHandle(ref, () => ({ dispatch, getWorldState }), [dispatch, getWorldState]);

  const WeatherComp = WeatherEffects[weather] ?? null;

  // ── Camera follow: always center creature ──
  const cameraRef = useRef({ x: 0, y: 0 });
  const initializedRef = useRef(false);
  const [camera, setCamera] = useState({ x: 0, y: 0 });

  // Camera framing: creature at horizontal center, vertical 65% from top
  // (shows more sky above, planet surface below — natural ground-based framing)
  const FRAME_X = CANVAS.width / 2;
  const FRAME_Y = CANVAS.height * 0.65;

  // Snap camera to creature on first render / recalibration
  useEffect(() => {
    const targetX = FRAME_X - creaturePos.x;
    const targetY = FRAME_Y - creaturePos.y;

    if (!initializedRef.current) {
      cameraRef.current = { x: targetX, y: targetY };
      setCamera({ x: targetX, y: targetY });
      initializedRef.current = true;
      return;
    }

    const lerp = 0.08;
    const cam = cameraRef.current;
    const newX = cam.x + (targetX - cam.x) * lerp;
    const newY = cam.y + (targetY - cam.y) * lerp;
    cameraRef.current = { x: newX, y: newY };
    setCamera({ x: newX, y: newY });
  }, [creaturePos.x, creaturePos.y]);

  // Recalibrate: snap camera when creature spec changes (evolution/synthesis)
  useEffect(() => {
    const timer = setTimeout(() => {
      const targetX = FRAME_X - creaturePos.x;
      const targetY = FRAME_Y - creaturePos.y;
      cameraRef.current = { x: targetX, y: targetY };
      setCamera({ x: targetX, y: targetY });
    }, 300);
    return () => clearTimeout(timer);
  }, [creatureSpec]);

  return (
    <div className="world-canvas" style={{ width: CANVAS.width, height: CANVAS.height }}>
      {/* SVG filter defs — wobble for hand-drawn feel */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="sketchy" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="turbulence" baseFrequency="0.035" numOctaves="4" seed="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Weather layer (stays fixed to viewport, not camera) */}
      {WeatherComp && <WeatherComp />}

      {/* Atmosphere tint from environment visual_tone */}
      {atmosphereColor && (
        <div
          className="world-atmosphere"
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 80%, ${atmosphereColor}, transparent 70%)`,
            opacity: atmosphereOpacity,
            pointerEvents: 'none',
            zIndex: 8,
            transition: 'opacity 2s ease, background 2s ease',
          }}
        />
      )}

      {/* Camera-tracked world content */}
      <div
        className="world-camera"
        style={{
          transform: `translate(${camera.x}px, ${camera.y}px)`,
          transition: 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
          position: 'absolute',
          inset: 0,
        }}
      >
        {/* Planet */}
        <Planet palette={palette} />

        {/* Physics bodies */}
        {bodies.map((b) => (
          <PhysicsBody key={b.id} body={b} palette={palette} />
        ))}

        {/* Creature — positioned by physics engine */}
        <div
          className="world-creature"
          style={{
            left: creaturePos.x,
            top: creaturePos.y,
            transform: `translate(-50%, -50%) rotate(${creaturePos.angle}rad)`,
          }}
        >
          <div className={`movement-${spec.movement}${isDead ? ' movement--dead' : ''}`}>
            <CreatureRenderer spec={spec} size={creatureSize} isDead={isDead} />
          </div>
        </div>
      </div>
    </div>
  );
});
