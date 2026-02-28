import { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import type { PhysicsBodySnapshot, CreaturePosition, PhysicsCommand } from './types';

const { Engine, Bodies, Body, Composite } = Matter;

export const CANVAS = { width: 840, height: 640 };
export const PLANET_R = 6000;
export const PLANET_CENTER = { x: 420, y: 6300 };
const CREATURE_R = 42;
const MAX_CREATURE_SPEED = 5; // px per physics step — keeps creature visible

// ── Seeded wobble for stable doodly shapes ─────────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function wobblyCirclePath(r: number, seed = 1, points = 10, intensity = 0.22): string {
  const rng = seededRandom(seed);
  return (
    Array.from({ length: points }, (_, i) => {
      const angle = (i / points) * Math.PI * 2;
      const wobble = r * (1 - intensity + rng() * intensity * 2);
      const x = Math.cos(angle) * wobble;
      const y = Math.sin(angle) * wobble;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ') + ' Z'
  );
}

export function wobblyRectPath(w: number, h: number, seed = 1): string {
  const rng = seededRandom(seed);
  const j = () => (rng() - 0.5) * 4.5;
  const hw = w / 2,
    hh = h / 2;
  return `M${-hw + j()},${-hh + j()} L${hw + j()},${-hh + j()} L${hw + j()},${hh + j()} L${-hw + j()},${hh + j()} Z`;
}

// ── Hook ────────────────────────────────────────────────────
export function usePhysicsWorld(isDead = false) {
  const engineRef = useRef<Matter.Engine | null>(null);
  const creatureRef = useRef<Matter.Body | null>(null);
  const [bodies, setBodies] = useState<PhysicsBodySnapshot[]>([]);
  const [creaturePos, setCreaturePos] = useState<CreaturePosition>({
    x: PLANET_CENTER.x,
    y: PLANET_CENTER.y - PLANET_R - CREATURE_R,
    angle: 0,
  });
  const windRef = useRef({ x: 0, y: 0 });
  const gravityRef = useRef(0.003);
  const isDeadRef = useRef(isDead);
  isDeadRef.current = isDead;

  useEffect(() => {
    const engine = Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
    engineRef.current = engine;

    const planet = Bodies.circle(
      PLANET_CENTER.x,
      PLANET_CENTER.y,
      PLANET_R,
      { isStatic: true, label: 'planet', friction: 1, frictionStatic: 10, restitution: 0 },
      80,
    );

    const creature = Bodies.circle(
      PLANET_CENTER.x,
      PLANET_CENTER.y - PLANET_R - CREATURE_R - 2,
      CREATURE_R,
      {
        label: 'creature',
        density: 0.004,
        friction: 1,
        restitution: 0.02,
        frictionAir: 0.08,
      },
    );
    creatureRef.current = creature;

    Composite.add(engine.world, [planet, creature]);

    let raf: number;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min(now - last, 33);
      last = now;

      const dynamicBodies = Composite.allBodies(engine.world).filter((b) => !b.isStatic);

      // Radial gravity — pull everything toward planet center
      const G = gravityRef.current;
      for (const b of dynamicBodies) {
        const dx = PLANET_CENTER.x - b.position.x;
        const dy = PLANET_CENTER.y - b.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          const force = G * b.mass;
          Body.applyForce(b, b.position, {
            x: (dx / dist) * force,
            y: (dy / dist) * force,
          });
        }
      }

      // Upright torque — keep creature oriented "head up" relative to planet surface
      if (!isDeadRef.current) {
        const cr = creatureRef.current!;
        const dx = cr.position.x - PLANET_CENTER.x;
        const dy = cr.position.y - PLANET_CENTER.y;
        // Desired angle: radially outward from planet center
        const desiredAngle = Math.atan2(dx, -dy);
        let angleDiff = desiredAngle - cr.angle;
        // Normalize to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        // Gentle corrective torque — low strength to avoid vibration, high damping to settle
        const UPRIGHT_STRENGTH = 0.03;
        const UPRIGHT_DAMPING = 0.92;
        Body.setAngularVelocity(
          cr,
          cr.angularVelocity * UPRIGHT_DAMPING + angleDiff * UPRIGHT_STRENGTH,
        );
      }

      // Apply wind
      const wind = windRef.current;
      if (wind.x !== 0 || wind.y !== 0) {
        for (const b of dynamicBodies) {
          Body.applyForce(b, b.position, wind);
        }
      }

      Engine.update(engine, dt);

      // Clamp creature velocity so it doesn't fly off
      {
        const cv = creatureRef.current!.velocity;
        const speed = Math.sqrt(cv.x * cv.x + cv.y * cv.y);
        if (speed > MAX_CREATURE_SPEED) {
          const s = MAX_CREATURE_SPEED / speed;
          Body.setVelocity(creatureRef.current!, { x: cv.x * s, y: cv.y * s });
        }
      }

      // Surface constraint — prevent creature from tunneling into the planet
      {
        const cr = creatureRef.current!;
        const dx = cr.position.x - PLANET_CENTER.x;
        const dy = cr.position.y - PLANET_CENTER.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = PLANET_R + CREATURE_R;
        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          Body.setPosition(cr, {
            x: PLANET_CENTER.x + nx * minDist,
            y: PLANET_CENTER.y + ny * minDist,
          });
          const vDot = cr.velocity.x * nx + cr.velocity.y * ny;
          if (vDot < 0) {
            Body.setVelocity(cr, {
              x: cr.velocity.x - vDot * nx,
              y: cr.velocity.y - vDot * ny,
            });
          }
        }
      }

      // Hard boundary — creature stays within visible area (±margin around canvas)
      {
        const cr = creatureRef.current!;
        const MARGIN = 60;
        const clampedX = Math.max(-MARGIN, Math.min(CANVAS.width + MARGIN, cr.position.x));
        if (cr.position.x !== clampedX) {
          // Recalculate Y to stay on planet surface at clamped X
          const dx = clampedX - PLANET_CENTER.x;
          const surfaceY = PLANET_CENTER.y - Math.sqrt(Math.max(0, (PLANET_R + CREATURE_R) ** 2 - dx * dx));
          Body.setPosition(cr, { x: clampedX, y: surfaceY });
          Body.setVelocity(cr, { x: 0, y: cr.velocity.y });
        }
      }

      // Cleanup — remove bodies that drifted too far
      for (const b of dynamicBodies) {
        if (b.label === 'creature') continue;
        const dx = b.position.x - PLANET_CENTER.x;
        const dy = b.position.y - PLANET_CENTER.y;
        if (dx * dx + dy * dy > (PLANET_R + 600) * (PLANET_R + 600)) {
          Composite.remove(engine.world, b);
        }
      }

      // Creature position
      const c = creatureRef.current!;
      setCreaturePos({ x: c.position.x, y: c.position.y, angle: c.angle });

      // Snapshot other dynamic bodies
      const snap: PhysicsBodySnapshot[] = Composite.allBodies(engine.world)
        .filter((b) => !b.isStatic && b.label !== 'creature')
        .map((b) => ({
          id: b.id,
          label: b.label,
          x: b.position.x,
          y: b.position.y,
          angle: b.angle,
          ...(b.plugin as Record<string, unknown>),
        })) as PhysicsBodySnapshot[];
      setBodies(snap);

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  // ── Command dispatcher ───────────────────────────────────
  const dispatch = useCallback((cmd: PhysicsCommand): number | null => {
    const engine = engineRef.current;
    if (!engine) return null;

    switch (cmd.type) {
      case 'addBody': {
        const x = cmd.x ?? 100 + Math.random() * (CANVAS.width - 200);
        const y = cmd.y ?? 50 + Math.random() * 80;
        let body: Matter.Body;

        switch (cmd.bodyType) {
          case 'ball': {
            const r = cmd.radius ?? 8 + Math.random() * 10;
            body = Bodies.circle(x, y, r, {
              label: 'ball',
              restitution: 0.3,
              friction: 0.8,
              frictionAir: 0.02,
              plugin: { radius: r, variant: 'ball', seed: Math.floor(Math.random() * 9999) },
            });
            break;
          }
          case 'crate': {
            const s = cmd.size ?? 18 + Math.random() * 14;
            body = Bodies.rectangle(x, y, s, s, {
              label: 'crate',
              restitution: 0.05,
              friction: 0.9,
              frictionAir: 0.02,
              plugin: { width: s, height: s, variant: 'crate', seed: Math.floor(Math.random() * 9999) },
            });
            break;
          }
          case 'stone':
          default: {
            const r = cmd.radius ?? 10 + Math.random() * 12;
            const sides = 5 + Math.floor(Math.random() * 4);
            body = Bodies.polygon(x, y, sides, r, {
              label: 'stone',
              restitution: 0.05,
              friction: 0.9,
              frictionAir: 0.02,
              plugin: { radius: r, variant: 'stone', seed: Math.floor(Math.random() * 9999) },
            });
            break;
          }
        }

        Composite.add(engine.world, body);
        return body.id;
      }

      case 'removeBody': {
        const target = Composite.allBodies(engine.world).find((b) => b.id === cmd.id);
        if (target && target.label !== 'creature') Composite.remove(engine.world, target);
        break;
      }

      case 'setGravity': {
        if (cmd.scale != null) gravityRef.current = cmd.scale;
        break;
      }

      case 'setWind': {
        windRef.current = { x: cmd.x ?? 0, y: cmd.y ?? 0 };
        break;
      }

      case 'applyForce': {
        const force = { x: cmd.force?.x ?? 0, y: cmd.force?.y ?? 0 };
        if (cmd.target === 'creature') {
          const c = creatureRef.current;
          if (c) Body.applyForce(c, c.position, force);
        } else if (cmd.id) {
          const b = Composite.allBodies(engine.world).find((b) => b.id === cmd.id);
          if (b) Body.applyForce(b, b.position, force);
        } else {
          Composite.allBodies(engine.world)
            .filter((b) => !b.isStatic)
            .forEach((b) => Body.applyForce(b, b.position, force));
        }
        break;
      }

      case 'shake': {
        const intensity = cmd.intensity ?? 0.04;
        Composite.allBodies(engine.world)
          .filter((b) => !b.isStatic)
          .forEach((b) =>
            Body.applyForce(b, b.position, {
              x: (Math.random() - 0.5) * intensity,
              y: -Math.random() * intensity,
            }),
          );
        break;
      }

      case 'clear': {
        Composite.allBodies(engine.world)
          .filter((b) => !b.isStatic && b.label !== 'creature')
          .forEach((b) => Composite.remove(engine.world, b));
        break;
      }
    }
    return null;
  }, []);

  const getWorldParams = useCallback(() => ({
    gravityScale: gravityRef.current,
    wind: { ...windRef.current },
    bodyCount: Composite.allBodies(engineRef.current?.world ?? Matter.Engine.create().world)
      .filter((b) => !b.isStatic && b.label !== 'creature').length,
  }), []);

  return { bodies, creaturePos, dispatch, getWorldParams };
}
