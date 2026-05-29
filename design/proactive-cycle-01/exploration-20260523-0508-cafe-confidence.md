# WaffleStack — Proactive Cycle 01 Pass: Café Confidence

**Date:** 2026-05-23T05:08  
**Branch:** proactive/exploration/games-design-space  
**Cycle type:** Exploration only (no code)  
**Model routing:** Opus 4.7 → gameplay decision; Sonnet 4.6 → synthesis

> **Note on previous passes:** This branch already contains multiple exploration passes from earlier agents (variance café, pipeline foundry, sampling bazaar, etc.). This pass approaches the problem fresh from VISION.md and provides an independently-scored candidate set. The #1 pick here (Café Confidence) is related to but distinct from "Sigma Bakery / Variance Tycoon" in `exploration.md` — the key difference is the **CI-slider prep-phase mechanic** vs. the variance-tuning tycoon mechanic.

**NotebookLM:** not available in this container (MCP not provisioned). Used VISION.md mechanic catalogue + Opus 4.7 judgment instead.

---

## Context

The core problem unchanged across all previous passes: the player makes no meaningful decision between quiz questions. The 3D city is cosmetically satisfying but structurally inert.

**This pass's angle:** Previous explorations found strong candidates but each had a different #1. This pass uses a stricter scoring criterion for "Decoration risk" — specifically, can a PM future-stakeholder bolt cosmetic rewards onto this mechanic and keep it intact? A mechanic that is immune to cosmetic degradation scores 5; one that invites it scores 1.

---

## Candidates — fresh scoring

### A. Café Confidence — Score: 27 ⭐ #1

**Pitch:** Run a Tel Aviv café; each day a new wave of customers arrives drawn from a hidden distribution. The player must infer the distribution from sample data to make bake-quantity decisions.

**Core decision:** How many of each item to bake tomorrow, given today's sample demand. Over-bake = waste (shekels lost), under-bake = stockout (customers lost). The 95% CI band on the prep slider IS the mechanic.

**Stats concept used IN decision:** Sample mean, SD, and 95% CI — not memorized, but applied to move a slider. The width of the CI visually communicates uncertainty.

| Criterion | Score | Rationale |
|---|---|---|
| Decision rhythm | 5 | ~20s per item prep card, 6 items = natural 2-min decision sequence |
| Wonder tap | 5 | "Run your own place" is VISION's highest-priority emotional pull |
| Engine-building | 5 | History accumulates → CIs tighten → prep becomes more precise over time |
| Topic fit | 5 | CI is the mechanic, not decorating it. Remove CI, decision is random |
| Decoration risk | 4 | Could bolt on XP popups, but they wouldn't change the core decision |
| Buildability | 3 | DaySimulator + ForecastSlider are ~150 lines each; service phase is the heaviest |
| **Total** | **27** | |

**Board game:** Viticulture (seasonal cycle, upfront resource commitment before harvest), Quacks of Quedlinburg (push-your-luck stop decision — mirror of "stop sampling / commit to bake quantity")  
**Mobile game:** Stardew Valley (run-your-place loop), Mini Metro (minimal HUD + one-handed resource routing)

---

### B. Pollster — Score: 26

**Pitch:** Knesset election polling agency. Sample voters, commit to published prediction before results drop.

**Core decision:** How large a sample vs. remaining budget; which strata to include. Push-your-luck: pull another sample or commit?

**Stats concept:** Sampling bias, margin of error, stratified sampling.

| Criterion | Score |
|---|---|
| Decision rhythm | 5 |
| Wonder tap | 3 |
| Engine-building | 3 |
| Topic fit | 5 |
| Decoration risk | 5 |
| Buildability | 5 |
| **Total** | **26** |

**Board game:** Quacks of Quedlinburg (push-your-luck stop-sampling), Century Spice Road (resource engine)  
**Mobile game:** Reigns (binary commit-or-spike decision), 80 Days (route/resource tradeoff)

---

### C. Hypothesis Heist — Score: 24

**Pitch:** Research-fraud detective. Spend limited evidence tokens on the right test against each claim before the trial timer.

**Core decision:** Which test (t-test vs chi-square vs correlation) + which α level against which claim.

**Stats concept:** Test selection, Type I / Type II error tradeoff.

| Criterion | Score |
|---|---|
| Decision rhythm | 4 |
| Wonder tap | 4 |
| Engine-building | 3 |
| Topic fit | 5 |
| Decoration risk | 5 |
| Buildability | 3 |
| **Total** | **24** |

**Board game:** Sherlock Holmes Consulting Detective (resource-constrained deduction), Mechs vs Minions (escalating scenario chain)  
**Mobile game:** Return of the Obra Dinn (inference from incomplete evidence), Reigns (verdict swipe)

