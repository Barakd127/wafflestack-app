/**
 * WhiteboardShell — reusable dry-erase whiteboard container.
 *
 * Faithfully reproduces the board look from public/mindmap.html
 * (#mm-board-frame / #mm-board-deco / .mm-corner / .mm-tray / .mm-marker /
 * .mm-eraser) so any screen can wrap its content in the same aluminium-framed
 * whiteboard: brushed-metal border, four grey corner brackets, a decorative
 * marker tray bottom-left, and a white (#FCFDFF) dry-erase surface.
 *
 * Usage:
 *   <WhiteboardShell topRightSlot={<Breadcrumb />}>
 *     ...screen content...
 *   </WhiteboardShell>
 */
import type { CSSProperties, ReactNode } from 'react'

export interface WhiteboardShellProps {
  children: ReactNode
  style?: CSSProperties
  /** Pinned in the board's top-right inner corner (e.g. hierarchy breadcrumb). */
  topRightSlot?: ReactNode
}

export default function WhiteboardShell({ children, style, topRightSlot }: WhiteboardShellProps) {
  return (
    <div
      dir="rtl"
      className="ws-whiteboard"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 320,
        background: '#FCFDFF',
        borderRadius: 18,
        overflow: 'hidden',
        ...style,
      }}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .ws-whiteboard * { transition: none !important; animation: none !important; }
        }
      `}</style>

      {/* Brushed-aluminium board frame */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 5,
          pointerEvents: 'none',
          zIndex: 60,
          border: '16px solid transparent',
          borderImage:
            'linear-gradient(135deg,#f6f7f9,#cbd0d7 22%,#eef0f3 45%,#b2b7c0 68%,#e3e6eb) 16 stretch',
          boxShadow: '0 12px 30px rgba(15,23,42,.30), 0 0 0 6px #FCFDFF',
        }}
      />

      {/* Corner brackets + marker tray */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 5, pointerEvents: 'none', zIndex: 61 }}>
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg,#a4aab2,#ccd0d6 48%,#868c95)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6),0 1px 3px rgba(0,0,0,.32)',
            borderRadius: '18px 3px 15px 3px',
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg,#a4aab2,#ccd0d6 48%,#868c95)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6),0 1px 3px rgba(0,0,0,.32)',
            borderRadius: '3px 18px 3px 15px',
          }}
        />
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg,#a4aab2,#ccd0d6 48%,#868c95)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6),0 1px 3px rgba(0,0,0,.32)',
            borderRadius: '15px 3px 18px 3px',
          }}
        />
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg,#a4aab2,#ccd0d6 48%,#868c95)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6),0 1px 3px rgba(0,0,0,.32)',
            borderRadius: '3px 15px 3px 18px',
          }}
        />

        {/* Decorative marker tray, bottom-left (matches mindmap.html exactly) */}
        <div
          style={{
            position: 'absolute',
            left: 56,
            bottom: 2,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 7,
          }}
        >
          <span
            style={{
              width: 58,
              height: 11,
              borderRadius: 6,
              background: 'linear-gradient(180deg,#404040,#141414)',
              boxShadow: '0 1px 2px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.45)',
            }}
          />
          <span
            style={{
              width: 58,
              height: 11,
              borderRadius: 6,
              background: 'linear-gradient(180deg,#3b82f6,#1d4ed8)',
              boxShadow: '0 1px 2px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.45)',
            }}
          />
          <span
            style={{
              width: 58,
              height: 11,
              borderRadius: 6,
              background: 'linear-gradient(180deg,#ef4444,#b91c1c)',
              boxShadow: '0 1px 2px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.45)',
            }}
          />
          <span
            style={{
              width: 58,
              height: 11,
              borderRadius: 6,
              background: 'linear-gradient(180deg,#22c55e,#15803d)',
              boxShadow: '0 1px 2px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.45)',
            }}
          />
          <span
            style={{
              width: 50,
              height: 22,
              borderRadius: 4,
              marginLeft: 9,
              alignSelf: 'flex-end',
              background: 'linear-gradient(180deg,#2b3340 0 56%,#eef1f5 56% 100%)',
              boxShadow: '0 2px 5px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.25)',
            }}
          />
        </div>
      </div>

      {/* Top-right breadcrumb / slot — pinned above the content, inside the frame. */}
      {topRightSlot && (
        // Physical top:14/right:14 is intentionally correct here (not a logical-property
        // mix-up): the board's decorative frame is built with physical left/right too, so
        // this slot must stay pinned to the same physical top-right corner regardless of
        // dir="rtl" on the root, or it would drift to the wrong corner under RTL logical flow.
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 62,
          }}
        >
          {topRightSlot}
        </div>
      )}

      {/* Scrollable content area, inset from the aluminium frame */}
      <div
        style={{
          position: 'absolute',
          inset: 28,
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 10,
        }}
      >
        {children}
      </div>
    </div>
  )
}
