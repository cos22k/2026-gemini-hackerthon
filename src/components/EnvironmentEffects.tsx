interface EnvironmentEffectsProps {
  envTags: string[];
  active: boolean;
}

const KNOWN_TAGS = [
  'acidic',
  'corrosive_fog',
  'frozen',
  'volcanic',
  'irradiated',
  'submerged',
  'desiccated',
  'parasitic',
  'zero_gravity',
  'seismic',
];

export default function EnvironmentEffects({ envTags, active }: EnvironmentEffectsProps) {
  if (!active || envTags.length === 0) return null;

  const activeTags = envTags.filter((tag) => KNOWN_TAGS.includes(tag));

  return (
    <div className={`env-effects ${active ? 'env-effects--active' : ''}`}>
      {activeTags.map((tag) => (
        <div key={tag} className={`effect-layer effect--${tag}`} />
      ))}
    </div>
  );
}
