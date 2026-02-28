import type { HistoryEvent } from '../types';

interface HistoryPanelProps {
  history?: HistoryEvent[];
  activeIndex?: number;
}

export default function HistoryPanel({ history = [], activeIndex }: HistoryPanelProps) {
  return (
    <aside className="history">
      <div className="history__header">History</div>
      <div className="history__timeline">
        {history.map((event, i) => (
          <div
            key={i}
            className={`history__node ${i === activeIndex ? 'history__node--active' : ''}`}
          >
            <div className={`history__dot history__dot--${event.type}`} />
            <div className="history__info">
              <div className="history__title">{event.title}</div>
              <div className="history__summary">{event.summary}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
