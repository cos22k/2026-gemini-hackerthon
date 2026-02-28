import { useState, useEffect } from 'react'

// ── Eye variants ──────────────────────────────────────────
function GooglyEyes({ size = 18, spacing = 36, offsetY = -15 }) {
  const half = spacing / 2
  return (
    <g className="eyes">
      {[-half, half].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={offsetY} r={size} fill="white" stroke="#333" strokeWidth={1.5} />
          <circle cx={cx + 3} cy={offsetY + 2} r={size * 0.5} fill="#111" />
          <circle cx={cx + 5} cy={offsetY - 2} r={size * 0.18} fill="white" />
        </g>
      ))}
    </g>
  )
}

function DotEyes({ size = 10, spacing = 30, offsetY = -15 }) {
  const half = spacing / 2
  return (
    <g className="eyes">
      <circle cx={-half} cy={offsetY} r={size * 0.5} fill="#111" />
      <circle cx={half} cy={offsetY} r={size * 0.5} fill="#111" />
    </g>
  )
}

function CuteEyes({ size = 14, spacing = 34, offsetY = -15 }) {
  const half = spacing / 2
  return (
    <g className="eyes">
      {[-half, half].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={offsetY} r={size} fill="#111" />
          <circle cx={cx + 4} cy={offsetY - 4} r={size * 0.35} fill="white" />
          <circle cx={cx + 1} cy={offsetY - 1} r={size * 0.15} fill="white" />
        </g>
      ))}
    </g>
  )
}

function Eyes({ variant = 'googly', ...props }) {
  const variants = { googly: GooglyEyes, dot: DotEyes, cute: CuteEyes }
  const Comp = variants[variant] || GooglyEyes
  return <Comp {...props} />
}

// ── Mouth variants ────────────────────────────────────────
function Mouth({ variant = 'smile', width = 20, offsetY = 15 }) {
  const hw = width / 2
  switch (variant) {
    case 'open':
      return <ellipse cx={0} cy={offsetY} rx={hw} ry={hw * 0.7} fill="#333" />
    case 'zigzag':
      return (
        <polyline
          points={`${-hw},${offsetY} ${-hw / 2},${offsetY + 6} 0,${offsetY} ${hw / 2},${offsetY + 6} ${hw},${offsetY}`}
          fill="none" stroke="#333" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
        />
      )
    case 'flat':
      return (
        <line
          x1={-hw} y1={offsetY} x2={hw} y2={offsetY}
          stroke="#333" strokeWidth={2.5} strokeLinecap="round"
        />
      )
    case 'smile':
    default:
      return (
        <path
          d={`M${-hw},${offsetY} Q0,${offsetY + width * 0.7} ${hw},${offsetY}`}
          fill="none" stroke="#333" strokeWidth={2.5} strokeLinecap="round"
        />
      )
  }
}

// ── Body shapes ───────────────────────────────────────────
function Body({ shape = 'ellipse', width = 120, height = 100, color = '#FBCEB1', stroke = '#D4845A' }) {
  switch (shape) {
    case 'roundRect':
      return (
        <rect
          x={-width / 2} y={-height / 2} width={width} height={height}
          rx={Math.min(width, height) * 0.3}
          fill={color} stroke={stroke} strokeWidth={3}
        />
      )
    case 'blob': {
      const w = width / 2, h = height / 2
      // organic blob using cubic beziers
      const d = `M0,${-h} C${w * 0.8},${-h * 1.1} ${w * 1.1},${-h * 0.3} ${w},${h * 0.1}
        S${w * 0.6},${h * 1.1} 0,${h}
        S${-w * 1.1},${h * 0.5} ${-w},${h * 0.1}
        S${-w * 0.8},${-h * 1.1} 0,${-h}Z`
      return <path d={d} fill={color} stroke={stroke} strokeWidth={3} />
    }
    case 'ellipse':
    default:
      return (
        <ellipse
          cx={0} cy={0} rx={width / 2} ry={height / 2}
          fill={color} stroke={stroke} strokeWidth={3}
        />
      )
  }
}

// ── Additions renderer (Gemini's custom SVG elements) ─────
function Additions({ additions = [] }) {
  return additions.map((item, i) => {
    const { el, props = {}, fill, stroke, strokeWidth } = item
    const style = {}
    if (fill) style.fill = fill
    if (stroke) style.stroke = stroke
    if (strokeWidth) style.strokeWidth = strokeWidth

    switch (el) {
      case 'ellipse': return <ellipse key={i} {...props} {...style} fill={fill} stroke={stroke} />
      case 'circle': return <circle key={i} {...props} {...style} fill={fill} stroke={stroke} />
      case 'rect': return <rect key={i} {...props} {...style} fill={fill} stroke={stroke} />
      case 'path': return <path key={i} {...props} {...style} fill={fill || 'none'} stroke={stroke} />
      case 'line': return <line key={i} {...props} fill="none" stroke={stroke || '#333'} strokeWidth={strokeWidth || 2} />
      case 'polygon': return <polygon key={i} {...props} fill={fill} stroke={stroke} />
      case 'polyline': return <polyline key={i} {...props} fill={fill || 'none'} stroke={stroke || '#333'} />
      default: return null
    }
  })
}

