# Sidebar

The 247px RTL app-shell sidebar of the WaffleStack study hub (glass diamond logo header, nav rows with `ws-icon-chip` icon badges, solid `--sh-sidebar-active` pill on the active row, admin toggle + Pomodoro slot at the bottom). Extracted from `src/components/StudyHub.tsx` (`Sidebar` + `AdminToggle` + `renderIcon`).

```jsx
import { Sidebar } from './Sidebar.jsx';

<div style={{ height: '100vh', display: 'flex', direction: 'rtl' }}>
  <Sidebar
    activeItem="courses"
    onNavigate={(target) => {
      // target: 'home' | 'courses' | 'arsenal' | 'world' | 'tours'
      console.log('נווט אל', target);
    }}
    lockedFeatures={['arsenal']}
    lockTips={{ arsenal: 'נפתח ב-120 XP — הארסנל שלי' }}
  />
</div>
```

## Seams

- `onNavigate` prop — [ds-extract] replaced the app's `onNav` / `onGoWorld` / `onGoMindmap` / `onGoDrawing` / `onGoNotebook` / `onOpenTours` callbacks with a single `onNavigate(idOrAction)`.
- `lockedFeatures` + `lockTips` props — [ds-extract] replaced `useLearningStore` `adminMode`/`unlockedFeatures` + `isFeatureUnlocked` gating and the `FEATURE_UNLOCKS_BY_ID[...]?.descriptionHe` tooltip lookup. Default: everything unlocked.
- Fixed 247px width — [ds-extract] replaced `width: '100%'` inside the app's resizable `<nav width={sidebarWidth}>` wrapper; the collapse branch (`width < 80`) is statically false and the drag-resize handle is removed.
- AdminToggle — [ds-extract] replaced `useLearningStore` `adminMode`/`toggleAdminMode` with local `React.useState(false)`; markup unchanged.
- Pomodoro slot — [ds-extract] replaced `<FeatureGate id="pomodoro" mode="hide"><PomodoroTimer /></FeatureGate>` with an empty placeholder div honoring `--ws-pomodoro-left` (and `--ws-bottom-fab-inset`).
