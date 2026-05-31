# WaffleStack — Gameplay Loop Exploration
## Proactive Cycle 01 — 2026-05-25 08:02

**Cycle type:** Exploration only (no code)
**VISION.md read:** ✓ (full, 257 lines)
**NotebookLM:** SKIPPED — MCP connector not available in container. Using VISION.md catalogue + design judgment.
**Opus 4.7 call:** Dispatched for independent scoring (async, will inform Cycle 2). Sonnet synthesis used here.

---

## Current-App Diagnosis

Before proposing, understand what's already broken:

| Symptom | Root cause | VISION.md ref |
|---|---|---|
| 3D city is wallpaper | Buildings unlock on XP, not on decisions made WITH stats | "decoration not decision unless buildings consume/produce resources" |
| XP/streaks/achievements | These are gamification, not gameplay | "Confetti and XP are NOT the game" |
| Quiz loop is passive | Player answers questions, doesn't USE stats to make a choice | "Decision MUST use the statistical concept, not just be adjacent to it" |
| Linear unlock chain | Player has no agency over what they learn next | "Player has agency over what to learn next" |

The current app is exactly what VISION.md warns against: a thin game wrapper over flashcards.

---

## Scoring Rubric

| Criterion | Weight | What it means |
|---|---|---|
| Decision rhythm | 5 | Does it produce 1 decision / 15–30s? |
| Stats-use depth | 5 | Player USES stats in decision, not just answers a quiz |
| Engine-building energy | 4 | Early correct answers compound into later power |
| Wonder tap | 4 | Visual/spatial delight that makes players return |
| Hebrew/mobile fit | 3 | RTL + thumb-reach + dark + no new backend |
| Decoration risk | 4 | LOW = safe. HIGH = likely to degrade into XP soup |
| Scope realism | 4 | Solo React dev can ship playable prototype in 2 weeks |

---

## Candidate Gameplay Loops

### Candidate 1: 🏪 "Run a Place" Engine-Builder

**One-liner:** Run a stats observatory (or coffee shop / lab). Each room is a data pipeline stage. You allocate staff (your stat-skill cards) to rooms to process incoming datasets.

**Core loop:** An inbound dataset arrives (e.g., "survey of 40 students' exam scores"). Rooms in your lab need to be staffed with skill cards to process it: a "Describe" room (mean/median/mode), a "Visualize" room (histogram, boxplot), a "Test" room (t-test, chi-square). Each skill card has stats prerequisites. Wrong assignment = wrong output = client unhappy.

**How stats is the decision:** You pick WHICH statistical procedure to apply to WHICH data type. If the data is ordinal and you send it to the parametric-test room, the room produces an error. You must choose the right tool for the right job — that choice IS the stats.

**Decision interval:** ~20s (decide which room gets which card, watch result).

**Stats concept used:** Scale of measurement → choice of test; assumptions checking; descriptive vs. inferential.

**Board game inspiration:** Century Spice Road — resource pyramid where higher outputs require lower-level ingredients. Here: raw data → clean data → described data → tested hypothesis.

**Mobile game inspiration:** Mini Metro — allocate resources (lines/stations) in real-time as demand grows.

**Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 4 | One assignment decision every 15-20s |
| Stats-use depth | 4 | Procedure selection is genuine stats reasoning |
| Engine-building energy | 5 | Better lab layout compounds throughput |
| Wonder tap | 3 | Lab/observatory theme is satisfying but not magic |
| Hebrew/mobile fit | 3 | Lab-card UI works on mobile but complex |
| Decoration risk | 2 (LOW) | Rooms must process data — cosmetics are structural |
| Scope realism | 3 | 2-week prototype possible but tight |

**Total (weighted):** 4×5 + 4×5 + 5×4 + 3×4 + 3×3 + 2×4 + 3×4 = 20+20+20+12+9+8+12 = **101 / 145**

---

### Candidate 2: 🧸 Collection Asymmetric Brawler

**One-liner:** Collect stat-creatures (or "data spirits"), each with a unique mechanic representing one statistical concept. Tribe-leader (Arctic Scavengers) choice frames your collection's identity.

