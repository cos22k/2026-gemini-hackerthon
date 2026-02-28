import type { BodySpec, EyeSpec, MouthSpec, AdditionSpec } from './types';

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

function Eyes({ variant = 'googly', ...props }: Partial<EyeSpec>) {
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

// ── Additions renderer (Gemini's custom SVG elements) ─────
function Additions({ additions = [] }: { additions?: AdditionSpec[] }) {
  return (
    <>
      {additions.map((item, i) => {
        const { el, props = {}, fill, stroke, strokeWidth } = item;
        const common = { fill, stroke, strokeWidth, ...props };
        switch (el) {
          case 'ellipse':
            return <ellipse key={i} {...common} />;
          case 'circle':
            return <circle key={i} {...common} />;
          case 'rect':
            return <rect key={i} {...common} />;
          case 'path':
            return <path key={i} {...common} fill={fill || 'none'} />;
          case 'line':
            return <line key={i} {...common} fill="none" stroke={stroke || '#222'} strokeWidth={strokeWidth || 2} />;
          case 'polygon':
            return <polygon key={i} {...common} />;
          case 'polyline':
            return <polyline key={i} {...common} fill={fill || 'none'} stroke={stroke || '#222'} />;
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
  } | null;
  size?: number;
  className?: string;
}

export function CreatureRenderer({ spec, size = 200, className = '' }: CreatureRendererProps) {
  if (!spec) return null;
  const { body = {}, eyes = {}, mouth = {}, additions = [] } = spec;

  return (
    <svg
      viewBox="-100 -100 200 200"
      width={size}
      height={size}
      className={className}
      style={{ overflow: 'visible' }}
    >
      <BodyShape {...body} />
      <Additions additions={additions} />
      <Eyes {...eyes} />
      <Mouth {...mouth} />
    </svg>
  );
}
