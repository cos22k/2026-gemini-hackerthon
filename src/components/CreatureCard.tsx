import type { Creature } from '../types';
import StatBar from './StatBar';
import CreatureSVG from './CreatureSVG';

interface CreatureCardProps {
  creature: Creature;
}

export default function CreatureCard({ creature }: CreatureCardProps) {
  const { name, species, description, traits, vulnerabilities, stats, imageUrl } = creature;

  return (
    <div className="creature-card">
      <div className="creature-card__image-wrapper">
        {imageUrl ? (
          <img className="creature-card__image" src={imageUrl} alt={name} />
        ) : (
          <CreatureSVG name={name} />
        )}
      </div>

      <h2 className="creature-card__name">{name}</h2>
      <span className="creature-card__species">{species}</span>
      <p className="creature-card__description">{description}</p>

      <div className="creature-card__traits">
        {traits.map((t) => (
          <span key={t} className="creature-card__trait">{t}</span>
        ))}
        {vulnerabilities.map((v) => (
          <span key={v} className="creature-card__vulnerability">{v}</span>
        ))}
      </div>

      <div className="stage__stats">
        {Object.entries(stats).map(([key, val]) => (
          <StatBar key={key} stat={key} value={val} />
        ))}
      </div>
    </div>
  );
}
