# 테라리움 에코 (Terrarium Echo) — 기획 문서 v2

> "AI를 이용해 '선택 가능한 신'이 아니라 '관찰하는 창조자'를 만들었습니다."

---

## 변경 이력

| 버전   | 변경 내용                                         |
| ------ | ------------------------------------------------- |
| v1     | 초기 기획 (관찰/개입 분기 구조)                   |
| **v2** | **개입 메카닉 제거 → 합성 기반 성장 루프로 전환** |

### v2 핵심 변경 사항

- **"관찰 vs 개입" 선택 모달 삭제** — 근거 없는 선택은 재미가 없음
- **코어 루프를 "합성 → 진화 → 시련 → 보상(추가 합성)" 으로 변경** — 플레이어의 선택이 합성 단계에 집중
- **환경 변동은 완전 자동** — AI가 알아서 만들고, 알아서 진화시킴. 플레이어는 관전
- **시련이 긴장감의 핵심** — "내가 키운 애가 살아남을까?"의 관전 재미
- **시련 통과 시 "추가 합성" 보상** — 개입 대신 합성이라는 핵심 메카닉을 재활용

---

## 1. 프로젝트 개요

키워드 2개로 생명체 합성 → AI가 환경을 만들고 자동 진화 → 시련 판정 → 생존 시 추가 합성으로 강화 → 더 강한 시련…

### 기술 스택

- 프론트엔드: React (Vite)
- AI: Gemini 2.0 Flash (텍스트) + Gemini 이미지 생성 (캐릭터)
- 배포: Vercel 또는 로컬

---

## 2. 게임 루프

### 이전 (v1) — 삭제됨

```
키워드 → 생명체 → 환경 → [관찰 vs 개입] → 비교 → 시련 → 끝
                            ↑ 문제: 근거 없는 선택
```

### 현재 (v2)

```
[1] 창조         키워드 2개 → 생명체 합성 (텍스트 + 이미지)
     ↓
[2] 환경 변동     AI가 자동 생성 (플레이어 조작 없음)
     ↓
[3] 자동 진화     AI가 환경에 맞춰 자동으로 진화 (관전)
     ↓
[4] 시련         AI가 시련 생성 → 생존/멸종 판정
     ↓
    ┌─ 멸종 → [6] 에필로그
    └─ 생존 → [5] 보상: 추가 합성
                   ↓
              새 키워드 1개 입력 → 기존 생명체 + 새 물질 합성
                   ↓
              강화된 생명체로 [2]로 복귀 (더 높은 chaos_level)
```

### 왜 이 구조가 더 나은가

1. **코어 루프가 명확함** — "합성 → 키움 → 시련 → 보상"이 직관적
2. **선택 포인트가 합성에 집중** — "뭘 합칠지"는 근거 있는 선택 (키워드의 의미를 고민)
3. **시련이 진짜 긴장감** — 개입은 근거 없는 클릭이었지만, 시련은 "내가 키운 애가 살아남을까?"의 관전 재미
4. **데모 임팩트** — "합성 → 진화 → 시련 통과 → 더 강해짐"의 성장 서사가 3분 데모에 적합
5. **합성 메카닉 재활용** — 추가 합성이 보상이 되면서 코어 메카닉의 깊이가 생김

---

## 3. 화면 구성

### Screen 1 — 인트로 (풀스크린)

```
┌──────────────────────────────────────┐
│                                      │
│              🌱                      │
│          테라리움 에코                 │
│         TERRARIUM ECHO               │
│                                      │
│     두 개의 키워드로 생명을 창조하세요    │
│     자연이 스스로 진화합니다             │
│     당신은 관찰하고, 합성합니다          │
│                                      │
│     [키워드 1]    [키워드 2]           │
│                                      │
│            [ 생명 창조 ]              │
│                                      │
└──────────────────────────────────────┘
```

- 키워드 2개 입력 → "생명 창조" 버튼
- 로딩 시: 중앙 애니메이션 + 텍스트 ("생명의 씨앗을 심는 중…")

### Screen 2 — 메인 (그리드 2:1)

