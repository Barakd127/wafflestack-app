import React, { ReactNode } from 'react'

interface RibbonProps {
  label: string
  children: ReactNode
}

export default function Ribbon({ label, children }: RibbonProps) {
  return (
    <div className="ws-ribbon">
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        {children}
      </div>
      <span className="ws-ribbon-label">{label}</span>
    </div>
  )
}
