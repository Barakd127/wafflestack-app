# WaffleStack — Proactive Cycle 01: Gameplay Design Space Exploration

**Date:** 2026-05-26  
**Cycle:** 1 (exploration only — no code)  
**Branch:** `proactive/exploration/20260526-0504`  
**Status:** Draft PR — awaiting Barak review

---

## Problem Statement

The current WaffleStack loop is: **quiz → XP → 3D city grows**. The city is cosmetic decoration, not gameplay. Per VISION.md rule: *"Gamification ≠ Gameplay. Cosmetic rewards are decoration. Gameplay is the player making meaningful decisions with real consequences."*

The fix: replace or augment the loop so that the statistical concept itself **is** the decision mechanism — not a side quest attached to it.

---

## Candidate Loops

### 1. The Sampling Lab (Push-Your-Luck Distribution Pulls)

Player runs a research lab pulling samples from a hidden population to "publish" findings. Each pull costs budget; stopping too early = wide CI = rejected paper; pulling too long = bankruptcy.

- **Decision every ~20s:** Pull another sample, or stop and submit. Optional: spend on stratification, switch population, buy a prior.
- **Stats USED (not memorized):** Sample size → standard error → confidence interval width. Player feels n shrinking the CI in real time.
- **Scores (1–10):**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 9 | One tap every 15-25s, tension escalates naturally |
| Wonder tap | 6 | Histogram dots flying + CI band narrowing is satisfying |
| Engine-building potential | 7 | Lab upgrades compound: cheaper pulls, new domains |
| Topic-fit | 10 | CI / SE / n / effect size are literally the game object |
| Decoration risk (low = good) | 2 | Upgrade tiles change formulas, not aesthetics |

- **Borrowed from:** Quacks of Quedlinburg (push-your-luck ingredient pulls) + Threes / Mini Metro (one-gesture escalating tension)

---

### 2. Distribution Forge (Mutable-Dice Engine)

Player crafts custom probability distributions — visualised as custom dice — and rolls them against challenges. Each mastered topic adds or reshapes a face (shifts mean, adds variance, skews, truncates the tail).

- **Decision every ~25s:** Which die face to upgrade, or which distribution to roll against this turn's challenge ("beat target 12 with smallest variance").
- **Stats USED:** Mean, variance, skew, expected value, CLT (sum of independent RVs).
- **Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 7 | Slightly slower; upgrade decisions are thoughtful |
| Wonder tap | 8 | Watching your custom distribution evolve is delightful |
| Engine-building potential | 10 | Best compounder in the set — each upgrade multiplies forward |
| Topic-fit | 9 | Covers probability concepts directly |
| Decoration risk | 3 | Shape of die = mechanic, not cosmetic |

- **Borrowed from:** Dice Forge (mutable die faces) + Stack the States (collection-as-power, mobile)

---

### 3. Hypothesis Court (Reigns-style Verdict Swipes)

Cases arrive: "Coffee improves memory? n=24, d=0.3, p=0.08." Swipe left = reject H₀, right = fail to reject. Each verdict shifts your lab's reputation, funding, and replication record across three axes.

- **Decision every ~15s:** Read one case card, swipe reject/fail-to-reject, or burn time demanding more data.
- **Stats USED:** p-value interpretation, effect size, statistical power, Type I/II error tradeoff. Funding axis punishes false positives; reputation axis punishes underpowered studies.
- **Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 10 | Fastest in set — near-Wordle density |
| Wonder tap | 5 | Card swipe is clean but less visually rich |
| Engine-building potential | 6 | Reputation axes compound but less mechanical depth |
| Topic-fit | 9 | p-values, power, effect size are the exact stumbling blocks |
| Decoration risk | 2 | No cosmetic reward path exists |

- **Borrowed from:** Reigns (binary swipe binary consequence) + Godfather: Corleone's Empire (multi-axis reputation)

---

### 4. Correlation Patchwork (Spatial Scatter-Tiles)

Player tiles a board with data-point clusters; each tile has a slope/intercept signature. Fitting tiles that share a regression line earns combo bonuses; orthogonal tiles "break" the model.

