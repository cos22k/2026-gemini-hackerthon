import type { PhysicsBodySnapshot, CreaturePosition, Weather } from './types';

export interface WorldSnapshot {
  bodyCount: number;
  bodies: { type: string; count: number }[];
  creaturePosition: { x: number; y: number };
  gravityScale: number;
  wind: { x: number; y: number };
  weather: Weather;
}

export function serializeWorldState(
  bodies: PhysicsBodySnapshot[],
  creaturePos: CreaturePosition,
  weather: Weather,
  gravityScale: number,
  wind: { x: number; y: number },
): WorldSnapshot {
  const bodyCounts = new Map<string, number>();
  for (const b of bodies) {
    const type = b.variant || b.label;
    bodyCounts.set(type, (bodyCounts.get(type) || 0) + 1);
  }

  return {
    bodyCount: bodies.length,
    bodies: [...bodyCounts.entries()].map(([type, count]) => ({ type, count })),
    creaturePosition: { x: Math.round(creaturePos.x), y: Math.round(creaturePos.y) },
    gravityScale,
    wind,
    weather,
  };
}

export function summarizeWorldForPrompt(snapshot: WorldSnapshot): string {
  const parts: string[] = [];
  if (snapshot.bodyCount > 0) {
    const bodyDesc = snapshot.bodies.map((b) => `${b.type} ${b.count}개`).join(', ');
    parts.push(`행성 위 물체: ${bodyDesc}`);
  }
  if (snapshot.weather !== 'none') {
    parts.push(`날씨: ${snapshot.weather}`);
  }
  if (snapshot.gravityScale !== 0.003) {
    parts.push(`중력: ${snapshot.gravityScale > 0.003 ? '강함' : snapshot.gravityScale < 0 ? '역방향' : '약함'}`);
  }
  return parts.length > 0 ? parts.join('. ') : '행성은 고요하다.';
}
