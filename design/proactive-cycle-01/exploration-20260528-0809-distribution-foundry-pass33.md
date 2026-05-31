# WaffleStack — Gameplay Exploration Pass 33: Distribution Foundry

**Date/Time:** 2026-05-28 08:09  
**Branch:** `proactive/exploration/games-design-space`  
**Model routing:** Sonnet 4.6 (orchestration) → Opus 4.7 (ONE design call, ≤4k output)  
**NotebookLM:** SKIPPED — `mcp__notebooklm__*` connector not available this cycle.  
**Prior passes on this branch:** 32

---

## Context

SM-2 quiz engine + XP tiers + 3D city (buildings = mastered topics) all ship and work.
Core VISION.md problem: the city is decoration, not gameplay — buildings are trophies, player is passive.
This pass independently scored 8 candidates with Opus 4.7 using a 5-dimension rubric.

**Cross-pass note:** Passes 29–31 converged on Mutable-Dice / Distribution Forge. Pass 32 (Sampling Lab) won on 2-cycle buildability due to ~80% engine reuse in `SamplingDistribution.tsx`. This pass expands the candidate pool with a novel "H" (Distribution Foundry) that fuses both prior winners and reuses existing infrastructure.

---

## Candidate Scoring

Dimensions (each 1–5):
- **DRhythm** — meaningful decision every 15–30s
- **CFusion** — player USES the stats concept IN the decision (not adjacent)
- **EBuild** — early choices compound (engine-building energy)
- **DRisk** — how hard this degrades to XP theater (5 = low risk, hard to degrade)
- **SFit** — solo-dev ships v1 in 2–3 sprints (5 = yes easily)

| ID | Name | DRhythm | CFusion | EBuild | DRisk | SFit | TOTAL /25 |
|----|------|---------|---------|--------|-------|------|-----------|
| A | Run-a-place engine-builder | 4 | 3 | 5 | 3 | 2 | **17** |
| B | Mutable-dice (Dice Forge) | 5 | 5 | 5 | 4 | 3 | **22** |
| C | Pre-commit programming puzzle (Mechs vs Minions) | 2 | 5 | 3 | 5 | 2 | **17** |
| D | Push-your-luck sampling (Quacks) | 5 | 5 | 3 | 4 | 4 | **21** |
| E | Spatial-tiling daily puzzle (Patchwork + Wordle) | 4 | 3 | 2 | 4 | 4 | **17** |
| F | Real-time triage (Coffee Rush) | 5 | 2 | 2 | 4 | 3 | **16** |
| G | Asymmetric tribal-school (Arctic Scavengers + Cry Havoc) | 2 | 3 | 4 | 3 | 1 | **13** |
| **H** | **Distribution Foundry** *(novel — fuses B + D + reuses existing infra)* | **5** | **5** | **5** | **5** | **4** | **24** |

---

## Scoring Rationale (Opus 4.7)

**A** — Engine-building strong, but the stats concept sits in card flavor text. "Which upgrade compounds best?" is a generic economy choice, not a statistical one. Scope kills v1 fit.

**B** — Near-ideal: crafting die faces IS choosing a distribution. Engine compounds. Score docked: clean mobile die-editor UI is non-trivial on 375px. H subsumes B's idea with better infrastructure reuse.

**C** — Highest-purity fusion for procedure topics (hypothesis pipeline). BUT pre-commit-then-watch breaks 15–30s rhythm. Narrow topic fit (~3 of 10 topics are pipelines).

**D** — "Stop sampling vs. take one more" IS the CI-width/stopping-rules decision. Excellent fusion and rhythm. Ranked below H/B: single-resource loop, weak cross-topic compounding, "bust" can feel like a wall without careful design. (Dominant winner in pass-32 due to `SamplingDistribution.tsx` reuse advantage.)

**E** — Clean and shippable. Tile-placement is spatially satisfying *adjacent* to stats, not fused. Daily-reset format caps engine-building.

**F** — Timer pressure rewards reflex over reasoning. Anti-pattern flagged in VISION.md.

**G** — Conceptually rich. Three asymmetric rule-sets = three games. Scope poison.

**H (Distribution Foundry — novel)** — Fuses B's mutable-distribution idea with D's sampling tension. Reuses existing 10-building city grid + `buildingProgress.level` for tile gating + `SamplingDistribution.tsx` CLT logic + `learningStore` persist pattern. Strip the stats concept from the loop and there is no game — structurally prevents decoration drift. Highest score at 24/25.

