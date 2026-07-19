// Observatory (מצפה הדעת) — T1.5 of the Asset Economy.
// A full-screen night-sky overlay where the 10 course topics are stars:
//   DARK   (building level 0) — a dim outline star: an INVITATION. Tap → onOpenTopic.
//   LIT    (building level 1) — a modest gold star. Tap → tiny read-only health tooltip.
//   BRIGHT (building level 2) — larger gold star + glow + constellation lines to
//          adjacent level-2 stars of the same unlock-chain neighborhood.
// Skyways (learner-drawn concept bridges) render as thin dashed gold arcs whose
// opacity is the live edgeStrength projection.
//
// LOCKED DESIGN RULE: NO COINS anywhere in this component — no balance, no
// payouts, no projected earnings. The Observatory is pure competence feedback
// (R13: coin feedback is secondary and lives elsewhere).

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useLearningStore, BUILDING_UNLOCK_CHAIN } from '../../store/learningStore'
import type { CardData } from '../../store/learningStore'
import { HEBREW_LABELS } from '../../data/topicLabels'
import { loadLedger, listSkyways, onLedgerChange } from '../../lib/ledger/ledger'
import type { SkywayEdge } from '../../lib/ledger/types'
import { edgeStrength } from '../../lib/ledger/projections'
import quizBank from '../../data/quiz-bank.json'

// ── Star chart ────────────────────────────────────────────────────────────────
// topicId = quiz-bank topic key; buildingId = its city building (mirrors the
// non-exported BUILDING_TO_TOPIC map in useQuiz.ts — duplicated deliberately,
// we may not edit existing files). x/y are hand-placed percentages forming a
// loose serpentine constellation that follows the unlock chain, so chain
// neighbors sit near each other and level-2 constellation lines read naturally.
interface TopicStar {
  topicId: string
  buildingId: string
  x: number // percent of overlay width  (SVG viewBox space, LTR)
  y: number // percent of overlay height
}

const TOPIC_STARS: TopicStar[] = [
  { topicId: 'mean',                 buildingId: 'power',     x: 14, y: 70 },
  { topicId: 'median',               buildingId: 'housing',   x: 25, y: 56 },
  { topicId: 'std-dev',              buildingId: 'traffic',   x: 19, y: 38 },
  { topicId: 'probability',          buildingId: 'hospital',  x: 33, y: 26 },
  { topicId: 'sampling',             buildingId: 'school',    x: 46, y: 38 },
  { topicId: 'hypothesis-testing',   buildingId: 'research',  x: 55, y: 21 },
  { topicId: 'correlation',          buildingId: 'market',    x: 67, y: 32 },
  { topicId: 'regression',           buildingId: 'bank',      x: 79, y: 45 },
  { topicId: 'binomial',             buildingId: 'city-hall', x: 69, y: 62 },
  { topicId: 'confidence-intervals', buildingId: 'news',      x: 84, y: 74 },
]

const STAR_BY_TOPIC: Record<string, TopicStar> = Object.fromEntries(
  TOPIC_STARS.map(s => [s.topicId, s])
)
const STAR_BY_BUILDING: Record<string, TopicStar> = Object.fromEntries(
  TOPIC_STARS.map(s => [s.buildingId, s])
)

// ── Question → topic map (for per-topic card health + edgeStrength) ──────────
const QUESTION_TOPIC_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  const topics = quizBank.topics as unknown as Record<string, { questions?: { id: string }[] }>
  for (const [topicId, data] of Object.entries(topics)) {
    for (const q of data.questions ?? []) map[q.id] = topicId
  }
  return map
})()

// ── Per-topic SM-2 health (read-only tooltip content) ────────────────────────
interface TopicHealth {
  tracked: number      // cards actually seen at least once
  avgReps: number
  avgIntervalDays: number
  dueNow: number
}