```
┌────────────────────────────┬─────────────┐
│                            │             │
│   ┌────────────────────┐   │  히스토리     │
│   │                    │   │  패널       │
│   │   배경 영역          │   │             │
│   │   (환경에 따라 변화)   │   │  ● 탄생     │
│   │                    │   │  "페로솔라..." │
│   │    ┌──────────┐    │   │             │
│   │    │ 캐릭터    │    │   │  ● 환경변동   │
│   │    │ 이미지    │    │   │  "부식의안개" │
│   │    │          │    │   │             │
│   │    └──────────┘    │   │  ● 진화      │
│   │                    │   │  "점액종..."  │
│   └────────────────────┘   │             │
│                            │  ● 시련      │
│   [생명체 이름 / 세대 / 스탯] │  "산성비..."  │
│                            │             │
│   ⚡에너지 ██░░  💀물리 ███░   │  ● 합성      │
│   🫧순도 █░░░               │  "+수정 합성" │
│                            │             │
└────────────────────────────┴─────────────┘
       약 2/3 영역                약 1/3 영역
```

### 좌측 (2/3) — 메인 스테이지

**레이어 구조 (뒤에서 앞으로):**

1. 배경 레이어: 환경에 따라 변하는 배경 (색상/그라데이션/이펙트)
2. 캐릭터 레이어: Gemini가 생성한 이미지 (중앙 배치)
3. UI 오버레이: 하단에 이름, 세대, 스탯, 3축 게이지 표시

**상태별 변화:**

| 페이즈          | 메인 스테이지 표시                  | 하단 액션               |
| --------------- | ----------------------------------- | ----------------------- |
| 탄생            | 캐릭터 등장 + 탄생 독백             | [다음] (자동 진행 가능) |
| 환경 변동       | 배경 변화 + 환경 정보 팝업          | 자동 진행 (관전)        |
| 자동 진화       | 캐릭터 이미지 모프/전환 + 진화 서사 | [다음]                  |
| 시련            | 시련 이펙트 + 내러티브              | 자동 판정 → 결과        |
| 생존 → 합성     | 축하 연출 + 합성 UI                 | [키워드 입력] + [합성]  |
| 멸종 → 에필로그 | 최후 연출 + 에필로그 서사           | [새로운 생명 창조]      |

### 환경 변동 팝업 (관전용 — 선택 없음)

v1에서는 "관찰 vs 개입" 선택 모달이었지만, v2에서는 **정보 표시용 팝업**으로 변경.
플레이어는 환경 변동을 지켜보기만 함.

```
┌─────────────────────────────────┐
│  (배경 딤 처리)                   │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │  🌪 부식의 안개              │  │
│  │  불안정 지수 62              │  │
│  │                           │  │
│  │  "지하에서 분출된 황산 가스가   │  │
│  │   대기 중 수분과 결합하며..."  │  │
│  │                           │  │
│  │  ⚡에너지 HIGH  💀물리 NORMAL │  │
│  │  🫧순도 CRITICAL            │  │
│  │                           │  │
│  │  👁 눈: 노르스름한 안개가...   │  │
│  │  👂 귀: 금속이 산화되며...    │  │
│  │  ✋ 촉: 안개 방울이 따끔...    │  │
│  │                           │  │
│  │  ⚠ 금속 세포벽이 산성 안개에   │  │
│  │    직접 부식될 수 있다        │  │
│  │                           │  │
│  │       [ 진화를 지켜본다 ]     │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

버튼은 **"진화를 지켜본다"** 하나만. 클릭하면 팝업 닫히고 자동 진화 진행.

### 추가 합성 UI (시련 생존 보상)

시련을 통과하면 "추가 합성" 기회를 얻음.

```
┌─────────────────────────────────┐
│                                 │
│  🎉 시련을 이겨냈습니다!          │
│                                 │
│  새로운 물질과 합성할 수 있습니다   │
│                                 │
│  현재 생명체: 페로-솔라리스 점액종  │
│                                 │
│     [ 새 키워드 입력 ]            │
│     예: "수정", "번개", "이끼"    │
│                                 │
│     [ 합성하기 ]                 │
│                                 │
│  ─── 또는 ───                   │
│                                 │
│  [ 합성 없이 계속 진행 ]          │
│                                 │
└─────────────────────────────────┘
```

- 키워드 1개 입력 → 기존 생명체 + 새 물질을 합성
- "합성 없이 계속"도 가능 (다음 라운드로 직행)
- 합성하면 생명체가 변이되고 새로운 특성/외형을 얻음

### 우측 (1/3) — 히스토리 패널

세로 타임라인 형태. 각 이벤트가 노드로 쌓임.

```
히스토리 노드 타입:
● 초록  — 탄생    (이름 + "키워드1 × 키워드2")
● 앰버  — 환경변동  (이벤트 이름 + 요약)
● 보라  — 진화    (새 이름 + 핵심 변화)
● 검정  — 시련    (시련 종류 + 생존/멸종)
● 금색  — 합성    ("+키워드3" + 변이 요약)
```

---

## 4. 필요한 API 호출

### 4-1. Gemini 텍스트 생성

**엔드포인트:**

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}
```

