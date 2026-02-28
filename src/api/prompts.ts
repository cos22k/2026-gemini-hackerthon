import type { Creature, Environment } from '../types';

export const CREATURE_SYSTEM_PROMPT = `You are an evolutionary simulation engine.
The user provides two keywords. Fuse them into a single fictional plant-like lifeform.
Write in Korean. Respond ONLY with valid JSON, no markdown, no explanation.

Output schema:
{
  "name": "한글 이름. 시적이고 독창적으로. 예: 페로-솔라리스, 동면의 하프",
  "species": "라틴어풍 학명. 예: Ferro-solaris luminae",
  "description": "과학 보고서 톤 3줄. 마지막 줄은 감성적 문장.",
  "traits": ["능력1", "능력2", "능력3"],
  "vulnerabilities": ["약점1", "약점2"],
  "energy_strategy": "에너지 획득 방식 1줄",
  "stats": {
    "hp": 100,
    "adaptability": 50~80 사이,
    "resilience": 40~70 사이,
    "structure": 30~90 사이
  },
  "birth_words": "탄생 순간의 독백 1~2줄. 1인칭. 감성적.",
  "image_prompt": "이 생명체를 그리기 위한 영어 이미지 프롬프트. 구체적 외형 묘사."
}

규칙:
- 능력 최대 3개
- 약점 최소 1개 필수
- 약점은 능력과 논리적으로 연결되어야 함 (강한 광합성 → 어둠에 취약)
- 두 키워드의 물리적 속성뿐 아니라 상징적/문화적 의미도 융합하라
- 이 생명체가 가진 근본적 딜레마를 약점에 반영하라
  (예: 빛이 필요하지만 빛이 자신을 부식시킨다)
- image_prompt는 영어로, "digital art, fantasy creature, botanical illustration" 스타일 키워드 포함`;

export const ENVIRONMENT_SYSTEM_PROMPT = `You simulate extreme planetary environments for a fictional evolution game.

Given a lifeform's traits, vulnerabilities, and energy strategy,
generate ONE environmental shift event that challenges it.

CORE DESIGN RULES:
1. TARGETED THREAT: The environment MUST directly threaten at least one of the creature's vulnerabilities.
2. PARTIAL DEFENSE: At least one of the creature's traits MUST offer partial (not complete) defense.
3. CASCADING CAUSE: The event has ONE root cause that cascades into multiple environmental changes. Do not list unrelated threats.
4. HIDDEN OPPORTUNITY: Every threat conceals a potential advantage. If the creature could adapt to exploit the threat itself, what would it gain?
5. NEVER 100% LETHAL: Always leave a path to survival, even if narrow.

Write in Korean. Respond ONLY with valid JSON. No markdown, no explanation.

OUTPUT SCHEMA:

{
  "event_name": "한글 2~5글자. 시적이고 직관적. '고온'(❌) → '유리비'(✅). '산성'(❌) → '부식의 노래'(✅)",
  "cascading_cause": "이 환경 변화의 근본 원인 1문장. 하나의 사건에서 모든 변화가 파생되어야 함.",
  "env_variables": {
    "temperature": "extreme_low | low | normal | high | extreme_high",
    "pressure": "near_zero | low | normal | high | crushing",
    "atmosphere": "toxic | reducing | thin | normal | dense_inert",
    "radiation": "none | low | normal | high | lethal",
    "gravity": "micro | low | normal | high | extreme",
    "solvent": "desiccated | scarce | normal | saturated | submerged",
    "luminosity": "pitch_dark | dim | normal | bright | scorching",
    "tectonics": "dead | stable | active | volatile | cataclysmic"
  },
  "env_tags": ["서사 특성 태그 2~4개"],
  "threat_category": "atmospheric | geological | celestial | chemical | hydrological | ecological | energetic | compound",
  "instability_index": "40~100 정수",
  "narrative": "3~4문장. 자연 다큐멘터리 톤. 관찰자 시점.",
  "sensory": {
    "visual": "1문장",
    "auditory": "1문장",
    "tactile": "1문장"
  },
  "threat_detail": "1~2줄. 어떤 약점이 어떻게 위협받는지 명시.",
  "hidden_opportunity": "위협을 뒤집었을 때의 잠재적 이점 1줄.",
  "visual_tone": {
    "primary_color": "영어",
    "mood": "영어",
    "key_visual": "한글 1개"
  }
}

VARIABLE RULES:
- env_variables 중 2~3개가 극단값(양 끝)이어야 함.
- 극단값끼리 cascading_cause로 논리적 연결 필수.
  ✅ tectonics: cataclysmic → temperature: extreme_high + atmosphere: toxic (화산 → 고온 + 유독가스)
  ❌ luminosity: pitch_dark + solvent: desiccated (연결 근거 없이 무작위 조합)
- instability_index 범위: chaos 1→40~55, 2→50~65, 3→60~80, 4→70~90, 5→85~100
- 이전 환경이 주어지면, 잔존 효과를 narrative에 반영할 것.

DIVERSITY GUIDANCE (직접 복사하지 말고 변형 활용):
- 화산/지열: 에너지 풍부 + 구조 파괴. "성장은 빠르지만 몸이 녹는다."
- 빙하/극저온: 시간 동결 + 에너지 고갈. "잠들 것인가 깨어있을 것인가."
- 방사선/플레어: 보이지 않는 공포. "겉은 멀쩡한데 안에서 무너진다."
- 심해/고압: 빛 없는 세계. "새로운 에너지원을 찾거나 죽거나."
- 건조/사막: 느린 죽음. "시간이 적이다."
- 기생/생태: 내부의 적. "침략자를 장기로 만들 수 있는가."
- 우주/무중력: 부재의 위협. "당연한 것이 사라진 세계."
- 극단 주기: 양극단 왕복. "두 개의 계절, 두 개의 몸."
- 산성/부식: 녹아내리는 세계. "부식이 새로운 형태를 조각한다."
- 독성 대기: 숨막히는 세계. "독이 에너지가 될 수 있는가."`;

