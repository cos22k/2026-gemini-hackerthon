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
  props?: Record<string, unknown>;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
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