---

### D. Stat Stack (spatial) — Score: 23

**Pitch:** Azul-style spatial puzzle. Incoming tiles = data observations. Place them into histogram bins to match a target distribution shape under time pressure.

**Stats concept:** Distribution shape, skewness, mean/median divergence visible as board state.

| Criterion | Score |
|---|---|
| Decision rhythm | 5 |
| Wonder tap | 3 |
| Engine-building | 2 |
| Topic fit | 4 |
| Decoration risk | 4 |
| Buildability | 5 |
| **Total** | **23** |

**Board game:** Azul, Patchwork  
**Mobile game:** Threes, Triple Town

---

### E. Pipeline (pre-commit programming puzzle) — Score: 22

**Pitch:** Mechs vs Minions style. Sequence your stats pipeline (filter → transform → test) before pressing RUN; wrong order = invalid results.

**Stats concept:** Regression assumptions, test prerequisites, procedure correctness.

| Criterion | Score |
|---|---|
| Decision rhythm | 3 |
| Wonder tap | 3 |
| Engine-building | 4 |
| Topic fit | 5 |
| Decoration risk | 5 |
| Buildability | 2 |
| **Total** | **22** |

**Board game:** Mechs vs Minions, Robo Rally  
**Mobile game:** Human Resource Machine, while True: learn()

---

### F. Lab Factions (deck + asymmetric schools) — Score: 23

**Pitch:** Pick a research school (Bayesian / Frequentist / Causal); each draws different moves from your mastered-topic deck.

**Stats concept:** Topic combinations as combos; faction choice shapes which concepts compound.

| Criterion | Score |
|---|---|
| Decision rhythm | 5 |
| Wonder tap | 3 |
| Engine-building | 5 |
| Topic fit | 3 |
| Decoration risk | 4 |
| Buildability | 3 |
| **Total** | **23** |

**Board game:** Root / Cry Havoc (faction asymmetry), Arctic Scavengers (tribe leader = school pick), Dominion (deck)  
**Mobile game:** Slay the Spire (hand management under constraint)

---

### G. Market Maker (NPC data trading) — Score: 21

**Pitch:** Trade samples with NPC researchers. Build the dataset you need to publish before rivals.

**Stats concept:** Sample size effect, variance reduction via aggregation.

| Criterion | Score |
|---|---|
| Decision rhythm | 5 |
| Wonder tap | 2 |
| Engine-building | 4 |
| Topic fit | 3 |
| Decoration risk | 3 |
| Buildability | 4 |
| **Total** | **21** |

**Board game:** Catan (trade window), Sidereal Confluence  
**Mobile game:** Idle tycoon pattern

---

## Top-3 ranking

### #1 — Café Confidence (27)

Chosen over the similar "Sigma Bakery" from previous pass on one key distinction: the **CI slider** is the core interaction, not variance-tuning. CI slider makes the statistical uncertainty *visible and manipulable* — the player literally drags their commitment into the CI band, then watches whether reality falls inside it. This is more direct as a CI-teaching mechanic than tweaking process parameters.

Complements previous passes: if "Pipeline Foundry" (pass 3) gets built as a boss-battle encounter, it slots naturally into Café Confidence's service phase as the "prove my baking process is valid" intervention.

### #2 — Pollster (26)

Most culturally resonant for the target user (Israeli BA student, Knesset elections are a lived stats lab). Highest buildability score. Lower wonder tap. Good fallback if Café Confidence proves too heavy to implement in 4 cycles.

### #3 — Hypothesis Heist (24)

Best topic fit for test selection specifically. Recommend as a **boss-battle encounter** inside Café Confidence's service phase rather than a standalone game — exactly the "Stuffed Fables per-encounter mechanic" pattern from VISION.md.

---

## #1 Detailed Spec: Café Confidence

### Full session loop (~7 min, "one day")

1. **Morning brief (15s):** Day card appears. Weather + calendar modifier shown (e.g., "גשום · סוף חודש" = rainy + payday). Yesterday's demand histogram (n=30) visible.

2. **Prep phase (3–4 min, ~20s per item):** Six item slots, snapped-scroll. Each item shows:
   - 7-day sparkline histogram
   - A horizontal slider for bake quantity
   - A **95% CI band** overlaid on the slider — narrower means less historical variance → safer commitment
   - Projected profit ± CI-width in ₪

