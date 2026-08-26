# WaffleStack — Gameplay Exploration (Proactive Cycle 01)

**Date:** 2026-05-22  
**Cycle:** 1 — Exploration only (no code)  
**Agent model:** Sonnet 4.6 (Opus 4.7 attempted, returned 529 Overloaded — fallback used)  
**VISION.md version:** 1 (2026-05-21)  
**NotebookLM:** SKIPPED — MCP connector not available in this container  

---

## Problem Statement

The existing WaffleStack city-builder loop is a **decoration loop**, not a gameplay loop. Buildings appear when the player answers questions correctly, but there are **no decisions about the city itself**. The player has no meaningful choice between questions — only "answer the next question." This makes the gamification cosmetic, violating the core VISION rule: *Gameplay ≠ Gamification*.

Goal of this cycle: identify which gameplay mechanic best wraps intro statistics for BA social-science students, score candidates, and spec the winner in enough detail for Cycle 2 implementation.

---

## Scoring Rubric (1–10 each axis)

| Axis | What 10 means |
|---|---|
| **Decision rhythm** | One real choice every 15–30 s, no idle time |
| **Wonder-tap** | First-touch delight — something surprising happens when you tap |
| **Engine-building** | Early correct answers compound into late-game advantages |
| **Topic-fit** | The decision mechanic IS the statistical concept, not adjacent to it |
| **Decoration resistance** | Hard to hollow out into pure cosmetics without breaking the loop |
| **Prototypability** | Can a working prototype ship in one 5-day cycle? |

---

## 8 Candidate Gameplay Loops

---

### 1 — 🎲 Mutable Dice Forge
*"You craft the distribution you roll from"*

**Board game:** Dice Forge (Libellud) — players spend resources to replace die faces, sculpting their own probability distribution over the game.  
**Mobile game:** Threes — each merge is irreversible and changes the board state permanently; decisions compound.

**Core decision (every 20 s):** After each correct stats answer you earn a "face token." You choose which face of your d6 to replace: +2 σ-range, +1 μ-shift, +1 sample-size, or a wild. Each session you roll your custom die to determine your "research budget" for the day's lab scenario. The roll IS a live probability experiment — you observe outcomes and compare to expected distribution.

**Statistical concept used in decision:** You literally manipulate a probability distribution's shape. Choosing "replace a 1-face with a 4-face" is a hands-on lesson in shifting expected value. Comparing observed roll frequency to expected = goodness-of-fit chi-square.

**Decoration risk:** Low. If the die-face upgrade mechanic is removed, the loop collapses — there is no city to admire.

**Engine-building potential:** High. A face upgraded in session 1 produces compounding roll advantage across all future sessions.

**Scope for prototype:** 3–5 days (dice state in Zustand, face-swap UI, roll visualizer using existing DistributionChart.tsx).

| Axis | Score |
|---|---|
| Decision rhythm | 9 |
| Wonder-tap | 9 |
| Engine-building | 9 |
| Topic-fit | 10 |
| Decoration resistance | 9 |
| Prototypability | 8 |
| **Total** | **54/60** |

---

### 2 — ⚙️ Pre-commit Programming Puzzle
*"Sequence your stats pipeline, then watch it execute on data"*

**Board game:** Mechs vs Minions (Riot Games) — players program a sequence of commands face-down, then watch the mech execute them in order, dealing with unexpected results.  
**Mobile game:** Mini Metro — you plan the network before trains run; execution reveals what you missed.

**Core decision (every 25 s):** Player receives a raw dataset card. They pre-commit a 4-step stats pipeline: Clean → Describe → Test → Conclude. Each step slot has 2–3 options (e.g., "remove outliers vs. keep them," "use mean vs. median," "t-test vs. Mann-Whitney"). After committing, the pipeline executes — the data card animates through each step, and the output either supports or invalidates the conclusion. Wrong pre-commits show *why* the conclusion failed.

**Statistical concept used in decision:** Hypothesis testing procedure — the order and choice of steps IS the content. The player uses their knowledge of normality assumptions, test selection, and error types to pre-commit.

**Decoration risk:** Very low. Remove the data pipeline and the game is gone.

**Engine-building potential:** Medium. Unlocking new test options (Levene's, Welch's t-test) as mastery grows is engine-like, but each round is fairly self-contained.

