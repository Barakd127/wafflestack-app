# WaffleStack — Proactive Cycle 01: Gameplay Space Exploration

**Branch:** `proactive/exploration/games-design-space`  
**Date:** 2026-05-30  
**Cycle type:** Exploration only — no code produced  
**NotebookLM:** SKIPPED — MCP connector not available in this container. VISION.md catalogue + design judgment used instead.

---

## Context: The Problem With the Current Loop

The current loop is: answer question → XP → cosmetic building unlocks in the 3D city.

VISION.md explicitly calls this out as the **city builder locked-in risk**: "decoration not decision unless buildings consume/produce resources." The player is never required to *use* statistics to make a meta-game decision. They recall definitions, watch numbers increment, and see buildings appear. That is gamification, not gameplay.

The target: at least one meaningful decision every 15–30 seconds that *requires* the statistical concept being learned — not adjacent to it.

---

## Evaluation Criteria

Each candidate is scored 1–5 on:

| Criterion | What it means |
|---|---|
| **Decision rhythm** | Fits intro-stats cadence (~15–30s per choice); not overwhelming |
| **Wonder-tap** | Emotional pull; something surprising, beautiful, or thrilling |
| **Engine-building** | Early choices compound into later power |
| **Direct stats use** | Player USES the concept, not just recalls it |
| **Low decoration risk** | Hard to hollow into pure cosmetics (5 = most resistant) |
| **Hebrew mobile feasibility** | RTL, bottom-sheet, thumb-zone, 44pt targets |

---

## Candidate Roster (8 candidates)

### A. Mutable Dice Engine
**Inspired by:** Dice Forge (BGG) × Mini Metro (mobile)  
**Concept:** Player starts with flat-probability dice. Each mastered stats concept upgrades a die face — a "normal distribution face" means sampling mini-puzzles spawn when rolled. Before each study session the player rolls upgraded dice; the dice determine which concepts appear AND which special abilities are active. The player literally crafts their own probability distribution and then studies inside it.  
**Decision:** After each concept mastered, which die face to upgrade? This is an expected-value optimization over the player's own probability space.  
**Stats used:** Probability distributions, sampling, expected value  
**Decision interval:** ~15 seconds

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 4 | ~15s upgrade beats crisp, but rolling-then-studying splits attention |
| Wonder-tap | 4 | Crafting your own dice is tactile; "what will I roll?" pull is real |
| Engine-building | 5 | Early faces multiply value of every later session |
| Direct stats use | 4 | Player builds a probability distribution and lives inside it |
| Low decoration risk | 4 | Die faces *produce* content, hard to hollow |
| Hebrew mobile | 3 | Many tiny dice faces fiddly in thumb-zone; RTL dice tray awkward |
| **Total** | **24/30** | |

---

### B. Pre-Commit Stats Pipeline
**Inspired by:** Mechs vs Minions (BGG) × Threes (mobile)  
**Concept:** Each day presents a data scenario ("a researcher collected survey data from 2 groups — does Group A score higher?"). Player commits a sequence of 4–6 pipeline steps *before* seeing data: [Collect → Clean → Describe → Choose Test → Interpret → Report]. After commit, the pipeline executes step by step; wrong step = visible error at that stage. Retry with corrected pipeline.  
**Decision:** Which pipeline steps, in what order, before committing blind.  
**Stats used:** Test selection, prerequisite understanding, procedure knowledge  
**Decision interval:** ~25 seconds per step during drafting

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 3 | Committing 4–6 steps before feedback is heavy for intro cadence |
| Wonder-tap | 2 | Pipeline executing is satisfying but not wondrous; feels like homework |
| Engine-building | 3 | Unlocked cards help but pipeline is mostly skill, not compounding state |
| Direct stats use | 5 | Forces test-selection reasoning — the single highest-value stats skill |
| Low decoration risk | 2 | Can collapse into "pick the right multiple-choice order" |
| Hebrew mobile | 4 | Vertical step list is RTL-clean and bottom-sheet native |
| **Total** | **19/30** | |

---

