# Proactive Cycle 01 — Gameplay Loop Exploration

**Date:** 2026-05-29  
**Branch:** `proactive/exploration/games-design-space`  
**Cycle type:** Exploration only (no code)  
**Agent model routing:** Vision read → Sonnet 4.6 · Design decision → Opus 4.8 (one call)  
**NotebookLM:** SKIPPED — MCP connector not available in this container. Used VISION.md catalogue + design judgment.

---

## Purpose

WaffleStack needs a core gameplay loop that is a **real game**, not a quiz with reward graphics. This document evaluates 8 candidate loops against VISION.md criteria, ranks them, and fully specs the winner for Cycle 2 implementation.

---

## Scoring Dimensions

Per VISION.md "Gameplay candidate criteria":

| Dimension | Description | Max |
|---|---|---|
| **Decision-stat-fit** | Decision literally IS the stats concept (5) vs. stats is just the quiz gate (1) | 5 |
| **Decision rhythm** | ~20s interval (5) vs. too slow or too frantic (1) | 5 |
| **Engine-building** | Strong persistent compounding (5) vs. no persistence (1) | 5 |
| **Wonder-tap** | Strong emotional/aesthetic pull (5) vs. dry (1) | 5 |
| **Decoration risk** | Very low risk of becoming hollow XP loop (5) vs. high risk (1) | 5 |

---

## 8 Candidates

### C1 — Mutable-Dice Engine: "Roll Your Own Distribution"

**Mechanic:** Dice Forge (BGG) × Two Dots (mobile) × Brilliant (educational)  
**Pitch:** Player starts with a fixed d6. Each mastered stats concept lets them modify a die face — add a σ-face, swap values, weight probabilities. Upgraded dice are rolled in "sampling runs" that generate in-game resources and build a persistent world. Decision: which face to carve next.  
**Stats concept directly used:** Probability distributions, expected value, variance — the die IS the distribution you're constructing.  
**Decision interval:** ~20s per roll event; upgrade decision every 2–3 problems  
**Board game:** Dice Forge  
**Mobile game:** Threes (tactile incremental satisfaction), Two Dots (risk-reward chaining)

| Dimension | Score | Rationale |
|---|---|---|
| Decision-stat-fit | 5 | Carving a face = defining P(face); the die shape IS the distribution |
| Decision rhythm | 5 | Roll event ~20s; carve decision after each 2-3 problems |
| Engine-building | 5 | Dice persist session-over-session; carved faces compound |
| Wonder-tap | 4 | Live converging histogram is a spatial wonder beat |
| Decoration risk | 4 | Risk lives in σ-face math — must be shown spatially not as quiz gate |
| **TOTAL** | **23/25** | |

---

### C2 — Pre-commit Pipeline: "Debug the Machine"

**Mechanic:** Mechs vs Minions (BGG/209010) × Mini Metro (mobile)  
**Pitch:** Player pre-commits a sequence of stats analysis steps (collect → clean → model → test) for a fictional dataset. Pipeline executes, errors emerge, player iterates. Decision: which step to insert/reorder before execution.  
**Stats concept used:** Entire intro stats pipeline (sampling, cleaning, descriptive, inferential)  
**Decision interval:** ~25-30s per pipeline step  
**Board game:** Mechs vs Minions  
**Mobile game:** Mini Metro

| Dimension | Score | Rationale |
|---|---|---|
| Decision-stat-fit | 4 | Strong for procedural topics; weaker for conceptual understanding |
| Decision rhythm | 2 | Pre-commit + watch cycle is slow; interrupts flow |
| Engine-building | 4 | Unlock more pipeline slots over time |
| Wonder-tap | 3 | Watching a pipeline execute is satisfying but not wonder-level |
| Decoration risk | 4 | Hard to make cosmetic if execution is the feedback |
| **TOTAL** | **17/25** | |

---

### C3 — Push-Your-Luck Sampling: "When to Stop"

