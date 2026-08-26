# WaffleStack — Proactive Cycle 01: Gameplay Design Space Exploration

**Cycle:** 1 (exploration only — no code)
**Date:** 2026-05-25 07:09
**Branch:** `proactive/exploration/20260525-0709`
**Agent model routing:** Haiku (git/vision read) · Sonnet 4.6 (synthesis) · Opus 4.7 (gameplay decision)
**NotebookLM:** SKIPPED — MCP connector not available in this container. Drawing from VISION.md catalogue + design judgment.

---

## Vision Summary (read from VISION.md)

WaffleStack is a Hebrew-first, dark-UI web app teaching intro statistics to Israeli BA social-science students via **real gameplay**, not gamified quizzes. The mandate: statistics is the win condition. Meaningful player decisions must USE statistical concepts as the decision mechanism — not merely answer questions about them.

Current state: SM-2 quiz + 3D city where buildings grow cosmetically with XP. The city is aesthetically pleasing but has no gameplay: buildings = mastered topics, but nothing produces or consumes resources. VISION.md explicitly flags this as the "locked-in risk" for the city-builder pattern.

Target: one meaningful decision every 15–30 seconds, decisions compound (engine-building), failure is informative, spatial/visual representation of concepts.

---

## 8 Candidate Gameplay Loops

### Candidate 1 — Mutable Dice Engine
**Mechanic blend:** Dice Forge (mutable dice) × Mini Metro (watch distribution form) × sampling theory

**One-sentence pitch:** Start with blank uniform dice; sculpt each face by answering stats questions; every roll draws a live sample from your crafted distribution — the city grows only when your distribution matches the target.

**Decision interval:** ~20–25 seconds per full sculpt cycle.

**Statistical concept used in decision:** Probability distributions, sampling, parameters (μ, σ, skew, kurtosis), CLT — the face-upgrade choice IS a probability mass statement.

**Anti-decoration argument:** Fit score is computed from actual dice rolls. A player who answers quizzes correctly but sculpts badly stalls the city. A player who sculpts wisely (correct statistical judgment) progresses even with imperfect quiz performance. Statistical judgment, not quiz accuracy, is the win condition.

**Score:** Rhythm 5 · Wonder 5 · Engine 5 · Topic-fit 5 · Decor-safe 4 · Scope 3 → **Total: 27/30**

**Board game citation:** Dice Forge — mutable dice faces that you upgrade throughout the game.
**Mobile game citation:** Mini Metro — watch a system form in real time; minimal HUD, instant feedback.

---

### Candidate 2 — Pre-commit Pipeline Puzzle
**Mechanic blend:** Mechs vs Minions (pre-commit sequence) × Threes (watch-and-iterate)

**One-sentence pitch:** A dataset arrives; player pre-commits a card sequence [EXPLORE → CHECK ASSUMPTIONS → CHOOSE TEST → SET α → INTERPRET] before seeing the outcome; a broken assumption breaks the pipeline visibly.

**Decision interval:** ~40–60 seconds (pre-commit is slower by design).

**Statistical concept used:** Full hypothesis-testing pipeline; Type I/II errors; assumption checking.

**Score:** Rhythm 2 · Wonder 3 · Engine 4 · Topic-fit 5 · Decor-safe 5 · Scope 3 → **Total: 22/30**

---

### Candidate 3 — Trading Window Engine
**Mechanic blend:** Century Spice Road (upgrade pyramid) × Catan (trade window)

**One-sentence pitch:** Concept-chips flow up a prerequisite pyramid (raw data → summary stats → inference → models); player decides whether to deepen a concept (farm) or trade up to unlock a new one.

**Decision interval:** ~20–30 seconds per trade decision.

**Statistical concept used:** Concept prerequisite relationships become real economic constraint (regression needs correlation + mean; ANOVA needs t-test + distribution knowledge).

**Score:** Rhythm 3 · Wonder 3 · Engine 5 · Topic-fit 3 · Decor-safe 3 · Scope 3 → **Total: 20/30**

---

### Candidate 4 — Spatial Tiling Daily Challenge
**Mechanic blend:** Patchwork (tile fitting) × Wordle (daily constraint budget)

**One-sentence pitch:** A distribution shape appears as a target silhouette on a grid; player places "stat-tiles" (each = a concept parameter) by answering mini-questions; tiles must fill the shape precisely.

**Decision interval:** ~15 seconds per tile placement.

**Statistical concept used:** Distribution shape parameters; how each parameter changes the curve's silhouette.

**Score:** Rhythm 3 · Wonder 4 · Engine 2 · Topic-fit 4 · Decor-safe 4 · Scope 4 → **Total: 21/30**

---

### Candidate 5 — Push-Your-Luck Sampling
**Mechanic blend:** Quacks of Quedlinburg (push-your-luck bag) × Tomb of the Mask (risk escalation)

**One-sentence pitch:** Draw data chips from a bag — each correct answer shrinks the on-screen confidence interval; stop anytime to "bank" your sample; push further for bigger reward, bust risk grows with each outlier chip.

