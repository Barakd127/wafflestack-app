import React, { useState, useEffect, useRef, cloneElement } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  label: string
  description?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  children: React.ReactElement
}

function mergeRefs<T>(...refs: React.Ref<T>[]) {
  return (el: T | null) => {
    refs.forEach(r => {
      if (typeof r === 'function') r(el)
      else if (r && 'current' in r) (r as React.MutableRefObject<T | null>).current = el
    })
  }
}

export default function Tooltip({ label, description, placement = 'bottom', delay = 400, children }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const childRef = useRef<HTMLElement | null>(null)
  const idRef = useRef(`ws-tt-${Math.random().toString(36).slice(2)}`)
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') hide() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

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

  const getTooltipStyle = (): React.CSSProperties => {
    switch (placement) {
      case 'top':    return { top: coords.top, left: coords.left, transform: 'translateX(-50%) translateY(-100%)' }
      case 'bottom': return { top: coords.top, left: coords.left, transform: 'translateX(-50%)' }
      case 'left':   return { top: coords.top, left: coords.left, transform: 'translateX(-100%) translateY(-50%)' }
      case 'right':  return { top: coords.top, left: coords.left, transform: 'translateY(-50%)' }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const origRef = (children as any).ref as React.Ref<HTMLElement> | undefined
  const child = cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>, {
    ref: mergeRefs(childRef, ...(origRef ? [origRef] : [])),
    'aria-describedby': open ? idRef.current : undefined,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { show(); (children.props as React.HTMLAttributes<HTMLElement>).onMouseEnter?.(e) },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { hide(); (children.props as React.HTMLAttributes<HTMLElement>).onMouseLeave?.(e) },
    onFocus:      (e: React.FocusEvent<HTMLElement>)  => { show(); (children.props as React.HTMLAttributes<HTMLElement>).onFocus?.(e) },
    onBlur:       (e: React.FocusEvent<HTMLElement>)  => { hide(); (children.props as React.HTMLAttributes<HTMLElement>).onBlur?.(e) },
  })

  return (
    <>
      {child}
      {open && createPortal(
        <div id={idRef.current} role="tooltip" className="ws-tooltip" style={getTooltipStyle()}>
          {label}
          {description && <div className="ws-tooltip-desc">{description}</div>}
        </div>,
        document.body
      )}
    </>
  )
}
