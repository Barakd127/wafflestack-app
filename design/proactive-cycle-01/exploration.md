# WaffleStack — Gameplay Loop Exploration (Cycle 1)

**Date:** 2026-05-22  
**Branch:** proactive/exploration/games-design-space  
**Cycle type:** Exploration only — no code produced  
**NotebookLM:** SKIPPED — MCP connector not available this container. Used VISION.md catalogue + design judgment.

---

## Context & Framing

WaffleStack's current loop has a well-known problem: the city builder is purely decorative and the quiz panel lives in isolation. The VISION explicitly flags this: *"Locked-in risk: decoration not decision unless buildings consume/produce resources."* The question for this cycle is: **what gameplay loop makes statistical reasoning the actual game mechanic, not a reward wrapper?**

Criteria applied to every candidate (from VISION.md "Gameplay candidate criteria"):

| Criterion | Weight |
|---|---|
| Decision rhythm (1 meaningful choice / 15–30s) | ×1 |
| Wonder tap (visceral delight / curiosity pull) | ×1 |
| Engine-building potential (early choices compound) | ×1 |
| Stats concept fit (player USES concept to decide, not just memorizes) | ×1 |
| Anti-decoration score (player CANNOT win without engaging the stats) | ×1 |

Max total score per candidate: 50.

---

## 8 Candidate Gameplay Loops

### Candidate 1 — Distribution Forge

**Elevator pitch:** You own a 6-faced die. The face values define a live discrete distribution. Each round a Hebrew contract demands a roll outcome (sum ≥ X, mean ≈ Y, z-score > 1.5). Between roll attempts you RESHAPE the die — swapping faces, buying new faces from a market — and every reshape is a statistical decision: does adding a high-value face raise σ in a way that hurts precision contracts? You are literally engineering distributions.

- **Board inspiration:** Dice Forge (BGG/234931) — mutable die faces as the engine; Quacks of Quedlinburg — push-your-luck risk framing  
- **Mobile inspiration:** Dicey Dungeons, Slice & Dice — dice-manipulation roguelites  
- **Decision interval:** ~15–20s (face swap or market buy)  
- **Stats concept USED in each decision:** Mean, variance/SD, expected value, probability, z-scores, sampling distributions (CLT boss rounds), confidence intervals (tournament mode), hypothesis testing (PvE bosses), ANOVA (tribe contracts)
- **Implementation complexity:** 3 / 5

| Dimension | Score |
|---|---|
| Decision rhythm | 9 |
| Wonder tap | 8 |
| Engine-building | 10 |
| Stats concept fit | 10 |
| Anti-decoration | 9 |
| **Total** | **46** |

---

### Candidate 2 — Sampling Heist

**Elevator pitch:** You're a data thief. Deploy "samplers" (workers) onto populations with hidden parameters. Choose: small sample of high-variance population vs. large sample of low-variance one. Each choice costs energy. The heist succeeds if your sample mean lands inside the confidence interval the contract demands. Central Limit Theorem is a core survival mechanic.

- **Board inspiration:** Viticulture (worker placement + resource), Caverna  
- **Mobile inspiration:** Loop Hero, Reigns  
- **Decision interval:** ~25s (worker placement)  
- **Stats concept USED:** Sampling distribution, standard error, CLT, confidence intervals
- **Implementation complexity:** 4 / 5

| Dimension | Score |
|---|---|
| Decision rhythm | 7 |
| Wonder tap | 7 |
| Engine-building | 8 |
| Stats concept fit | 10 |
| Anti-decoration | 9 |
| **Total** | **41** |

---

### Candidate 3 — Hypothesis Duel

**Elevator pitch:** Asymmetric boss encounters. Each boss has a hidden parameter (μ, p, σ). You attack by drawing samples (costs stamina). Commit to reject / fail-to-reject any turn. Premature rejection → Type I damage. Waiting too long → boss heals (Type II error). You pick test type (t, z, chi-square) and α level as your "weapons."

- **Board inspiration:** Gloomhaven (boss mechanics), Stuffed Fables (BGG/233312) — per-encounter unique mechanic  
- **Mobile inspiration:** Slay the Spire, Inscryption  
- **Decision interval:** ~20s  
- **Stats concept USED:** Hypothesis testing, Type I/II error, p-values, test selection
- **Implementation complexity:** 4 / 5

