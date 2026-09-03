# graphTheme

The single source of truth for the look of every interactive graph in WaffleStack — font stack, colour tokens (navy ink / gold data / blue accents), card style, and the shared frame + slider shell components. Extracted from `src/components/graphs/graphTheme.tsx` (reference style chosen from ZScoreInteractive).

```jsx
import { GraphFrame, GraphSlider, GraphSliderRow, GC, GRAPH_FONT } from './graphTheme';

function Demo() {
  const [mu, setMu] = React.useState(100);
  const [sigma, setSigma] = React.useState(15);
  return (
    <GraphFrame title="התפלגות נורמלית" subtitle="הזיזו את הסליידרים וראו איך העקומה משתנה">
      <svg viewBox="0 0 640 240">
        <path d="M0,220 C200,220 260,20 320,20 C380,20 440,220 640,220"
          fill={GC.goldFill} stroke={GC.gold} strokeWidth={3} />
      </svg>
      <GraphSliderRow>
        <GraphSlider label="ממוצע (μ)" value={mu} min={60} max={140} onChange={setMu} />
        <GraphSlider label="סטיית תקן (σ)" value={sigma} min={5} max={30} onChange={setSigma} />
      </GraphSliderRow>
    </GraphFrame>
  );
}
```

Notes:

- `graphCardStyle` consumes the app-level CSS variables `var(--sh-q-card-bg, #FCFDFF)` and `var(--sh-text-dark)` — provide them (or rely on the `#FCFDFF` fallback for the background).
- `GraphSlider` renders an `<input type="range">` with class `ws-graph-range`; the app styles it globally, but `accentColor: GC.blue` carries the look standalone.
- `GraphFrame` sets `dir="rtl"`.

## Seams

None — the module is fully self-contained (constants + presentational components only). No stores, routers, icons, or animation libraries were replaced.
