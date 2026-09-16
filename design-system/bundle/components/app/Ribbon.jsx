// [ds-extract] from src/components/Ribbon.tsx @ c1a3ad12 (master)
import React from 'react';

export function Ribbon({ label, hideLabel, children }) {
  return (
    <div className="ws-ribbon" aria-label={label}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        {children}
      </div>
      {!hideLabel && <span className="ws-ribbon-label">{label}</span>}
    </div>
  )
}
