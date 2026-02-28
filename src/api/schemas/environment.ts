import { z } from 'zod';
import { envVariablesSchema, sensorySchema, visualToneSchema, worldEventSchema, normalizeWorldEvents, toGeminiSchema } from './shared';
import type { Environment, EnvVariables } from '../../types';
import { convertToPlayerAxes } from '../../game/environment';

export const environmentApiSchema = z.object({
  event_name: z.string(),
  cascading_cause: z.string(),
  env_variables: envVariablesSchema,
  env_tags: z.array(z.string()),
  threat_category: z.enum([
    'atmospheric', 'geological', 'celestial', 'chemical',
    'hydrological', 'ecological', 'energetic', 'compound',
  ]),
  instability_index: z.number().int(),
  narrative: z.string(),
  sensory: sensorySchema,
  threat_detail: z.string(),
  hidden_opportunity: z.string(),
  visual_tone: visualToneSchema,
  world_events: z.array(worldEventSchema).optional(),
});

export const environmentJsonSchema = toGeminiSchema(environmentApiSchema);

export function parseEnvironmentResponse(raw: unknown): Environment {
  const p = environmentApiSchema.parse(raw);
  const envVariables: EnvVariables = p.env_variables;

  return {
    eventName: p.event_name,
    cascadingCause: p.cascading_cause,
    envVariables,
    envTags: p.env_tags,
    threatCategory: p.threat_category,
    instabilityIndex: p.instability_index,
    narrative: p.narrative,
    sensory: p.sensory,
    threatDetail: p.threat_detail,
    hiddenOpportunity: p.hidden_opportunity,
    visualTone: {
      primaryColor: p.visual_tone.primary_color,
      mood: p.visual_tone.mood,
      keyVisual: p.visual_tone.key_visual,
    },
    playerAxes: convertToPlayerAxes(envVariables),
    worldEvents: normalizeWorldEvents(p.world_events),
  };
}
