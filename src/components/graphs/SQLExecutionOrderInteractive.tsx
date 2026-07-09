/**
 * SQLExecutionOrderInteractive — the clerk's secret. Step through the REAL
 * execution pipeline (FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
 * → LIMIT) and watch a live row-count funnel shrink at each stage, while the
 * written query highlights the clause being executed.
 * Teaches: SQL is written in one order but executed in another — which is
 * why a SELECT alias can't be used inside WHERE.
 */
import { useState } from 'react'
import { GRAPH_FONT, GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle } from './graphTheme'

const STAGES = [
  { kw: 'FROM products',            he: 'הפקיד ניגש למדף — כל 8 הקופסאות על השולחן', rows: 8 },
  { kw: "WHERE category = 'Tech'",  he: 'סינון קופסאות: רק Tech נשארות', rows: 3 },
  { kw: 'GROUP BY category',        he: 'מיון לתאים — כאן תא אחד', rows: 1 },
  { kw: 'HAVING COUNT(*) > 1',      he: 'סינון תאים שלמים — התא שורד', rows: 1 },
  { kw: 'SELECT category, COUNT(*)', he: 'רק עכשיו נכתבות התוויות (העמודות)', rows: 1 },
  { kw: 'ORDER BY category',        he: 'סידור השורות לפני מסירה', rows: 1 },
  { kw: 'LIMIT 5',                  he: 'חיתוך: לכל היותר 5 שורות', rows: 1 },
]
// the same clauses in WRITTEN order, mapped to their execution step index
const WRITTEN: { text: string; step: number }[] = [
  { text: 'SELECT category, COUNT(*)', step: 4 },
  { text: 'FROM products', step: 0 },
  { text: "WHERE category = 'Tech'", step: 1 },
  { text: 'GROUP BY category', step: 2 },
  { text: 'HAVING COUNT(*) > 1', step: 3 },
  { text: 'ORDER BY category', step: 5 },
  { text: 'LIMIT 5;', step: 6 },
]

export default function SQLExecutionOrderInteractive() {
  const [step, setStep] = useState(0)
  const maxRows = STAGES[0].rows

  return (
    <div dir="rtl" style={graphCardStyle}>
      <h3 style={graphTitleStyle}>הסוד של הפקיד — סדר הביצוע האמיתי</h3>
      <p style={graphSubtitleStyle}>השאילתה נכתבת מלמעלה למטה, אבל הפקיד מבצע אותה בסדר אחר. עברו שלב-שלב וראו את משפך השורות מצטמצם.</p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* written query, highlighted by execution step */}
        <div dir="ltr" style={{ flex: '1 1 250px', fontFamily: 'Consolas, monospace', fontSize: 13.5, background: 'rgba(31,62,108,0.9)', borderRadius: 10, padding: '10px 14px', lineHeight: 1.9 }}>
          {WRITTEN.map(w => (
            <div key={w.text} style={{
              color: w.step === step ? '#1F3E6C' : w.step < step ? '#9fb8d8' : '#e8ecf1',
              background: w.step === step ? '#D4A017' : 'transparent',
              borderRadius: 6, padding: '0 6px', display: 'inline-block', width: '100%', boxSizing: 'border-box',
            }}>{w.text}{w.step < step ? '  ✓' : ''}</div>
          ))}
        </div>

        {/* funnel */}
        <div style={{ flex: '1 1 220px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>שלב {step + 1}/7: <span dir="ltr" style={{ fontFamily: 'Consolas, monospace' }}>{STAGES[step].kw}</span></div>
          <div style={{ fontSize: 14, marginBottom: 10 }}>{STAGES[step].he}</div>
          <svg viewBox="0 0 240 120" width="100%" role="img" aria-label="row funnel">
            {STAGES.slice(0, step + 1).map((s, i) => {
              const w = Math.max(18, (s.rows / maxRows) * 200)
              return (
                <g key={i}>
                  <rect x={(240 - w) / 2} y={i * 15 + 4} width={w} height={11} rx={4}
                    fill={i === step ? GC.gold : 'rgba(31,62,108,0.45)'} />
                  <text x={232} y={i * 15 + 13} textAnchor="end" fontSize={9} fill={GC.ink}>{s.rows}</text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} aria-disabled={step === 0} style={{
          padding: '7px 18px', borderRadius: 10, cursor: step === 0 ? 'default' : 'pointer', opacity: step === 0 ? 0.4 : 1,
          background: 'rgba(31,62,108,0.06)', color: GC.ink, border: '1px solid rgba(127,155,217,0.22)', fontFamily: GRAPH_FONT, fontSize: 14,
        }}>→ אחורה</button>
        <button onClick={() => setStep(s => Math.min(STAGES.length - 1, s + 1))} aria-disabled={step === STAGES.length - 1} style={{
          padding: '7px 18px', borderRadius: 10, cursor: step === STAGES.length - 1 ? 'default' : 'pointer', opacity: step === STAGES.length - 1 ? 0.4 : 1,
          background: GC.gold, color: GC.ink, border: `1px solid ${GC.gold}`, fontFamily: GRAPH_FONT, fontSize: 14, fontWeight: 700,
        }}>השלב הבא ←</button>
        {step === STAGES.length - 1 && (
          <span style={{ fontSize: 13, color: GC.goldText, fontWeight: 600, fontFamily: GRAPH_FONT }}>💡 לכן אי-אפשר להשתמש בכינוי מ-SELECT בתוך WHERE — הוא עוד לא קיים שם.</span>
        )}
      </div>
    </div>
  )
}
