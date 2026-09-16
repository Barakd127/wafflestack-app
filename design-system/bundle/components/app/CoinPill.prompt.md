# CoinPill

The coin-economy pill — the only place a coin balance is ever displayed (gold glass pill with coin glyph and he-IL tabular numerals; on `surface="learning"` it shrinks to a quiet 20px icon with no number) — extracted from `src/components/economy/CoinPill.tsx`.

```jsx
{/* economy surface: full clickable pill */}
<CoinPill surface="economy" balance={145} onClick={() => console.log('פתיחת חנות הקישוטים')} />

{/* learning surface: icon only, no number, nothing clickable (R13) */}
<CoinPill surface="learning" />

{/* before the first retrieval gate pass the pill does not exist */}
<CoinPill hasPass={false} />
```

## Seams

- `userId` prop + `useLedgerVersion(userId)` subscription (`onLedgerChange` re-render signal) + `loadLedger(userId)`/`coinBalance(ledger)` → `balance` prop, default `145`.
- `ledger.graph.some(g => g.type === 'retrieval-passed')` visibility gate → `hasPass` prop, default `true` (the `if (!hasPass) return null` branch is preserved).
- `setDrawerOpen(true)` + the mounted `<SpendDrawer/>` → `onClick` prop; the drawer is closed at rest so the pill's pixels are unchanged.

## Omissions (non-visual-at-rest code from the 682-line source file)

- `SpendDrawer` (חנות הקישוטים): backdrop + RTL side panel, building-tier ladder (צריף→בית→מגדל→ציון דרך), ornament SKUs, ספר החשבונות ledger list, Escape-key handling, `useLearningStore` buildingProgress, `purchase()`/`loadCosmetics()` calls — an open-state overlay, not part of the pill at rest.
- `ArrivalCeremony`: full-screen purchase ceremony overlay with the `ae-descend` keyframe animation and `prefers-reduced-motion` handling — fires only after a successful `ledger.purchase()`.
- `BuildingGlyph`, catalog constants (`BUILDING_TIERS`, `ORNAMENTS`, `ZERO_COIN_NOTE`), `tierSkuId`/`currentTierStep` ledger math, `usePrefersReducedMotion`, and the `Intl.DateTimeFormat` date formatter — used only by the omitted drawer/ceremony.
