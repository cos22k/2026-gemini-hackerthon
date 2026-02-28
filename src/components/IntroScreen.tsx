import { EMOJI_CATEGORIES } from "../game/emojiCategories";
import { useState, useEffect, useRef } from "react";

interface PreviousSession {
  id: string;
  createdAt: Date;
  phase: string;
  creature: string | null;
}

interface IntroScreenProps {
  onStart: (k1: string, k2: string) => void;
  onContinue?: (sessionId: string) => void;
  previousSessions?: PreviousSession[];
}

const DEBUG_KEYWORDS: [string, string] = ["불", "물"];

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const [selected, setSelected] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [activeCategory, setActiveCategory] = useState("animals");
  const didSkip = useRef(false);

  // Debug: auto-skip intro with ?debug=skip
  useEffect(() => {
    if (didSkip.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "skip") {
      didSkip.current = true;
      onStart(DEBUG_KEYWORDS[0], DEBUG_KEYWORDS[1]);
    }
  }, [onStart]);

  const canStart = selected[0] !== null && selected[1] !== null;

  const isEmojiSelected = (emoji: string) =>
    selected[0] === emoji || selected[1] === emoji;

  const handleEmojiClick = (emoji: string) => {
    setSelected((prev) => {
      if (prev[0] === emoji) return [null, prev[1]];
      if (prev[1] === emoji) return [prev[0], null];
      if (prev[0] === null) return [emoji, prev[1]];
      if (prev[1] === null) return [prev[0], emoji];
      return [prev[0], emoji];
    });
  };

  const handleStart = () => {
    if (canStart) {
      onStart(selected[0]!, selected[1]!);
    }
  };

  return (
    <div className="intro">
      <div className="intro__icon">🌱</div>
      <h1 className="intro__title">테라리움 에코</h1>
      <p className="intro__subtitle">Terrarium Echo</p>

      <div className="intro__selection-display">
        <div
          className={`intro__slot ${selected[0] ? "intro__slot--filled" : "intro__slot--empty"}`}
          onClick={() => selected[0] && setSelected([null, selected[1]])}
        >
          {selected[0] || "?"}
        </div>
        <span className="intro__slot-divider">+</span>
        <div
          className={`intro__slot ${selected[1] ? "intro__slot--filled" : "intro__slot--empty"}`}
          onClick={() => selected[1] && setSelected([selected[0], null])}
        >
          {selected[1] || "?"}
        </div>
      </div>

      <div className="intro__categories">
        {EMOJI_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`intro__category-tab ${activeCategory === cat.id ? "intro__category-tab--active" : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="intro__emoji-grid">
        {EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.emojis.map(
          (emoji) => (
            <button
              key={emoji}
              className={`intro__emoji-cell ${isEmojiSelected(emoji) ? "intro__emoji-cell--selected" : ""}`}
              onClick={() => handleEmojiClick(emoji)}
            >
              {emoji}
            </button>
          ),
        )}
      </div>

      <button
        className="intro__button"
        disabled={!canStart}
        onClick={handleStart}
      >
        생명 창조
      </button>
    </div>
  );
}