**Scope for prototype:** 5–10 days (pipeline UI, data card system, animated execution — novel components).

| Axis | Score |
|---|---|
| Decision rhythm | 8 |
| Wonder-tap | 8 |
| Engine-building | 6 |
| Topic-fit | 10 |
| Decoration resistance | 10 |
| Prototypability | 5 |
| **Total** | **47/60** |

---

### 3 — 🏪 Coffee Shop Engine-Builder
*"Run a café where every system is a stats concept"*

**Board game:** Seize the Bean (Weird Giraffe Games) — deck-building coffee-shop run; each card represents a skill that improves your café's output.  
**Mobile game:** Reigns — every swipe has a consequence on 4 resource dials; decisions compound without a visible formula.

**Core decision (every 20 s):** Player runs a café. Each "system" (grinder, milk steamer, espresso machine, loyalty programme) has a stats concept powering it. Grinder = sampling (how many beans = sample size, output quality = estimator precision). Milk steamer = confidence intervals (steam pressure = confidence level vs. volume). Loyalty programme = hypothesis testing (does the new coupon increase return rate?). Mastered a concept → upgrade that system → higher café revenue → unlock next system. The player chooses which system to invest in next.

**Statistical concept used in decision:** Each upgrade decision requires answering a question *about* that system's underlying stat. Choosing to upgrade "Grinder" unlocks a sampling-theory question set; correctly answering improves the grinder stat.

**Decoration risk:** Medium. The café aesthetic could degrade to cosmetics if the systems stop gating progression meaningfully. Requires disciplined design.

**Engine-building potential:** High. Coffee quality compounds into revenue compounds into unlocks.

**Scope for prototype:** 3–5 days (system state, upgrade UI, connect to existing quiz engine).

| Axis | Score |
|---|---|
| Decision rhythm | 8 |
| Wonder-tap | 8 |
| Engine-building | 9 |
| Topic-fit | 7 |
| Decoration resistance | 6 |
| Prototypability | 8 |
| **Total** | **46/60** |

---

### 4 — 🌶 Pickup-and-Deliver Topic Pyramid
*"Trade lower concepts for higher ones — prerequisite chains made visible"*

**Board game:** Century: Spice Road (Plan B Games) — convert lower spices to higher using a card hand; the resource pyramid mirrors topic prerequisites exactly.  
**Mobile game:** Two Dots — chain adjacent dots of same colour; each chain removes dots and changes the board, creating cascades.

**Core decision (every 20 s):** Player holds a hand of "concept tokens" (descriptive stats, probability, normality). They choose which conversion card to play — e.g., "3× probability tokens → 1× inference token." Conversion triggers a question: answer correctly to complete the trade. Building up enough inference tokens lets you attempt a "boss question" at the top of the pyramid (ANOVA, regression).

**Statistical concept used in decision:** Topic prerequisite structure IS the conversion ratio. You cannot skip descriptive stats to reach inference — not because a rule says so, but because you run out of tokens.

**Decoration risk:** Low. Without the token conversion the game has no content.

**Engine-building potential:** Medium. Better hands (more efficient conversion cards) unlock with mastery — modest compound.

**Scope for prototype:** 3–5 days (token system, hand management UI, conversion card deck).

| Axis | Score |
|---|---|
| Decision rhythm | 7 |
| Wonder-tap | 6 |
| Engine-building | 7 |
| Topic-fit | 8 |
| Decoration resistance | 8 |
| Prototypability | 7 |
| **Total** | **43/60** |

---

### 5 — 🧸 Stat-Creature Asymmetric Collection
*"Each creature has a unique stats mechanic — collect them all"*

**Board game:** Stuffed Fables (Plaid Hat Games) — each stuffed animal has a completely different encounter mechanic; Cry Havoc asymmetric factions — different rules under one shell.  
**Mobile game:** Pokémon GO — spatial collection pull; each creature is distinct enough to warrant seeking it.

**Core decision (every 25 s):** Each stat concept is a creature with a unique battle mechanic matching that concept. "Sigmund σ" (Standard Deviation creature) attacks by spreading damage across a range — player must choose where on the target's health bar to land the hit, using their knowledge of σ to pick the spread. "Hypo T. Ester" (t-test creature) attacks only after the player selects the right test conditions (one-tailed vs. two, significance level). Collect creatures → they level up when you answer their topic's questions.

