# Proactive Cycle 01 — Gameplay Design Space Exploration

**Date:** 2026-05-22  
**Cycle:** 1 (exploration only — no code)  
**Branch:** `proactive/exploration/games-design-space`  
**Designer:** Opus 4.7 (gameplay-design decision call)  
**Synthesizer:** Sonnet 4.6  

---

## Context

Current WaffleStack state: React + TypeScript + Vite + Tailwind. Quiz engine (MC, 757 questions, SM-2 spaced repetition). Kenney GLB city in a Godot iframe — buildings unlock with XP. **The city is purely cosmetic: no player decision drives it.** VISION.md names this the locked-in risk for the "city builder" seed: "decoration not decision unless buildings consume/produce resources."

This cycle explores candidate gameplay loops where the player makes a meaningful decision that *uses* a statistical concept every 15–30 seconds.

---

## Candidates

### 1. Pollster Press ★
A Hebrew-first newsroom sim where the player runs a polling agency during a fictional Knesset election cycle. Every 20 seconds a client (party, NGO, newspaper) requests a poll on some claim; player must pick **sample size, sampling frame, and confidence level** under a budget clock, then publish or kill the result based on the CI they roll. Wrong calls cost reputation, right calls unlock new clients and bigger contracts.

- **Decision:** allocate budget across n, stratification, and α; then decide publish/spike based on the interval.
- **Stats concept:** CI width as a function of n and SD, margin of error, sampling bias, type-I error.
- **Board inspiration:** Godfather: Corleone's Empire (commission-driven contract pickup), Century Spice Road (engine of upgrade tokens).
- **Mobile inspiration:** Mini Metro (resource-constrained service under pressure), Reigns (binary commit/spike decision).

| Criterion | Score |
|---|---|
| Decision rhythm | 5 |
| Wonder tap | 4 |
| Engine-building potential | 5 |
| Topic fit | 5 |
| Decoration risk | 5 (low) |
| Build feasibility | 4 |
| **Total** | **28** |

---

### 2. Sigma Bakery (Variance Tycoon) ★
Run a waffle stand. Every batch is a tiny sample with mean and variance of quality. The player tunes **process parameters** (oven temp, batter mix ratio, station count) to compress variance and push the mean toward customer-tolerance bands. Real consequences: customers leave if their order falls below their personal z-threshold. Engine grows by buying machines that reduce SD or shift the mean.

- **Decision:** invest scarce shekels in mean-shifters vs variance-reducers each shift.
- **Stats concept:** mean/SD trade-off, z-scores against customer thresholds, the normal distribution as the customer-satisfaction curve.
- **Board inspiration:** Coffee Rush (real-time bean allocation), Patchwork (scarce tile/upgrade tradeoffs).
- **Mobile inspiration:** Threes (compounding small numeric decisions), Two Dots (board-shaping puzzles).

| Criterion | Score |
|---|---|
| Decision rhythm | 5 |
| Wonder tap | 5 |
| Engine-building potential | 5 |
| Topic fit | 5 |
| Decoration risk | 4 (low-medium) |
| Build feasibility | 5 |
| **Total** | **29** |

---

### 3. Hypothesis Court
Player is a research-fraud detective. Each "case" is a published claim with raw data; player must pick the **right test** (t, chi-square, correlation), choose α, and rule guilty/innocent within a 30-second timer. Cases compound — false convictions damage the journal's credibility meter, throttling future case load.

- **Decision:** test selection + α + verdict.
- **Stats concept:** hypothesis testing, test selection by data type, p-values, type I/II errors.
- **Board inspiration:** Mechs vs Minions (escalating scenario chain), Cry Havoc (claim adjudication).
- **Mobile inspiration:** Reigns (swipe verdicts), Stack the States (escalating fact stack).

| Criterion | Score |
|---|---|
| Decision rhythm | 4 |
| Wonder tap | 3 |
| Engine-building potential | 3 |
| Topic fit | 5 |
| Decoration risk | 4 |
| Build feasibility | 5 |
| **Total** | **24** |

---

### 4. Z-Score Dungeon
Roguelike corridor where monsters have a hidden stat drawn from a normal distribution. Player sees 3 sample fights and must decide **engage, retreat, or scout more** based on the inferred distribution. Equipment lets you reduce SD of your own attack or shift mean.

- **Decision:** sample more (cost) vs commit (risk).
- **Stats concept:** sampling distribution, SE of mean, normal tails.
- **Board inspiration:** Arctic Scavengers (scout vs commit), Stuffed Fables (story-room loop).
- **Mobile inspiration:** Tomb of the Mask (room-by-room flow), Dice Forge (dice-evolution — also board game).

