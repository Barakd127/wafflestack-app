/**
 * graphTheme — the single source of truth for the look of every interactive
 * graph. Extracted from ZScoreInteractive, which Barak chose as the reference
 * style (2026-07-08: "שמר את הסטייל הזה … שנה את כל הגרפים שיראו ככה"):
 *   • handwritten Hebrew font (Playpen Sans Hebrew)
 *   • light card (#FCFDFF) with a soft navy shadow, not a dark translucent panel
 *   • gold data marks, navy ink, blue interactive accents
 *   • title + subtitle header, centred formula slot, labelled sliders
 *
 * Graphs should wrap their body in <GraphFrame> and use GRAPH_FONT + these
 * colour tokens instead of hardcoding their own. Keep new graphs on this theme.
 */
import React from 'react'

export const GRAPH_FONT = "'Playpen Sans Hebrew', 'Assistant', sans-serif"

export const GC = {
  ink: '#1F3E6C',        // navy — headings, axis text, data point fill
  gold: '#F2AF13',       // primary data mark (curve, bars, highlight)
  goldFill: 'rgba(242,175,19,0.28)', // shaded area under a curve
  goldText: '#9A7B1F',   // gold-on-light readable label
  blue: '#4E71DA',       // interactive accents (guides, slider fill, hints)
  axis: 'rgba(31,62,108,0.45)',
  axisText: 'rgba(31,62,108,0.6)',
  good: '#1f7a6d',       // semantic positive (result / coverage)
  warn: '#b33a3a',       // semantic negative (miss / error) — only legitimate red
} as const

/** Card container — matches the z-score frame exactly. */
export const graphCardStyle: React.CSSProperties = {
  background: 'var(--sh-q-card-bg, #FCFDFF)',
  borderRadius: 16,
  padding: 20,
  margin: '24px auto',
  maxWidth: 700,
  color: 'var(--sh-text-dark)',
  border: '1px solid rgba(127,155,217,0.22)',
  boxShadow: '0 6px 24px rgba(31,62,108,0.08)',
  fontFamily: GRAPH_FONT,
}

export const graphTitleStyle: React.CSSProperties = {
  fontFamily: GRAPH_FONT, fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: GC.ink,
}
export const graphSubtitleStyle: React.CSSProperties = {
  fontFamily: GRAPH_FONT, fontSize: 14, opacity: 0.8, margin: '0 0 12px',
}

/** Standard graph shell: light card + handwritten title + subtitle. */
export function GraphFrame({ title, subtitle, children, style }: {
  title: string
  subtitle?: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div dir="rtl" style={{ ...graphCardStyle, ...style }}>
      <h3 style={graphTitleStyle}>{title}</h3>
      {subtitle && <p style={graphSubtitleStyle}>{subtitle}</p>}
      {children}
    </div>
  )
}

/** A labelled range slider in the reference style (blue accent, hand font). */
export function GraphSlider({ label, value, min, max, step = 1, onChange, suffix }: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  suffix?: string
}) {
  return (
    <label style={{ fontFamily: GRAPH_FONT, fontSize: 14, fontWeight: 600, display: 'block' }}>
      {label}: {value}{suffix ?? ''}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className="ws-graph-range" style={{ width: '100%', accentColor: GC.blue }} />
    </label>
  )
}

/** Two-column slider grid (μ / σ style). */
export function GraphSliderRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4, fontFamily: GRAPH_FONT }}>
      {children}
    </div>
  )
}