**요청 형식:**

```json
{
  "system_instruction": {
    "parts": [{ "text": "시스템 프롬프트" }]
  },
  "contents": [{ "parts": [{ "text": "유저 프롬프트" }] }],
  "generation_config": {
    "temperature": 0.9,
    "top_p": 0.95,
    "max_output_tokens": 1200
  }
}
```

**응답에서 텍스트 추출:**

```jsx
data.candidates[0].content.parts[0].text;
```

**호출 시점 (1라운드 기준):**

| 순서 | 호출        | 비고             |
| ---- | ----------- | ---------------- |
| 1    | 생명체 생성 | 초기 합성        |
| 2    | 환경 생성   | 자동             |
| 3    | 자동 진화   | 환경 기반        |
| 4    | 시련 판정   | 생존/멸종        |
| 5    | (추가 합성) | 시련 생존 시에만 |

2라운드 이후: 2→3→4→(5) 반복. 총 라운드당 3~4회 호출.

### 4-2. Gemini 이미지 생성

**옵션 A — Gemini 2.0 Flash (네이티브 이미지 생성)**

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key={API_KEY}
```

```json
{
  "contents": [{ "parts": [{ "text": "이미지 프롬프트" }] }],
  "generation_config": {
    "response_modalities": ["TEXT", "IMAGE"]
  }
}
```

**옵션 B — Imagen API**

```
POST https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key={API_KEY}
```

**호출 시점:**

| 순서 | 이미지        | 비고         |
| ---- | ------------- | ------------ |
| 1    | 초기 생명체   | 탄생 시      |
| 2    | 진화체        | 환경 적응 후 |
| 3    | (합성 변이체) | 추가 합성 시 |

**폴백:** 이미지 생성 실패 시 → 프로시저럴 SVG (이름 해시 기반)

### 4-3. 유틸리티

````jsx
function parseJSON(text) {
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  return null;
}

async function callWithRetry(fn, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    const result = await fn();
    if (result) return result;
  }
  return null;
}
````

---

## 5. 프롬프트 설계

### 5-1. 생명체 생성 프롬프트

**역할:** 키워드 2개를 융합하여 가상 식물형 생명체를 창조

**시스템 프롬프트:**

```
You are an evolutionary simulation engine.
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
- image_prompt는 영어로, "digital art, fantasy creature, botanical illustration" 스타일 키워드 포함
```

**유저 프롬프트:**

```
키워드: "{keyword1}" + "{keyword2}"
```

### 5-2. 환경 자동 생성 프롬프트

**역할:** 생명체가 서식하는 행성에서 환경 변동을 자동 생성. 플레이어 관여 없음.

> 상세 스펙은 **환경 시스템 완전 가이드** 문서의 P-3 참조.
> 아래는 v2에서 달라진 핵심만 명시.

**v2 변경사항:**

- `modifiable_axes` 필드 **삭제** — 개입 없으므로 불필요
- `intervention_cost` 필드 **삭제** — 개입 없으므로 불필요
- `hidden_opportunity`는 **유지** — 자동 진화에서 이 필드를 활용해 진화 방향 결정
- 시스템 프롬프트의 CORE DESIGN RULES에서 "INTERVENTION COST" 규칙 **삭제**

**수정된 시스템 프롬프트:**

```
You simulate extreme planetary environments for a fictional evolution game.

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
  "event_name": "한글 2~5글자. 시적이고 직관적.",
  "cascading_cause": "이 환경 변화의 근본 원인 1문장.",
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
```

**유저 프롬프트 템플릿:**

```
생명체: {name}
종: {species}
특성: {traits 나열}
약점: {vulnerabilities 나열}
에너지 전략: {energy_strategy}
현재 스탯: HP {hp}, 적응력 {adaptability}, 회복력 {resilience}, 구조 {structure}
세대: {generation}
chaos_level: {1~5}

