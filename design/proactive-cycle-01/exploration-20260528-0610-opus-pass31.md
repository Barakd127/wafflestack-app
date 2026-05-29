# WaffleStack — Gameplay Loop Exploration (Pass 31, Opus 4.7 Independent Call)

**Date:** 2026-05-28T06:10Z  
**Branch:** proactive/exploration/games-design-space  
**Model routing:** Opus 4.7 (design decision, one call, ≤4k output)  
**NotebookLM:** SKIP — MCP connector not available in this container.

---

## Scoring Rubric

Each candidate scored 0–10 on five axes (50 total):

| Axis | What it measures |
|---|---|
| Decision rhythm | Meaningful player choice every 15–30 s |
| Stats-concept fidelity | Player USES the stat concept to decide (not just recalls it) |
| Engine-building potential | Early choices compound and shape later state |
| Wonder tap | Hits an emotional pull (run-your-place / collection / zen / unlock-world) |
| Decoration safeguard | Structural resistance to devolving into cosmetic reward (10 = safest) |

---

## Candidate 1 — מצפה הכוכבים / "The Observatory" — 40/50

**Concept:** Run an observatory; each night you decide how much to keep observing before committing a claim — push-your-luck on sampling.

**Board mechanic:** Quacks of Quedlinburg (push-your-luck bag-draw) + Welcome To… (escalating commit).  
**Mobile feedback:** Mini Metro (live line redraws as sampling distribution tightens), Threes (one-thumb "draw again / stop").

**Statistical concept used in decision:** Standard error and CI width. Each "observation" drawn is a sample point; the live histogram + shrinking CI band updates on screen. The decision IS the stopping rule — "is my CI now narrow enough to claim the star's brightness inside the reward band, vs. risk one more noisy draw that could widen variance / trigger a cloud (bust)?" Player reads SE = s/√n shrinking and trades n against bust risk.

**Decision interval:** 8–15 s (each draw + keep/stop).

**Decoration risk:** LOW. The CI band is the game piece, not a reward. Cannot devolve: removing the stats removes the game.

| Axis | Score |
|---|---|
| Decision rhythm | 9 |
| Stats-concept fidelity | 9 |
| Engine-building | 6 |
| Wonder tap | 7 |
| Decoration safeguard | 9 |
| **Total** | **40/50** |

---

## Candidate 2 — בית הקפה המדגמי / "Sampling Café" — 35/50

**Concept:** Coffee-shop real-time triage; customers (NPCs) arrive each describing a population, you must serve them the correct test/interval before the queue overflows.

**Board mechanic:** Seize the Bean + Coffee Rush (run-your-own-place + real-time service).  
**Mobile feedback:** Coffee Rush pacing + Reigns (swipe-to-decide cards).

