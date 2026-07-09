/**
 * SQLIndexRaceInteractive — the card catalog vs walking every aisle. A slider
 * sets table size (1K → 1B rows); two bars compare full-scan steps (O(n))
 * against index lookups (O(log n)), plus the write-cost caveat.
 * Teaches: indexes trade read speed for write cost + storage.
 */
import { useState } from 'react'
import { GRAPH_FONT, GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle } from './graphTheme'

export default function SQLIndexRaceInteractive() {
  const [exp, setExp] = useState(6) // 10^exp rows

  const n = Math.round(Math.pow(10, exp))
  const scanSteps = n
  const idxSteps = Math.max(1, Math.ceil(Math.log2(n)))
  const speedup = Math.round(scanSteps / idxSteps)

  // log-scale bar lengths so both stay visible
  const maxBar = 420
  const scanLen = maxBar
  const idxLen = Math.max(10, maxBar * (Math.log10(idxSteps + 1) / Math.log10(scanSteps + 1)))

  const fmt = (x: number) => x.toLocaleString('he-IL')

  return (
    <div dir="rtl" style={graphCardStyle}>
      <h3 style={graphTitleStyle}>מרוץ האינדקס — קטלוג כרטיסיות מול הליכה בין המדפים</h3>
      <p style={graphSubtitleStyle}>בלי אינדקס הפקיד עובר קופסה-קופסה (סריקה מלאה). עם אינדקס — כמה דפדופים בקטלוג ממוין (חיפוש בינארי).</p>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        <label htmlFor="sqlidx-n" style={{ fontSize: 14, fontWeight: 600 }}>שורות בטבלה: <span style={{ color: GC.goldText }}>{fmt(n)}</span></label>
        <input id="sqlidx-n" type="range" min={3} max={9} step={0.1} value={exp} onChange={e => setExp(Number(e.target.value))} style={{ width: 'min(280px, 60%)', accentColor: GC.blue }} />
      </div>

      <svg viewBox="0 0 620 190" width="100%" role="img" aria-label="scan vs index steps">
        <text x={615} y={40} textAnchor="end" fontSize={14} fill={GC.ink} fontFamily={GRAPH_FONT}>🚶 סריקה מלאה</text>
        <rect x={615 - 130 - scanLen} y={50} width={scanLen} height={34} rx={6} fill={GC.warn} opacity={0.85} />
        <text x={615 - 135 - scanLen} y={72} textAnchor="end" fontSize={13} fill={GC.ink} fontFamily={GRAPH_FONT}>{fmt(scanSteps)} צעדים</text>

        <text x={615} y={120} textAnchor="end" fontSize={14} fill={GC.ink} fontFamily={GRAPH_FONT}>🗃️ אינדקס</text>
        <rect x={615 - 130 - idxLen} y={130} width={idxLen} height={34} rx={6} fill={GC.good} />
        <text x={615 - 135 - idxLen} y={152} textAnchor="end" fontSize={13} fill={GC.ink} fontFamily={GRAPH_FONT}>~{idxSteps} דפדופים</text>

        <text x={615} y={185} textAnchor="end" fontSize={11} fill={GC.axisText} fontFamily={GRAPH_FONT}>(האורכים בסקאלה לוגריתמית — הפער האמיתי גדול עוד יותר)</text>
      </svg>

      <div style={{ fontSize: 15, fontWeight: 700, color: GC.goldText, margin: '6px 0' }}>
        פי {fmt(speedup)} פחות צעדים עם אינדקס
      </div>
      <div style={{ fontSize: 13, opacity: 0.75 }}>
        ⚖️ המחיר: כל קופסה חדשה דורשת גם כרטיס חדש בקטלוג — INSERT/UPDATE נהיים מעט איטיים יותר, והאינדקס תופס מקום.
      </div>
    </div>
  )
}
