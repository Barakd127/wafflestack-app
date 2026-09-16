// [ds-extract] from src/components/StudyHub.tsx @ c1a3ad12 (master)
import React from 'react';
import { GLASS_CARD, CARD_RADIUS, CARD_SHADOW, BUTTON_COLOR, TEXT_DARK, TEXT_MED, TEXT_LIGHT } from './_shared.js';

/**
 * TopicCard — one tile of the topic-selector grid (TopicSelector's
 * renderTopicCard, converted from a render function to a component).
 * Glass card with mastery star, per-topic stats row, optional personal-plan
 * hint chip, mastery banner and the תיאוריה / תרגול action buttons.
 */
export function TopicCard({
  topic = { id: 'mean', label: 'ממוצע', building: 'מדדי מרכז', questionCount: 12 },
  // [ds-extract] replaced userProgress.topics[topic.id] (progressStore lookup) with progress prop — visual output unchanged
  progress,
  // [ds-extract] replaced hintByTopic.get(topic.id) (personal-plan map) with planHint prop — visual output unchanged
  planHint,
  onSelectTopic = () => {},
}) {
  const isMastered = progress?.mastered
  const bestScore = progress?.bestScore || 0
  const sessionsAttempted = progress?.sessionsAttempted || 0
  return (
    <div
      key={topic.id}
      className="ws-topic-card"
      style={{
        background: GLASS_CARD,
        backdropFilter: 'blur(20px)',
        border: `2px solid ${isMastered ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.3)'}`,
        borderRadius: CARD_RADIUS,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        textAlign: 'center',
        transition: 'all 0.3s',
        boxShadow: CARD_SHADOW,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(51,81,202,0.25)`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = CARD_SHADOW
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 32 }}>{isMastered ? '⭐' : '📖'}</div>
        <div>
          <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 20, color: TEXT_DARK, textAlign: 'center' }}>
            {topic.label}
          </div>
          <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT, marginTop: 4, textAlign: 'center' }}>
            {topic.building}
          </div>
        </div>
      </div>

      {planHint && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,200,66,0.22), rgba(212,175,55,0.12))',
          border: '1px solid rgba(212,175,55,0.5)',
          borderRadius: 10, padding: '6px 10px',
          fontFamily: "'Rubik', sans-serif", fontSize: 12,
          color: '#8a6d1c', fontWeight: 600, textAlign: 'right',
        }}>
          🎯 {planHint}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: TEXT_MED }}>
            {sessionsAttempted}
          </div>
          <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>סשנים</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: bestScore > 85 ? '#34A853' : TEXT_MED }}>
            {bestScore}%
          </div>
          <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>ציון הטוב</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: '#D4AF37' }}>
            {topic.questionCount}
          </div>
          <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>שאלות</div>
        </div>
      </div>

      {isMastered && (
        <div style={{
          background: 'rgba(212,175,55,0.15)',
          border: '1px solid rgba(212,175,55,0.4)',
          borderRadius: 8,
          padding: '6px 10px',
          fontFamily: "'Rubik', sans-serif",
          fontSize: 12,
          color: '#D4AF37',
          fontWeight: 600,
          textAlign: 'center',
        }}>
          ✅ הושגת שליטה!
        </div>
      )}

      {/* Lesson / Quiz action buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={() => onSelectTopic(topic.id, 'lesson')}
          style={{
            flex: 1,
            background: BUTTON_COLOR,
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            padding: '10px 0',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: "'Rubik', sans-serif",
            boxShadow: '0px 2px 6px rgba(51,81,202,0.35)',
          }}
        >
          📚 תיאוריה
        </button>
        <button
          onClick={() => onSelectTopic(topic.id, 'quiz')}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.7)',
            color: TEXT_DARK,
            border: '1px solid rgba(127,155,217,0.4)',
            borderRadius: 14,
            padding: '10px 0',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: "'Rubik', sans-serif",
          }}
        >
          📝 תרגול
        </button>
      </div>
    </div>
  )
}