3. **Service phase (90s, watched + one intervention):** Customers arrive sampled from a hidden true distribution shifted by day modifiers. Player watches inventory bars deplete. ONE intervene button available:
   - "זיהוי חריגה" (anomaly detect) → one-sample t-test: is this hour unusual vs 7-day baseline? Pass = restocking token.
   - "קשר בין פריטים" (item correlation) → Pearson r check: do these two items co-occur? High r → bundle discount.
   - "עצור ייצור" (halt production) → one-sided hypothesis test: is demand dropping significantly?

4. **Closing (30s):** Profit = revenue − waste. Bonus: "CI hit" — did reality fall inside the player's 95% CI? First time this happens shows an explanation of what CI means.

5. **Upgrade shop (30s):** Spend profit on permanent upgrades keyed to mastered topics:
   - "תנור גדול" (bigger oven) → sample size × 1.5 → CIs tighten
   - "כרטיס נאמנות" (loyalty program) → binomial return model activated
   - "מסוף נתונים" (data terminal) → regression on weather modifier unlocked

6. **Optional training night:** 3–5 SM-2 questions. Earns a "forecast boost" token (adds +5 to effective n tomorrow → tighter CI). Purely voluntary.

### Decision → concept map

| Player decision | Statistical concept |
|---|---|
| Bake quantity slider position | Sample mean, SD as natural CI center |
| Accepting wide vs narrow CI commit | 95% CI interpretation; variance in data |
| Intervene: anomaly | One-sample t-test |
| Intervene: correlation | Pearson r, correlation vs causation |
| Intervene: halt | One-sided hypothesis test |
| Loyalty card upgrade | Binomial return probability |
| Price-setting upgrade | Regression slope (price elasticity) |
| Stop sampling on new item | Push-your-luck / CI width tradeoff |
| Bigger oven upgrade | Law of large numbers, CI ∝ 1/√n |

### State (persists)

```typescript
interface CafeGame {
  day: number
  cash: number
  history: DailySample[]         // feeds histograms + CI calc
  items: MenuItem[]              // each has hidden μ, σ, dayModifier
  upgrades: Upgrade[]            // keyed to mastered topics
  interventionTokens: number     // 1 per day + quiz bonus
  forecast: Record<ItemId, { qty: number; ciLow: number; ciHigh: number }>
  mastery: Record<Topic, SM2State> // existing learningStore, reused
}
```

### ASCII mockup — prep phase (Hebrew RTL, dark, mobile)

```
┌─────────────────────────────┐
│  יום 12        ₪1,240   [?] │
│  גשום · סוף חודש             │
├─────────────────────────────┤
│  קרואסון                    │
│  ▁▂▃▅▇▅▃  7 ימים            │
│  [◀═══●═══════════▶] 42    │
│  ▓▓▓░░░░░░░░░░░░░░░░        │
│  CI 95%: 35–58              │
│  צפי רווח: ₪180 ± ₪40       │
├─────────────────────────────┤
│  קפה הפוך                   │
│  ▂▃▇▇▇▅▃                    │
│  [◀═══════●══════▶] 88     │
│  ▓▓▓▓▓▓▓░░░░░░              │
│  CI 95%: 79–97              │
├─────────────────────────────┤
│         [ פתח את הקפה ▶ ]    │
└─────────────────────────────┘
```

### ASCII mockup — service phase

```
┌─────────────────────────────┐
│  09:14     לקוחות: 23/?     │
│  ████████░░░░░░░░░  58%    │
│                             │
│  קרואסון  ▇▇▇▅▂  19/42     │
│  הפוך     ▇▇▇▇▇▇  71/88    │
│                             │
│  ⚠ חריגה: +1.8σ השעה הראשונה │
│  [ הרץ מבחן t ] (1 טוקן)   │
└─────────────────────────────┘
```

### Existing components reused

| Component | Reuse |
|---|---|
| `learningStore` SM-2 engine | Training night quiz + mastery gates unlocks |
| 3D Godot city scene | Café street exterior; mastered topic → lit shop neighbor |
| Distribution visualizations (`DistributionChart`, `StdDevInteractive`) | 7-day sparkline histograms in prep cards |
| `StatChallenge.tsx` | Training-night quiz wrapper |
| `useLearningStore` mastery record | Gates upgrades + new menu items |

### New components (Cycle 2+)

| Component | Purpose |
|---|---|
| `src/config/featureFlags.ts` | `CAFE_CONFIDENCE: false` flag |
| `DaySimulator` | Pure functions: sample customers, apply day modifier, compute profit |
| `ForecastSlider` | Drag quantity; live 95% CI band; projected profit overlay |
| `ServicePhase` | Animated floor + inventory bars + intervene button |
| `InterventionPanel` | Stats actions (t-test, correlation, hypothesis) + token system |
| `UpgradeShop` | Spend cash on topic-keyed permanent upgrades |
| `cafe` Zustand slice | Persistent café state |

