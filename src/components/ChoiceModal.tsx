import type { Environment } from '../types';

interface ChoiceModalProps {
  environment: Environment;
  interventionUsed?: boolean;
  onObserve: () => void;
  onIntervene?: (variable: string) => void;
}

export default function ChoiceModal({
  environment,
  interventionUsed = false,
  onObserve,
  onIntervene,
}: ChoiceModalProps) {
  const { eventName, pressure, oxygen, temperature, instabilityIndex, narrative, threatDetail } =
    environment;

  const paramColor = (val: string) =>
    val === 'low' ? 'modal__param-value--low' : val === 'high' ? 'modal__param-value--high' : 'modal__param-value--normal';

  const paramLabel = (val: string) =>
    val === 'low' ? 'LOW' : val === 'high' ? 'HIGH' : 'N';

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal__event-name">{eventName}</h2>
        <div className="modal__instability">불안정 지수 {instabilityIndex}</div>

        <p className="modal__narrative">{narrative}</p>

        <div className="modal__params">
          <div className="modal__param">
            <span className="modal__param-label">기압</span>
            <span className={`modal__param-value ${paramColor(pressure)}`}>
              {paramLabel(pressure)}
            </span>
          </div>
          <div className="modal__param">
            <span className="modal__param-label">산소</span>
            <span className={`modal__param-value ${paramColor(oxygen)}`}>
              {paramLabel(oxygen)}
            </span>
          </div>
          <div className="modal__param">
            <span className="modal__param-label">온도</span>
            <span className={`modal__param-value ${paramColor(temperature)}`}>
              {paramLabel(temperature)}
            </span>
          </div>
        </div>

        <div className="modal__threat">
          <span>&#9888;</span>
          <span>{threatDetail}</span>
        </div>

        <div className="modal__divider" />

        <button className="modal__observe-btn" onClick={onObserve}>
          &#128065; 관찰한다
        </button>

        <div className={`modal__intervene ${interventionUsed ? 'modal__intervene--disabled' : ''}`}>
          <div className="modal__intervene-label">&#9889; 개입한다 (1회 제한)</div>
          <div className="modal__intervene-buttons">
            <button className="modal__var-btn" onClick={() => onIntervene?.('pressure')}>
              &#11015;&#65039; 기압
            </button>
            <button className="modal__var-btn" onClick={() => onIntervene?.('oxygen')}>
              &#129707; 산소
            </button>
            <button className="modal__var-btn" onClick={() => onIntervene?.('temperature')}>
              &#127777;&#65039; 온도
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
