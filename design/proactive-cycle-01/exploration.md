# Proactive Cycle 01 — Gameplay Design Space Exploration

**Branch:** `proactive/exploration/games-design-space`  
**Date:** 2026-05-27  
**Cycle:** 1 of N (exploration only — no code changes)  
**NotebookLM:** SKIPPED (MCP connector not available in this container; design judgment drawn from VISION.md catalogue + git history + game mechanic library)

---

## Context

WaffleStack today has a working quiz engine (SM-2, Hebrew, RTL) and a 3D Kenney city scene, but the city is purely cosmetic — buildings unlock at XP milestones, which is **gamification, not gameplay**. The VISION.md north-star rule demands: one meaningful decision every 15–30 seconds, where the player *uses* the statistical concept to make the decision. This cycle explores the space of candidates that could replace or supplement the current city-as-decoration loop with real gameplay.

---

## Scoring Rubric

| # | Criterion | Notes |
|---|---|---|
| 1 | Decision rhythm | Meaningful choices every 15–30 s |
| 2 | Stats-fit | Player *uses* the concept in the decision (not adjacent) |
| 3 | Engine-building | Early choices compound into later state |
| 4 | Wonder-tap | Delight / surprise / "wow" moment |
| 5 | Decoration risk | HIGH score = LOW risk (mechanic stands without cosmetics) |
| 6 | Mobile-thumb | One-thumb, portrait, bottom-reach |
| 7 | Hebrew/Israeli fit | Theme resonates with target learner |

Each criterion 0–5. Max total: 35.

---

## Candidates

### Loop 1: Sampling Caravan — דגימת השוק

Player sends "surveyors" into a procedurally-generated Tel Aviv neighborhood grid to sample populations; budget is limited so each sample size + stratification choice matters. Pay shekels for n, get a confidence interval back; client (the quiz) demands an estimate within tolerance.

- **Board game mechanic:** Century Spice Road — converting cheap resources (small n) into valuable ones (tight CI) via investment chains.
- **Mobile game pattern:** Mini Metro — fixed budget, growing demand, weekly upgrade choice (n, strata, or replicates).
- **Decision interval:** ~20 s
- **Stats concept used in decision:** Sampling, confidence intervals, bias vs. variance, stratification
- **Scores:** Decision 5 / Stats-fit 5 / Engine 4 / Wonder 3 / DecoRisk 5 / Mobile 4 / Hebrew 4 → **Total: 30/35**
- **Risk:** Math-heavy UI may feel like a spreadsheet on mobile.

---

### Loop 2: Distribution Garden — גן ההתפלגויות

Player plants "seed" data points onto a histogram canvas to match a target distribution shown by a client (e.g., "build me a right-skewed income dist, μ≈8k"). Each plant costs energy; mean/SD/skew update live.

- **Board game mechanic:** Patchwork — spatial tile placement with limited resource (time/energy) and irregular shapes (bin widths).
- **Mobile game pattern:** Two Dots — tactile drag, immediate visual feedback per placement.
- **Decision interval:** ~10–15 s
- **Stats concept used in decision:** Shape of distribution, central tendency, dispersion, skew
- **Scores:** Decision 4 / Stats-fit 5 / Engine 3 / Wonder 4 / DecoRisk 5 / Mobile 5 / Hebrew 3 → **Total: 29/35**
- **Risk:** Becomes pattern-matching without conceptual depth if targets are too literal.

---

### Loop 3: Hypothesis Heist — שוד ההשערות

Reigns-style swipe game where each card is a research claim ("קפה גורם לחרדה — n=40, p=.048"); swipe left = reject, right = accept. Wrong swipes drain credibility meters (Type I / Type II shown as two opposing gauges).

- **Board game mechanic:** Godfather: Corleone's Empire — territory/reputation pressure; each decision shifts faction balance.
- **Mobile game pattern:** Reigns — binary swipe, dual-meter tension.
- **Decision interval:** ~8–12 s
- **Stats concept used in decision:** p-values, effect size, statistical power, multiple comparisons
- **Scores:** Decision 5 / Stats-fit 4 / Engine 2 / Wonder 4 / DecoRisk 4 / Mobile 5 / Hebrew 4 → **Total: 28/35**
- **Risk:** Weak engine-building; mostly tactical not strategic. Type I/II gauge risk becoming pure Whack-a-Mole.

