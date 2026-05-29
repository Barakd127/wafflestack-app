# WaffleStack Cycle 1 — Gameplay Exploration (Pass 22)

> Proactive cycle 01 · pass 22 · 2026-05-26 06:05 · Model: Opus 4.7 (design decision) + Sonnet 4.6 (synthesis)
>
> NotebookLM: SKIPPED — MCP connector not available in this container.
> Design judgment drawn from VISION.md catalogue + prior-pass history + Opus 4.7 independent evaluation.
>
> **Prior consensus (passes 01–21):** Distribution Forge / Mutable-Dice Engine (peaks 27/30).
> Pass 21 surfaced Confidence Coffee (23/25) as a new #1 in an independent evaluation.
> **This pass:** Second independent Opus call confirms same CI/stopping-rules mechanic under a
> different skin ("Sampling Heist"). Two independent Opus calls, zero shared context, same mechanic. Convergence noted.

---

## Context from Prior Passes

Passes 01–20 converged on **Distribution Forge / Mutable-Dice Engine** (27/30 on 6-dimension rubric).
Pass 21 ran a fresh independent Opus call with no prior context and produced **Confidence Coffee** (23/25 on 5-dim rubric) as #1 — structurally: push-your-luck CI stops (tap bag → sample drawn → SE band narrows → decide when to serve/commit).

This pass (22) ran a third independent Opus call (no prior context). It produced **Sampling Heist** (24/25). Side-by-side analysis reveals Sampling Heist is the same mechanic as Confidence Coffee with a different skin:

| Feature | Confidence Coffee (pass 21) | Sampling Heist (pass 22) |
|---|---|---|
| Theme | Coffee shop, bags of beans | Vault, glowing urns |
| Sample action | Tap bag | Tap urn |
| Stop signal | Serve customer | Cash Out |
| Cost of delay | Drink goes cold | Heat meter rises |
| SE visualization | CI bar narrows | SE band shrinks |
| Score function | Tip = f(CI, tolerance) | Payout = f(\|x̄ − μ\|, SE) |
| **Mechanic** | **Push-your-luck + stopping rules** | **Push-your-luck + stopping rules** |

**Conclusion:** Two independent Opus evaluations, separated in time and with zero shared context, arrived at structurally identical gameplay. The CI/stopping-rules mechanic is robust across theme skins.

---

## Candidates Evaluated This Pass (Pass 22)

Opus 4.7 generated 8 candidates scored on 5 dimensions (1–5 each, max 25):
- Decision rhythm | Wonder tap | Engine-building | Topic fit | Decoration risk

### 1. Sampling Heist — 24/25

- **Core mechanic:** Player draws samples from hidden-mean urns, watches SE band narrow, decides when to "cash out" before heat meter maxes out.
- **Board game:** Quacks of Quedlinburg — push-your-luck escalating draw risk
- **Mobile game:** Threes — tactile single-tap commit with anticipation pause
- **Stats concept:** Sampling distributions, SE, stopping rules — payout IS `f(|x̄ − μ|, SE, n)`
- **Decision interval:** 10–20 s
- **Scores:** 5 | 5 | 4 | 5 | 5 = **24/25**
- **Decoration risk:** Remove stats math → no scoring function. Structurally pure.

### 2. Distribution Defender — 22/25

- **Core mechanic:** Data points rain down; player drags μ and σ handles on a normal curve to catch as many as possible before wave ends.
- **Board game:** Patchwork — spatial fit under time pressure
- **Mobile game:** Mini Metro — continuous re-tuning of constrained system
- **Stats concept:** Mean, SD, normal distribution — score IS goodness-of-fit
- **Decision interval:** 5–15 s
- **Scores:** 5 | 4 | 3 | 5 | 5 = **22/25**

### 3. Correlation Cartographer — 22/25

- **Core mechanic:** Place explorer pins on noisy scatterplot, draw regression line; score = prediction accuracy on held-out points.
- **Board game:** Catan — territory + resource yield
- **Mobile game:** Two Dots — drag-to-draw + visual feedback
- **Stats concept:** Correlation, simple regression — residual sum of squares IS the score
- **Decision interval:** 15–25 s
- **Scores:** 4 | 4 | 4 | 5 | 5 = **22/25**

### 4. Confidence Stacker — 20/25

