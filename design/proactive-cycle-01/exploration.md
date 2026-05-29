# WaffleStack — Cycle 1: Gameplay Design Space Exploration

**Date:** 2026-05-29  
**Branch:** proactive/exploration/games-design-space  
**Status:** Exploration only — no code. Top-3 ranking + detailed spec for #1.  
**NotebookLM:** SKIPPED (MCP connector not available in this container). Design judgment drawn from VISION.md catalogue + board/mobile game references below.

---

## Evaluation Criteria (from VISION.md)

| Criterion | Abbrev | Description |
|---|---|---|
| Decision Rhythm | DR | Meaningful player choice every 15–30s |
| Wonder Tap | WT | Emotional delight / pull to continue |
| Engine-Building Potential | EB | Early decisions compound into later state |
| Topic Fit | TF | Statistical concept IS the decision, not adjacent |
| Low Decoration Risk | LDR | Rewards are game-consequences, not cosmetic |

Scores 1–10 per criterion.

---

## Candidate Evaluation

### A — Mutable-Dice Coffee Shop (Dice Forge × "Run Your Own Place")

**Mechanic:** Player owns a coffee shop. Each stats concept mastered upgrades a die face. Rolling dice = generating sample data. Player crafts the probability distribution they sample from. Correct answers expand what dice can do.  
**Board game inspiration:** Dice Forge (BGG/219717) — mutable die faces; Seize the Bean (BGG/211364) — coffee-shop engine-builder  
**Mobile inspiration:** Two Dots — feedback density + flow; Mini Metro — resource-routing decisions under constraints

| DR | WT | EB | TF | LDR | **Avg** |
|---|---|---|---|---|---|
| 8 | 8 | 9 | 7 | 8 | **8.0** |

**Rationale:** In Dice Forge you literally edit die faces, which ARE the probability distribution you sample from — the concept is the controller, not adjacent to it. Engine-building is native (forged faces compound into your sampling toolkit). The coffee shop thematic shell taps the "run your own cool place" emotional pull in VISION.md. Decoration risk exists (coffee skin could drift cosmetic) but is mitigable: every serve must read a fresh sample the player computes, so no auto-resolve path.

---

### B — Mechs-vs-Data Pipeline (Pre-commit Programming Puzzle)

**Mechanic:** Each "data challenge" (a dataset with a question) requires player to pre-commit a stats pipeline (collect → clean → describe → test → interpret). Pipeline executes, player watches results, iterates.  
**Board game inspiration:** Mechs vs Minions (BGG/209010) — program a sequence, watch execution  
**Mobile inspiration:** Opus Magnum mobile-style puzzle-fiddle

| DR | WT | EB | TF | LDR | **Avg** |
|---|---|---|---|---|---|
| 5 | 6 | 7 | 9 | 8 | **7.0** |

**Rationale:** Highest topic fit for *procedure* (hypothesis-testing pipeline is genuinely a program). But decision rhythm is slow: you commit one big pipeline then watch — minutes between meaningful choices, violating the 15–30s rule. Best as a late-game mode or "specialty drink" endgame challenge, not the core loop.

---

### C — Spatial-Tile Daily Puzzle (Patchwork × Wordle)

**Mechanic:** Daily puzzle. 7 stat-concept tiles, each with a shape and a cost (time + resources). Player fills a grid under budget. Each tile requires answering a stat question to place it.  
**Board game inspiration:** Patchwork (BGG/163412) — spatial tiling + time/button cost  
**Mobile inspiration:** Wordle — daily ritual, measurable progress, social share

| DR | WT | EB | TF | LDR | **Avg** |
|---|---|---|---|---|---|
| 7 | 6 | 4 | 6 | 6 | **5.8** |

**Rationale:** Clean daily ritual + aesthetic satisfaction, but engine-building is near-zero (each day resets). "Answer question to place tile" risks becoming a quiz with a tiling reward on top — pure decoration risk. Session length fits commute but topic fit is weak: the tiling layout doesn't map onto the statistical concept being used.

---

