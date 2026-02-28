import { useState, useRef } from 'react';
import { WorldScene } from '../world/WorldScene';
import type { WorldSceneHandle } from '../world/WorldScene';
import type { CreatureSpec, Weather } from '../world/types';

const BODY_COLORS = [
  { color: '#ffffff', stroke: '#222' },
  { color: '#e8e8e8', stroke: '#222' },
  { color: '#d0d0d0', stroke: '#222' },
  { color: '#b0b0b0', stroke: '#333' },
  { color: '#888888', stroke: '#333' },
  { color: '#555555', stroke: '#111' },
  { color: '#333333', stroke: '#000' },
  { color: '#111111', stroke: '#000' },
];

const DEFAULT_SPEC: CreatureSpec = {
  body: { shape: 'blob', width: 120, height: 100, color: '#ffffff', stroke: '#222' },
  eyes: { variant: 'dot', size: 18, spacing: 36, offsetY: -15, count: 2 },
  mouth: { variant: 'smile', width: 20, offsetY: 15 },
  additions: [],
  movement: 'waddle',
};

// ── Shared UI controls ────────────────────────────────────

interface SegmentsProps {
  label: string;
  options: ({ value: string | number; label: string } | string)[];
  value: string | number;
  onChange: (v: string | number) => void;
}

function Segments({ label, options, value, onChange }: SegmentsProps) {
  return (
    <div className="control-group">
      <span className="control-label">{label}</span>
      <div className="segments">
        {options.map((opt) => {
          const v = typeof opt === 'string' ? opt : opt.value;
          const l = typeof opt === 'string' ? opt : opt.label;
          return (
            <button
              key={String(v)}
              className={`segment ${value === v ? 'active' : ''}`}
              onClick={() => onChange(v)}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface SwatchesProps {
  label: string;
  colors: { color: string; stroke: string }[];
  value: string;
  onChange: (c: { color: string; stroke: string }) => void;
}

function Swatches({ label, colors, value, onChange }: SwatchesProps) {
  return (
    <div className="control-group">
      <span className="control-label">{label}</span>
      <div className="swatches">
        {colors.map((c, i) => (
          <button
            key={i}
            className={`swatch ${value === c.color ? 'active' : ''}`}
            style={{ background: c.color }}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Sandbox Page ──────────────────────────────────────────

export default function SandboxPage() {
  const [spec, setSpec] = useState<CreatureSpec>(DEFAULT_SPEC);
  const [weather, setWeather] = useState<Weather>('none');
  const [gravity, setGravity] = useState('normal');
  const sceneRef = useRef<WorldSceneHandle>(null);

  const updateBody = (key: string, val: unknown) =>
    setSpec((s) => ({ ...s, body: { ...s.body, [key]: val } }));
  const updateEyes = (key: string, val: unknown) =>
    setSpec((s) => ({ ...s, eyes: { ...s.eyes, [key]: val } }));
  const updateMouth = (key: string, val: unknown) =>
    setSpec((s) => ({ ...s, mouth: { ...s.mouth, [key]: val } }));

  const handleGravity = (v: string | number) => {
    setGravity(String(v));
    const presets: Record<string, number> = { normal: 0.003, moon: 0.001, zero: 0, reverse: -0.002 };
    sceneRef.current?.dispatch({ type: 'setGravity', scale: presets[String(v)] ?? 0.003 });
  };

  const drop = (bodyType: 'stone' | 'ball' | 'crate') =>
    sceneRef.current?.dispatch({ type: 'addBody', bodyType });

  return (
    <div className="sandbox-page">
      <div className="sandbox">
        <div className="sandbox-preview">
          <WorldScene ref={sceneRef} weather={weather} creatureSpec={spec} theme="light" />
        </div>

        <div className="sandbox-controls">
          <h2 className="controls-title">Creature Sandbox</h2>

          <Segments
            label="Body Shape"
            options={[
              { value: 'ellipse', label: 'Ellipse' },
              { value: 'roundRect', label: 'Square' },
              { value: 'blob', label: 'Blob' },
            ]}
            value={spec.body.shape}
            onChange={(v) => updateBody('shape', v)}
          />

          <Swatches
            label="Shade"
            colors={BODY_COLORS}
            value={spec.body.color}
            onChange={(c) => setSpec((s) => ({ ...s, body: { ...s.body, color: c.color, stroke: c.stroke } }))}
          />

          <Segments
            label="Eye Count"
            options={[
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
            ]}
            value={spec.eyes.count}
            onChange={(v) => updateEyes('count', v)}
          />

          <Segments
            label="Eye Style"
            options={[
              { value: 'googly', label: 'Googly' },
              { value: 'dot', label: 'Dot' },
              { value: 'cute', label: 'Cute' },
            ]}
            value={spec.eyes.variant}
            onChange={(v) => updateEyes('variant', v)}
          />

          <Segments
            label="Mouth"
            options={[
              { value: 'smile', label: 'Smile' },
              { value: 'open', label: 'Open' },
              { value: 'zigzag', label: 'Zigzag' },
              { value: 'flat', label: 'Flat' },
            ]}
            value={spec.mouth.variant}
            onChange={(v) => updateMouth('variant', v)}
          />

          <Segments
            label="Movement"
            options={[
              { value: 'waddle', label: 'Waddle' },
              { value: 'bounce', label: 'Bounce' },
              { value: 'drift', label: 'Drift' },
              { value: 'hop', label: 'Hop' },
            ]}
            value={spec.movement}
            onChange={(v) => setSpec((s) => ({ ...s, movement: v as CreatureSpec['movement'] }))}
          />

          <div className="controls-divider" />

          <div className="control-group">
            <span className="control-label">Drop Objects</span>
            <div className="sandbox-actions">
              <button className="sandbox-action-btn" onClick={() => drop('stone')}>Stone</button>
              <button className="sandbox-action-btn" onClick={() => drop('ball')}>Ball</button>
              <button className="sandbox-action-btn" onClick={() => drop('crate')}>Crate</button>
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">World Actions</span>
            <div className="sandbox-actions">
              <button className="sandbox-action-btn" onClick={() => sceneRef.current?.dispatch({ type: 'shake' })}>
                Shake
              </button>
              <button className="sandbox-action-btn" onClick={() => sceneRef.current?.dispatch({ type: 'clear' })}>
                Clear
              </button>
            </div>
          </div>

          <Segments
            label="Gravity"
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'moon', label: 'Moon' },
              { value: 'zero', label: 'Zero' },
              { value: 'reverse', label: 'Reverse' },
            ]}
            value={gravity}
            onChange={handleGravity}
          />

          <Segments
            label="Weather"
            options={[
              { value: 'none', label: 'None' },
              { value: 'sun', label: 'Sun' },
              { value: 'snow', label: 'Snow' },
              { value: 'rain', label: 'Rain' },
            ]}
            value={weather}
            onChange={(v) => setWeather(v as Weather)}
          />
        </div>
      </div>
    </div>
  );
}
