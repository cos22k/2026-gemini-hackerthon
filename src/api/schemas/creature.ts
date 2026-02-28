import { z } from 'zod';
import { statsSchema, creatureSpecSchema, normalizeCreatureSpec, toGeminiSchema } from './shared';
import type { Creature } from '../../types';

export const creatureApiSchema = z.object({
  name: z.string(),
  species: z.string(),
  description: z.string(),
  traits: z.array(z.string()),
  vulnerabilities: z.array(z.string()),
  energy_strategy: z.string(),
  stats: statsSchema,
  birth_words: z.string(),
  image_prompt: z.string(),
  creature_spec: creatureSpecSchema.optional(),
});

export const creatureJsonSchema = toGeminiSchema(creatureApiSchema);

export function parseCreatureResponse(raw: unknown): Creature {
  const p = creatureApiSchema.parse(raw);
  return {
    name: p.name,
    species: p.species,
    description: p.description,
    traits: p.traits,
    vulnerabilities: p.vulnerabilities,
    energyStrategy: p.energy_strategy,
    stats: p.stats,
    imageUrl: null,
    birthWords: p.birth_words,
    generation: 1,
    creatureSpec: normalizeCreatureSpec(p.creature_spec as Record<string, unknown> | undefined),
  };
}
