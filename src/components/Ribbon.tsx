import React, { ReactNode } from 'react'

interface RibbonProps {
  label: string
  /** When true, the label heading is hidden (icons only). Per user request
   *  2026-05-24: "שיקויים" and "חשבון" labels removed from the quiz topbar
   *  to reduce visual noise. Label is still passed for aria/title accessibility. */
  hideLabel?: boolean
  children: ReactNode
}

export default function Ribbon({ label, hideLabel, children }: RibbonProps) {
  return (
    <div className="ws-ribbon" aria-label={label}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        {children}
      </div>
      {!hideLabel && <span className="ws-ribbon-label">{label}</span>}
    </div>
  )
}
