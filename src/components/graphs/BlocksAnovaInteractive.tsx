/**
 * BlocksAnovaInteractive — Randomized Block Design (two-way ANOVA, no replication).
 * 4 fields (blocks) × 3 fertilizer brands (treatments), one observation per cell.
 * Hover a field name or a brand header to highlight its row/column. Shows the two
 * F statistics (treatment, block) against their critical values with a verdict badge.
 */
import { useEffect, useState } from 'react'
import { GRAPH_FONT, GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle } from './graphTheme'

const DATA: { field: string; values: number[] }[] = [
  { field: 'שדה 1', values: [24, 25, 17] },
  { field: 'שדה 2', values: [21, 25, 14] },
  { field: 'שדה 3', values: [19, 23, 15] },
  { field: 'שדה 4', values: [20, 23, 14] },
]
const TREATMENTS = ['A', 'B', 'C']
const BAR_COLORS = [GC.gold, GC.blue, '#67C29E']

const N_B = DATA.length          // 4 blocks (fields)
const N_T = TREATMENTS.length    // 3 treatments (brands)

const rowMeans = DATA.map(d => d.values.reduce((a, b) => a + b, 0) / N_T)
const colMeans = TREATMENTS.map((_, c) => DATA.reduce((s, d) => s + d.values[c], 0) / N_B)
const grandMean = DATA.reduce((s, d) => s + d.values.reduce((a, b) => a + b, 0), 0) / (N_B * N_T)

const ssTreatment = N_B * colMeans.reduce((s, m) => s + (m - grandMean) ** 2, 0)
const ssBlock = N_T * rowMeans.reduce((s, m) => s + (m - grandMean) ** 2, 0)
const ssTotal = DATA.reduce((s, d) => s + d.values.reduce((ss, v) => ss + (v - grandMean) ** 2, 0), 0)
const ssError = ssTotal - ssTreatment - ssBlock

const dfTreatment = N_T - 1          // 2
const dfBlock = N_B - 1              // 3
const dfError = dfTreatment * dfBlock // 6

const msTreatment = ssTreatment / dfTreatment
const msBlock = ssBlock / dfBlock
const msError = ssError / dfError

const fTreatment = msTreatment / msError
const fBlock = msBlock / msError

const F_CRIT_TREATMENT = 5.14 // F(0.05; 2,6)
const F_CRIT_BLOCK = 4.76     // F(0.05; 3,6)

const sigTreatment = fTreatment > F_CRIT_TREATMENT
const sigBlock = fBlock > F_CRIT_BLOCK

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2))

const PAD = 12
const LABEL_W = 96
const COL_W = 108
const MEAN_W = 128
const HEADER_H = 34
const ROW_H = 32
const FOOTER_H = 34

const TABLE_W = LABEL_W + COL_W * N_T + MEAN_W
const TABLE_H = HEADER_H + ROW_H * N_B + FOOTER_H
const W = TABLE_W + PAD * 2
const H = TABLE_H + PAD * 2

const xLabel = PAD
const xCols = TREATMENTS.map((_, c) => PAD + LABEL_W + c * COL_W)
const xMean = PAD + LABEL_W + N_T * COL_W
const yHeader = PAD
const yRows = DATA.map((_, r) => PAD + HEADER_H + r * ROW_H)
const yFooter = PAD + HEADER_H + N_B * ROW_H