### D — Arctic Scavengers Tribe-Leader Path (Asymmetric Factions)

**Mechanic:** Pick a statistical "school" at start (frequentist / Bayesian / descriptive). Each school has a different deck and deck-building rules. Asymmetric play: frequentists test hypotheses, descriptivists build distributions, Bayesians update priors.  
**Board game inspiration:** Arctic Scavengers (BGG/56625) — asymmetric tribe leaders; Cry Havoc (BGG/192457) — faction asymmetry  
**Mobile inspiration:** Reigns — identity-framing through persistent choice

| DR | WT | EB | TF | LDR | **Avg** |
|---|---|---|---|---|---|
| 4 | 7 | 8 | 8 | 6 | **6.6** |

**Rationale:** Strong identity-framing and long-arc replay. Asymmetry lives at the meta layer; moment-to-moment it doesn't guarantee a decision every 30s. Three distinct rule-sets is heavy scope for Cycle 1. Bayesian inference is also out of scope (VISION.md "out of scope" list). Revisit post-intro-mastery.

---

### E — Catan Trade Window (Data Exchange)

**Mechanic:** NPC merchants each hold part of a dataset (a column). Player trades statistical insights to get needed columns to answer research questions.  
**Board game inspiration:** Catan (BGG/13) — trade window, negotiation  
**Mobile inspiration:** Slay the Spire — resource triage decisions

| DR | WT | EB | TF | LDR | **Avg** |
|---|---|---|---|---|---|
| 5 | 5 | 6 | 6 | 5 | **5.4** |

**Rationale:** Negotiation is fun but the stat content ("which insight is worth trading?") is fuzzy and easy to fake without using the actual concept. NPC trade logic is heavy design work for thin concept-use. Decoration risk is real: trading produces no consequence if wrong insights are tradable equivalents.

---

### F — Reigns-Style Decision Stream

**Mechanic:** Swipe-card decisions. Each card is a real-world scenario with a stat question. Left/right answer. Kingdom resources (sample size, confidence, data quality) rise/fall.  
**Board game inspiration:** (none strong — card-driven but not board-game-derived)  
**Mobile inspiration:** Reigns — swipe decision cadence; Tinder-style micro-commitment

| DR | WT | EB | TF | LDR | **Avg** |
|---|---|---|---|---|---|
| 9 | 5 | 3 | 7 | 4 | **5.6** |

**Rationale:** Best raw decision rhythm (a swipe every few seconds) and mobile-native. But swipe-left/right collapses statistics into binary trivia — no engine-building, "kingdom resources" are pure gamification dressing. Lowest decoration resistance in the set. Resources feel arbitrary, not conceptually grounded.

---

### G — Stuffed Fables Per-Topic Boss Encounters

**Mechanic:** Each statistics topic is a unique "boss" with its own mini-mechanic. Mean/Median boss = balancing a see-saw under noise. Hypothesis boss = threshold-crossing with evidence tokens. Correlation boss = arranging scatter dots.  
**Board game inspiration:** Stuffed Fables (BGG/233312) — per-encounter unique mechanic; Gloomhaven — boss encounters  
**Mobile inspiration:** Alto's Odyssey — per-biome mechanic shifts; Mini Metro — unique station rules

| DR | WT | EB | TF | LDR | **Avg** |
|---|---|---|---|---|---|
| 7 | 9 | 5 | 9 | 7 | **7.4** |

