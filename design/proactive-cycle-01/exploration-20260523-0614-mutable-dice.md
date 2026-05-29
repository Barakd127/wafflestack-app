# WaffleStack — Proactive Cycle 01 Pass 7: Mutable Dice Engine

**Date:** 2026-05-23T06:14  
**Branch:** proactive/exploration/games-design-space  
**Cycle type:** Exploration only (no code)  
**Model routing:** Opus 4.7 → gameplay decision; Sonnet 4.6 → synthesis

> **Note on previous passes:** Six prior passes on this branch have explored: Exam Day Countdown, District Expedition, Distribution Forge, Sampling Bazaar, Pipeline Foundry, Café Confidence. Pass 6 (Café Confidence / CI-slider) scored 27/30 with Viticulture + Mini Metro as inspirations. This pass approaches fresh, using a stricter lens on one criterion: **intrinsic stats use** — can the player be completely wrong about their stat concept and still win? If yes, the concept is decorative.

**NotebookLM:** not available in this container (MCP not provisioned). Used VISION.md mechanic catalogue + Opus 4.7 judgment instead.

---

## Context

The repeating problem: each exploration pass finds a strong #1, but two structural risks keep recurring:
1. **Cosmetic drift** — the mechanic can be "played by feel" without using the statistical concept.
2. **Curriculum cap** — the mechanic serves 1-2 chapters well, then needs bolted-on extensions.

This pass prioritizes candidates where **the statistical object IS the game piece** — you cannot play without thinking in the stats concept. That makes cosmetic drift impossible and curriculum extension natural.

---

## 8 Candidates — scored on 5 axes (1-5 each, /25)

Axes: **Decision Rhythm** (15-30s ideal) / **Wonder-Tap** / **Engine-Building** / **Topic Fit (intro stats breadth)** / **Decoration Risk** (5=immune, 1=highly driftable)

---

### 1. Mutable Dice Engine ⭐ #1 — 23/25

**Pitch:** Player owns 2-3 dice whose faces start blank (uniform). Each round: roll → observe results → spend earned currency to permanently engrave one face with a statistical primitive. The live PMF histogram updates on every engraving. Goal: craft dice whose distribution matches challenge targets.

**Why this is intrinsically stats:** Every face-swap IS a PMF edit. You cannot choose which face to engrave without reasoning about probability mass, expected value, and variance. The statistical object (the distribution) is the game piece — it cannot be replaced with a cosmetic layer.

**Stats concept in decision:** PMF editing, expected value, variance, law of large numbers, CLT (as multiple dice → joint distributions), conditional probability (faces with trigger conditions).

**Board inspiration:** Dice Forge (Libellud, 2017) — face-engraving chassis  
**Mobile inspiration:** Slice & Dice (Tann Gamble, 2021) — proven mutable-dice touch loop with rich per-face semantics; Hebrew RTL face-icon design transfers cleanly

**Decision interval:** 12-20 seconds per roll-engrave cycle

**Engine-building:** Strong — each face persists cross-session. Session 7 plays differently from session 2 because of your accumulated PMF edits.

**Curriculum breadth:** PMF → EV → variance → conditional probability → joint distributions → CLT. Covers 6+ weeks of intro stats without structural change to the mechanic.

**Decoration risk:** 5 (immune). Without PMF reasoning, you cannot decide which face to engrave. The stats concept is load-bearing.

| Criterion | Score |
|---|---|
| Decision rhythm | 4 |
| Wonder-tap | 5 |
| Engine-building | 5 |
| Topic fit (breadth) | 5 |
| Decoration risk | 4 |
| **Total** | **23** |

---

### 2. Café Confidence (CI-Slider) — 22/25

*(Previously scored 27/30 in Pass 6 on a 6-axis rubric including Buildability. Re-scored here on 5-axis for consistency.)*

**Pitch:** Run a Tel Aviv café. Each day sample customer demand, use the CI slider to decide bake quantities. Over-bake = waste; under-bake = stockout.

**Why strong:** CI width IS the decision variable. Remove the CI, and you cannot play rationally.

**Weakness for this pass's lens:** A player can play by "anchoring on the sample mean and ignoring the CI width" as a shortcut — they still progress, just slower. The statistical concept is NOT fully load-bearing in hard-failure mode.

**Board:** Viticulture (seasonal cycle), Quacks of Quedlinburg (push-your-luck stop)  
**Mobile:** Stardew Valley (run-your-place), Mini Metro (minimal HUD)

| Criterion | Score |
|---|---|
| Decision rhythm | 5 |
| Wonder-tap | 5 |
| Engine-building | 4 |
| Topic fit (breadth) | 4 |
| Decoration risk | 4 |
| **Total** | **22** |