### C. Push-Your-Luck Sampling ⭐ **WINNER**
**Inspired by:** Quacks of Quedlinburg (BGG) × Two Dots (mobile)  
**Concept:** Player faces a research question with a hidden true answer. They draw sample tokens one at a time from a bag. Each draw reveals a data point, costs budget (coins + clock), and visibly narrows a confidence interval band. At any moment: **Draw again** (more certainty, costs more) or **Commit** (stake your conclusion now). Draw too greedily → bust (budget exhausted, turn forfeited). The bag's composition reflects the true effect size — small effects are genuinely noisy, exactly mirroring sampling error.  
**Decision:** *When do I stop sampling?* Live cost-benefit optimization under uncertainty. There is no memorizable correct answer.  
**Stats used:** Sample size, confidence intervals, stopping rules, Type I/II error, effect size, expected value  
**Decision interval:** ~10 seconds per draw

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 5 | ~10s draw/commit beats perfect for intro cadence |
| Wonder-tap | 4 | Bag-draw tension is genuinely thrilling; "one more sample?" pull is real |
| Engine-building | 3 | Bag upgrades compound over time; moderate |
| Direct stats use | 5 | Player *physically enacts* the core inferential trade-off |
| Low decoration risk | 5 | Statistics ARE the mechanic — impossible to hollow |
| Hebrew mobile | 5 | Single Draw button + Commit, ideal thumb-zone bottom sheet |
| **Total** | **27/30** | |

---

### D. Run-Your-Own-Lab Engine-Builder
**Inspired by:** Coffee Rush (BGG) × Reigns (mobile), with Viticulture worker-placement energy  
**Concept:** Player owns a "Stats Lab." Statistical clients arrive with data problems. Player allocates time/sample/compute resources and selects the right test per client. Wrong test = failed client, reputational damage. Correct + fast = bonus reward. Catan-style trading window: swap unused sample tokens with NPCs to fill dataset gaps.  
**Decision:** Which client to serve, which test to apply, how to allocate limited resources.  
**Stats used:** Test selection for scenario, resource/sample-size allocation, effect-size intuition  
**Decision interval:** ~20 seconds

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 4 | ~20s client beats, manageable |
| Wonder-tap | 5 | Directly hits VISION's #1 daydream ("run your own cool place") |
| Engine-building | 5 | Lab upgrades compound efficiency; deep engine |
| Direct stats use | 4 | Test-selection + resource allocation — strong but allocation can dilute pure stats |
| Low decoration risk | 3 | Risk that "lab" becomes cosmetic wrapper around a quiz — same trap as the city |
| Hebrew mobile | 3 | Multi-client dashboard dense; RTL resource trays cramped |
| **Total** | **24/30** | |

---

### E. Spatial-Tiling Concept Map
**Inspired by:** Patchwork (BGG) × Wordle (browser daily)  
**Concept:** Daily puzzle: a 5×5 concept-relationship grid. Player holds 5 tiles per turn; each tile = a conditional relationship ("assumes normality → use parametric test"). Place tiles to fill the grid under a budget (time × cost). Aesthetic satisfaction when grid fits perfectly; gaps remain visible as knowledge holes.  
**Decision:** Which tile to place where under budget constraints.  
**Stats used:** Prerequisite and assumption relationships between tests  
**Decision interval:** ~15 seconds per tile

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 4 | ~15s per tile fine |
| Wonder-tap | 3 | Patchwork fit-satisfaction is pleasant, not gripping |
| Engine-building | 1 | Daily reset kills compounding — fatal weakness |
| Direct stats use | 3 | Conceptual relationships, but passive (arrange not apply) |
| Low decoration risk | 3 | Gaps-as-knowledge-holes clever but static |
| Hebrew mobile | 4 | Grid + tile hand works in RTL |
| **Total** | **18/30** | |

---

### F. Influence Map / Territory Control
**Inspired by:** Godfather: Corleone's Empire (BGG) × Duolingo leagues (mobile)  
**Concept:** Four stats territories: Descriptive, Probability, Inference, Regression. Player places influence tokens (earned by answering questions) to claim majorities. Majority in a school → special power (extra hints, XP multiplier, harder content unlock). Answering wrong weakens influence in that territory.  
**Decision:** Which territory to contest; which questions to prioritize.  
**Stats used:** Chosen by the territory being contested (player-directed learning path)  
**Decision interval:** ~20 seconds

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 3 | ~20s placements fine but abstract |
| Wonder-tap | 2 | Token majorities are dry; low wonder |
| Engine-building | 4 | Influence compounds |
| Direct stats use | 2 | Stats topic is a label on territory — weakest direct use |
| Low decoration risk | 1 | Almost pure meta-layer on a quiz; highest decoration risk of all candidates |
| Hebrew mobile | 3 | Territory map hard in RTL thumb-zone |
| **Total** | **15/30** | |

---

