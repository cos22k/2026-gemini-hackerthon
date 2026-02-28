# 환경 자동 생성 프롬프트 레퍼런스

---

## P-1. 아키텍처: 이중 레이어 시스템

```
┌─────────────────────────────────────────────────────┐
│                  AI 내부 레이어                        │
│              (프롬프트 안에서만 작동)                    │
│                                                       │
│  8축 환경 변수                                         │
│  temperature / pressure / atmosphere / radiation       │
│  gravity / solvent / luminosity / tectonics            │
│                                                       │
│  + cascading_cause (연쇄 원인)                         │
│  + env_tags (서사 태그)                                │
│  + sensory (감각 묘사)                                 │
│  + hidden_opportunity (역설적 기회)                     │
│  + visual_tone (색감/분위기)                            │
│                                                       │
└──────────────────────────┬──────────────────────────┘
                           │
                     변환 로직 (코드)
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                플레이어 UI 레이어                       │
│             (화면에 실제로 보이는 것)                    │
│                                                       │
│  ⚡ 에너지 위협도: LOW / NORMAL / HIGH / CRITICAL      │
│     ← luminosity + solvent + energy_strategy 참조     │
│                                                       │
│  💀 물리 위협도: LOW / NORMAL / HIGH / CRITICAL        │
│     ← temperature + pressure + gravity + tectonics    │
│                                                       │
│  🫧 순도 위협도: LOW / NORMAL / HIGH / CRITICAL        │
│     ← atmosphere + radiation                          │
│                                                       │
│  + 이벤트 이름 + 서사 + 개입 버튼 3개                   │
└─────────────────────────────────────────────────────┘
```

**핵심 원리:** AI에게는 8축의 풍부한 변수를 주어 다양하고 논리적인 환경을 생성하게 하되, 플레이어에게는 직관적인 3축(배고픈가 / 아픈가 / 숨막히는가)만 보여줍니다.

---

## P-2. 8축 → 3축 변환 로직 (프론트엔드 코드)

```jsx
function convertToPlayerAxes(envVars, creature) {
  // 각 변수값의 극단 정도를 점수화
  const severityMap = {
    // 극단값 (위협 높음)
    extreme_low: 2,
    near_zero: 2,
    micro: 2,
    desiccated: 2,
    pitch_dark: 2,
    cataclysmic: 2,
    toxic: 2,
    lethal: 2,
    crushing: 2,
    extreme: 2,
    extreme_high: 2,
    scorching: 2,
    // 중간 극단값
    low: 1,
    high: 1,
    dim: 1,
    bright: 1,
    thin: 1,
    reducing: 1,
    dense_inert: 1,
    scarce: 1,
    saturated: 1,
    submerged: 1,
    active: 0.5,
    volatile: 1.5,
    // 정상 (위협 없음)
    normal: 0,
    stable: 0,
    none: 0,
    dead: 0,
  };

  const s = (key) => severityMap[envVars[key]] || 0;

  // ⚡ 에너지 위협: 빛(에너지 수급)과 용매(대사 기반)
  const energyScore = s("luminosity") + s("solvent") * 0.5;

  // 💀 물리 위협: 온도, 압력, 중력, 지질 활동
  const physicalScore =
    (s("temperature") +
      s("pressure") +
      s("gravity") * 0.7 +
      s("tectonics") * 0.8) /
    2;

  // 🫧 순도 위협: 대기 독성, 방사선
  const purityScore = s("atmosphere") + s("radiation");

  const toLevel = (score) => {
    if (score <= 0.5) return "LOW";
    if (score <= 1.5) return "NORMAL";
    if (score <= 2.5) return "HIGH";
    return "CRITICAL";
  };

  return {
    energy: toLevel(energyScore),
    physical: toLevel(physicalScore),
    purity: toLevel(purityScore),
  };
}
```

### 3축 → 개입 버튼 매핑

```jsx
const interventionButtons = {
  energy: { icon: "⚡", label: "에너지 보급", desc: "에너지원을 안정화합니다" },
  physical: {
    icon: "🛡️",
    label: "환경 안정화",
    desc: "물리적 환경을 완화합니다",
  },
  purity: { icon: "🫧", label: "정화", desc: "대기/화학 환경을 정화합니다" },
};
```

