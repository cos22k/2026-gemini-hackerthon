interface StatBarProps {
  stat: string;
  value: number;
  max?: number;
}

const LABELS: Record<string, string> = {
  hp: 'HP',
  adaptability: '적응',
  resilience: '회복',
  structure: '구조',
};

export default function StatBar({ stat, value, max = 100 }: StatBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="stat-bar">
      <span className="stat-bar__label">{LABELS[stat] ?? stat}</span>
      <div className="stat-bar__track">
        <div
          className={`stat-bar__fill stat-bar__fill--${stat}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="stat-bar__value">{value}</span>
    </div>
  );
}
