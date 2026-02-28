# Project Instructions

## Project Plan

Always reference `.claude/shared/project-mvp-plan.md` for the project MVP plan, requirements, and scope.

## Project Overview

**Terrarium Echo (테라리움 에코)** — AI-powered evolutionary simulation game.
Players create lifeforms from 2 keywords, watch AI-driven evolution through environmental challenges, and synthesize new materials on survival.

## Tech Stack

- **Frontend**: React 19 + TypeScript 5.9 + Vite 7.3
- **Physics**: Matter.js 0.20 (doodly SVG rendering style)
- **AI**: Google Generative AI (`@google/genai`) — Gemini 2.5 Flash, structured JSON output
- **Backend**: Firebase 12.10 (Firestore persistence, anonymous auth, analytics)
- **Routing**: React Router 7
- **Styling**: Plain CSS (no CSS-in-JS), Pretendard font (Korean support)

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build (vite build)
npm run lint      # ESLint (flat config, ESLint 9+)
npm run preview   # Preview production build
```

## Project Structure

```
src/
├── api/           # Gemini API calls, prompts, schemas, retry utils
├── game/          # Game logic: types, environment (8→3 axis), physics executor, Firestore persistence
├── world/         # Matter.js physics: WorldScene (SVG), usePhysicsWorld hook, CreatureRenderer
├── components/    # React UI: IntroScreen, MainStage, HistoryPanel, TrialView, SynthesisView, etc.
├── lib/           # Firebase init, auth hooks
├── pages/         # SandboxPage (test environment)
├── styles/        # CSS: global, intro, stage, modal, components, world
├── types.ts       # Global type definitions
├── App.tsx        # Main app: router, game loop, state management
└── main.tsx       # Entry point
```

## Key Conventions

- **Path alias**: `@/*` → `src/*` (configured in tsconfig + vite)
- **Components**: PascalCase filenames (`IntroScreen.tsx`)
- **Hooks/utils**: camelCase (`usePhysicsWorld.ts`, `firestorePersistence.ts`)
- **Types**: PascalCase interfaces. Domain types live in their folder (`game/types.ts`, `world/types.ts`), shared types in `src/types.ts`
- **CSS**: BEM-like with kebab-case (`stage__background`). Organized by concern (global, intro, stage, modal, components, world)
- **Functional React components** with hooks — no class components
- **Korean language** in all game content and UI text; code/comments in English
- **Gemini responses**: Always structured JSON with schema validation (`src/api/schemas.ts`)

## Game Loop (v2)

```
[1] Creation   → 2 keywords → creature (text + image)
[2] Environment → AI auto-generates (no player input)
[3] Evolution   → AI auto-evolves creature (spectate)
[4] Trial       → AI judges survival/extinction
    ├─ Survive → [5] Synthesis reward (new keyword)
    └─ Extinct → [6] Epilogue
```

Phases: `intro → birth → environment → evolving → trial → synthesis/epilogue`

## Environment

- **8-axis internal**: temperature, pressure, atmosphere, radiation, gravity, solvent, luminosity, tectonics
- **3-axis player UI**: Energy, Physical, Purity (converted via `src/game/environment.ts`)
- **chaos_level**: 1–5, scales with generation number

## Important Files

| Purpose | File |
|---------|------|
| Game state & loop | `src/App.tsx` |
| All Gemini API calls | `src/api/gemini.ts` |
| Prompt templates | `src/api/prompts.ts` |
| JSON response schemas | `src/api/schemas.ts` |
| Game types (phases, creatures, etc.) | `src/game/types.ts` |
| Physics world types | `src/world/types.ts` |
| 8→3 axis conversion | `src/game/environment.ts` |
| Firebase config | `src/lib/firebase.ts` |
| Physics scene (SVG) | `src/world/WorldScene.tsx` |

## Environment Variables

```
VITE_GEMINI_API_KEY=...   # Google Generative AI key (via .env)
```

## Error Handling Patterns

- API calls: max 2 retries (`src/api/utils.ts`)
- JSON parsing: strip markdown fences, regex extract `{...}`, then `JSON.parse`
- Image generation: fallback to procedural SVG (`CreatureSVG.tsx`, `CreatureRenderer.tsx`)

## Firestore Schema

```
users/{uid}/sessions/{sessionId}
  ├── createdAt, currentRound, phase, creature
  └── events[] { type, title, timestamp }
```
