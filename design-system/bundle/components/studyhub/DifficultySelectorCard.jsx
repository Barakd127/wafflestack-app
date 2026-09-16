// [ds-extract] from src/components/StudyHub.tsx @ c1a3ad12 (master)
import React from 'react';

/**
 * DifficultySelectorCard — one clickable difficulty tile in the quiz-intro
 * 4-up grid (הכל / קל / בינוני / מאתגר). Selected state fills with the
 * difficulty color, lifts 2px and casts a colored shadow; disabled fades.
 */
export function DifficultySelectorCard({ label, count, icon, color, bg, selected, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: selected ? color : bg,
        border: `2px solid ${selected ? color : color + '40'}`,
        color: selected ? '#fff' : color,
        borderRadius: 14,
        padding: '10px 6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        fontFamily: "'Rubik', sans-serif",
        transition: 'all 0.18s ease',
        boxShadow: selected ? `0 6px 18px ${color}60` : 'none',
        transform: selected ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{count}</div>
    </button>
  )
}