---

### 3. Pre-Commit Pipeline (Stats Detective) — 21/25

**Pitch:** Pre-register a statistical analysis pipeline before seeing the data. Plan: collect → clean → describe → model → test. Watch it execute; mismatches produce diagnostic visualizations.

**Why strong:** Forces pre-registration — the deepest frequentist lesson. No quiz app can teach this.

**Mobile-hostile risk:** Planning phase runs 60-90 seconds, violating the 15-30s rule. Hebrew RTL planning UI on small screens is an interaction swamp.

**Board:** Mechs vs Minions (pre-commit sequence)  
**Mobile:** Mini Metro (route pre-planning, iterative adjustment)

| Criterion | Score |
|---|---|
| Decision rhythm | 3 |
| Wonder-tap | 3 |
| Engine-building | 4 |
| Topic fit (breadth) | 5 |
| Decoration risk | 5 |
| **Total** | **20** |

---

### 4. Push-Your-Luck Sampling Stop — 20/25

**Pitch:** Draw data tokens from a bag; each draw updates a running statistic. Decide when to stop sampling and commit to an inference.

**Why strong:** Directly teaches stopping rules — why optional stopping biases p-values.

**Weakness:** Engine-building is thin — each round resets the bag. Cross-session compounding requires meta-progression bolt-on, drifting toward gamification.

**Board:** Quacks of Quedlinburg  
**Mobile:** Stack the States (accumulation + stop decision)

| Criterion | Score |
|---|---|
| Decision rhythm | 5 |
| Wonder-tap | 4 |
| Engine-building | 2 |
| Topic fit (breadth) | 4 |
| Decoration risk | 4 |
| **Total** | **19** |

---

### 5. Engine-Builder Lab (Century Spice Road chassis) — 19/25

**Pitch:** Run a stats lab. NPCs arrive with data problems. Use knowledge cards (techniques) to serve them. Mastered topics thicken deck. Trading window: exchange raw data with NPCs to fill gaps.

**Why strong:** Topic prerequisite pyramid maps directly to Century Spice Road's resource chain.

**Decoration risk:** Moderate — "run a lab" theme risks becoming cosmetic if NPC requests don't require actual stat reasoning per customer type.

**Board:** Century Spice Road, Seize the Bean  
**Mobile:** Coffee Rush (service under pressure)

| Criterion | Score |
|---|---|
| Decision rhythm | 4 |
| Wonder-tap | 4 |
| Engine-building | 5 |
| Topic fit (breadth) | 4 |
| Decoration risk | 2 |
| **Total** | **19** |

---

### 6. Spatial Tiling Daily Puzzle — 17/25

**Pitch:** Daily puzzle. Place statistical-technique Tetris tiles onto a population grid. Efficient coverage = right technique for the data shape.

**Weakness:** Daily reset kills engine-building. Topic fit is shallow (model selection only).

**Board:** Patchwork  
**Mobile:** Threes (spatial, daily constraint)

| Criterion | Score |
|---|---|
| Decision rhythm | 4 |
| Wonder-tap | 4 |
| Engine-building | 2 |
| Topic fit (breadth) | 3 |
| Decoration risk | 4 |
| **Total** | **17** |

---

### 7. Asymmetric Statistical Factions — 17/25

**Pitch:** Pick a statistical school (frequentist, Bayesian, nonparametric) as a faction. Different moves for the same data challenge.

**Scope risk:** Building 3 asymmetric rule-sets for intro stats is semester-2 content. Out of scope.

**Board:** Cry Havoc, Arctic Scavengers  
**Mobile:** Clash Royale

| Criterion | Score |
|---|---|
| Decision rhythm | 3 |
| Wonder-tap | 3 |
| Engine-building | 4 |
| Topic fit (breadth) | 3 |
| Decoration risk | 4 |
| **Total** | **17** |

---

### 8. Influence & Territory — 15/25

**Pitch:** Place influence markers on topic territories. Collecting adjacent territories = concept families. Hidden objectives = which techniques the dataset needs.

**Weakness:** Territory control metaphor doesn't carry statistical meaning. Stats becomes label on an otherwise generic area-control game.

**Board:** Godfather: Corleone's Empire  
**Mobile:** Reigns (prediction + consequence)

| Criterion | Score |
|---|---|
| Decision rhythm | 3 |
| Wonder-tap | 3 |
| Engine-building | 3 |
| Topic fit (breadth) | 3 |
| Decoration risk | 3 |
| **Total** | **15** |

---

## Top-3 Ranking

