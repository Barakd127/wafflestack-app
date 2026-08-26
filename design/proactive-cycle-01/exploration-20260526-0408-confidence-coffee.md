# WaffleStack Cycle 1 — Gameplay Exploration (Pass 21)

> Proactive cycle 01 · pass 21 · 2026-05-26 04:08 · Model: Opus 4.7 (design decision) + Sonnet 4.6 (synthesis)
>
> NotebookLM: SKIPPED — MCP connector not available in this container.
> Design judgment drawn from VISION.md catalogue + board-game / mobile-game analysis.
>
> **Prior consensus (passes 01–20):** Distribution Forge / Mutable-Dice Engine.
> **This pass:** Independent evaluation surfaces Confidence Coffee as #1 (23/25).
> **Discrepancy noted** — see "Divergence from Prior Consensus" section below.

---

## Context from Prior Passes

Passes 01–20 on this branch converged strongly on **Distribution Forge / Mutable-Dice Engine** (27/30 peak score). Pass 08 established the full 8-candidate comparison. Passes 10–17 confirmed via independent Opus calls. Pass 14 briefly challenged with "Expedition: The Sample Map" (94/100 on a custom rubric) before Passes 15–17 restored Distribution Forge as consensus.

This pass ran an independent Opus 4.7 call with no prior context from the branch. The result diverged — Confidence Coffee ranked #1. Both findings are documented below.

---

## Candidates Evaluated This Pass

### 1. Confidence Coffee — Score: 23/25
**Tagline:** Push-your-luck barista game where each bag-tap IS a statistical sample and the stopping rule IS the gameplay.

**Core mechanic:** Customer arrives with a target taste value T ± tolerance ε. Player taps a bag to draw beans (each draw = one sample). The confidence interval bar narrows with each tap. Player decides when to stop sampling and serve. Serve too early → CI too wide → miss. Serve too late → drink cold → tip drops.

**Stats concept used in decision:** Confidence intervals, standard error, 1/√n shrinkage, stopping rules, cost-of-information.

**Decision interval:** 5–10s per tap, ~20s per customer turn.

**Engine-building:** Bag upgrades (lower σ), Thermometer (reveals current variance), Pilot Tasters (free pre-samples). All permanent.

**Decoration risk:** LOW — the CI bar IS the win condition, not a reward.

**Mobile:** Excellent. One thumb: tap bag, swipe up to serve.

**Board game:** Quacks of Quedlinburg (bag-draw push-your-luck) + Century Spice Road (engine upgrades).

**Mobile game:** Coffee Rush (timer urgency) + Reigns (binary commit gesture).

| Dimension | Score |
|---|---|
| Decision Rhythm | 5/5 |
| Wonder Tap | 4/5 |
| Engine-Building | 4/5 |
| Stats-Fit | 5/5 |
| Decoration Risk (5=low) | 5/5 |
| **Total** | **23/25** |

---

### 2. Hypothesis Heist — Score: 21/25
**Tagline:** Reigns-style swipes where each card is an experiment — accept or reject H₀ and watch four meters swing.

**Stats concept:** Hypothesis testing, p-value intuition, cost of data, alpha/beta tradeoffs.

**Decision interval:** 8–15s/card.

**Board game:** Cry Havoc (asymmetric factions as frequentist/Bayesian decks). **Mobile:** Reigns (swipe-commit), Wordle (daily bounded).

| Decision Rhythm | Wonder Tap | Engine | Stats-Fit | Decoration Risk | **Total** |
|---|---|---|---|---|---|
| 5 | 4 | 3 | 5 | 4 | **21/25** |

---

### 3. Distribution Drafter — Score: 23/25
**Tagline:** Draft dice and shape a probability distribution to hit a mean/variance target.

**Stats concept:** Distribution building, mean/variance algebra, CLT felt physically as dice stack.

**Decision interval:** 10–20s per draft.

**Board game:** Dice Forge (mutable dice faces, VISION.md catalogue) + Splendor (drafting river).

**Mobile:** Threes (compounding), Vampire Survivors (build-driven).

| Decision Rhythm | Wonder Tap | Engine | Stats-Fit | Decoration Risk | **Total** |
|---|---|---|---|---|---|
| 4 | 4 | 5 | 5 | 5 | **23/25** |

