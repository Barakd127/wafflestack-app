# StreakCalendar

7×4 study-streak calendar (last 28 days) from the WaffleStack motivation screen — gold-gradient cells for completed study days, pulsing gold-outlined cell for today, RTL Hebrew heading with the current streak count. Source: `src/components/motivation/StreakCalendar.tsx`.

```jsx
// 12-day streak (default)
<StreakCalendar />

// Custom streak length — fills the last 5 days in gold
<StreakCalendar streak={5} />
```

## Seams

- `streak` prop (default `12`) — [ds-extract] replaced `useMotivationStore((state) => state.streak_current_days)`; visual output unchanged.