- **Core mechanic:** Pick a confidence level (80/90/95/99%) before each reveal; wider intervals are safe but score fewer points.
- **Board game:** Wingspan — choose-your-engine pace with risk multipliers
- **Mobile game:** Vampire Survivors — meta-progress between short rounds
- **Stats concept:** Confidence intervals — width directly costs points
- **Scores:** 4 | 3 | 4 | 5 | 4 = **20/25**

### 5. Reigns: Statistician — 18/25

- **Core mechanic:** Swipe left/right on study-design cards; each choice shifts hidden meters (sample size, bias, power, p-value).
- **Board game:** Godfather: Corleone's Empire — multi-resource hidden balancing
- **Mobile game:** Reigns — binary swipe, persistent meters
- **Stats concept:** Hypothesis testing, bias, sampling design
- **Scores:** 5 | 4 | 2 | 4 | 3 = **18/25**

### 6. Spice Road Variance — 20/25

- **Core mechanic:** Trade data "spices" of different variances; orders demand specific means + SDs.
- **Board game:** Century Spice Road — cube conversion with target deliveries
- **Mobile game:** Threes — tactile combine
- **Stats concept:** Mean, variance, weighted averages
- **Scores:** 4 | 3 | 5 | 4 | 4 = **20/25**

### 7. Hypothesis Detective — 20/25

- **Core mechanic:** Case files arrive; choose test (t/z/χ²), set α, reject/fail-to-reject before timer; Type I/II errors have asymmetric costs.
- **Board game:** Stuffed Fables — per-encounter unique mechanic
- **Mobile game:** Wordle — daily challenge + shareable result
- **Stats concept:** Hypothesis testing, Type I/II errors
- **Scores:** 3 | 4 | 3 | 5 | 5 = **20/25**

### 8. Median Metro — 19/25

- **Core mechanic:** Passengers (data points) board a line; add stations to keep median position near demand centers as outliers arrive.
- **Board game:** Patchwork — spatial growth under constraint
- **Mobile game:** Mini Metro — escalating throughput pressure
- **Stats concept:** Median, robustness to outliers
- **Scores:** 5 | 4 | 3 | 3 | 4 = **19/25**

---

## Top-3 Ranking (Pass 22)

| Rank | Loop | Score | Tie-break |
|---|---|---|---|
| **#1** | **Sampling Heist** | 24/25 | — |
| #2 | Distribution Defender | 22/25 | Topic 5, Wonder 4, Rhythm 5 |
| #3 | Correlation Cartographer | 22/25 | Topic 5, Wonder 4, Rhythm 4 |

---

## Synthesis: What Three Independent Passes Now Agree On

| Pass | #1 | Mechanic core | Score |
|---|---|---|---|
| 01–20 | Distribution Forge | Mutable-dice engine; die faces ARE the data | 27/30 (6-dim) |
| 21 | Confidence Coffee | Push-your-luck CI stop; tap → sample → SE narrows | 23/25 |
| 22 | Sampling Heist | Push-your-luck CI stop; tap → sample → SE narrows | 24/25 |

**Convergence signal:** Passes 21 and 22 are structurally identical despite zero shared context. The CI/stopping-rules mechanic wins on all 5 criteria. Distribution Forge wins on engine-building depth but has slower rhythm (20s) and higher build complexity.

**Recommended build order:**
1. **Cycle 2:** Confidence Coffee / Sampling Heist (same mechanic; use Coffee theme per VISION.md "run your own place" pull). Lower scope (~350 lines). Fastest path to playable.
2. **Cycle 3:** Distribution Forge (deeper engine-building, higher complexity; builds on player familiarity from Cycle 2).

---

## #1 Detailed Spec: Sampling Heist (confirmed as Confidence Coffee skin)

### Pitch

Dark vault screen. Three glowing urns (gold, emerald, blue) — each hides a population with an unknown mean (e.g., gem prices, crop yields). A Heat meter ticks up with every draw. Tap an urn → a number flies into an evidence ledger; the running x̄ and a shaded SE band update live. The SE band visibly shrinks with each draw (1/√n). At any moment, tap "Cash Out" to submit your estimate: payout = base × (1 − |x̄ − μ| / tolerance). Draw more → more precision → better payout → but heat maxes out and the guards arrive. In 60 seconds, 6–10 sample-or-commit decisions, and the player has felt what standard error means.