---

### 4. Sample Subway — Score: 20/25
**Tagline:** Mini Metro for sampling — draw routes between populations, reroute as bias accumulates.

**Stats concept:** Sampling design, stratification, bias vs variance, coverage error.

**Decision interval:** 15–30s.

**Board game:** Ticket to Ride (route claim), Catan (resource allocation). **Mobile:** Mini Metro.

| Decision Rhythm | Wonder Tap | Engine | Stats-Fit | Decoration Risk | **Total** |
|---|---|---|---|---|---|
| 4 | 5 | 4 | 4 | 3 | **20/25** |

---

### 5. Regression Tower — Score: 22/25
**Tagline:** Drop data points on an x-axis and minimize residuals to keep the regression line stable.

**Stats concept:** Least squares, leverage, outlier influence, R².

**Decision interval:** 6–12s.

**Board game:** Patchwork (spatial commit, VISION.md catalogue), Azul. **Mobile:** Threes, Tetris.

| Decision Rhythm | Wonder Tap | Engine | Stats-Fit | Decoration Risk | **Total** |
|---|---|---|---|---|---|
| 5 | 4 | 3 | 5 | 5 | **22/25** |

---

### 6. Bayesian Detective — Score: 20/25
**Tagline:** Each clue updates a prior; allocate limited investigations before the suspect escapes.

**Stats concept:** Bayes' rule, prior→posterior, value of information.

**Decision interval:** 15–25s.

**Board game:** Stuffed Fables (per-encounter mechanic, VISION.md catalogue). **Mobile:** Reigns, Obra Dinn.

| Decision Rhythm | Wonder Tap | Engine | Stats-Fit | Decoration Risk | **Total** |
|---|---|---|---|---|---|
| 3 | 5 | 3 | 5 | 4 | **20/25** |

---

### 7. Variance Vendor — Score: 21/25
**Tagline:** Worker-placement market where you trade mean for variance and budget your portfolio's risk.

**Stats concept:** Expected value, variance, covariance, diversification.

**Decision interval:** 20–30s.

**Board game:** Viticulture (worker-placement), Splendor (tableau). **Mobile:** Stardew Valley loop.

| Decision Rhythm | Wonder Tap | Engine | Stats-Fit | Decoration Risk | **Total** |
|---|---|---|---|---|---|
| 3 | 3 | 5 | 5 | 5 | **21/25** |

---

## Top-3 Ranking (This Pass)

| Rank | Candidate | Score | Justification |
|---|---|---|---|
| 🥇 1 | Confidence Coffee | 23/25 | Tightest stats-mechanic coupling; tap gesture IS the stopping rule; CI bar is a textbook visual BA students recognize; fastest decision rhythm; best one-hand mobile fit. |
| 🥈 2 | Distribution Drafter | 23/25 | Strongest engine-building; teaches deepest stats per minute; tie-broken to #2 on mobile histogram legibility at cold start. |
| 🥉 3 | Regression Tower | 22/25 | Most visceral "feel the math" moment; Tetris drop is native mobile; weaker engine-building depth. |

---

## #1 Spec: Confidence Coffee

### Full turn structure

**Setup (3s):** Customer card slides in (portrait, thumb zone). Shows target taste T and tolerance ±ε. Patience timer ring begins counting down (20–30s). Bag composition hint visible.

**Player turn (5–20s per customer):**
- TAP BAG (center thumb target) → draw one bean → value plots as dot on number line → CI bar animates narrower
- SWIPE UP / SERVE → commit current CI, end customer turn
- TAP ICE (optional, costs 1 coin) → +3s on timer

**Resolution (2s):** System reveals true T as vertical line.
- T inside CI AND mean within ε → tip + coin
- T outside CI → reputation −1
- Timer expired → half tip (drink cold)

**Feedback (3s):** Bottom sheet shows CI vs true T. One Hebrew sentence. "הבא" to continue.

**Next turn:** New customer. Difficulty ramps (tighter ε, noisier bag).

