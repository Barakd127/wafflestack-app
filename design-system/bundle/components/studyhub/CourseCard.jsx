// [ds-extract] from src/components/StudyHub.tsx @ c1a3ad12 (master)
import React from 'react';
import { TEXT_DARK, TEXT_MED } from './_shared.js';

// 4 stat courses for the gate screen ("הקורסים שלי"). Copied VERBATIM from
// StudyHub.tsx COURSES, trimmed to the fields the card consumes
// (id / label / icon / desc / active / bg — every field the entries define).
export const COURSES = [
  { id: 'stat-a',  label: "סטטיסטיקה א'",        icon: '📊', desc: 'מבוא, מדדים, התפלגויות, רגרסיה, הסתברות',  active: true,  bg: 'linear-gradient(135deg,#F5C842,#D4AF37)' },
  { id: 'stat-b',  label: "סטטיסטיקה ב'",        icon: '📈', desc: 'דגימה, אמידה, רווחי סמך, בדיקת השערות, א-פרמטריים, רגרסיה', active: true,  bg: 'linear-gradient(135deg,#7CB7F8,#4A90E2)' },
  { id: 'methods', label: 'שיטות מחקר',          icon: '🔬', desc: 'תכנון מחקר, מדידה, מהימנות ותקפות',         active: false, bg: 'linear-gradient(135deg,#A78BFA,#7C3AED)' },
  { id: 'anova',   label: 'ניתוח שונות ורגרסיה', icon: '📐', desc: 'רגרסיה מרובה, משתני דמי, ANOVA חד-כיווני, השוואות מרובות ובלוקים', active: true, bg: 'linear-gradient(135deg,#67C29E,#229E69)' },
  { id: 'sql',     label: 'SQL — שפת מסדי נתונים',  icon: '🗄️', desc: 'שאילתות, JOIN, אינדקסים ופונקציות חלון — במטאפורת מחסן, עם סימולטורים וחידונים', active: true, bg: 'linear-gradient(135deg,#F0B429,#C97C18)' },
];

// Course icons follow the sidebar icon language (see Sidebar renderIcon):
// stroke-only line SVGs, viewBox 24, 1.8 stroke, round caps, currentColor.
// Each mark is bespoke to the course content rather than a stock glyph —
// stat-a: histogram with a normal curve rising over it; stat-b: bell curve
// with a dashed mean and a confidence-interval bracket; methods: checklist
// sheet under a magnifier; anova: three groups as vertical 3-point columns
// (one x per group, means rising) on axes; sql: data cylinder (warehouse).
export function CourseIcon({ id, size = 30 }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.8,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  }
  switch (id) {
    case 'stat-a':
      return (
        <svg {...common}>
          <path d="M3 20h18" />
          <path d="M5.5 20v-5h3.2v5" />
          <path d="M10.4 20v-9h3.2v9" />
          <path d="M15.3 20v-6.5h3.2v6.5" />
          <path d="M3.5 15.5C7 14.5 8.5 4.5 12 4.5s5 10 8.5 11" />
        </svg>
      )
    case 'stat-b':
      return (
        <svg {...common}>
          <path d="M3 16.5c3.6 0 4.8-11 9-11s5.4 11 9 11" />
          <path d="M12 6.5v10" strokeDasharray="0.5 3" />
          <path d="M6.5 21h11" />
          <path d="M6.5 19.3v3.4" />
          <path d="M17.5 19.3v3.4" />
        </svg>
      )
    case 'methods':
      return (
        <svg {...common}>
          <path d="M6 3.5h9a1.5 1.5 0 0 1 1.5 1.5v4.5" />
          <path d="M6 3.5A1.5 1.5 0 0 0 4.5 5v12A1.5 1.5 0 0 0 6 18.5h4" />
          <path d="M7.5 8h6" />
          <path d="M7.5 11.5h4" />
          <circle cx="15.5" cy="15.5" r="4" />
          <path d="M18.5 18.5l3 3" />
        </svg>
      )
    case 'anova':
      return (
        <svg {...common}>
          <path d="M4 4.5V20h16" />
          <circle cx="8" cy="11.4" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="8" cy="13.8" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="8" cy="16.2" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="12.8" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="12.8" cy="12.9" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="12.8" cy="15.3" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="17.6" cy="5.6" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="17.6" cy="8" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="17.6" cy="10.4" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'sql':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5.5" rx="7" ry="2.6" />
          <path d="M5 5.5v13c0 1.45 3.15 2.6 7 2.6s7-1.15 7-2.6v-13" />
          <path d="M5 10c0 1.45 3.15 2.6 7 2.6s7-1.15 7-2.6" />
          <path d="M5 14.4c0 1.45 3.15 2.6 7 2.6s7-1.15 7-2.6" />
        </svg>
      )
    default:
      return null
  }
}

/**
 * CourseCard — one tile of the "הקורסים שלי" course grid (CourseGate's
 * COURSES.map body). Glass card with a sidebar-language icon chip, course
 * label + description, and the "בקרוב" pin on inactive courses.
 */
export function CourseCard({ course = COURSES[0], onSelect = () => {} }) {
  const c = course
  return (
    <button
      key={c.id}
      onClick={() => onSelect(c)} // [ds-extract] replaced pickCourse(c) routing (coming-soon modal / window.open pageUrl / embedded CoursePlayer / onSelectActive) with onSelect(course) prop — visual output unchanged
      className="ws-glass-card"
      style={{
        borderRadius: 22,
        padding: '28px 24px',
        cursor: 'pointer',
        textAlign: 'right',
        fontFamily: "'Rubik', sans-serif",
        direction: 'rtl',
      }}
    >
      {/* Icon chip — same visual language as the sidebar nav: flat
          translucent chip + stroke-only line icon, no gradient fill. */}
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: 'var(--sh-sidebar-bg)',
        border: '1px solid rgba(255,255,255,0.25)',
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}><CourseIcon id={c.id} size={30} /></div>
      <div style={{ fontSize: 19, fontWeight: 700, color: TEXT_DARK, marginBottom: 4 }}>{c.label}</div>
      <div style={{ fontSize: 13, color: TEXT_MED, lineHeight: 1.45 }}>{c.desc}</div>
      {!c.active && (
        // Pin moved from insetInlineStart (right edge in RTL — collided
        // with the centered course icon) to insetInlineEnd (left edge
        // in RTL) per user feedback 2026-05-24. Convention §23.
        <div style={{
          position: 'absolute', top: 14, insetInlineEnd: 14,
          background: 'rgba(127,155,217,0.18)',
          color: '#1f3e6c', border: '1px solid rgba(127,155,217,0.45)',
          borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
        }}>בקרוב</div>
      )}
    </button>
  )
}
