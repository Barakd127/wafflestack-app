# WaffleStack — Proactive Cycle 1: Gameplay Design Space Exploration

**Date:** 2026-05-30  
**Branch:** proactive/exploration/games-design-space  
**Model routing:** Haiku (vision read + git survey) → Opus (gameplay-design decision)  
**NotebookLM:** SKIPPED — MCP connector not available in this container. Used VISION.md catalogue + design judgment per cycle rules.

---

## Candidate Gameplay Loops

### 1. 🎲 Distribution Forge

**Concept:** You don't roll given dice — you *craft the distribution* you roll from, spending mastered topics to add/remove faces, then must predict your own roll's outcome to win resources.

**Board game:** Dice Forge (BGG #194594)  
**Mobile feedback:** Slay the Spire card-reward juice — the satisfying "face upgrade" snap and animated re-roll

| Decision rhythm | Wonder tap | Engine-building | Topic-fit | Decoration risk |
|---|---|---|---|---|
| 5 | 4 | 5 | 5 | 5 |

**Total: 24/25**  
**Key stats concept:** Probability distributions, expected value, variance — the player literally builds a PMF and reasons about E[X].  
**Decision interval:** ~20 s (each face-craft / each pre-roll bet)  
**Biggest risk:** Variance can feel "swingy/unfair" to anxious students; needs a "your EV was correct even though the roll lost" reassurance layer or it punishes good statistical reasoning.

---

### 2. ⚙️ Pipeline Programmer

**Concept:** Pre-commit a sequence of statistical operations (clean → group → test → visualize) onto a dataset, hit run, and watch the pipeline execute on real-ish data — no mid-run edits.

**Board game:** Mechs vs. Minions (BGG #209010)  
**Mobile feedback:** Human Resource Machine / Lightbot — the "watch your program run and cringe/cheer" replay

| Decision rhythm | Wonder tap | Engine-building | Topic-fit | Decoration risk |
|---|---|---|---|---|
| 3 | 4 | 4 | 5 | 5 |

**Total: 21/25**  
**Key stats concept:** Analysis workflow, choosing the right test for data type, ordering operations.  
**Decision interval:** ~45–60 s (planning phase is long, then a watch phase — violates the 15–30 s rhythm)  
**Biggest risk:** Plan-then-watch rhythm is too slow; feels like homework with a "run" button if the watch phase isn't dramatic.

---

### 3. 🧵 Daily Sampling Tile (Patchwork × Wordle)

**Concept:** A daily puzzle: a hidden population distribution exists; you place "sample tiles" on a board to draw samples and must infer the population shape in the fewest draws.

**Board game:** Patchwork (BGG #163412)  
**Mobile feedback:** Wordle — one-a-day, shareable result grid, "I got it in 3 samples."

| Decision rhythm | Wonder tap | Engine-building | Topic-fit | Decoration risk |
|---|---|---|---|---|
| 4 | 5 | 2 | 5 | 5 |

**Total: 21/25**  
**Key stats concept:** Sampling, sample size vs precision, central limit theorem, inference about a population.  
**Decision interval:** ~25 s per tile placement  
**Biggest risk:** "Daily, one-and-done" caps session length and engine-building; great retention hook but thin as the *core* loop alone.

---

### 4. 🕴 Influence Markets (Hypothesis Bluff)

**Concept:** Place hidden influence on competing "schools of analysis"; a noisy public signal (a sample statistic) is revealed each round and you bet on which hypothesis the data supports.

**Board game:** Godfather: Corleone's Empire / Coup (BGG #131357)  
**Mobile feedback:** Balatro / poker — chip-push, reveal, payout swing

| Decision rhythm | Wonder tap | Engine-building | Topic-fit | Decoration risk |
|---|---|---|---|---|
| 4 | 4 | 3 | 4 | 4 |

**Total: 19/25**  
**Key stats concept:** Hypothesis testing, p-values as evidence weight, Type I/II error as betting risk.  
**Decision interval:** ~25 s  
**Biggest risk:** Needs an opponent (AI or async); single-player bluff is hollow, and the "bluff" framing can muddy the statistical reasoning it's meant to teach.

---

### 5. 🏨 Inference Triage (Coffee Rush Pacing)

**Concept:** NPCs stream into your "stats clinic" each holding a messy data request; you must pick the correct test/visualization under a ticking timer before the queue overflows.

**Board game:** Kitchen Rush (BGG #214880) — closest to Coffee Rush tempo mechanics  
**Mobile feedback:** Diner Dash / Coffee Rush — escalating queue pressure, combo multipliers

| Decision rhythm | Wonder tap | Engine-building | Topic-fit | Decoration risk |
|---|---|---|---|---|
| 5 | 3 | 2 | 4 | 3 |

**Total: 17/25**  
**Key stats concept:** Test selection (t-test vs chi-square vs correlation) by data type and question.  
**Decision interval:** ~10–15 s  
**Biggest risk:** Time pressure rewards pattern-memorization over understanding → collapses into a reskinned timed quiz. High decoration risk.

---

### 6. 🌶 Prerequisite Spice Road

**Concept:** Stats topics are a resource chain (descriptive → distributions → inference); you pick up "concept tokens" and deliver them to unlock fulfillment of higher-order "research contracts."

**Board game:** Century: Spice Road (BGG #209685)  
**Mobile feedback:** Travel/merchant idle loops — visible upgrade trees, contract-complete chimes

| Decision rhythm | Wonder tap | Engine-building | Topic-fit | Decoration risk |
|---|---|---|---|---|
| 4 | 3 | 5 | 2 | 2 |

**Total: 16/25**  
**Key stats concept:** Topic prerequisite structure (curriculum dependency).  
**Decision interval:** ~30 s  
**Biggest risk:** Stats is *adjacent* to the mechanic, not *used* — you trade tokens labeled "variance" without ever computing variance. Pure decoration risk.

---

### 7. 🏪 Run-A-Lab Engine Builder

**Concept:** Operate a research lab where each experiment you run is an actual study-design decision (sample size, control, measure) and the quality of your stats choices determines data quality and payout.

**Board game:** Gizmos (BGG #246900) / Wingspan (BGG #266192) tableau-engine  
**Mobile feedback:** Two Point Hospital / Egg, Inc. — facility upgrades, escalating payout loops

| Decision rhythm | Wonder tap | Engine-building | Topic-fit | Decoration risk |
|---|---|---|---|---|
| 3 | 3 | 5 | 3 | 2 |

**Total: 16/25**  
**Key stats concept:** Study design, sample size, confounding.  
**Decision interval:** ~40 s  
**Biggest risk:** Stats easily slides behind a management-sim veneer; "upgrade your centrifuge" becomes the dopamine, not the inference. High decoration risk.

---

## Top-3 Ranking

| Rank | Name | Total | Rationale |
|---|---|---|---|
| 1 | 🎲 Distribution Forge | 24/25 | The only loop where the player physically *constructs* a probability distribution and reasons over E[X]/variance every 20 s — stats IS the mechanic, with compounding engine depth. |
| 2 | 🧵 Daily Sampling Tile | 21/25 | Highest wonder/topic-fit; Wordle-grade retention. Best deployed as a *companion daily* loop once the core spine exists, not as the spine itself. |
| 2 | ⚙️ Pipeline Programmer | 21/25 | Deep topic-fit and zero decoration risk, but plan-then-watch tempo breaks the 15–30 s decision rhythm. Viable as a boss-fight/capstone mode (Stuffed Fables per-encounter mechanic). |

---

## #1 Candidate: Distribution Forge — Detailed Spec

### Concept

The player owns a set of dice whose faces are *editable*: each die starts blank, and mastering a stats topic grants "face tokens" you forge onto a die (a +3 face, a 0 face, a "double next roll" face). Before each roll the player must make a probabilistic bet about their own crafted die's outcome — predict the mean, or whether the roll clears a threshold — and resources are awarded for *correct reasoning about the distribution they built*, not merely for luck. Over a run, the dice you forge become an engine: better distributions unlock harder, higher-yield contracts.

### A Single Play Session (Step by Step)

1. Player opens a **contract**: *"Deliver an outcome whose expected value ≥ 7 with variance < 4."*
2. They see their current die: faces `[2, 2, 5, 5, 0, ?]`. The app shows the live PMF bar chart and computed E[X] = 2.33.
3. They spend a mastered-topic token to forge the blank face into a `9`. PMF updates; E[X] recomputes to 3.83. (~20 s decision)
4. Still short — they swap a `0` face for a `5` (a costlier edit). E[X] climbs to 4.66; variance widens. The contract needed low variance, so this is a tradeoff. (~20 s decision)
5. **Pre-roll bet:** "Will this roll land within 1 SD of the mean?" Player commits a wager. (~15 s decision)
6. **Roll.** Animated die tumbles; result `5` lands. Within 1 SD → bet pays out. Reassurance line: *"הימור נכון — היית בתוך סטיית התקן."*
7. Payout = topic tokens + coins → fed back into next contract's forging. Engine compounds.

### Stats Concept → Mechanic Map

| Stats concept | Mechanic |
|---|---|
| Probability mass function | Die face layout + live PMF bar chart |
| Expected value E[X] | Contract targets ("E[X] ≥ 7"); recomputed on every forge |
| Variance / SD | Contract constraints + the "within 1 SD" pre-roll bet |
| Mastery → capability (SM-2) | Mastered topics grant face tokens used in forging |
| Risk / tradeoff reasoning | Choosing high-EV-high-variance vs low-EV-safe faces |

### The Decision at the Heart of the Loop

*Which face do I forge/swap onto my die, given I'm trying to move E[X] toward a target while keeping variance inside a constraint — and how do I bet on the distribution I just built?* It is a continuous tension between mean and spread that the player tunes by hand, then reasons about before committing to a roll.

### Why This Is NOT Cosmetic

The contract is literally an inequality over E[X] and Var(X). The player cannot satisfy it without computing (or intuiting) the expected value and variance of a distribution *they themselves assembled*. Remove the statistics and there is no game — there is no way to know which face to forge or whether your bet is good. Compare this to Spice Road or Run-A-Lab, where you could relabel the tokens "wood/brick" and the game is unchanged. Here, relabeling breaks it.

### Hebrew UX Sketch (RTL, Dark UI)

**Forge screen:** A large die in the center showing six face slots, with a live PMF bar chart beneath it labeled `התפלגות` (distribution). Right-aligned panel lists owned face tokens from mastered topics. Top banner shows the active contract: `יעד: תוחלת ≥ 7, שונות < 4`. A running readout: `תוחלת נוכחית: 4.66` updates in real time as faces change.

**Pre-roll bet screen:** The crafted die large and centered with a glowing "FORGE COMPLETE" state. Two large RTL buttons: `בתוך סטיית התקן` (within the SD) / `מחוץ לסטיית התקן`. A small SD band overlaid on the PMF chart shows the ±1σ region the player is betting on.

**Payout screen:** The die mid-tumble; result snaps; a result card slides in from the right: `הימור נכון!` with tokens flying into the player's stash. If the bet was statistically correct but the roll lost: *"התוצאה הייתה צפויה — ההימור שלך היה סטטיסטית נכון."*

### Suggested Cycle 2 Focus

Build the *forge + live PMF + E[X]/variance readout* as a self-contained React component first — no rolling, no economy yet. Prove that editing faces and watching E[X]/Var update in real time is the "wonder tap." Wire it to read mastered topics from `learningStore` to grant face tokens. Defer the contract economy and Godot city integration until the forge feels satisfying on its own. This isolates the riskiest assumption (that distribution-crafting is *fun*) before investing in the surrounding loop.

### Feature Flag

`ENABLE_DISTRIBUTION_FORGE_LOOP`

---

## Sources Cited

**Board games:**
- Dice Forge (BGG #194594) — mutable dice engine mechanic
- Mechs vs. Minions (BGG #209010) — pre-commit programming puzzle
- Patchwork (BGG #163412) — spatial tiling daily puzzle
- Godfather: Corleone's Empire / Coup (BGG #131357) — influence + bluff
- Century: Spice Road (BGG #209685) — pickup-and-deliver prerequisite chain
- Arctic Scavengers — asymmetric tribe leader / school of thought choice
- Stuffed Fables (BGG #233312) — per-encounter unique mechanic (runners-up pipeline candidate)

**Mobile games:**
- Slay the Spire — card-upgrade reward juice and decision compounding
- Wordle — daily, shareable, one-and-done retention pattern
- Balatro / poker — reveal-and-payout swing feedback
- Diner Dash / Coffee Rush — escalating queue pressure pacing

**UI sources:**
- Linear.app — status-pill readouts for E[X] / Var live updates
- Apple HIG dark mode — die face slot sizing (44pt min tap targets)
- Mini Metro — minimal HUD; single-number readout that updates live