**Statistical concept used in decision:** Test selection under constraints — given (data type, # groups, paired/independent, n) shown on the customer card, pick t-test / ANOVA / chi-sq / correlation. Uses the decision-tree of inferential test choice, the single most exam-relevant skill.

**Decision interval:** 10–20 s per customer.

**Decoration risk:** MEDIUM. Café/upgrade layer is cosmetic risk — safeguard requires that upgrades alter which customers appear, not just kitchen aesthetics.

| Axis | Score |
|---|---|
| Decision rhythm | 9 |
| Stats-concept fidelity | 7 |
| Engine-building | 6 |
| Wonder tap | 8 |
| Decoration safeguard | 5 |
| **Total** | **35/50** |

---

## Candidate 3 — מזקקת הקוביות / "Distillery of Dice" — 41/50 ★ TOP PICK

**Concept:** You own dice whose faces you re-engrave with mastered concepts; every roll is drawing from a distribution you built, and you spend rolls to hit target statistics.

**Board mechanic:** Dice Forge (mutable dice) + Century Spice Road (resource upgrade pyramid).  
**Mobile feedback:** Vampire Survivors (auto-roll cadence, you steer between rolls) + Two Dots (satisfying chain).

**Statistical concept used in decision:** Building and reading a distribution. Player re-faces dice to shift E(X) and Var(X); challenges demand "produce a sampling distribution whose mean lands in band X with SD < Y." Player applies expected value, variance, and CLT directly to craft the dice.

**Decision interval:** 12–25 s (re-engrave choice between roll batches).

**Decoration risk:** LOW–MEDIUM. The dice ARE the math object, so it resists cosmetic decay; mild risk the re-engraving becomes a shopping menu rather than a variance decision. Strong if face costs are framed in variance trade-offs.

| Axis | Score |
|---|---|
| Decision rhythm | 8 |
| Stats-concept fidelity | 9 |
| Engine-building | 9 |
| Wonder tap | 7 |
| Decoration safeguard | 8 |
| **Total** | **41/50** |

---

## Candidate 4 — קו הייצור / "The Pipeline" — 35/50

**Concept:** Pre-commit a sequence of analysis steps (collect → clean → model → test → report), then watch it execute on a dataset and debug where it breaks.

**Board mechanic:** Mechs vs Minions (program-a-sequence) + Robo Rally.  
**Mobile feedback:** DragonBox (drag-tiles to assemble) + Wordle (daily fixed dataset, deterministic re-run).

**Statistical concept used in decision:** Procedure ordering and assumption-checking — regression diagnostics / hypothesis-testing pipeline. The decision is sequencing and gating: "do I check normality before or after fitting?" Uses the logic of a stats workflow, not a fact.

**Decision interval:** Lumpy — ~30–60 s to assemble a program, then watch. Violates the 15–30 s rhythm.

**Decoration risk:** LOW. Execution visibly fails on bad sequencing; can't fake it. Low decision density hurts rhythm.

| Axis | Score |
|---|---|
| Decision rhythm | 5 |
| Stats-concept fidelity | 9 |
| Engine-building | 7 |
| Wonder tap | 6 |
| Decoration safeguard | 8 |
| **Total** | **35/50** |

---

## Candidate 5 — שכונת הטלאים / "Patch District" — 29/50

**Concept:** Daily spatial puzzle — tile your knowledge-quilt where each tile is a concept and gaps reveal what you don't know; place tiles under a time-and-cost budget.

**Board mechanic:** Patchwork (spatial tiling + time/cost budget).  
**Mobile feedback:** Wordle (one shared daily board) + Two Dots (calm placement).

**Statistical concept used in decision:** Weak. Tiles represent concepts but placement is geometric, not statistical — the player isn't using a stats concept to choose where a tile goes. This is the trap VISION names: spatial beauty without learning anchor.

**Decoration risk:** HIGH. Almost purely aesthetic; stats is metadata on a tile, not the decision content.

| Axis | Score |
|---|---|
| Decision rhythm | 8 |
| Stats-concept fidelity | 3 |
| Engine-building | 7 |
| Wonder tap | 8 |
| Decoration safeguard | 3 |
| **Total** | **29/50** |

---

## Candidate 6 — קרב ההשערות / "Hypothesis Brawl" — 39/50

**Concept:** A collection of stat-creatures, each with an asymmetric per-encounter mechanic, that you deploy against a "boss" claim — you must reject or fail-to-reject the boss's null.

**Board mechanic:** Stuffed Fables (asymmetric per-item mechanic) + Arctic Scavengers tribe-leader (pick frequentist school).  
**Mobile feedback:** Stack the States (collect-and-deploy) + Vampire Survivors (encounter waves).

**Statistical concept used in decision:** Hypothesis-testing logic — set α, read the test statistic vs critical value, and weigh Type I vs Type II error when choosing which creature (test) to deploy and at what α. The decision uses the error-rate trade-off directly.

**Decision interval:** 15–25 s per deployment.

**Decoration risk:** MEDIUM. Collection wonder can overwhelm; creatures risk becoming skins. Safeguard: deployment outcome is computed from the real test statistic, so a wrong α/test visibly loses the encounter.

| Axis | Score |
|---|---|
| Decision rhythm | 8 |
| Stats-concept fidelity | 8 |
| Engine-building | 8 |
| Wonder tap | 9 |
| Decoration safeguard | 6 |
| **Total** | **39/50** |

---

## Scorecard Summary

| Rank | Candidate | Total |
|---|---|---|
| 1 | **Distillery of Dice** ★ | 41/50 |
| 2 | **The Observatory** | 40/50 |
| 3 | **Hypothesis Brawl** | 39/50 |
| 4 | Sampling Café | 35/50 |
| 4 | The Pipeline | 35/50 |
| 6 | Patch District | 29/50 |

---

## Top-3 Ranking

**#1 — Distillery of Dice (41/50)**  
The dice literally ARE the distribution, so every meaningful choice is a variance/expected-value/CLT decision that compounds; almost impossible to make cosmetic. The re-engraving mechanic maps cleanly onto the existing "arsenal of mastered concepts" model already in `arsenalStore.ts`, and the engine-building axis (crafting a more precise toolkit over time) earns the highest score of any candidate on that dimension. This is the 31st independent convergence on this mechanic.

**#2 — The Observatory (40/50)**  
Purest fidelity-to-rhythm match. The stopping decision IS standard error reasoning — there is no quiz wrapper to decay into. Weakness: lower engine-building score (instruments don't compound meaningfully over sessions the way crafted dice do).

**#3 — Hypothesis Brawl (39/50)**  
Highest wonder-tap and strong engine, carrying the single most exam-critical concept (Type I / Type II error). Earns third because its collection layer introduces cosmetic risk the Dice candidate avoids structurally.

---

## #1 Detailed Spec — מזקקת הקוביות / Distillery of Dice

### Core verb
*Re-engrave dice faces to shape a distribution, then roll to hit a target statistic.* Mastered topics from the SM-2 engine unlock face-types; the player crafts, then samples.

### Zustand store — `src/store/distilleryStore.ts`

```ts
type FaceKind = 'flat' | 'skewed' | 'spike' | 'wild' | 'blank'

interface DieFace {
  kind: FaceKind
  value: number
  varianceCost: number
}

interface Die {
  id: string
  faces: [DieFace, DieFace, DieFace, DieFace, DieFace, DieFace]
  engravingsLeft: number
}

interface Contract {
  id: string
  targetMean: [number, number]   // accept band for sample mean
  maxSD: number                  // sampling-dist SD ceiling
  minN: number                   // min rolls before commit
  reward: number                 // essence earned on success
  conceptTag: 'expected-value' | 'variance' | 'clt' | 'sampling-dist'
}

interface DistilleryState {
  dice: Die[]
  essence: number
  unlockedFaces: FaceKind[]      // gated by mastered topics (progressStore)
  activeContract: Contract | null
  rollHistory: number[]
  liveMean: number
  liveSE: number
  reputation: number

  engraveFace: (dieId: string, slot: number, kind: FaceKind) => void
  rollBatch: () => void
  commitContract: () => 'success' | 'fail'
  drawContract: () => void
}
```

### One full turn walkthrough

**Sees:** Contract card (RTL, dark, `--gold` accent): *"זקק תרכובת שממוצעה בין 48–52 עם סטיית-תקן דגימה < 1.5, לפחות 30 גלגולים."* Below it, the player's two dice rendered as R3F objects with current faces visible, a live histogram (empty), and a CI band overlay.

**Decision (the stats move):** The player looks at `maxSD` and `minN`. They reason: to hit SD < 1.5 on the mean I need either low per-die variance or higher n (CLT: SE = σ/√n). They spend `essence` to re-engrave a `wild` (high-variance) face into a `flat` face — lowering σ — OR leave faces and plan to roll more. This is the meaningful choice: **trade essence-for-variance vs. rolls-for-n**, applying CLT directly.

**Concept applied:** Expected value (does the face set's mean sit inside the target band?), variance (per-die σ → sampling σ), CLT (SE shrinks with √n).

**Roll phase:** Player taps "גלגל" repeatedly (Vampire Survivors cadence). Each `rollBatch()` pushes draws, recomputes `liveMean`/`liveSE`, redraws histogram + CI band live (Mini Metro feel).

**Commit:** Player taps "החתם חוזה" → `commitContract()` checks `liveMean ∈ targetMean && liveSE-derived SD < maxSD && n ≥ minN`. Success → `essence += reward`, `reputation++`, possibly unlocks a new face slot.

**State change:** `dice` faces persist, `essence`/`reputation` update, next contract scales `maxSD` tighter — early crafting choices shape what later contracts are even attainable.

### Failure condition (informative, recoverable)

Failed commit shows why: *"הממוצע נחת על 46, מתחת לטווח; סטיית-התקן עדיין 1.8 — נסה עוד גלגולים או החלף פאה פראית."* Same contract can be re-drawn. Failure teaches σ/√n by showing the missed band. Never a wall — essence floor guaranteed by daily stipend.

### How it differs from quiz-with-rewards

No question and no answer button — the player manipulates the statistical object itself (the distribution via dice faces) and win/lose is computed from the empirical sample they generated. Reward feeds back into crafting capacity: decision → consequence → expanded decision-space, not action → decoration.

### React components (new, RTL, locked palette)

| Component | Responsibility |
|---|---|
| `DistilleryScreen.tsx` | Main view; bottom-sheet contract card (mobile thumb-zone) |
| `DieForge.tsx` | R3F dice + face-engraving drawer; reuses `ColorableModel` patterns |
| `LiveSamplingChart.tsx` | Histogram + CI band; reuses `DistributionChart.tsx` |
| `ContractCard.tsx` | Bottom-sheet, `--gold` accent, encouragement copy |
| `EssenceLedger.tsx` | Currency/reputation HUD pill (Linear status-pill style) |
| `ForgeFailSheet.tsx` | Informative failure bottom-sheet |

### Feature flag

```ts
// src/config/featureFlags.ts
export const FEATURE_FLAGS = {
  distilleryOfDice: false, // gameplay loop #1 — mutable-dice distribution crafting
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS
```

### Open Questions

1. Should `unlockedFaces` require full SM-2 mastery or just "seen once"?
2. Start with 2 dice? Allow 3rd die as mid-game unlock?
3. Should `reputation` replace XP as the city-growth driver (making the city earned by game decisions, not quiz answers)?
4. Prototype scope for Cycle 2: build only contract + roll phase (no R3F dice yet) with one Vitest unit test for SE calculation.