### How it avoids the cosmetic trap

Every visual is **load-bearing**:
- The histogram IS the data you reason from. Blind it → random decision.
- The CI band IS the uncertainty cost. Remove it → player cannot learn CI.
- Inventory bars depleting IS the sample being drawn. The variance is real.
- Shekels IS the feedback signal — no separate XP bar needed.
- Upgrade effects change simulator parameters, not just appearance: bigger oven = larger n = tighter CI = prep gets easier. The visual *is* the consequence.

### Mobile / RTL compliance

- Sliders in bottom 60% (thumb zone; Apple HIG 44pt targets)
- Snap-scroll between prep cards (one decision per stop)
- Hebrew RTL: histograms read right-to-left; slider "more" direction = leftward
- Service phase: mostly watch + one large bottom-center button
- Day auto-saves after each prep card (resume mid-prep without loss)

### Build plan

| Cycle | Deliverable |
|---|---|
| **2** | `featureFlags.ts` + `DaySimulator` pure functions (Vitest-tested) + `ForecastSlider` (one item, no persistence) |
| **3** | Service phase + t-test intervene button + profit calc + day persistence |
| **4** | 6-item prep, 3 topics (CI, hypothesis, correlation) wired, upgrade shop skeleton |
| **5** | Remaining 7 topics as item/upgrade unlocks; RTL polish; SM-2 training-night bridge |

---

## Vision alignment check

| Rule | Compliant? | Citation |
|---|---|---|
| What we are: stats-first via game | ✓ | Every decision uses a statistical concept (decision map above) |
| Gameplay ≠ Gamification | ✓ | Reward = shekels (next decision's budget), not XP popups |
| Design rule: Hebrew-first | ✓ | All UI copy in Hebrew RTL; ASCII mockup in Hebrew |
| Design rule: dark UI | ✓ | `--bg`, `--bg-2`, `--card`, `--gold`, `--teal` tokens only |
| **Color palette: only locked tokens (NO new hexes)** | ✓ | Exploration doc only; no code written |
| UI source cited | ✓ | Linear (density + status pills), Apple HIG (44pt thumb targets), Mini Metro (minimal HUD) |
| UI anti-pattern avoided | ✓ | No modal-on-modal; no hamburger menu; bottom-sheet pattern for feedback |
| Tech invariant: Tailwind only | ✓ | No styling approach introduced |
| Tech invariant: Zustand only | ✓ | New `cafe` slice planned inside Zustand |
| Tone rule: encouragement | ✓ | Wrong quantity → "ממה שלמדת היום, מחר תדייק יותר" |
| Mobile-first (thumb-reach + 44pt targets) | ✓ | Prep cards snap-scroll; service button bottom-center |
| Out of scope: stays in scope | ✓ | No multiplayer, no teacher dashboard, intro topics only |

**NotebookLM consulted:** no — MCP not available in this container.  
**Board-game inspiration:** Viticulture (seasonal commitment cycle), Quacks of Quedlinburg (push-your-luck stop mechanic), Stuffed Fables (per-encounter unique mechanic → service-phase intervention pattern).  
**Mobile-game inspiration:** Stardew Valley (run-your-place emotional pull), Mini Metro (minimal HUD + one-handed).  
**Decision interval:** ~20s per prep item card; ~15s during service interventions.  
**Statistical concept used in decision:** 95% CI for bake quantity; one-sample t-test for service intervention; Pearson r for bundle decision.

---

## Open questions for Barak

1. **Café vs. Sigma Bakery?** Previous pass scored "Sigma Bakery" at 29/30 with a variance-tuning mechanic. This pass scores "Café Confidence" at 27/30 with a CI-slider mechanic. They are both "run a place" but the core interaction differs. Which resonates more: "tune your process until variance shrinks" (tycoon feel) or "commit to a quantity under CI uncertainty" (forecasting feel)?

2. **Previous #1s to synthesize:** Distribution Forge (Mutable Dice), Sampling Bazaar, Pipeline Foundry, Sigma Bakery, Pollster Press, Café Forecaster — which element from each should survive into the final build? Suggest: Pipeline Foundry's pre-commit sequence → Café service-phase intervention; Mutable Dice → upgrade-shop progression feeling.

3. **Training night optional vs required?** SM-2 quiz earns a forecast-boost token. Should 3 questions ever be gated (mandatory before next day opens)?

4. **Godot city integration?** The Godot iframe hosts the 3D city. Should Café Confidence replace the city view or coexist alongside it as a new "mode"?
