import type { Stats, HistoryEvent } from '../types';
import type { CreatureSpec, PhysicsCommand } from '../world/types';

// ── Game phases (v2 loop) ─────────────────────────────────

export type GamePhase =
  | 'intro'
  | 'creating'
  | 'birth'
  | 'environment'
  | 'evolving'
  | 'trial'
  | 'trial_result'
  | 'synthesis'
  | 'epilogue';

// ── Extended creature with v2 fields ──────────────────────

export interface GameCreature {
  name: string;
  species: string;
  description: string;
  traits: string[];
  vulnerabilities: string[];
  stats: Stats;
  imageUrl: string | null;
  birthWords: string;
  energyStrategy: string;
  generation: number;
  creatureSpec: CreatureSpec;
}

// ── Extended environment with v2 fields ───────────────────

export interface GameEnvironment {
  eventName: string;
  cascadingCause: string;
  envVariables: Record<string, string>;
  envTags: string[];
  threatCategory: string;
  instabilityIndex: number;
  narrative: string;
  sensory: { visual: string; auditory: string; tactile: string };
  threatDetail: string;
  hiddenOpportunity: string;
  visualTone: { primaryColor: string; mood: string; keyVisual: string };
}

// ── v2 evolution result ───────────────────────────────────

export interface GameEvolution {
  newName: string;
  evolutionSummary: string;
  newTraits: string[];
  lostTraits: string[];
  tradeoffs: string[];
  adaptationScore: number;
  statChanges: Stats;
  poeticLine: string;
  creatureSpecMutation: Partial<CreatureSpec>;
  worldEvents: PhysicsCommand[];
}

// ── v2 trial ──────────────────────────────────────────────

export interface GameTrial {
  trialName: string;
  trialDescription: string;
  survived: boolean;
  narrative: string;
  reason: string;
  damageOrMutation: string;
  finalScore: number;
  epitaph: string;
  synthesisHint?: string;
  worldEvents: PhysicsCommand[];
}

// ── Synthesis result ──────────────────────────────────────

export interface SynthesisResult {
  newName: string;
  fusionNarrative: string;
  newTraits: string[];
  modifiedVulnerabilities: string[];
  energyStrategy: string;
  statChanges: Stats;
  fusionLine: string;
  creatureSpecMutation: Partial<CreatureSpec>;
  worldEvents: PhysicsCommand[];
}

// ── Full game state ───────────────────────────────────────

export interface GameState {
  phase: GamePhase;
  round: number;
  chaosLevel: number;
  creature: GameCreature | null;
  environment: GameEnvironment | null;
  evolution: GameEvolution | null;
  trial: GameTrial | null;
  history: HistoryEvent[];
  synthesisHistory: { round: number; keyword: string; resultName: string }[];
  loading: boolean;
  loadingMessage: string;
  error: string | null;
  sessionId: string | null;
}

export const INITIAL_GAME_STATE: GameState = {
  phase: 'intro',
  round: 1,
  chaosLevel: 1,
  creature: null,
  environment: null,
  evolution: null,
  trial: null,
  history: [],
  synthesisHistory: [],
  loading: false,
  loadingMessage: '',
  error: null,
  sessionId: null,
};
