import type { BodySpec, EyeSpec, MouthSpec, AdditionSpec, LimbSpec } from './types';

// ── Gemini star path (4-pointed concave star) ────────────
function geminiStarPath(r: number): string {
  const c = r * 0.1;
  return `M 0 ${-r} Q ${c} ${-c} ${r} 0 Q ${c} ${c} 0 ${r} Q ${-c} ${c} ${-r} 0 Q ${-c} ${-c} 0 ${-r} Z`;
}

// ── Helper: distribute N eyes evenly ─────────────────────
function eyePositions(count: number, spacing: number): number[] {
  const gap = count > 2 ? (spacing * 2) / count : spacing;
  return Array.from({ length: count }, (_, i) => {
    const total = gap * (count - 1);
    return -total / 2 + i * gap;
  });
}

// ── Dead eyes (X X) ─────────────────────────────────────
function DeadEyes({ size = 18, spacing = 36, offsetY = -15, count = 2 }: Partial<EyeSpec>) {
  const positions = eyePositions(count, spacing);
  const s = size * 0.6;
  return (
    <g className="eyes eyes--dead">
      {positions.map((cx, i) => (
        <g key={i}>
          <line x1={cx - s} y1={offsetY - s} x2={cx + s} y2={offsetY + s} stroke="#222" strokeWidth={3} strokeLinecap="round" />
          <line x1={cx + s} y1={offsetY - s} x2={cx - s} y2={offsetY + s} stroke="#222" strokeWidth={3} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

// ── Eye variants ──────────────────────────────────────────
function GooglyEyes({ size = 18, spacing = 36, offsetY = -15, count = 2 }: Partial<EyeSpec>) {
  const positions = eyePositions(count, spacing);
  const star = geminiStarPath(size * 0.5);

  return (
    <g className="eyes">
      {positions.map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={offsetY} r={size} fill="white" stroke="#222" strokeWidth={2} />
          <g transform={`translate(${cx + 1}, ${offsetY + 1})`}>
            <g className="googly-pupil" style={{ animationDelay: `${-i * 0.4}s` }}>
              <path d={star} fill="#222" />
            </g>
          </g>
        </g>
      ))}
    </g>
  );
}

function DotEyes({ size = 10, spacing = 30, offsetY = -15, count = 2 }: Partial<EyeSpec>) {
  const positions = eyePositions(count, spacing);
  return (
    <g className="eyes">
      {positions.map((cx, i) => (
        <circle key={i} cx={cx} cy={offsetY} r={size * 0.5} fill="#222" />
      ))}
    </g>
  );
}

function CuteEyes({ size = 14, spacing = 34, offsetY = -15, count = 2 }: Partial<EyeSpec>) {
  const positions = eyePositions(count, spacing);
  return (
    <g className="eyes">
      {positions.map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={offsetY} r={size} fill="#222" />
          <circle cx={cx + 4} cy={offsetY - 4} r={size * 0.35} fill="white" />
          <circle cx={cx + 1} cy={offsetY - 1} r={size * 0.15} fill="white" />
        </g>
      ))}
    </g>
  );
}

function Eyes({ variant = 'googly', isDead = false, ...props }: Partial<EyeSpec> & { isDead?: boolean }) {
  if (isDead) return <DeadEyes {...props} />;
  const variants: Record<string, React.FC<Partial<EyeSpec>>> = {
    googly: GooglyEyes,
    dot: DotEyes,
    cute: CuteEyes,
  };
  const Comp = variants[variant] || GooglyEyes;
  return <Comp {...props} />;
}

// ── Mouth variants ────────────────────────────────────────
function Mouth({ variant = 'smile', width = 20, offsetY = 15 }: Partial<MouthSpec>) {
  const hw = width / 2;
  switch (variant) {
    case 'open':
      return <ellipse cx={0} cy={offsetY} rx={hw} ry={hw * 0.7} fill="#222" />;
    case 'zigzag':
      return (
        <polyline
          points={`${-hw},${offsetY} ${-hw / 2},${offsetY + 6} 0,${offsetY} ${hw / 2},${offsetY + 6} ${hw},${offsetY}`}
          fill="none"
          stroke="#222"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'flat':
      return (
        <line
          x1={-hw}
          y1={offsetY}
          x2={hw}
          y2={offsetY}
          stroke="#222"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      );
    case 'smile':
    default:
      return (
        <path
          d={`M${-hw},${offsetY} Q0,${offsetY + width * 0.7} ${hw},${offsetY}`}
          fill="none"
          stroke="#222"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      );
  }
}

// ── Body shapes ───────────────────────────────────────────
function BodyShape({
  shape = 'ellipse',
  width = 120,
  height = 100,
  color = '#fff',
  stroke = '#222',
}: Partial<BodySpec>) {
  const sw = 2.5;
  switch (shape) {
    case 'roundRect':
      return (
        <rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx={Math.min(width, height) * 0.3}
          fill={color}
          stroke={stroke}
          strokeWidth={sw}
        />
      );
    case 'blob': {
      const w = width / 2,
        h = height / 2;
      const d = `M0,${-h} C${w * 0.8},${-h * 1.1} ${w * 1.1},${-h * 0.3} ${w},${h * 0.1}
        S${w * 0.6},${h * 1.1} 0,${h}
        S${-w * 1.1},${h * 0.5} ${-w},${h * 0.1}
        S${-w * 0.8},${-h * 1.1} 0,${-h}Z`;
      return <path d={d} fill={color} stroke={stroke} strokeWidth={sw} />;
    }
    case 'ellipse':
    default:
      return (
        <ellipse cx={0} cy={0} rx={width / 2} ry={height / 2} fill={color} stroke={stroke} strokeWidth={sw} />
      );
  }
}

// ── Limbs renderer ───────────────────────────────────────
function Limbs({ limbs = [], bodyWidth = 120, bodyHeight = 100 }: { limbs?: LimbSpec[]; bodyWidth?: number; bodyHeight?: number }) {
  if (!limbs.length) return null;
  const hw = bodyWidth / 2;
  const hh = bodyHeight / 2;

  return (
    <g className="creature-limbs">
      {limbs.map((limb, i) => {
        // Convert normalized anchor (-1..1) to pixel position on body edge
        const anchorPx = limb.anchorX * hw;
        const anchorPy = limb.anchorY * hh;
        const angleRad = (limb.restAngle ?? 0) * Math.PI / 180;
        const endX = anchorPx + Math.sin(angleRad) * limb.length;
        const endY = anchorPy + Math.cos(angleRad) * limb.length;
        // Wobbly limb path with slight curve
        const midX = (anchorPx + endX) / 2 + (limb.type === 'arm' ? (limb.anchorX > 0 ? 4 : -4) : (i % 2 === 0 ? 3 : -3));
        const midY = (anchorPy + endY) / 2;

        return (
          <g key={i} className={`creature-limb creature-limb--${limb.type}`}>
            {/* Limb shape - wobbly elongated path */}
            <path
              d={`M${anchorPx},${anchorPy} Q${midX},${midY} ${endX},${endY}`}
              stroke={limb.color || '#222'}
              strokeWidth={limb.width || 6}
              strokeLinecap="round"
              fill="none"
            />
            {/* Foot/hand circle at the end */}
            <circle
              cx={endX}
              cy={endY}
              r={limb.width * 0.7 || 4}
              fill={limb.color || '#222'}
              stroke="#222"
              strokeWidth={1.5}
            />
          </g>
        );
      })}
    </g>
  );
}

// ── Additions renderer (Gemini's custom SVG elements) ─────
function Additions({ additions = [] }: { additions?: AdditionSpec[] }) {
  return (
    <>
      {additions.map((item, i) => {
        // Gather all SVG attributes from the flat spec
        const { el, props = {}, fill, stroke, strokeWidth, opacity, transform,
          d, cx, cy, r, rx, ry, x, y, width, height, x1, y1, x2, y2, points } = item;
        const svgAttrs: Record<string, unknown> = {
          fill, stroke, strokeWidth, opacity, transform,
          d, cx, cy, r, rx, ry, x, y, width, height, x1, y1, x2, y2, points,
          ...props, // legacy passthrough overrides
        };
        // Remove undefined values
        const common = Object.fromEntries(Object.entries(svgAttrs).filter(([, v]) => v !== undefined));
        switch (el) {
          case 'ellipse':
            return <ellipse key={i} {...common} />;
          case 'circle':
            return <circle key={i} {...common} />;
          case 'rect':
            return <rect key={i} {...common} />;
          case 'path':
            return <path key={i} {...common} fill={fill ?? 'none'} />;
          case 'line':
            return <line key={i} {...common} fill="none" stroke={stroke || '#222'} strokeWidth={strokeWidth || 2} />;
          case 'polygon':
            return <polygon key={i} {...common} />;
          case 'polyline':
            return <polyline key={i} {...common} fill={fill ?? 'none'} stroke={stroke || '#222'} />;
          default:
            return null;
        }
      })}
    </>
  );
}

// ── Main Renderer ─────────────────────────────────────────
interface CreatureRendererProps {
  spec: {
    body?: Partial<BodySpec>;
    eyes?: Partial<EyeSpec>;
    mouth?: Partial<MouthSpec>;
    additions?: AdditionSpec[];
    limbs?: LimbSpec[];
  } | null;
  size?: number;
  className?: string;
  isDead?: boolean;
}

export function CreatureRenderer({ spec, size = 200, className = '', isDead = false }: CreatureRendererProps) {
  if (!spec) return null;
  const { body = {}, eyes = {}, mouth = {}, additions = [], limbs = [] } = spec;

  return (
    <svg
      viewBox="-100 -100 200 200"
      width={size}
      height={size}
      className={`${className}${isDead ? ' creature--dead' : ''}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Hand-drawn wobble filter — applied to ALL creature elements */}
        <filter id="creature-wobble" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="3" seed="7" result="wobble" />
          <feDisplacementMap in="SourceGraphic" in2="wobble" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter="url(#creature-wobble)">
        {/* Limbs behind body */}
        <Limbs limbs={limbs} bodyWidth={body.width} bodyHeight={body.height} />
        <BodyShape {...body} />
        <Additions additions={additions} />
        <Eyes {...eyes} isDead={isDead} />
        {isDead ? (
          /* Dead mouth — flat line */
          <Mouth variant="flat" width={mouth.width ?? 20} offsetY={mouth.offsetY ?? 15} />
        ) : (
          <Mouth {...mouth} />
        )}
      </g>
    </svg>
  );
}