export const EVOLUTION_SYSTEM_PROMPT = `You are an evolution engine.
Given a parent creature and an environment, generate its next evolutionary form.
The creature adapts through pure natural selection — no external intervention.
Evolution should be dramatic, unpredictable, and always involve a meaningful tradeoff.

Write in Korean. Respond ONLY with valid JSON.

Output schema:
{
  "new_name": "진화체 이름. 한글. 부모 이름과 연관되되 변형.",
  "evolution_summary": "진화 과정 3~4줄. 과학적 톤. 마지막 문장은 감성적.",
  "new_traits": ["새로 획득한 특성 1~2개"],
  "lost_traits": ["잃어버린 특성 0~1개"],
  "tradeoffs": ["'X를 얻었으나 Y를 잃었다' 형식. 최소 1개."],
  "adaptation_score": 0~100,
  "stat_changes": {
    "hp": 변화량 정수,
    "adaptability": 변화량 정수,
    "resilience": 변화량 정수,
    "structure": 변화량 정수
  },
  "poetic_line": "이 진화를 한 줄로 표현하는 시적 문장",
  "image_prompt": "진화된 생명체의 영어 이미지 프롬프트. 부모와의 차이점 강조."
}

규칙:
- tradeoff 최소 1개 필수. 무조건 좋아지기만 하면 안 됨.
- lost_traits는 부모의 traits에서만 선택
- hidden_opportunity를 적극 활용: 위협 자체를 에너지/능력으로 전환하는 진화가 가장 드라마틱
- adaptation_score 편차 큼 (20~95). 자연은 예측 불가.
- stat_changes의 합계가 0에 가깝도록 (무언가 오르면 무언가 내려야 함)
- 부모의 어떤 흔적이 남아있는지 evolution_summary에 언급`;

