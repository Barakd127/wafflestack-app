/**
 * PresentationOverlay — cartoon-hand pointer that "presents" a lesson slide
 * on the WhiteboardShell, like a teacher at the board.
 *
 * Design source: claude.ai/design "Interactive Whiteboard Pointer"
 * (Whiteboard Presentation Mode.dc.html). Motion re-tuned per research so the
 * hand feels gentle and natural rather than snappy/aggressive:
 *
 *  1. Well-damped spring (ζ≈0.92) — damping is tied to the spring frequency,
 *     so faster gestures never get bouncier (the original prototype's bug).
 *  2. Every scripted reach travels an eased Bezier ARC, not a straight line
 *     (Disney "arcs" + slow-in/slow-out). Duration scales with distance.
 *  3. Wrist tilt follows velocity and eases back to 0 at rest (follow-through).
 *  4. Tiny idle "breathing" bob when the hand is at rest — alive, never busy.
 *  5. prefers-reduced-motion collapses all of it to instant positioning.
 *
 * The hand renders as inline SVG poses. If 3D-render PNGs exist at
 * public/hands/{point,laser,marker,thumbs}.png they are used instead
 * (preloaded once; missing files silently fall back to the SVG).
 *
 * Mounted as a sibling overlay INSIDE a position:relative wrapper around
 * <WhiteboardShell>. Targets are found by class on the rendered slide:
 * `.ws-lesson-card h3` (title), `.ws-lesson-bullet` (bullets),
 * `.ws-lesson-formula` (formula box).
 */
import { useEffect, useRef, useState } from 'react'

export type PresenterTool = 'point' | 'laser' | 'draw' | 'underline'

interface PresentationOverlayProps {
  /** Overlay is mounted/visible only while presenting. */
  active: boolean
  /** Auto choreography running (vs. manual mouse-follow). */
  autoOn: boolean
  /** Manual tool selected in the toolbar. */
  tool: PresenterTool
  /** Changes when the slide changes — restarts the auto choreography. */
  slideKey: string | number
  /** Auto sequence finished on its own. */
  onAutoDone: () => void
}

type Pose = 'point' | 'laser' | 'marker' | 'thumbs'

// ── Motion constants (tuned; see Hybrid/Whiteboard Pointer/hand-motion-research.md) ──
const REACH_SPEED = 1.0   // global multiplier for scripted gestures
const ARC_HEIGHT = 0.5    // reach-path curvature (0 = straight line)
const DAMP_ZETA = 0.92    // spring damping ratio; ~1 = no bounce
const FOLLOW_LAG = 0.16   // manual cursor-follow tightness
const TILT_MAX = 6        // max wrist tilt in degrees
const IDLE_AMP = 1.4      // idle breathing amplitude, px

const LASER_COLOR = '#EF4444' // matches the red tray marker
const INK_COLOR = '#1D4ED8'   // matches the blue tray marker

// Fingertip / pen-tip offset within the hand element, per pose (displayed px).
// Calibrated against the 3D renders in public/hands/ (alpha-bbox + tip scan).
const TIPS: Record<Pose, { x: number; y: number }> = {
  point: { x: 91, y: 2 },
  // laser beams from the HELD PEN's tip (marker render), not a bare finger —
  // a finger emitting a laser dot broke the metaphor
  laser: { x: 2, y: 40 },
  marker: { x: 2, y: 40 },
  thumbs: { x: 75, y: 48 },
}

