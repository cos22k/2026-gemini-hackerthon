import type { ActionButton } from '../types';

interface ActionButtonsProps {
  buttons?: ActionButton[];
}

export default function ActionButtons({ buttons = [] }: ActionButtonsProps) {
  return (
    <div className="action-buttons">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          className={`action-btn ${btn.primary ? 'action-btn--primary' : ''}`}
          onClick={btn.onClick}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
