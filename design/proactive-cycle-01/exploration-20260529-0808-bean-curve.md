# Supplemental Pass 34 — Bean & Bell Curve (Coffee Shop Skin + Dice Forge)

**Date:** 2026-05-29 08:08  
**Cycle:** 1 (exploration-only, no code)  
**Status:** Supplemental — confirms Sampling Lab / Dice Forge direction from a fresh Opus call. Coffee Shop theme variant of the same core mechanic.  
**Canonical winner on this branch:** Sampling Lab (Dice Forge × Quacks) — see `exploration.md`.

---

## Fresh Opus evaluation (Pass 34 — independent confirmation)

A new Opus 4.7 call evaluated 8 candidates against VISION.md criteria.  
Scoring: Decision Rhythm / Wonder Tap / Engine-Building / Topic Fit / Low Decoration Risk, 1–10 each.

| # | Candidate | DR | WT | EB | TF | LDR | Avg |
|---|---|---|---|---|---|---|---|
| A | Mutable-Dice Coffee Shop | 8 | 8 | 9 | 7 | 8 | **8.0** |
| B | Mechs-vs-Data Pipeline | 5 | 6 | 7 | 9 | 8 | 7.0 |
| C | Spatial-Tile Daily Puzzle | 7 | 6 | 4 | 6 | 6 | 5.8 |
| D | Arctic Scavengers Tribe-Leader | 4 | 7 | 8 | 8 | 6 | 6.6 |
| E | Catan Trade Window | 5 | 5 | 6 | 6 | 5 | 5.4 |
| F | Reigns Decision Stream | 9 | 5 | 3 | 7 | 4 | 5.6 |
| G | Stuffed Fables Topic Bosses | 7 | 9 | 5 | 9 | 7 | 7.4 |
| H | Mini Metro Flow Optimizer | 6 | 7 | 7 | 5 | 6 | 6.2 |

**Convergence with prior passes:** Same direction. Dice Forge base wins every pass. Coffee shop theme taps "run your own cool place" emotional pull. G (Stuffed Fables) recommended as content layer inside A's shell — same as prior Sampling Lab synthesis.

**Opus synthesis quote:**
> "Ship A as the engine, fold G's bespoke mini-mechanics in as the 'regulars/recipes' content, and hold B for the endgame."

---

## Unique contribution of this pass: Existing-code reuse map

The prior exploration files scored and spec'd the mechanic. This pass adds a concrete map to the current R3F / city-builder codebase for Cycle 2 implementation.

| Existing asset | Reuse in Sampling Lab / Dice Forge prototype |
|---|---|
| `ProceduralBuilding` / `buildingGenerator` / `irregularGrid` | Shop stations = buildings. Buildings now produce/consume beans → kills "decoration not decision" risk. |
| `DeformableCell` + `DeformationShader` | Die faces + sampling-distribution bar track (deform mesh to visualize skew/spread). |
| `ToonShader` / `PaintableAsset` / `ColorableModel` | Die face "forged face comes alive" wonder-tap. Gold token = mastered concept. |
| `progressStore` (Zustand) | Forged faces = mastered topics. No new state shape needed for MVP. |
| `TopicViz` / `LearningMap` / `ConceptMapGalaxy` | Becomes station tech-tree / concept-prerequisite graph. |
| `SamplingDistribution` component | On-table dice-roll result bar chart. |
| `DistributionChart` | Forging UI — live distribution shape as faces are allocated. |
| `StatChallenge` / `ReviewMode` | Forging challenges (constructive, not multiple-choice). |
| MathLive / KaTeX | Reading panel when player computes statistic from sample. |

**New code for Cycle 2 (pure TS, no UI yet):**
- `src/utils/diceEngine.ts` — roll n dice from distribution defined by face values, return sample array. Vitest-testable.
- `src/utils/servingLogic.ts` — compare player's computed statistic to customer's target within tolerance. Score + feedback.
- `src/stores/samplingLabStore.ts` — game state behind `SAMPLING_LAB` feature flag.
- `src/config/featureFlags.ts` — create if absent; add `SAMPLING_LAB: false`.

---

## Session structure (confirmed from Opus)

| Session type | Duration | Stopping point |
|---|---|---|
| Micro | 4–6 min | Morning rush ends — 8–12 customers served. Score tallied. |
| Meso | 10–15 min | Forging decision between mornings — next face = agency over what to learn. |
| Macro arc | 5–7 mornings | New station unlocked (drip → espresso → cold-brew lab). |

---

## Three worked decision moments (from Opus, annotated with stat concept)

**Decision 1 — Sample size + SE shrinkage**  
Customer wants foam "reliably near 7." Die averages 7 but high-variance. Roll once (cheap, risky) or roll 5 and serve the batch mean (costs beans, sample-mean track visibly narrows)? Player uses Law of Large Numbers as a resource trade.

**Decision 2 — Mean vs. median under outlier (robustness)**  
Rolled batch: {3, 3, 4, 4, 20}. Order wants "typical temperature." Serve mean (8, wrong — drink ruined) or spend forged Median face to serve 4 (correct)? Stuffed Fables see-saw mechanic (G) folded in as a forged tool.

**Decision 3 — Constructing a distribution (probability + variance)**  
Unlock espresso station: forge a die that "usually lands 4–6, rarely 1 or 9." Allocate 6 face values; bar chart updates live. Must hit target SD band before slot saves. Player constructs a distribution from dispersion properties.

---

## Risks inherited from prior passes (mitigations confirmed)

| Risk | Mitigation |
|---|---|
| Coffee-shop becomes clicker | Every serve: fresh sample player computes; no auto-resolve. |
| Reading samples = arithmetic homework | Spatial drag track; median snaps to center; mean shown as balance point. |
| Forging = quiz regression | Constructive (allocate faces to hit target distribution shape), not multiple-choice. |
| Push-your-luck confuses sampling | Stopping-rule rolls gated behind espresso station (after sample-size basics). |
| Scope overrun | Cycle 2: descriptive stats only (mean/median/mode/spread + basic probability). |