function topicHealth(topicId: string, cards: Record<string, CardData>): TopicHealth {
  const now = Date.now()
  let tracked = 0
  let reps = 0
  let interval = 0
  let dueNow = 0
  for (const [qid, card] of Object.entries(cards)) {
    if (QUESTION_TOPIC_MAP[qid] !== topicId) continue
    if (card.nextReview === 0 && card.lastSeen === null) continue // never seen
    tracked++
    reps += card.repetitions
    interval += card.interval
    if (card.nextReview > 0 && card.nextReview <= now) dueNow++
  }
  return {
    tracked,
    avgReps: tracked ? Math.round((reps / tracked) * 10) / 10 : 0,
    avgIntervalDays: tracked ? Math.round(interval / tracked) : 0,
    dueNow,
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function Observatory({ userId, onOpenTopic, onClose }: {
  userId: string
  onOpenTopic: (topicId: string) => void
  onClose: () => void
}) {
  const cards = useLearningStore(s => s.cards)
  const buildingProgress = useLearningStore(s => s.buildingProgress)

  // Ledger live-refresh: bump a version on every append so skyway arcs +
  // strengths recompute without a reload.
  const [ledgerTick, setLedgerTick] = useState(0)
  useEffect(() => {
    const unsubscribe = onLedgerChange(() => setLedgerTick(t => t + 1))
    return unsubscribe
  }, [])

  // Escape closes the overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Read-only tooltip target (lit/bright stars only).
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  const skyways: SkywayEdge[] = useMemo(
    () => listSkyways(loadLedger(userId)),
    [userId, ledgerTick]
  )

  const levelOf = (buildingId: string): 0 | 1 | 2 =>
    buildingProgress[buildingId]?.level ?? 0

  // Constellation lines: pairs of ADJACENT unlock-chain buildings where BOTH
  // reached level 2 (the "neighborhood" of a bright star). Only core topic
  // buildings participate — advanced landmarks have no star.
  const constellationPairs = useMemo(() => {
    const pairs: { a: TopicStar; b: TopicStar }[] = []
    for (const [child, parent] of Object.entries(BUILDING_UNLOCK_CHAIN)) {
      if (!parent) continue
      const a = STAR_BY_BUILDING[child]
      const b = STAR_BY_BUILDING[parent]
      if (!a || !b) continue
      if (levelOf(child) === 2 && levelOf(parent) === 2) pairs.push({ a, b })
    }
    return pairs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingProgress])

  // Skyway arcs between topic stars, opacity = live edge strength projection.
  const skywayArcs = useMemo(() => {
    return skyways.flatMap(edge => {
      const from = STAR_BY_TOPIC[edge.sourceTopicId]
      const to = STAR_BY_TOPIC[edge.targetTopicId]
      if (!from || !to) return []
      const strength = edgeStrength(edge, cards, QUESTION_TOPIC_MAP)
      return [{ edge, from, to, strength }]
    })
  }, [skyways, cards])

  const handleStarClick = (star: TopicStar) => {
    const level = levelOf(star.buildingId)
    if (level === 0) {
      // The invitation moment: a dark star deep-links straight into the lesson.
      onOpenTopic(star.topicId)
    } else {
      setSelectedTopic(prev => (prev === star.topicId ? null : star.topicId))
    }
  }

  const selectedStar = selectedTopic ? STAR_BY_TOPIC[selectedTopic] : null
  const selectedHealth = selectedTopic ? topicHealth(selectedTopic, cards) : null

  // ── Styles ──────────────────────────────────────────────────────────────────

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    // Viewport-fixed full-screen overlay → inset covers all edges (no logical
    // ambiguity: it fills the screen in both directions).
    inset: 0,
    zIndex: 1000,
    // The ONE approved hardcoded gradient: the Observatory's deep-navy night
    // sky, a dark translucent wash over the app (per T1.5 spec).
    background: 'linear-gradient(180deg, rgba(10,16,38,0.97), rgba(16,24,52,0.97))',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    flexShrink: 0,
  }

  const titleStyle: CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--sh-gold)',
    margin: 0,
  }

  const closeBtnStyle: CSSProperties = {
    minWidth: 44,
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
    cursor: 'pointer',
  }

  const skyStyle: CSSProperties = {
    position: 'relative',
    flex: 1,
    minHeight: 0,
  }

  const footerStyle: CSSProperties = {
    flexShrink: 0,
    padding: '10px 16px 16px',
    textAlign: 'center',
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
  }

  // A star button. NOTE on physical `left`: stars must land exactly on the SVG
  // line/arc endpoints, and SVG viewBox coordinates are physical-LTR and do NOT
  // mirror under dir=rtl. Inside this viewport-fixed overlay we therefore
  // position with physical left/top for BOTH layers so they share one
  // coordinate space (using insetInlineStart here would mirror the stars but
  // not the lines, tearing the constellation apart).
  // The 44px touch box is centered ON the star coordinate so the glyph lands
  // exactly where the SVG lines/arcs terminate; the Hebrew label hangs below
  // via absolute positioning so it does NOT shift the glyph off-center.
  const starBtnStyle = (star: TopicStar): CSSProperties => ({
    position: 'absolute',
    left: `${star.x}%`,
    top: `${star.y}%`,
    transform: 'translate(-50%, -50%)',
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  })

  const glyphStyle = (level: 0 | 1 | 2): CSSProperties => {
    if (level === 2) {
      return {
        display: 'inline-block',
        fontSize: 30,
        lineHeight: 1,
        color: 'var(--sh-gold)',
        textShadow: '0 0 12px var(--sh-gold)',
      }
    }
    if (level === 1) {
      return {
        display: 'inline-block',
        fontSize: 21,
        lineHeight: 1,
        color: 'var(--sh-gold)',
      }
    }
    return {
      display: 'inline-block',
      fontSize: 16,
      lineHeight: 1,
      color: 'rgba(255,255,255,0.45)',
    }
  }

  const labelStyle: CSSProperties = {
    position: 'absolute',
    top: '100%',
    // Physical left — same shared coordinate space as the stars/SVG (see
    // starBtnStyle comment); centers the label under the glyph.
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 14, // task range 12-14px; 14 also satisfies the global font floor
    color: 'rgba(255,255,255,0.75)',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  }

  const tooltipStyle = (star: TopicStar): CSSProperties => ({
    position: 'absolute',
    // Same physical coordinate space as the stars (see starBtnStyle comment).
    left: `${star.x}%`,
    // 48px clears the 44px touch box + the label hanging below the star.
    top: star.y < 55 ? `calc(${star.y}% + 48px)` : undefined,
    bottom: star.y >= 55 ? `calc(${100 - star.y}% + 44px)` : undefined,
    transform: 'translateX(-50%)',
    maxWidth: 220,
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    pointerEvents: 'none',
    zIndex: 2,
  })

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="מצפה הדעת">
      {/* Hover-pulse for dark (invitation) stars; calmed under reduced motion. */}
      <style>{`
        @keyframes obs-star-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.35); opacity: 1; }
        }
        .obs-star-btn:hover .obs-glyph-dark,
        .obs-star-btn:focus-visible .obs-glyph-dark {
          animation: obs-star-pulse 1.2s ease-in-out infinite;
        }
        .obs-star-btn:focus-visible { outline: 1px solid var(--sh-gold); outline-offset: 2px; border-radius: 10px; }
        @media (prefers-reduced-motion: reduce) {
          .obs-star-btn:hover .obs-glyph-dark,
          .obs-star-btn:focus-visible .obs-glyph-dark {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>

      <div style={headerStyle}>
        <h2 style={titleStyle}>מצפה הדעת</h2>
        <button type="button" style={closeBtnStyle} onClick={onClose} aria-label="סגירת המצפה">
          ✕
        </button>
      </div>

      <div style={skyStyle} onClick={() => setSelectedTopic(null)}>
        {/* Line layer — constellation lines + skyway arcs. Shares the stars'
            physical coordinate space (percent of the sky area). */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          {constellationPairs.map(({ a, b }, i) => (
            <line
              key={`constellation-${i}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="var(--sh-gold)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              opacity={0.35}
            />
          ))}
          {skywayArcs.map(({ edge, from, to, strength }) => {
            // Gentle upward bow so bridges read as arcs, not chain lines.
            const cx = (from.x + to.x) / 2
            const cy = (from.y + to.y) / 2 - 9
            return (
              <path
                key={edge.edgeId}
                d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
                fill="none"
                stroke="var(--sh-gold)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                strokeDasharray="4 4"
                opacity={Math.max(0.1, Math.min(1, strength))}
              />
            )
          })}
        </svg>

        {TOPIC_STARS.map(star => {
          const level = levelOf(star.buildingId)
          const name = HEBREW_LABELS[star.topicId] ?? star.topicId
          return (
            <button
              key={star.topicId}
              type="button"
              className="obs-star-btn"
              style={starBtnStyle(star)}
              onClick={e => { e.stopPropagation(); handleStarClick(star) }}
              aria-label={
                level === 0
                  ? `${name} — נושא שמחכה לך, הקשה פותחת את השיעור`
                  : `${name} — הצגת מצב התרגול`
              }
            >
              <span
                className={level === 0 ? 'obs-glyph-dark' : undefined}
                style={glyphStyle(level)}
                aria-hidden="true"
              >
                {level === 0 ? '☆' : '★'}
              </span>
              <span style={labelStyle}>{name}</span>
            </button>
          )
        })}

        {selectedStar && selectedHealth && (
          <div style={tooltipStyle(selectedStar)} role="status">
            <div style={{ fontWeight: 700, color: 'var(--sh-gold)', marginBlockEnd: 2 }}>
              {HEBREW_LABELS[selectedStar.topicId] ?? selectedStar.topicId}
            </div>
            {selectedHealth.tracked === 0 ? (
              <div>עוד אין נתוני תרגול לנושא הזה</div>
            ) : (
              <>
                <div>
                  {selectedHealth.tracked} שאלות במעקב · {selectedHealth.avgReps} חזרות בממוצע
                </div>
                <div>
                  מרווח חזרה ממוצע: ~{selectedHealth.avgIntervalDays} ימים
                  {selectedHealth.dueNow > 0 ? ` · ${selectedHealth.dueNow} ממתינות לחזרה` : ''}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div style={footerStyle}>כוכב כהה = נושא שמחכה לך</div>
    </div>
  )
}

export default Observatory