### Statistical concept per decision
- Each tap: SE = σ/√n; CI width ∝ 1/√n. Player feels diminishing returns of each additional sample.
- Serve vs sample: explicit stopping rule under uncertainty — the core of sequential analysis.
- Upgrade selection: σ reduction (lower-variance beans) vs free pre-samples — bias/variance tradeoff framed as a business decision.

### Hebrew UX copy (5 prompts)

| Context | Hebrew |
|---|---|
| Customer order | **"מבקש קפה במתיקות 7 ± 0.5. מה תגיש?"** |
| Sampling prompt | **"עוד טעימה? רווח הסמך עכשיו: [6.2, 7.8]"** |
| Serve confirmation | **"להגיש עכשיו? רווח הסמך שלך: [6.7, 7.3]"** |
| Miss feedback | **"פספסת. הערך האמיתי היה 7.6 — דגמת מעט מדי."** |
| Upgrade shop | **"שדרוג: פולים אחידים יותר. סטיית תקן יורדת ב-30%."** |

### Screen layout (portrait)
```
┌─────────────────────────────┐
│  [Customer card + timer]    │  top 15% — portrait header zone
│  מתיקות 7 ± 0.5  ⏱ 00:18  │
├─────────────────────────────┤
│  ←──●─────[CI bar]────→    │  40% — number line + CI visualization
│     x̄=6.9  n=4  ε=±0.5    │  always visible
│  ● ● ● ●                   │  sample dots
├─────────────────────────────┤
│         [ BAG TAP ]         │  25% — primary thumb target (center)
│       💰 Coins: 12          │
├─────────────────────────────┤
│  🧊 Ice (-1c)  ↑↑ SERVE    │  bottom 20% — thumb row
└─────────────────────────────┘
Behind bottom sheet: upgrade shop, shift history, bag composition
Always visible: CI bar, T target, patience timer
```

### Winning/Losing a session
**Win:** 8 customers, ≥5 satisfied, net positive coin. Unlocks permanent upgrade slot.
**Lose:** Reputation hits 0 (3 misses). Loss screen shows CI vs true T for all 8 customers with one-sentence pattern diagnosis. Recoverable: upgrades persist, only reputation resets.

### Early mastery compounding
- Day 1 upgrade (cheap): lower σ bag → tight ε customers reachable without huge n
- Mid-game Thermometer: reveals live sample variance → implicitly teaches t vs z (n<10)
- Late-game Pilot Taster: 3 free pre-samples → introduces stratified sampling sub-mechanic
- Mastery gate at 5 wins: mystery bag (unknown distribution family) → EDA loop

### MVP scope
- `<ConfidenceCoffee />` React component
- Zustand slice: `{customer, samples[], coins, rep, timerMs, phase}`
- `drawBean()`: Box-Muller normal(μ, σ); CI: `x̄ ± 1.96*σ/√n`
- CI bar: Tailwind div, width proportional to CI width
- Timer: `useInterval` + CSS ring via `stroke-dashoffset`
- 3 buttons only: Tap Bag, Serve, End Shift. ~200 LOC. 2-day build target.

---

## Divergence from Prior Consensus

**Prior passes 01–20:** Distribution Forge / Mutable-Dice Engine scored 27/30 on a 6-dimension rubric (Decision Rhythm, Wonder Tap, Engine, Topic Fit, Decoration Risk, Build Complexity).

**This pass (21):** Confidence Coffee scored 23/25 on a 5-dimension rubric (Decision Rhythm, Wonder Tap, Engine, Stats-Fit, Decoration Risk). Distribution Drafter (analogous to Distribution Forge) tied at 23/25.

**Likely explanation of divergence:** This pass's rubric dropped "Build Complexity" (which strongly penalized simpler loops) and weighted "Decision Rhythm" and "Decoration Risk" equally. Confidence Coffee wins on those two dimensions (fastest rhythm; statistically grounded stop-condition). Distribution Forge wins on Engine-Building depth.

**Recommendation for Barak:** Both are strong. Key question: which to prototype first?
- **Confidence Coffee first** if the priority is proving the core loop is fun in ≤2 days (minimal code).
- **Distribution Forge first** if the priority is teaching the widest range of stats topics (mean, σ, CLT, distribution families) from a single mechanic.

The two are not mutually exclusive — Confidence Coffee could later become the "CI and inference" act of a larger Distribution Forge world.