| Rank | Candidate | Score | Key differentiator |
|---|---|---|---|
| 🥇 1 | Mutable Dice Engine | 23/25 | Statistical PMF IS the game piece — cannot be cosmetically degraded |
| 🥈 2 | Café Confidence (CI-Slider) | 22/25 | "Run your place" emotional pull + tight CI mechanic; re-ranks from pass 6's 27/30 on 6 axes |
| 🥉 3 | Pre-Commit Pipeline | 21/25 | Deepest curriculum fit but mobile-hostile |

---

## Opus Decision (ONE call) — Mutable Dice Engine

**Eval of top 3:**

*Café Confidence:* Strong "run your place" wonder-tap and tight CI mechanic. Fatal risk: player can anchor on sample mean and ignore CI width, still progressing — statistical concept is not fully load-bearing in hard-failure mode. Mitigation needs a Forecast Gate (cf. pass 6 notes), which adds UX complexity.

*Pre-Commit Pipeline:* Deepest curriculum fit, teaches pre-registration (uniquely unteachable by any quiz). Fatal risk: 60-90 second planning phase violates 15-30s rule. Hebrew RTL planning UI on mobile is an interaction-design swamp. Would need fundamental UX rethinking for mobile-first.

*Mutable Dice Engine:* **Wins.** Only candidate where the statistical object (a PMF) IS the manipulable game piece — player cannot choose which face to engrave without reasoning about probability mass. Cosmetic degradation is structurally impossible. Tightest rhythm (12-20s). Strongest engine-building (every face persists cross-session). Extends from discrete PMF through EV, variance, conditional probability, joint distributions, CLT without structural change.

**Mutable Dice Engine fatal risk:** Curriculum might collapse to discrete distributions only. **Mitigation:** dice-faces as pluggable primitives — faces can represent estimators, conditional triggers, rejection-region thresholds. The "mutable randomness source" chassis extends across the full intro-stats syllabus.

---

## #1 Detailed Spec — מכונת ההתפלגויות (The Distribution Machine)

**Hebrew CTA:** `חרוט פאה חדשה` ("Engrave a new face")

### Core mechanic
Player owns 2-3 dice whose faces start blank (uniform distribution). Each round: roll → observe results on live PMF histogram → spend earned currency to permanently engrave one face with a statistical primitive. The PMF histogram updates live on every engraving. The goal is to craft dice whose distribution matches challenge targets.

### Decision drives stats
Every face-swap is a PMF edit. Player reasons: "If I add value 8, my expected value rises but variance stays similar. If I replace a low face with a conditional trigger, I create bimodal behavior." The decision IS the statistical reasoning — not a wrapper around it.

### Decision interval
12-20 seconds per roll-engrave cycle. One session = 10-15 cycles = 3-5 minutes.

### Statistical concept progression by session block
| Sessions | Concept |
|---|---|
| 1-5 | PMF, uniform vs. non-uniform distributions |
| 6-12 | Expected value (mean of die), law of large numbers |
| 13-20 | Variance and SD (spread of faces vs. spread of rolls) |
| 21-30 | Conditional probability (faces with trigger conditions) |
| 31-40 | Sampling distributions (roll multiple dice → mean distribution → CLT) |
| 41+ | Hypothesis testing chassis (rejection region faces, α-threshold) |

### Session milestones
- **Min 0:** Roll starter dice. See live PMF histogram. Spend first result to engrave one face. Instant feedback: histogram updates. Moment of "I changed my own distribution."
- **Min 3:** Facing a choice — engrave high-EV/high-variance vs. low-EV/low-variance face. Live histogram previews the future PMF before committing. Player reasons about the tradeoff.
- **Min 6:** Second die unlocks. Decisions now involve joint distributions. "Which die to upgrade given the other's shape?" — first taste of independence and conditional thinking.

### Top integration risk (THIS IS THE CYCLE 2 PROTOTYPE TARGET)
The live PMF histogram must update at 60fps in response to face edits, in Hebrew RTL, on mobile, inside the existing Zustand store. The current `src/components/graphs/` components (BinomialInteractive.tsx, NormalDistributionInteractive.tsx, etc.) assume static data as props. Making them reactive to a Zustand-derived face array (face array → PMF calculation → histogram re-render) risks Recharts/D3 re-render thrash. **Prototype the reactive histogram FIRST, before any die-face UI.**

### Feature flag
`DICE_FORGE_MODE` in `src/config/featureFlags.ts` (to create in Cycle 2).

### UI pattern references
- **Linear.app** — dark-UI density for the face-engraving panel (action sidebar, status pills)
- **Apple HIG iOS dark mode** — 44pt minimum hit targets for face tiles on mobile
- **Mini Metro / Slice & Dice** — minimal HUD, one-handed play, instant tap feedback
- **Duolingo path-tree** — unlocked die faces arranged as vertical mobile mountain