개입 시, 해당 축에 대응하는 8축 변수들이 `normal`로 안정화되어 진화 프롬프트에 전달됩니다.

```jsx
function applyIntervention(envVars, axis) {
  const modified = { ...envVars };
  const axisMapping = {
    energy: ["luminosity", "solvent"],
    physical: ["temperature", "pressure", "gravity", "tectonics"],
    purity: ["atmosphere", "radiation"],
  };
  axisMapping[axis].forEach((key) => {
    modified[key] = "normal";
  });
  return modified;
}
```

---

## P-3. 환경 자동 생성 프롬프트

### 시스템 프롬프트

```
You simulate extreme planetary environments for a fictional evolution game.

Given a lifeform's traits, vulnerabilities, and energy strategy,
generate ONE environmental shift event that challenges it.

CORE DESIGN RULES:
1. TARGETED THREAT: The environment MUST directly threaten at least one of the creature's vulnerabilities.
2. PARTIAL DEFENSE: At least one of the creature's traits MUST offer partial (not complete) defense.
3. CASCADING CAUSE: The event has ONE root cause that cascades into multiple environmental changes. Do not list unrelated threats.
4. HIDDEN OPPORTUNITY: Every threat conceals a potential advantage. If the creature could adapt to exploit the threat itself, what would it gain?
5. INTERVENTION COST: If a player stabilizes one axis, something valuable is also lost.
6. NEVER 100% LETHAL: Always leave a path to survival, even if narrow.

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

  "env_tags": ["서사 특성 태그 2~4개. 예: volcanic, acidic, parasitic, frozen, irradiated, submerged, corrosive"],

  "threat_category": "atmospheric | geological | celestial | chemical | hydrological | ecological | energetic | compound",

  "instability_index": "40~100 정수. chaos_level에 비례.",

  "narrative": "3~4문장. 자연 다큐멘터리 톤. 관찰자 시점('~가 관측된다'). 감각적 묘사 필수 포함.",

  "sensory": {
    "visual": "이 순간 눈에 보이는 장면 1문장",
    "auditory": "이 순간 들리는 소리 1문장",
    "tactile": "이 순간 표면에서 느껴지는 감각 1문장"
  },

  "threat_detail": "이 환경이 생명체에게 미칠 구체적 영향 1~2줄. 반드시 '어떤 약점'이 '어떻게' 위협받는지 명시.",

  "hidden_opportunity": "이 위협을 뒤집었을 때의 잠재적 이점 1줄. 위협 물질/조건이 에너지원이나 방어 수단이 될 수 있음을 암시.",

  "visual_tone": {
    "primary_color": "지배적 색상 영어. 예: 'deep crimson', 'sickly yellow-green', 'void black'",
    "mood": "분위기 키워드 영어. 예: 'oppressive', 'ethereal', 'violent', 'suffocating'",
    "key_visual": "핵심 비주얼 요소 1개. 한글. 예: '하늘에서 내리는 유리 파편', '끓어오르는 황산 웅덩이'"
  },

  "modifiable_axes": ["energy | physical | purity 중 현재 위협이 높은 축 2~3개. 플레이어는 이 중 1개를 안정화."],

  "intervention_cost": "개입 시 잃게 되는 것 1문장. 안정화 대상이 제공하던 잠재적 이점을 명시."
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
- 독성 대기: 숨막히는 세계. "독이 에너지가 될 수 있는가."
```

### 유저 프롬프트 템플릿

```
생명체: {name}
종: {species}
특성: {traits 배열을 쉼표로 나열}
약점: {vulnerabilities 배열을 쉼표로 나열}
에너지 전략: {energy_strategy}
현재 스탯: HP {hp}, 적응력 {adaptability}, 회복력 {resilience}, 구조 {structure}
세대: {generation}
chaos_level: {1~5}

{이전 환경 있으면 아래 추가}
이전 환경: {previous_event_name}
이전 위협: {previous_threat_detail}
이전 진화 결과: {획득/상실 특성 요약}
```

---

## P-4. 예시 입출력

### 예시 1: chaos_level 2, 금속+장미 생명체

**입력:**

```
생명체: 페로-솔라리스
종: Ferro-solaris rosaeum
특성: 금속 세포벽 (물리 방어), 자기장 감응, 전자기파 소통
약점: 산성 환경 부식, 고온 시 금속 팽창으로 구조 붕괴
에너지 전략: 철 이온 기반 광합성
현재 스탯: HP 100, 적응력 55, 회복력 65, 구조 80
세대: 1
chaos_level: 2
```

