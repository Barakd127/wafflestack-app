// [ds-extract] from src/components/Tooltip.tsx @ c1a3ad12 (master)
import React from 'react';

function mergeRefs(...refs) {
  return (el) => {
    refs.forEach(r => {
      if (typeof r === 'function') r(el)
      else if (r && 'current' in r) r.current = el
    })
  }
}

export function Tooltip({ label, description, placement = 'bottom', delay = 400, children }) {
  const [open, setOpen] = React.useState(false)
  const [coords, setCoords] = React.useState({ top: 0, left: 0 })
  const timerRef = React.useRef(null)
  const childRef = React.useRef(null)
  const idRef = React.useRef(`ws-tt-${Math.random().toString(36).slice(2)}`)
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpen(false)
  }

  React.useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') hide() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  React.useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  if (isTouch) return children

  const computeCoords = () => {
    if (!childRef.current) return
    const r = childRef.current.getBoundingClientRect()
    const GAP = 8
    switch (placement) {
      case 'top':    setCoords({ top: r.top - GAP,           left: r.left + r.width / 2 }); break
      case 'bottom': setCoords({ top: r.bottom + GAP,        left: r.left + r.width / 2 }); break
      case 'left':   setCoords({ top: r.top + r.height / 2,  left: r.left - GAP });          break
      case 'right':  setCoords({ top: r.top + r.height / 2,  left: r.right + GAP });         break
    }
  }

  const show = () => {
    computeCoords()
    timerRef.current = setTimeout(() => setOpen(true), delay)
  }

  const getTooltipStyle = () => {
    switch (placement) {
      case 'top':    return { top: coords.top, left: coords.left, transform: 'translateX(-50%) translateY(-100%)' }
      case 'bottom': return { top: coords.top, left: coords.left, transform: 'translateX(-50%)' }
      case 'left':   return { top: coords.top, left: coords.left, transform: 'translateX(-100%) translateY(-50%)' }
      case 'right':  return { top: coords.top, left: coords.left, transform: 'translateY(-50%)' }
    }
  }

  const origRef = children.ref
  const child = React.cloneElement(children, {
    ref: mergeRefs(childRef, ...(origRef ? [origRef] : [])),
    'aria-describedby': open ? idRef.current : undefined,
    onMouseEnter: (e) => { show(); children.props.onMouseEnter?.(e) },
    onMouseLeave: (e) => { hide(); children.props.onMouseLeave?.(e) },
    onFocus:      (e)  => { show(); children.props.onFocus?.(e) },
    onBlur:       (e)  => { hide(); children.props.onBlur?.(e) },
  })

  return (
    <>
      {child}
      {/* [ds-extract] replaced react-dom createPortal(..., document.body) — tooltip renders inline; .ws-tooltip is position:fixed so visual output unchanged */}
      {open && (
        <div id={idRef.current} role="tooltip" className="ws-tooltip" style={getTooltipStyle()}>
          {label}
          {description && <div className="ws-tooltip-desc">{description}</div>}
        </div>
      )}
    </>
  )
}
