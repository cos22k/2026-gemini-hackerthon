import { useState } from 'react';
import type { Creature, TrialResult } from '../types';

interface SynthesisViewProps {
  creature: Creature;
  trial: TrialResult;
  onSynthesize: (keyword: string) => void;
  onSkip: () => void;
}

export default function SynthesisView({ creature, trial, onSynthesize, onSkip }: SynthesisViewProps) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = () => {
    if (keyword.trim()) {
      onSynthesize(keyword.trim());
    }
  };

  return (
    <div className="synthesis">
      <div className="synthesis__header">시련을 이겨냈습니다!</div>
      <p className="synthesis__subtitle">새로운 물질과 합성할 수 있습니다</p>

      <div className="synthesis__creature-info">
        현재 생명체: <strong>{creature.name}</strong>
      </div>

      {trial.synthesisHint && (
        <p className="synthesis__hint">"{trial.synthesisHint}"</p>
      )}

      <div className="synthesis__input-area">
        <input
          className="synthesis__input"
          type="text"
          placeholder='새 키워드 (예: "수정", "번개", "이끼")'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button
          className="synthesis__btn synthesis__btn--primary"
          disabled={!keyword.trim()}
          onClick={handleSubmit}
        >
          합성하기
        </button>
      </div>

      <div className="synthesis__divider">또는</div>

      <button className="synthesis__btn synthesis__btn--secondary" onClick={onSkip}>
        합성 없이 계속 진행
      </button>
    </div>
  );
}