**Core loop:** You choose a tribe-leader (e.g., "Frequentist" vs "Bayesian" vs "Nonparametric"). Each creature card you collect has a unique battle mechanic that IS the stats concept. "Confidence Interval Golem" wins if opponent's sample mean falls outside your CI. "Central Limit Theorem Sprite" grows stronger as n increases.

**How stats is the decision:** To WIN a battle, you must understand what your creature's mechanic actually means statistically. Deploying "Normal Curve Drake" against an ordinal dataset means it can't activate.

**Decision interval:** ~25s per battle turn.

**Stats concept used:** Concept-specific mechanics — each creature embodies one concept asymmetrically.

**Board game inspiration:** Stuffed Fables — per-encounter unique mechanic. Arctic Scavengers — tribe-leader asymmetry.

**Mobile game inspiration:** Pokémon (collection + type-matchup = concept fit).

**Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 3 | Battle turns can drag; depends on design |
| Stats-use depth | 5 | Each creature IS a stats concept mechanically |
| Engine-building energy | 4 | Collection grows, tribe synergies emerge |
| Wonder tap | 5 | Creature collection has strong wonder-tap |
| Hebrew/mobile fit | 4 | Card game works mobile-first naturally |
| Decoration risk | 3 (MEDIUM) | Risk: creatures become cosmetic if battle mechanics aren't tight |
| Scope realism | 2 | Asymmetric creature mechanics = huge design surface |

**Total (weighted):** 3×5 + 5×5 + 4×4 + 5×4 + 4×3 + 3×4 + 2×4 = 15+25+16+20+12+12+8 = **108 / 145**

---

### Candidate 3: ⚙️ Pre-Commit Programming Puzzle

**One-liner:** Sequence the steps of a statistical analysis BEFORE running it. Like Mechs vs Minions: you pre-program a pipeline, then watch it execute on real data, and diagnose what went wrong.

**Core loop:** You receive a dataset and a research question. You drag statistical operations into a pipeline in order: [Clean] → [Describe] → [Test] → [Interpret]. Then you hit RUN and watch it execute step-by-step. If you put a t-test before checking normality, the test flags a warning. If you put regression before checking correlation, the model is overfit. You then debug and re-run.

**How stats is the decision:** Ordering statistical procedures correctly IS the core stats skill for research methods. The decision is sequencing, not answering questions.

**Decision interval:** ~30s to program pipeline, then ~10s per step to watch (immediate feedback loop).

**Stats concept used:** Statistical procedure sequencing; assumption-checking; research methods workflow.

**Board game inspiration:** Mechs vs Minions — pre-commit command sequence, watch execution, diagnose errors, re-program.

**Mobile game inspiration:** Reigns — commit to a sequence, watch consequences unfold.

**Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 4 | Programming phase ~30s; watching is fast |
| Stats-use depth | 5 | Sequencing IS the stats workflow skill |
| Engine-building energy | 3 | Better pipelines unlock harder datasets |
| Wonder tap | 4 | Watching pipeline execute is satisfying |
| Hebrew/mobile fit | 3 | Pipeline builder needs careful RTL design |
| Decoration risk | 1 (VERY LOW) | Pipelines either work or they don't — no XP soup risk |
| Scope realism | 4 | Core mechanic is drag-and-drop pipeline — 1 week to prototype |

**Total (weighted):** 4×5 + 5×5 + 3×4 + 4×4 + 3×3 + 1×4 + 4×4 = 20+25+12+16+9+4+16 = **102 / 145**

---

### Candidate 4: 🏨 Real-Time Triage

**One-liner:** NPCs arrive with statistical needs (Coffee Rush pacing). You decide which to serve first under a timer. Each NPC's need requires applying a specific statistical test/concept.

**Core loop:** The queue fills with "patients": researcher needing to know if their groups differ (t-test), student who collected ordinal data and wants to compare (Mann-Whitney), journalist who wants to know if two variables are related (correlation). You decide priority — serving the wrong patient with the wrong tool fails them.

**How stats is the decision:** Matching the right statistical tool to each NPC's data type and question IS the decision.

**Decision interval:** ~10–15s (real-time queue management).

**Board game inspiration:** Coffee Rush — real-time triage, order-matching under pressure.