**기대 출력:**

```json
{
  "event_name": "부식의 안개",
  "cascading_cause": "지하 황철석 층이 지하수와 반응하며 대규모 산성 가스가 지표로 분출되기 시작했다",
  "env_variables": {
    "temperature": "normal",
    "pressure": "high",
    "atmosphere": "toxic",
    "radiation": "low",
    "gravity": "normal",
    "solvent": "saturated",
    "luminosity": "dim",
    "tectonics": "active"
  },
  "env_tags": ["acidic", "corrosive_fog", "mineral_rich", "dim_light"],
  "threat_category": "chemical",
  "instability_index": 62,
  "narrative": "지하에서 분출된 황산 가스가 대기 중 수분과 결합하며 pH 2.8의 산성 안개가 지표면을 삼킨다. 안개는 노란빛을 띠며 가시광선의 투과율을 30% 이하로 끌어내린다. 안개 속에서 금속 표면이 지직거리며 산화되는 소리가 사방에서 들려온다. 대기압이 상승하며, 산성 미립자가 모든 표면에 내려앉고 있다.",
  "sensory": {
    "visual": "노르스름한 안개가 지표면을 뒤덮고, 안개 사이로 금속 표면이 검게 변해가는 것이 보인다",
    "auditory": "금속이 산화되며 내는 미세한 치직거림이 사방에서 끊이지 않는다",
    "tactile": "표면에 닿는 안개 방울이 따끔거리며, 접촉 부위가 서서히 거칠어진다"
  },
  "threat_detail": "금속 세포벽이 산성 안개에 직접 부식된다. 동시에 빛 투과율 저하로 철 이온 기반 광합성 효율이 급감하여 에너지 수급에 이중 위기가 발생한다.",
  "hidden_opportunity": "산성 안개에 녹아있는 고농도 철 이온은, 흡수할 수만 있다면 평소보다 훨씬 풍부한 광합성 원료가 된다",
  "visual_tone": {
    "primary_color": "sickly yellow-green",
    "mood": "suffocating, corrosive",
    "key_visual": "지표면을 삼키는 노란 안개 속에서 검게 산화되어가는 금속 구조물들"
  },
  "modifiable_axes": ["purity", "energy"],
  "intervention_cost": "순도를 정화하면 안개 속 고농도 철 이온도 함께 제거되어, 잠재적 원료 공급원을 잃게 된다"
}
```

**이 예시에서 확인할 것:**

- 약점 "산성 환경 부식"을 직접 위협 ✅
- 특성 "금속 세포벽"이 부분 방어(완전 방어는 아님) ✅
- cascading_cause 하나에서 산성+고압+빛차단 연쇄 ✅
- hidden_opportunity가 진화 방향 암시 ✅
- intervention_cost가 의미 있는 트레이드오프 ✅

---

### 예시 2: chaos_level 4, 빛+수정 생명체

**입력:**

```
생명체: 프리즈마-코어
종: Prisma crystallinae
특성: 결정체 구조(빛 굴절/저장), 광선 방출, 공명 소통
약점: 충격에 의한 결정 파쇄, 고습도 환경에서 결정 혼탁화
에너지 전략: 빛 에너지 결정 내 저장 및 방출
현재 스탯: HP 80, 적응력 45, 회복력 50, 구조 90
세대: 3
chaos_level: 4

이전 환경: 자기 폭풍
이전 위협: 전자기파 교란으로 공명 소통 불안정화
이전 진화 결과: 공명 주파수 다중화 획득, 단일 결정 순도 감소
```

**기대 출력:**

