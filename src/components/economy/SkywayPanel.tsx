// SkywayPanel (לסלול כביש אוויר) — T1.3 of the Asset Economy.
// Full-screen overlay where the learner draws a conceptual bridge (skyway)
// between two MASTERED topics (both buildings at level 2 — gate state is
// visible BEFORE effort, R10 spirit). Three steps: pick endpoints → name the
// relation (typed chip + free-text label with a live structural check) →
// submit through ledger.drawSkyway (which re-enforces every gate).
//
// Below the builder: the learner's existing skyways as live rows — endpoint
// names, relation chip, label, a strength meter driven by the edgeStrength
// projection (bar width + pip speed), and this ISO week's dividend income.
// A decayed bridge (weak endpoints) empties its bar and reverts to the
// quiet-neutral "not yet built" skin — the copy NEVER says losing (D6/R4).
//
// R13: no projected earnings before the creative act — the submit button and
// builder never show a coin figure; the small '+10' tick appears only AFTER
// a successful draw, secondary to the competence confirmation line.

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useLearningStore } from '../../store/learningStore'
import {
  loadLedger,
  listSkyways,
  drawSkyway,
  onLedgerChange,
  RELATION_TYPES,
} from '../../lib/ledger/ledger'
import type { Ledger, SkywayEdge } from '../../lib/ledger/types'
import { edgeStrength } from '../../lib/ledger/projections'
import { TOPICS, TOPIC_TO_BUILDING, questionTopicMap } from '../../lib/ledger/topicMeta'
import { HEBREW_LABELS } from '../../data/topicLabels'

// ── Structural label check (mirrors ledger.ts GENERIC_LABELS, which is not
//    exported; kept in sync deliberately — ledger re-validates on submit) ─────
const GENERIC_LABELS: string[] = ['קשור ל', 'דומה ל', 'חיבור', 'קשר', 'דבר']

function labelPassesStructuralCheck(label: string): boolean {
  const trimmed = label.trim()
  return trimmed.length >= 4 && !GENERIC_LABELS.includes(trimmed)
}

