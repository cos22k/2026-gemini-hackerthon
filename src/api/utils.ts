import type { Creature, Environment, EnvVariables, VisualTone, Sensory, EvolutionResult, TrialResult } from '../types';
import type { PhysicsCommand } from '../world/types';
import type { SynthesisResult } from '../game/types';
import { convertToPlayerAxes } from '../game/environment';
import { normalizeCreatureSpec } from './gemini';

export function parseGeminiJSON<T>(text: string): T | null {
  try {
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    return null;
  } catch {
    return null;
  }
}

export async function callWithRetry<T>(
  fn: () => Promise<T | null>,
  maxRetries = 2,
): Promise<T | null> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (e) {
      console.error(`API call attempt ${i + 1} failed:`, e);
    }
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCreatureResponse(raw: any): Creature {
  return {
    name: raw.name ?? '',
    species: raw.species ?? '',
    description: raw.description ?? '',
    traits: raw.traits ?? [],
    vulnerabilities: raw.vulnerabilities ?? [],
    energyStrategy: raw.energy_strategy ?? '',
    stats: {
      hp: raw.stats?.hp ?? 100,
      adaptability: raw.stats?.adaptability ?? 60,
      resilience: raw.stats?.resilience ?? 50,
      structure: raw.stats?.structure ?? 60,
    },
    imageUrl: null,
    birthWords: raw.birth_words ?? '',
    generation: 1,
    creatureSpec: normalizeCreatureSpec(raw.creature_spec),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapEnvironmentResponse(raw: any): Environment {
  const envVariables: EnvVariables = raw.env_variables;
  const visualTone: VisualTone = {
    primaryColor: raw.visual_tone?.primary_color ?? '',
    mood: raw.visual_tone?.mood ?? '',
    keyVisual: raw.visual_tone?.key_visual ?? '',
  };
  const sensory: Sensory = {
    visual: raw.sensory?.visual ?? '',
    auditory: raw.sensory?.auditory ?? '',
    tactile: raw.sensory?.tactile ?? '',
  };

  return {
    eventName: raw.event_name ?? '',
    cascadingCause: raw.cascading_cause ?? '',
    envVariables,
    envTags: raw.env_tags ?? [],
    threatCategory: raw.threat_category ?? '',
    instabilityIndex: raw.instability_index ?? 50,
    narrative: raw.narrative ?? '',
    sensory,
    threatDetail: raw.threat_detail ?? '',
    hiddenOpportunity: raw.hidden_opportunity ?? '',
    visualTone,
    playerAxes: convertToPlayerAxes(envVariables),
    worldEvents: normalizeWorldEvents(raw.world_events),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapEvolutionResponse(raw: any): EvolutionResult {
  return {
    newName: raw.new_name ?? '',
    evolutionSummary: raw.evolution_summary ?? '',
    newTraits: raw.new_traits ?? [],
    lostTraits: raw.lost_traits ?? [],
    tradeoffs: raw.tradeoffs ?? [],
    adaptationScore: raw.adaptation_score ?? 50,
    statChanges: {
      hp: raw.stat_changes?.hp ?? 0,
      adaptability: raw.stat_changes?.adaptability ?? 0,
      resilience: raw.stat_changes?.resilience ?? 0,
      structure: raw.stat_changes?.structure ?? 0,
    },
    poeticLine: raw.poetic_line ?? '',
    imageUrl: null,
    creatureSpecMutation: raw.creature_spec_mutation ?? {},
    worldEvents: normalizeWorldEvents(raw.world_events),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapTrialResponse(raw: any): TrialResult {
  return {
    trialName: raw.trial_name ?? '',
    trialDescription: raw.trial_description ?? '',
    survived: raw.survived ?? false,
    narrative: raw.narrative ?? '',
    reason: raw.reason ?? '',
    damageOrMutation: raw.damage_or_mutation ?? '',
    finalScore: raw.final_score ?? 0,
    epitaph: raw.epitaph ?? '',
    synthesisHint: raw.synthesis_hint,
    worldEvents: normalizeWorldEvents(raw.world_events),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapSynthesisResponse(raw: any): SynthesisResult {
  return {
    newName: raw.new_name ?? '',
    fusionNarrative: raw.fusion_narrative ?? '',
    newTraits: raw.new_traits ?? [],
    modifiedVulnerabilities: raw.modified_vulnerabilities ?? [],
    energyStrategy: raw.energy_strategy ?? '',
    statChanges: {
      hp: raw.stat_changes?.hp ?? 0,
      adaptability: raw.stat_changes?.adaptability ?? 0,
      resilience: raw.stat_changes?.resilience ?? 0,
      structure: raw.stat_changes?.structure ?? 0,
    },
    fusionLine: raw.fusion_line ?? '',
    creatureSpecMutation: raw.creature_spec_mutation ?? {},
    worldEvents: normalizeWorldEvents(raw.world_events),
  };
}

function normalizeWorldEvents(events: unknown[] | undefined): PhysicsCommand[] {
  if (!Array.isArray(events)) return [];
  const validTypes = ['addBody', 'removeBody', 'setGravity', 'setWind', 'applyForce', 'shake', 'clear'];
  return events.filter((e): e is PhysicsCommand =>
    typeof e === 'object' && e !== null && validTypes.includes((e as Record<string, unknown>).type as string),
  );
}