```json
{
  "event_name": "침묵의 수몰",
  "cascading_cause": "행성 궤도가 근일점을 지나며 극관 빙하가 급격히 융해되어 저지대가 수몰되기 시작했다",
  "env_variables": {
    "temperature": "high",
    "pressure": "high",
    "atmosphere": "dense_inert",
    "radiation": "normal",
    "gravity": "normal",
    "solvent": "submerged",
    "luminosity": "dim",
    "tectonics": "active"
  },
  "env_tags": ["flooding", "high_humidity", "light_refraction", "seismic_melt"],
  "threat_category": "hydrological",
  "instability_index": 78,
  "narrative": "극관의 빙하가 무너지며 해수면이 급상승하고 있다. 탁한 융빙수가 지표를 삼키며 빛의 투과율이 급감한다. 수중에서 굴절된 빛은 예측 불가능한 방향으로 흩어지고, 물속에서 전해지는 진동이 지각의 불안정을 알린다. 이전 자기 폭풍의 잔해인 대기 중 하전 입자가 수면 위에서 희미하게 발광하고 있다.",
  "sensory": {
    "visual": "탁한 물이 지표를 삼키며, 수면 아래로 빛이 산란되어 모든 것이 뿌옇게 보인다",
    "auditory": "물이 차오르는 저음의 울림과 빙하 조각이 부딪히는 둔탁한 소리가 들린다",
    "tactile": "차오르는 물의 수압이 결정 표면을 고르게 압박하며, 표면에 미세한 수막이 형성된다"
  },
  "threat_detail": "고습도 + 완전 수몰로 결정체 표면이 혼탁화되어 빛 저장/방출 효율이 치명적으로 하락한다. 이전 세대에서 감소한 결정 순도가 수중 환경에서 더욱 악화된다. 수압이 결정 구조의 미세 균열을 확장시킬 수 있다.",
  "hidden_opportunity": "물은 빛의 매질이기도 하다. 수중에서 굴절되는 빛을 포집하는 새로운 결정 배열을 만들 수 있다면, 단일 방향 광합성보다 전방위 에너지 수집이 가능해진다",
  "visual_tone": {
    "primary_color": "murky teal with scattered light shafts",
    "mood": "drowning, disorienting, eerily beautiful",
    "key_visual": "수면 아래에서 산란되는 빛줄기 사이로 흐릿하게 빛나는 결정체"
  },
  "modifiable_axes": ["physical", "energy", "purity"],
  "intervention_cost": "물리 환경을 안정화하면 수위가 내려가지만, 수중에서만 가능한 전방위 빛 굴절 환경도 함께 사라진다"
}
```

---

## P-5. 진화 프롬프트에 환경 정보 전달하기

환경 생성 결과는 진화 프롬프트의 입력이 됩니다.
핵심은 `hidden_opportunity`를 진화 프롬프트에 반드시 전달하는 것입니다.

### 진화 프롬프트에 포함할 환경 정보 블록

```
[환경 정보]
이벤트: {event_name}
원인: {cascading_cause}
8축 변수: {env_variables 전체}
위협: {threat_detail}
숨겨진 기회: {hidden_opportunity}

[개입 여부]
intervention_flag: true/false
개입한 축: {energy | physical | purity}
개입 비용: {intervention_cost}
안정화 후 변수: {applyIntervention() 결과}
```

### 자연 vs 개입 진화의 설계 방향

```
자연 진화 (intervention_flag: false):
→ hidden_opportunity를 극단적으로 활용
→ 위협 자체를 에너지/능력으로 전환하는 급진적 변화
→ 부모의 핵심 정체성이 크게 변할 수 있음
→ adaptation_score 편차 큼 (20~95)
→ 서사 톤: "빛을 포기한 자만이 어둠에서 살아남는다"

개입 진화 (intervention_flag: true):
→ 안정화된 환경에서 기존 특성 유지하며 점진 적응
→ 정체성 보존되지만 야생적 잠재력 제한
→ intervention_cost에 의해 특정 가능성 차단
→ adaptation_score 중간 범위 (40~75)
→ 서사 톤: "보호받은 꽃은 아름답지만 폭풍을 모른다"
```

---

## P-6. chaos_level 시스템

### chaos_level 결정

```jsx
function getChaosLevel(generation, previousTrialSurvived) {
  let base = Math.min(generation, 5);
  if (previousTrialSurvived) base = Math.min(base + 0.5, 5);
  return Math.round(base);
}
```

### chaos_level별 특성