### G. Deck-Building with School Identity
**Inspired by:** Seize the Bean (BGG) × Arctic Scavengers asymmetric tribe leaders (BGG) × Pokémon Go (mobile)  
**Concept:** At start, player chooses a "stats school" leader (Frequentist / Bayesian / Nonparametric). Each school starts with a different deck. Correct answers add matching cards; play cards from hand to tackle "scenario challenges" beyond bare questions. School choice shapes the entire deck trajectory.  
**Decision:** Which cards to play, which to draft for the deck, which school identity to commit to.  
**Stats used:** Matching tool to problem; school philosophy in practice  
**Decision interval:** ~20 seconds

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 4 | ~20s card decisions fine |
| Wonder-tap | 4 | School identity ("I am a Bayesian") is a strong customize-my-thing pull |
| Engine-building | 5 | Deck deepening is the canonical engine-builder |
| Direct stats use | 4 | Matching tool to problem — good; but card abstraction can distance the math |
| Low decoration risk | 3 | Deck-builders can drift into stat-on-card-text recall |
| Hebrew mobile | 3 | Hebrew card text in hand + draft is dense; RTL card layout fiddly |
| **Total** | **23/30** | |

---

### H. Real-Time Triage Dashboard
**Inspired by:** Coffee Rush (BGG) × Plants vs Zombies (mobile)  
**Concept:** Multiple statistical clients arrive simultaneously. Player decides who to serve first under time pressure. Urgency + complexity + reward vary per client.  
**Decision:** Priority ordering under time pressure.  
**Stats used:** Rapid test identification  
**Decision interval:** ~5 seconds

| Criterion | Score | Notes |
|---|---|---|
| Decision rhythm | 1 | ~5s under pressure hostile to intro learners; punishes thinking |
| Wonder-tap | 3 | Frantic fun but stress-coded |
| Engine-building | 1 | Weak |
| Direct stats use | 3 | Rapid identification — shallow |
| Low decoration risk | 3 | Moderate |
| Hebrew mobile | 3 | Multi-client RT dashboard is worst-case RTL/thumb layout |
| **Total** | **14/30** | |

---

## Master Scoring Summary

| Rank | Candidate | Total | Key strength | Key weakness |
|---|---|---|---|---|
| **1** | **C. Push-Your-Luck Sampling** | **27/30** | Stats ARE the mechanic | Engine-building only moderate |
| **2** | **A. Mutable Dice Engine** | **24/30** | Best engine-building; wonder | RTL mobile fiddliness |
| **2** | **D. Run-Your-Own-Lab** | **24/30** | Hits VISION daydream hardest | Same decoration risk as city |
| 4 | G. Deck-Building Schools | 23/30 | Deep engine; school identity | Card text density in Hebrew |
| 5 | B. Pre-Commit Pipeline | 19/30 | Strongest direct test-selection | Heavy cognitive load |
| 6 | E. Spatial-Tiling Daily | 18/30 | Satisfying aesthetics | No engine-building (daily reset) |
| 7 | F. Influence/Territory | 15/30 | Player-directed topic path | Highest decoration risk |
| 8 | H. Real-Time Triage | 14/30 | High decision density | Hostile to intro learners |

---

## Top-3 Ranking

1. **C — Push-Your-Luck Sampling ("The Sample Bag")** — The only candidate where the statistics *are* the mechanic: the core draw/commit decision is a live stopping-rule problem under uncertainty, which makes it structurally impossible to hollow into cosmetics. The ~10s cadence is the best fit for nervous intro learners, and the single-button bottom-sheet is ideal for Hebrew mobile.

2. **A — Mutable Dice Engine** — Strongest engine-building potential and genuine wonder (you build a probability distribution and live inside it), but the dual-loop structure (roll to determine session, then study inside it) adds cognitive overhead that may fracture the intro-learner experience.

3. **D — Run-Your-Own-Lab** — Hits VISION.md's headline emotional pull ("run your own cool place") most directly, and the engine is deep, but it carries the exact decoration risk that already hollowed the 3D city — without careful resource-constraint design, the "lab" becomes a cosmetic wrapper on a quiz.

---

## #1 Detailed Spec — "The Sample Bag" (Push-Your-Luck Sampling)

### Core mechanic

