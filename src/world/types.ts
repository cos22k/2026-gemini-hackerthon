// ── Creature spec types (for CreatureRenderer) ────────────

export interface BodySpec {
  shape: 'ellipse' | 'roundRect' | 'blob';
  width: number;
  height: number;
  color: string;
  stroke: string;
}

export interface EyeSpec {
  variant: 'googly' | 'dot' | 'cute';
  size: number;
  spacing: number;
  offsetY: number;
  count: number;
}

export interface MouthSpec {
  variant: 'smile' | 'open' | 'zigzag' | 'flat';
  width: number;
  offsetY: number;
}

export interface AdditionSpec {
  el: 'ellipse' | 'circle' | 'rect' | 'path' | 'line' | 'polygon' | 'polyline';
  // Common SVG attributes (Gemini fills these directly)
  d?: string;           // path data
  cx?: number;          // circle/ellipse center x
  cy?: number;          // circle/ellipse center y
  r?: number;           // circle radius
  rx?: number;          // ellipse radius x
  ry?: number;          // ellipse radius y
  x?: number;           // rect x
  y?: number;           // rect y
  width?: number;       // rect width
  height?: number;      // rect height
  x1?: number;          // line start x
  y1?: number;          // line start y
  x2?: number;          // line end x
  y2?: number;          // line end y
  points?: string;      // polygon/polyline points
  transform?: string;   // SVG transform
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  // Legacy passthrough
  props?: Record<string, unknown>;
}

export interface CreatureSpec {
  body: BodySpec;
  eyes: EyeSpec;
  mouth: MouthSpec;
  additions: AdditionSpec[];
  movement: 'waddle' | 'bounce' | 'drift' | 'hop';
}

// ── Physics body snapshot (from usePhysicsWorld) ──────────

export interface PhysicsBodySnapshot {
  id: number;
  label: string;
  x: number;
  y: number;
  angle: number;
  radius?: number;
  width?: number;
  height?: number;
  variant?: string;
  seed?: number;
}

export interface CreaturePosition {
  x: number;
  y: number;
  angle: number;
}

// ── Physics commands (dispatch API) ───────────────────────

export type PhysicsCommand =
  | { type: 'addBody'; bodyType?: 'stone' | 'ball' | 'crate'; x?: number; y?: number; radius?: number; size?: number }
  | { type: 'removeBody'; id: number }
  | { type: 'setGravity'; scale: number }
  | { type: 'setWind'; x?: number; y?: number }
  | { type: 'applyForce'; target?: 'creature'; id?: number; force?: { x: number; y: number } }
  | { type: 'shake'; intensity?: number }
  | { type: 'clear' };

// ── Weather type ──────────────────────────────────────────

export type Weather = 'none' | 'sun' | 'snow' | 'rain';