**Mechanic:** Quacks of Quedlinburg × Welcome To (board) · Two Dots (mobile)  
**Pitch:** Player draws data-tokens from a bag. Each draw gives more evidence. Decide when to stop drawing and commit to a statistical conclusion. Stop too early = wrong conclusion; draw too long = contradictory data risk.  
**Stats concept used:** Sampling, confidence intervals, hypothesis testing stopping rules — literally the stopping decision  
**Decision interval:** ~15s per draw; commitment every ~5 draws  
**Board game:** Quacks of Quedlinburg  
**Mobile game:** Two Dots

| Dimension | Score | Rationale |
|---|---|---|
| Decision-stat-fit | 5 | The stopping IS the concept — perfect embodiment |
| Decision rhythm | 4 | Fast per draw, tension builds toward commitment |
| Engine-building | 2 | Bag resets after each conclusion; weak persistence |
| Wonder-tap | 4 | Bag-draw tension is genuinely exciting |
| Decoration risk | 4 | Stopping mechanism can't be faked with XP skins |
| **TOTAL** | **19/25** | |

---

### C4 — Stats Observatory Engine: "The Lab That Runs Itself"

**Mechanic:** Coffee Rush (BGG/377061) × Catan trading × Viticulture (board) · Mini Metro (mobile)  
**Pitch:** Player runs a stats observatory. NPCs arrive with data needs. Each station upgrade requires mastering a stats concept. Catan-style trade: exchange data samples with NPCs to fill dataset gaps. Resources compound through the station tree.  
**Stats concept used:** Each station IS a concept (sample station, distribution station, test station)  
**Decision interval:** ~20-30s (serve NPC + decide upgrade)  
**Board game:** Seize the Bean / Coffee Rush, Catan  
**Mobile game:** Mini Metro

| Dimension | Score | Rationale |
|---|---|---|
| Decision-stat-fit | 3 | Station maps to concept, but serving NPC = answering quiz; concept is adjacent |
| Decision rhythm | 4 | Steady NPC arrival; natural cadence |
| Engine-building | 5 | Station compounding is the strongest here |
| Wonder-tap | 4 | "Run your own place" emotional pull is real |
| Decoration risk | 2 | High risk: NPC service easily becomes "quiz to unlock upgrade" |
| **TOTAL** | **18/25** | |

---

### C5 — Spatial-Tiling Daily Puzzle: "Statistics Patchwork"

**Mechanic:** Patchwork × Wordle daily rhythm × Azul (board) · Threes (mobile)  
**Pitch:** Daily puzzle: fill a grid with stats-concept tiles. Tiles have matching rules (distribution tiles adjacent to probability tiles). Complete the puzzle = understand concept connections.  
**Stats concept used:** Knowledge topology (how concepts relate) — one step removed from using them  
**Decision interval:** ~15-20s per tile  
**Board game:** Patchwork  
**Mobile game:** Wordle, Threes

| Dimension | Score | Rationale |
|---|---|---|
| Decision-stat-fit | 2 | Tiling = metaphor for knowledge topology, not using a stat |
| Decision rhythm | 4 | Tile placement is fast and satisfying |
| Engine-building | 2 | Daily puzzle resets; no persistent engine |
| Wonder-tap | 3 | Aesthetic satisfaction but lower emotional pull |
| Decoration risk | 2 | Cosmetic risk is high; tiling is a wrapper not a mechanic |
| **TOTAL** | **13/25** | |

---

### C6 — Asymmetric Statistical Schools: "Choose Your Path"

**Mechanic:** Cry Havoc (BGG/192457) × Arctic Scavengers tribe leaders (board) · Reigns (mobile)  
**Pitch:** Player picks a statistical "school" (frequentist / Bayesian / nonparametric). Each school has different tools and win conditions. Apply the school's approach to datasets.  
**Stats concept used:** Meta-level — understanding strengths/weaknesses of statistical approaches  
**Decision interval:** ~30s  
**Board game:** Cry Havoc, Arctic Scavengers  
**Mobile game:** Reigns

| Dimension | Score | Rationale |
|---|---|---|
| Decision-stat-fit | 2 | "Which school" is a meta-decision about stats, not exercising a stat concept |
| Decision rhythm | 2 | ~30s decisions are too sparse for mobile; long dead-time between choices |
| Engine-building | 3 | School unlocks compound but slowly |
| Wonder-tap | 3 | Identity pull ("I'm a Bayesian") is moderate |
| Decoration risk | 3 | School identity can degenerate into just a skin difference |
| **TOTAL** | **13/25** | ⚠ Also violates VISION scope: Bayesian inference + nonparametric = out-of-scope |

