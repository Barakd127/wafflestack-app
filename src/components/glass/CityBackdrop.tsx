/**
 * CityBackdrop — the world behind the glass board (spec §3).
 *
 * Sky gradient + ground haze + the student's block (public/glass/city-block.webp,
 * bottom-anchored, 82% of the board). The lesson's building is highlighted with a
 * gold glow + dashed scaffold, filled floor-by-floor from `progress`, and carries
 * a roof-anchored callout ("{building} · קומה N מתוך M" + progress ring).
 * Mastery (`mastered` prop, owned by the shell): solid scaffold + roof flag.
 * Purely presentational — the shell owns mastery detection, onMastered, the
 * toast and the 1.6s clear. Parallax / world fade live here (once), via `frost`.
 *
 * Percent bboxes in cityBlock.json are relative to the IMAGE, so every overlay
 * lives inside a wrapper that is exactly the image box (same width / bottom /
 * centring). Visual recipes copied from the approved canvas artboards
 * (LessonB / LessonC region + script). Reduced motion is handled by the
 * `.ws-glass-board *` rule in index.css.
 */
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
// Byte-for-byte copy of public/glass/city-block.json — update both in lockstep
// (Vite forbids importing from public/, so the src copy is the one we bundle).
import cityBlock from './cityBlock.json'
import { BUILDING_NAME_HE, buildingForTopic } from './cityNames'

export interface CityBackdropProps {
  topicId?: string
  progress?: { done: number; total: number; label?: string }
  /** frost t ∈ [0,1] from the shell — drives parallax + world fade */
  frost: number
  /** done >= total, computed by the shell (single owner of mastery) */
  mastered?: boolean
}

interface BuildingBox { left: number; top: number; right: number; bottom: number; roofX: number; roofY: number }

const BUILDINGS = cityBlock.buildings as Record<string, BuildingBox>
const IMG_W = cityBlock.width
const IMG_H = cityBlock.height
const IMG_WIDTH_PCT = 0.82

const GOLD = '#D4AF37'
const GOLD_LIGHT = '#F5C842'
const NAVY = '#0B1B3E'

const numStyle: CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 600,
}

