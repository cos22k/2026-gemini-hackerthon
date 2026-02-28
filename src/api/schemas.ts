import { SchemaType, type Schema } from '@google/generative-ai';

export const environmentSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    event_name: { type: SchemaType.STRING },
    cascading_cause: { type: SchemaType.STRING },
    env_variables: {
      type: SchemaType.OBJECT,
      properties: {
        temperature: {
          type: SchemaType.STRING,
          enum: ['extreme_low', 'low', 'normal', 'high', 'extreme_high'],
        },
        pressure: {
          type: SchemaType.STRING,
          enum: ['near_zero', 'low', 'normal', 'high', 'crushing'],
        },
        atmosphere: {
          type: SchemaType.STRING,
          enum: ['toxic', 'reducing', 'thin', 'normal', 'dense_inert'],
        },
        radiation: {
          type: SchemaType.STRING,
          enum: ['none', 'low', 'normal', 'high', 'lethal'],
        },
        gravity: {
          type: SchemaType.STRING,
          enum: ['micro', 'low', 'normal', 'high', 'extreme'],
        },
        solvent: {
          type: SchemaType.STRING,
          enum: ['desiccated', 'scarce', 'normal', 'saturated', 'submerged'],
        },
        luminosity: {
          type: SchemaType.STRING,
          enum: ['pitch_dark', 'dim', 'normal', 'bright', 'scorching'],
        },
        tectonics: {
          type: SchemaType.STRING,
          enum: ['dead', 'stable', 'active', 'volatile', 'cataclysmic'],
        },
      },
      required: ['temperature', 'pressure', 'atmosphere', 'radiation', 'gravity', 'solvent', 'luminosity', 'tectonics'],
    },
    env_tags: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    threat_category: {
      type: SchemaType.STRING,
      enum: ['atmospheric', 'geological', 'celestial', 'chemical', 'hydrological', 'ecological', 'energetic', 'compound'],
    },
    instability_index: { type: SchemaType.INTEGER },
    narrative: { type: SchemaType.STRING },
    sensory: {
      type: SchemaType.OBJECT,
      properties: {
        visual: { type: SchemaType.STRING },
        auditory: { type: SchemaType.STRING },
        tactile: { type: SchemaType.STRING },
      },
      required: ['visual', 'auditory', 'tactile'],
    },
    threat_detail: { type: SchemaType.STRING },
    hidden_opportunity: { type: SchemaType.STRING },
    visual_tone: {
      type: SchemaType.OBJECT,
      properties: {
        primary_color: { type: SchemaType.STRING },
        mood: { type: SchemaType.STRING },
        key_visual: { type: SchemaType.STRING },
      },
      required: ['primary_color', 'mood', 'key_visual'],
    },
    world_events: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING },
          bodyType: { type: SchemaType.STRING },
          intensity: { type: SchemaType.NUMBER },
          scale: { type: SchemaType.NUMBER },
          x: { type: SchemaType.NUMBER },
          y: { type: SchemaType.NUMBER },
        },
        required: ['type'],
      },
    },
  },
  required: [
    'event_name',
    'cascading_cause',
    'env_variables',
    'env_tags',
    'threat_category',
    'instability_index',
    'narrative',
    'sensory',
    'threat_detail',
    'hidden_opportunity',
    'visual_tone',
  ],
};

export const creatureSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING },
    species: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING },
    traits: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    vulnerabilities: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    energy_strategy: { type: SchemaType.STRING },
    stats: {
      type: SchemaType.OBJECT,
      properties: {
        hp: { type: SchemaType.INTEGER },
        adaptability: { type: SchemaType.INTEGER },
        resilience: { type: SchemaType.INTEGER },
        structure: { type: SchemaType.INTEGER },
      },
      required: ['hp', 'adaptability', 'resilience', 'structure'],
    },
    birth_words: { type: SchemaType.STRING },
    image_prompt: { type: SchemaType.STRING },
    creature_spec: {
      type: SchemaType.OBJECT,
      properties: {
        body: {
          type: SchemaType.OBJECT,
          properties: {
            shape: { type: SchemaType.STRING, enum: ['ellipse', 'roundRect', 'blob'] },
            width: { type: SchemaType.INTEGER },
            height: { type: SchemaType.INTEGER },
            color: { type: SchemaType.STRING },
            stroke: { type: SchemaType.STRING },
          },
          required: ['shape', 'width', 'height', 'color', 'stroke'],
        },
        eyes: {
          type: SchemaType.OBJECT,
          properties: {
            variant: { type: SchemaType.STRING, enum: ['googly', 'dot', 'cute'] },
            size: { type: SchemaType.INTEGER },
            spacing: { type: SchemaType.INTEGER },
            offsetY: { type: SchemaType.INTEGER },
            count: { type: SchemaType.INTEGER },
          },
          required: ['variant', 'size', 'spacing', 'offsetY', 'count'],
        },
        mouth: {
          type: SchemaType.OBJECT,
          properties: {
            variant: { type: SchemaType.STRING, enum: ['smile', 'open', 'zigzag', 'flat'] },
            width: { type: SchemaType.INTEGER },
            offsetY: { type: SchemaType.INTEGER },
          },
          required: ['variant', 'width', 'offsetY'],
        },
        movement: { type: SchemaType.STRING, enum: ['waddle', 'bounce', 'drift', 'hop'] },
      },
      required: ['body', 'eyes', 'mouth', 'movement'],
    },
  },
  required: ['name', 'species', 'description', 'traits', 'vulnerabilities', 'energy_strategy', 'stats', 'birth_words', 'image_prompt'],
};

