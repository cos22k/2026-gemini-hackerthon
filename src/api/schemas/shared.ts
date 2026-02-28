import { z } from 'zod';
import type { ZodType } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { CreatureSpec } from '../../world/types';
import type { PhysicsCommand } from '../../world/types';

// ── Gemini-compatible JSON schema helper ─────────────────
// Strips $schema and additionalProperties which Gemini doesn't support

function stripUnsupported(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(stripUnsupported);
  if (typeof obj !== 'object' || obj === null) return obj;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '$schema' || key === 'additionalProperties') continue;
    result[key] = stripUnsupported(value);
  }
  return result;
}

export function toGeminiSchema(schema: ZodType): Record<string, unknown> {
  return stripUnsupported(zodToJsonSchema(schema)) as Record<string, unknown>;
}

// ── Reusable sub-schemas ─────────────────────────────────

export const statsSchema = z.object({
  hp: z.number().int(),
  adaptability: z.number().int(),
  resilience: z.number().int(),
  structure: z.number().int(),
});

export const worldEventSchema = z.object({
  type: z.string(),
  bodyType: z.string().optional(),
  intensity: z.number().optional(),
  scale: z.number().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
});

export const creatureSpecSchema = z.object({
  body: z.object({
    shape: z.enum(['ellipse', 'roundRect', 'blob']),
    width: z.number().int(),
    height: z.number().int(),
    color: z.string(),
    stroke: z.string(),
  }),
  eyes: z.object({
    variant: z.enum(['googly', 'dot', 'cute']),
    size: z.number().int(),
    spacing: z.number().int(),
    offsetY: z.number().int(),
    count: z.number().int(),
  }),
  mouth: z.object({
    variant: z.enum(['smile', 'open', 'zigzag', 'flat']),
    width: z.number().int(),
    offsetY: z.number().int(),
  }),
  movement: z.enum(['waddle', 'bounce', 'drift', 'hop']),
});

export const envVariablesSchema = z.object({
  temperature: z.enum(['extreme_low', 'low', 'normal', 'high', 'extreme_high']),
  pressure: z.enum(['near_zero', 'low', 'normal', 'high', 'crushing']),
  atmosphere: z.enum(['toxic', 'reducing', 'thin', 'normal', 'dense_inert']),
  radiation: z.enum(['none', 'low', 'normal', 'high', 'lethal']),
  gravity: z.enum(['micro', 'low', 'normal', 'high', 'extreme']),
  solvent: z.enum(['desiccated', 'scarce', 'normal', 'saturated', 'submerged']),
  luminosity: z.enum(['pitch_dark', 'dim', 'normal', 'bright', 'scorching']),
  tectonics: z.enum(['dead', 'stable', 'active', 'volatile', 'cataclysmic']),
});

export const sensorySchema = z.object({
  visual: z.string(),
  auditory: z.string(),
  tactile: z.string(),
});

export const visualToneSchema = z.object({
  primary_color: z.string(),
  mood: z.string(),
  key_visual: z.string(),
});

export const specMutationSchema = z.object({
  body: z.object({ color: z.string() }).optional(),
  eyes: z.object({ variant: z.string() }).optional(),
  mouth: z.object({ variant: z.string() }).optional(),
  movement: z.string().optional(),
});

// ── Default creature spec ────────────────────────────────

export const DEFAULT_CREATURE_SPEC: CreatureSpec = {
  body: { shape: 'blob', width: 120, height: 100, color: '#ffffff', stroke: '#222' },
  eyes: { variant: 'dot', size: 18, spacing: 36, offsetY: -15, count: 2 },
  mouth: { variant: 'smile', width: 20, offsetY: 15 },
  additions: [],
  movement: 'waddle',
};

// ── Normalization helpers ────────────────────────────────

export function normalizeCreatureSpec(raw: Record<string, unknown> | undefined): CreatureSpec {
  if (!raw) return DEFAULT_CREATURE_SPEC;
  const body = (raw.body as Record<string, unknown>) ?? {};
  const eyes = (raw.eyes as Record<string, unknown>) ?? {};
  const mouth = (raw.mouth as Record<string, unknown>) ?? {};

  return {
    body: {
      shape: (['ellipse', 'roundRect', 'blob'].includes(body.shape as string) ? body.shape : 'blob') as CreatureSpec['body']['shape'],
      width: Math.max(60, Math.min(180, Number(body.width) || 120)),
      height: Math.max(40, Math.min(160, Number(body.height) || 100)),
      color: typeof body.color === 'string' ? body.color : '#ffffff',
      stroke: typeof body.stroke === 'string' ? body.stroke : '#222',
    },
    eyes: {
      variant: (['googly', 'dot', 'cute'].includes(eyes.variant as string) ? eyes.variant : 'dot') as CreatureSpec['eyes']['variant'],
      size: Math.max(8, Math.min(30, Number(eyes.size) || 18)),
      spacing: Math.max(16, Math.min(60, Number(eyes.spacing) || 36)),
      offsetY: Number(eyes.offsetY) || -15,
      count: Math.max(1, Math.min(4, Number(eyes.count) || 2)),
    },
    mouth: {
      variant: (['smile', 'open', 'zigzag', 'flat'].includes(mouth.variant as string) ? mouth.variant : 'smile') as CreatureSpec['mouth']['variant'],
      width: Math.max(10, Math.min(40, Number(mouth.width) || 20)),
      offsetY: Number(mouth.offsetY) || 15,
    },
    additions: Array.isArray(raw.additions) ? raw.additions : [],
    movement: (['waddle', 'bounce', 'drift', 'hop'].includes(raw.movement as string) ? raw.movement : 'waddle') as CreatureSpec['movement'],
  };
}

export function normalizeWorldEvents(events: unknown[] | undefined): PhysicsCommand[] {
  if (!Array.isArray(events)) return [];
  const validTypes = ['addBody', 'removeBody', 'setGravity', 'setWind', 'applyForce', 'shake', 'clear'];
  return events.filter((e): e is PhysicsCommand =>
    typeof e === 'object' && e !== null && validTypes.includes((e as Record<string, unknown>).type as string),
  );
}
