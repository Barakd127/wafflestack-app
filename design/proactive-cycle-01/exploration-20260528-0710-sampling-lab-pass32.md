# WaffleStack — Gameplay Loop Exploration (Pass 32)
**Date:** 2026-05-28  
**Time:** 07:10  
**Branch:** proactive/exploration/games-design-space  
**Model routing:** Haiku (read/browse) → Sonnet 4.6 (synthesis) → Opus 4.7 (design decision, one call only)  
**NotebookLM:** SKIPPED — `mcp__notebooklm__*` connector not available this container.

---

## Context

Current state: SM-2 quiz engine, XP/streak/mastery, 3D Kenney/Godot city where buildings appear on topic mastery.  
Core VISION.md problem: the city is confirmed decoration — buildings don't produce/consume resources.  
Goal this pass: score 7 candidates, rank top-3, write full spec for #1.

**Key codebase finding:** `SamplingDistribution.tsx` already ships a full interactive CLT simulator — per-draw accumulation, paintable population, animate-one-dot mode. This is ~80% of the winning loop's engine.

---

## Candidates

### A — Mutable-Dice Probability Engine
*Board game: Dice Forge (face-upgrade) + Arctic Scavengers (asymmetric tribe leader). Mobile: Threes (single-number tactile satisfaction).*

Player starts with default d6. Correct answers about distributions upgrade die faces. Each roll = a statistical sample. Player literally crafts the probability distribution they roll from. Mini-boss: "maximize P(X=M) for target M."

**Stats concept in decision:** probability, distributions, expected value, P(X=k).  
**Decision interval:** ~15s per roll + upgrade decision.

---

### B — Pre-Commit Hypothesis Pipeline
*Board game: Mechs vs Minions (pre-committed sequence). Mobile: (poor mobile fit — excluded from top-3).*

Player pre-commits a full hypothesis-testing pipeline: H₀ → test → α → n → collect → decide. Sequence executes; player diagnoses failure and re-sequences.

**Stats concept in decision:** hypothesis testing, p-values, Type I/II errors.  
**Decision interval:** ~60–120s per pipeline. **Violates ≤30s rule.**

---

### C — Push-Your-Luck Sampling Lab ⭐ WINNER (34/42)
*Board game: Quacks of Quedlinburg (draw-or-stop tension) + Welcome To (budget pressure). Mobile: Two Dots / Threes (one-thumb, instant-restart). UI: Linear.app (dark-UI, status pills) + Apple HIG iOS dark (44pt targets, bottom-sheet).*

An NPC poses a question with a precision target (CI half-width, e.g. ±2). Player taps **דגום** (Draw); one observation appears; running x̄, s, n, and 95% CI update; budget token consumed. Decision every ~3–8 seconds: draw again (tighter CI, lower budget) or tap **עצור** (Stop, lock answer). The judgment of when CI is tight enough **is** the statistical decision — never auto-advised by the UI.

**Stats concept in decision:** CI width, CLT, sampling distributions, stopping rules.  
**Decision interval:** 3–8 seconds per draw.

---

### D — Run-Your-Own-Café Engine-Builder
*Board game: Seize the Bean / Viticulture. Mobile: (clicker trap).*

Café = theme wrapper. Stats concepts labeled as café systems (pricing = regression). VISION.md explicitly flags this pattern. **Decoration risk P0.**

**Stats concept in decision:** labeled metaphor, not a direct statistical judgment.

---

### E — Spatial-Tiling Daily Puzzle
*Board game: Patchwork (spatial tiling). Mobile: Wordle (daily ritual).*

Daily puzzle: arrange dataset tiles on a board under time/cost budget. Board shape = the distribution. Strong wonder/aesthetic but near-zero engine-building (daily reset).

**Stats concept in decision:** descriptive stats, distribution shape, skewness.  
**Decision interval:** ~15–20s per tile.

---

### F — Trading Window NPC Market
*Board game: Catan (trade window). Mobile: Mini Metro (resource routing).*

NPC traders offer data samples. Core decision: "Does this sample improve my regression line?" Judged by live R²/residual update.