The player faces a Hebrew research question with a hidden true answer. Instead of being told the answer, they **draw sample tokens one at a time from a bag**. Each draw reveals a data point and visibly tightens an on-screen confidence interval band. Drawing costs a **research budget** (coins + a turn clock). At any moment the player may **Commit** (הכרע) their conclusion — reject/fail-to-reject, or directional ("A > B / no difference / B > A") — and stake the session reward, OR draw again for more certainty. Draw too greedily and they **bust**: budget runs out before committing, forfeiting the turn's reward. The bag's composition is governed by the scenario's true effect size, so small effects are genuinely noisy on small samples, exactly mirroring sampling error. The player is doing real inference under resource constraints, not reciting a definition.

### Session flow (8 steps)

1. **Scenario card slides up** (bottom-sheet): a one-line Hebrew research question + the statistical goal (estimate a mean / compare two groups / detect a proportion).
2. Player sees their **budget** (gold coin counter, top bar) and an **empty CI band** on the dot-strip canvas.
3. Player taps **שלוף / Draw** — one token animates out of the bag, plots onto a live dot-strip, and the CI band visibly contracts; budget decrements by 1.
4. After each draw the player decides: **שלוף שוב / Draw again** or **הכרע / Commit**. This is the core recurring decision.
5. On **Commit**, player selects their conclusion from 2–3 Hebrew options (e.g., "קבוצה א' גבוהה יותר / אין הבדל / קבוצה ב' גבוהה יותר").
6. **Reveal**: the true parameter line appears on the dot-strip (teal `#10b981`). If CI contains the true value, conclusion is evaluated; if CI excluded it (under-sampled), it flashes red `#ef4444`.
7. **Resolution screen**: correct + tight CI + budget remaining = full reward in gold `#FFD700`; correct but over-sampled = reduced reward; wrong = no reward + one-line Hebrew diagnostic explaining the specific error.
8. **Bag shelf** opens showing which upgrades charged this session. Player allocates upgrades earned, then next scenario.

### Concept → game action map

| Stats concept | In-game action |
|---|---|
| Sample size (n) | Each Draw increments n; player feels the marginal value of the next observation in real time |
| Sampling error / variance | Early draws scatter widely on the dot-strip; noise is *shown*, not stated |
| Confidence interval | The live band narrowing with every draw; width = remaining uncertainty |
| Stopping rule | The Draw-vs-Commit choice IS a stopping rule under a finite cost constraint |
| Type I error | Committing on a too-tight-but-wrong-tailed sample → "false positive" penalty |
| Type II error | Busting or under-sampling → failing to detect a real effect |
| Expected value | Reward curve: bonus for tight CI vs. cost of extra draws; an EV optimization |
| Effect size | Bag composition; large true effects let the player commit confidently early |
| Central Limit Theorem | "Batch draw" upgrade (unlocked later) shows the sampling distribution of the mean forming on screen |
| Statistical power | "Power lens" upgrade previews the bag's rough effect-size class, enabling strategic budget planning |

### The meaningful decision

**When to stop sampling.** This is a live cost-benefit optimization under uncertainty. Each draw narrows the CI but spends finite budget; the optimal stopping point depends on the effect size the player is inferring in real time from the data already drawn. There is no memorizable correct answer — a confident early commit on a large effect beats over-sampling, while a marginal effect demands patience. The player is reasoning about uncertainty structurally, not reciting a formula.

### Engine-building (what compounds)

Permanent **bag upgrades**, each gated by mastery of a specific concept, so early investment multiplies later sessions:

| Upgrade | Unlocked by mastering | Effect |
|---|---|---|
| Cleaner instruments | Standard deviation | Reduces measurement variance; tighter scatter per draw |
| Batch draw (×5) | Central Limit Theorem | Pull 5 tokens at once at a discount; large-n scenarios become viable |
| Power lens | Statistical power | Preview the bag's rough effect-size class before drawing; enables strategic budgeting |
| Pre-registration token | Hypothesis testing | Commit a hypothesis *before* drawing for a reward multiplier |
| Precision dial | Confidence intervals | Choose CI width (90/95/99%); tighter CI = larger reward multiplier but narrower commit window |

These chain: Cleaner Instruments + Power Lens together let an advanced player commit on 8 draws for scenarios a new player needs 20 for. The visible power difference is motivating rather than punishing — new players still succeed, just with lower bonuses.

SM-2 scheduling gates which concepts resurface, meaning upgrades are only "charged" when the player has genuinely practiced the underlying concept recently.

### Failure mode + recovery (never a wall)

