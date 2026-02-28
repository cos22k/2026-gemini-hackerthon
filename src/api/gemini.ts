import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Creature, Environment, EvolutionResult, TrialResult } from '../types';
import type { CreatureSpec } from '../world/types';
import {
  CREATURE_SYSTEM_PROMPT,
  ENVIRONMENT_SYSTEM_PROMPT,
  EVOLUTION_SYSTEM_PROMPT,
  TRIAL_SYSTEM_PROMPT,
  SYNTHESIS_SYSTEM_PROMPT,
  buildCreatureUserPrompt,
  buildEnvironmentUserPrompt,
  buildEvolutionUserPrompt,
  buildTrialUserPrompt,
  buildSynthesisUserPrompt,
} from './prompts';
import {
  callWithRetry,
  mapCreatureResponse,
  mapEnvironmentResponse,
  mapEvolutionResponse,
  mapTrialResponse,
  mapSynthesisResponse,
} from './utils';
import { creatureSchema, environmentSchema, evolutionSchema, trialSchema, synthesisSchema } from './schemas';
import type { SynthesisResult } from '../game/types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(API_KEY);

const BASE_CONFIG = {
  temperature: 0.9,
  topP: 0.95,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json' as const,
  thinkingConfig: { thinkingBudget: 0 },
};

const creatureModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { ...BASE_CONFIG, responseSchema: creatureSchema },
});

const environmentModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { ...BASE_CONFIG, responseSchema: environmentSchema },
});

const evolutionModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { ...BASE_CONFIG, responseSchema: evolutionSchema },
});

const trialModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { ...BASE_CONFIG, responseSchema: trialSchema },
});

const synthesisModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { ...BASE_CONFIG, responseSchema: synthesisSchema },
});

export async function generateCreature(keyword1: string, keyword2: string): Promise<Creature | null> {
  const userPrompt = buildCreatureUserPrompt(keyword1, keyword2);

  return callWithRetry(async () => {
    const result = await creatureModel.generateContent({
      systemInstruction: CREATURE_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    });

    const parsed = JSON.parse(result.response.text());
    console.log('[Gemini Creature]', parsed);

    return mapCreatureResponse(parsed);
  });
}

export async function generateEnvironment(
  creature: Creature,
  chaosLevel: number,
  prevEnv?: Environment,
): Promise<Environment | null> {
  const userPrompt = buildEnvironmentUserPrompt(creature, chaosLevel, prevEnv);

  return callWithRetry(async () => {
    const result = await environmentModel.generateContent({
      systemInstruction: ENVIRONMENT_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    });

    const parsed = JSON.parse(result.response.text());
    console.log('[Gemini Environment]', parsed);

    return mapEnvironmentResponse(parsed);
  });
}

export async function generateEvolution(
  creature: Creature,
  environment: Environment,
): Promise<EvolutionResult | null> {
  const userPrompt = buildEvolutionUserPrompt(creature, environment);

  return callWithRetry(async () => {
    const result = await evolutionModel.generateContent({
      systemInstruction: EVOLUTION_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    });

    const parsed = JSON.parse(result.response.text());
    console.log('[Gemini Evolution]', parsed);

    return mapEvolutionResponse(parsed);
  });
}

export async function generateTrial(
  creature: Creature,
  environment: Environment,
  chaosLevel: number,
): Promise<TrialResult | null> {
  const userPrompt = buildTrialUserPrompt(creature, environment, chaosLevel);

  return callWithRetry(async () => {
    const result = await trialModel.generateContent({
      systemInstruction: TRIAL_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    });

    const parsed = JSON.parse(result.response.text());
    console.log('[Gemini Trial]', parsed);

    return mapTrialResponse(parsed);
  });
}

export async function generateSynthesis(
  creature: Creature,
  trialResult: TrialResult,
  newKeyword: string,
): Promise<SynthesisResult | null> {
  const userPrompt = buildSynthesisUserPrompt(creature, trialResult, newKeyword);

  return callWithRetry(async () => {
    const result = await synthesisModel.generateContent({
      systemInstruction: SYNTHESIS_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    });

    const parsed = JSON.parse(result.response.text());
    console.log('[Gemini Synthesis]', parsed);

    return mapSynthesisResponse(parsed);
  });
}

// ── CreatureSpec normalization ─────────────────────────────

const DEFAULT_CREATURE_SPEC: CreatureSpec = {
  body: { shape: 'blob', width: 120, height: 100, color: '#ffffff', stroke: '#222' },
  eyes: { variant: 'dot', size: 18, spacing: 36, offsetY: -15, count: 2 },
  mouth: { variant: 'smile', width: 20, offsetY: 15 },
  additions: [],
  movement: 'waddle',
};

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