**Mobile game inspiration:** Overcooked / Diner Dash — priority queue management.

**Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 5 | Continuous real-time decisions |
| Stats-use depth | 4 | Tool-matching is genuine stats, but repetitive |
| Engine-building energy | 2 | Little compounding — each NPC is fresh |
| Wonder tap | 3 | Triage theme is functional, not wondrous |
| Hebrew/mobile fit | 3 | Real-time UI on mobile is risky |
| Decoration risk | 2 (LOW) | Serving wrong NPC has clear consequence |
| Scope realism | 3 | Real-time loop adds complexity |

**Total (weighted):** 5×5 + 4×5 + 2×4 + 3×4 + 3×3 + 2×4 + 3×4 = 25+20+8+12+9+8+12 = **94 / 145**

---

### Candidate 5: 🎲 Mutable-Dice Engine (★ STRONG CONTENDER)

**One-liner:** You start with primitive dice (one face = each value). You upgrade individual faces by applying mastered statistical concepts. Each roll IS a random sample. You craft the distribution you roll from.

**Core loop:** You have 3 dice. Roll them → observe your "data". Your goal is to achieve a target distribution shape (shown visually). To get there, you must upgrade specific faces: add a new value, shift the center, increase spread, or reduce variance. Each upgrade is purchased by correctly answering one question ABOUT the concept you're applying. Once upgraded, every future roll uses that concept automatically.

**How stats is the decision:** You decide WHICH parameter to change (mean? variance? shape?) to get closer to the target distribution. That decision requires understanding what mean/variance/skew actually DO to a distribution.

**Decision interval:** ~20s (roll → observe → decide which face to upgrade → question → upgrade → roll again).

**Stats concept used:** Parameters of a distribution; mean/median/variance/skew; sampling; CLT (as you add more dice faces, the combined result gets more normal).

**Board game inspiration:** Dice Forge — literal dice face replacement mechanic. Player CRAFTS their dice.

**Mobile game inspiration:** Threes — small moves, emergent compounding. Each face upgrade is a "small move" that compounds.

**Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 5 | Roll → observe → upgrade cycle is fast |
| Stats-use depth | 5 | Changing distribution parameters IS understanding distributions |
| Engine-building energy | 5 | Every upgrade makes future rolls produce better data |
| Wonder tap | 5 | Watching your distribution emerge from rolls is magical |
| Hebrew/mobile fit | 4 | Dice UI works perfectly on mobile; RTL ok |
| Decoration risk | 1 (VERY LOW) | Dice faces ARE the stats — no decorative layer possible |
| Scope realism | 4 | 3 dice + face-upgrade UI + roll animation = 1–2 week prototype |

**Total (weighted):** 5×5 + 5×5 + 5×4 + 5×4 + 4×3 + 1×4 + 4×4 = 25+25+20+20+12+4+16 = **122 / 145**

---

### Candidate 6: 🌶 Pickup-and-Deliver Engine

**One-liner:** Trade up a resource pyramid where lower-level statistical concepts are ingredients for higher-level ones. Century Spice Road mechanic directly maps to stats prerequisites.

**Core loop:** You hold resource cards (raw data, clean data, descriptive statistics, inferential statistics). You travel between "cities" (topic nodes) to trade up. To run a t-test, you need 2× "described samples" + 1× "normality check". To do regression, you need "correlation insight" + "described variables". Trading routes = paths through the stats curriculum.

**How stats is the decision:** Deciding which topic to trade toward next requires understanding the statistical prerequisite graph.

**Decision interval:** ~25–30s per trade.

**Board game inspiration:** Century Spice Road — resource pyramid trade-up. Catan — trade window.

**Mobile game inspiration:** Mini Metro — route optimization.

**Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 3 | Trade decisions are infrequent |
| Stats-use depth | 3 | Prerequisite awareness is useful but shallow |
| Engine-building energy | 4 | Better trade routes emerge as you master topics |
| Wonder tap | 2 | Trading cards is functional but not wondrous |
| Hebrew/mobile fit | 4 | Card game works mobile |
| Decoration risk | 3 (MEDIUM) | Risk: trading feels like menu navigation, not stats |
| Scope realism | 4 | Card trade UI is achievable |