export default function BlocksAnovaInteractive() {
  const [hoverRow, setHoverRow] = useState<number | null>(null)
  const [hoverCol, setHoverCol] = useState<number | null>(null)

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const elT = document.getElementById('rbd-f-treatment')
    const elB = document.getElementById('rbd-f-block')
    if (k && elT) k.render(`F_T = \\dfrac{MS_T}{MS_E} = \\dfrac{${fmt(msTreatment)}}{${fmt(msError)}} = ${fmt(fTreatment)}`, elT, { throwOnError: false })
    if (k && elB) k.render(`F_{Bl} = \\dfrac{MS_{Bl}}{MS_E} = \\dfrac{${fmt(msBlock)}}{${fmt(msError)}} = ${fmt(fBlock)}`, elB, { throwOnError: false })
  }, [])

  return (
    <div dir="rtl" style={{ ...graphCardStyle }}>
      <h3 style={graphTitleStyle}>עיצוב בבלוקים אקראי — שונות דו-כיוונית ללא חזרות</h3>
      <p style={graphSubtitleStyle}>
        כל שדה (בלוק) מקבל את כל 3 זני הדשן, כדי לנטרל את הבדלי הפוריות הטבעיים בין השדות ולבודד את אפקט הזן. עברו עם העכבר על שם שדה או על כותרת זן כדי להדגיש שורה / עמודה.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="טבלת עיצוב בבלוקים">
        {/* header row */}
        <rect x={xLabel} y={yHeader} width={LABEL_W} height={HEADER_H} fill={GC.ink} stroke="rgba(127,155,217,0.22)" />
        <text x={xLabel + LABEL_W / 2} y={yHeader + HEADER_H / 2 + 4} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.85} style={{ pointerEvents: 'none' }}>שדה \ זן</text>
        {TREATMENTS.map((t, c) => (
          <g key={t} onMouseEnter={() => setHoverCol(c)} onMouseLeave={() => setHoverCol(null)} style={{ cursor: 'pointer' }}>
            <rect x={xCols[c]} y={yHeader} width={COL_W} height={HEADER_H} fill={hoverCol === c ? GC.goldFill : GC.ink} stroke="rgba(127,155,217,0.22)" />
            <text x={xCols[c] + COL_W / 2} y={yHeader + HEADER_H / 2 + 5} textAnchor="middle" fontSize={15} fontWeight={700} fill={BAR_COLORS[c]} style={{ pointerEvents: 'none' }}>זן {t}</text>
          </g>
        ))}
        <rect x={xMean} y={yHeader} width={MEAN_W} height={HEADER_H} fill={GC.ink} stroke="rgba(127,155,217,0.22)" />
        <text x={xMean + MEAN_W / 2} y={yHeader + HEADER_H / 2 + 4} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.85} style={{ pointerEvents: 'none' }}>ממוצע שדה</text>

        {/* data rows */}
        {DATA.map((d, r) => (
          <g key={d.field}>
            <g onMouseEnter={() => setHoverRow(r)} onMouseLeave={() => setHoverRow(null)} style={{ cursor: 'pointer' }}>
              <rect x={xLabel} y={yRows[r]} width={LABEL_W} height={ROW_H} fill={hoverRow === r ? GC.goldFill : 'rgba(31,62,108,0.03)'} stroke="rgba(127,155,217,0.22)" />
              <text x={xLabel + LABEL_W / 2} y={yRows[r] + ROW_H / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={600} fill={GC.ink} style={{ pointerEvents: 'none' }}>{d.field}</text>
            </g>
            {d.values.map((v, c) => {
              const hl = hoverRow === r || hoverCol === c
              return (
                <g key={c}>
                  <rect x={xCols[c]} y={yRows[r]} width={COL_W} height={ROW_H} fill={hl ? 'rgba(242,175,19,0.18)' : 'rgba(31,62,108,0.015)'} stroke="rgba(127,155,217,0.22)" />
                  <text x={xCols[c] + COL_W / 2} y={yRows[r] + ROW_H / 2 + 4} textAnchor="middle" fontSize={14} fill={GC.ink} style={{ pointerEvents: 'none' }}>{v}</text>
                </g>
              )
            })}
            <rect x={xMean} y={yRows[r]} width={MEAN_W} height={ROW_H} fill={hoverRow === r ? 'rgba(242,175,19,0.24)' : 'rgba(31,62,108,0.04)'} stroke="rgba(127,155,217,0.22)" />
            <text x={xMean + MEAN_W / 2} y={yRows[r] + ROW_H / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={600} fill={GC.ink} style={{ pointerEvents: 'none' }}>{fmt(rowMeans[r])}</text>
          </g>
        ))}

        {/* footer row */}
        <rect x={xLabel} y={yFooter} width={LABEL_W} height={FOOTER_H} fill={GC.ink} stroke="rgba(127,155,217,0.22)" />
        <text x={xLabel + LABEL_W / 2} y={yFooter + FOOTER_H / 2 + 4} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.85} style={{ pointerEvents: 'none' }}>ממוצע זן</text>
        {colMeans.map((m, c) => (
          <g key={c}>
            <rect x={xCols[c]} y={yFooter} width={COL_W} height={FOOTER_H} fill={hoverCol === c ? GC.goldFill : GC.ink} stroke="rgba(127,155,217,0.22)" />
            <text x={xCols[c] + COL_W / 2} y={yFooter + FOOTER_H / 2 + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={BAR_COLORS[c]} style={{ pointerEvents: 'none' }}>{fmt(m)}</text>
          </g>
        ))}
        <rect x={xMean} y={yFooter} width={MEAN_W} height={FOOTER_H} fill={GC.gold} stroke="rgba(127,155,217,0.22)" />
        <text x={xMean + MEAN_W / 2} y={yFooter + FOOTER_H / 2 + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill={GC.ink} style={{ pointerEvents: 'none' }}>{fmt(grandMean)}</text>
      </svg>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 14 }}>
        <div style={{ flex: '1 1 220px', background: 'rgba(31,62,108,0.04)', border: '1px solid rgba(127,155,217,0.22)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>F לטיפולים (זנים)</div>
          <div id="rbd-f-treatment" style={{ minHeight: 30, margin: '4px 0' }} />
          <div style={{ fontSize: 12, opacity: 0.75 }}>df = ({dfTreatment}, {dfError}) &nbsp;|&nbsp; F קריטי (α=0.05) = {F_CRIT_TREATMENT}</div>
          <span style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#fff', background: sigTreatment ? GC.good : GC.warn }}>{sigTreatment ? 'מובהק' : 'לא מובהק'}</span>
        </div>
        <div style={{ flex: '1 1 220px', background: 'rgba(31,62,108,0.04)', border: '1px solid rgba(127,155,217,0.22)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>F לבלוקים (שדות)</div>
          <div id="rbd-f-block" style={{ minHeight: 30, margin: '4px 0' }} />
          <div style={{ fontSize: 12, opacity: 0.75 }}>df = ({dfBlock}, {dfError}) &nbsp;|&nbsp; F קריטי (α=0.05) = {F_CRIT_BLOCK}</div>
          <span style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#fff', background: sigBlock ? GC.good : GC.warn }}>{sigBlock ? 'מובהק' : 'לא מובהק'}</span>
        </div>
      </div>

      <p style={{ fontSize: 12, opacity: 0.6, margin: '10px 0 0' }}>T = טיפול (זן הדשן) &nbsp;|&nbsp; Bl = בלוק (שדה) &nbsp;|&nbsp; E = שגיאה</p>
    </div>
  )
}
