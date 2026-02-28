interface EnvironmentEffectsProps {
  envTags: string[];
  active: boolean;
}

const KNOWN_TAGS = [
  // Original 10
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
  // Atmospheric / Celestial
  'electrical',
  'sandstorm',
  'meteor_shower',
  'solar_flare',
  'pitch_dark',
  'ash_fall',
  // Biological / Ecological
  'fungal_bloom',
  'bioluminescent',
  'toxic_spore',
  'overgrowth',
  // Geological / Physical
  'crystal_growth',
  'magnetic_anomaly',
  'tidal_surge',
  'erosion',
  'high_pressure',
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