export const evolutionSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    new_name: { type: SchemaType.STRING },
    evolution_summary: { type: SchemaType.STRING },
    new_traits: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    lost_traits: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    tradeoffs: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    adaptation_score: { type: SchemaType.INTEGER },
    stat_changes: {
      type: SchemaType.OBJECT,
      properties: {
        hp: { type: SchemaType.INTEGER },
        adaptability: { type: SchemaType.INTEGER },
        resilience: { type: SchemaType.INTEGER },
        structure: { type: SchemaType.INTEGER },
      },
      required: ['hp', 'adaptability', 'resilience', 'structure'],
    },
    poetic_line: { type: SchemaType.STRING },
    image_prompt: { type: SchemaType.STRING },
    creature_spec_mutation: {
      type: SchemaType.OBJECT,
      properties: {
        body: {
          type: SchemaType.OBJECT,
          properties: { color: { type: SchemaType.STRING } },
        },
        eyes: {
          type: SchemaType.OBJECT,
          properties: { variant: { type: SchemaType.STRING } },
        },
        mouth: {
          type: SchemaType.OBJECT,
          properties: { variant: { type: SchemaType.STRING } },
        },
        movement: { type: SchemaType.STRING },
      },
    },
    world_events: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING },
          bodyType: { type: SchemaType.STRING },
          intensity: { type: SchemaType.NUMBER },
          scale: { type: SchemaType.NUMBER },
          x: { type: SchemaType.NUMBER },
          y: { type: SchemaType.NUMBER },
        },
        required: ['type'],
      },
    },
  },
  required: ['new_name', 'evolution_summary', 'new_traits', 'lost_traits', 'tradeoffs', 'adaptation_score', 'stat_changes', 'poetic_line', 'image_prompt'],
};

export const trialSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    trial_name: { type: SchemaType.STRING },
    trial_description: { type: SchemaType.STRING },
    survived: { type: SchemaType.BOOLEAN },
    narrative: { type: SchemaType.STRING },
    reason: { type: SchemaType.STRING },
    damage_or_mutation: { type: SchemaType.STRING },
    final_score: { type: SchemaType.INTEGER },
    epitaph: { type: SchemaType.STRING },
    synthesis_hint: { type: SchemaType.STRING },
    world_events: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING },
          bodyType: { type: SchemaType.STRING },
          intensity: { type: SchemaType.NUMBER },
          scale: { type: SchemaType.NUMBER },
          x: { type: SchemaType.NUMBER },
          y: { type: SchemaType.NUMBER },
        },
        required: ['type'],
      },
    },
  },
  required: ['trial_name', 'trial_description', 'survived', 'narrative', 'reason', 'damage_or_mutation', 'final_score', 'epitaph'],
};

export const synthesisSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    new_name: { type: SchemaType.STRING },
    fusion_narrative: { type: SchemaType.STRING },
    new_traits: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    modified_vulnerabilities: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    energy_strategy: { type: SchemaType.STRING },
    stat_changes: {
      type: SchemaType.OBJECT,
      properties: {
        hp: { type: SchemaType.INTEGER },
        adaptability: { type: SchemaType.INTEGER },
        resilience: { type: SchemaType.INTEGER },
        structure: { type: SchemaType.INTEGER },
      },
      required: ['hp', 'adaptability', 'resilience', 'structure'],
    },
    fusion_line: { type: SchemaType.STRING },
    creature_spec_mutation: {
      type: SchemaType.OBJECT,
      properties: {
        body: {
          type: SchemaType.OBJECT,
          properties: { color: { type: SchemaType.STRING } },
        },
        eyes: {
          type: SchemaType.OBJECT,
          properties: { variant: { type: SchemaType.STRING } },
        },
        movement: { type: SchemaType.STRING },
      },
    },
    world_events: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING },
          bodyType: { type: SchemaType.STRING },
          intensity: { type: SchemaType.NUMBER },
          scale: { type: SchemaType.NUMBER },
          x: { type: SchemaType.NUMBER },
          y: { type: SchemaType.NUMBER },
        },
        required: ['type'],
      },
    },
  },
  required: ['new_name', 'fusion_narrative', 'new_traits', 'modified_vulnerabilities', 'energy_strategy', 'stat_changes', 'fusion_line'],
};