---

## Top-3 Ranking

1. **H — Distribution Foundry (24/25)** — the statistics concept IS the mechanic; maximum decoration resistance; best infrastructure reuse of all candidates.
2. **B — Mutable-dice / Dice Forge (22/25)** — strongest off-the-shelf fusion; H subsumes it with better mobile fit and infra reuse.
3. **D — Push-your-luck Sampling Lab (21/25)** — superb rhythm and fusion (pass-32 winner on buildability); ranked lower here because H edges it on cross-topic compounding and engine depth.

---

## Detailed Spec: #1 — Distribution Foundry (בית היציקה)

### Concept

You run a **foundry that casts data**. Each of the 10 city buildings is a machine that pours samples into a "vat." Every round you **shape the distribution you draw from** — set its center, spread, and shape with stat-tiles earned through mastery — so the cast samples hit the city's demand. You are not answering quiz questions *about* distributions; you are *building* distributions and watching them behave.

### Core Loop (~20 seconds per round)

1. **See the demand** (top banner, RTL Hebrew): target zone on a horizontal number-line vat — e.g. *"הבא 8 מתוך 10 דגימות לטווח [40, 60]."* (5s read)
2. **Shape**: drag/tap up to 3 stat-tiles onto the active machine — center tile (μ slider), spread tile (σ slider), optional modifier (skew / median-of-3 / n-slider / cap-outliers). Live bell curve redraws on the number-line as you adjust. (8s decide)
3. **Cast**: tap "יְצוֹק" — N animated sample dots fall from the machine onto the vat number-line. (3s watch)
4. **Resolve**: dots inside target glow `--gold`, outside glow `--red`. Running tally shows empirical % vs. theoretical % side by side. Coins = hits. The gap between the two *is* the lesson on sampling variability. (4s feedback)
5. Demand refreshes → next round.

### Statistics USED in the Decision

Setting μ, σ, n IS the empirical rule, CI logic, and outlier tradeoff — not a skin on top. Wrong cast (σ too wide): player visibly sees fat tails spill outside the band. Fix is conceptual (tighten σ or raise n), not lucky.

### Engine-Building

- Mastering a topic (`buildingProgress.level >= 2`) permanently unlocks its stat-tile.
- `sampling` unlocks the n-slider (SE = σ/√n) — a force-multiplier on every prior tile.
- `regression` links two machines: one's output shifts another's μ by β₁.
- `correlation` tile: one cast satisfies two demands simultaneously.
- Early μ/σ choices set foundry layout; later tiles compound on that base.

### Progression Map: Topics → Game Elements

| Topic | Unlocked game element |
|-------|-----------------------|
| mean | μ-slider (center tile) |
| stddev | σ-slider (spread tile) |
| median | `median-of-3` modifier (outlier-resistant center) |
| normal | empirical-rule target bands (±1σ / ±2σ presets) + bell overlay |
| sampling | n-slider → SE = σ/√n, tightens empirical % toward theoretical |
| ci | demands phrased as "land x̄ inside CI band"; widen band by lowering confidence |
| binomial | discrete machine: integer counts, p-slider, "k successes" target |
| correlation | tile linking two machines (shared variation) |
| regression | β₁ slope tile: one machine's mean = β₀ + β₁ × (other's output) |
| hypothesis | "boss demand": cast a sample, decide reject/keep H₀ vs. target μ₀ |

### First-Sprint Scope

**Component:** `src/components/foundry/FoundryRound.tsx` (mobile-first, RTL Hebrew, locked palette)  
**State:** `src/store/foundryStore.ts` (Zustand persist)  
**Feature flag:** `FOUNDRY_ROUND: false` in `src/config/featureFlags.ts`  
**Infra reuse:** `SamplingDistribution.tsx` CLT accumulator, `buildingProgress.level` tile gating, locked color tokens

v1 scope: one machine, μ + σ tiles, normal draws, random target bands. Teaches mean/σ/empirical-rule/sampling-variability immediately.

### Citations

**Board games:**
- Dice Forge (Régis Bonnessée, Libellud) — mutable die-face as crafted randomness source
- Quacks of Quedlinburg (Wolfgang Warsch, Schmidt Spiele) — bag-build + cast-and-see, empirical vs expected gap

**Mobile games:**
- Mini Metro (Dinosaur Polo Club) — live geometric feedback during drag before commit; distribution curve redraws in real time
- Threes / Two Dots — one-handed minimal HUD, single CTA, instant restart