const HAND_PNGS: Partial<Record<Pose, string>> = {
  point: 'hands/point.png',
  laser: 'hands/marker.png',
  marker: 'hands/marker.png',
  thumbs: 'hands/thumbs.png',
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function PresentationOverlay({ active, autoOn, tool, slideKey, onAutoDone }: PresentationOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const handRef = useRef<HTMLDivElement>(null)
  const inkRef = useRef<SVGSVGElement>(null)
  const laserRef = useRef<HTMLCanvasElement>(null)
  const pulsesRef = useRef<HTMLDivElement>(null)
  const captureRef = useRef<HTMLDivElement>(null)

  // Which poses have a real PNG render available (probed once).
  const [pngOk, setPngOk] = useState<Partial<Record<Pose, boolean>>>({})
  useEffect(() => {
    let mounted = true
    // several poses can share one file — group by file, then mark every
    // pose that uses it when the load succeeds
    const byFile = new Map<string, Pose[]>()
    ;(Object.entries(HAND_PNGS) as Array<[Pose, string]>).forEach(([pose, rel]) => {
      byFile.set(rel, [...(byFile.get(rel) ?? []), pose])
    })
    byFile.forEach((poses, rel) => {
      const img = new Image()
      img.onload = () => {
        if (mounted) setPngOk(p => ({ ...p, ...Object.fromEntries(poses.map(x => [x, true])) }))
      }
      img.src = `${import.meta.env.BASE_URL}${rel}`
    })
    return () => { mounted = false }
  }, [])

  // Mutable engine state lives in refs — the RAF loop must not re-render React.
  const eng = useRef({
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    guide: { x: 0, y: 0 },
    rot: 0,
    pose: 'point' as Pose,
    trail: [] as Array<{ x: number; y: number; t: number }>,
    laserHeld: false,
    sweeping: false,
    reachActive: false,
    tweening: false,
    drawPath: null as { el: SVGPathElement; pts: Array<[number, number]> } | null,
    drawY: 0,
    token: 0,
    raf: 0,
    last: 0,
    autoOn,
    tool,
    active,
    reduce: false,
  })
  // Keep the loop's view of React props fresh without restarting it.
  eng.current.autoOn = autoOn
  eng.current.tool = tool
  eng.current.active = active

  // ── geometry helpers ──
  const boardRect = () => rootRef.current?.getBoundingClientRect() ?? new DOMRect()
  const relRect = (el: Element) => {
    const r = el.getBoundingClientRect(); const b = boardRect()
    return { left: r.left - b.left, top: r.top - b.top, right: r.right - b.left, bottom: r.bottom - b.top, width: r.width, height: r.height }
  }
  const clampPt = (x: number, y: number) => {
    // Loose margins (vs. the old 20/45/20/30 inset) — the hand is unclipped
    // now, so letting the tip approach the board edge lets its body bleed
    // past the frame instead of stopping dead a full hand-width short of it.
    const b = boardRect()
    return { x: Math.max(4, Math.min(b.width - 16, x)), y: Math.max(4, Math.min(b.height - 10, y)) }
  }

  // ── engine loop + gesture engine (one effect for the component's life) ──
  useEffect(() => {
    const e = eng.current
    e.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const loop = (now: number) => {
      e.raf = requestAnimationFrame(loop)
      const dt = Math.min(2.5, (now - e.last) / 16.667); e.last = now
      const hand = handRef.current
      if (!hand) return

      const scripted = e.reachActive || e.tweening || e.sweeping
      if (e.reduce) {
        e.pos.x = e.guide.x; e.pos.y = e.guide.y; e.vel.x = e.vel.y = 0
      } else if (!scripted && e.active && !e.autoOn && !e.drawPath) {
        // manual cursor-follow: graceful trailing lag
        e.vel.x = e.vel.x * 0.62 + (e.guide.x - e.pos.x) * FOLLOW_LAG
        e.vel.y = e.vel.y * 0.62 + (e.guide.y - e.pos.y) * FOLLOW_LAG
        e.pos.x += e.vel.x * dt; e.pos.y += e.vel.y * dt
      } else {
        // well-damped spring hugs the eased arc path. freq is high enough
        // that the hand tracks the arc tightly — the arc's own easing is the
        // sole source of shape; a loose spring lagging then catching up reads
        // as rubber-banding, not smoothness.
        const freq = 0.5, k = freq * freq
        const drag = Math.pow(Math.max(0, 1 - 2 * DAMP_ZETA * freq), dt)
        e.vel.x = e.vel.x * drag + (e.guide.x - e.pos.x) * k * dt
        e.vel.y = e.vel.y * drag + (e.guide.y - e.pos.y) * k * dt
        e.pos.x += e.vel.x * dt; e.pos.y += e.vel.y * dt
      }

      // idle breathing only at rest
      let idleY = 0, idleR = 0
      if (!e.reduce && !scripted && !e.laserHeld && Math.hypot(e.vel.x, e.vel.y) < 0.6) {
        idleY = Math.sin(now * 0.0016) * IDLE_AMP
        idleR = Math.sin(now * 0.0011) * (IDLE_AMP * 0.4)
      }

      // wrist tilt: smoothed toward velocity, eases back to 0 (follow-through)
      const targetRot = e.reduce ? 0 : Math.max(-TILT_MAX, Math.min(TILT_MAX, e.vel.x * 0.9))
      e.rot += (targetRot - e.rot) * Math.min(1, 0.14 * dt)

      const tip = TIPS[e.pose]
      hand.style.transformOrigin = `${tip.x}px ${tip.y}px`
      // translate3d keeps the hand on its own GPU layer — no repaint jank
      hand.style.transform = `translate3d(${e.pos.x - tip.x}px,${e.pos.y - tip.y + idleY}px,0) rotate(${e.rot + idleR}deg)`
      // pose swap crossfades via opacity (hard display pops read as stutter)
      hand.querySelectorAll<HTMLElement>('[data-pose]').forEach(p => {
        p.style.opacity = p.getAttribute('data-pose') === e.pose ? '1' : '0'
      })

      if (e.laserHeld || e.sweeping) e.trail.push({ x: e.pos.x, y: e.pos.y, t: now })

      // laser canvas
      const c = laserRef.current
      if (c) {
        const b = boardRect()
        if (c.width !== Math.round(b.width) || c.height !== Math.round(b.height)) {
          c.width = Math.round(b.width); c.height = Math.round(b.height)
        }
        const ctx = c.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, c.width, c.height)
          const MAX = 700
          e.trail = e.trail.filter(p => now - p.t < MAX)
          ctx.lineCap = 'round'; ctx.lineJoin = 'round'
          for (let i = 1; i < e.trail.length; i++) {
            const a = e.trail[i - 1], b2 = e.trail[i], age = (now - b2.t) / MAX
            ctx.strokeStyle = LASER_COLOR
            ctx.globalAlpha = (1 - age) * 0.85
            ctx.lineWidth = 6 * (1 - age) + 1.5
            ctx.shadowColor = LASER_COLOR; ctx.shadowBlur = 14 * (1 - age)
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b2.x, b2.y); ctx.stroke()
          }
          if ((e.laserHeld || e.sweeping) && e.pose === 'laser') {
            ctx.globalAlpha = 1; ctx.shadowColor = LASER_COLOR; ctx.shadowBlur = 22; ctx.fillStyle = LASER_COLOR
            ctx.beginPath(); ctx.arc(e.pos.x, e.pos.y, 5.5, 0, Math.PI * 2); ctx.fill()
            ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.9
            ctx.beginPath(); ctx.arc(e.pos.x, e.pos.y, 2, 0, Math.PI * 2); ctx.fill()
          }
          ctx.globalAlpha = 1; ctx.shadowBlur = 0
        }
      }
    }
    e.last = performance.now()
    e.raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(e.raf); e.token++ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── gesture primitives (closures over eng) ──
  const sleep = (ms: number, tok: number) =>
    new Promise<boolean>(res => setTimeout(() => res(tok === eng.current.token), ms / REACH_SPEED))

  const reachTo = (x: number, y: number, tok: number): Promise<boolean> => {
    const e = eng.current
    const end = clampPt(x, y), start = { x: e.pos.x, y: e.pos.y }
    if (e.reduce) { e.guide = end; return Promise.resolve(tok === e.token) }
    const dist = Math.hypot(end.x - start.x, end.y - start.y)
    // Arc control point: perpendicular lift so the hand travels a natural curve
    const mx = (start.x + end.x) / 2, my = (start.y + end.y) / 2
    const nx = -(end.y - start.y), ny = end.x - start.x, nl = Math.hypot(nx, ny) || 1
    const lift = Math.min(dist * 0.28, 70) * ARC_HEIGHT
    const ctrl = { x: mx + (nx / nl) * lift, y: my + (ny / nl) * lift - lift * 0.4 }
    // Fitts-like: farther targets take longer, capped so it never drags
    const dur = Math.min(1600, 420 + dist * 1.9) / REACH_SPEED
    e.reachActive = true
    return new Promise(res => {
      const t0 = performance.now()
      const step = () => {
        if (tok !== e.token) { e.reachActive = false; return res(false) }
        const t = Math.min(1, (performance.now() - t0) / dur), ee = easeInOut(t), u = 1 - ee
        e.guide.x = u * u * start.x + 2 * u * ee * ctrl.x + ee * ee * end.x
        e.guide.y = u * u * start.y + 2 * u * ee * ctrl.y + ee * ee * end.y
        if (t < 1) requestAnimationFrame(step)
        else { e.reachActive = false; res(tok === e.token) }
      }
      requestAnimationFrame(step)
    })
  }

  const tween = (dur: number, fn: (t: number) => void, tok: number): Promise<boolean> => {
    const e = eng.current
    e.tweening = true
    return new Promise(res => {
      const t0 = performance.now(), D = dur / REACH_SPEED
      const step = () => {
        if (tok !== e.token) { e.tweening = false; return res(false) }
        const t = Math.min(1, (performance.now() - t0) / D)
        fn(t)
        if (t < 1) requestAnimationFrame(step)
        else { e.tweening = false; res(true) }
      }
      requestAnimationFrame(step)
    })
  }

  const pulse = (x: number, y: number) => {
    const host = pulsesRef.current
    if (!host) return
    const ring = document.createElement('div')
    ring.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:56px;height:56px;border:3px solid #C9A227;border-radius:50%;box-shadow:0 0 18px rgba(201,162,39,0.55);animation:wsPresPulse 0.75s ease-out forwards;`
    host.appendChild(ring)
    setTimeout(() => ring.remove(), 800)
  }

  const newInk = () => {
    const svg = inkRef.current
    if (!svg) return null
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    p.setAttribute('fill', 'none')
    p.setAttribute('stroke', INK_COLOR)
    p.setAttribute('stroke-width', '4')
    p.setAttribute('stroke-linecap', 'round')
    p.setAttribute('stroke-linejoin', 'round')
    p.setAttribute('opacity', '0.85')
    svg.appendChild(p)
    return { el: p, pts: [] as Array<[number, number]> }
  }
  const extendInk = (path: NonNullable<ReturnType<typeof newInk>>, x: number, y: number) => {
    path.pts.push([x, y])
    path.el.setAttribute('d', path.pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(''))
  }
  const fadeInk = (path: ReturnType<typeof newInk>) => {
    if (!path) return
    setTimeout(() => {
      path.el.style.transition = 'opacity 0.7s'
      path.el.style.opacity = '0'
      setTimeout(() => path.el.remove(), 750)
    }, 3800)
  }
  const clearOverlays = () => {
    eng.current.trail = []
    if (inkRef.current) inkRef.current.innerHTML = ''
  }

  // ── compound gestures ──
  const gPoint = async (el: Element, tok: number) => {
    eng.current.pose = 'point'
    const r = relRect(el)
    const x = r.right - Math.min(30, r.width * 0.12), y = r.bottom + 4
    if (!await reachTo(x, y, tok)) return false
    pulse(x, y - 10)
    return sleep(900, tok)
  }
  const gUnderline = async (el: Element, tok: number, maxW?: number) => {
    const e = eng.current
    e.pose = 'marker'
    const r = relRect(el)
    const y = r.bottom + 3
    const x1 = r.right, x2 = Math.max(r.left, r.right - (maxW ?? 300))
    if (!await reachTo(x1, y, tok)) return false
    const path = newInk(); if (!path) return false
    const ok = await tween(1100, t => {
      const x = x1 + (x2 - x1) * easeInOut(t)
      // hand glides straight; only the INK keeps a hand-drawn waver
      e.guide.x = x; e.guide.y = y
      extendInk(path, x, y + Math.sin(t * 20) * 0.6 + 2)
    }, tok)
    fadeInk(path)
    return ok && sleep(500, tok)
  }
  const gCircle = async (el: Element, tok: number) => {
    const e = eng.current
    e.pose = 'marker'
    const r = relRect(el)
    const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2
    const rx = r.width / 2 + 18, ry = r.height / 2 + 12, a0 = -1.1
    if (!await reachTo(cx + rx * Math.cos(a0), cy + ry * Math.sin(a0), tok)) return false
    const path = newInk(); if (!path) return false
    const ok = await tween(1600, t => {
      const a = a0 + easeInOut(t) * Math.PI * 2.15
      // hand sweeps a clean ellipse; ink alone carries the waver
      const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a)
      e.guide.x = x; e.guide.y = y
      const wob = Math.sin(t * 28) * 0.6
      extendInk(path, cx + (rx + wob) * Math.cos(a), cy + (ry + wob) * Math.sin(a))
    }, tok)
    fadeInk(path)
    return ok && sleep(600, tok)
  }
  const gLaserSweep = async (el: Element, tok: number) => {
    const e = eng.current
    e.pose = 'laser'
    const r = relRect(el)
    const y = r.top + Math.min(r.height, 34) / 2 + 8
    const x1 = r.right - 4, x2 = r.left + 4
    if (!await reachTo(x1, y, tok)) return false
    e.sweeping = true
    const ok = await tween(1700, t => {
      const ee = easeInOut(t)
      const c = clampPt(x1 + (x2 - x1) * ee, y)
      e.guide.x = c.x; e.guide.y = c.y
    }, tok)
    e.sweeping = false
    return ok && sleep(400, tok)
  }

  // ── auto choreography: title → underline → laser each bullet → circle formula → thumbs ──
  const runAuto = async () => {
    const e = eng.current
    const tok = ++e.token
    clearOverlays()
    if (!await sleep(350, tok)) return
    const host = rootRef.current?.parentElement
    if (!host) return
    const title = host.querySelector('.ws-lesson-card h3')
    if (title) {
      if (!await gPoint(title, tok)) return
      if (!await gUnderline(title, tok, 280)) return
    }
    const bullets = Array.from(host.querySelectorAll('.ws-lesson-bullet'))
    for (const b of bullets) {
      b.scrollIntoView({ block: 'nearest', behavior: e.reduce ? 'auto' : 'smooth' })
      if (!await sleep(200, tok)) return
      if (!await gLaserSweep(b, tok)) return
    }
    const formula = host.querySelector('.ws-lesson-formula')
    if (formula) {
      formula.scrollIntoView({ block: 'nearest', behavior: e.reduce ? 'auto' : 'smooth' })
      if (!await sleep(200, tok)) return
      if (!await gCircle(formula, tok)) return
    }
    // finale: thumbs-up, rest bottom-left of board (away from RTL text start)
    e.pose = 'thumbs'
    const bd = boardRect()
    e.guide = { x: bd.width * 0.28, y: bd.height - 150 }
    await sleep(1400, tok)
    if (tok === e.token) { e.pose = 'point'; onAutoDone() }
  }

  // Start/stop auto with `active`+`autoOn`+`slideKey`; entrance from below the board.
  useEffect(() => {
    const e = eng.current
    if (!active) { e.token++; clearOverlays(); return }
    if (autoOn) {
      const bd = boardRect()
      // entering: hand rises from below the bottom edge
      if (e.pos.x === 0 && e.pos.y === 0) {
        e.pos = { x: bd.width * 0.5, y: bd.height + 180 }
        e.guide = { x: bd.width * 0.5, y: bd.height - 80 }
      }
      runAuto()
    } else {
      e.token++
      e.sweeping = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, autoOn, slideKey])

  // Manual pose follows the selected tool.
  useEffect(() => {
    if (!autoOn) eng.current.pose = tool === 'laser' ? 'laser' : tool === 'point' ? 'point' : 'marker' // draw + underline both hold the marker
  }, [tool, autoOn])

  // ── manual pointer handlers ──
  const boardPoint = (ev: React.PointerEvent) => {
    const b = boardRect()
    return { x: ev.clientX - b.left, y: ev.clientY - b.top }
  }
  const manualActive = () => active && !autoOn
  const onPD = (ev: React.PointerEvent) => {
    if (!manualActive()) return
    const e = eng.current
    const p = boardPoint(ev)
    if (tool === 'point') { e.guide = p; pulse(p.x, p.y - 8) }
    else if (tool === 'laser') { e.laserHeld = true; e.guide = p }
    else if (tool === 'draw') {
      // free drawing: ink follows the cursor exactly while held
      e.drawPath = newInk()
      if (e.drawPath) extendInk(e.drawPath, p.x, p.y)
      e.guide = p
    } else if (tool === 'underline') {
      e.drawPath = newInk()
      e.drawY = p.y
      if (e.drawPath) extendInk(e.drawPath, p.x, p.y)
      e.guide = p
    }
  }
  const onPM = (ev: React.PointerEvent) => {
    if (!manualActive()) return
    const e = eng.current
    const p = boardPoint(ev)
    e.guide = { x: p.x, y: p.y }
    if (e.drawPath) {
      if (tool === 'draw') {
        // free drawing: ink tracks the cursor on both axes
        extendInk(e.drawPath, p.x, p.y)
      } else {
        // underline: ruler-straight hand along the draw line; ink keeps a light waver
        extendInk(e.drawPath, p.x, e.drawY + Math.sin(p.x * 0.12) * 1.1)
        e.guide.y = e.drawY
      }
    }
  }
  const onPU = () => {
    const e = eng.current
    e.laserHeld = false
    if (e.drawPath) { fadeInk(e.drawPath); e.drawPath = null }
  }

  if (!active) return null

  // Skin gradients shared by all poses (illustration colors, like the waffle bullet).
  const svgDefs = (
    <defs>
      <linearGradient id="wsp-skin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FCE7CB" /><stop offset="0.55" stopColor="#F4CFA3" /><stop offset="1" stopColor="#E2A876" />
      </linearGradient>
      <linearGradient id="wsp-fing" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FDEDD6" /><stop offset="1" stopColor="#EFC194" />
      </linearGradient>
      <linearGradient id="wsp-arm" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F0C495" /><stop offset="1" stopColor="#D89B66" />
      </linearGradient>
    </defs>
  )
  const poseImg = (pose: Pose, svg: React.ReactNode, width = 130) =>
    pngOk[pose] ? (
      <img src={`${import.meta.env.BASE_URL}${HAND_PNGS[pose]}`} alt="" style={{ position: 'absolute', top: 0, left: 0, width, height: 'auto' }} />
    ) : svg

  return (
    // NOT clipped: the hand needs to bleed past the board edge, over the
    // aluminium frame, for a 3D "reaching into the scene" feel. Ink/laser/
    // pulses stay confined to the board via their own inner clipped layer
    // below (they're drawing ON the surface, so they shouldn't bleed).
    <div ref={rootRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <style>{`
        @keyframes wsPresPulse {
          0%   { transform: translate(-50%,-50%) scale(0.35); opacity: 0.9; }
          100% { transform: translate(-50%,-50%) scale(1.6);  opacity: 0; }
        }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* ink strokes */}
        <svg ref={inkRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 40, pointerEvents: 'none', overflow: 'visible' }} />
        {/* laser trail */}
        <canvas ref={laserRef} style={{ position: 'absolute', inset: 0, zIndex: 45, pointerEvents: 'none' }} />
        {/* pulse rings */}
        <div ref={pulsesRef} style={{ position: 'absolute', inset: 0, zIndex: 46, pointerEvents: 'none' }} />
      </div>

      {/* the hand — z 70, ABOVE the whiteboard aluminium frame (z 60/61) and
          unclipped, so it can visibly reach past the board edge. */}
      <div
        ref={handRef}
        style={{
          position: 'absolute', top: 0, left: 0, width: 200, height: 260, zIndex: 70,
          pointerEvents: 'none', willChange: 'transform',
          // modest blur radius — big drop-shadows re-rasterize every frame
          filter: 'drop-shadow(-5px 10px 10px rgba(15,23,42,0.28))',
        }}
      >
        <div data-pose="point" style={{ position: 'absolute', inset: 0, opacity: 1, transition: 'opacity 0.13s ease' }}>
          {poseImg('point', (
            <svg width="130" height="156" viewBox="0 0 200 240" fill="none">
              {svgDefs}
              <path d="M126 194 Q152 176 178 190 L204 244 L134 244 Q116 216 126 194 Z" fill="url(#wsp-arm)" />
              <path d="M74 112 Q56 142 70 172 Q86 202 126 206 Q164 208 182 180 Q196 154 184 126 Q170 98 136 92 Q98 86 74 112 Z" fill="url(#wsp-skin)" />
              <circle cx="112" cy="94" r="23" fill="url(#wsp-skin)" /><circle cx="142" cy="100" r="20" fill="url(#wsp-skin)" /><circle cx="166" cy="112" r="17" fill="url(#wsp-skin)" />
              <path d="M96 112 Q114 120 132 114" stroke="#D69A66" strokeWidth="5" strokeLinecap="round" opacity="0.4" fill="none" />
              <path d="M70 126 Q52 138 58 160 Q64 182 86 184 Q101 184 105 172 Q92 166 84 152 Q77 138 70 126 Z" fill="url(#wsp-fing)" />
              <path d="M20 34 Q10 20 24 10 Q38 2 48 16 L96 92 Q106 108 92 118 Q78 128 68 112 Z" fill="url(#wsp-fing)" />
              <ellipse cx="33" cy="24" rx="11" ry="6" fill="#FFF4E0" opacity="0.7" transform="rotate(52 33 24)" />
            </svg>
          ))}
        </div>
        <div data-pose="laser" style={{ position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.13s ease' }}>
          {poseImg('laser', (
            <svg width="130" height="156" viewBox="0 0 200 240" fill="none">
              {svgDefs}
              <path d="M126 194 Q152 176 178 190 L204 244 L134 244 Q116 216 126 194 Z" fill="url(#wsp-arm)" />
              <line x1="24" y1="26" x2="104" y2="128" stroke="#2b3340" strokeWidth="14" strokeLinecap="round" />
              <line x1="29" y1="32" x2="46" y2="54" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" />
              <line x1="27" y1="28" x2="98" y2="118" stroke="rgba(255,255,255,0.30)" strokeWidth="4" strokeLinecap="round" />
              <path d="M74 112 Q56 142 70 172 Q86 202 126 206 Q164 208 182 180 Q196 154 184 126 Q170 98 136 92 Q98 86 74 112 Z" fill="url(#wsp-skin)" />
              <circle cx="90" cy="102" r="21" fill="url(#wsp-skin)" /><circle cx="118" cy="94" r="23" fill="url(#wsp-skin)" /><circle cx="147" cy="100" r="20" fill="url(#wsp-skin)" /><circle cx="169" cy="114" r="16" fill="url(#wsp-skin)" />
              <path d="M66 128 Q50 118 56 100 Q62 84 82 86 Q98 90 104 106 Q108 122 96 132 Q80 140 66 128 Z" fill="url(#wsp-fing)" />
              <ellipse cx="122" cy="150" rx="34" ry="20" fill="#FFF1DC" opacity="0.3" />
            </svg>
          ))}
        </div>
        <div data-pose="marker" style={{ position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.13s ease' }}>
          {poseImg('marker', (
            <svg width="130" height="156" viewBox="0 0 200 240" fill="none">
              {svgDefs}
              <path d="M126 194 Q152 176 178 190 L204 244 L134 244 Q116 216 126 194 Z" fill="url(#wsp-arm)" />
              <path d="M20 18 L40 8 L54 26 L34 38 Z" fill="#0f172a" />
              <line x1="40" y1="30" x2="106" y2="126" stroke="#1d4ed8" strokeWidth="19" strokeLinecap="round" />
              <line x1="44" y1="34" x2="100" y2="116" stroke="rgba(255,255,255,0.28)" strokeWidth="5" strokeLinecap="round" />
              <path d="M74 112 Q56 142 70 172 Q86 202 126 206 Q164 208 182 180 Q196 154 184 126 Q170 98 136 92 Q98 86 74 112 Z" fill="url(#wsp-skin)" />
              <circle cx="90" cy="102" r="21" fill="url(#wsp-skin)" /><circle cx="118" cy="94" r="23" fill="url(#wsp-skin)" /><circle cx="147" cy="100" r="20" fill="url(#wsp-skin)" /><circle cx="169" cy="114" r="16" fill="url(#wsp-skin)" />
              <path d="M66 128 Q50 118 56 100 Q62 84 82 86 Q98 90 104 106 Q108 122 96 132 Q80 140 66 128 Z" fill="url(#wsp-fing)" />
              <ellipse cx="122" cy="150" rx="34" ry="20" fill="#FFF1DC" opacity="0.3" />
            </svg>
          ))}
        </div>
        <div data-pose="thumbs" style={{ position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.13s ease' }}>
          {poseImg('thumbs', (
            <svg width="150" height="180" viewBox="0 0 200 240" fill="none">
              {svgDefs}
              <path d="M120 200 Q150 184 176 198 L200 244 L128 244 Q112 220 120 200 Z" fill="url(#wsp-arm)" />
              <path d="M78 150 Q70 120 96 108 Q120 100 132 120 L138 150 Q170 146 176 168 Q180 190 156 196 L96 200 Q78 196 78 150 Z" fill="url(#wsp-skin)" />
              <path d="M120 118 Q118 74 132 58 Q146 44 156 58 Q162 70 152 96 L142 128 Q132 136 120 118 Z" fill="url(#wsp-fing)" />
              <ellipse cx="140" cy="70" rx="8" ry="5" fill="#FFF4E0" opacity="0.6" transform="rotate(30 140 70)" />
            </svg>
          ), 150)}
        </div>
      </div>

      {/* pointer capture for manual mode (below frame z-60; frame is pointer-events:none) */}
      <div
        ref={captureRef}
        onPointerDown={onPD}
        onPointerMove={onPM}
        onPointerUp={onPU}
        onPointerLeave={onPU}
        style={{ position: 'absolute', inset: 0, zIndex: 55, cursor: 'none', pointerEvents: manualActive() ? 'auto' : 'none' }}
      />
    </div>
  )
}
