/**
 * LessonComplete — the end of a theory unit, as a moment rather than a notice.
 *
 * What it replaces: a gold pill that slid in at the top of the board reading
 * "<building> הושלם — העיר שלך גדלה" and vanished after a few seconds. It
 * appeared over the slide, said something the reader had no way to act on,
 * and took itself away before they could.
 *
 * What it is now, per Shirli, in the shape a casual game uses: the screen
 * stops, the thing you earned is shown, you collect it, the meter moves, and
 * the next thing to do is the button under your hand.
 *
 * The numbers are the real ones. `completeLesson` in learningStore awards 5 XP
 * and a level is 100 XP (XP_PER_LEVEL, matching the account menu), so the bar
 * fills from the XP the reader actually has to the XP they actually get. The
 * collect button is what calls onCollect — the award happens when the reader
 * takes it, not before, which is why the meter has something to animate.
 */
import { useEffect, useRef, useState } from 'react'
import cityBlock from './glass/cityBlock.json'

const XP_PER_LEVEL = 100
const XP_FOR_LESSON = 5        // learningStore.completeLesson
const CORAL = '#FF854C'        // progress and achievement — the one place it lives
const INK = '#254A9F'
const DEEP = '#18247E'

/**
 * The asset, cut out of the city render.
 *
 * cityBlock.json carries a percentage bbox per building inside the 1400×860
 * city-block.webp — the same artwork the board draws behind the glass. So what
 * the reader collects here is literally the building that appears in their
 * city, at the angle they will see it, rather than an icon standing in for it.
 * The crop is scaled to fit the box and centred in it; `maxWidth: none` because
 * the app's reset caps images at 100% and this one has to be larger than its
 * frame for the crop to work.
 */
function CityAsset({ building, size = 132 }: { building?: string; size?: number }) {
  const box = building ? (cityBlock.buildings as Record<string, { left: number; top: number; right: number; bottom: number }>)[building] : undefined
  if (!box) return null
  const IW = cityBlock.width, IH = cityBlock.height
  const cropW = (box.right - box.left) / 100 * IW
  const cropH = (box.bottom - box.top) / 100 * IH
  const pad = 10
  const scale = Math.min((size - pad * 2) / cropW, (size - pad * 2) / cropH)
  return (
    <div style={{
      width: size, height: size, margin: '0 auto 14px',
      position: 'relative', overflow: 'hidden',
      borderRadius: 26,
      background: 'radial-gradient(120% 110% at 50% 20%, #EAF1FF 0%, #D6E4FB 60%, #C3D6F7 100%)',
      boxShadow: '0 14px 30px rgba(51,81,202,0.26), inset 0 1px 0 rgba(255,255,255,0.8)',
    }}>
      <img
        src={`${import.meta.env.BASE_URL}glass/city-block.webp`}
        alt=""
        aria-hidden
        draggable={false}
        style={{
          position: 'absolute',
          width: IW * scale, height: IH * scale, maxWidth: 'none',
          left: -(box.left / 100 * IW * scale) + (size - cropW * scale) / 2,
          top: -(box.top / 100 * IH * scale) + (size - cropH * scale) / 2,
          imageRendering: 'auto',
        }}
      />
    </div>
  )
}

