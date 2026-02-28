import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Creature, Environment, EvolutionResult, TrialResult } from '../types';
import {
  CREATURE_SYSTEM_PROMPT,
  ENVIRONMENT_SYSTEM_PROMPT,
  EVOLUTION_SYSTEM_PROMPT,
  TRIAL_SYSTEM_PROMPT,
  buildCreatureUserPrompt,
  buildEnvironmentUserPrompt,
  buildEvolutionUserPrompt,
  buildTrialUserPrompt,
} from './prompts';
import {
  callWithRetry,
  mapCreatureResponse,
  mapEnvironmentResponse,
  mapEvolutionResponse,
  mapTrialResponse,
} from './utils';
import { creatureSchema, environmentSchema, evolutionSchema, trialSchema } from './schemas';

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