---

### Loop 4: Regression Roastery — בית הקלייה

Player operates a coffee shop and must predict daily demand by choosing predictors (weather, day-of-week, promo) to add to a regression model; over-fit = inventory waste, under-fit = lost sales.

- **Board game mechanic:** Seize the Bean — coffee-shop engine with daily customer types and upgrade tiles.
- **Mobile game pattern:** Duolingo — daily session, streak, incremental complexity unlock.
- **Decision interval:** ~25 s
- **Stats concept used in decision:** Regression, overfitting, R², residuals, predictor selection
- **Scores:** Decision 4 / Stats-fit 5 / Engine 5 / Wonder 3 / DecoRisk 4 / Mobile 4 / Hebrew 5 → **Total: 30/35**
- **Risk:** Regression intuition is hard to convey in one thumb-swipe; the "overfitting" revelation requires multiple rounds to land.

---

### Loop 5: Bias Brigade — חטיבת ההטיות

Stuffed Fables–style scene where player navigates a research scenario and must spot/correct biases (selection, recall, confounding) before publishing; each unfixed bias spawns a "gremlin" that distorts later results.

- **Board game mechanic:** Stuffed Fables — narrative scenes with branching choices and persistent consequences (per-encounter unique mechanic).
- **Mobile game pattern:** Duolingo — scene-by-scene progression with immediate correction.
- **Decision interval:** ~30 s
- **Stats concept used in decision:** Research design, confounding, selection bias, internal validity
- **Scores:** Decision 3 / Stats-fit 5 / Engine 4 / Wonder 5 / DecoRisk 4 / Mobile 3 / Hebrew 5 → **Total: 29/35**
- **Risk:** Authoring scenarios doesn't scale; content bottleneck. Wonder-tap is strong but relies on high-quality writing.

---

### Loop 6: Probability Pushka — קופת ההסתברות ⭐

Player owns a "pushka" (jar) of numbered chips representing a personal probability distribution. Each round: a Hebrew word-problem sets a target (e.g., "ממוצע הציונים שלך השבוע צריך להיות בין 75–85"). Player draws chips one at a time; running mean + live density plot updates on screen. Push-your-luck: stop early (safer estimate, fewer points) or keep drawing (tighter CI, but bust if you cross a variance threshold). Between rounds, spend earned shekels to add/remove/swap chips — reshaping your distribution.

- **Board game mechanic:** Quacks of Quedlinburg — bag-building + push-your-luck. Dice Forge (mutating your own toolkit).
- **Mobile game pattern:** Threes — simple satisfying tactile draw, escalating numeric stakes.
- **Decision interval:** ~15 s
- **Stats concept used in decision:** Expected value, variance, Law of Large Numbers, empirical vs. theoretical probability
- **Scores:** Decision 5 / Stats-fit 5 / Engine 5 / Wonder 5 / DecoRisk 4 / Mobile 5 / Hebrew 3 → **Total: 32/35**
- **Risk:** "Bag" metaphor is unfamiliar to Israeli BA students without a "pushka" reskin (addressed in spec below).

---

### Loop 7: Correlation Catan — קטאן של מתאמים

Hex map of variables; player draws "edges" they believe are causal/correlated and earns points per correct edge; spurious edges trigger Simpson's-paradox style reversals later.

- **Board game mechanic:** Catan — hex placement, road-building, longest-network bonus; trading window for swapping variable hypotheses with NPCs.
- **Mobile game pattern:** Two Dots — connect-the-dots with chain bonuses.
- **Decision interval:** ~20 s
- **Stats concept used in decision:** Correlation, causation, confounders, Simpson's paradox
- **Scores:** Decision 4 / Stats-fit 5 / Engine 4 / Wonder 4 / DecoRisk 4 / Mobile 4 / Hebrew 3 → **Total: 28/35**
- **Risk:** Causal inference is conceptually advanced for intro stats; scope risk is high.