**Total (weighted):** 3×5 + 3×5 + 4×4 + 2×4 + 4×3 + 3×4 + 4×4 = 15+15+16+8+12+12+16 = **94 / 145**

---

### Candidate 7: 🕴 Influence + Bluff (Godfather Style)

**One-liner:** Place influence tokens on statistical "schools" (frequentist, bayesian, nonparametric). Hidden objectives. Bluff which school you're building toward.

**How stats is the decision:** You must understand what each school IS to place influence in the right territories.

**Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 3 | Turn-based, moderate pacing |
| Stats-use depth | 2 | School-choice is meta, not direct stats use |
| Engine-building energy | 3 | Influence builds but hidden info adds luck |
| Wonder tap | 2 | Political placement isn't wondrous |
| Hebrew/mobile fit | 3 | Placement games are ok on mobile |
| Decoration risk | 4 (HIGH) | Risk: territory control becomes purely strategic, stats is decoration |
| Scope realism | 3 | Bluffing mechanics are hard to design right |

**Total (weighted):** 3×5 + 2×5 + 3×4 + 2×4 + 3×3 + 4×4 + 3×4 = 15+10+12+8+9+16+12 = **82 / 145**

---

### Candidate 8: 🧵 Spatial-Tiling Daily (Patchwork × Wordle)

**One-liner:** Daily puzzle — place stats-knowledge tiles on a grid under time-and-cost budget. Each tile represents a statistical concept; adjacencies create synergies (or contradictions).

**Core loop:** You have a 7×7 grid. You must cover it with tiles. Each tile is a stats concept. Some tiles are "compatible" (normal + t-test fit together). Some are "contradictory" (chi-square + continuous-data creates a gap). You have a budget of 10 "attention points" and 90 seconds. Best coverage wins.

**How stats is the decision:** Choosing which concept tiles to place next to each other requires understanding which stats concepts are related (prerequisite or complementary).

**Decision interval:** ~5s per tile placement (very fast, Wordle-style).

**Board game inspiration:** Patchwork — spatial tiling under button budget. Azul — pattern completion.

**Mobile game inspiration:** Two Dots — spatial chain selection. Wordle — daily constraint puzzle.

**Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 5 | Tile placement is very fast |
| Stats-use depth | 3 | Concept-relationship awareness is stats-adjacent, not deep stats |
| Engine-building energy | 3 | Daily format limits compounding |
| Wonder tap | 4 | Satisfying spatial completion + daily ritual |
| Hebrew/mobile fit | 5 | Tile grid works perfectly RTL/mobile |
| Decoration risk | 3 (MEDIUM) | Risk: tiling becomes aesthetic optimization, not stats |
| Scope realism | 5 | Tile grid is the simplest prototype to build |

**Total (weighted):** 5×5 + 3×5 + 3×4 + 4×4 + 5×3 + 3×4 + 5×4 = 25+15+12+16+15+12+20 = **115 / 145**

---

### Candidate 9 (INVENTED): 🔬 Sample-and-Decide (Push-Your-Luck × Hypothesis Testing)

**One-liner:** You are a researcher deciding when to STOP collecting data. Each "sample more" action costs resources but increases certainty. You decide when your evidence is strong enough to publish.

**Core loop:** A hypothesis is shown (e.g., "new teaching method improves scores"). You click "collect sample" — a new data point appears, your confidence interval updates. You watch the CI narrow with each sample. Your opponents are collecting too. First one to publish wins — but if your result is a Type I error (false positive), you lose points. You must decide: keep sampling or publish now?

**How stats is the decision:** Stopping-rule reasoning IS the decision. You are directly managing Type I error, power, and sample size — the core of hypothesis testing intuition.

**Decision interval:** ~15s per sample-or-publish decision.

**Stats concept used:** Confidence intervals, p-values, sample size, statistical power, Type I/II error, stopping rules.

**Board game inspiration:** Quacks of Quedlinburg — push-your-luck with informative failure. When to stop pulling chips (samples).

**Mobile game inspiration:** Tomb of the Mask — escalating risk-reward with each push.

**Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 5 | Push-or-stop every 10-15s |
| Stats-use depth | 5 | Stopping rules ARE the core insight of hypothesis testing |
| Engine-building energy | 4 | Better stopping intuition → more wins → better equipment |
| Wonder tap | 4 | Watching your CI narrow is visually satisfying |
| Hebrew/mobile fit | 5 | Simple UI; single big tap = "collect more" |
| Decoration risk | 1 (VERY LOW) | The game BREAKS if you don't use stats to decide — no XP soup possible |
| Scope realism | 5 | Core mechanic: show CI + "collect" button + "publish" button |

**Total (weighted):** 5×5 + 5×5 + 4×4 + 4×4 + 5×3 + 1×4 + 5×4 = 25+25+16+16+15+4+20 = **121 / 145**

---

### Candidate 10 (INVENTED): 🏗️ Distribution Architect (Spatial × Dice Forge × Engine-Builder)

**One-liner:** Combine Dice Forge's "craft your distribution" with a spatial map. You build a city where every building IS a statistical parameter. The city's skyline IS a histogram.

**Core loop:** You have a grid. Each cell is a value bucket (like a histogram bar). You place "building blocks" to increase frequency in a bucket. Your city IS your distribution. You get challenges: "reach a mean of 7.2 with variance < 3". To do that you must add/remove blocks (data points) — but blocks cost action tokens. Each turn you can also deploy "modifier cards" (add outlier, apply transformation, normalize) that require answering one concept question to activate. The city's shape IS the score.

**How stats is the decision:** Every architectural choice is a stats choice. Adding a block to bucket 8 raises the mean. Adding symmetric blocks to both tails raises variance. You must visualize the effect of changes on the distribution parameters.

**Decision interval:** ~15s per block placement.

**Stats concept used:** Distribution shape, mean, median, variance, skew, kurtosis, transformations.

**Board game inspiration:** Patchwork (spatial placement) × Dice Forge (building your distribution) × Wingspan (engine where city grows).

**Mobile game inspiration:** Mini Metro (visual elegance + spatial decisions).

**Scores:**

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 4 | Block placement + modifier card = 15s cycle |
| Stats-use depth | 5 | Distribution shape IS the city — every placement IS stats |
| Engine-building energy | 5 | City grows and becomes more complex every session |
| Wonder tap | 5 | Watching your histogram city grow is beautiful |
| Hebrew/mobile fit | 4 | Grid + blocks is mobile-friendly |
| Decoration risk | 1 (VERY LOW) | The city literally IS the distribution — impossible to decouple |
| Scope realism | 3 | Spatial grid + modifier cards is achievable but requires more design work |

**Total (weighted):** 4×5 + 5×5 + 5×4 + 5×4 + 4×3 + 1×4 + 3×4 = 20+25+20+20+12+4+12 = **113 / 145**

---

## Summary Scores Table

| # | Candidate | Decision Rhythm | Stats Depth | Engine Energy | Wonder Tap | HE/Mobile Fit | Decoration Risk | Scope | **TOTAL / 145** |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 🏪 Run a Place Engine | 4 | 4 | 5 | 3 | 3 | 2★ | 3 | **101** |
| 2 | 🧸 Collection Brawler | 3 | 5 | 4 | 5 | 4 | 3 | 2 | **108** |
| 3 | ⚙️ Pre-Commit Pipeline | 4 | 5 | 3 | 4 | 3 | 1★ | 4 | **102** |
| 4 | 🏨 Real-Time Triage | 5 | 4 | 2 | 3 | 3 | 2★ | 3 | **94** |
| 5 | 🎲 Mutable-Dice Engine | 5 | 5 | 5 | 5 | 4 | 1★ | 4 | **122** |
| 6 | 🌶 Pickup-Deliver | 3 | 3 | 4 | 2 | 4 | 3 | 4 | **94** |
| 7 | 🕴 Influence + Bluff | 3 | 2 | 3 | 2 | 3 | 4⚠️ | 3 | **82** |
| 8 | 🧵 Spatial-Tiling Daily | 5 | 3 | 3 | 4 | 5 | 3 | 5 | **115** |
| 9 | 🔬 Sample-and-Decide ★ | 5 | 5 | 4 | 4 | 5 | 1★ | 5 | **121** |
| 10 | 🏗️ Distribution Architect | 4 | 5 | 5 | 5 | 4 | 1★ | 3 | **113** |