**Statistical concept used in decision:** The mechanic of each creature IS the concept. The player can't choose the right attack without understanding the stat.

**Decoration risk:** Medium. "Collecting creatures" could become cosmetic if the battle mechanics are simplified. High design discipline required.

**Engine-building potential:** Medium. More creatures = wider toolkit, but each creature is isolated rather than compounding.

**Scope for prototype:** 5–10 days (creature state machine, per-creature mechanic, battle UI).

| Axis | Score |
|---|---|
| Decision rhythm | 7 |
| Wonder-tap | 10 |
| Engine-building | 5 |
| Topic-fit | 9 |
| Decoration resistance | 6 |
| Prototypability | 4 |
| **Total** | **41/60** |

---

### 6 — 🧵 Daily Spatial-Tiling Puzzle
*"Place stats-tile pieces under time + cost budget — Patchwork × Wordle"*

**Board game:** Patchwork (Uwe Rosenberg) — budget-constrained tile placement on a personal board; time track + button income create compound decisions. Arctic Scavengers — asymmetric tribe leader = choose your stats specialisation.  
**Mobile game:** Wordle (NYT) — daily constraint, social sharing, streak pressure.

**Core decision (every 20 s):** Each day one puzzle board is generated — a grid representing a "dataset" with gaps. Player receives 5 tile-pieces, each shaped like a stats concept (a wide flat tile for descriptive stats, a tall narrow tile for inference, an L-shaped tile for correlation). Each tile placement triggers a question about that concept. Fitting all tiles without gaps = perfect session; gaps = missed questions shown visually.

**Statistical concept used in decision:** Tile shapes encode concept complexity. Placing a tile requires answering its question correctly; wrong answers shrink the tile (you place a smaller piece, leaving an ugly gap). The visual gap is informative feedback — "your inference knowledge has a hole."

**Decoration risk:** Low. Without the question-tile connection, placement has no stakes.

**Engine-building potential:** Low. Daily puzzle resets; no cross-day compounding.

**Scope for prototype:** 3–5 days (grid system, tile generation, daily seed, gap visualisation).

| Axis | Score |
|---|---|
| Decision rhythm | 8 |
| Wonder-tap | 7 |
| Engine-building | 3 |
| Topic-fit | 7 |
| Decoration resistance | 7 |
| Prototypability | 7 |
| **Total** | **39/60** |

---

### 7 — 🏨 Real-Time Triage
*"NPCs arrive with statistical needs — you decide who to serve first"*

**Board game:** Coffee Rush (Nuts! Publishing) — real-time order fulfilment under time pressure; decision density is maximum.  
**Mobile game:** Tomb of the Mask — instant, reflexive decisions; failure is immediate and restartable.

**Core decision (every 10–15 s):** NPC "clients" appear with data analysis requests — "I need a 95% CI on this sample," "Is this distribution normal?", "Compare these two group means." Player selects which client to serve next; each service is one stats question. Serving wrong type (sending a t-test client to the chi-square station) fails. Timer for each client; client leaves if ignored too long.

**Statistical concept used in decision:** Correct routing requires recognising which test applies. Matching problem type to test = classification knowledge.

**Decoration risk:** Low. Without correct classification, routing fails.

**Engine-building potential:** Low–medium. Unlocking faster answer animations and additional stations adds engine flavour.

**Scope for prototype:** 5–10 days (timer system, NPC queue, routing logic).

| Axis | Score |
|---|---|
| Decision rhythm | 10 |
| Wonder-tap | 7 |
| Engine-building | 4 |
| Topic-fit | 8 |
| Decoration resistance | 7 |
| Prototypability | 5 |
| **Total** | **41/60** |

---

### 8 — 🕴 Influence + Bluff: Stats Schools
*"Place influence on statistical paradigms — who controls the data?"*

**Board game:** Godfather: Corleone's Empire (CMON) — area control + bluffing + hidden objectives; Cry Havoc asymmetric factions.  
**Mobile game:** Reigns — hidden resource dials shift with each decision; information asymmetry drives tension.

