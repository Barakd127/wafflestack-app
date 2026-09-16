# Ribbon

Labeled toolbar group (from `src/components/Ribbon.tsx`) used in the quiz topbar: a horizontal row of icon buttons with a tiny centered caption underneath (caption hidden with `hideLabel`, kept for aria).

```jsx
<Ribbon label="שיקויים" hideLabel>
  <button className="ws-icon-btn">🧪</button>
  <button className="ws-icon-btn">⚗️</button>
</Ribbon>

<Ribbon label="חשבון">
  <button className="ws-icon-btn">👤</button>
</Ribbon>
```

## Seams

- None — pure presentational component, ported verbatim.

## CSS classes used

`ws-ribbon`, `ws-ribbon-label` (rules live in the bundle's `app-classes.css`).