| Dimension | Score |
|---|---|
| Decision rhythm | 8 |
| Wonder tap | 9 |
| Engine-building | 7 |
| Stats concept fit | 10 |
| Anti-decoration | 10 |
| **Total** | **44** |

---

### Candidate 4 — Z-Score Tetris

**Elevator pitch:** A live normal curve is your board. Data-point tiles fall; you place them under the curve. The curve shape adapts to your placements (live histogram). Score by maintaining a target μ and σ while avoiding outlier pileups. Power-ups for correct z-score predictions before you place.

- **Board inspiration:** Patchwork (BGG/163412), Azul  
- **Mobile inspiration:** Threes, Drop7  
- **Decision interval:** ~8s (fast — closer to Threes pacing)  
- **Stats concept USED:** Z-scores, normal distribution, standard deviation
- **Implementation complexity:** 3 / 5

| Dimension | Score |
|---|---|
| Decision rhythm | 10 |
| Wonder tap | 9 |
| Engine-building | 5 |
| Stats concept fit | 8 |
| Anti-decoration | 8 |
| **Total** | **40** |

---

### Candidate 5 — Correlation Catan

**Elevator pitch:** A hex grid of variables. Each hex produces data with correlations to adjacent hexes. Build "regression roads" between hexes — only correlations above |r| = 0.5 yield resources. Trade variables with AI opponents; hidden confounder cards can invalidate your model (spurious correlation twist).

- **Board inspiration:** Catan (BGG/13) — trade window; Century Spice Road (BGG/209778) — resource chain  
- **Mobile inspiration:** Dorfromantik, Islanders  
- **Decision interval:** ~20s  
- **Stats concept USED:** Correlation, regression, spurious correlation, confounders
- **Implementation complexity:** 5 / 5

| Dimension | Score |
|---|---|
| Decision rhythm | 7 |
| Wonder tap | 8 |
| Engine-building | 9 |
| Stats concept fit | 9 |
| Anti-decoration | 8 |
| **Total** | **41** |

---

### Candidate 6 — Deck of Distributions

**Elevator pitch:** Start with 10 "uniform" cards. Each round draw 5, play cards to solve a stats challenge (produce a sample with mean ≈ 50, σ < 5). Buy new distribution cards from a market: normal, skewed, bimodal, mixture. Late-game deck attacks ANOVA and regression contracts. Card synergies form the engine.

- **Board inspiration:** Dominion, Seize the Bean (BGG/211364), Arctic Scavengers (asymmetric tribe leaders)  
- **Mobile inspiration:** Slay the Spire, Monster Train  
- **Decision interval:** ~15s  
- **Stats concept USED:** Descriptive stats, distribution shapes, combining distributions, ANOVA
- **Implementation complexity:** 4 / 5

| Dimension | Score |
|---|---|
| Decision rhythm | 9 |
| Wonder tap | 9 |
| Engine-building | 10 |
| Stats concept fit | 9 |
| Anti-decoration | 9 |
| **Total** | **46** |

---

### Candidate 7 — Push-Your-Luck Lab

**Elevator pitch:** Pull data points from a bag each round. You want a high sample mean but too many outliers (or too-small n) causes the study to "explode" (Type I error). Buy n-boosters, outlier filters, larger sample sizes. Every pull = stop or continue decision about statistical power.

- **Board inspiration:** Quacks of Quedlinburg (BGG/244521), Welcome To  
- **Mobile inspiration:** Luck Be a Landlord, Balatro  
- **Decision interval:** ~10s (pull or stop)  
- **Stats concept USED:** Statistical power, outliers, sample-size effects, Type I error
- **Implementation complexity:** 3 / 5

| Dimension | Score |
|---|---|
| Decision rhythm | 10 |
| Wonder tap | 9 |
| Engine-building | 8 |
| Stats concept fit | 9 |
| Anti-decoration | 9 |
| **Total** | **45** |

---

### Candidate 8 — ANOVA Arena

**Elevator pitch:** You lead a research tribe. 3 groups whose means you must differentiate to win territory. Allocate sampling budget across groups each turn. Higher within-group variance = wasted effort. Larger between-group difference = territory captured. AI tribes try to make your groups look equal (collapse your F-statistic).

- **Board inspiration:** Root, Cry Havoc (BGG/192457) — asymmetric factions  
- **Mobile inspiration:** Bad North, Mindustry  
- **Decision interval:** ~30s  
- **Stats concept USED:** ANOVA, F-statistic, within/between variance, effect size
- **Implementation complexity:** 5 / 5