---

## Score Summary Table

| # | Name | Decision | Stats-fit | Engine | Wonder | DecoRisk | Mobile | Hebrew | Total |
|---|---|---|---|---|---|---|---|---|---|
| 6 | Probability Pushka | 5 | 5 | 5 | 5 | 4 | 5 | 3 | **32** |
| 1 | Sampling Caravan | 5 | 5 | 4 | 3 | 5 | 4 | 4 | **30** |
| 4 | Regression Roastery | 4 | 5 | 5 | 3 | 4 | 4 | 5 | **30** |
| 2 | Distribution Garden | 4 | 5 | 3 | 4 | 5 | 5 | 3 | **29** |
| 5 | Bias Brigade | 3 | 5 | 4 | 5 | 4 | 3 | 5 | **29** |
| 3 | Hypothesis Heist | 5 | 4 | 2 | 4 | 4 | 5 | 4 | **28** |
| 7 | Correlation Catan | 4 | 5 | 4 | 4 | 4 | 4 | 3 | **28** |

---

## Top-3 Ranking

**1. Loop 6 — Probability Pushka (32/35)**  
**2. Loop 1 — Sampling Caravan (30/35)**  
**3. Loop 4 — Regression Roastery (30/35)**

**Rationale:** Pushka tops because every chip-draw is a probability decision the player *feels* through live variance, the bag IS the engine (early chip choices compound across all later rounds), and the push-your-luck bust moment creates a wonder/dread beat without any cosmetic layer. It also teaches E[X], Var[X], SE, and LLN in one mechanic that is indistinguishable from the game itself. Sampling Caravan is conceptually richer but heavier UI for mobile. Regression Roastery has the strongest Israeli cultural fit (coffee shop) but slower decision rhythm and harder-to-convey overfitting intuition.

---

## #1 Detailed Spec: Probability Pushka — קופת ההסתברות

### Tagline (Hebrew, player-facing)
> "בנה את קופת המזל שלך — כל צ'יפ שתוסיף משנה את ההסתברויות. תמשוך עוד? או תעצור לפני שתתפוצץ?"

### Core Mechanic

1. Player owns a **pushka** (jar) of numbered chips representing their personal probability distribution.
2. Each round, a Hebrew word-problem sets a **target interval** (e.g., "ממוצע הציונים שלך צריך להיות בין 75–85, תוך 6 משיכות לכל היותר").
3. Player draws chips one at a time; **running mean** + **live density sparkline** updates after each draw.
4. **Push-your-luck decision:** stop now (lock in current estimate, safe points) or draw again (tighter CI, but risk crossing the bust threshold = variance too high).
5. Between rounds, spend earned **shekels** at a chip shop: add chips (raise EV, inflate variance), remove chips (tighten variance, lower EV), or swap (shift the distribution).

### The Meaningful Decision

Every 10–20 seconds the player chooses: draw another chip (reduce sampling error, risk bust) or lock in the current estimate. This is a literal application of the **stopping rule** in sequential sampling — one of the hardest intuitions in intro statistics. Between rounds the strategic decision is which chips to buy: high-value chips raise the mean but inflate variance; "anchor" chips at the median stabilize. The mix the player builds over 5 minutes determines what target intervals they can safely hit.

### How Statistics Is USED (Not Decorated)

The bust threshold IS the variance of the player's bag, computed live — to survive long rounds the player must intuitively understand that adding extreme chips raises both E[X] and σ². To hit a narrow target interval the player must reason about the Law of Large Numbers (more draws → tighter sample mean) versus the bust risk from their bag's variance. There is no way to win by guessing; the optimal strategy literally requires applying E[X], Var[X], and the relationship `n → SE = σ/√n`.

### Engine-Building Moment

In round 2 the player can buy a cheap "median anchor" chip (value=5, contributes low variance) instead of a flashy "10" chip. Five rounds later, when a tough target (μ=7, σ<2) appears, that anchor is the only reason their bag doesn't bust every draw. Players who chased high-value chips early hit a wall and *learn variance the hard way* — but recoverably (next round they can re-tool the shop).