| Criterion | Score |
|---|---|
| Decision rhythm | 4 |
| Wonder tap | 4 |
| Engine-building potential | 4 |
| Topic fit | 3 |
| Decoration risk | 2 (HIGH RISK) |
| Build feasibility | 3 |
| **Total** | **20** |

---

### 5. Correlation Garden
Tile-laying game where each tile is a variable. Placing tiles adjacent creates a correlation; player must build a "causal hedge" that maximizes target outcome correlation while avoiding spurious-correlation traps that drain points. Scatterplots animate in real time.

- **Decision:** which variable to add next, where, and whether to prune a spurious neighbor.
- **Stats concept:** correlation vs causation, confounding, r value, regression slope.
- **Board inspiration:** Patchwork (tile placement), Seize the Bean (recipe stacking).
- **Mobile inspiration:** Mini Metro (graph growth), Two Dots (adjacency mechanics).

| Criterion | Score |
|---|---|
| Decision rhythm | 3 |
| Wonder tap | 4 |
| Engine-building potential | 5 |
| Topic fit | 4 |
| Decoration risk | 3 |
| Build feasibility | 3 |
| **Total** | **22** |

---

### 6. Distribution Drafter
Each round you're dealt 5 "data cards" (numeric values). You draft 3 into your **sample tray** and discard 2. After 7 rounds the tray's mean, median, and SD are scored against a hidden target distribution. Bonus combos for matching mode, beating a z-threshold, or holding outliers.

- **Decision:** draft-and-discard for distribution shaping.
- **Stats concept:** central tendency, dispersion, outliers, robust vs non-robust statistics.
- **Board inspiration:** Century Spice Road (draft engine), Dice Forge (curated dice pool).
- **Mobile inspiration:** Threes (numeric merge intuition), Reigns (commit cards).

| Criterion | Score |
|---|---|
| Decision rhythm | 5 |
| Wonder tap | 3 |
| Engine-building potential | 4 |
| Topic fit | 4 |
| Decoration risk | 3 |
| Build feasibility | 5 |
| **Total** | **24** |

---

### 7. Regression Racer
Side-scrolling race where the track is a noisy scatter of points. Player drags a **regression line** (slope, intercept) in real time; the car follows the line. Tighter fit = more speed. Curves in the data punish overfitting; toggle between linear and polynomial models at a fuel cost.

- **Decision:** when to refit, when to switch model complexity.
- **Stats concept:** linear regression, residuals, overfitting.
- **Board inspiration:** Mechs vs Minions (programmed-line driving), Catan (real-time trade pressure).
- **Mobile inspiration:** Mini Metro (line-drawing under pressure), Tomb of the Mask (continuous motion).

| Criterion | Score |
|---|---|
| Decision rhythm | 4 |
| Wonder tap | 5 |
| Engine-building potential | 2 |
| Topic fit | 4 |
| Decoration risk | 4 |
| Build feasibility | 2 |
| **Total** | **21** |

---

## Top 3 Ranking

### #1 — Sigma Bakery (Variance Tycoon) — 29 points

**Why it wins:** Perfect brand alignment (WaffleStack is literally a waffle app — the metaphor is load-bearing, not tacked on). Every 15–25 seconds the player makes a real numerical decision: tune μ vs σ with scarce focus tokens. The customer-tolerance curve is literally a visible normal distribution — the player learns to read it by playing, not by being told. Engine-building is intrinsic: better machines = tighter SD = more predictable outcomes = more shekels = stronger upgrades. Build feasibility is the highest of any candidate — Canvas + Tailwind histogram, sliders, and a customer queue are all achievable in React in 2 weeks. Distribution Drafter is a natural mini-game *inside* Sigma Bakery for early-game tutorials.

**What it is NOT:** a quiz with waffle graphics. The 757-question bank plugs in as difficulty curation for customer profiles and market events — existing questions drive which distribution scenarios spawn, but the player's verb is never "answer this question."

### #2 — Pollster Press — 28 points

**Why it ranks second:** The only candidate where confidence intervals and sampling are the *literal verb* of the game. Extremely strong stats fit. Docked one point vs Sigma Bakery: requires richer Hebrew text content per client brief, and the decision rhythm dips during reading. Strong candidate for Cycle 3 as a Sigma Bakery DLC — "open a research division inside your bakery."

### #3 — Distribution Drafter — 24 points (tied with Hypothesis Court)

**Why it takes #3 over Hypothesis Court:** Cleanest decision rhythm (a card commit every 4 seconds), zero reading load, easiest to build. The engine layer is thin and wonder ceiling is lower — but it is the best onboarding loop and a natural fit as a **tutorial mini-game inside Sigma Bakery's first shift**.

Hypothesis Court: rejected because it is still a quiz disguised as a game — the player identifies the right test, but "identify the right test" is recall, not forward inference. Fails the VISION brief.

