export interface Stats {
  hp: number;
  adaptability: number;
  resilience: number;
  structure: number;
}

export interface Creature {
  name: string;
  species: string;
  description: string;
  traits: string[];
  vulnerabilities: string[];
  stats: Stats;
  imageUrl: string | null;
  birthWords: string;
}

export interface Environment {
  eventName: string;
  pressure: string;
  oxygen: string;
  temperature: string;
  instabilityIndex: number;
  narrative: string;
  threatDetail: string;
}

export interface EvolutionResult {
  newName: string;
  evolutionSummary: string;
  tradeoffs: string[];
  statChanges: Stats;
  poeticLine: string;
  imageUrl: string | null;
}

export interface TrialResult {
  type: string;
  title: string;
  narrative: string;
  survived: boolean;
  reason: string;
  finalScore: number;
  epitaph: string;
}

export interface HistoryEvent {
  type: string;
  title: string;
  summary: string;
}

export interface ActionButton {
  label: string;
  onClick: () => void;
  primary?: boolean;
}
