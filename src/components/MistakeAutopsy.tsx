import { useState } from 'react'

export type ErrorTag = 'confused-terms' | 'calculation-error' | 'careless' | 'concept-unclear'

const TAGS: {
  id: ErrorTag
  icon: string
  labelHe: string
  subHe: string
  easeAdjust: number
}[] = [
  { id: 'confused-terms',    icon: '🔀', labelHe: 'בלבול מושגים',    subHe: 'ערבבתי בין שני מושגים',      easeAdjust: -0.15 },
  { id: 'calculation-error', icon: '🔢', labelHe: 'שגיאת חישוב',     subHe: 'הבנתי — טעיתי בחשבון',       easeAdjust: -0.10 },
  { id: 'careless',          icon: '👁',  labelHe: 'חוסר תשומת לב',  subHe: 'קראתי בחיפזון / טעות קטנה',  easeAdjust: -0.05 },
  { id: 'concept-unclear',   icon: '❓', labelHe: 'לא הבנתי',         subHe: 'המושג עצמו לא ברור לי',      easeAdjust: -0.25 },
]

interface Props {
  onDone: (tag: ErrorTag | null) => void
}

export default function MistakeAutopsy({ onDone }: Props) {
  const [selected, setSelected] = useState<ErrorTag | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const handleSelect = (tag: ErrorTag) => {
    if (confirmed) return
    setSelected(tag)
    setConfirmed(true)
    setTimeout(() => onDone(tag), 380)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="מה גרם לטעות?"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(10,15,35,0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        padding: '0 0 24px',
        animation: 'autopsy-bg-in 0.18s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onDone(null) }}
    >
      <style>{`
        @keyframes autopsy-bg-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes autopsy-card-in { from { transform: translateY(32px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .autopsy-tile:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(51,81,202,0.18) !important; }
        .autopsy-tile:focus-visible { outline: 2px solid var(--sh-sidebar-active, #254A9F); outline-offset: 2px; }
      `}</style>

      <div
        dir="rtl"
        style={{
          background: 'var(--sh-q-card-bg, rgba(255,255,255,0.88))',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px 24px 16px 16px',
          padding: '24px 24px 20px',
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 -4px 40px rgba(31,62,108,0.18)',
          border: '1px solid rgba(255,255,255,0.55)',
          animation: 'autopsy-card-in 0.22s cubic-bezier(.34,1.3,.64,1)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 18 }}>
          <div style={{
            fontFamily: "'Rubik', sans-serif",
            fontWeight: 700,
            fontSize: 17,
            color: 'var(--sh-text-dark)',
            marginBottom: 4,
          }}>
            🔍 מה גרם לטעות?
          </div>
          <div style={{ fontSize: 12, color: 'var(--sh-text-light)' }}>
            עוזר לנו לתזמן את החזרה בצורה חכמה יותר
          </div>
        </div>

        {/* 2×2 grid of tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {TAGS.map(t => {
            const isSelected = selected === t.id
            const isOther = selected !== null && selected !== t.id
            return (
              <button
                key={t.id}
                className="autopsy-tile"
                onClick={() => handleSelect(t.id)}
                disabled={confirmed}
                aria-pressed={isSelected}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 4,
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(51,81,202,0.12), rgba(51,81,202,0.06))'
                    : 'var(--sh-answer-bg, rgba(255,255,255,0.70))',
                  border: `1.5px solid ${isSelected ? 'rgba(51,81,202,0.40)' : 'var(--sh-answer-border, rgba(51,81,202,0.15))'}`,
                  borderRadius: 14,
                  padding: '12px 14px',
                  cursor: confirmed ? 'default' : 'pointer',
                  textAlign: 'right',
                  opacity: isOther ? 0.45 : 1,
                  transition: 'all 0.15s ease',
                  transform: isSelected ? 'scale(1.02)' : 'translateY(0)',
                  boxShadow: isSelected ? '0 4px 16px rgba(51,81,202,0.14)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: 22 }}>{t.icon}</span>
                <span style={{
                  fontFamily: "'Rubik', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: isSelected ? 'var(--sh-sidebar-active, #254A9F)' : 'var(--sh-text-dark)',
                  lineHeight: 1.3,
                }}>
                  {t.labelHe}
                </span>
                <span style={{ fontSize: 11, color: 'var(--sh-text-light)', lineHeight: 1.4 }}>
                  {t.subHe}
                </span>
              </button>
            )
          })}
        </div>

        {/* Skip */}
        <button
          onClick={() => onDone(null)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'var(--sh-text-light)',
            fontSize: 12,
            cursor: 'pointer',
            padding: '6px 0',
            fontFamily: "'Assistant', sans-serif",
          }}
        >
          דלג (לא אשפיע על הציון)
        </button>
      </div>
    </div>
  )
}

/** Ease-factor delta for each error tag — used in riskScore adjustments */
export const ERROR_TAG_EASE_ADJUST: Record<ErrorTag, number> = Object.fromEntries(
  TAGS.map(t => [t.id, t.easeAdjust])
) as Record<ErrorTag, number>