★ Decoration Risk scored as LOW = best. ⚠️ = HIGH = worst.
★ Top three candidates: **#5 Mutable-Dice Engine (122), #9 Sample-and-Decide (121), #8 Spatial-Tiling Daily (115)**.

---

## Top-3 Ranking

### 1st Place: 🎲 Mutable-Dice Engine (Score: 122/145)

**Why #1:** Highest total score. The mechanic is pedagogically irreducible — you CANNOT play this game without understanding what parameters do to distributions. Rolling dice IS taking a random sample. Upgrading a die face IS applying a statistical concept to your sample space. The concept is structurally embedded in the game object (the die), not bolted on via quiz questions. Early upgrades compound into a richer distribution to roll from, creating engine-building energy. The visual of your histogram forming from rolls has genuine wonder tap. Decoration risk is near-zero because the die faces ARE the stats — remove the stats and there's no game.

**Decision it forces:** "Which distribution parameter do I change to get closer to the target shape?" = direct stats reasoning about mean, variance, skew.

**Target stats topics:** Distributions, parameters, sampling, probability, CLT (naturally emerges as you add dice).

---

### 2nd Place: 🔬 Sample-and-Decide (Score: 121/145)

**Why #2:** Near-perfect stats-depth score. Push-your-luck directly mirrors the logic of hypothesis testing and stopping rules — the most counterintuitive and frequently-failed concepts in intro statistics. The game mechanic IS the concept: students who understand p-values, power, and sample size will stop earlier (more confident) while novices will keep sampling or stop too soon. Mobile fit is excellent (one big tap). However, the thematic wrapper (researcher game) is less intrinsically wonder-tapping than crafting your own dice, and the session structure is more linear (one hypothesis per round).

---

### 3rd Place: 🧵 Spatial-Tiling Daily (Score: 115/145)

**Why #3:** Best scope-realism score and excellent mobile fit. The daily-ritual pattern (Wordle-style) creates habitual return without grind. However, the stats-use depth is weaker — placing tiles near each other based on "compatibility" tests concept-relationship knowledge, not deep parameter understanding. Risk: could become aesthetic optimization. Recommended as a **companion game mode** (daily puzzle) rather than the core loop.

---

## #1 Detailed Spec: Mutable-Dice Engine

### Title
**"הטלת הנתונים"** *(Ha-Talat HaNatoonim)* — "The Data Roll"
**Tagline:** Roll your sample. Forge your distribution.

---

### Core Game Loop (2–3 sentences)

You start with 3 primitive dice (each face = 1–6, uniform distribution). Each session, you receive a "target distribution" card showing a desired shape (e.g., skewed right, bimodal, narrow variance). You roll your dice to generate data, observe how far the resulting histogram is from the target, then spend "insight tokens" (earned by answering concept questions correctly) to upgrade specific die faces — changing the probability space you sample from.

---

### How Statistics IS the Decision

The player must decide: **which die face to upgrade, and with what value, to shift the resulting distribution toward the target shape.** To make that decision correctly, the player must understand:
- What increasing one face's frequency does to the mean
- What spreading values apart does to variance
- Why adding two dice together (instead of one) produces a more normal-looking result (CLT)
- Why removing extreme values narrows the tails

There is no "answer a question to proceed." The question is always **"what do I need to change about my distribution, and which die operation achieves it?"**

---

### Session Structure (5-min session)

```
0:00 – 0:30  | Target distribution shown. 3 dice displayed. "Roll" button visible.
0:30 – 1:00  | Player rolls. Histogram updates in real time. Gap score shown.
1:00 – 2:00  | Player selects a die face to upgrade. Concept question triggered.
              | e.g.: "Changing face 6→8 will [increase/decrease] the mean. Why?"
              | Player answers (correct = face upgrades; wrong = try again, no penalty).
2:00 – 2:30  | Roll again. Watch histogram shift. Gap score narrows (or not).
2:30 – 4:30  | Repeat: roll → observe → upgrade cycle × 3 more times.
4:30 – 5:00  | Final roll. Gap score evaluated. "Mastery XP" for concepts used correctly.
              | City building updated: die upgrade cards become building blueprints in city.
```