**Decision interval:** ~15 seconds per draw.

**Statistical concept used:** The stop/draw decision IS the sampling/CI tradeoff — cannot be decoupled from statistics.

**Score:** Rhythm 5 · Wonder 4 · Engine 3 · Topic-fit 5 · Decor-safe 4 · Scope 4 → **Total: 25/30**

---

### Candidate 6 — Asymmetric School Rivalry
**Mechanic blend:** Cry Havoc (faction asymmetry) × Arctic Scavengers (tribe leader) × Reigns (asymmetric choices)

**One-sentence pitch:** Player picks a statistical school (Frequentist / Bayesian / Non-parametric); each school has genuinely different mechanics for the same datasets; city districts = territory controlled by your school.

**Decision interval:** ~30–40 seconds (high strategy overhead).

**Statistical concept used:** Meta-level statistical judgment: which approach fits which problem.

**Score:** Rhythm 2 · Wonder 4 · Engine 4 · Topic-fit 4 · Decor-safe 4 · Scope 1 → **Total: 19/30**

---

### Candidate 7 — Real-Time Triage
**Mechanic blend:** Coffee Rush (real-time pacing) × Viticulture (worker assignment)

**One-sentence pitch:** Researchers arrive with statistical problems under a timer; player must choose who to serve (different complexity, urgency, reward) and answer their stats question within the clock.

**Decision interval:** ~10–15 seconds (fast).

**Statistical concept used:** Meta-awareness of concept difficulty; triage choice forces judgment about which stats tools apply to which problem.

**Score:** Rhythm 5 · Wonder 3 · Engine 2 · Topic-fit 2 · Decor-safe 2 · Scope 4 → **Total: 18/30**

---

### Candidate 8 — Data Story Narrative Pipeline
**Mechanic blend:** Stuffed Fables (per-encounter unique mechanic) × Gloomhaven (chapter branching)

**One-sentence pitch:** Each chapter = a real data story with its own mini-mechanic: histogram dragging (descriptive stats chapter), distribution sliders (distributions chapter), card sequencing (inference chapter).

**Decision interval:** ~25 seconds per action within chapter.

**Statistical concept used:** Varies per chapter — each mechanic IS the concept operation.

**Score:** Rhythm 3 · Wonder 5 · Engine 3 · Topic-fit 4 · Decor-safe 3 · Scope 1 → **Total: 19/30**

---

## Scoring Summary Table

| # | Candidate | Rhythm | Wonder | Engine | Topic-fit | Decor-safe | Scope | **Total** |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **1** | **Mutable Dice Engine** | **5** | **5** | **5** | **5** | **4** | **3** | **27** |
| 5 | Push-Your-Luck Sampling | 5 | 4 | 3 | 5 | 4 | 4 | **25** |
| 2 | Pre-commit Pipeline | 2 | 3 | 4 | 5 | 5 | 3 | **22** |
| 4 | Spatial Tiling Daily | 3 | 4 | 2 | 4 | 4 | 4 | **21** |
| 3 | Trading Window Engine | 3 | 3 | 5 | 3 | 3 | 3 | **20** |
| 8 | Data Story Pipeline | 3 | 5 | 3 | 4 | 3 | 1 | **19** |
| 6 | Asymmetric Schools | 2 | 4 | 4 | 4 | 4 | 1 | **19** |
| 7 | Real-Time Triage | 5 | 3 | 2 | 2 | 2 | 4 | **18** |

---

## Top-3 Ranking

### #1 — Mutable Dice Engine (27/30)
The single strongest topic-fit candidate: every face-upgrade IS a probability statement, every roll IS a sample, and the visible empirical-vs-target curve battle gives a constant wonder pull. Engine-building is native — your dice ARE your accumulated knowledge. Scope is the only real worry; sculpting distributions takes good UI. But an MVP (weight-only faces, 4 target shapes, 1 district) is feasible in 2 sprints.

### #2 — Push-Your-Luck Sampling (25/30)
The "stop or draw again" decision literally IS the sampling/CI tradeoff — you cannot decorate this away. Tight loop, gut-level tension, very buildable in a single sprint. Loses to #1 only because each run is self-contained with less long-run compounding.

### #3 — Pre-commit Pipeline (22/30)
Highest decoration-safety score: a broken assumption visibly breaks the pipeline — pure stats causation. Loses on rhythm (pre-commit then watch = 40–60s cycles) and wonder (it feels like productive work, not play). Best used as a boss-battle mechanic within the larger Dice Engine loop rather than as the main loop.

---

## #1 Detailed Spec — Mutable Dice Engine

*(Authored by Opus 4.7 — single call, ≤4k output)*

### Core Loop (one cycle ≈ 20–25 seconds)