{이전 환경 있으면}
이전 환경: {previous_event_name}
이전 위협: {previous_threat_detail}
이전 진화 결과: {획득/상실 특성 요약}

{추가 합성 있었으면}
합성 이력: {합성 키워드} 합성으로 {획득 특성} 획득
```

### 5-3. 진화 생성 프롬프트

**역할:** 환경에 대한 자동 진화 결과 생성. v2에서는 항상 자연 진화만 생성.

**v2 변경사항:**

- `intervention_flag` 관련 로직 **전부 삭제**
- 자연 진화 1개만 생성 (비교 모드 없음)
- `hidden_opportunity`를 적극 활용하여 진화 방향 결정

**시스템 프롬프트:**

```
You are an evolution engine.
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
- 부모의 어떤 흔적이 남아있는지 evolution_summary에 언급
```

**유저 프롬프트:**

```
부모: {name}
특성: {traits 나열}
약점: {vulnerabilities 나열}
에너지 전략: {energy_strategy}
스탯: HP {hp}, 적응력 {adaptability}, 회복력 {resilience}, 구조 {structure}

환경: {event_name}
원인: {cascading_cause}
8축 변수: {env_variables 전체}
위협: {threat_detail}
숨겨진 기회: {hidden_opportunity}
```

### 5-4. 시련 판정 프롬프트

**역할:** 진화된 생명체가 시련에 직면. 특성 vs 약점 기반 논리 판정.

**v2 변경사항:**

- 시련 종류 확장 (환경 기반 자동 생성)
- 시련 내용이 이전 환경과 연관되도록 유도
- 생존 시 "다음 합성에 도움이 되는 힌트" 추가

**시스템 프롬프트:**

```
You judge whether a creature survives a trial.
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
- synthesis_hint는 너무 직접적이지 않게, 은유적으로 (예: "더 유연한 무언가가 필요하다")
```

**유저 프롬프트:**

```
생명체: {name}
특성: {traits 나열}
약점: {vulnerabilities 나열}
에너지 전략: {energy_strategy}
스탯: HP {hp}, 적응력 {adaptability}, 회복력 {resilience}, 구조 {structure}
세대: {generation}

이전 환경: {event_name}
환경 위협: {threat_detail}

chaos_level: {1~5}
```

시련의 종류와 난이도는 AI가 chaos_level과 이전 환경을 기반으로 자동 결정.

### 5-5. 추가 합성 프롬프트 (NEW)

**역할:** 시련 생존 후, 기존 생명체에 새로운 키워드를 합성하여 강화.

**시스템 프롬프트:**

```
You are an evolutionary fusion engine.
A creature that survived a trial is now fused with a new material/concept.
The fusion should create meaningful new abilities while respecting the creature's history.

Write in Korean. Respond ONLY with valid JSON.

Output schema:
{
  "new_name": "합성 후 이름. 기존 이름의 변형 + 새 물질 반영.",
  "fusion_narrative": "합성 과정 2~3줄. 새 물질이 기존 생명체에 어떻게 스며드는지.",
  "new_traits": ["합성으로 획득한 새 특성 1~2개"],
  "modified_vulnerabilities": ["기존 약점이 어떻게 변했는지. 약점이 사라지거나 새 약점으로 교체될 수 있음."],
  "energy_strategy": "합성 후 에너지 전략 (변경됐을 수도, 유지됐을 수도)",
  "stat_changes": {
    "hp": 변화량,
    "adaptability": 변화량,
    "resilience": 변화량,
    "structure": 변화량
  },
  "fusion_line": "합성을 한 줄로 표현. 시적.",
  "image_prompt": "합성 후 생명체의 영어 이미지 프롬프트."
}