**Rationale:** Highest wonder + per-concept fit: each encounter's mechanic literally IS the concept (balance a see-saw under noise = mean vs. median sensitivity). Weakness: encounters are siloed, so decisions don't compound across topics — engine-building is weak. Per-boss bespoke mechanics are expensive to build. Best used as the content layer INSIDE another loop (folded into Candidate A's shell as "forged tools").

---

### H — Mini Metro–Style Flow Optimizer

**Mechanic:** Stations = data sources. Lines = analysis pipelines. Player draws connections, watches data flow. Bottlenecks = concept gaps. Upgrading a station requires answering a stat question.  
**Board game inspiration:** (no strong fit — flow-optimization is more digital-native)  
**Mobile inspiration:** Mini Metro (the game directly) — spatial routing + resource constraints

| DR | WT | EB | TF | LDR | **Avg** |
|---|---|---|---|---|---|
| 6 | 7 | 7 | 5 | 6 | **6.2** |

**Rationale:** Elegant spatial pipeline-thinking, but "data flow" maps poorly onto intro descriptive/inferential topics. It teaches workflow, not statistical concepts. Topic fit is the weakest of the set for intro stats scope. Better fit for a data-science / data-engineering course.

---

## Summary Scorecard

| Rank | Candidate | Avg Score |
|---|---|---|
| 1 | A — Mutable-Dice Coffee Shop | **8.0** |
| 2 | G — Stuffed Fables Topic Bosses | **7.4** |
| 3 | B — Mechs-vs-Data Pipeline | **7.0** |
| 4 | D — Arctic Scavengers Tribe-Leader | 6.6 |
| 5 | H — Mini Metro Flow Optimizer | 6.2 |
| 6 | F — Reigns Decision Stream | 5.6 |
| 7 | C — Spatial-Tile Daily Puzzle | 5.8 |
| 8 | E — Catan Trade Window | 5.4 |

**Strategic synthesis:** Ship **A** as the engine, fold **G**'s bespoke mini-mechanics in as the "forged tool" content per station, and hold **B** for a late-game "specialty drink" endgame mode.

---

## Top-3 Ranking

### #1 — Mutable-Dice Coffee Shop (avg 8.0)
Best fusion of concept-as-controller + engine-building + thematic pull + reuse of existing R3F assets. Dice faces ARE the population distribution. No path to auto-resolve without using statistics. Folds G's encounter mechanics in as upgrades, amortizing their bespoke cost.

### #2 — Stuffed Fables Topic Bosses (avg 7.4)
Highest wonder and per-topic concept fidelity. Not a standalone engine — best as the content layer inside #1's coffee-shop shell. Each new shop station (drip → espresso → cold-brew lab) introduces a new topic's boss mechanic, giving bespoke encounters a natural cadence rather than an endless one-off design burden.

### #3 — Mechs-vs-Data Pipeline (avg 7.0)
Highest procedural topic fit. Holds as the endgame "mastery challenge" mode: once the player has forged all die faces for a topic cluster, they face a Mechs-style pre-commit challenge that tests the full pipeline. Decision rhythm too slow for the core loop but perfect for high-stakes test-prep moments.

---

## #1 Detailed Specification: Bean & Bell Curve

### Formal name + tagline
**WaffleStack: Bean & Bell Curve** (Hebrew working title: *פולים והתפלגות*)  
> *Forge the dice you roll from. Every roll is a sample; every face you carve is a statistic you've mastered.*

---

### Core game loop (every ~25 seconds)

You run a coffee shop. Each in-game "morning rush" a queue of customers arrives, each wanting a drink defined by a **target statistic**: "a latte whose foam is at the *median*," or "a blend whose bean-mix has *low spread*." To serve them you **roll your bean dice** — each roll is a draw from a distribution. Each turn you decide:

1. **Which dice to roll, and how many** (choosing sample size n).
2. **Whether to re-roll / keep rolling** (push-your-luck stopping rule).
3. **Which forged face to spend** (a mastered statistic that transforms the sample).
4. **How to read the sample** — drag dice into order on a spatial track, identify the requested statistic, serve.

Profit funds **forging new faces**: carving a value onto a blank die slot. Forging requires a *constructive* concept challenge (place values to hit a target distribution shape), not multiple-choice. The shape of the die you build IS the distribution you sample from next session.

---

### Statistics embedded in every decision

| Decision | Statistical concept used |
|---|---|
| How many dice to roll | Sample size n, SE shrinkage, law of large numbers |
| Stop or keep rolling | Push-your-luck stopping rule, confidence vs. cost |
| Which forged face to activate | Probability of different outcomes, distribution shape |
| Drag dice into order + read | Mean, median, mode, spread from live sample |
| Forge a face (constructive) | Building a distribution by specifying its shape/SD |
| Choose next station to unlock | Concept prerequisites (Century Spice Road pickup-and-deliver graph) |

---

### Three example decision moments

**Decision 1 — Sample size and SE shrinkage (Sampling Distributions)**  
Customer wants foam "reliably near 7." Player holds a die averaging 7 but high variance. Choice: roll it once (cheap, risky) or roll 5 dice and serve the mean of the batch (costs beans, but the sample-mean track visibly narrows). Player uses the Law of Large Numbers as a resource trade — abstract concept becomes a visible on-table transaction.

**Decision 2 — Mean vs. median under an outlier (Robustness)**  
A rolled batch shows {3, 3, 4, 4, 20} — one scalding-hot bean (outlier). The order wants "typical temperature." Decision: serve by mean (8, wrong — drink ruined) or spend the forged **Median face** to serve 4 (correct). This is Stuffed Fables (#2 mechanic) folded in as a forged tool: the see-saw tilts on the outlier, making sensitivity visceral.

**Decision 3 — Constructing a distribution (Probability + Variance)**  
To unlock the espresso station the player must forge a die that "usually lands 4–6, rarely 1 or 9." Six die faces are allocated across a drag-and-drop UI; the resulting bar chart updates live. Player must hit a target SD band before the slot saves. They are constructing a distribution from its dispersion properties — using variance to design, not to recall.

---

### Session length and natural stopping points

| Session type | Duration | Stopping point |
|---|---|---|
| Micro | 4–6 min | "Morning rush" ends — 8–12 customers served. Score tallied. |
| Meso | 10–15 min | Forging decision between mornings — pick next face = agency over what to learn. |
| Macro arc | 5–7 mornings | New station unlocked (drip → espresso → cold-brew lab). Topic cluster gated. |

The morning-rush boundary is a Duolingo-style natural pause: clean stop, progress tallied, no cliffhanger needed. Station unlock is the "open a new world" beat (Civilization feel). Both align with Anki-interval research (~15–30s per decision, ~5-min burst sessions).

---

### Build on existing R3F / city-builder code

This is **extend, not pivot**. No tech-invariant violations.

| Existing asset | Reuse in Bean & Bell Curve |
|---|---|
| `ProceduralBuilding` / `buildingGenerator` / `irregularGrid` | Shop stations = buildings in the city scene. Buildings now **produce/consume beans** → kills original "decoration not decision" risk flagged in VISION.md. |
| `DeformableCell` + `DeformationShader` | Die faces + sampling-distribution bar track (deform face mesh to visualize skew/spread). |
| `ToonShader` / `PaintableAsset` / `ColorableModel` | Bean/drink dice faces, the "forged face comes alive" wonder-tap moment. Gold token on face = mastered concept. |
| `progressStore` (Zustand) | Forged faces = mastered topics. Already the mastery model. No new state shape needed. |
| `TopicViz` / `LearningMap` / `ConceptMapGalaxy` | Becomes the shop tech-tree / station map. Spatial concept-prerequisite graph (Century Spice Road pickup-and-deliver) maps onto existing `ConceptMapFlow`. |
| `SamplingDistribution` component | Directly surfaced as the on-table dice-roll result bar chart. |
| `DistributionChart` | Used in the forging UI to render the live distribution shape as faces are allocated. |
| `StatChallenge` / `ReviewMode` | Forging challenges replace the current quiz wrapper — now constructive (build the distribution) rather than multiple-choice. |
| MathLive / KaTeX | Reading panel when player computes the requested statistic from the sample. |

New code required:
- **Dice simulation engine** — pure TypeScript, no UI. Roll n dice from a distribution defined by face values, return sample array. Vitest-testable.
- **Serving logic** — compare player's computed statistic to customer's target statistic within tolerance. Score and feedback.
- **Forging UI** — drag-and-drop face allocator with live distribution preview (reuses `DistributionChart`).
- **Customer queue generator** — procedural customer orders tied to unlocked concept pool.
- Feature-flagged behind `BEAN_CURVE_MODE` in `src/config/featureFlags.ts`.

---

### Risks and mitigations

| Risk | Mitigation |
|---|---|
| Coffee-shop becomes a clicker (decoration creep) | Every serve requires reading a fresh sample the player computes. No auto-resolve path. If a customer can be served without using a statistic, cut that customer type. |
| Reading samples feels like arithmetic homework | Spatial track — drag dice into order, median snaps to center, mean shown as a balance-point marker. Computation is manipulation, not typing. |
| Forging question regresses to a quiz | Forging is constructive (allocate die faces to hit a target distribution shape). Player proves mastery by building, not picking. |
| Push-your-luck + sampling confuse two concepts | Stopping-rule rolls introduced only after sample-size basics land (gated behind espresso station unlock). |
| Scope overrun (all 8 concepts at once) | Ship Cycle 1 with descriptive stats only (mean/median/mode/spread + basic probability via die construction). Sampling distributions, CIs, and hypothesis testing arrive with later stations. |
| R3F die-rolling performance on mobile | Cap max simultaneous dice at 12. Use instanced meshes for dice faces. Keep <16ms per frame budget. |

---

### Vision alignment check (for this exploration doc)

| Rule | Compliant? | Citation |
|---|---|---|
| What we are: stats-first via game | ✓ | Die faces ARE the distribution; stats concept used in every decision |
| Gameplay ≠ Gamification | ✓ | Wrong drink = lost customer (consequence), not XP deduction |
| Design rule: Hebrew-first | ✓ | Hebrew working title; all player-facing text would be Hebrew |
| Design rule: dark UI | ✓ | All colors from locked palette; bg `#0e0f12` |
| Color palette: only locked tokens used | ✓ | Gold = forged face; teal = correct serve; red = wrong drink |
| UI source cited | ✓ | Linear dark-UI density for the serving panel; Apple HIG 44pt targets for die-tap zones |
| UI anti-pattern avoided | ✓ | Bottom-sheet for feedback (not modal); no hamburger; no hover-only affordances |
| Tech invariant: Tailwind only | ✓ | No CSS modules planned |
| Tech invariant: Zustand only | ✓ | progressStore extended; no new state library |
| Tone rule: encouragement | ✓ | Wrong drink → "הלקוח ביקש ממוצע — ניסית חציון. הנה למה זה שונה:" |
| Mobile-first (thumb-reach + 44pt targets) | ✓ | Bottom-sheet serving panel; dice tap = 44pt min; one-thumb roll |
| Out of scope: stays in scope | ✓ | Bayesian inference excluded; no multiplayer; no teacher dashboard |

**NotebookLM consulted:** No — MCP connector not available in this container.  
**Board-game inspiration:** Dice Forge (mutable die faces = distribution you craft); Seize the Bean (coffee-shop engine-builder); Arctic Scavengers (tribe-leader identity framing for faction paths — held for Cycle N); Stuffed Fables (per-encounter mechanic = forged tool per topic); Catan (trade window → resource negotiation = concept-prerequisite graph); Century Spice Road (pickup-and-deliver prerequisite chain = station unlock tree)  
**Mobile-game inspiration:** Two Dots (feedback density + flow state between decisions); Mini Metro (resource routing under constraints = die allocation); Reigns (micro-commitment cadence = serve decision cadence)  
**Decision interval:** every ~25 seconds (roll → read sample → serve → next customer).  
**Statistical concept used in decision:** Mean, median, mode, spread — chosen by the player to satisfy the customer's order, computed from a live sample they rolled.

---

## Next cycle recommendation

Cycle 2 should implement the **dice simulation engine** (pure TS, Vitest tests) + the **serving logic** behind `BEAN_CURVE_MODE` feature flag. No UI yet — validate the core mechanic is fun via unit-test driven TDD. The morning-rush game loop can be text-driven in a Vitest test before any R3F work begins.

Candidate G's Stuffed-Fables mechanic (mean vs. median see-saw) should be the first "forged tool" implemented — highest teaching value, visually striking, and directly reuses `DeformableCell`.