---

### Mechanic Breakdown — 5 Game Nouns

| Noun | What it is | Stats mapping |
|---|---|---|
| **Die** | A physical die (3D rendered, interactive) with 6 upgradeable faces | Sample space = the distribution you draw from |
| **Die Face** | Each face holds a value and a frequency weight | Face value = data point; frequency = probability |
| **Insight Token** | Earned by correctly answering a concept question | "Understanding" as a resource |
| **Target Card** | Shows a target distribution shape as a histogram outline | Research question / hypothesis about distribution shape |
| **Gap Score** | Visual distance between your histogram and the target | Fit metric — like a real goodness-of-fit test |

---

### Stats Concept Mapping

| Statistical Concept | Game noun / moment |
|---|---|
| Mean | Upgrading faces shifts the center of your histogram |
| Variance | Spreading face values apart widens the histogram |
| Skew | Adding more high-value faces tilts the histogram right |
| Sampling (random variable) | Every roll is a random sample from your die's probability space |
| Probability distribution | The die IS the distribution — faces × frequencies = PMF |
| Central Limit Theorem | Adding a 3rd die: their SUM forms a normal curve (player can observe this happening) |
| Law of Large Numbers | Rolling more times → histogram converges to true distribution |
| Uniform distribution | Starting dice (default faces) — first concept taught implicitly |
| Transformations | Face upgrade cards that apply functions (x² face, log-face) for later levels |

---

### Decision Interval

**~20 seconds per decision point.**
- 5s to roll and observe
- 10s to decide which face to upgrade and why
- 5s for the concept question

This aligns with Anki interval research cited in VISION.md (one meaningful decision every 15–30s).

---

### Failure Mode

**Wrong answer on concept question:** Die face does NOT upgrade. Player rolls again to see the gap hasn't improved. This is informative: "I thought adding a 10-face would lower the mean — it didn't, because there are still five 1-faces pulling it down." No penalty beyond "waste of a roll." Player can retry the same upgrade immediately.

**Wrong upgrade strategy:** Player upgrades variance when they needed to shift the mean. Gap score worsens in the wrong dimension. The visual histogram shows exactly which dimension is off.

**Session ends with large gap:** The target card carries forward to the next session. No loss — the dice you upgraded remain upgraded. Progress is preserved; only the specific target rotates.

---

### Progression Arc

**First session (Day 1):**
- 3 dice, 6 faces each = uniform distribution
- Target: "get your histogram closer to this bell curve"
- Player adds face values via mean-shift questions
- Concept practiced: mean, uniformity, what "center" means

**Week 1 (Sessions 2–7):**
- More die faces available (faces can be duplicated = increase frequency)
- Target cards introduce: skewed right, high variance, bimodal
- Concepts practiced: median (vs mean), variance, skew
- Die face upgrade library expands: "add a face at value X", "duplicate face Y", "remove face Z"

**Week 2 — engine kicks in:**
- Player earns a 3rd die. Rolling 3 dice = sum of 3 random variables.
- CLT emerges organically: the SUM histogram starts looking normal even when individual dice are skewed
- Concept practiced: CLT, independence, sampling distributions
- City visualization updates: the upgraded dice form building blueprints in the 3D city

