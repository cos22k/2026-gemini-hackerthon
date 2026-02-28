import { useState, useEffect, useRef } from 'react';
import type {
  Creature,
  HistoryEvent,
  HistoryEventDetail,
  BirthDetail,
  EnvironmentDetail,
  EvolutionDetail,
  TrialDetail,
  SynthesisDetail,
} from '../types';
import { EMOJI_CATEGORIES } from '../game/emojiCategories';
import StatBar from './StatBar';

interface HistoryPanelProps {
  history?: HistoryEvent[];
  activeIndex?: number;
  phase?: string;
  creature?: Creature;
  onSynthesize?: (keyword: string) => void;
  onSkip?: () => void;
  synthesisHint?: string;
  recommendedEmojis?: string[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function renderStatChange(label: string, value: number) {
  const sign = value > 0 ? '+' : '';
  const cls = value > 0 ? 'history__stat--positive' : value < 0 ? 'history__stat--negative' : 'history__stat--neutral';
  return (
    <span className={`history__stat-change ${cls}`}>
      {label} {sign}{value}
    </span>
  );
}

function renderBirthDetail(d: BirthDetail) {
  return (
    <div className="history__detail-content">
      <div className="history__detail-row">
        <span className="history__detail-label">종</span>
        <span className="history__detail-value history__detail-value--italic">{d.species}</span>
      </div>
      <div className="history__detail-section">
        <span className="history__detail-label">스탯</span>
        <div className="history__detail-stats">
          <span>HP {d.stats.hp}</span>
          <span>적응력 {d.stats.adaptability}</span>
          <span>회복력 {d.stats.resilience}</span>
          <span>구조 {d.stats.structure}</span>
        </div>
      </div>
      <div className="history__detail-section">
        <span className="history__detail-label">특성</span>
        <div className="history__detail-tags">
          {d.traits.map((t, i) => (
            <span key={i} className="history__tag history__tag--trait">{t}</span>
          ))}
        </div>
      </div>
      {d.vulnerabilities.length > 0 && (
        <div className="history__detail-section">
          <span className="history__detail-label">약점</span>
          <div className="history__detail-tags">
            {d.vulnerabilities.map((v, i) => (
              <span key={i} className="history__tag history__tag--vulnerability">{v}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function renderEnvironmentDetail(d: EnvironmentDetail) {
  return (
    <div className="history__detail-content">
      <div className="history__detail-narrative">{d.narrative}</div>
      <div className="history__detail-row">
        <span className="history__detail-label">위협 유형</span>
        <span className="history__detail-value">{d.threatCategory}</span>
      </div>
      <div className="history__detail-row">
        <span className="history__detail-label">근본 원인</span>
        <span className="history__detail-value">{d.cascadingCause}</span>
      </div>
      <div className="history__detail-sensory">
        <div className="history__sensory-item">시각: {d.sensory.visual}</div>
        <div className="history__sensory-item">청각: {d.sensory.auditory}</div>
        <div className="history__sensory-item">촉각: {d.sensory.tactile}</div>
      </div>
      <div className="history__detail-row">
        <span className="history__detail-label">숨겨진 기회</span>
        <span className="history__detail-value history__detail-value--opportunity">{d.hiddenOpportunity}</span>
      </div>
    </div>
  );
}

function renderEvolutionDetail(d: EvolutionDetail) {
  return (
    <div className="history__detail-content">
      <div className="history__detail-narrative">{d.evolutionSummary}</div>
      {d.newTraits.length > 0 && (
        <div className="history__detail-section">
          <span className="history__detail-label">획득 특성</span>
          <div className="history__detail-tags">
            {d.newTraits.map((t, i) => (
              <span key={i} className="history__tag history__tag--gained">+{t}</span>
            ))}
          </div>
        </div>
      )}
      {d.lostTraits.length > 0 && (
        <div className="history__detail-section">
          <span className="history__detail-label">상실 특성</span>
          <div className="history__detail-tags">
            {d.lostTraits.map((t, i) => (
              <span key={i} className="history__tag history__tag--lost">-{t}</span>
            ))}
          </div>
        </div>
      )}
      <div className="history__detail-section">
        <span className="history__detail-label">스탯 변화</span>
        <div className="history__detail-stats">
          {renderStatChange('HP', d.statChanges.hp)}
          {renderStatChange('적응력', d.statChanges.adaptability)}
          {renderStatChange('회복력', d.statChanges.resilience)}
          {renderStatChange('구조', d.statChanges.structure)}
        </div>
      </div>
      <div className="history__detail-row">
        <span className="history__detail-label">적응 점수</span>
        <span className="history__detail-value">{d.adaptationScore}/100</span>
      </div>
    </div>
  );
}

function renderTrialDetail(d: TrialDetail) {
  return (
    <div className="history__detail-content">
      <div className="history__detail-narrative">{d.narrative}</div>
      <div className="history__detail-row">
        <span className="history__detail-label">{d.survived ? '생존 이유' : '멸종 원인'}</span>
        <span className="history__detail-value">{d.reason}</span>
      </div>
      <div className="history__detail-row">
        <span className="history__detail-label">{d.survived ? '변이/피해' : '최후의 모습'}</span>
        <span className="history__detail-value">{d.damageOrMutation}</span>
      </div>
      {!d.survived && d.epitaph && (
        <div className="history__detail-epitaph">"{d.epitaph}"</div>
      )}
    </div>
  );
}

function renderSynthesisDetail(d: SynthesisDetail) {
  return (
    <div className="history__detail-content">
      <div className="history__detail-narrative">{d.fusionNarrative}</div>
      {d.newTraits.length > 0 && (
        <div className="history__detail-section">
          <span className="history__detail-label">획득 특성</span>
          <div className="history__detail-tags">
            {d.newTraits.map((t, i) => (
              <span key={i} className="history__tag history__tag--gained">+{t}</span>
            ))}
          </div>
        </div>
      )}
      <div className="history__detail-section">
        <span className="history__detail-label">스탯 변화</span>
        <div className="history__detail-stats">
          {renderStatChange('HP', d.statChanges.hp)}
          {renderStatChange('적응력', d.statChanges.adaptability)}
          {renderStatChange('회복력', d.statChanges.resilience)}
          {renderStatChange('구조', d.statChanges.structure)}
        </div>
      </div>
    </div>
  );
}

function renderDetail(type: string, detail: HistoryEventDetail) {
  switch (type) {
    case 'birth': return renderBirthDetail(detail as BirthDetail);
    case 'environment': return renderEnvironmentDetail(detail as EnvironmentDetail);
    case 'evolution': return renderEvolutionDetail(detail as EvolutionDetail);
    case 'trial': return renderTrialDetail(detail as TrialDetail);
    case 'synthesis': return renderSynthesisDetail(detail as SynthesisDetail);
    default: return null;
  }
}

export default function HistoryPanel({ history = [], activeIndex, phase, creature, onSynthesize, onSkip, synthesisHint, recommendedEmojis, collapsed, onToggleCollapse }: HistoryPanelProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('animals');
  const timelineRef = useRef<HTMLDivElement>(null);
  const lastNodeRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lastNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [history.length]);

  useEffect(() => {
    if (phase === 'synthesis') {
      setSelectedEmoji(null);
      synthRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [phase]);

  const handleSynthSubmit = () => {
    if (selectedEmoji && onSynthesize) {
      onSynthesize(selectedEmoji);
      setSelectedEmoji(null);
    }
  };

  const handleNodeClick = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const needsAttention = phase === 'synthesis' && !!onSynthesize;

  return (
    <aside className={`history${collapsed ? ' history--collapsed' : ''}`}>
      {/* Vertical bookmark tabs (always visible) */}
      <div className="history__sidebar-tabs">
        <button
          className={`history__sidebar-tab${activeTab === 'history' ? ' history__sidebar-tab--active' : ''}`}
          onClick={() => { if (collapsed) onToggleCollapse?.(); setActiveTab('history'); }}
        >
          <span className="history__sidebar-tab-label">History</span>
          {needsAttention && <span className="history__toggle-badge" />}
        </button>
        <button
          className={`history__sidebar-tab${activeTab === 'stats' ? ' history__sidebar-tab--active' : ''}`}
          onClick={() => { if (collapsed) onToggleCollapse?.(); setActiveTab('stats'); }}
        >
          <span className="history__sidebar-tab-label">Stats</span>
        </button>
        {!collapsed && (
          <button className="history__sidebar-collapse" onClick={onToggleCollapse} title="패널 접기">
            &#x25B6;
          </button>
        )}
      </div>

      {/* Tab content (hidden when collapsed) */}
      {!collapsed && (
        <div className="history__tab-content">
          {activeTab === 'history' ? (
            <div className="history__timeline" ref={timelineRef}>
              {history.map((event, i) => {
                const isExpanded = expandedIndex === i;
                const hasDetail = !!event.detail;

                return (
                  <div
                    key={i}
                    ref={i === history.length - 1 ? lastNodeRef : undefined}
                    className={`history__node ${i === activeIndex ? 'history__node--active' : ''} ${isExpanded ? 'history__node--expanded' : ''}`}
                    onClick={() => hasDetail && handleNodeClick(i)}
                    style={{ cursor: hasDetail ? 'pointer' : 'default' }}
                  >
                    <div className={`history__dot history__dot--${event.type}`} />
                    <div className="history__info">
                      <div className="history__title">
                        {event.title}
                        {hasDetail && (
                          <span className={`history__expand-icon ${isExpanded ? 'history__expand-icon--open' : ''}`}>
                            &#x25BE;
                          </span>
                        )}
                      </div>
                      <div className={`history__summary${event.type === 'evolution' ? ' history__summary--evolution' : ''}`}>
                        {event.summary}
                      </div>
                      <div className={`history__detail ${isExpanded ? 'history__detail--open' : ''}`}>
                        {isExpanded && event.detail && renderDetail(event.type, event.detail)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {phase === 'synthesis' && onSynthesize && (
                <div className={`history__synthesis${needsAttention ? ' history__synthesis--attention' : ''}`} ref={synthRef}>
                  <div className="history__synthesis-header">시련을 이겨냈습니다!</div>
                  {synthesisHint && (
                    <p className="history__synthesis-hint">"{synthesisHint}"</p>
                  )}

                  <div className="history__synthesis-slot">
                    {selectedEmoji || '?'}
                  </div>

                  {recommendedEmojis && recommendedEmojis.length > 0 && (
                    <div className="history__synthesis-recommended">
                      <div className="history__synthesis-recommended-label">추천</div>
                      <div className="history__synthesis-recommended-grid">
                        {recommendedEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            className={`history__synthesis-emoji history__synthesis-emoji--recommended ${selectedEmoji === emoji ? 'history__synthesis-emoji--selected' : ''}`}
                            onClick={() => setSelectedEmoji(selectedEmoji === emoji ? null : emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="history__synthesis-categories">
                    {EMOJI_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        className={`history__synthesis-cat ${activeCategory === cat.id ? 'history__synthesis-cat--active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                      >
                        {cat.icon}
                      </button>
                    ))}
                  </div>

                  <div className="history__synthesis-grid">
                    {EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.emojis.map((emoji) => (
                      <button
                        key={emoji}
                        className={`history__synthesis-emoji ${selectedEmoji === emoji ? 'history__synthesis-emoji--selected' : ''}`}
                        onClick={() => setSelectedEmoji(selectedEmoji === emoji ? null : emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <button
                    className="history__synthesis-btn history__synthesis-btn--primary"
                    disabled={!selectedEmoji}
                    onClick={handleSynthSubmit}
                  >
                    합성하기
                  </button>
                  {onSkip && (
                    <button className="history__synthesis-btn history__synthesis-btn--secondary" onClick={onSkip}>
                      합성 없이 계속
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="history__stats-content">
              {creature ? (
                <>
                  <div className="history__creature-header">
                    <h2 className="history__creature-name">{creature.name}</h2>
                    <div className="history__creature-meta">
                      <span>{creature.species}</span>
                      {creature.generation && <span>Gen {creature.generation}</span>}
                    </div>
                  </div>

                  <div className="history__detail-section">
                    <span className="history__detail-label">스탯</span>
                    <div className="history__creature-stats">
                      {Object.entries(creature.stats).map(([key, val]) => (
                        <StatBar key={key} stat={key} value={val} />
                      ))}
                    </div>
                  </div>

                  <div className="history__detail-section">
                    <span className="history__detail-label">특성</span>
                    <div className="history__detail-tags">
                      {creature.traits.map((t, i) => (
                        <span key={i} className="history__tag history__tag--trait">{t}</span>
                      ))}
                    </div>
                  </div>

                  {creature.vulnerabilities.length > 0 && (
                    <div className="history__detail-section">
                      <span className="history__detail-label">약점</span>
                      <div className="history__detail-tags">
                        {creature.vulnerabilities.map((v, i) => (
                          <span key={i} className="history__tag history__tag--vulnerability">{v}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {creature.energyStrategy && (
                    <div className="history__detail-row">
                      <span className="history__detail-label">에너지 전략</span>
                      <span className="history__detail-value">{creature.energyStrategy}</span>
                    </div>
                  )}

                  <div className="history__detail-row">
                    <span className="history__detail-label">탄생 키워드</span>
                    <span className="history__detail-value history__detail-value--italic">{creature.birthWords}</span>
                  </div>
                </>
              ) : (
                <p className="history__stats-empty">아직 생명이 없습니다</p>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