| Level | instability 범위 | 극단값 축 수 | 환경 성격                            | 예시 이미지               |
| ----- | ---------------- | ------------ | ------------------------------------ | ------------------------- |
| 1     | 40~55            | 1~2개        | 입문. 위협 명확, 대응 쉬움           | "안개 낀 습지"            |
| 2     | 50~65            | 2개          | 위협 뚜렷, 기회도 보임               | "산성 안개"               |
| 3     | 60~80            | 2~3개        | 복합 위협. 하나 해결해도 나머지 남음 | "화산재 + 산성비"         |
| 4     | 70~90            | 3개          | 가혹함. 생존 자체가 도전             | "항성 플레어 + 대기 손실" |
| 5     | 85~100           | 3~4개        | 대멸종급. 극단적 진화만이 살길       | "연쇄 붕괴"               |

---

## P-7. 환경 시각화 매핑 (프론트엔드 참고)

AI 응답의 `visual_tone`과 `env_tags`를 활용하여 배경을 동적으로 변경합니다.

### 배경 레이어 구성

```
Layer 1 (최하단): 그라데이션 배경 ← visual_tone.primary_color
Layer 2:         CSS 이펙트     ← env_tags
Layer 3:         캐릭터 이미지   ← Gemini 생성
Layer 4 (최상단): UI 오버레이    ← 이름, 스탯, 3축 게이지
```

### env_tags → CSS 이펙트 예시 매핑

```jsx
const tagEffects = {
  acidic: "hue-rotate yellow-green + drip particle effect",
  corrosive_fog: "animated fog overlay + low visibility",
  frozen: "frost border + blue tint + breath particles",
  volcanic: "bottom lava glow + heat shimmer + ember particles",
  irradiated: "chromatic aberration + purple flicker",
  submerged: "blue overlay + floating particles + light caustics",
  desiccated: "crack texture overlay + desaturation",
  parasitic: "vine/tendril border animation + pink pulse",
  zero_gravity: "slow floating particles + star field",
  seismic: "periodic screen shake + crack overlay",
};
```

---

## P-8. 전체 데이터 흐름 요약

```
[1] 생명체 생성 (Gemini 텍스트 + 이미지)
    └→ creature 객체

[2] 환경 생성 프롬프트 호출
    입력: creature + chaos_level + (이전 환경)
    출력: environment 객체 (8축 + 서사 + 시각 + 기회)
    │
    ├→ 코드: 8축 → 3축 변환 → UI에 3축 게이지 표시
    ├→ 코드: visual_tone + env_tags → 배경 이펙트
    ├→ 코드: modifiable_axes → 개입 버튼 활성화
    └→ 모달 팝업: narrative + sensory + 관찰/개입 선택

[3] 플레이어 선택 (모달)
    ├→ "관찰한다" → intervention_flag: false
    └→ "⚡/🛡️/🫧 개입" → intervention_flag: true, axis 지정

[4] 진화 프롬프트 호출
    입력: creature + environment + hidden_opportunity + intervention 정보
    ├→ 항상: 자연 진화 결과 생성
    └→ 개입 시: 개입 진화 결과 추가 생성

[5] 비교 → 경로 선택 → 시련 → 에필로그
```

---

## P-9. 체크리스트

### 환경 생성 결과 검증

**구조:**

- [ ] 8축 중 2~3개 극단값?
- [ ] 극단값들이 cascading_cause에서 논리적으로 연결?
- [ ] modifiable_axes가 실제 극단값 축 포함?
- [ ] instability_index가 chaos_level 범위 안?

**서사:**

- [ ] threat_detail이 생명체의 specific 약점 언급?
- [ ] hidden_opportunity가 위협의 "뒤집기" 제안?
- [ ] intervention_cost가 의미 있는 트레이드오프?
- [ ] narrative에 감각 묘사 포함?
- [ ] event_name이 시적이고 직관적? ("고온"❌ "유리비"✅)

**게임성:**

- [ ] 100% 치명적이지 않음? (생존 가능성 열림)
- [ ] 너무 쉽지 않음? (instability ≥ 40)
- [ ] 관찰/개입 모두 의미 있는 결과 가능?
- [ ] 이전 환경과 충분히 다른 유형?

### 프롬프트 수정 시 주의사항

- 시스템 프롬프트의 CORE DESIGN RULES 6개는 변경하지 마세요. 게임의 핵심 밸런스입니다.
- DIVERSITY GUIDANCE에 새 환경 유형 추가는 자유롭게 가능합니다.
- chaos_level 범위는 게임 테스트 후 조정하세요.
- 8축 변수의 단계(5단계)를 늘리거나 줄이면 변환 로직도 수정해야 합니다.
