# ConceptCard

Quick-reference card for a stats concept (from `src/components/ConceptCard.tsx`), shown in the StatChallenge sidebar: Hebrew + English concept names, a monospace formula strip, and a 💡 real-world example, all tinted by an accent color.

```jsx
<ConceptCard
  concept="Standard Deviation"
  conceptHe="סטיית תקן"
  formula="σ = √(Σ(xᵢ − μ)² / N)"
  realWorld="ציוני מבחן עם סטיית תקן קטנה אומרים שרוב הכיתה קיבלה ציון דומה לממוצע"
  color="#7f9bd9"
/>
```

## Seams

- None — pure presentational component (all inline styles), ported verbatim.

## CSS classes used

None — all styling is inline.
