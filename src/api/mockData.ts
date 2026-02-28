/**
 * Mock data for debug mode (?debug=skip).
 * Returns structured sample data matching the exact shapes from the mapper functions,
 * so the entire game loop exercises real code paths without hitting Gemini.
 */

import type { Creature, Environment, EvolutionResult, TrialResult } from '../types';
import type { SynthesisResult } from '../game/types';

export const MOCK_CREATURE: Creature = {
  name: '화수룡 (火水龍)',
  species: '원소 양서류',
  description: '불과 물의 키워드에서 태어난 이 작은 생명체는 등에서 증기를 뿜으며 물속에서도 불꽃을 유지할 수 있는 독특한 체질을 가졌다.',
  traits: ['증기 호흡', '양서 적응', '온도 조절'],
  vulnerabilities: ['급격한 기압 변화', '전기 충격'],
  energyStrategy: '열수 순환 — 체내의 물과 열을 순환시켜 에너지를 생성',
  stats: { hp: 100, adaptability: 65, resilience: 55, structure: 60 },
  imageUrl: null,
  birthWords: '불 × 물',
  generation: 1,
  creatureSpec: {
    body: { shape: 'blob', width: 120, height: 100, color: '#ff6b4a', stroke: '#222' },
    eyes: { variant: 'cute', size: 20, spacing: 36, offsetY: -15, count: 2 },
    mouth: { variant: 'smile', width: 20, offsetY: 15 },
    additions: [],
    limbs: [
      { type: 'leg', anchorX: -0.5, anchorY: 0.85, length: 32, width: 7, color: '#d4533b', restAngle: -18 },
      { type: 'leg', anchorX: 0.5, anchorY: 0.85, length: 32, width: 7, color: '#d4533b', restAngle: 18 },
      { type: 'arm', anchorX: -0.9, anchorY: 0.0, length: 22, width: 5, color: '#e8825a', restAngle: -35 },
      { type: 'arm', anchorX: 0.9, anchorY: 0.0, length: 22, width: 5, color: '#e8825a', restAngle: 35 },
    ],
    movement: 'waddle',
  },
};

export const MOCK_ENVIRONMENT: Environment = {
  eventName: '심해 열수 분출',
  cascadingCause: '지각 활동으로 인한 해저 화산 활성화',
  envVariables: {
    temperature: 'high',
    pressure: 'high',
    atmosphere: 'reducing',
    radiation: 'low',
    gravity: 'normal',
    solvent: 'submerged',
    luminosity: 'dim',
    tectonics: 'active',
  },
  envTags: ['열수구', '심해', '화산활동'],
  threatCategory: '극한 온도',
  instabilityIndex: 62,
  narrative: '해저 깊은 곳에서 뜨거운 광물이 분출되며 주변 수온이 급격히 상승하고 있다. 유독 가스 기포가 올라오고, 주변 바위가 붉은 빛으로 달아오른다.',
  sensory: {
    visual: '붉은 빛이 심해의 어둠을 가르며 퍼지고, 광물 입자들이 물속에서 반짝인다',
    auditory: '깊은 진동과 함께 쉭쉭거리는 증기 소리가 울린다',
    tactile: '뜨거운 수류가 피부를 감싸고, 수압이 몸을 짓누른다',
  },
  threatDetail: '열수 분출구 주변 온도 300°C 이상, 유독 황화수소 농도 증가',
  hiddenOpportunity: '열수구 주변의 희귀 광물이 진화 촉매로 작용할 수 있다',
  visualTone: {
    primaryColor: '#c41e3a',
    mood: '긴장감',
    keyVisual: '심해 열수 분출',
  },
  playerAxes: { energy: 'HIGH', physical: 'HIGH', purity: 'LOW' },
  durationSeconds: 5,
  worldEvents: [
    { type: 'setGravity', scale: 1.2 },
    { type: 'addBody', bodyType: 'stone', x: 200, y: 300 },
  ],
};

export const MOCK_EVOLUTION: EvolutionResult = {
  newName: '증기갑룡 (蒸氣甲龍)',
  evolutionSummary: '극한의 열수 환경에서 외피가 광물질로 강화되었고, 증기를 추진력으로 사용하는 능력이 발달했다.',
  newTraits: ['광물 외피', '증기 추진'],
  lostTraits: ['온도 조절'],
  tradeoffs: ['외피가 두꺼워지면서 민첩성이 감소했지만 방어력이 크게 증가'],
  adaptationScore: 72,
  statChanges: { hp: 15, adaptability: -5, resilience: 20, structure: 10 },
  poeticLine: '뜨거운 심연에서 갑옷을 입은 자, 증기의 날개로 어둠을 가른다',
  imageUrl: null,
  creatureSpecMutation: {
    body: { shape: 'roundRect', width: 130, height: 110, color: '#d4533b', stroke: '#333' },
  },
  worldEvents: [
    { type: 'shake', intensity: 3 },
  ],
};

export const MOCK_TRIAL_SURVIVE: TrialResult = {
  trialName: '황화수소 폭풍',
  trialDescription: '열수구에서 갑작스럽게 대량의 황화수소가 분출되며 주변 생태계가 위협받는다.',
  narrative: '독성 가스가 물속을 뒤덮었지만, 증기갑룡의 광물 외피가 독소를 차단했다. 증기 추진력으로 위험 지대를 빠르게 탈출하며 생존에 성공했다.',
  survived: true,
  reason: '광물 외피의 독소 차단 능력과 증기 추진의 탈출 기동성이 결정적이었다',
  damageOrMutation: '외피 일부가 황화물에 의해 변색되었으나 구조적 손상은 없음',
  finalScore: 78,
  epitaph: '',
  synthesisHint: '결정질 구조를 강화할 수 있는 물질이 도움이 될 것이다',
  worldEvents: [
    { type: 'shake', intensity: 5 },
  ],
};

export const MOCK_TRIAL_EXTINCT: TrialResult = {
  trialName: '황화수소 폭풍',
  trialDescription: '열수구에서 갑작스럽게 대량의 황화수소가 분출되며 주변 생태계가 위협받는다.',
  narrative: '독성 가스가 너무 빠르게 퍼져 광물 외피로도 막을 수 없었다. 증기갑룡은 서서히 움직임을 멈추고 심해의 일부가 되었다.',
  survived: false,
  reason: '황화수소 농도가 외피의 방어 한계를 초과했다',
  damageOrMutation: '전신 광물화 — 생체 기능 정지',
  finalScore: 35,
  epitaph: '심해의 열수 속에서 태어나, 같은 열수 속에서 영원히 잠들다. 증기의 노래는 이제 바위의 침묵이 되었다.',
  worldEvents: [],
};

export const MOCK_SYNTHESIS: SynthesisResult = {
  newName: '수정갑룡 (水晶甲龍)',
  fusionNarrative: '수정의 격자 구조가 광물 외피와 융합되며 투명하게 빛나는 결정질 갑옷으로 진화했다.',
  newTraits: ['수정 갑옷', '굴절 방어'],
  modifiedVulnerabilities: ['공명 진동', '전기 충격'],
  energyStrategy: '광결정 순환 — 빛을 수정을 통해 에너지로 변환',
  statChanges: { hp: 10, adaptability: 5, resilience: 15, structure: 20 },
  fusionLine: '수정의 빛 속에 불과 물의 기억이 영원히 새겨지다',
  creatureSpecMutation: {
    body: { shape: 'roundRect', width: 140, height: 115, color: '#7b68ee', stroke: '#444' },
  },
  worldEvents: [
    { type: 'addBody', bodyType: 'ball', x: 300, y: 200 },
  ],
};