// ── ISO week key (same Thursday-rule algorithm as ledger.ts, not exported) ───
function isoWeekKey(ts: number): string {
  const src = new Date(ts)
  const d = new Date(Date.UTC(src.getFullYear(), src.getMonth(), src.getDate()))
  const dayOfWeek = d.getUTCDay() || 7 // Mon=1 … Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

/** Dividends this ISO week for one bridge. INVARIANT (ledger.ts): 'payout'
 *  events carrying a refId are exactly the bridge dividends. */
function dividendThisWeek(ledger: Ledger, edgeId: string): number {
  const week = isoWeekKey(Date.now())
  return ledger.assets
    .filter(a => a.type === 'payout' && a.refId === edgeId && isoWeekKey(a.ts) === week)
    .reduce((sum, a) => sum + a.coinDelta, 0)
}

/** Below this projection value a bridge renders in the quiet-neutral skin. */
const DECAYED_STRENGTH = 0.25

// Ledger daily-cap reason → the panel's gentler copy (approved D-copy).
const LEDGER_DAILY_CAP_FRAGMENT = 'מכסת'
const DAILY_CAP_COPY = 'מכסת היום הושלמה — הגשרים הטובים נבנים לאט'

type SubmitResult =
  | { kind: 'success'; coins: number }
  | { kind: 'error'; reason: string }

// ── Component ────────────────────────────────────────────────────────────────

export function SkywayPanel({ userId, onClose }: {
  userId: string
  onClose: () => void
}) {
  const buildingProgress = useLearningStore(s => s.buildingProgress)
  const adminMode = useLearningStore(s => s.adminMode)
  const cards = useLearningStore(s => s.cards)

  // Live ledger refresh — recompute skyway list/dividends on every append.
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

  const [sourceTopic, setSourceTopic] = useState<string | null>(null)
  const [targetTopic, setTargetTopic] = useState<string | null>(null)
  const [relationType, setRelationType] = useState<string | null>(null)
  const [label, setLabel] = useState('')
  const [result, setResult] = useState<SubmitResult | null>(null)

  const ledger = useMemo(() => loadLedger(userId), [userId, ledgerTick])
  const skyways = useMemo(() => listSkyways(ledger), [ledger])

  const topicUnlocked = (topicId: string): boolean => {
    if (adminMode) return true
    const buildingId = TOPIC_TO_BUILDING[topicId]
    return buildingId ? (buildingProgress[buildingId]?.level ?? 0) === 2 : false
  }

  const pairExists = (a: string, b: string): boolean =>
    skyways.some(
      s =>
        (s.sourceTopicId === a && s.targetTopicId === b) ||
        (s.sourceTopicId === b && s.targetTopicId === a)
    )

  const labelTrimmed = label.trim()
  const labelValid = labelPassesStructuralCheck(label)
  const showLabelHint = labelTrimmed.length > 0 && !labelValid

  const canSubmit =
    sourceTopic !== null &&
    targetTopic !== null &&
    relationType !== null &&
    labelValid

  const handleSubmit = () => {
    if (!canSubmit || sourceTopic === null || targetTopic === null || relationType === null) return
    const outcome = drawSkyway(userId, {
      sourceTopicId: sourceTopic,
      targetTopicId: targetTopic,
      relationType,
      label: labelTrimmed,
    })
    if (outcome.ok) {
      setResult({ kind: 'success', coins: outcome.coins })
      setSourceTopic(null)
      setTargetTopic(null)
      setRelationType(null)
      setLabel('')
    } else {
      const reason = outcome.reason.includes(LEDGER_DAILY_CAP_FRAGMENT)
        ? DAILY_CAP_COPY
        : outcome.reason
      setResult({ kind: 'error', reason })
    }
  }

  // ── Styles ──────────────────────────────────────────────────────────────────

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    // Viewport-fixed full-screen overlay → inset covers all edges.
    inset: 0,
    zIndex: 1000,
    // Dark translucent wash (rgba surface, matching the economy-overlay family).
    background: 'rgba(10,16,38,0.97)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
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

  const scrollStyle: CSSProperties = {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 16px 24px',
  }

  const contentStyle: CSSProperties = {
    maxWidth: 640,
    marginInline: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  }

  const explainerStyle: CSSProperties = {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    margin: 0,
    lineHeight: 1.5,
  }

  const stepTitleStyle: CSSProperties = {
    fontSize: 15,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.85)',
    margin: '0 0 8px',
  }

  const pickersGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  }

  const pickerColStyle: CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  }

  const pickerHeadStyle: CSSProperties = {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBlockEnd: 2,
  }

  const topicChipStyle = (opts: { unlocked: boolean; blocked: boolean; selected: boolean }): CSSProperties => {
    const { unlocked, blocked, selected } = opts
    if (!unlocked || blocked) {
      // Dashed, desaturated — the gate is visible BEFORE the tap (R10 spirit).
      return {
        minHeight: 44,
        padding: '6px 10px',
        borderRadius: 10,
        border: '1px dashed rgba(255,255,255,0.25)',
        background: 'transparent',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        textAlign: 'start',
        cursor: 'default',
      }
    }
    return {
      minHeight: 44,
      padding: '6px 10px',
      borderRadius: 10,
      border: selected ? '1px solid var(--sh-gold)' : '1px solid rgba(255,255,255,0.12)',
      background: selected ? 'var(--sh-gold)' : 'rgba(255,255,255,0.06)',
      color: selected ? 'var(--sh-text-dark)' : 'var(--sh-gold)',
      fontWeight: selected ? 700 : 400,
      fontSize: 14,
      textAlign: 'start',
      cursor: 'pointer',
    }
  }

  const relationRowStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  }

  const relationChipStyle = (selected: boolean): CSSProperties => ({
    minHeight: 44,
    padding: '6px 14px',
    borderRadius: 22,
    border: selected ? '1px solid var(--sh-gold)' : '1px solid rgba(255,255,255,0.12)',
    background: selected ? 'var(--sh-gold)' : 'rgba(255,255,255,0.06)',
    color: selected ? 'var(--sh-text-dark)' : 'rgba(255,255,255,0.85)',
    fontWeight: selected ? 700 : 400,
    fontSize: 14,
    cursor: 'pointer',
  })

  const labelInputStyle: CSSProperties = {
    width: '100%',
    minHeight: 44,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
  }

  // Gentle, corrective — never red (R10).
  const labelHintStyle: CSSProperties = {
    fontSize: 14,
    color: 'var(--sh-gold)',
    opacity: 0.85,
    marginBlockStart: 6,
  }

  const submitBtnStyle = (enabled: boolean): CSSProperties => ({
    minHeight: 44,
    padding: '10px 24px',
    borderRadius: 12,
    border: 'none',
    background: enabled ? 'var(--sh-gold)' : 'rgba(255,255,255,0.06)',
    color: enabled ? 'var(--sh-text-dark)' : 'rgba(255,255,255,0.4)',
    fontSize: 15,
    fontWeight: 700,
    cursor: enabled ? 'pointer' : 'default',
    alignSelf: 'start',
  })

  const successStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
  }

  const coinTickStyle: CSSProperties = {
    fontSize: 14, // secondary to the competence line (R13)
    color: 'var(--sh-gold)',
    opacity: 0.9,
  }

  const errorStyle: CSSProperties = {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)', // plain, neutral — no red (R10)
  }

  const listTitleStyle: CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--sh-gold)',
    margin: '8px 0 0',
  }

  const rowStyle = (decayed: boolean): CSSProperties => ({
    background: decayed ? 'transparent' : 'rgba(255,255,255,0.06)',
    // Decayed → quiet-neutral "not yet built" skin (D6): dashed, muted.
    border: decayed ? '1px dashed rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  })

  const rowTopStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  }

  const endpointsStyle = (decayed: boolean): CSSProperties => ({
    fontSize: 15,
    fontWeight: 700,
    color: decayed ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.9)',
  })

  const rowRelationChipStyle = (decayed: boolean): CSSProperties => ({
    fontSize: 14,
    padding: '2px 10px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.12)',
    color: decayed ? 'rgba(255,255,255,0.4)' : 'var(--sh-gold)',
    background: 'rgba(255,255,255,0.06)',
  })

  const rowLabelStyle = (decayed: boolean): CSSProperties => ({
    fontSize: 14,
    color: decayed ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)',
    margin: 0,
  })

  const meterTrackStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: 220,
    height: 6,
    borderRadius: 3,
    background: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  }

  const meterFillStyle = (strength: number): CSSProperties => ({
    position: 'relative',
    height: '100%',
    width: `${Math.round(strength * 100)}%`,
    borderRadius: 3,
    background: 'var(--sh-gold)',
    opacity: 0.85,
  })

  const rowFooterStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  }

  const dividendStyle = (decayed: boolean): CSSProperties => ({
    fontSize: 14,
    color: decayed ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)',
    whiteSpace: 'nowrap',
  })

  const quietNoteStyle: CSSProperties = {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  }

  const emptyListStyle: CSSProperties = {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    padding: '12px 0',
  }

  // ── Render helpers ──────────────────────────────────────────────────────────

  const renderPicker = (
    heading: string,
    selected: string | null,
    other: string | null,
    onPick: (topicId: string) => void
  ) => (
    <div style={pickerColStyle} role="group" aria-label={heading}>
      <div style={pickerHeadStyle}>{heading}</div>
      {TOPICS.map(t => {
        const unlocked = topicUnlocked(t.topicId)
        const isOther = other !== null && other === t.topicId
        const duplicates = other !== null && !isOther && pairExists(t.topicId, other)
        const blocked = isOther || duplicates
        const isSelected = selected === t.topicId
        const inert = !unlocked || blocked
        const tooltip = !unlocked
          ? 'עבור שער שליפה בנושא זה קודם'
          : isOther
            ? 'הנושא הזה כבר נבחר בצד השני'
            : duplicates
              ? 'כבר קיים גשר בין שני הנושאים האלה'
              : undefined
        return (
          <button
            key={t.topicId}
            type="button"
            style={topicChipStyle({ unlocked, blocked, selected: isSelected })}
            // Locked/blocked chips stay in the tab order and announce their
            // state — aria-disabled + inert onClick, never HTML disabled.
            aria-disabled={inert || undefined}
            aria-pressed={isSelected}
            title={tooltip}
            onClick={() => { if (!inert) onPick(t.topicId) }}
          >
            {t.hebrewName}
          </button>
        )
      })}
    </div>
  )

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="לסלול כביש אוויר">
      {/* Pip glides along the filled span; speed grows with strength. The
          keyframes animate inset-inline-start so travel direction follows the
          RTL page. Stilled under reduced motion. */}
      <style>{`
        @keyframes sky-pip-run {
          from { inset-inline-start: 0%; }
          to { inset-inline-start: calc(100% - 6px); }
        }
        .sky-pip {
          animation-name: sky-pip-run;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
        }
        @media (prefers-reduced-motion: reduce) {
          .sky-pip { animation: none; }
        }
      `}</style>

      <div style={headerStyle}>
        <h2 style={titleStyle}>לסלול כביש אוויר</h2>
        <button type="button" style={closeBtnStyle} onClick={onClose} aria-label="סגירת הפאנל">
          ✕
        </button>
      </div>

      <div style={scrollStyle}>
        <div style={contentStyle}>
          <p style={explainerStyle}>
            חבר שני רעיונות שאתה כבר שולט בהם — והחיבור ישלם לך על כל זכירה עתידית
          </p>

          {/* STEP 1 — endpoints */}
          <section>
            <h3 style={stepTitleStyle}>שלב 1 · בחרו שני נושאים</h3>
            <div style={pickersGridStyle}>
              {renderPicker('נושא ראשון', sourceTopic, targetTopic, id => {
                setSourceTopic(prev => (prev === id ? null : id))
                setResult(null)
              })}
              {renderPicker('נושא שני', targetTopic, sourceTopic, id => {
                setTargetTopic(prev => (prev === id ? null : id))
                setResult(null)
              })}
            </div>
          </section>

          {/* STEP 2 — relation type + label */}
          <section>
            <h3 style={stepTitleStyle}>שלב 2 · מה מחבר ביניהם?</h3>
            <div style={relationRowStyle} role="group" aria-label="סוג הקשר">
              {RELATION_TYPES.map(rt => (
                <button
                  key={rt}
                  type="button"
                  style={relationChipStyle(relationType === rt)}
                  aria-pressed={relationType === rt}
                  onClick={() => { setRelationType(prev => (prev === rt ? null : rt)); setResult(null) }}
                >
                  {rt}
                </button>
              ))}
            </div>
            <div style={{ marginBlockStart: 10 }}>
              <input
                type="text"
                value={label}
                onChange={e => { setLabel(e.target.value); setResult(null) }}
                placeholder="נסח את הקשר במילים שלך"
                aria-label="תיאור הקשר במילים שלך"
                style={labelInputStyle}
                maxLength={120}
              />
              {showLabelHint && (
                <div style={labelHintStyle} role="status">
                  נסח ספציפי יותר — מה בדיוק מקשר?
                </div>
              )}
            </div>
          </section>

          {/* STEP 3 — submit. No coin figure before the act (R13). */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              style={submitBtnStyle(canSubmit)}
              aria-disabled={!canSubmit || undefined}
              onClick={() => { if (canSubmit) handleSubmit() }}
            >
              למתוח את הגשר
            </button>

            {result?.kind === 'success' && (
              <div style={successStyle} role="status">
                <span>הגשר נמתח. הוא ישלם דיבידנד על כל זכירה בשני הקצוות.</span>
                <span style={coinTickStyle}>+{result.coins}</span>
              </div>
            )}
            {result?.kind === 'error' && (
              <div style={errorStyle} role="status">{result.reason}</div>
            )}
          </section>

          {/* Existing skyways */}
          <section>
            <h3 style={listTitleStyle}>הגשרים שלך</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBlockStart: 10 }}>
              {skyways.length === 0 && (
                <div style={emptyListStyle}>עוד אין גשרים — הראשון מחכה למעלה</div>
              )}
              {[...skyways]
                .sort((a, b) => b.createdTs - a.createdTs)
                .map((edge: SkywayEdge) => {
                  const strength = edgeStrength(edge, cards, questionTopicMap)
                  const decayed = strength < DECAYED_STRENGTH
                  const shown = decayed ? 0 : strength
                  // Pip speed follows strength: strong bridge → lively pip.
                  const pipDurationSec = 1.2 + (1 - strength) * 3
                  const weekIncome = dividendThisWeek(ledger, edge.edgeId)
                  const sourceHe = HEBREW_LABELS[edge.sourceTopicId] ?? edge.sourceTopicId
                  const targetHe = HEBREW_LABELS[edge.targetTopicId] ?? edge.targetTopicId
                  return (
                    <div key={edge.edgeId} style={rowStyle(decayed)}>
                      <div style={rowTopStyle}>
                        <span style={endpointsStyle(decayed)}>
                          {sourceHe} ⇄ {targetHe}
                        </span>
                        <span style={rowRelationChipStyle(decayed)}>{edge.relationType}</span>
                      </div>
                      <p style={rowLabelStyle(decayed)}>{edge.label}</p>
                      <div style={rowFooterStyle}>
                        <div style={meterTrackStyle} aria-hidden="true">
                          <div style={meterFillStyle(shown)}>
                            {!decayed && (
                              <span
                                className="sky-pip"
                                style={{
                                  position: 'absolute',
                                  insetInlineStart: 0,
                                  top: 0,
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: 'var(--sh-cream)',
                                  animationDuration: `${pipDurationSec.toFixed(2)}s`,
                                }}
                              />
                            )}
                          </div>
                        </div>
                        {decayed ? (
                          // Quiet-neutral copy — never "losing" (D6/R4).
                          <span style={quietNoteStyle}>עדיין לא נבנה</span>
                        ) : (
                          <span style={dividendStyle(decayed)}>
                            הכנסה השבוע: {weekIncome}c
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default SkywayPanel
