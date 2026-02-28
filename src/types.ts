export interface Stats {
  hp: number;
  adaptability: number;
  resilience: number;
  structure: number;
}

import type { CreatureSpec, PhysicsCommand } from './world/types';

export interface Creature {
  name: string;
  species: string;
  description: string;
  traits: string[];
  vulnerabilities: string[];
  energyStrategy?: string;
  stats: Stats;
  imageUrl: string | null;
  birthWords: string;
  generation?: number;
  creatureSpec?: CreatureSpec;
}

// 8-axis environment variable levels
export type TemperatureLevel = 'extreme_low' | 'low' | 'normal' | 'high' | 'extreme_high';
export type PressureLevel = 'near_zero' | 'low' | 'normal' | 'high' | 'crushing';
export type AtmosphereLevel = 'toxic' | 'reducing' | 'thin' | 'normal' | 'dense_inert';
export type RadiationLevel = 'none' | 'low' | 'normal' | 'high' | 'lethal';
export type GravityLevel = 'micro' | 'low' | 'normal' | 'high' | 'extreme';
export type SolventLevel = 'desiccated' | 'scarce' | 'normal' | 'saturated' | 'submerged';
export type LuminosityLevel = 'pitch_dark' | 'dim' | 'normal' | 'bright' | 'scorching';
export type TectonicsLevel = 'dead' | 'stable' | 'active' | 'volatile' | 'cataclysmic';

export type PlayerAxisLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface EnvVariables {
  temperature: TemperatureLevel;
  pressure: PressureLevel;
  atmosphere: AtmosphereLevel;
  radiation: RadiationLevel;
  gravity: GravityLevel;
  solvent: SolventLevel;
  luminosity: LuminosityLevel;
  tectonics: TectonicsLevel;
}

export interface PlayerAxes {
  energy: PlayerAxisLevel;
  physical: PlayerAxisLevel;
  purity: PlayerAxisLevel;
}

export interface Sensory {
  visual: string;
  auditory: string;
  tactile: string;
}

export interface VisualTone {
  primaryColor: string;
  mood: string;
  keyVisual: string;
}

export interface Environment {
  eventName: string;
  cascadingCause: string;
  envVariables: EnvVariables;
  envTags: string[];
  threatCategory: string;
  instabilityIndex: number;
  narrative: string;
  sensory: Sensory;
  threatDetail: string;
  hiddenOpportunity: string;
  visualTone: VisualTone;
  playerAxes: PlayerAxes;
  durationSeconds: number;
  worldEvents?: PhysicsCommand[];
}

export interface EvolutionResult {
  newName: string;
  evolutionSummary: string;
  newTraits: string[];
  lostTraits: string[];
  tradeoffs: string[];
  adaptationScore: number;
  statChanges: Stats;
  poeticLine: string;
  imageUrl: string | null;
  creatureSpecMutation?: Partial<CreatureSpec>;
  worldEvents?: PhysicsCommand[];
}

export interface TrialResult {
  trialName: string;
  trialDescription: string;
  narrative: string;
  survived: boolean;
  reason: string;
  damageOrMutation: string;
  finalScore: number;
  epitaph: string;
  synthesisHint?: string;
  worldEvents?: PhysicsCommand[];
}

// History event detail types
export interface BirthDetail {
  species: string;
  stats: Stats;
  traits: string[];
  vulnerabilities: string[];
  description: string;
  energyStrategy?: string;
}

export interface EnvironmentDetail {
  narrative: string;
  sensory: Sensory;
  threatCategory: string;
  cascadingCause: string;
  hiddenOpportunity: string;
  threatDetail: string;
  envTags: string[];
  instabilityIndex: number;
}

export interface EvolutionDetail {
  newTraits: string[];
  lostTraits: string[];
  tradeoffs: string[];
  adaptationScore: number;
  statChanges: Stats;
  evolutionSummary: string;
}

export interface TrialDetail {
  narrative: string;
  reason: string;
  damageOrMutation: string;
  survived: boolean;
  finalScore: number;
  epitaph: string;
  trialDescription: string;
}

export interface SynthesisDetail {
  fusionNarrative: string;
  newTraits: string[];
  statChanges: Stats;
}

export type HistoryEventDetail =
  | BirthDetail
  | EnvironmentDetail
  | EvolutionDetail
  | TrialDetail
  | SynthesisDetail;

export interface HistoryEvent {
  type: string;
  title: string;
  summary: string;
  detail?: HistoryEventDetail;
}

export interface ActionButton {
  label: string;
  onClick: () => void;
  primary?: boolean;
}