| Dimension | Score |
|---|---|
| Decision rhythm | 6 |
| Wonder tap | 7 |
| Engine-building | 8 |
| Stats concept fit | 10 |
| Anti-decoration | 9 |
| **Total** | **40** |

---

## Summary Scoreboard

| Rank | Candidate | Rhythm | Wonder | Engine | Fit | Anti-deco | **Total** |
|---|---|---|---|---|---|---|---|
| **1** | Distribution Forge | 9 | 8 | 10 | 10 | 9 | **46** |
| **1** | Deck of Distributions | 9 | 9 | 10 | 9 | 9 | **46** |
| **3** | Push-Your-Luck Lab | 10 | 9 | 8 | 9 | 9 | **45** |
| 4 | Hypothesis Duel | 8 | 9 | 7 | 10 | 10 | **44** |
| 5 | Sampling Heist | 7 | 7 | 8 | 10 | 9 | **41** |
| 5 | Correlation Catan | 7 | 8 | 9 | 9 | 8 | **41** |
| 7 | Z-Score Tetris | 10 | 9 | 5 | 8 | 8 | **40** |
| 7 | ANOVA Arena | 6 | 7 | 8 | 10 | 9 | **40** |

**Tiebreaker #1 vs #2:** Distribution Forge beats Deck of Distributions on **direct stats fit**: in the Forge, variance and mean are the literal physical object the player manipulates — the die's face values ARE the distribution. In Deck of Distributions, distributions are encoded in cards (one abstraction layer away). The wonder tap is also higher: watching a histogram reshape in real time as you swap a face is more visceral than drawing from a deck.

---

## Top-3 Ranking

### #1 — Distribution Forge (Score: 46)

The player sculpts a physical distribution (the die) to meet statistical contracts. Every mechanic is a stats decision. Extends naturally to cover the full BA intro syllabus: mean/variance → z-scores → sampling distributions (CLT boss rounds) → confidence intervals (tournament mode) → hypothesis testing (PvE bosses) → ANOVA (tribe contracts).

### #2 — Deck of Distributions (Score: 46)

Strong engine-building; excellent wonder tap. Best suited as a complement to Distribution Forge (late-game face card market could feel like deck-building), or as an alternate mode for learners who prefer Slay-the-Spire pacing over physics-toy pacing.

### #3 — Push-Your-Luck Lab (Score: 45)

The fastest decision rhythm of any candidate (every ~10s). Best for drilling intuitions about sample size and Type I error. Could be embedded as a mini-game inside Distribution Forge's early rounds (the "pull or stop" decision as a sub-mode), avoiding scope split.

---

## #1 Detailed Spec — Distribution Forge

### Concept

You possess a 6-faced "Forge Die" (R3F `<RoundedBox>` with face labels). Each face holds a numeric value — together they define a discrete distribution with a measurable mean (μ), variance (σ²), and shape (live mini-histogram). Each round, a Hebrew contract card flips: "הטל 3 פעמים. סכום ≥ 24" (Roll 3 times. Sum ≥ 24.) or "הטל 5 פעמים. ממוצע בתוך ±1 מ-8" (Average within ±1 of 8). To succeed, you strategically reshape your die between attempts — buying new faces from a market, swapping faces — and every reshape forces a live stats decision: does adding a high-value face raise μ enough to meet the contract, or does the σ spike hurt precision targets? The die persists between rounds: early sculpting choices compound into late-game capability. It cannot be played without engaging variance, mean, expected value, z-scores, and eventually sampling distributions of statistics about your die.

### Core Game Loop

**Round duration: ~3 minutes | Decisions per round: ~6 | Decision interval: ~25s**

```
1. Contract reveal (5s)
   └── Hebrew contract card flips. Shows: contract type, target value, reward ore, HP cost if failed.

2. Inspect phase (15s)
   └── Player sees die's current μ, σ, mini-histogram.
   └── Contract card shows implied target range.

3. Forge phase (3–5 turns of 15–25s each)
   ├── Decision A: Swap a face → UI shows real-time Δμ, Δσ preview before confirming.
   ├── Decision B: Buy a face from Market (3 face cards visible, refresh with ore).
   └── Decision C: Lock a face (protects from random events next round).

4. Roll phase (10s)
   └── Player taps "הטל" → R3F die tumbles → results plot live onto histogram.

5. Resolution (5s)
   ├── Success → ore + XP + insight tokens awarded.
   └── Failure → HP lost proportional to |miss| (z-distance from target). Lesson token awarded.

6. Branch choice (10s)
   └── Three contract paths fanned out. Player picks next contract. (Agency rule.)
```