Z-Score Dungeon: rejected — high decoration risk. Stats becomes flavor over HP bars.
Correlation Garden: rejected — rhythm too slow, mobile gesture on RTL is awkward.
Regression Racer: rejected — RTL gesture precision on mobile kills feasibility; no engine layer.

---

## #1 Full Specification: Sigma Bakery (Variance Tycoon)

### Core loop (one sentence)
Bake → inspect the batch's distribution → spend revenue on machines that shift mean or shrink SD → next shift's customers have stricter z-thresholds.

### Turn / round structure

A **shift** is ~90 seconds and contains 4–6 **batches**. A **day** is 3 shifts. A **week** is 5 days and ends with a market event (festival, heatwave, supplier shortage) that mutates the customer distribution.

**Per batch (15–25 sec decision window):**

1. **See:** a queue of 3–7 customers slides in from the right (RTL). Each customer has a colored band showing their tolerance: a horizontal segment on a vertical axis labeled "quality." The band is their personal acceptance interval (e.g., [62, 78]).
2. **See:** your current process state — oven temp dial, batter ratio slider, station count. Below them, a live histogram of your last 20 waffles' quality scores, with mean and SD numerically displayed in gold.
3. **Decide:** before pressing BAKE, the player may make **one** adjustment — nudge the oven (shifts mean), rebalance batter (changes SD), or pull a station offline (changes throughput at cost of SD). Each adjustment costs one **focus token** (3 per shift).
4. **Forecast Gate (the load-bearing mechanic):** before baking, player must tap one of three forecast chips: "I'll serve ≥80% / 50–80% / <50% of this queue." Calibration of forecasts vs outcomes is what drives reputation growth — forcing the player to internally compute `P(customer_band | μ, σ)` every 20 seconds. Wrong forecasts cost a focus token; right forecasts earn a calibration star.
5. **Bake:** the engine draws N samples from N(μ, σ²) where μ and σ are derived from current machines + adjustment. Each sample animates as a waffle dropping onto a customer's plate.
6. **Consequence:** each customer accepts if `sample ∈ [their_lower, their_upper]`, i.e., `|z| < their_z_threshold`. Accepted = pay; rejected = red angry icon + reputation drop. Histogram updates.
7. **Micro-reward:** 100% acceptance → streak ticks + calibration star.

**Between batches (5 sec):** a mini dashboard slides up — "this batch: μ=71.2, σ=4.1, served 5/6." Tap to dismiss or drill into misses (customer rejected, z-score of failing waffle shown in --red).

**End of shift (15 sec):** upgrade kiosk opens (Century Spice Road draft). Three machine cards face-up:
- **Mean-shifters:** "Precision Spatula (+2 μ)", "Thermal Stabilizer (μ +1, σ −0.3)".
- **Variance-reducers:** "Calibrated Whisk (−0.5 σ)", "Twin Oven (−1.0 σ, but max batch 4)".
- **Distribution-shapers:** "Outlier Trap (clip bottom 5% before serving)" — introduces truncated normals.

Player picks one; other two are discarded. This is the engine-building step.

### State the player manages

```
ProcessState {
  baseMu: number              // from machines
  baseSigma: number           // from machines
  machines: Machine[]         // each contributes deltaMu, deltaSigma, modifiers
  focusTokens: number         // 3 per shift, spent on per-batch adjustments
  reputation: number          // 0..100; below 20 throttles customer count
  shekels: number             // currency
  calibrationStars: number    // permanent currency
  streak: number
  history: BatchResult[]      // last N batches for the live histogram
}

Customer {
  lowerBound: number
  upperBound: number          // derived from a personalZ around marketMean
  patience: number            // ms before they leave
  reward: number              // shekels if served
}

MarketState {
  marketMean: number          // drifts daily; players who only chase mean lose
  marketSigma: number         // tightens during festivals
  event: 'normal'|'festival'|'heatwave'|'shortage'
}
```

### Stats-concept mapping

| Concept | Where it appears |
|---|---|
| Mean / median / mode | Live histogram; some events reward median-stable players (heatwave = heavy upper tail, mean misleads). |
| Variance / SD | The visible sigma dial; every machine purchase is a literal SD trade. |
| Z-score | Each miss displays its z-score in --red. `z = (waffle − μ) / σ` shown after every rejected batch. |
| Normal distribution | Customer-tolerance overlay is a normal curve over the histogram; 68% rule becomes intuitive. |
| Sampling distribution | End-of-day view shows distribution of batch means; tighter machines visibly shrink SE = σ/√n. |
| Confidence interval | Weekly inspector audit: player picks n samples; CI shown; fine if true μ outside CI. |
| Hypothesis testing | "Is my new whisk actually better?" — two-sample t-test on yesterday vs today at α player chooses. |
| Correlation / regression | Week 3 unlock: marketing assistant hands scatter (price vs demand); player drags regression line. |
| Chi-square | Contingency mini-puzzle when reputation drops: which customer segment is failing? |