**Core decision (every 25 s):** Player picks a "school of thought" (Frequentist, Bayesian, Nonparametric) and places influence tokens on contested data-zones. Each zone requires answering questions from that school's canon. More influence = unlock stronger school abilities. Opponent (AI professor) places counter-influence; player must decide whether to defend turf or expand.

**Statistical concept used in decision:** Choosing which test to apply in which zone IS understanding when frequentist vs. Bayesian approaches apply. Hidden-info tension mirrors real scientific uncertainty.

**Decoration risk:** Medium. Influence placement could become abstract map-colouring without clear stats tie.

**Engine-building potential:** Medium. Entrenched influence compounds over sessions.

**Scope for prototype:** 5–10 days (influence board, AI opponent, school ability system).

| Axis | Score |
|---|---|
| Decision rhythm | 6 |
| Wonder-tap | 7 |
| Engine-building | 7 |
| Topic-fit | 7 |
| Decoration resistance | 6 |
| Prototypability | 4 |
| **Total** | **37/60** |

---

## Ranked Summary

| Rank | Loop | Score | Decisive advantage |
|---|---|---|---|
| 1 | 🎲 Mutable Dice Forge | **54/60** | Topic-fit = 10; decision IS the distribution; wonder-tap = 9; engine-building = 9; can ship in one 5-day cycle on top of existing DistributionChart |
| 2 | ⚙️ Pre-commit Programming Puzzle | **47/60** | Decoration resistance = 10; procedure topics are perfectly served; held back by prototypability cost |
| 3 | 🏪 Coffee Shop Engine-Builder | **46/60** | Highest engine-building + prototypability combo; held back by decoration risk needing disciplined design |

**Why #1 wins over #2:** The Mutable Dice Forge is the only mechanic where the statistical artifact (a probability distribution you crafted) is both the output of your learning AND the tool you use in the next decision. Pre-commit Puzzle is intellectually purer for procedure topics, but requires novel UI work far exceeding one cycle. The Dice Forge can reuse existing `DistributionChart.tsx`, connects naturally to the existing quiz engine, and has a wonder-tap moment (watching your custom die roll and comparing to expected frequency) that is immediately satisfying on mobile.

**Why #1 wins over #3:** Coffee Shop is thematically richer, but the statistical tie is looser — "upgrading the grinder" is a metaphor for sampling; in Dice Forge, manipulating die faces IS sampling with no metaphor layer. Dice Forge is mechanically leaner and harder to hollow out.

---

## Detailed Spec — 🎲 Mutable Dice Forge

### Concept in One Sentence
The player crafts a custom d6 whose faces represent statistical concepts they've mastered; each session they roll it to generate their "research budget," observe outcomes vs. expected distribution, and use that live experiment to drive today's question set.

### Game State Schema

```typescript
interface DiceForgeSave {
  faces: DieFace[];          // exactly 6 elements
  rollHistory: number[];     // last 20 roll outcomes (for observed-vs-expected chart)
  faceTokens: number;        // earned by correct answers, spent on face upgrades
  masteredConcepts: string[]; // syncs with existing learningStore
  sessionNumber: number;
}

interface DieFace {
  id: string;                 // e.g. "mean", "sd", "ci_95", "pvalue", "n_size", "wild"
  conceptLabel: string;       // Hebrew display label
  value: number;              // numeric weight (1–6) for roll outcome calculations
  upgradeLevel: number;       // 0–3; higher = face appears more frequently on roll
}
```

Default die: faces [1, 2, 2, 3, 3, 4] representing beginner concepts (mean ×2, median ×2, range ×1, mode ×1).

### Turn Structure (one session ≈ 8 min)

1. **Roll phase (5 s):** Animated 3D die roll using R3F. Result determines today's "research budget" — e.g., roll 4 (σ-face) → budget is shaped by std deviation (today's questions weight towards variability topics, and you have 4 question-tokens to spend).
2. **Question phase (20–25 s per question):** Player answers a stats question matching today's budget face. Correct → earn 1 face-token. Wrong → no token; immediate 1-sentence explanation; retry variant offered.
3. **Forge phase (30 s, between questions):** Player optionally spends face-tokens to upgrade or swap a die face. UI shows the 6 faces in a hex grid; tap a face → upgrade menu slides up (bottom-sheet, one-thumb). Upgrade options: raise value (+1 outcome weight, costs 2 tokens), replace face (swap out a low-level face for a newly mastered concept, costs 3 tokens).
4. **Reflection phase (15 s, end of session):** Bar chart (reusing `DistributionChart.tsx`) shows observed roll frequencies vs. expected. Player answers one "meta-question": "Your σ-face came up 3 times but you expected it ~2. What does this tell you?" → Sampling variability lesson embedded in play.