---

### C7 — Pickup-and-Deliver Prerequisites: "The Concept Caravansary"

**Mechanic:** Century Spice Road × Catan (board) · Mini Metro routing (mobile)  
**Pitch:** Stats topics = resources in a pyramid. Player ships concept-understanding between nodes, upgrading routes to handle prerequisite chains. Each delivery = answering the connecting concept's questions.  
**Stats concept used:** Topic prerequisites, transformation between concepts  
**Decision interval:** ~25s  
**Board game:** Century Spice Road  
**Mobile game:** Mini Metro

| Dimension | Score | Rationale |
|---|---|---|
| Decision-stat-fit | 2 | Routing = prereq map metaphor; concept usage is still the quiz gate |
| Decision rhythm | 3 | Route decisions at good pace but dead time in transit |
| Engine-building | 4 | Route upgrades compound nicely |
| Wonder-tap | 3 | Network expansion is visually satisfying |
| Decoration risk | 3 | Routing mechanic can become cosmetic if quiz stays disconnected |
| **TOTAL** | **15/25** | |

---

### C8 — Per-Encounter Unique Mechanics: "The Statistics Menagerie"

**Mechanic:** Stuffed Fables (BGG/233312) × Pokémon × Dice Forge (board) · Threes (mobile)  
**Pitch:** Each stats topic has its OWN unique mini-mechanic. Mean = balance a seesaw. Distribution = fill histogram bins. Hypothesis test = prosecutor vs. defense debate. Correlation = match scatter-plot shapes. Each mechanic IS the concept embodied.  
**Stats concept used:** Whatever the current topic is — maximum stat-fit per encounter  
**Decision interval:** ~15-30s (varies per topic)  
**Board game:** Stuffed Fables, Dice Forge  
**Mobile game:** Threes

| Dimension | Score | Rationale |
|---|---|---|
| Decision-stat-fit | 5 | Every mechanic IS the concept — tied for highest fit |
| Decision rhythm | 3 | Variable; some topics lend to faster rhythms than others |
| Engine-building | 1 | Each encounter is self-contained; near-zero cross-session compounding |
| Wonder-tap | 5 | Discovery ("what does variance *feel* like?") is the strongest wonder here |
| Decoration risk | 4 | Hard to skin — the mechanic is the meaning |
| **TOTAL** | **18/25** | |

---

## Full Scores Summary

| # | Candidate | Stat-fit | Rhythm | Engine | Wonder | Decor-risk | TOTAL |
|---|---|---|---|---|---|---|---|
| C1 | Mutable-Dice Engine | 5 | 5 | 5 | 4 | 4 | **23** |
| C2 | Pre-commit Pipeline | 4 | 2 | 4 | 3 | 4 | 17 |
| C3 | Push-Your-Luck Sampling | 5 | 4 | 2 | 4 | 4 | **19** |
| C4 | Stats Observatory | 3 | 4 | 5 | 4 | 2 | 18 |
| C5 | Spatial-Tiling Puzzle | 2 | 4 | 2 | 3 | 2 | 13 |
| C6 | Asymmetric Schools | 2 | 2 | 3 | 3 | 3 | 13 ⚠ |
| C7 | Pickup-and-Deliver | 2 | 3 | 4 | 3 | 3 | 15 |
| C8 | Per-Encounter Menagerie | 5 | 3 | 1 | 5 | 4 | 18 |

---

## Top-3 Ranking

1. **C1 — Mutable-Dice Engine (23/25)** — The only candidate where the central decision (carving a face) is *literally* the act of defining a probability distribution, while simultaneously compounding into a persistent engine and pacing at the target ~20s rhythm. Fuses stat-fit, rhythm, compounding, and a spatial wonder-beat (live converging histogram) in one loop.

2. **C3 — Push-Your-Luck Sampling (19/25)** — Deciding when to stop drawing is the cleanest single embodiment of stopping rules/confidence intervals available in any game mechanic. Penalized only for weak cross-session persistence — bag resets after each conclusion.