### Failure State

"Bust" pops a Hebrew explainer:
> "השונות של הקופה שלך הייתה 14.2 — חצית את הסף של 12. נסה להוסיף צ'יפ קרוב לממוצע."

No XP lost; round ends, player keeps bag, sees a 1-tap "תקן את הקופה" suggestion. Failure teaches the exact concept that caused it. Aligned with VISION tone rule: encouragement after wrong, never punishment.

### MVP Scope (One Sprint)

- `src/components/Pushka/PushkaPanel.tsx` — main game container (Pushka mode toggle alongside existing quiz)
- `src/components/Pushka/PushkaJar.tsx` — animated jar with chip count, live mean/variance display
- `src/components/Pushka/ChipShop.tsx` — between-rounds shop, 6 chip types priced by EV-contribution
- `src/components/Pushka/TargetCard.tsx` — Hebrew word-problem card with target interval display and live CI meter
- `src/components/Pushka/DensitySparkline.tsx` — live histogram of bag using Recharts (already in deps) or inline SVG
- 10 hand-authored Hebrew target prompts spanning EV / variance / LLN / stopping rules
- Feature-flagged: `src/config/featureFlags.ts` → `PUSHKA_MODE: false` until reviewed by Barak

### Where It Lives in the Current Codebase

- New route/mode alongside existing study hub; reuses `XPSystem`, `StreakTracker`, achievements infrastructure
- SM-2 engine ingests bust-reasons as flashcards (bust on variance → variance card marked overdue), preserving the existing spaced-repetition investment
- The R3F city scene backdrop is reused cosmetically — the pushka sits on a market stall; city buildings are NOT the mechanic (avoids the current decoration trap)
- Hebrew/RTL layout inherited from existing i18n setup (`dir="rtl"` on root)
- No new color tokens: uses `--gold`, `--teal`, `--red`, `--bg-2`, `--border` from locked palette

### Hebrew Cultural Hook

"Pushka" (קופת צדקה / קופה) is a culturally loaded Israeli object — a charity jar you put coins in over time and shake to guess what's inside; reframing it as a probability jar with actual stakes lands instantly with the target demographic.

### Open Questions for Barak

1. **Session persistence:** Should the bag (chip collection) persist across sessions (true engine-building, heavier onboarding for returning users) or reset daily (Duolingo-style, lower stakes, simpler mental model)?
2. **Adaptive difficulty:** Is the bust threshold fixed per level (legible rules) or tied to the player's own bag variance history (adaptive, but harder to explain to a statistics novice)?
3. **Social layer:** Do we want an asynchronous mode where two students compare bags on the same target round (social pressure motivator common in Israeli classroom culture) or strictly solo for the MVP?

---

## Citations Summary

| Source | Type | Borrowed |
|---|---|---|
| Quacks of Quedlinburg | Board game | Bag-building + push-your-luck core loop |
| Dice Forge | Board game | Mutating your own probability toolkit |
| Seize the Bean | Board game | Coffee-shop engine feel for Loop 4 |
| Century Spice Road | Board game | Resource-conversion chain for Loop 1 |
| Patchwork | Board game | Spatial placement + cost pressure for Loop 2 |
| Godfather: Corleone's Empire | Board game | Dual-meter reputation tension for Loop 3 |
| Stuffed Fables | Board game | Per-encounter narrative consequences for Loop 5 |
| Catan | Board game | Trade window + network for Loop 7 |
| Threes | Mobile game | Tactile draw, escalating numeric stakes (Pushka) |
| Mini Metro | Mobile game | Fixed-budget routing decisions (Caravan) |
| Two Dots | Mobile game | Drag + chain + visual feedback (Garden, Catan) |
| Reigns | Mobile game | Binary swipe + dual meter (Heist) |
| Duolingo | Mobile/UI | Daily session + streak (Roastery, Brigade) |

---

*Next cycle (Cycle 2): Implement Probability Pushka MVP behind feature flag. npm run build must pass. Minimum one Vitest unit test for chip-draw / variance logic.*
