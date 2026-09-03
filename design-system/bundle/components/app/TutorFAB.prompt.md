# TutorFAB

The floating AI-tutor button ("שאל/י את וופל") fixed at the bottom-left `tutor-fab` FAB slot — a 56px amber→orange gradient circle with a white waffle badge, extracted from `src/components/AITutor/TutorFAB.tsx`.

```jsx
<TutorFAB onClick={() => console.log('פתיחת מסך הצ\'אט עם וופל')} />

{/* faded out while the MathLive virtual keyboard is open */}
<TutorFAB kbOpen={true} />
```

## Seams

- `useTutorStore((s) => s.openDrawer)` → `onClick` prop (fired on tap).
- `useTutorStore((s) => s.open)` early-return (`if (open) return null`) and the Cmd/Ctrl+K `window` keydown listener that called `toggleDrawer` → removed; the bundle renders the rest state (drawer closed, FAB visible).
- `useKeyboardOpen()` (MathLive virtual-keyboard global signal from `lib/uiStacks`) → `kbOpen` prop, default `false`.
- `getStackOffset('bl', 'tutor-fab')` → `bottom`/`left` props defaulting to its computed value `{ bottom: 20, left: 20 }`.
- lucide-react `<MessageCircle size={26} />` → exact inline `<svg>` (lucide v0.323.0 `message-circle` path + defaultAttributes: fill none, stroke currentColor, strokeWidth 2, round caps/joins) at the app's size 26.