### Stats Concept → Mechanic Map

| Concept | When introduced | Mechanic |
|---|---|---|
| Mean | Round 1 | Sum of face values / 6, shown as HUD top. Sum contracts depend on μ. |
| Variance / SD | Round 3 | Computed live. Precision contracts demand low σ; push-your-luck contracts reward high σ. |
| Expected value | Round 5 | Market cards show EV impact. Player estimates "will buying this face pay off?" |
| Probability | Round 7 | Contract success probability shown only after spending "insight." Player must reason from visible faces otherwise. |
| Z-scores | Round 10+ | "Roll a value with z > 1.5 relative to your own die." Forces player to compute (x−μ)/σ. |
| CLT / sampling distributions | Boss round 15 | Roll die 30 times. Distribution of sample means becomes the new contract target. CLT emerges visually. |
| Confidence intervals | Tournament mode | Opponent die hidden. See only their sample mean. Build tightest correct CI to win round. |
| Hypothesis testing | PvE bosses | Boss has hidden μ. Draw samples (costs stamina), run t-test via UI button, decide reject / fail-to-reject. |
| Correlation | Two-die contracts | Pair two faces; reward based on r between paired roll results. |
| ANOVA | Tribe mode | Differentiate three dice's means under budget. Win = high between-group variance, low within-group variance. |

### Screen Layout (mobile-first, RTL)

```
┌────────────────────────────────┐
│  HP ████░░  ⚙  Ore: 12  Rd: 4 │  ← top bar (10vh)
├────────────────────────────────┤
│                                │
│          [3D Forge Die]        │  ← hero zone (40vh)
│    ממוצע: 5.2   סטיית תקן: 1.8 │
│    ▂▄▆█▆▄▂  (mini-histogram)  │
│                                │
├────────────────────────────────┤
│  Contract: סכום ≥ 22 ב-3 הטלות │  ← contract strip (8vh)
│  פרס: 8 עפרה · עלות כישלון: 2HP│
├────────────────────────────────┤
│ ◀ [face:7 Δμ+0.8 Δσ+0.4 4ore] │  ← market scroll (20vh)
│   [face:3 Δμ-0.3 Δσ-0.7 3ore] │     horizontal RTL scroll
│   [face:2d4 Δμ+0.2 Δσ-0.3 6ore│
├────────────────────────────────┤
│         [ הטל ]                │  ← commit bar (12vh)
│    [שאל שאלה → +3 עפרה]        │     quiz bridge button
└────────────────────────────────┘
```

Colors: background `#0e0f12`, panel `#16181d`, face cards `#1c1f26`. Face glow: `#3b82f6` (low σ face), `#ef4444` (high σ face), `#FFD700` (high EV face). Histogram bars `--gold`.

### Win / Lose / Progress Conditions

- **Win contract:** Roll outcome meets contract specification.
- **Lose contract:** HP lost = z-distance of miss from target (informative failure, not wall).
- **Run end:** HP → 0. Run summary shows which contracts failed, with concept tags. AI tutor pre-loads remedial questions.
- **Meta progress:** Across runs, unlock face archetypes (Bernoulli face, compound 2d4 face, negative face). Unlock requires N concept-mastery points earned from contracts using that concept.
- **Feature unlock bridge:** Existing tier system (`featureUnlocks.ts`) maps: tier-2 → compound faces, tier-4 → CI tournament, tier-5 → ANOVA tribes.

### Feature Flag

```typescript
// src/config/featureFlags.ts
ENABLE_DICE_FORGE_LOOP: false          // master gate
ENABLE_FORGE_PVE_BOSSES: false         // hypothesis-testing bosses
ENABLE_FORGE_TOURNAMENT_CI: false      // CI PvP mode
ENABLE_FORGE_TRIBE_ANOVA: false        // ANOVA tribe contracts
ENABLE_FORGE_CITY_INTEGRATION: false   // city-mastery bridge
```

### Why This Is NOT Cosmetic