3. **C8 — Per-Encounter Menagerie (18/25)** — Maximum wonder and fit (every mechanic IS the concept), but a collection of disconnected minigames with no persistent engine. Could be a future expansion on top of C1's frame, not a standalone loop.

---

## #1 Detailed Spec: "Roll Your Own Distribution"

> Design decision via Opus 4.8. Full rationale in scores table above.

**Loop name:** Roll Your Own Distribution  
**Hebrew working title:** לִגְבֵּשׁ אֶת הַגּוֹרָל ("Forge the Dice")  
**Core metaphor:** You are forging a set of living dice. Every stats concept you master lets you re-carve a die face. Your dice ARE your understanding made physical — lopsided and uncontrolled at first, sculpted toward intent as you learn. You roll them on "sampling runs" to harvest resources that build your world.

**The hook (one-line pitch):**  
Don't roll the dice you're given — carve the distribution you need, then watch the world it builds.

---

### Session Arc (~15 min)

**Phase 1 — Forge (~4 min)**  
*Stats concept:* Probability of a single event, P(face), fairness of a die.  
*Player action:* Answer 2–3 short conceptual problems about probability. Each correct application of the concept unlocks one **face-edit token**.  
*Decision:* Which face to edit and how — add pip value, attach a σ-face, weight a face toward a specific outcome.  
*Example decision:* "Make this die more likely to land ≥5" vs. "spread it evenly for stability." Player is setting a probability mass function, directly.

**Phase 2 — Sampling Run (~7 min)**  
*Stats concept:* Expected value, variance, the shape of a distribution over many trials; law of large numbers via live histogram.  
*Player action:* Roll the forged dice 10–20 times against a target "field" that needs resources. A running histogram of outcomes builds live on screen, visibly converging toward E[X].  
*Decision (every ~20s):* Keep rolling for more yield (higher variance, risk overshoot) or bank now (commit to your E[X])? This is the push-your-luck beat layered onto an engine the player built themselves.

**Phase 3 — Build & Branch (~4 min)**  
*Stats concept:* Comparing two distributions; "which die is better for this job."  
*Player action:* Spend harvested resources to expand the world (a district, a generator) AND choose the next concept node to unlock from a small branching tree.  
*Decision:* Invest yield into a new die slot (more sampling power) vs. face-quality upgrade (better distribution shape) — classic tableau tension — and pick which stats topic to learn next.

---

### Key Decision Moment (one concrete turn)

You hold a d6 you've carved to {1,1,3,5,5,σ}, where the σ-face resolves to "+1 per point of standard deviation in your last run." A field needs ≥18 resources from 5 rolls. Your current expected value per roll is ~3.4 → E[5 rolls] ≈ 17 — just short. The live histogram shows your distribution, the shortfall probability displayed as a bar.

Your options:
- **(a)** Spend a face token NOW to swap 1→5, raising E[X] to 3.8 — safer, lower variance ceiling.
- **(b)** Keep the σ-face and gamble on a high-spread run clearing it with the bonus.
- **(c)** Take a 6th roll at the cost of a fatigue penalty next field.

Each option is a real statistical statement about **mean vs. variance vs. sample size**. The player reasons about the distribution to make the call.

---

### Compounding Mechanic (persistence)

Your dice set is permanent and saved cross-session. Faces carved, σ-tools attached, and unlocked die slots all carry forward. The world (districts, generators) is the visible monument to past distributions. Mastered concept nodes stay lit and gate deeper ones — the prerequisite graph is itself the persistent progression layer.

---

### Stats Concepts Covered (intro scope only, in order)