**Mastery (end of topic arc):**
- Continuous distributions introduced (faces replaced by sliders)
- Normal, t, chi-square distributions become "dice skins" the player crafts toward
- Hypothesis testing introduced: "does your distribution match the null hypothesis distribution?"
- Connects naturally to the Sample-and-Decide (Candidate #9) as a companion game mode

---

### Implementation Primitives

**State (Zustand):**
```typescript
interface DieState {
  id: string
  faces: DieFace[]  // { value: number; weight: number }[]
}

interface DieGameState {
  dice: DieState[]
  targetDistribution: number[]  // target histogram bins
  rollHistory: number[][]       // last N rolls
  currentHistogram: number[]    // observed frequency per bucket
  gapScore: number
  insightTokens: number
  sessionComplete: boolean
}
```

**Components needed:**
- `DieRenderer3D` — R3F die with face values shown; click face to select for upgrade
- `HistogramDisplay` — realtime bar chart: current vs target overlay
- `RollButton` — big CTA, bottom of screen, thumb-zone
- `FaceUpgradeModal` — bottom-sheet (not modal-on-modal), shows concept question
- `GapScoreIndicator` — persistent banner showing current vs target gap

**Pure logic (testable with Vitest):**
- `computeHistogram(rolls: number[]): number[]`
- `computeGapScore(current: number[], target: number[]): number`
- `rollDice(dice: DieState[]): number[]`
- `upgradeFace(die: DieState, faceIndex: number, newValue: number): DieState`
- `computeMean(data: number[]): number`
- `computeVariance(data: number[]): number`

**Feature flag:** `MUTABLE_DICE_GAME` in `src/config/featureFlags.ts`

---

### Board Game Inspiration

**Dice Forge (Libellud, BGG/224517):**
Mechanic borrowed: literal die face replacement. In Dice Forge, players buy face tokens and physically press them onto their dice, changing the probability space they draw resources from. The GAME is building the die, not what you do after rolling. WaffleStack borrows this exactly: upgrading a face IS the core action, and rolls show consequences.

**Quacks of Quedlinburg (Schmidt Spiele):**
Push-your-luck pattern: each roll generates data, and the player must decide when they've "seen enough" to commit to an upgrade decision — parallels the stopping-rule intuition from Sample-and-Decide (Candidate #9), which this could later fuse with.

---

### Mobile Game Inspiration

**Threes (Sirvo):**
Feedback pattern borrowed: small moves compound in non-obvious ways. Each die face upgrade (like each swipe in Threes) seems minor but cascades into dramatically different distributions. The visual delight of watching small changes produce big emergent shapes mirrors Threes' "aha!" when small tiles merge into unexpected numbers.

**Dice with Buddies / Yatzy:**
One-handed play pattern: roll → observe → pick best action → roll again. Fast cycle that works on mobile with one thumb.

---

### Why NOT the Others

**vs. Sample-and-Decide (#2, 121 pts):**
Sample-and-Decide is brilliant for hypothesis testing but covers a narrower concept band (stopping rules / p-values). Mutable-Dice covers ALL of probability and distributions. The two loops are **complementary** — Mutable-Dice as the core engine, Sample-and-Decide as the "boss battle" when the player has enough distribution mastery to test hypotheses. Recommend building Mutable-Dice first.

**vs. Spatial-Tiling Daily (#3, 115 pts):**
The daily format creates ritual return but doesn't produce the deep parameter understanding that Mutable-Dice does. Spatial-Tiling tests concept-relationship knowledge (is t-test compatible with normal distribution?), which is useful but shallower. Build this as a daily companion mode after the core die engine ships.

---

## Open Questions for Barak

1. **Hebrew title:** "הטלת הנתונים" (Ha-Talat HaNatoonim) — does this resonate? Alternative: "גלגל הנתונים" (Galgal HaNatoonim = "Data Roller") feels more playful. Which pulls stronger?

2. **3D die vs 2D:** The spec assumes a 3D R3F die. Would a stylized 2D die be faster to prototype and equally delightful? 3D gives more spatial feedback but adds render complexity.

3. **Opponent / competitive element:** Should the player be competing against a "null hypothesis die" (matching the default uniform distribution) rather than a target card? This adds adversarial framing without needing multiplayer.

4. **Integration with existing XP/buildings:** Should mastered die faces become building blueprints in the 3D city (reusing the existing city component)? Possible integration hook between new game and existing city visualization.

5. **Concept question format:** The spec uses simple multiple-choice for concept questions triggered by upgrades. Should these be the existing quiz bank questions, or new context-specific questions (e.g., "You're about to add face value 8. What effect will this have on the mean?")?

---

*Opus 4.7 call was dispatched at cycle start but returned HTTP 529 Overloaded (server-side, not a design decision). Sonnet 4.6 synthesis above is the primary design record for this cycle. Opus call should be retried at the start of Cycle 2 to validate or challenge this ranking.*
