# TopBar

The 70px glass top bar of the WaffleStack study hub (`ws-topbar`): page title + optional context controls on the start side; dark-mode toggle and the three-ribbon strip (התקדמות XP pill / שיקויים / חשבון) on the end side, separated by `ws-ribbon-divider` hairlines, with the gold bottom border via `--sh-topbar-border` over `--sh-topbar-bg`. Extracted from `src/components/StudyHub.tsx` (`TopBar`; `Ribbon` inlined verbatim from `src/components/Ribbon.tsx`).

```jsx
import { TopBar } from './TopBar.jsx';

<TopBar
  title="סטטיסטיקה א' — בחר נושא"
  userName="ברק"
  xp={735}
  darkMode={false}
  onToggleDark={() => {}}
  onLogout={() => {}}
  contextControls={<button style={{ background: 'none', border: 'none' }}>→ חזרה</button>}
/>
```

## Seams

- `userName` prop (default `'Student'`) — [ds-extract] replaced `localStorage.getItem('userName')`.
- `xp` prop (default `0`) — [ds-extract] replaced `useLearningStore(state => state.xp)` (zustand).
- `potionsSlot` prop (default `null`) — [ds-extract] replaced `<PotionInventory />` (economy-store potion icons); the שיקויים ribbon shell is unchanged.
- `tourLauncherSlot` prop (default `null`) — [ds-extract] replaced `<TourLauncher />` (tutorial-store guided-tours button).
- Logout tooltip — [ds-extract] replaced the `<Tooltip label="יציאה" description="התנתק מהחשבון">` wrapper (hover-only overlay, hidden at rest) with a native `title` attribute.