- **Bust** (budget exhausted): turn ends; the true answer is *shown* with a plain-language Hebrew post-mortem ("האפקט היה קטן — היית זקוק לעוד ~20 משיכות"). No XP lost, only the turn bonus. This makes failure a calibrated lesson on statistical power, not a punishment.
- **Wrong commit**: diagnostic names the specific error (stopped too early / tail direction confusion). The same scenario type re-enters the SM-2 queue sooner.
- **Study-draw mode**: a struggling player can toggle "אימון" (practice) mode — draws are free (no budget), no reward, but confidence-interval behavior is identical. This removes the economic pressure while preserving the inference experience.

### Mobile-first screen layout (RTL, locked color tokens)

```
┌─────────────────────────────────────────────────────┐  ← bg: #0e0f12
│  [Research question in Hebrew, right-aligned RTL]    │
│  [Scenario goal pill: #3b82f6 blue]                  │
├──────────────────────────────────────────────────────┤
│  ████████████████████░░░░  Budget bar (gold→right)   │  ← #FFD700 depleting RTL
├──────────────────────────────────────────────────────┤
│                                                      │
│  Dot-strip + CI band (expands vertically as n grows) │  ← dots: #f59e0b amber
│                                                      │    CI band: #3b82f6 low opacity
│  [True value line appears here on Commit]            │  ← #10b981 teal (correct)
│                                                      │    #ef4444 red (wrong)
├──────────────────────────────────────────────────────┤
│  Bottom sheet (always above fold)                    │
│                                                      │
│  [הכרע / Commit] ←────────→ [שלוף / Draw]           │
│   #10b981 teal                 #3b82f6 blue          │
│                                                      │
│  (both 48px height, full-width halves — 44pt min)    │
└──────────────────────────────────────────────────────┘
```

Bag-upgrade shelf: swipe-up from the bottom sheet reveal area. Each upgrade card shows Hebrew name, locked-token indicator, current status. No hamburger menu. No modals-on-modals.

### Minimum playable prototype (≤1 sprint)

Single scenario type: **estimate one mean**.

1. Hardcode one bag: true μ = 72, σ = 12, n_tokens = 50.
2. Build: Draw button, animated dot-strip (D3 or plain SVG), live CI band narrowing (z = 1.96), budget counter.
3. Commit flow: 3-way Hebrew conclusion ("הממוצע מעל 70 / סביב 70 / מתחת ל-70"), reveal animation, one-sentence post-mortem.
4. No upgrades, no SM-2 wiring, no multi-scenario routing. Ship this single screen behind a feature flag.

**Validation gate:** If a test player says "I wanted to draw one more" after their first bust — the core tension is working. If they say "I don't understand why I'm drawing" — the framing failed and the scenario card needs more context.

### Decision interval
~10 seconds per draw/commit choice. Tunable up (reduce budget) for advanced scenarios to ~15–20s deliberate pacing.

### VISION.md emotional pulls tapped

- **Primary:** Mastery-for-its-own-sake (Brilliant/line 88) — you genuinely get better at judging uncertainty; the CI narrowing is viscerally satisfying as a measure of competence growth.
- **Secondary:** Beat-the-clock / daily tension (Wordle, Two Dots) — the press-your-luck thrill is the *same mechanism* as the statistical inference, not layered on top of it.
- **Deliberately avoids:** "Run your own cool place" daydream — the 3D city already over-indexed on this pull, and VISION.md flags it as the decoration trap.

---

## Open Questions for Cycle 2

1. **Bag metaphor in Hebrew:** "שק הדגימות" (sample bag) or a more thematic wrapper (telescope / petri dish / notebook)? The physical metaphor should match the scenario type (lab = petri dish, survey = clipboard, field study = binoculars).
2. **Budget currency:** Coins (generic) vs. a stats-themed resource like "research hours" (שעות מחקר). Thematic resonance vs. learner confusion.
3. **Multi-scenario routing:** Does the player choose which scenario to tackle (Catan-trade energy) or does SM-2 serve the next one automatically? Player choice = more agency; SM-2 automatic = better spaced repetition. Hybrid: SM-2 serves two options, player picks one.
4. **Integration with existing 3D city:** Keep it? Remove it? Replace buildings with "published research papers" that appear after each successful scenario? The city is currently decorative — this cycle's mechanic makes the city unnecessary, but removing it is a large regression risk.
5. **Sound design:** Should a correct commit have a different sound texture than a narrow-but-correct one? Nuanced audio feedback could reinforce the difference between "lucky commit" and "skilled commit."

---

*Exploration cycle complete. No code produced. Top candidate: C (Push-Your-Luck Sampling / "The Sample Bag"). Cycle 2 builds the minimum playable prototype for this mechanic behind a feature flag.*
