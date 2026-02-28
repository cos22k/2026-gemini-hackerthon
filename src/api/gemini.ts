import type { Creature, Environment, EvolutionResult, TrialResult } from '../types';

// Gemini API text generation
// TODO: Implement API calls

export async function generateCreature(_keyword1: string, _keyword2: string): Promise<Creature | null> {
  return null;
}

export async function generateEnvironment(_creature: Creature): Promise<Environment | null> {
  return null;
}

export async function generateEvolution(
  _creature: Creature,
  _environment: Environment,
  _interventionFlag: boolean,
): Promise<EvolutionResult | null> {
  return null;
}

export async function generateTrial(_creature: Creature): Promise<TrialResult | null> {
  return null;
}
