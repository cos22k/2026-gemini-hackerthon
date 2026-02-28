interface CreatureSVGProps {
  name?: string;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function hslFromHash(hash: number, offset = 0): string {
  const h = (hash + offset * 60) % 360;
  const s = 40 + (hash % 30);
  const l = 30 + (hash % 20);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export default function CreatureSVG({ name = 'unknown' }: CreatureSVGProps) {
  const h = hashCode(name);
  const c1 = hslFromHash(h, 0);
  const c2 = hslFromHash(h, 2);
  const c3 = hslFromHash(h, 4);
  const petals = 5 + (h % 4);
  const size = 60 + (h % 30);

  return (
    <svg className="creature-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`grad-${h}`}>
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r={size} fill={`url(#grad-${h})`} opacity="0.3" />
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (360 / petals) * i;
        const rx = 15 + (h % 10);
        const ry = 30 + (h % 20);
        return (
          <ellipse
            key={i}
            cx="100"
            cy="100"
            rx={rx}
            ry={ry}
            fill={c3}
            opacity="0.5"
            transform={`rotate(${angle} 100 100) translate(0 -${size * 0.6})`}
          />
        );
      })}
      <circle cx="100" cy="100" r={16 + (h % 8)} fill={c1} />
      <circle cx="100" cy="100" r={8 + (h % 4)} fill={c2} opacity="0.8" />
    </svg>
  );
}
