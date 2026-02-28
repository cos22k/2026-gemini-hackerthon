import { z } from 'zod';
import { worldEventSchema, normalizeWorldEvents, toGeminiSchema } from './shared';
import type { TrialResult } from '../../types';

export const trialApiSchema = z.object({
  trial_name: z.string(),
  trial_description: z.string(),
  survived: z.boolean(),
  narrative: z.string(),
  reason: z.string(),
  damage_or_mutation: z.string(),
  final_score: z.number().int(),
  epitaph: z.string(),
  synthesis_hint: z.string().optional(),
  world_events: z.array(worldEventSchema).optional(),
});

export const trialJsonSchema = toGeminiSchema(trialApiSchema);

export function parseTrialResponse(raw: unknown): TrialResult {
  const p = trialApiSchema.parse(raw);
  return {
    trialName: p.trial_name,
    trialDescription: p.trial_description,
    survived: p.survived,
    narrative: p.narrative,
    reason: p.reason,
    damageOrMutation: p.damage_or_mutation,
    finalScore: p.final_score,
    epitaph: p.epitaph,
    synthesisHint: p.synthesis_hint,
    worldEvents: normalizeWorldEvents(p.world_events),
  };
}
