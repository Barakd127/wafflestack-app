# Tooltip

Hover/focus tooltip (from `src/components/Tooltip.tsx`) used across the app on icon buttons and quiz topbar controls; shows after a 400ms delay, positions itself fixed next to the trigger, closes on Escape, and renders nothing on touch devices.

```jsx
<Tooltip label="שיקויים" description="לחצו כדי להשתמש בשיקוי בזמן החידון" placement="bottom">
  <button className="ws-icon-btn">🧪</button>
</Tooltip>
```

## Seams

- `[ds-extract]` replaced `react-dom` `createPortal(..., document.body)` — the tooltip node renders inline next to the trigger instead; since `.ws-tooltip` is `position: fixed; z-index: 9500`, visual output is unchanged (only DOM parenting differs, so clipping ancestors with `overflow: hidden` + `transform` could theoretically differ).

## CSS classes used

`ws-tooltip`, `ws-tooltip-desc` (rules live in the bundle's `app-classes.css`).
