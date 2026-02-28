import { z } from 'zod';
import { statsSchema, specMutationSchema, worldEventSchema, normalizeWorldEvents, toGeminiSchema } from './shared';
import type { EvolutionResult } from '../../types';

export const evolutionApiSchema = z.object({
  new_name: z.string(),
  evolution_summary: z.string(),
  new_traits: z.array(z.string()),
  lost_traits: z.array(z.string()),
  tradeoffs: z.array(z.string()),
  adaptation_score: z.number().int(),
  stat_changes: statsSchema,
  poetic_line: z.string(),
  image_prompt: z.string(),
  creature_spec_mutation: specMutationSchema.optional(),
  world_events: z.array(worldEventSchema).optional(),
});

export const evolutionJsonSchema = toGeminiSchema(evolutionApiSchema);

export function parseEvolutionResponse(raw: unknown): EvolutionResult {
  const p = evolutionApiSchema.parse(raw);
  return {
    newName: p.new_name,
    evolutionSummary: p.evolution_summary,
    newTraits: p.new_traits,
    lostTraits: p.lost_traits,
    tradeoffs: p.tradeoffs,
    adaptationScore: p.adaptation_score,
    statChanges: p.stat_changes,
    poeticLine: p.poetic_line,
    imageUrl: null,
    creatureSpecMutation: p.creature_spec_mutation ?? {},
    worldEvents: normalizeWorldEvents(p.world_events),
  };
}
