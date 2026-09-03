// [ds-extract] from src/components/StudyHub.tsx @ c1a3ad12 (master)
import React from 'react';
import { GLASS_CARD, CARD_SHADOW, BUTTON_COLOR, TEXT_DARK, TEXT_MED, TEXT_LIGHT } from './_shared.js';
import { DifficultySelectorCard } from './DifficultySelectorCard.jsx';

/**
 * QuizIntroCard — centred preview screen shown before launching the actual
 * quiz. Difficulty selector grid (הכל/קל/בינוני/מאתגר), gold pep-talk panel,
 * and the start / read-theory / back action row.
 */
export function QuizIntroCard({
  // [ds-extract] replaced HEBREW_LABELS[topicId] || quizBankData.topics[topicId]?.concept lookup with topicName prop — visual output unchanged
  topicName = 'ממוצע',
  // [ds-extract] replaced counts derived from quizBankData.topics[topicId].questions difficulty filter with counts prop — visual output unchanged
  counts = { all: 24, easy: 9, medium: 10, hard: 5 },
  // [ds-extract] replaced LESSON_CONTENT/_STAT_B/_SQL/_ANOVA .some(t => t.id === topicId) with hasLesson prop — visual output unchanged
  hasLesson = true,
  onStart = () => {},
  onBack = () => {},
  onReadLesson = () => {},
}) {
  const [selected, setSelected] = React.useState('all')

  return (
    <div dir="rtl" style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32, fontFamily: "'Rubik', 'Assistant', sans-serif",
    }}>
      <div className="ws-quiz-intro" style={{
        width: '100%', maxWidth: 540,
        background: GLASS_CARD,
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        boxShadow: CARD_SHADOW,
        border: '1px solid rgba(255,255,255,0.5)',
        padding: 36,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>📝</div>
        <h2 className="ws-h2" style={{ fontSize: 26, fontWeight: 700, color: TEXT_DARK, margin: '0 0 6px' }}>
          תרגול: {topicName}
        </h2>
        <div style={{ fontSize: 14, color: TEXT_LIGHT, marginBottom: 22 }}>
          בחר/י רמת קושי. מקל למאתגר.
        </div>

        {/* Difficulty selector — clickable cards, one of which is selected */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
          <DifficultySelectorCard
            label="הכל" count={counts.all} icon="🎯"
            color="#6366f1" bg="rgba(99,102,241,0.12)"
            selected={selected === 'all'} onClick={() => setSelected('all')} />
          <DifficultySelectorCard
            label="קל" count={counts.easy} icon="🌱"
            color="#10b981" bg="rgba(16,185,129,0.12)"
            selected={selected === 'easy'} onClick={() => setSelected('easy')}
            disabled={counts.easy === 0} />
          <DifficultySelectorCard
            label="בינוני" count={counts.medium} icon="⚡"
            color="#f59e0b" bg="rgba(245,158,11,0.12)"
            selected={selected === 'medium'} onClick={() => setSelected('medium')}
            disabled={counts.medium === 0} />
          <DifficultySelectorCard
            label="מאתגר" count={counts.hard} icon="🔥"
            color="#ef4444" bg="rgba(239,68,68,0.12)"
            selected={selected === 'hard'} onClick={() => setSelected('hard')}
            disabled={counts.hard === 0} />
        </div>

        {/* Pep-talk paragraph */}
        <div style={{
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.18)',
          borderRadius: 14,
          padding: '14px 18px',
          fontSize: 14,
          color: TEXT_MED,
          lineHeight: 1.7,
          marginBottom: 28,
          textAlign: 'right',
        }}>
          🎯 התשובה תיבדק אוטומטית. תקבל פידבק מיידי, הסבר על כל שאלה, ו-XP על כל תשובה נכונה.
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => onStart(selected)} disabled={counts[selected] === 0} style={{
            background: BUTTON_COLOR, color: '#fff', border: 'none',
            borderRadius: 24, padding: '12px 28px',
            fontWeight: 700, fontSize: 16,
            cursor: counts[selected] === 0 ? 'not-allowed' : 'pointer',
            opacity: counts[selected] === 0 ? 0.4 : 1,
            fontFamily: "'Rubik', sans-serif",
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          }}>
            התחל תרגול ({counts[selected]} שאלות) ←
          </button>
          {hasLesson && (
            <button data-tour="theory-btn" onClick={onReadLesson} style={{
              background: 'rgba(255,255,255,0.6)', color: TEXT_DARK,
              border: '1px solid rgba(127,155,217,0.4)',
              borderRadius: 24, padding: '12px 22px',
              fontWeight: 600, fontSize: 15, cursor: 'pointer',
              fontFamily: "'Rubik', sans-serif",
            }}>
              📚 קרא תיאוריה
            </button>
          )}
          <button onClick={onBack} style={{
            background: 'transparent', color: TEXT_LIGHT,
            border: 'none', cursor: 'pointer',
            fontSize: 14, padding: '12px 16px', fontFamily: "'Rubik', sans-serif",
          }}>
            → חזרה
          </button>
        </div>
      </div>
    </div>
  )
}
