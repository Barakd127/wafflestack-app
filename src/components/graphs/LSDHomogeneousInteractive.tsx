/**
 * LSDHomogeneousInteractive — sorted treatment means (fertilizer brands) with
 * a slider for the LSD critical value. Any pair with |mean_i - mean_j| < LSD
 * counts as "not significantly different"; consecutive sorted means that
 * clear that bar get bracketed together into homogeneous groups (the
 * classic LSD "underline" method).
 */
import { useEffect, useState } from 'react'
import { GRAPH_FONT, GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle } from './graphTheme'

type Row = { name: string; mean: number }

const DATA: Row[] = [
  { name: 'B', mean: 24 },
  { name: 'A', mean: 20 },
  { name: 'C', mean: 18 },
]

const GROUP_COLORS = [GC.gold, GC.blue, GC.good]

const W = 560, H = 300
const X0 = 70, GAP = 50, BW = 110
const BASE = 190, BAR_TOP = 60
const MAX_VAL = Math.max(...DATA.map(d => d.mean)) * 1.25

function barX(i: number) { return X0 + i * (BW + GAP) }
function barH(mean: number) { return (mean / MAX_VAL) * (BASE - BAR_TOP) }

export default function LSDHomogeneousInteractive() {
  const [lsd, setLsd] = useState(2.179)

  // Every pairwise |diff| — drives the comparison list below the chart.
  const pairs: { a: Row; b: Row; diff: number; same: boolean }[] = []
  for (let i = 0; i < DATA.length; i++) {
    for (let j = i + 1; j < DATA.length; j++) {
      const diff = Math.abs(DATA[i].mean - DATA[j].mean)
      pairs.push({ a: DATA[i], b: DATA[j], diff, same: diff < lsd })
    }
  }

  // Homogeneous groups: classic LSD "underline" — merge consecutive
  // (sorted-descending) means into one run while the adjacent gap stays
  // below LSD; a gap >= LSD starts a new run.
  const groups: number[][] = []
  let current: number[] = [0]
  for (let i = 1; i < DATA.length; i++) {
    const gap = DATA[i - 1].mean - DATA[i].mean
    if (gap < lsd) current.push(i)
    else { groups.push(current); current = [i] }
  }
  groups.push(current)

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('lsd-formula')
    if (k && el) k.render(`LSD = ${lsd.toFixed(3)}`, el, { throwOnError: false })
  }, [lsd])

  return (
    <div dir="rtl" style={{ ...graphCardStyle }}>
      <h3 style={graphTitleStyle}>LSD — בניית קבוצות הומוגניות</h3>
      <p style={graphSubtitleStyle}>
        שלושה זני דשן נמדדו לפי גובה צמיחה (ס״מ), ממוינים מהגבוה לנמוך. הזז את הסליידר כדי לשנות את ערך ה-LSD הקריטי, וצפה כיצד קו תחתי משותף מקבץ ממוצעים שאינם שונים מובהקות זה מזה.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="LSD homogeneous groups">
        <text x={40} y={BAR_TOP - 14} fontSize={11} fill={GC.ink} opacity={0.6} fontFamily={GRAPH_FONT}>ס״מ</text>
        <line x1={30} y1={BASE} x2={W - 20} y2={BASE} stroke={GC.axis} />
        {DATA.map((d, i) => {
          const h = barH(d.mean)
          const x = barX(i)
          return (
            <g key={d.name}>
              <rect x={x} y={BASE - h} width={BW} height={h} rx={6} fill={GC.blue} />
              <text x={x + BW / 2} y={BASE - h - 10} textAnchor="middle" fontSize={16} fontWeight={700} fill={GC.ink} fontFamily={GRAPH_FONT}>{d.mean}</text>
              <text x={x + BW / 2} y={BASE + 22} textAnchor="middle" fontSize={14} fill={GC.ink} fontFamily={GRAPH_FONT}>דשן {d.name}</text>
            </g>
          )
        })}
        {groups.map((g, gi) => {
          const x1 = barX(g[0]) + BW * 0.12
          const x2 = barX(g[g.length - 1]) + BW * 0.88
          const y = BASE + 42
          const color = GROUP_COLORS[gi % GROUP_COLORS.length]
          return (
            <g key={gi}>
              <line x1={x1} y1={y - 8} x2={x1} y2={y} stroke={color} strokeWidth={3} />
              <line x1={x2} y1={y - 8} x2={x2} y2={y} stroke={color} strokeWidth={3} />
              <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={3} />
              <text x={(x1 + x2) / 2} y={y + 18} textAnchor="middle" fontSize={12} fontWeight={700} fill={color} fontFamily={GRAPH_FONT}>
                {`{${g.map(idx => DATA[idx].name).join(', ')}}`}
              </text>
            </g>
          )
        })}
      </svg>

      <div id="lsd-formula" style={{ textAlign: 'center', margin: '4px 0 10px', minHeight: 24 }} />

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', margin: '0 0 14px' }}>
        <label htmlFor="lsd-slider" style={{ fontFamily: GRAPH_FONT, fontSize: 14 }}>ערך LSD קריטי: {lsd.toFixed(3)}</label>
        <input id="lsd-slider" type="range" min={0} max={8} step={0.001} value={lsd} onChange={e => setLsd(Number(e.target.value))} style={{ width: 'min(260px, 60%)', accentColor: GC.blue }} />
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        {pairs.map(p => (
          <div key={p.a.name + p.b.name} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13,
            background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 10px',
          }}>
            <span>|דשן {p.a.name} − דשן {p.b.name}| = {p.diff.toFixed(1)}</span>
            <span style={{ fontWeight: p.same ? 700 : 400, color: p.same ? GC.good : GC.ink, opacity: p.same ? 1 : 0.55 }}>
              {p.diff.toFixed(1)} {p.same ? '<' : '≥'} {lsd.toFixed(3)} ← {p.same ? 'אותה קבוצה' : 'קבוצות שונות'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