규칙:
- 새 키워드의 물리적 속성과 상징적 의미 모두 반영
- 기존 특성을 완전히 덮어쓰지 않음. 기존 흔적이 남아야 함.
- 합성으로 기존 약점 1개가 해소될 수 있지만, 새로운 약점이 생길 수도 있음.
- stat_changes 합계는 약간 양수 (+5~+15). 합성은 보상이므로 순이득이 있어야 함.
- 하지만 큰 이득이면 큰 약점도 동반.
```

**유저 프롬프트:**

```
기존 생명체: {name}
특성: {traits 나열}
약점: {vulnerabilities 나열}
에너지 전략: {energy_strategy}
스탯: HP {hp}, 적응력 {adaptability}, 회복력 {resilience}, 구조 {structure}
세대: {generation}

시련 생존 결과: {damage_or_mutation}
합성 힌트: {synthesis_hint}

새 키워드: "{new_keyword}"
```

### 5-6. 이미지 생성 프롬프트 (공통)

**기본 구조:**

```
[생명체 외형 묘사], [질감/재질], [환경적 맥락],
[아트 스타일 키워드], [조명/분위기], [배경]
```

세대 간 시각적 연속성을 위해 모든 이미지 프롬프트 끝에:
`"same art style, consistent universe, digital art, fantasy botanical illustration"`

---

## 6. 환경 시스템 (8축 → 3축)

> 상세 내용은 **환경 시스템 완전 가이드** 문서 참조

### 아키텍처

```
AI 내부: 8축 변수 (temperature, pressure, atmosphere, radiation,
                  gravity, solvent, luminosity, tectonics)
    ↓ 변환 로직