- **Decision every ~20s:** Place one tile to extend a line, or rotate to start a new regression axis (multiple regression branch).
- **Stats USED:** Correlation r, linear regression slope/intercept, R², residuals, multicollinearity (overlapping tiles).
- **Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 8 | Satisfying placement, each move visible |
| Wonder tap | 9 | Scatter-plot aesthetic is beautiful in dark UI |
| Engine-building potential | 8 | Combo chains produce compounding XP |
| Topic-fit | 8 | Regression is key topic but not all concepts fit |
| Decoration risk | 4 | Tile combos could drift toward pure Tetris-satisfaction |

- **Borrowed from:** Patchwork / Azul (spatial tiling under cost/time budget) + Two Dots (chain-and-clear visual reward, mobile)

---

### 5. Mini Metro: Variance Lines (Real-Time Triage)

Stations are populations with different variances; lines are t-test/ANOVA pipelines. Passengers (data points) flow; player routes them through correct statistical tests before stations overflow.

- **Decision every ~20s:** Draw a connection, upgrade line to ANOVA (3+ groups), or add an "assumption check" car.
- **Stats USED:** Choosing the right test (t-test vs ANOVA vs paired vs Welch's), homogeneity of variance, independence assumption.
- **Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 9 | Real-time pressure creates density |
| Wonder tap | 8 | Mini Metro aesthetic is proven beautiful |
| Engine-building potential | 7 | Network upgrades compound but complexity ceiling |
| Topic-fit | 7 | Test selection is key but less foundational than CI/n |
| Decoration risk | 5 | Risk of becoming pure routing puzzle |

- **Borrowed from:** Mini Metro (network-routing real-time) + Catan (resource routing + trade window)

---

### 6. Stats Faction Wars (Asymmetric Deck-Build)

Player picks a statistical school (Frequentist / Bayesian / Effect-size purist / Nonparametric). Each draws different cards. Defeat "research questions" by playing card combos that match the question's structure.

- **Decision every ~25s:** Play a card ("Bonferroni correction," "Bootstrap CI," "Prior=Beta(2,2)"), or discard to draw.
- **Stats USED:** Knowing which tool fits which question — multiple comparisons, robustness, prior choice, parametric assumptions.
- **Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 7 | Card evaluation takes time; depth is high |
| Wonder tap | 7 | Card art + faction identity satisfying |
| Engine-building potential | 9 | Deck thins and strengthens with mastery |
| Topic-fit | 8 | Advanced topic coverage but maybe scope-creep risk |
| Decoration risk | 3 | Every card change = mechanic change |

- **Borrowed from:** Dominion / Arctic Scavengers (asymmetric tribe leader) + Slay the Spire (mobile deck rhythm)

---

### 7. The Replication Garden (Engine + Wonder Collection)

Each completed study becomes a seed. Plant it; it grows only if a simulated replication (drawn from estimated effect + noise) succeeds. Failed replications wilt; robust effects bloom into compounding resource generators.

- **Decision every ~30s:** Plant a new seed, water (re-run replication) an old one, or prune (drop a study from meta-analysis).
- **Stats USED:** Effect size, power analysis, meta-analytic pooling, publication bias.
- **Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 6 | Slower pacing; more strategic |
| Wonder tap | 10 | Living garden aesthetic — highest wonder in set |
| Engine-building potential | 10 | Compounding generators, true engine feel |
| Topic-fit | 8 | Covers key meta-science concepts well |
| Decoration risk | 6 | Garden visuals risk drifting decorative |

- **Borrowed from:** Wingspan (engine-build + bird collection) + Century Spice Road (resource pyramid prerequisite chain)

---

## Top-3 Ranking

| Rank | Loop | Key reason |
|---|---|---|
| #1 | **The Sampling Lab** | Highest topic-fit (10), lowest decoration risk (2), cleanest mobile-first gesture. Maps directly to Israeli BA students' actual research experience. Expandable to cover the full intro stats curriculum via question archetypes. |
| #2 | **Distribution Forge** | Best engine-building (10), covers probability concepts with unique beauty. Best candidate for Cycle 2 if Sampling Lab hits a design wall. |
| #3 | **Hypothesis Court** | Fastest decision rhythm (10), ideal daily-puzzle format. Could be a companion game mode (daily 5-minute challenge) nested inside the Sampling Lab meta. |

---

## #1 Detailed Spec: The Sampling Lab

*Designed by Opus 4.7 gameplay oracle, 2026-05-26*

### Core Loop (one "run" = one published paper, ~3 minutes)

1. **Brief.** A research question card appears in Hebrew: "האם שיטה א׳ עדיפה על שיטה ב׳ בלפחות d=0.4?" Hidden truth lives in a population the player can sample from. Budget = ₪500. Deadline = peer-review clock (amber ring, visible always).

2. **Pull.** Player taps "דגום עוד" (Pull more). Five data-point dots fly from a hidden population cloud onto a live histogram. Mean marker and shaded CI band update instantly. Sampling distribution overlay (faint blue curve) updates too — the player sees the CLT happening in real time.

3. **Read the state.** Player sees: current mean diff (d̂), current 95% CI band width, the decision threshold line (where the required effect size d sits). Tension: is the CI tight enough? Did the lower bound cross zero? Is time running out?

4. **Decide.** Three buttons always in thumb zone: **דגום עוד** (Pull more, teal — shrinks CI, costs ₪20), **שדרג** (Power-up menu, blue — stratify, adjust α, pre-register, run a pilot), or **פרסם** (Publish, gold — lock in result, reviewer scores). Every 15–25 seconds.

5. **Verdict.** Reviewer NPC accepts/rejects based on CI width, effect size, pre-registration status, and whether stopping was optimal. Accepted papers become **permanent lab upgrades** — cheaper sampling, better priors, new domains unlocked. These are the engine, not the wallpaper.

### How Stats Maps to Mechanics (precise)

| Stats concept | Mechanic |
|---|---|
| n → SE = σ/√n → CI width | CI band on screen literally narrows as player pays for samples; player feels diminishing returns of √n in their wallet |
| Confidence level (α) | Spending "tighten to 99%" widens the band — precision/confidence tradeoff made visceral |
| Effect size d | The "decision threshold" line is drawn at required d; player must get CI to lie entirely on correct side — not just "significant" |
| Statistical power | "Pilot study" power-up reveals expected σ; player can estimate required n before burning budget |
| Optional stopping / p-hacking | Reviewer flags "garden of forking paths" if player just keeps pulling until p<0.05; reputation hit; teaches pre-registration |
| CLT | Sampling distribution overlay builds across runs — player develops intuition that sample means are normal even when raw data isn't |

### UI Sketch (mobile-first, Hebrew RTL, dark palette)

```
┌──────────────────────────────────────────────────────┐ ← bg=#0e0f12
│  [Question card, Hebrew, fg=#e8eaed]   [₪480] [🕐⬤]  │ ← budget gold, clock amber
│  "האם מדיטציה מפחיתה חרדה ב-d≥0.3?"                 │
├──────────────────────────────────────────────────────┤
│                  LIVE HISTOGRAM                       │ ← bg-2=#16181d card
│  ·  ·  · ·  ··  ·  ·         [CLT curve, blue]      │
│  ────────●────────────────── ← mean (gold)            │
│       [══════CI band══════] ← gold-warm, translucent │
│                    | ← d=0.3 threshold (red dashed)  │
│  n=35  d̂=0.31  CI=[0.08, 0.54]  p=0.032             │ ← mute text
├──────────────────────────────────────────────────────┤
│  [דגום עוד  +n=5  ₪20]  [שדרג ▸]  [פרסם ✓]           │ ← teal / blue / gold
│          THUMB ZONE — bottom 120px                    │
└──────────────────────────────────────────────────────┘
Side rail (collapsible RTL): lab upgrades as icon-tiles in gold-light
```

### How It Differs from "Quiz + Cosmetic City"

- **No multiple-choice.** Player never picks A/B/C/D. They pick a number of samples and a moment to stop — the actual decision a researcher makes.
- **Upgrades are mechanics, not cosmetics.** Each lab upgrade modifies σ, cost-per-sample, or unlocks a new test type. Removing the visual still leaves a functional game. That is the VISION.md test: "gameplay, not decoration."
- **Failure is informative, never a wall.** Rejected paper shows reviewer's annotated CI: "you stopped at n=20, CI crossed zero, you needed n≈47 for 80% power." Budget refund keeps the player going.
- **Compounds over sessions.** 5 wins → cheaper sampling → can attack harder questions (smaller effects, noisier domains). Engine-building, not XP-grinding.

### Decision Interval

15–25 seconds per meaningful choice. Each pull animation = 2–3s, CI reading = 5s, deciding = 5–15s. Tunable via cost-per-pull and clock pressure. **Daily Challenge mode**: fixed seed (Wordle-style) — every Israeli stats student works the same population each day, leaderboard (future Supabase feature).

### Why This Works for Israeli BA Social-Science Students Specifically

- **Hebrew stats vocabulary lands on real referents.** `מובהקות`, `רווח סמך`, `גודל אפקט`, `עוצמה סטטיסטית` each map to a visible UI element — fixes the #1 complaint that Hebrew stats terms feel abstract and disconnected.
- **Mirrors actual thesis workflow.** BA social-science students will write a seminar paper with t-tests/ANOVA on small samples and tight budgets. The game is literally their future workflow, gamified. The Israeli grading band maps directly to the "effect sizes you'd realistically publish" in the challenge cards.
- **Replication crisis is live in Israeli psych depts.** Teaching pre-registration and stopping rules through play addresses what their professors already worry about.
- **RTL + mobile-first fit commute habits.** Three-button thumb zone works one-handed on the bus between Ariel and Tel Aviv. Sessions are 3–5 minutes, not 30.
- **Dark UI + gold accents read as serious tool**, not childish — important for adult learners self-conscious about "playing a game" instead of "studying."

### Risk + Mitigation

**Risk:** Push-your-luck core can feel samey after 20 runs — every question reduces to "pull until CI is tight."

**Mitigation:** Question archetypes unlock new mechanic layers on top of the stable pull verb:

| Runs | Archetype | New mechanic |
|---|---|---|
| 1–10 | One-sample mean | Base loop |
| 11+ | Two-sample t-test | Pulling from *two* clouds, deciding budget split between groups |
| 20+ | ANOVA | Three clouds, must also decide post-hoc correction (Bonferroni / Tukey) |
| 30+ | Correlation | Pulling paired xy points, watching r-CI evolve |
| 40+ | Simple regression | Placing data points on scatterplot, watching slope±CI |
| 50+ | Multiple regression | Budget split across 3+ predictors, multicollinearity warning fires |

This is the **Stuffed Fables principle** (per-encounter unique mechanic) grafted onto a stable gesture — player's hands stay fluent while their conceptual depth grows. Same verb (pull / read / decide / publish), escalating statistical complexity.

---

## Citations

| Category | Source | Mechanic borrowed |
|---|---|---|
| Board game | **Quacks of Quedlinburg** | Push-your-luck bag pulls — risk/reward of stopping vs continuing |
| Board game | **Dice Forge** | Mutable distribution faces — player crafts the randomness they work with |
| Board game | **Stuffed Fables** | Per-encounter unique mechanic — same core verb, topic-specific rules |
| Board game | **Arctic Scavengers** | Asymmetric faction identity — school-of-thought as tribe leader |
| Board game | **Catan** | Trade window, resource management under budget pressure |
| Mobile game | **Threes** | One simple gesture with escalating tension and feedback density |
| Mobile game | **Mini Metro** | Clean minimal HUD, real-time routing triage |
| Mobile game | **Reigns** | Binary swipe with multi-axis consequence — fast verdict rhythm |
| UI source | **Linear.app** | Dark-UI density, status pills, keyboard-driven micro-interactions |
| UI source | **Apple HIG (iOS dark mode)** | 44pt min hit targets, thumb-zone primary action placement |
| UI source | **Duolingo** | Path-tree branching (question archetypes as skill branches) |

---

## Open Questions for Barak

1. **Lab metaphor vs "run your own place"?** The Sampling Lab feels like a university research lab — which matches BA psych students, but misses the "coffee shop / hotel" emotional pull. Could frame as a **polling agency** or **data consultancy** (similar energy, Hebrew-culturally resonant "survey-house" trope) — player's firm gains reputation rather than a researcher's career.

2. **Daily seed (Wordle pattern) vs infinite runs?** Daily challenge would drive return habits better, but infinite mode lets students practice specific topics they're weak on. Recommend both — daily challenge unlocks after first 5 runs.

3. **Question bank authoring:** Who writes the Hebrew research question cards? Agents could generate them from the existing quiz-bank.json (100 questions) — convert each question into a "study design" framing. Worth a separate cycle.

4. **Godot city integration:** Does the lab replace the city (less scope, cleaner), or does a successful publication add a building to the city (keeps current investment)? Could keep city as passive "portfolio" view — not cosmetic if publications are the actual game loop.

5. **Sound design budget:** Push-your-luck loops rely heavily on audio feedback (each pull click, CI-tightening hum, publish chime). Current app has SoundManager.tsx — is there a sound budget approved?