A player who misreads variance literally loses the contract:
- Buying a high-value face without noticing σ explodes → fat-tailed histogram → precision contracts unwinnable.
- Premature hypothesis rejection (PvE boss) → 0 damage dealt + stamina lost.
- Wide CI in tournament mode → loses to a player with tighter correct interval.
- XP cannot be farmed: face unlocks require concept mastery points from actual contract decisions, not quiz answers alone.

The current city builder's locked-in risk is explicit: buildings don't change the math. In the Forge, **every face placement changes the distribution, and the distribution is the game**.

### Connection to Existing Systems

| Existing system | Bridge |
|---|---|
| Quiz panel (757 questions) | "שאל שאלה" button awards +3 ore on correct answer; SM-2 spacing filters to failed-concept questions |
| XP store (`learningStore.ts`) | Contract wins award XP proportional to concept difficulty |
| Feature unlock tiers | Tier milestones map 1:1 to face archetype + mode unlocks |
| Mindmap view | Mastery tracks replace/augment current graph with functional concept-progression map |
| AI tutor | Invoked after failed contract with 2-sentence diagnosis + quiz hook |
| City builder (R3F) | Phase 2: city districts grow as mastery tracks fill (Districts = concept clusters) |

### First Prototype Scope

**In (target ~80 dev-hours):**
- Single 6-faced die, integer faces 1–6 default
- Live μ, σ, mini-histogram HUD
- Three contract types: sum, range, mean
- Forge market: 5 face cards per round, ore pricing
- Ore + HP economy
- Branch choice after each round (3 paths)
- Run length: 10 contracts → run summary
- `forgeStore.ts` Zustand slice: `faces`, `ore`, `hp`, `currentContract`, `runStats`
- R3F die: `<RoundedBox>` with face labels (reuses existing drei setup)
- Quiz bridge: "שאל שאלה → +3 עפרה" button opens existing panel
- `ENABLE_DICE_FORGE_LOOP` feature flag defaulted off
- Vitest tests: μ/σ computation, contract evaluation, ore/hp delta logic

**Deferred to v2+:**
- PvE hypothesis-testing bosses
- CI tournament mode
- ANOVA tribes
- Compound faces (2d3, Bernoulli)
- Z-score contracts
- CLT boss visualization
- City builder integration
- Cosmetic face skins

### City Builder Tension Resolution

**Recommended: Option A — Recontextualize city as meta-layer.**

- Phase 1 (now): Forge ships standalone, city untouched.
- Phase 2: City districts are read-only mastery visualizations. Descriptives Quarter grows as mean/variance mastery fills. Inference Heights grows on hypothesis-testing wins.
- Phase 3: City actions trigger Forge unlocks. City = meta-game. Forge = moment-to-moment game.

This rescues the existing R3F investment without compromising the gameplay-first principle.

---

## Inspiration Citations

**Board games consulted:**
- Dice Forge (BGG/234931) — mutable die faces as core engine
- Quacks of Quedlinburg (BGG/244521) — push-your-luck framing
- Gloomhaven — boss encounter structure
- Stuffed Fables (BGG/233312) — per-encounter asymmetric mechanics
- Arctic Scavengers — asymmetric tribe leaders → ANOVA tribe mode
- Seize the Bean (BGG/211364) — deck-building Candidate 6
- Century Spice Road (BGG/209778) — resource chain mechanic
- Catan (BGG/13) — trading/negotiation window
- Patchwork (BGG/163412) — spatial puzzle framing for Candidate 4
- Cry Havoc (BGG/192457) — asymmetric faction territory control

**Mobile games consulted:**
- Dicey Dungeons, Slice & Dice — dice-manipulation roguelites, decision density
- Slay the Spire — roguelite engine-building, risk-reward per decision
- Threes / Drop7 — spatial tile placement + immediate feedback
- Loop Hero — "set up the engine and watch" feedback loop
- Balatro — push-your-luck escalation pattern

**UI sources:**
- Linear.app — dark-UI density, status pills, micro-interactions (HUD design)
- Apple HIG dark mode — elevation, 44pt hit-targets (mobile layout)
- Duolingo — path-tree branch choice (after-round contract selection)
- Mini Metro / Two Dots — minimal HUD, one-thumb mobile play

---

*Cycle 1 complete — exploration only, no code produced. Cycle 2 will implement the Distribution Forge prototype behind `ENABLE_DICE_FORGE_LOOP`.*