export default function LessonComplete({ open, building, buildingName, xp, gain = XP_FOR_LESSON, onCollect, onPractise, onClose }: {
  open: boolean
  /** the city building id this topic raised, e.g. "city-hall" */
  building?: string
  /** its Hebrew name, e.g. "עיריה" */
  buildingName?: string
  /** the reader's XP *before* the award */
  xp: number
  /** what collecting is actually worth — 0 when the unit was finished before,
      because learningStore.completeLesson returns early for a lesson already
      in completedLessons. A meter that counts up 5 the second time round is
      showing something that did not happen. */
  gain?: number
  /** award the lesson (learningStore.completeLesson) — fired once, on collect */
  onCollect: () => void
  onPractise: () => void
  onClose: () => void
}) {
  const [collected, setCollected] = useState(false)
  /* The XP the reader had when the dialog opened, snapshotted.
     `xp` is live from the store, so collecting changes it — and watching the
     live value here meant the award reset the dialog it was supposed to
     animate: the label flipped back to "אסוף" and the bar jumped instead of
     filling. The meter runs on the snapshot; only `open` resets it. */
  const [baseXp, setBaseXp] = useState(xp)
  const [shownXp, setShownXp] = useState(xp)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setCollected(false)
    setBaseXp(xp)
    setShownXp(xp)
    cardRef.current?.focus()
    // `xp` is deliberately not a dependency — see above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // count the meter up over ~900ms once collected, so the number and the bar
  // move together rather than snapping
  useEffect(() => {
    if (!collected) return
    const from = baseXp, to = baseXp + gain
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900)
      const eased = 1 - Math.pow(1 - t, 3)
      setShownXp(Math.round(from + (to - from) * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [collected, baseXp, gain])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const level = Math.floor(shownXp / XP_PER_LEVEL) + 1
  const inLevel = shownXp % XP_PER_LEVEL
  const pct = (inLevel / XP_PER_LEVEL) * 100

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="סיימת את התיאוריה"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        background: 'rgba(11,27,62,0.44)',
        backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
        animation: 'ws-done-scrim .22s ease-out',
      }}
    >
      <style>{`
        @keyframes ws-done-scrim { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ws-done-card {
          0%   { opacity: 0; transform: translateY(14px) scale(.94) }
          60%  { opacity: 1; transform: translateY(0) scale(1.015) }
          100% { opacity: 1; transform: translateY(0) scale(1) }
        }
        @keyframes ws-done-asset {
          0%   { transform: scale(.7) rotate(-8deg); opacity: 0 }
          70%  { transform: scale(1.06) rotate(2deg); opacity: 1 }
          100% { transform: scale(1) rotate(0); opacity: 1 }
        }
        @keyframes ws-done-pop { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(-18px) } }
        @media (prefers-reduced-motion: reduce) {
          [data-ws-done-card], [data-ws-done-asset] { animation: none !important }
        }
      `}</style>

      <div
        ref={cardRef}
        tabIndex={-1}
        data-ws-done-card
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(420px, 100%)',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F2F6FE 100%)',
          borderRadius: 24,
          padding: '30px 30px 26px',
          textAlign: 'center',
          boxShadow: '0 28px 70px rgba(11,27,62,0.38)',
          border: '1px solid rgba(255,255,255,0.9)',
          fontFamily: "'Assistant', sans-serif",
          outline: 'none',
          animation: 'ws-done-card .42s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {/* the asset itself, cut from the city — not a symbol for it */}
        <div data-ws-done-asset style={{ animation: 'ws-done-asset .5s .1s cubic-bezier(.22,1,.36,1) both' }}>
          <CityAsset building={building} />
        </div>

        <h2 style={{
          fontFamily: 'var(--ws-display)', fontSize: 25, fontWeight: 700,
          color: INK, margin: '0 0 6px', textWrap: 'balance',
        }}>
          סיימת את התיאוריה
        </h2>
        <p style={{
          fontSize: 15, lineHeight: 1.55, color: 'var(--sh-text-med)',
          margin: '0 0 22px', textWrap: 'pretty',
        }}>
          {buildingName ? <>הבניין <strong style={{ color: INK }}>{buildingName}</strong> נוסף לעיר שלך.</> : 'מבנה חדש נוסף לעיר שלך.'}
        </p>

        {/* the meter — coral, which is where progress lives in this app */}
        <div style={{ textAlign: 'right', marginBottom: 24, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--sh-text-med)' }}>רמה {level}</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: INK, fontVariantNumeric: 'tabular-nums' }}>
              {inLevel} / {XP_PER_LEVEL} XP
            </span>
          </div>
          <div style={{ height: 10, borderRadius: 999, background: 'rgba(31,62,108,0.12)', overflow: 'hidden', display: 'flex' }}>
            <div style={{
              height: '100%', width: `${pct}%`, borderRadius: 999,
              background: `linear-gradient(90deg, ${CORAL}, #FFA878)`,
              transition: 'width .12s linear',
            }} />
          </div>
          {collected && gain > 0 && (
            <span
              key="gain"
              style={{
                position: 'absolute', insetInlineStart: 0, top: -4,
                fontSize: 14, fontWeight: 700, color: CORAL,
                animation: 'ws-done-pop .7s ease-out forwards',
                pointerEvents: 'none',
              }}
            >
              +{gain} XP
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'stretch' }}>
          <button
            onClick={() => { if (!collected) { setCollected(true); onCollect() } }}
            disabled={collected || gain === 0}
            className={`ws-cta-outline${collected ? ' is-done' : ''}`}
            style={{ flex: 1, justifyContent: 'center', cursor: collected ? 'default' : 'pointer' }}
          >
            {collected ? (
              <>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                נאסף
              </>
            ) : gain > 0 ? 'אסוף' : 'כבר נאסף'}
          </button>
          <button
            onClick={onPractise}
            className="ws-cta"
            /* No inline background. An inline style outranks every class
               selector, so setting it here silently killed .ws-cta:hover and
               :active — the button looked like the theory CTA and did not
               behave like it. The class owns all four states. */
            style={{ flex: 1, justifyContent: 'center' }}
          >
            התחל לתרגל
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
            </svg>
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 12, background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Assistant', sans-serif", fontSize: 13.5,
            color: 'var(--sh-text-light)', padding: '6px 10px',
          }}
        >
          חזרה לשקופיות
        </button>
      </div>
    </div>
  )
}

export { XP_FOR_LESSON, XP_PER_LEVEL, DEEP }