플레이어 UI: 3축 (⚡에너지 / 💀물리 / 🫧순도)
```

### 3축 변환 로직

```jsx
function convertToPlayerAxes(envVars) {
  const severityMap = {
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
    normal: 0,
    stable: 0,
    none: 0,
    dead: 0,
  };

  const s = (key) => severityMap[envVars[key]] || 0;

  const energyScore = s("luminosity") + s("solvent") * 0.5;
  const physicalScore =
    (s("temperature") +
      s("pressure") +
      s("gravity") * 0.7 +
      s("tectonics") * 0.8) /
    2;
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

### 환경 시각화 매핑

```
Layer 1 (최하단): 그라데이션 배경 ← visual_tone.primary_color
Layer 2:         CSS 이펙트     ← env_tags
Layer 3:         캐릭터 이미지   ← Gemini 생성
Layer 4 (최상단): UI 오버레이    ← 이름, 스탯, 3축 게이지
```

```jsx
const tagEffects = {
  acidic: "hue-rotate yellow-green + drip particle",
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

### chaos_level 시스템

```jsx
function getChaosLevel(generation) {
  return Math.min(generation, 5);
}
```

| Level | instability 범위 | 극단값 축 수 | 환경 성격              |
| ----- | ---------------- | ------------ | ---------------------- |
| 1     | 40~55            | 1~2개        | 입문. 위협 명확        |
| 2     | 50~65            | 2개          | 위협 뚜렷, 기회도 보임 |
| 3     | 60~80            | 2~3개        | 복합 위협              |
| 4     | 70~90            | 3개          | 가혹함                 |
| 5     | 85~100           | 3~4개        | 대멸종급               |

---

## 7. 전체 데이터 흐름

```
[1] 키워드 2개 입력
    └→ 생명체 생성 프롬프트 → creature 객체 + 이미지

[2] 환경 생성 프롬프트
    입력: creature + chaos_level + (이전 환경)
    출력: environment 객체
    │
    ├→ 8축 → 3축 변환 → UI 게이지
    ├→ visual_tone + env_tags → 배경 이펙트
    └→ 환경 팝업 표시 (관전용)

[3] 진화 프롬프트
    입력: creature + environment + hidden_opportunity
    출력: evolved creature
    └→ 진화 연출 + 이미지 전환

[4] 시련 프롬프트
    입력: evolved creature + chaos_level
    출력: trial 결과
    │
    ├→ 생존 → [5] 추가 합성
    └→ 멸종 → [6] 에필로그

[5] 추가 합성 (생존 보상)
    입력: evolved creature + 새 키워드
    출력: fused creature
    └→ chaos_level +1 → [2]로 복귀

[6] 에필로그
    └→ 최종 서사 + [새로운 생명 창조] 버튼
```

---

## 8. 상태 관리

```jsx
const gameState = {
  // 현재 단계
  phase:
    "intro" |
    "birth" |
    "environment" |
    "evolving" |
    "trial" |
    "trial_result" |
    "synthesis" |
    "epilogue",

  // 현재 라운드 (1부터 시작, 합성할 때마다 +1)
  round: 1,

  // 생명체
  creature: {
    name,
    species,
    description,
    traits: [],
    vulnerabilities: [],
    energy_strategy: "",
    stats: { hp, adaptability, resilience, structure },
    generation: 1,
    imageUrl: null,
    birthWords: "",
  },

  // 환경 (현재 라운드)
  environment: {
    eventName,
    cascadingCause,
    envVariables: {}, // 8축
    envTags: [],
    instabilityIndex,
    narrative,
    sensory: {},
    threatDetail,
    hiddenOpportunity,
    visualTone: {},
  },

  // 진화 결과 (현재 라운드)
  evolution: null, // 진화 결과 객체

  // 시련 (현재 라운드)
  trial: {
    result: null, // 판정 결과 객체
  },

  // 합성 이력
  synthesisHistory: [
    // { round: 1, keyword: "금속+장미", resultName: "페로-솔라리스" },
    // { round: 2, keyword: "+수정", resultName: "프리즈마-솔라리스" },
  ],

  // 히스토리 (우측 패널용)
  history: [
    // { type: "birth" | "environment" | "evolution" | "trial" | "synthesis",
    //   title, summary, timestamp }
  ],

  // chaos level
  chaosLevel: 1,

  // UI 상태
  loading: false,
  loadingMessage: "",
  modalOpen: false,
};
```

---

## 9. 에러 처리

| 상황             | 처리                                         |
| ---------------- | -------------------------------------------- |
| API 호출 실패    | 2회 재시도 → 실패 시 에러 메시지             |
| JSON 파싱 실패   | ```json 래퍼 제거 후 재파싱 → 실패 시 재호출 |
| 이미지 생성 실패 | 프로시저럴 SVG 폴백                          |
| 이미지 생성 느림 | 텍스트 먼저 표시 → 이미지 비동기 로드        |
| 빈 응답          | 기본값 세팅 후 계속 진행                     |

---

## 10. 데모 시나리오

### 시나리오 1: 1라운드 (기본 플로우)

```
"금속" + "장미" → 페로-솔라리스 탄생
→ 부식의 안개 발생 (관전)
→ 자동 진화: 점액종으로 변이
→ 산성비 시련 → 생존!
→ 추가 합성 기회: "수정" 입력
→ 프리즈마-솔라리스로 강화
→ 2라운드로...
```

### 시나리오 2: 멸종 엔딩

```
"연기" + "나비" → 잿빛날개 탄생
→ 화산폭발 발생
→ 자동 진화: 탄소막 형성
→ 용암폭류 시련 → 멸종
→ 에필로그: "잿빛날개의 마지막 포자가 바람에 실려갔다..."
→ [새로운 생명 창조]
```

### 시나리오 3: 라이브 데모

```
관객이 키워드 직접 제시 → 실시간 생성
→ 환경 변동 → 진화 (관전의 재미)
→ 시련 → "살아남을까?" 긴장감
→ 생존 시 관객이 합성 키워드 제시 → 2라운드
```

---

## 11. 파일 구조

```
/terrarium-echo
├── index.html
├── package.json
├── vite.config.js
├── .env                         ← VITE_GEMINI_API_KEY
├── src/
│   ├── main.jsx
│   ├── App.jsx                  ← 메인 앱 (상태관리 + 페이즈 라우팅)
│   ├── api/
│   │   ├── gemini.js            ← Gemini API 호출 함수
│   │   ├── imageGen.js          ← 이미지 생성 함수
│   │   └── prompts.js           ← 프롬프트 템플릿 모음
│   ├── game/
│   │   ├── gameLoop.js          ← 게임 루프 로직
│   │   ├── environment.js       ← 8축→3축 변환, chaos 계산
│   │   └── stateManager.js      ← 상태 관리
│   ├── components/
│   │   ├── IntroScreen.jsx      ← 인트로 화면 (키워드 입력)
│   │   ├── MainStage.jsx        ← 좌측 메인 스테이지
│   │   ├── HistoryPanel.jsx     ← 우측 히스토리 타임라인
│   │   ├── CreatureCard.jsx     ← 생명체 표시 (이름/스탯/이미지)
│   │   ├── EnvironmentPopup.jsx ← 환경 변동 팝업 (관전용)
│   │   ├── EvolutionView.jsx    ← 진화 결과 표시
│   │   ├── TrialView.jsx        ← 시련 + 판정 결과
│   │   ├── SynthesisView.jsx    ← 추가 합성 UI (NEW)
│   │   ├── EpilogueView.jsx     ← 에필로그 (멸종/완료)
│   │   ├── StatBar.jsx          ← 스탯 바
│   │   ├── ThreatGauge.jsx      ← 3축 위협 게이지
│   │   └── CreatureSVG.jsx      ← SVG 폴백
│   └── styles/
│       └── (디자인 톤 확정 후)
└── public/
```

---

## 12. MVP 체크리스트

### 반드시 구현 (MVP)

- [ ] 키워드 2개 입력 → Gemini 생명체 생성 (텍스트 + 이미지)
- [ ] AI 환경 자동 생성 → 환경 팝업 표시
- [ ] 환경 기반 자동 진화 1회
- [ ] 시련 1회 → 생존/멸종 판정
- [ ] 시련 생존 시 추가 합성 기회 (키워드 1개)
- [ ] 합성 후 2라운드 진행 (환경→진화→시련)
- [ ] 에필로그 (멸종 or 최종 서사)
- [ ] 히스토리 패널

### 시간이 남으면 추가

- [ ] 3라운드 이상 반복 (chaos_level 5까지)
- [ ] 환경 배경 이펙트 (env_tags 기반 CSS)
- [ ] 진화 히스토리 트리 시각화
- [ ] 생명체 도감 (생성된 생명체 컬렉션)
- [ ] 합성 없이 계속 진행 옵션의 차별화된 서사

---

## 13. v1에서 삭제된 항목 (참고용)

아래 항목들은 v1에 있었으나 v2에서 의도적으로 삭제됨.

| 삭제 항목                   | 삭제 이유                                              |
| --------------------------- | ------------------------------------------------------ |
| 관찰 vs 개입 선택 모달      | 근거 없는 선택 → 랜덤 클릭 → 재미 없음                 |
| 자연 vs 개입 좌우 비교 화면 | 개입 없으므로 비교 불필요                              |
| `modifiable_axes` 필드      | 개입할 축이 없음                                       |
| `intervention_cost` 필드    | 개입 비용이 없음                                       |
| `intervention` 상태 객체    | 개입 메카닉 자체가 없음                                |
| `ComparisonView.jsx`        | 비교 화면 없음                                         |
| `ActionButtons.jsx`         | 모달 버튼 → 관전 버튼으로 단순화, 별도 컴포넌트 불필요 |

### 나중에 다시 도입할 수 있는 형태

개입을 나중에 넣는다면 "모달에서 변수 선택"이 아니라 **추가 합성의 확장**으로:

```
시련 통과 → 보상으로 "환경 조절 아이템" 획득
→ 다음 라운드에서 환경 변동 시 아이템 사용 가능
→ 특정 8축 변수 1개를 조절
→ 아이템은 이전 합성 키워드와 연관된 효과
```

이러면 "합성 → 아이템 → 환경 조절"이라는 연결고리가 생겨서 개입에 근거가 생김.