1. Probability of a single event / sample space (carving faces)
2. Uniform vs. weighted distributions (fair die vs. loaded die)
3. Expected value (planning a run's yield)
4. Variance & standard deviation (the σ-face; spread of outcomes)
5. Sampling & sample size (more rolls = more trials; law of large numbers via converging histogram)
6. Comparing distributions (which die for which field)
7. Simple hypothesis testing ("is this die actually loaded?" — observed vs. expected comparison)
8. Correlation basics (late game: pairs of dice whose outcomes co-vary; scatter of two-die runs)

---

### UI Skeleton (mobile-first, RTL, dark)

**Screen 1 — Forge**  
Dark background `#0e0f12`. Dice rendered as glowing tiles center-screen, faces editable by tap. Face-edit tokens anchored top-right (RTL primary zone). Concept-problem card slides up from bottom sheet (not modal — follows VISION bottom-sheet pattern). Answering correctly emits a token with scale-bounce haptic feedback. Hebrew RTL throughout; numerals in standard Arabic-numeral form (universal in Israeli UI).

**Screen 2 — Sampling Run**  
Top: the target field with a `--teal` progress meter. Center: dice mid-roll with physics animation. Bottom: a live-building histogram of outcomes that visibly converges toward E[X] as rolls accumulate (the key spatial wonder beat). Single large "המשך / עצור" (Roll More / Stop) toggle in thumb-zone, `--gold` on active state.

**Screen 3 — Build & Branch**  
Right panel (RTL primary): growing isometric world view. Left panel: glowing concept branch tree with 2–3 unlockable nodes to choose among. Resource bank as a bottom strip. No modal stacking — selecting a node opens a bottom sheet.

---

### Risk Flags

1. **Decoration risk:** The σ-face and E[X] reasoning must be shown spatially (live histogram). If omitted, Dice becomes just a quiz with skins. Prototype the histogram first.
2. **Hypothesis testing turn (concept 7):** Hardest to keep as a live *decision* vs. a gate. Spec the "is this die loaded?" turn explicitly before implementing.
3. **Failure mode:** Push-your-luck shortfall must yield partial resources + informative feedback, never a wall — per VISION rule.
4. **Tableau balance:** Face-carve tokens vs. die slots must be tuned so neither dominates (no clear dominant strategy, or the engine becomes rote).

---

### Why C1 Beats the Alternatives

C1 is the only candidate where the central decision (carving a face) is *literally* the act of defining a probability distribution, while simultaneously compounding into a persistent engine and pacing at the target ~20s rhythm. C3 matches it on stat-fit but its bag resets each conclusion (no engine), and C8 matches it on wonder but is a collection of disconnected minigames — C1 fuses fit, rhythm, compounding, and a spatial wonder-tap (converging histogram) in one loop.

---

## Inspiration Citations (per VISION.md requirement)

**Board games:**
- Dice Forge (Régis Bonnessée, 2017) — mutable die faces as the core upgrade mechanic
- Quacks of Quedlinburg (Wolfgang Warsch, 2018) — push-your-luck sampling tension
- Stuffed Fables (Jerry Hawthorne, 2018, BGG/233312) — per-encounter unique mechanics (C8 reference)
- Mechs vs Minions (Riot Games, 2016, BGG/209010) — pre-commit pipeline execution (C2 reference)
- Seize the Bean / Coffee Rush (BGG/377061) — run-your-place engine-building (C4 reference)
- Cry Havoc (Portal Games, 2016, BGG/192457) — asymmetric factions (C6 reference)
- Century: Spice Road (Emerson Matsuuchi, 2017) — resource-pyramid prerequisite chain (C7 reference)
- Arctic Scavengers (Robert K. Gabhart) — tribe-leader asymmetry
- Catan (Klaus Teuber) — trading window mechanic
- Patchwork (Uwe Rosenberg) — spatial tiling (C5 reference)

**Mobile games:**
- Threes (Sirvo, 2014) — tactile incremental satisfaction, decision density
- Two Dots (Betaworks, 2014) — risk-reward chaining, one-thumb play
- Mini Metro (Dinosaur Polo Club, 2015) — routing network as stats concept carrier
- Wordle (Josh Wardle, 2021) — daily-puzzle rhythm, measurable progress

**UI sources:**
- Linear.app — dark UI density, status pills, micro-interactions (referenced for Screen 2 progress meter design)
- Apple HIG (iOS dark mode) — 44pt hit targets, thumb-zone positioning (referenced for CTA placement)
- Duolingo — branching concept-tree shape (referenced for Screen 3 branch tree; we go deeper than Duolingo's quiz loop)

---

*Next cycle: implement C1 prototype behind feature flag. Start with the Forge screen + face-edit mechanic + one concept question. npm run build must pass.*