1. **Target reveal (2s)** — current district wants a specific distribution: e.g., "right-skewed, mean≈70, σ≈10". Shown as a ghost silhouette curve on the histogram canvas.
2. **Roll (3s)** — player taps to roll 3–5 dice. Each roll drops one sample onto a live histogram building under the target ghost.
3. **Compare (2s)** — the empirical histogram updates; a fit score (KS-distance-like) ticks. Match closer → district tile lights.
4. **Earn upgrade token (5s)** — every N rolls, player earns an *upgrade token*. To redeem it, they answer one SRS question (existing SM-2 system). Correct = token retained; wrong = token weakens.
5. **Sculpt decision (8–10s)** — the load-bearing choice: spend token on ONE die-face:
   - **Reweight** a face (shift probability mass)
   - **Replace** a flat face with a curve fragment (normal bump, skew tail, kurtosis spike)
   - **Add a conditional face** (fires only given prior roll → joint distributions later)
6. Loop back to roll. Every ~10 cycles, district "fills" and a building rises in the 3D city. New district unlocks → new target distribution.

### What the Player Sees on Screen

- **Center**: large live histogram with target-ghost overlaid. The fight between the two curves is the hero visual.
- **Bottom strip**: 3–5 dice as oversized, sculptable objects — each face shows its current probability shape, not a number.
- **Right rail**: upgrade tokens, district target spec, fit-score meter.
- **Background**: existing 3D city, but districts now have a construction state tied to fit score, not raw XP.

### Statistical Concepts Actively Used Per Decision

| Game moment | Stats operation |
|---|---|
| Per roll | Sampling, empirical distribution formation |
| Per sculpt | Probability mass assignment, parameters (μ, σ, skew, kurtosis) |
| Per district unlock | CLT (many dice rolls → sums → normal), goodness-of-fit |
| Late game | Joint distributions, conditional probability, mixture models |

### Connection to Existing City

- Districts = distribution families: Normal Quarter, Skewed Heights, Discrete Docks, Heavy-Tail Hills
- Building rises only when player's crafted dice match that district's target — city growth is earned by statistical accuracy, not raw XP
- Existing "buildings = mastered topics" preserved: mastering kurtosis unlocks the kurtosis face-upgrade, which physically builds Heavy-Tail Hills
- Existing SM-2 quiz repurposed as the upgrade-token-validation step — not removed, demoted to support loop

### MVP Cut List

**Load-bearing (must build):**
- 3 dice × 6 faces, each face = probability weight (no curves yet, just weights 1–10)
- Live histogram + target ghost + fit score
- 4 target distributions (uniform, normal, right-skew, bimodal)
- Token earn → quiz → spend → reweight one face loop
- 1 city district that visibly grows with fit score

**Cuttable for MVP:**
- Conditional faces / joint distributions (phase 2)
- Curve-fragment face replacement (phase 2 — MVP shifts weights only)
- Multiple districts (start with 1)
- 3D city upgrades (MVP can use 2D district tile)
- SRS integration polish (MVP: simple right/wrong)

**Smallest playable scope:** 3 dice × 6 weight-only faces, 4 target shapes, weight-shift upgrades, 1 district. ~2 sprints.

### Why This Does NOT Collapse to Cosmetics

The fit score is computed from actual rolls of actual dice with actual weights. There is no way to "just answer questions and watch a building grow." If the player's distribution doesn't match the target, the histogram visibly diverges and the district stalls. The quiz is gated *behind* the sculpting decision (token must be spent on a face choice), not in front. A player who answers every quiz correctly but sculpts badly stalls the city. A player who sculpts wisely (correct statistical judgment) progresses even with imperfect quiz accuracy. **Statistical judgment, not quiz recall, is the win condition.**

### Risk + Mitigation

**Risk:** Sculpting a distribution by editing die faces may feel abstract to BA social-science students who lack intuition for "what does kurtosis look like."

**Mitigation:** Every face-upgrade option shows a *preview ghost* — hover/tap a candidate upgrade and the histogram shows "if you pick this, expected curve becomes X." This converts the upgrade choice from "recall the definition" into "see the consequence." The UI itself teaches the concept the player is using. The first district is explicitly tutorial-shaped (target = uniform), so the player only learns roll-and-reweight before shape concepts enter.

---

## Recommended Next Steps for Cycle 2

1. Create `src/config/featureFlags.ts` with `DICE_ENGINE_ENABLED: false`
2. Build the histogram canvas component (pure React, no R3F) — reuse `DistributionChart.tsx` as baseline
3. Build the die-face data model: `DieFace { weight: number; shape: FaceShape }[]`
4. Implement `rollDice(dice) → samples[]` pure function (trivially unit-testable with Vitest)
5. Connect fit score (KS distance) to the existing city's XP pipeline
6. Target: 1 district, 4 target shapes, weight-only sculpting — behind feature flag

---

*Sources: VISION.md (primary), Dice Forge [BGG/218820], Mini Metro (Dinosaur Polo Club), Quacks of Quedlinburg [BGG/244521], Mechs vs Minions [BGG/209010], Stuffed Fables [BGG/233312], Anthropic.com (typography restraint), Linear.app (dark UI density)*
