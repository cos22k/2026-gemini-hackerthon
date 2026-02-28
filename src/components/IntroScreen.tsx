import { useState } from 'react';

interface IntroScreenProps {
  onStart: (k1: string, k2: string) => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const [keyword1, setKeyword1] = useState('');
  const [keyword2, setKeyword2] = useState('');

  const canStart = keyword1.trim() && keyword2.trim();

  const handleStart = () => {
    if (canStart) {
      onStart(keyword1.trim(), keyword2.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canStart) handleStart();
  };

  return (
    <div className="intro">
      <div className="intro__icon">🌱</div>
      <h1 className="intro__title">테라리움 에코</h1>
      <p className="intro__subtitle">Terrarium Echo</p>

      <div className="intro__taglines">
        <span className="intro__tagline">두 개의 키워드로 생명을 창조하세요</span>
        <span className="intro__tagline">자연이 먼저 말합니다</span>
        <span className="intro__tagline">당신은 단 한 번만 개입할 수 있습니다</span>
      </div>

      <div className="intro__inputs">
        <input
          className="intro__input"
          type="text"
          placeholder="키워드 1"
          value={keyword1}
          onChange={(e) => setKeyword1(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          className="intro__input"
          type="text"
          placeholder="키워드 2"
          value={keyword2}
          onChange={(e) => setKeyword2(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <button className="intro__button" disabled={!canStart} onClick={handleStart}>
        생명 창조
      </button>
    </div>
  );
}