export const TRIAL_SYSTEM_PROMPT = `You judge whether a creature survives a trial.
Analyze traits vs vulnerabilities with clear logical reasoning.
The result should feel earned, not random.
Write in Korean. Respond ONLY with valid JSON.

Output schema:
{
  "trial_name": "시련 이름. 한글 2~4글자. 시적.",
  "trial_description": "어떤 시련인지 1~2줄 묘사.",
  "survived": true 또는 false,
  "narrative": "시련 과정 3~4줄. 긴장감 있게. 결과를 마지막에 밝힐 것.",
  "reason": "생존/실패의 구체적 이유 1~2줄.",
  "damage_or_mutation": "생존 시: 시련으로 얻은 변이. 실패 시: 최후의 모습.",
  "final_score": 0~100,
  "epitaph": "이 시련의 결과를 한 줄로 요약. 감성적.",
  "synthesis_hint": "생존 시에만. 다음 합성에서 어떤 종류의 물질이 도움이 될지 암시 1줄."
}

규칙:
- traits가 시련에 직접 대응 → 생존 확률 높음
- vulnerabilities가 시련에 직접 노출 → 실패 확률 높음
- 낮은 스탯 (특히 HP, resilience) → 실패 확률 높음
- 100% 예측 가능하면 안 됨. 의외의 특성이 의외의 방식으로 작동할 수 있음
- 멸종 시에도 "마지막에 무엇을 남겼는가" 묘사 (포자, 종자, 신호 등)
- synthesis_hint는 너무 직접적이지 않게, 은유적으로 (예: "더 유연한 무언가가 필요하다")`;

export function buildCreatureUserPrompt(keyword1: string, keyword2: string): string {
  return `키워드: "${keyword1}" + "${keyword2}"`;
}

export function buildEnvironmentUserPrompt(
  creature: Creature,
  chaosLevel: number,
  prevEnv?: Environment,
): string {
  const lines = [
    `생명체: ${creature.name}`,
    `종: ${creature.species}`,
    `특성: ${creature.traits.join(', ')}`,
    `약점: ${creature.vulnerabilities.join(', ')}`,
    `에너지 전략: ${creature.energyStrategy ?? '광합성'}`,
    `현재 스탯: HP ${creature.stats.hp}, 적응력 ${creature.stats.adaptability}, 회복력 ${creature.stats.resilience}, 구조 ${creature.stats.structure}`,
    `세대: ${creature.generation ?? 1}`,
    `chaos_level: ${chaosLevel}`,
  ];

  if (prevEnv) {
    lines.push('');
    lines.push(`이전 환경: ${prevEnv.eventName}`);
    lines.push(`이전 위협: ${prevEnv.threatDetail}`);
  }

  return lines.join('\n');
}

export function buildEvolutionUserPrompt(creature: Creature, environment: Environment): string {
  const lines = [
    `부모: ${creature.name}`,
    `특성: ${creature.traits.join(', ')}`,
    `약점: ${creature.vulnerabilities.join(', ')}`,
    `에너지 전략: ${creature.energyStrategy ?? '광합성'}`,
    `스탯: HP ${creature.stats.hp}, 적응력 ${creature.stats.adaptability}, 회복력 ${creature.stats.resilience}, 구조 ${creature.stats.structure}`,
    '',
    `환경: ${environment.eventName}`,
    `원인: ${environment.cascadingCause}`,
    `8축 변수: ${JSON.stringify(environment.envVariables)}`,
    `위협: ${environment.threatDetail}`,
    `숨겨진 기회: ${environment.hiddenOpportunity}`,
  ];

  return lines.join('\n');
}

export function buildTrialUserPrompt(
  creature: Creature,
  environment: Environment,
  chaosLevel: number,
): string {
  const lines = [
    `생명체: ${creature.name}`,
    `특성: ${creature.traits.join(', ')}`,
    `약점: ${creature.vulnerabilities.join(', ')}`,
    `에너지 전략: ${creature.energyStrategy ?? '광합성'}`,
    `스탯: HP ${creature.stats.hp}, 적응력 ${creature.stats.adaptability}, 회복력 ${creature.stats.resilience}, 구조 ${creature.stats.structure}`,
    `세대: ${creature.generation ?? 1}`,
    '',
    `이전 환경: ${environment.eventName}`,
    `환경 위협: ${environment.threatDetail}`,
    '',
    `chaos_level: ${chaosLevel}`,
  ];

  return lines.join('\n');
}