**Stats concept in decision:** regression, outliers, leverage points, model fit.  
**Decision interval:** ~20–30s per trade.

---

### G — Spatial Influence + Bluff Map
*Board game: Godfather: Corleone's Empire (area control). Mobile: (poor mobile fit).*

Stats topics = territories; correct-answer tokens = influence. Other NPC "schools" contest. Stats concept is not used in the placement decision itself — pure meta-progression.

**Stats concept in decision:** near-zero — placement doesn't use statistics.

---

## Score Table

*Rubric 1–5: Rhythm = decision ≤30s; Concept-fit = decision USES the stat; Engine = early choices compound; Wonder = curiosity/delight; Low-deco = 5 is lowest decoration risk; Mobile = one-hand phone; 2-cycle = shippable MVP in ~2 sprints.*

| Candidate | Rhythm | Concept-fit | Engine | Wonder | Low-deco | Mobile | 2-cycle | **Total /42** |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **C Sampling Lab** | 5 | 5 | 4 | 5 | 5 | 5 | 5 | **34** |
| **A Mutable Dice** | 4 | 5 | 5 | 5 | 4 | 5 | 3 | **31** |
| **F Trading Market** | 5 | 5 | 4 | 4 | 4 | 4 | 4 | **30** |
| **E Spatial Tiling** | 4 | 3 | 2 | 5 | 4 | 5 | 4 | **27** |
| **B Hypothesis Pipeline** | 2 | 5 | 3 | 3 | 4 | 4 | 3 | **24** |
| **D Café Engine** | 3 | 2 | 5 | 4 | 1 | 4 | 2 | **21** |
| **G Influence Map** | 2 | 1 | 4 | 4 | 1 | 3 | 3 | **18** |

---

## Top-3 Ranking

1. **C — Push-Your-Luck Sampling Lab (34/42).** The only candidate where the core statistical act — judging CI tightness — IS the ≤30s decision, and ~80% of its engine already ships as `SamplingDistribution.tsx`.
2. **A — Mutable-Dice Probability Engine (31/42).** Best engine-building and perfect concept-fit for probability; loses on 2-cycle buildability.
3. **F — Trading Window NPC Market (30/42).** Crisp ≤30s leverage/outlier decision; loses on existing-asset leverage and mobile ergonomics.

---

## #1 Detailed Spec — Push-Your-Luck Sampling Lab (מעבדת הדגימה)

### Core loop (every 3–8 seconds)

NPC presents a question + precision target (CI half-width). Player taps **דגום** → one observation → running x̄, s, n, 95% CI animate → budget token drops. Judgment every draw: draw again (tighter CI, less budget) or tap **עצור** (lock answer, check against target). Over-drawing wastes budget; under-drawing fails the question. Neither outcome is a wall — both are informative. The judgment of "enough" always belongs to the player.

### First 3 minutes

- **0:00–0:20** — One NPC, one giant pulsing **דגום** button. No CI shown. Pure tactile draw delight (Threes-style).
- **0:20–1:10** — After ~5 draws, CI band fades in. Copy: *"ככל שתדגום עוד — הרצועה תצטמצם."* NPC target ±band appears as `--teal` translucent zone.
- **1:10–2:10** — First **Stop** offered. If CI > target: *"כמעט — הרווח שלך עדיין רחב מדי."* Budget partially refunded (tutorial grace). Encouragement, no penalty wall.
- **2:10–3:00** — Budget meter introduced. Second NPC with tighter target teaches: tighter answers cost more √n.

### 3 example decisions (statistical concept named)

1. **Stopping rule / CI half-width** — "My 95% CI is ±2.4; NPC needs ±2.0. Draw (CI tightens ~1/√n) or stop?" *Uses: CI width = t* × s/√n.*
2. **CLT / population shape** — "Outlier pulled my mean. Is this a skewed population requiring more n, or noise?" *Uses: CLT — sampling distribution of x̄ normalizes as n grows.*
3. **Cost-of-precision tradeoff** — "NPC A wants ±5 (cheap), NPC B wants ±1 (expensive). 20 tokens total. Which order?" *Uses: SE = σ/√n — halving interval quadruples cost.*