**UI sources:**
- Apple HIG iOS dark mode — 44pt slider targets
- Linear.app — bottom-sheet density for controls
- Mini Metro — minimal HUD principle

### Decision Interval
Every ~20 seconds

### Statistical Concept Used in Decision
Choosing distribution parameters (μ, σ, n, shape modifier) to control where probability mass lands — empirical rule + sampling variability as a manipulable, not a memorized fact.

### Failure Mode → Recovery
Bad cast: player sees spilled dots and empirical-vs-theoretical gap. Same demand re-rolls (re-cast costs 1 coin, never blocks). Hebrew hint: *"σ גדול מדי — נסה לצמצם את הפיזור או להגדיל את n"*. Failure IS the lesson.

### Decoration Risk Mitigation
Coins are fuel for re-casts and larger n — they drive the next decision, not a badge shelf. Strip the statistical reasoning and there are no mechanics left. The distribution shaping IS the game.

---

## Vision Alignment Check

| Rule | Compliant? | Citation |
|------|-----------|---------|
| Stats-first via game | ✓ | Distribution shaping IS the mechanic |
| Gameplay ≠ Gamification | ✓ | Coins drive re-casts, not badges |
| Hebrew-first | ✓ | All demand banners and hints in Hebrew RTL |
| Dark UI | ✓ | `--bg #0e0f12`, vat on dark surface |
| Color palette: only locked tokens | ✓ | `--gold` hits, `--red` misses, `--teal` CTA, `--bg-2` panels |
| UI source cited | ✓ | Mini Metro (live curve feedback), Apple HIG (44pt sliders), Linear (bottom-sheet) |
| UI anti-pattern avoided | ✓ | No modal-on-modal; bottom-sheet, not hamburger; no hover-only |
| Tailwind only | ✓ | No CSS modules proposed |
| Zustand only | ✓ | `foundryStore.ts` with `persist` |
| Encouragement not punishment | ✓ | Failure hint guides next try, never "wrong" |
| Mobile-first (44pt targets) | ✓ | All sliders + CTA in thumb zone |
| Out of scope: stays in scope | ✓ | Solo learner, intro stats, no multiplayer, no Bayesian |

**NotebookLM consulted:** no — MCP not available, per rules.  
**Board-game inspiration:** Dice Forge (mutable distribution faces), Quacks of Quedlinburg (cast-and-see)  
**Mobile-game inspiration:** Mini Metro (live drag feedback), Threes/Two Dots (one-handed minimal HUD)  
**Decision interval:** ~20 seconds  
**Statistical concept:** choosing distribution parameters to control tail probability and sampling variability

---

## Cross-Pass Convergence Summary (Passes 1–33)

| Pass range | Dominant winner | Key reason |
|-----------|----------------|------------|
| 1–10 | Mutable-Dice / Distribution Forge | Highest concept fusion |
| 11–20 | Sampling Lab / Push-your-luck | Strong rhythm + existing CLT infra |
| 21–28 | Lab Bag / Mutable-Dice variants | Engine-building depth |
| 29–31 | Distribution Forge / Mutable-Dice | Pure fusion, compound tiles |
| 32 | Sampling Lab | ~80% `SamplingDistribution.tsx` reuse |
| **33** | **Distribution Foundry (H)** | Fuses B+D, highest score (24/25), maximum infra reuse |

**Convergence conclusion:** Two archetypes consistently win — the mutable-distribution/crafted-randomness archetype (B/H family) and the push-your-luck/sampling-stop archetype (D/C family). Distribution Foundry is the synthesis: it contains both as sub-mechanics, reuses the most existing infrastructure, and scores highest on decoration resistance. Recommendation for Cycle 2: build Distribution Foundry v1 behind `FOUNDRY_ROUND` flag.

---

## Open Questions for Barak

1. **Metaphor fit**: "Foundry casting data" is industrial. Should it live inside the existing city theme (e.g., research lab building) or as its own screen alongside the city?
2. **D vs H for Cycle 2**: Pass-32 recommends building Sampling Lab (D) due to `SamplingDistribution.tsx` reuse. This pass recommends Distribution Foundry (H) as the synthesis winner. The two are compatible — H can reuse `SamplingDistribution.tsx` as its cast engine. Confirm which to build or build H using D's engine.
3. **Demand difficulty**: Procedurally generated per mastery level, or hand-authored demand sets per topic?