For Cycle 2: skin the urns as **coffee bags** (Coffee Shop theme), heat as **customer queue growing**, Cash Out as **"הגש חפישה"** (serve order). Mechanic is identical; theme aligns with VISION.md's emotional pull #1.

### Core Loop

```
Player taps bag/urn
  → x_i drawn from N(μ_true, σ)
  → ledger: x̄ updates, SE = s/√n, band narrows
  → heat += cost(n) [non-linear: 1,1,1,2,3,5,8...]
  → player asks: "SE narrow enough to commit?"
Player taps Cash Out / Serve
  → reveal: true μ shown; payout = f(|x̄ − μ|, SE)
  → gold/coins += payout
  → optional upgrade purchase (engine-building)
```

### Statistical Concept Map

| Concept | Coverage | How |
|---|---|---|
| SE = s/√n | Direct | SE band shrinks visibly each draw |
| Law of large numbers | Direct | x̄ converges toward μ as n grows |
| Sampling distribution | Direct | Each run IS a sample; distribution of x̄ across runs |
| Stopping rules | Direct | Heat cost makes over-sampling costly |
| Confidence intervals | Upgrade | "CI Mode" — commit range not point; payout for coverage × width |
| Bias | Natural stretch | Some urns/bags are "rigged" (skewed draws) |
| Hypothesis testing | Later stretch | "Is this bag faulty?" H₀: μ = target, add H₀ round types |

### Failure States (informative, never punishing)

1. **Bad estimate:** Payout small but nonzero. Reveal animation: true μ line vs. x̄ dot vs. SE band. Hebrew: *"הטווח שלך לא כלל את הערך האמיתי — נסה לדגום יותר."*
2. **Heat maxes:** Run ends. Recap: each urn/bag — your n, your x̄, true μ, n needed for 90% coverage. One upgrade kept (meta-progress). No "you lose" screen.

### Engine-Building Upgrades

| Upgrade | Tier | Stat concept taught |
|---|---|---|
| Stratified Sampler | Early | Split population; reduce variance deliberately |
| Pilot Study | Early | 3 free draws before heat starts |
| Variance Goggles | Mid | See s² live, not just x̄ |
| Bias Detector | Mid | Second bag reveals distribution; enables "rigged?" rounds |
| CI Mode | Late | Commit a range; payout for coverage × tightness |

### Mobile UX (portrait, RTL Hebrew)

```
┌─────────────────────────────────────┐
│ [Timer] [Heat ████░░ #ef4444] [🪙 #FFD700] │  info bar — thumb-unreachable
├─────────────────────────────────────┤
│  Evidence Ledger                    │  passive mid-screen
│  x̄ = 42.3   n = 4                  │
│  ══════[●]══════  ← SE band        │  #10b981 band, #3b82f6 x̄ marker
├─────────────────────────────────────┤
│  [☕ Bag A]  [☕ Bag B]  [☕ Bag C]  │  large tap targets, lower mid
├─────────────────────────────────────┤
│     [  הגש  💰  ] (full-width CTA) │  #FFD700 on #1c1f26, thumb zone
└─────────────────────────────────────┘
```

### Prototype Scope for Cycle 2 (~350 lines, no backend)

- `SamplingHeist.tsx` (or `ConfidenceCoffee.tsx`) — single screen, no routing
- State: `bags: {trueMu, trueSigma, samples[]}[]`, `heat`, `gold`, `upgrades`, `roundActive`
- 3 bags: random μ ∈ [10, 90], σ ∈ [3, 15]
- Tap bag → push `gaussian(μ, σ)`, heat += cost(n), update x̄/SE/band
- SE band: SVG, x̄ ± 1.96·SE, animates per draw
- Cash Out: reveal animation (200 ms), compute payout, next bag
- Heat max: modal recap → restart
- Persist: gold + upgrade in `localStorage`
- Feature flag: `featureFlags.SAMPLING_HEIST_ENABLED`
- All Hebrew, RTL, Tailwind locked palette
- Vitest unit test: `computePayout(xBar, trueMu, se, tolerance)`

### Why This Beats the City Builder

The city builder's buildings appear regardless of statistical reasoning (VISION.md: "locked-in risk"). Sampling Heist cannot degrade: remove the stats math and the game has no scoring function. The player must engage with "is my n big enough?" to win — that question IS introductory statistics.