### What winning looks like

Session = 3–5 NPC shift. End screen: questions answered within target + total draws + **efficiency score** (precision ÷ tokens). Mastery rises when player consistently stops at the right n. Persistent reward: unlock lower-variance instruments (batch-draw-of-5, peek at σ) that compound into harder shifts.

### MVP scope

- One Normal population (hidden μ/σ).
- One NPC: Hebrew question + target CI half-width.
- Draw button + Stop button + budget meter + live CI readout.
- Pass/fail: `ci_halfwidth ≤ target` at stop.
- Persist to `learningStore` via `recordAnswer`.
- No 3D. Pure SVG from `SamplingDistribution.tsx`.
- Feature flag: `SAMPLING_LAB` in `src/config/featureFlags.ts`.

### UI sketch (mobile-first, RTL, dark, locked palette)

Full-bleed vertical phone on `--bg #0e0f12`. **Top:** NPC card (`--bg-2 #16181d`) — Hebrew question + `--teal` precision gauge. **Middle:** live dot-strip (existing animate-one-dot) + 95% CI band in `--gold` over running mean. **Bottom thumb-zone:** two 44pt+ buttons — **דגום** (`--gold` gradient, full width) and **עצור** (`--teal`, full width) — budget-token bar above in `--border`. RTL, one-handed, instant restart.

### Reusable existing components

| Component | Reuse |
|---|---|
| `SamplingDistribution.tsx` | Per-draw accumulation, animate-one-dot, paintable population |
| `DistributionChart.tsx` | CI band SVG rendering |
| `learningStore.ts` | XP / streak / mastery / SM-2 via `recordAnswer` |
| `StatChallenge.tsx` | Hebrew RTL bottom-sheet NPC feedback |
| `SoundManager.tsx` + `PopIn.tsx` | Draw tick + stop lock haptic-equivalent |
| `useQuiz.ts` + `quiz-bank.json` | `sampling` + `confidence-intervals` topic tagging |

### Decoration-risk mitigation

**Auto-stop = the trap.** If UI ever shows "you can stop now ✅," the loop becomes tap-until-green. Mitigation: surface only raw CI vs. target, never advise. Both over- and under-drawing must cost something so the judgment stays with the player.

**Fixed Normal = CLT invisible.** Ship skewed/bimodal populations early (paint-population already in `SamplingDistribution.tsx`).

---

## Vision Alignment (preliminary — full table in PR body)

| Rule | Compliant? | Note |
|---|---|---|
| Stats-first via game | ✓ | CI judgment IS the decision |
| Gameplay ≠ Gamification | ✓ | Draw-or-stop is meaningful, not cosmetic |
| Hebrew-first | ✓ | All NPC copy + buttons in Hebrew |
| Dark UI | ✓ | `--bg #0e0f12` base |
| Locked palette only | ✓ | `--gold`, `--teal`, `--bg`, `--bg-2`, `--border` |
| UI anti-pattern avoided | ✓ | Bottom-sheet, no modal stack, no hamburger |
| Mobile-first 44pt | ✓ | Two full-width 44pt+ thumb-zone buttons |
| Out of scope | ✓ | No multiplayer, no teacher dashboard |

---

## Citations

- **Board games:** Quacks of Quedlinburg (draw-or-stop) · Dice Forge (mutable dice) · Mechs vs Minions (pre-commit pipeline) · Patchwork (spatial tiling) · Catan (trade window) · Godfather: Corleone's Empire (area influence) · Seize the Bean (engine-building café) · Arctic Scavengers (asymmetric tribe) · Stuffed Fables (per-encounter asymmetric) · Welcome To (budget pressure)
- **Mobile games:** Two Dots (one-thumb, instant-restart chain tension) · Threes (single-action satisfaction) · Mini Metro (minimal HUD, resource routing) · Reigns (binary swipe meter)
- **UI sources:** Linear.app (dark-UI density, status pills) · Apple HIG iOS dark (44pt targets, bottom-sheet, depth) · Mini Metro (minimal HUD, no hamburger)