// ── Main Renderer ─────────────────────────────────────────
export function CreatureRenderer({ spec, size = 200, className = '' }) {
  if (!spec) return null
  const { body = {}, eyes = {}, mouth = {}, additions = [] } = spec

  return (
    <svg
      viewBox="-100 -100 200 200"
      width={size}
      height={size}
      className={className}
      style={{ overflow: 'visible' }}
    >
      <Body {...body} />
      <Additions additions={additions} />
      <Eyes {...eyes} />
      <Mouth {...mouth} />
    </svg>
  )
}

// ── Hardcoded example specs for testing ───────────────────
const EXAMPLE_SPECS = [
  {
    name: 'Apristone',
    body: { shape: 'ellipse', width: 120, height: 100, color: '#FBCEB1', stroke: '#D4845A' },
    eyes: { variant: 'googly', size: 18, spacing: 36, offsetY: -15 },
    mouth: { variant: 'smile', width: 20, offsetY: 15 },
    additions: [
      { el: 'ellipse', props: { cx: -25, cy: 55, rx: 12, ry: 8 }, fill: '#FBCEB1' },
      { el: 'ellipse', props: { cx: 25, cy: 55, rx: 12, ry: 8 }, fill: '#FBCEB1' },
      { el: 'path', props: { d: 'M0,-55 Q10,-70 5,-80' }, fill: '#4CAF50', stroke: '#388E3C', strokeWidth: 2 },
    ],
    movement: 'waddle',
  },
  {
    name: 'Stormberry',
    body: { shape: 'blob', width: 100, height: 110, color: '#7B68EE', stroke: '#483D8B' },
    eyes: { variant: 'cute', size: 14, spacing: 30, offsetY: -18 },
    mouth: { variant: 'open', width: 14, offsetY: 12 },
    additions: [
      { el: 'path', props: { d: 'M-35,-50 L-30,-65 L-25,-50' }, fill: '#FFD700', stroke: '#FFA500', strokeWidth: 2 },
      { el: 'path', props: { d: 'M20,-48 L25,-63 L30,-48' }, fill: '#FFD700', stroke: '#FFA500', strokeWidth: 2 },
    ],
    movement: 'bounce',
  },
  {
    name: 'Mosscube',
    body: { shape: 'roundRect', width: 90, height: 90, color: '#8FBC8F', stroke: '#556B2F' },
    eyes: { variant: 'dot', size: 10, spacing: 28, offsetY: -12 },
    mouth: { variant: 'flat', width: 18, offsetY: 14 },
    additions: [
      { el: 'circle', props: { cx: -20, cy: -38, r: 8 }, fill: '#228B22' },
      { el: 'circle', props: { cx: 5, cy: -42, r: 6 }, fill: '#32CD32' },
      { el: 'circle', props: { cx: 20, cy: -36, r: 9 }, fill: '#228B22' },
    ],
    movement: 'drift',
  },
]

export function CreaturePreview() {
  const [activeSpec, setActiveSpec] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActiveSpec(i => (i + 1) % EXAMPLE_SPECS.length), 3000)
    return () => clearInterval(id)
  }, [])

  const spec = EXAMPLE_SPECS[activeSpec]

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ fontFamily: 'monospace', marginBottom: '0.5rem' }}>Creature Preview</h2>
      <p style={{ color: '#888', marginBottom: '1.5rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
        Cycles through {EXAMPLE_SPECS.length} hardcoded specs every 3s
      </p>

      <div style={{
        display: 'inline-block',
        background: '#1a1a2e',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}>
        <CreatureRenderer spec={spec} size={200} />
        <p style={{ color: '#fff', fontFamily: 'monospace', marginTop: '1rem', fontSize: '1.1rem' }}>
          {spec.name}
        </p>
        <p style={{ color: '#aaa', fontFamily: 'monospace', fontSize: '0.75rem' }}>
          movement: {spec.movement}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
        {EXAMPLE_SPECS.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setActiveSpec(i)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              border: i === activeSpec ? '2px solid #7B68EE' : '2px solid #333',
              background: i === activeSpec ? '#2a2a4e' : '#1a1a1a',
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  )
}