### How Answering a Stats Question Changes Game State

- Correct answer → `faceTokens += 1` → toast appears over the die ("פנים חדשה זמינה!")
- 3 correct answers on a topic → `masteredConcepts` updated → new DieFace option unlocked in the forge menu
- Wrong answer → no state change on die, but the question enters spaced repetition queue (existing SM-2 logic) with shorter interval

### The Meaningful Decision BETWEEN Questions

After every 2nd question, the Forge phase activates. The player sees their 6 current faces and must decide:

> "I have 3 tokens. Do I upgrade my existing σ-face (costs 2 tokens, raises its roll weight so I see more variability questions — which I'm now strong at), or save for 3 tokens to add a new CI-face (which I haven't mastered yet — risky, but opens a new question type)?"

This is a real decision with real consequences:
- Upgrading a mastered face → more questions on your strong topics → easier sessions → compounding confidence but potentially a knowledge gap.
- Adding an unmastered face → harder session rolls → more struggle → faster mastery if you survive.

This mirrors the **exploration vs. exploitation** tradeoff in statistics and reinforcement learning — and can be explicitly surfaced in a tooltip.

### First 5 Minutes of Play (Beat by Beat)

| Time | What happens |
|---|---|
| 0:00 | App opens. Animated die in centre of screen, 6 plain faces. "הטל להתחיל" (Roll to start) CTA thumb-zone. |
| 0:05 | First roll: result = 2 (mean-face). Bar chart mini-preview: "המטרה — להבין ממוצע" |
| 0:10 | First question appears in bottom-sheet: "מה הממוצע של: 4, 7, 3, 8?" with 4 multiple-choice options |
| 0:35 | Player answers correctly. Token appears on die with scale-bounce. "פנים חדשה זמינה (2 נקודות)" |
| 0:40 | Second question. Subject: still mean (same roll budget). |
| 1:05 | Correct again. Forge phase unlocks with gentle pulse on the die. |
| 1:10 | Bottom-sheet slides up: 6 faces shown in hex grid. First upgrade available: "שדרג פנים 1 (ממוצע) → ממוצע+" for 2 tokens. Player upgrades. |
| 1:20 | Die face visually changes (new icon, gold tint). "שדרגת את הקוביה!" Scale-pop. |
| 1:25 | Next roll. Player notices the upgraded face appears slightly more often. Curiosity hook: "האם פני הקוביה שלי אכן יוצאים יותר?" |
| 2:00 | After 4 questions: reflection chart appears. 4 rolls shown vs. expected distribution. First meta-question. |
| 3:00 | New face unlocked: "סטיית תקן" (std dev). Player sees it in the forge menu as grayed-out (need 3 tokens). Decision: upgrade existing face or save? |
| 5:00 | Session summary: "הקוביה שלך השתנתה — ראה איך:" before/after die comparison. Share card offered. |

### Scale to 20+ Topics

- 20 stats concepts → 20 possible face types in the catalogue, each unlocked when the topic is mastered (≥80% correct on 5 questions).
- A d6 only has 6 faces → player must **choose** which 6 concepts to keep on their die. This is permanent curation: do you keep "mean" (safe, easy rolls) or replace it with "effect size" (harder, but unlocks boss questions)?
- This choice IS a decision about statistical knowledge portfolio — analogous to curriculum self-design. VISION rule: "Player has agency over what to learn next."
- Boss questions unlock only if the die has ≥3 related faces (e.g., Inference boss requires CI + p-value + hypothesis-testing faces).

### Hebrew UI Key Labels