export default function CityBackdrop({ topicId, progress, frost, mastered: masteredProp }: CityBackdropProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [pillRect, setPillRect] = useState<{ left: number; top: number; right: number; bottom: number } | null>(null)

  const t = Math.min(1, Math.max(0, Number.isFinite(frost) ? frost : 0))
  const buildingId = buildingForTopic(topicId)
  const building = buildingId ? BUILDINGS[buildingId] : undefined
  const nameHe = buildingId ? BUILDING_NAME_HE[buildingId] : undefined

  const total = Math.max(1, Math.floor(progress?.total ?? 0))
  const done = Math.min(total, Math.max(0, Math.floor(progress?.done ?? 0)))
  const hasProgress = Boolean(progress && progress.total > 0)
  const mastered = Boolean(masteredProp)

  // ── board size (for the leader line, which crosses image ↔ board space) ──
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // pill rect relative to the board root — re-measured whenever the board or the text changes
  // (offset* is relative to the parallax layer, so the translate never skews the leader)
  useLayoutEffect(() => {
    const pill = pillRef.current
    if (!pill) { setPillRect(null); return }
    const left = pill.offsetLeft
    const top = pill.offsetTop
    setPillRect({ left, top, right: left + pill.offsetWidth, bottom: top + pill.offsetHeight })
  }, [box.w, box.h, nameHe, done, total, mastered])

  // ── geometry: image box inside the board (bottom-anchored, centred, 82% wide) ──
  const geo = useMemo(() => {
    if (!box.w || !box.h || !building) return null
    const imgW = box.w * IMG_WIDTH_PCT
    const imgH = imgW * IMG_H / IMG_W
    const imgLeft = (box.w - imgW) / 2
    const imgTop = box.h - imgH
    // e.g. city-hall roofX 81.43% → imgLeft + .8143·imgW, i.e. the same point the
    // overlay's `left: 81.43%` resolves to inside the image-sized wrapper
    const rx = imgLeft + (building.roofX / 100) * imgW
    const ry = imgTop + (building.roofY / 100) * imgH
    return { rx, ry }
  }, [box.w, box.h, building])

  // C script: parallax shift + world pushed back above frost .6 — applied HERE
  // only (the shell's wrapper is a plain positioned box), like the reference
  // region, where the sky / haze stay put and just the block moves.
  const shiftNum = 8 * (1 - t)
  const shift = shiftNum.toFixed(1)

  // leader: roof → elbow → nearest pill edge (horizontal run like the canvas).
  // The pill itself now renders on a fixed layer OUTSIDE the parallax `world`
  // div (see callout below), so it never shares the -shiftNum translate. The
  // leader stays inside `world` (still world content, still fades with it),
  // so its local coordinates are pre-offset by +shiftNum: once `world`'s
  // transform subtracts shiftNum back out, the drawn line lands exactly on
  // the pill's true, unshifted position at every frost level — not just at
  // t=1 — instead of drifting apart as frost changes.
  const leader = useMemo(() => {
    if (!geo || !pillRect) return null
    const left = pillRect.left + shiftNum
    const right = pillRect.right + shiftNum
    const top = pillRect.top + shiftNum
    const cy = (pillRect.top + pillRect.bottom) / 2 + shiftNum
    let end: { x: number; y: number }
    let points: string
    if (geo.rx < left) {
      end = { x: left, y: cy }
      points = `${geo.rx},${geo.ry} ${geo.rx},${cy} ${end.x},${end.y}`
    } else if (geo.rx > right) {
      end = { x: right, y: cy }
      points = `${geo.rx},${geo.ry} ${geo.rx},${cy} ${end.x},${end.y}`
    } else {
      end = { x: geo.rx, y: top }
      points = `${geo.rx},${geo.ry} ${end.x},${end.y}`
    }
    return { points, end }
  }, [geo, pillRect, shiftNum])
  const worldOpacity = (1 - Math.max(0, (t - 0.6) / 0.4) * 0.45).toFixed(2)
  const worldTransition = 'transform .5s cubic-bezier(.2,.7,.2,1), opacity .35s ease'

  const floorH = 100 / total
  const doneFloors = hasProgress ? done : 0
  const circ = 2 * Math.PI * 11
  const ringDone = circ * (hasProgress ? done / total : 0)

  const src = import.meta.env.BASE_URL + 'glass/city-block.webp'

  return (
    <div ref={rootRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* sky */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(35.22deg, #FFFFFF -9.85%, #D8E7FA 49.05%, #3351CA 136%)' }} />
      {/* sun streaks (C) */}
      <div style={{ position: 'absolute', top: '-10%', right: '18%', width: '70%', height: '120%', background: 'linear-gradient(112deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0) 52%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.14) 66%, rgba(255,255,255,0) 70%)' }} />
      {/* ground haze */}
      <div style={{ position: 'absolute', insetInline: 0, bottom: 0, height: '38%', background: 'linear-gradient(to top, rgba(51,81,202,.24), rgba(51,81,202,0))' }} />

      {/* world: everything anchored to the block moves together (parallax) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(-${shift}px, -${shift}px)`,
          opacity: worldOpacity,
          transition: worldTransition,
          willChange: 'transform',
        }}
      >
        {/* image box — overlays use this wrapper, so json percentages line up with the picture */}
        <div style={{ position: 'absolute', left: `${(1 - IMG_WIDTH_PCT) * 50}%`, width: `${IMG_WIDTH_PCT * 100}%`, bottom: 0 }}>
          <div style={{ position: 'absolute', left: '-8%', right: '-8%', bottom: '4%', height: '46%', background: 'radial-gradient(ellipse at 50% 72%, rgba(255,255,255,0.5), rgba(255,255,255,0.14) 38%, rgba(255,255,255,0) 66%)' }} />
          <img
            src={src}
            alt=""
            width={IMG_W}
            height={IMG_H}
            draggable={false}
            style={{ position: 'relative', display: 'block', width: '100%', height: 'auto', filter: 'drop-shadow(0 26px 28px rgba(11,27,62,0.36))' }}
          />

          {building && (
            <div style={{ position: 'absolute', inset: 0 }}>
              {/* highlight + scaffold over the bbox */}
              <div
                style={{
                  position: 'absolute',
                  left: `${building.left}%`,
                  top: `${building.top}%`,
                  width: `${building.right - building.left}%`,
                  height: `${building.bottom - building.top}%`,
                  borderRadius: 6,
                  boxSizing: 'border-box',
                  border: mastered ? '1.5px solid rgba(255,255,255,0.9)' : `1.5px dashed rgba(212,175,55,0.95)`,
                  boxShadow: '0 0 0 2px rgba(212,175,55,.55), 0 0 28px rgba(212,175,55,.35)',
                  background: mastered ? 'rgba(245,200,66,0.12)' : 'rgba(216,231,250,0.22)',
                  overflow: 'hidden',
                  transition: 'border-color .6s ease, background .6s ease',
                }}
              >
                {/* done floors: flat gold slabs stacked from the bottom */}
                {Array.from({ length: doneFloors }, (_, i) => (
                  <div
                    key={`f${i}`}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: `${i * floorH}%`,
                      height: `${floorH}%`,
                      background: 'rgba(245,200,66,.55)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.7)',
                      transition: 'height .5s ease',
                    }}
                  />
                ))}
                {/* not-yet-built floors: one dashed scaffold line per level */}
                {!mastered && Array.from({ length: Math.max(0, total - doneFloors - 1) }, (_, i) => (
                  <div
                    key={`s${i}`}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: `${(doneFloors + i + 1) * floorH}%`,
                      borderTop: '1px dashed rgba(212,175,55,0.7)',
                    }}
                  />
                ))}
              </div>

              {/* roof anchor ring (+ flag when mastered) */}
              <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                style={{ position: 'absolute', left: `${building.roofX}%`, top: `${building.roofY}%`, marginLeft: -30, marginTop: -30, overflow: 'visible' }}
              >
                {mastered && (
                  <g>
                    {/* B: 40px pole, 34px pennant on the roof anchor */}
                    <line x1="30" y1="30" x2="30" y2="-10" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
                    <path d="M30,-10 L64,-1.5 L30,7 Z" fill={GOLD_LIGHT} stroke={GOLD} strokeWidth="1" strokeLinejoin="round" />
                  </g>
                )}
                <circle cx="30" cy="30" r="3" fill={GOLD_LIGHT} stroke="#fff" strokeWidth="1" />
              </svg>
            </div>
          )}
        </div>

        {/* leader (board space) */}
        {building && leader && box.w > 0 && (
          <svg width={box.w} height={box.h} viewBox={`0 0 ${box.w} ${box.h}`} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            <polyline points={leader.points} fill="none" stroke={GOLD} strokeWidth="1" strokeLinejoin="round" />
            <circle cx={leader.end.x} cy={leader.end.y} r="2.5" fill={GOLD_LIGHT} stroke="#fff" strokeWidth="1" />
          </svg>
        )}

      </div>

      {/* callout: glass pill in the lower-right, below the ink column's bottom
          inset. Deliberately OUTSIDE the `world` div: the highlight, scaffold,
          floors and leader are world content and stay behind the glass, but
          the callout is UI — it renders above the frost/veil layers (which
          are z-index:auto, painted in DOM order) and below the mode control /
          dock / toast (z-index 12/12/20), so it reads at every frost level
          without inheriting the frost's opacity or blur. Same fixed bottom-
          right position as before — only its stacking layer changed, so it
          never overlaps the ink column, dock, or mode control. */}
      {building && nameHe && (
        <div
          ref={pillRef}
          dir="rtl"
          style={{
            position: 'absolute',
            right: 30,
            bottom: 24,
            zIndex: 11,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 14px 0 10px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.72)',
            border: '1px solid rgba(255,255,255,0.62)',
            boxShadow: '0 8px 22px rgba(11,27,62,0.2)',
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ position: 'relative', width: 28, height: 28, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(31,62,108,0.16)" strokeWidth="3.5" />
              <circle
                cx="14"
                cy="14"
                r="11"
                fill="none"
                stroke={GOLD}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${ringDone.toFixed(2)} ${(circ - ringDone).toFixed(2)}`}
                style={{ transition: 'stroke-dasharray .5s ease' }}
              />
            </svg>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative' }}>
              <path d="M3 17h14M4 8h12M10 3l7 5H3l7-5zM6 8v9M10 8v9M14 8v9" />
            </svg>
          </span>
          <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12.5, fontWeight: 600, color: NAVY, lineHeight: 1 }}>
            {nameHe}
            {hasProgress && (
              <>
                {' · '}
                {progress?.label || 'קומה'}{' '}
                <span dir="ltr" style={numStyle}>{done}</span>
                {' מתוך '}
                <span dir="ltr" style={numStyle}>{total}</span>
              </>
            )}
          </span>
        </div>
      )}
    </div>
  )
}