### UI anti-patterns to avoid
- No modal-on-modal for face selection → use bottom-sheet
- No hamburger menu → bottom nav always
- No hover-only affordances on face tiles

### Color palette (locked tokens only — no new hex)
| Element | Token | Hex |
|---|---|---|
| Die face background | `--card` | #1c1f26 |
| Engraved / mastered face | `--gold` | #FFD700 |
| PMF histogram bars | `--teal` | #10b981 |
| Target distribution overlay | `--blue` | #3b82f6 |
| Wrong roll outcome flash | `--red` | #ef4444 |
| Pending engraving preview | `--amber` | #f59e0b |

No new hex values introduced.

### Hebrew UI copy
| Element | Hebrew |
|---|---|
| Main CTA | חרוט פאה חדשה |
| Roll button | גלגל |
| Engrave confirm | חרוט |
| Challenge label | אתגר |
| Expected value | תוחלת |
| Variance | שונות |
| Distribution | התפלגות |
| Die | קוביה |

---

## Vision Alignment Check

| Rule | Compliant? | Citation |
|---|---|---|
| What we are: stats-first via game | ✓ | PMF edit IS the lesson; player manipulates statistical object directly |
| Gameplay ≠ Gamification | ✓ | No PMF reasoning → cannot choose face to engrave → no progress |
| Design rule: Hebrew-first | ✓ | All UI copy in Hebrew; code in English |
| Design rule: dark UI | ✓ | Only --bg, --bg-2, --card backgrounds |
| Color palette: only locked tokens | ✓ | 6 tokens used; no new hex (see table above) |
| UI source cited | ✓ | Linear (dark panel), Apple HIG (44pt), Mini Metro (minimal HUD) |
| UI anti-pattern avoided | ✓ | Bottom-sheet not modal; no hamburger; no hover-only |
| Tech invariant: Tailwind only | ✓ | Cycle 2 will use Tailwind utility classes only |
| Tech invariant: Zustand only | ✓ | State in new `src/store/diceForgeStore.ts` (planned Cycle 2) |
| Tone rule: encouragement | ✓ | Wrong roll = diagnostic overlay, never "you failed" |
| Mobile-first (thumb-reach + 44pt) | ✓ | Roll button + face tiles in thumb zone, bottom-sheet pattern |
| Out of scope: stays in scope | ✓ | No multiplayer, no teacher dashboard, intro stats only |

**NotebookLM consulted:** No — MCP connector not available in this container (skipped per cycle rules).  
**Board-game inspiration:** Dice Forge (Libellud, 2017) — face-engraving chassis.  
**Mobile-game inspiration:** Slice & Dice (Tann Gamble, 2021) — mutable-dice loop proven on touch; rich per-face iconography translates to Hebrew RTL.  
**Decision interval:** every 12-20 seconds.  
**Statistical concept used in decision:** Probability mass function editing (player directly manipulates their own distribution).

---

## Cross-Pass Synthesis Note

After 7 exploration passes, two candidates have consistently scored highest across independent evaluations:

| Candidate | Passes ranked #1 |
|---|---|
| Distribution / PMF variants (Dice Forge / Mutable Die) | Pass 3, 4, 7 |
| CI-based café / bakery (Café Confidence / Sigma Bakery) | Pass 5, 6 |

Both are strong. The differentiator is the **intrinsic-stats-use test**: in the Dice Engine, you cannot make any move without PMF reasoning. In the Café Confidence, you can anchor on sample mean and skip CI reasoning. The Dice Engine is more robust to gamification drift.

**Recommendation to Barak:** If cycle 2 builds one mechanic, the Mutable Dice Engine is the structurally sounder choice. If there's appetite for two parallel experiments, run Dice Engine (harder, higher ceiling) and Café Confidence CI-slider (easier to build, "run your place" emotional hook) as A/B features behind separate flags.

---

## Cycle 2 Pre-brief

**Build:** Reactive PMF histogram + dice-face data model behind `DICE_FORGE_MODE` feature flag.  
**First prototype target:** Make a graph component reactive to a Zustand-derived face array — validate 60fps re-render budget before building die-face UI.  
**Suggested file:** `src/components/DiceForge/pmfEngine.ts` (pure logic, no UI) — first thing to unit-test.  
**Vitest test:** PMF calculation: `faceArray → probabilityArray → expectedValue + variance`.  
**npm run build must pass.**

---

*VISION.md read fully. Pass 7 complete. Prior passes on this branch: 6.*