| Component | Hebrew |
|---|---|
| Roll button | הטל קוביה |
| Forge phase | מזייפת פנים |
| Face token | 🪙 נקודת פנים |
| Upgrade face | שדרג פנים |
| Replace face | החלף פנים |
| Expected distribution | התפלגות צפויה |
| Observed distribution | התפלגות שנצפתה |
| Mastered concept | מושג שנשלט |
| Boss question | שאלת בוס |
| Session summary | סיכום מפגש |

### Variance/Standard Deviation Decision Example

Player's die has a σ-face (standard deviation) at upgrade level 2. They roll it. Today's research scenario: "You're studying stress scores in two groups. Your die gave you σ-mode — today's budget is variability-focused."

Question: "Group A: σ = 1.2, n = 30. Group B: σ = 4.8, n = 30. Which group's mean is a more reliable estimate of its population?"

Player must decide (not just recall): using their die-face allocation, they've chosen to invest in σ knowledge. The decision pays off — they correctly answer Group A. Then in the Forge phase: "Your σ-face is strong. Do you add another σ-upgrade (diminishing returns, costs 3 tokens) or use those 3 tokens to unlock a new CI-face that would let you quantify *how* reliable Group A's mean is?" — the two concepts are explicitly linked in the decision.

### Hypothesis Testing Decision Example

Player has a p-value face and a hypothesis-testing face (H₀/H₁) on their die. They roll p-value. Scenario: "Your café's new menu allegedly increases return visits. You collected 40 days of data. p = 0.048, α = 0.05."

Question: "Do you reject H₀?"

Player answers correctly (yes, p < α). Forge phase: "You can upgrade your p-value face (more p-value questions — you're good at these) or swap in an Effect Size face — because you just learned that p < 0.05 doesn't tell you HOW big the difference is." The Forge decision forces the player to confront the limitation of p-values organically.

### Failure State + Recovery

- Wrong answer → no token, no die change, but question re-queued in SM-2 (shorter interval = sooner retry).
- 3 consecutive wrong answers on same topic → die emits a visual "crack" on that face; tooltip: "הפנים הזאת צריכה תיקון — ענה נכון ×2 כדי לתקן אותה." Recovery: answer 2 correct questions on that topic → face repairs.
- Cracked face can still be rolled but triggers slightly harder questions — the player is not blocked, but the damage is visible and motivating.
- No permanent failure state. The die never resets fully. Every session you can repair.

### Why This Beats the Current Decoration Loop

| Current city-builder | Mutable Dice Forge |
|---|---|
| Buildings appear automatically when mastery threshold crossed | Player actively chooses which face to upgrade/replace |
| City is a reward screen, not a decision space | Die is both reward AND tool for the next decision |
| No consequence to which topic you master next | Choosing a new face changes which questions you face tomorrow |
| Player is passive between questions | Player is active in Forge phase every 2 questions |
| Visual city growth is satisfying but doesn't teach | Rolling your custom die and comparing to expected = live chi-square lesson |
| Topic order is externally imposed | Player curates their 6-face die = self-directed curriculum |

---

## Open Questions for Cycle 2

1. Should the die be truly 3D (R3F) or a stylised 2D hex grid for performance and prototypability? *Recommendation: 2D hex-grid with CSS 3D transform for Cycle 2, R3F upgrade in Cycle 3 if performance allows.*
2. Should the reflection chart compare roll outcomes to theoretical (uniform vs. weighted) distribution? *Yes — this is the teaching moment and uses existing `DistributionChart.tsx`.*
3. How many face-tokens per session is the right economy? *Start with: 1 token per correct answer, upgrade costs 2, replace costs 3. Tune in Cycle 3.*
4. Do we show the probability weight of each face explicitly, or let the player infer it? *Infer first — watching a face appear "more" is a learning moment before we label it.*

---

*NotebookLM consulted: NO — MCP connector not available. Design judgment sourced from VISION.md catalogue + cited board/mobile game mechanics.*  
*Board game inspiration: Dice Forge (Libellud) — mutable die face mechanic; Seize the Bean — resource-from-mastery compounding.*  
*Mobile game inspiration: Threes — irreversible, compounding decisions; Reigns — consequence-on-every-tap.*  
*Decision interval: every 20–25 seconds (question) + 30-second Forge phase every 2 questions.*  
*Statistical concepts used in decisions: probability distributions, expected value, sampling variability, hypothesis testing, effect size.*