### Visual / spatial representation (mobile portrait, RTL)

```
┌─────────────────────────────┐
│ [timer] [reputation ▓▓▓░░] [₪] [★] │  10%
├─────────────────────────────┤
│  Customer queue →←→←→←→   │  25%
│  [card][card][card][card]   │
│  each shows tolerance band  │
├─────────────────────────────┤
│  Histogram + tolerance over- │  35%
│  lay. μ and σ in --gold.    │
│  Customer bands in --teal.  │
│  Rejected flashes --red.    │
├─────────────────────────────┤
│  [oven knob] [batter] [n]   │  20%
│  μ=70  σ=5   stations=3    │
├─────────────────────────────┤
│ [forecast 80% / 50-80% / <50%] [BAKE] │  10%
└─────────────────────────────┘
```

Color use: histogram bars `--blue`, customer bands `--teal`, misses flash `--red`, accepted pop `--gold` 200ms. Upgrade kiosk uses `--card` + `--border`, gold trim on rare machines. Zero new hex values.

### Failure state

Reputation 0 = shop closed for the day. Not game-over — player keeps machines and calibration stars, restarts next day at reputation 30 with a **diagnostic screen** showing which customer z-thresholds were most often missed. This points to a specific stats weakness:
- Many misses at low z-thresholds → σ is too high → buy variance-reducers.
- Misses on one side of distribution → μ is biased → buy mean-shifters.

The fix is a concrete machine suggestion, not a lecture.

### Branching path (player controls what to learn next)

The upgrade kiosk is the curriculum branch. Three machine families = three topic tracks:

- **Mean track** (μ-shifters) → estimators, bias, mean vs median robustness.
- **Variance track** (σ-shrinkers) → SD, SE, sampling distribution, CIs.
- **Distribution-shaper track** (outlier traps, truncation, mixture machines) → distribution families, hypothesis testing, chi-square.

Machine cards show the stats concept they teach as a small icon in `--mute`. Players who buy three SD-reducers in a row trigger the CI audit event early. Players who buy distribution shapers trigger the t-test event early. Player chooses curriculum order by playing.

### Why this beats the current quiz+cosmetic-city loop

- **City is read-only.** XP unlocks buildings but the player makes no choice. Sigma Bakery makes every shift a sequence of resource-bound numerical decisions whose outcome the player can predict using stats.
- **Quizzes test recall; the bakery tests forward inference.** "Given μ=70, σ=5, what fraction of customers in [65,75] will I serve?" is the actual educational goal.
- **Engine-building replaces flat XP unlock.** Machine choices compound — early SD reduction pays dividends every future shift.
- **The histogram is the playing field, not a decorative chart.** The normal distribution is the game board.
- **SM-2 spaced repetition plugs in as difficulty curation.** Existing 757-question bank drives which customer profiles and market events spawn — the bank isn't discarded, it drives scenario selection. The player's verb is never "answer this question"; the bank is the procedural content engine.
- **Cosmetic city becomes optional eye-candy** ("your bakery on the city map") rather than the only reward layer.

### Biggest risk and mitigation

**Risk:** player optimizes by feel, not stats. They learn "bigger oven = more money" without computing a z-score. Stats becomes decorative again — the failure mode VISION.md warns about.

**Mitigation — Forecast Gate:** before each batch the player taps a forecast chip (≥80% / 50–80% / <50%). Reputation grows only when forecasts match results. This forces internal computation of `P(customer_band | μ, σ)` every 20 seconds — i.e., using the normal CDF. Wrong forecasts cost focus tokens; right forecasts earn calibration stars. Without the Forecast Gate, Sigma Bakery degrades into Cookie Clicker with sliders.

Secondary mitigation: machine tooltips show the formula (`μ' = μ + 2`, `σ' = σ · 0.9`) in `--mute` text. Price tags, not tutorials.

---

## Cycle 2 plan (for next cycle to pick up)

- Implement `src/config/featureFlags.ts` with `SIGMA_BAKERY_ENABLED = false`.
- Scaffold `src/components/SigmaBakery/` with pure-logic layer (no UI): `bakeryEngine.ts` — `sampleBatch(mu, sigma, n)`, `scoreCustomers(samples, customers)`, `applyMachineUpgrade(state, machine)`.
- Add Vitest unit tests for all pure functions.
- Wire basic histogram component (Tailwind bars, no canvas).
- npm run build must pass.

---

*VISION.md not modified this cycle. NotebookLM: SKIPPED (MCP connector not available in this container). Design judgment drawn from VISION.md catalogue + Opus 4.7 synthesis.*
