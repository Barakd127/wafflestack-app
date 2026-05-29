# Proactive Cycle 01 — Gameplay Loop Exploration

**Date:** 2026-05-29  
**Cycle type:** Exploration only (no code)  
**Agent:** Sonnet 4.6 (synthesis) + own design judgment (NotebookLM skipped — MCP connector not available this container)  
**Branch:** `proactive/exploration/games-design-space`

---

## Context

Current WaffleStack state: Study Hub (quiz) → XP → SM-2 spaced repetition → 3D knowledge city (buildings appear per mastered topic). This is **gamification** (rewards on top of quiz), not **gameplay** (meaningful decisions between problems). VISION.md §"Gameplay ≠ Gamification" flags this gap explicitly for the 3D city: "Locked-in risk: decoration not decision unless buildings consume/produce resources."

This cycle explores 8 candidate gameplay loops to find the mechanic that makes **statistics the substance of every decision, not the cost of admission**.

---

## Scoring rubric

Each candidate scored **1–5** on five axes (5 = best):

| Axis | What it measures |
|---|---|
| **Decision rhythm** | Does a meaningful choice land every 15–30 s? |
| **Wonder tap** | Is there an emotional pull the target learner (BA social-science student, Israel) will feel? |
| **Engine-building** | Do early decisions compound into late-game advantages? |
| **Topic-fit** | Does the player USE the statistical concept to make the decision (not just answer then proceed)? |
| **Decoration risk** | LOW score = high risk of becoming cosmetic. HIGH score = low risk. |

Maximum: **25 points**.

---

## Candidate loops

---

### Loop A — Mutable-Dice Engine *(גלגל הנתונים)*

> "You ARE the die. You forge your own sampling instrument."

**Mechanic lineage:**  
Board game: **Dice Forge** (BGG/255504) — players modify the faces of their own dice; each face is a resource face that can be replaced with better ones bought in-game.  
Mobile: **Threes!** — each merge changes the system's distribution of tile values; long-term shaping of what the board "grows."  
UI source: **Mini Metro** — distribution histogram as a HUD element; minimal, always-visible feedback.

**Core loop (one session):**

1. **Roll** — tap your die → it samples from *your* probability distribution (faces you've forged).
2. **Observe** — bottom sheet shows outcome + live histogram of your distribution's shape.
3. **Question** — 20-second problem *about your die's current properties*: "Your distribution has μ=3.5, σ²=2.9. If you add 2 to every face, what happens to σ²?" (Answer: unchanged — variance is translation-invariant.)
4. **Correct → Forge** — earn a face-upgrade token. Open the Forge screen: 6 face slots visible. Choose one to upgrade.
5. **Decision** — *this is the gameplay*: upgrading face 1 → 4 shifts mean +0.5, reduces variance. Upgrading face 6 → 2 reduces mean −0.67, increases variance. Player must reason about distributional consequences before forging.
6. **Repeat** — new roll, new properties, new question emerges.

**What the player decides:**
- Which face to modify (= choosing how to reshape a probability distribution)
- Whether to specialize (cluster around a mean → low variance) or diversify (maximize entropy)
- At advanced stages: commit two dice → observe sum distribution → test CLT directly

**Statistical concepts used (not just memorized):**
- Expected value → which face-upgrade maximizes long-run output
- Variance + standard deviation → spread vs. cluster forging strategy
- Probability mass function → weighting faces (one face can repeat)
- Law of large numbers → roll history histogram stabilizes over time
- Central Limit Theorem → combine two custom dice, watch sum approach normal

**Decision interval:** ~20–25 s (roll → read outcome → answer → forge choice)  
**Session target:** 5–10 min (6–8 forge cycles)  
**Decoration risk mitigation:** Die faces are not cosmetic — they deterministically change which statistical challenge arises next.

**Scores:**

| Axis | Score | Reasoning |
|---|---|---|
| Decision rhythm | 4 | One forge decision per ~20-25 s — slightly slower than ideal but rich |
| Wonder tap | 5 | "I built this distribution" is deeply satisfying; histogram is visual + personal |
| Engine-building | 5 | Every forge compounds; die state carries across sessions |
| Topic-fit | 5 | Player uses expected value + variance to MAKE the forge decision |
| Decoration risk | 1 (low risk) | Die faces change learning challenge, not just aesthetics |

**Total: 20/25**

---

### Loop B — Pre-commit Programming Puzzle *(רצף ניתוח הנתונים)*

> "Plan the pipeline. Execute it. Fix what broke."

**Mechanic lineage:**  
Board game: **Mechs vs Minions** (BGG/209010) — players pre-program a sequence of command cards; the sequence executes in full, producing unexpected results they must debug next round.  
Mobile: **Mini Metro** — pre-assigning routes before watching the system run; feedback loop between plan and execution.  
UI source: **Linear.app** — issue pipeline / workflow stages as drag-drop sequences; keyboard-first.

**Core loop:**

1. **Case arrival** — a statistical scenario appears (e.g., "15 sociology students, exam scores, test if women scored significantly higher").
2. **Pre-sequence** — player drags command cards into an ordered sequence: COLLECT → CLEAN → VISUALIZE → CHOOSE TEST → SET α → CALCULATE → INTERPRET. Each card costs "attention tokens."
3. **Execute** — the sequence runs. Missing CLEAN before TEST → error card appears (non-normal residuals, outlier contamination). Player sees exactly where it broke.
4. **Iterate** — spend a token to re-order, add a missing step, re-execute.
5. **Correct pipeline** → unlock next scenario (harder data, more confounds).

**What the player decides:**
- Which steps to include vs. omit (cost-benefit of thoroughness)
- In what order (some orders are statistically wrong)
- Which test to slot in CHOOSE TEST given data properties

**Topic-fit:** Hypothesis testing pipeline, regression diagnostics, data cleaning, test selection  
**Decision interval:** ~25 s (planning a 5-7 card sequence)  
**Decoration risk:** Low — wrong sequence literally produces wrong statistics (bug visible)

| Axis | Score | Reasoning |
|---|---|---|
| Decision rhythm | 4 | Burst of decisions during sequencing, then wait during execution |
| Wonder tap | 4 | "Bug hunting your own pipeline" is satisfying for social-science students |
| Engine-building | 4 | Unlock new command cards; later scenarios reuse optimized earlier pipeline |
| Topic-fit | 5 | Player USES hypothesis-testing sequence as the move set |
| Decoration risk | 1 (low risk) | Wrong sequence = wrong output (no cosmetic hiding) |

**Total: 18/25**

---

### Loop C — Push-Your-Luck Sampling *(מתי לעצור?)*

> "Pull data tokens. Decide when to stop. Confidence narrows as sample grows."

**Mechanic lineage:**  
Board game: **Quacks of Quedlinburg** (BGG/244521) — players draw from a bag, choosing when to stop before drawing a "bust" token; tension between greed and caution.  
Mobile: **Two Dots** — chain extension with push-your-luck energy; "should I extend the chain one more?"  
UI source: **Apple HIG** — confidence-interval bar as a bottom-sheet native element; thumb-reachable "stop sampling" CTA.

**Core loop:**

1. **Data bag** — player's bag contains tokens representing data points from a population (some are outliers = "bust" tokens).
2. **Pull** — tap to draw a data token. Sample size grows. Confidence interval visibly narrows.
3. **Question triggered** — every 3 pulls: "Your 95% CI is now [2.1, 4.7]. Is the effect significant?" Player decides yes/no using current CI.
4. **Continue or stop** — continue → narrower CI, risk pulling an outlier that widens it. Stop → lock in current evidence, answer the research question.
5. **Correct stop** = advance. Wrong stop or bust = informative failure → "You needed n=30 for 80% power — here's why."

**What the player decides:**
- When to stop sampling (= choosing sample size based on desired CI width and power)
- Whether to accept ambiguous evidence or collect more
- Which tests to apply to current sample

**Topic-fit:** Confidence intervals, statistical power, Type I/II error, stopping rules, sample size calculation  
**Decision interval:** ~12–15 s (fast pull rhythm + periodic CI question)  
**Decoration risk:** Low — pulling more data directly changes the statistical evidence (CI width is the game state)

| Axis | Score | Reasoning |
|---|---|---|
| Decision rhythm | 5 | Fastest rhythm of all candidates; pull + decide every 12-15 s |
| Wonder tap | 4 | "Closing the CI" is viscerally satisfying once students understand it |
| Engine-building | 3 | Bag upgrades (better instruments → fewer outlier tokens) but limited compounding |
| Topic-fit | 5 | The CORE mechanic IS stopping rule reasoning; CI width IS the feedback |
| Decoration risk | 1 (low risk) | CI literally changes with each pull; no decoration possible |

**Total: 18/25**

---

### Loop D — Run-a-Place Engine *(המעבדה שלי)*

> "Run a statistics lab. Route data through instruments. Each stat concept is a machine."

**Mechanic lineage:**  
Board game: **Seize the Bean** (BGG/211364) + **Coffee Rush** (BGG/377061) — manage throughput in a busy shop; decisions about staffing, routing, upgrades under real-time pressure.  
Mobile: **Mini Metro** — routing passengers through stations; deciding which lines to upgrade.  
UI source: **Stripe Docs** — instructional sidebar for each "machine" showing what statistic it computes and why.

**Core loop:**

1. **Dataset clients** arrive (e.g., "Marketing wants to test campaign effectiveness").
2. **Route** — drag the dataset card to a sequence of machines: Descriptive → Normality Check → t-test → Interpretation.
3. **Bottleneck** — if Descriptive machine is overloaded, queue backs up; player must upgrade it (= answer questions about descriptive stats to earn upgrade tokens).
4. **Correct routing + correct answers** → client satisfied → lab earns "reputation" + data tokens.
5. **Upgrade decisions** — which machine to improve next (= choosing which stats topic to master).

**What the player decides:**
- Routing order (which tests to apply in which order)
- Which machine to upgrade (prioritizing stats topics)
- When to reject a client vs. accept (stopping rules under capacity)

**Topic-fit:** The full stats pipeline; prerequisite ordering  
**Decision interval:** ~20–30 s (routing decision per client)  
**Decoration risk:** Medium — machine aesthetics could become more important than routing logic

| Axis | Score | Reasoning |
|---|---|---|
| Decision rhythm | 3 | Client arrival pace sets rhythm; risk of dead-time between clients |
| Wonder tap | 5 | "Run my own cool lab" is exactly the emotional pull VISION.md lists as primary |
| Engine-building | 5 | Strong: throughput compounds; upgraded machines make later scenarios easier |
| Topic-fit | 3 | Routing decisions use prerequisite knowledge but individual questions feel detached |
| Decoration risk | 2 (moderate risk) | Lab visual could drift toward cosmetic if machine animations are too rewarding |

**Total: 18/25**

---

### Loop E — Resource-Trade Engine *(שרשרת ידע)*

> "Trade lower-level mastery for higher-level concepts. The prerequisite IS the currency."

**Mechanic lineage:**  
Board game: **Century: Spice Road** (BGG/209418) — convert lower-tier resources into higher-tier via trade cards; the conversion path IS the strategy.  
Mobile: **Threes!** — merge smaller into larger; earlier decisions create the opportunity space for later moves.  
UI source: **Notion** — block-based canvas where knowledge units connect visually.

**Core loop:**

1. **Resource hand** — player holds "knowledge tokens" of different topics (descriptive, probability, normal distribution).
2. **Trade cards** available — e.g., "2× descriptive + 1× probability → 1× t-test token."
3. **Encounter** — research scenario requires specific token to unlock its question (can't attempt t-test scenario without a t-test token).
4. **Answer correctly** → earn more tokens of that type + upgrade the trade card.
5. **Strategy** — which conversion path to pursue; Bayesian path vs. frequentist path require different resource chains.

**Topic-fit:** Topic prerequisites, Bayesian vs. frequentist reasoning, conditional probability (probability is itself a resource)  
**Decision interval:** ~20–25 s (choose which trade to execute, which encounter to approach)

| Axis | Score | Reasoning |
|---|---|---|
| Decision rhythm | 4 | Trade + encounter decision is clean 20-25 s cycle |
| Wonder tap | 3 | Satisfying but abstract; "spice caravan" theme needs wrapping for Hebrew learners |
| Engine-building | 5 | Every conversion opens new paths; strong prerequisite compounding |
| Topic-fit | 4 | Player reasons about prerequisite chains = statistical topic organization |
| Decoration risk | 1 (low risk) | Token types ARE topic types; no cosmetic separation possible |

**Total: 17/25**

---

### Loop F — Asymmetric Faction Choice *(הבחירה שלי)*

> "Commit to a statistical school. Its tools are your toolkit. Others' tools cost extra."

**Mechanic lineage:**  
Board game: **Arctic Scavengers** (BGG/72125) — each tribe leader gives asymmetric starting ability; choice of leader frames the entire game.  
Mobile: **Reigns** — binary faction-alignment decisions that drift you toward different game states.  
UI source: **Duolingo** — faction/path choice screen at onboarding; visual + emotional differentiation.

**Core loop:**

1. **Faction choice** at session start: Frequentist / Bayesian / Nonparametric.
2. **Encounter** — statistical problem. Each faction has a different "default move" for the same problem. Frequentist defaults to p-value; Bayesian defaults to posterior odds; Nonparametric defaults to rank-based test.
3. **Player decides** — use your faction's default (cheaper) or learn the other faction's approach (expensive but unlocks cross-faction combos).
4. **Compounding** — specialization makes same-faction problems easier; generalization is harder but more powerful.

**Topic-fit:** Meta-statistical reasoning; comparing approaches to the same data; Bayesian vs. frequentist framing  
**Decision interval:** ~20 s per encounter choice

| Axis | Score | Reasoning |
|---|---|---|
| Decision rhythm | 3 | Encounter pace varies; faction choice is a one-time decision per session |
| Wonder tap | 4 | "Which school am I?" is identity-forming and sticky |
| Engine-building | 3 | Specialization compounds but switching costs limit late-game options |
| Topic-fit | 3 | Player thinks about statistical approaches but individual answers are still quiz-adjacent |
| Decoration risk | 2 (moderate risk) | Faction skins could become cosmetic differentiation |

**Total: 15/25**

---

### Loop G — Spatial-Tiling Daily *(הפאזל היומי)*

> "Daily puzzle: fit concept tiles under budget. Each tile shape = prerequisite dependencies."

**Mechanic lineage:**  
Board game: **Patchwork** (BGG/163412) — buy irregularly shaped fabric tiles with limited buttons (currency); fit them into your quilt (grid) to minimize gaps.  
Mobile: **Wordle** — daily reset, one attempt, social sharing of result.  
UI source: **Anthropic.com** — restraint + whitespace; puzzle grid as calm daily ritual.

**Core loop:**

1. **Daily board** — 7×7 grid representing a "week of study."
2. **Concept tiles** available — each tile shape reflects the topic's prerequisite "footprint" (e.g., t-test tile has a notch that requires a probability tile already placed).
3. **Budget** — limited "study energy" tokens (earned by correctly answering tile's gatekeeping questions).
4. **Place** — fit tiles to minimize gaps (gaps = missed prerequisites).
5. **End of day** — coverage % is your "conceptual coherence score."

**Decision interval:** ~30–45 s (too slow for VISION.md's 15–30 s target)  
**Daily reset limits compounding**

| Axis | Score | Reasoning |
|---|---|---|
| Decision rhythm | 2 | Slow; tile placement is deliberate but not frequent |
| Wonder tap | 4 | Aesthetic tile-fitting is satisfying; "full board" = visible mastery |
| Engine-building | 2 | Daily reset breaks compounding; weekly carry-over could fix but adds complexity |
| Topic-fit | 3 | Tile shapes encode prerequisites but answering questions is still quiz-gated |
| Decoration risk | 2 (moderate risk) | Aesthetic tile patterns could become more motivating than learning |

**Total: 13/25**

---

### Loop H — Influence + Bluff *(שוק הנתונים)*

> "Place influence on statistical tests across research scenarios. Control which methods dominate."

**Mechanic lineage:**  
Board game: **Godfather: Corleone's Empire** (BGG/166133) — place influence tokens across city areas; area majorities determine resource flows at round end.  
Mobile: **Reigns** — resource balance as hidden state; decisions accumulate into territory control.  
UI source: **Linear.app** — status board with influence indicators; keyboard-driven placement.

**Core loop:**

1. **Research board** — 6–8 scenarios visible (e.g., "Paired t-test", "ANOVA 3 groups", "Regression diagnostics").
2. **Place influence** — assign your limited attention tokens to scenarios you intend to solve this session.
3. **At end of session** — reveal which scenarios you controlled (solved correctly) vs. lost (wrong or skipped). Resource flows based on majority control.
4. **Strategic depth** — place lightly in many areas (breadth) vs. heavily in few (depth).

**Topic-fit:** Test selection, statistical power (choosing high-power scenarios), effect size estimation  
**Decision interval:** ~25–30 s  
**Decoration risk:** Moderate — control aesthetics (territory coloring) could obscure stats learning

| Axis | Score | Reasoning |
|---|---|---|
| Decision rhythm | 3 | Placement decisions are meaty but not frequent enough |
| Wonder tap | 4 | "I control this statistical domain" is a satisfying identity cue |
| Engine-building | 3 | Controlled territories give future resource bonuses |
| Topic-fit | 4 | Choosing WHICH test to commit to uses test-selection knowledge |
| Decoration risk | 2 (moderate risk) | Territory visuals could overshadow learning loop |

**Total: 16/25**

---

## Ranking summary

| Rank | Loop | Score | Verdict |
|---|---|---|---|
| **#1** | **A — Mutable-Dice Engine** | **20/25** | Build this in Cycle 2 |
| **#2** | **C — Push-Your-Luck Sampling** | **18/25** | Reserve for Cycle 3 or blend with #1 |
| **#3** | **B — Pre-commit Programming Puzzle** | **18/25** | Best for procedure topics (hypothesis-testing pipeline); scope as "advanced mode" post-#1 |
| 4 | D — Run-a-Place Engine | 18/25 | High wonder-tap but decoration risk; revisit if #1 fails to onboard |
| 5 | E — Resource-Trade Engine | 17/25 | Strong compounding; consider as meta-layer atop #1 |
| 6 | H — Influence + Bluff | 16/25 | Interesting test-selection mechanic; narrow topic window |
| 7 | F — Asymmetric Faction | 15/25 | Identity-forming but slow rhythm; good as session-start framing layer |
| 8 | G — Spatial-Tiling Daily | 13/25 | Decision too slow; daily reset kills engine-building |

---

## #1 Detailed Spec — Mutable-Dice Engine *(גלגל הנתונים)*

### Concept in one sentence

The player forges a custom die whose probability distribution IS the statistics curriculum — every face-upgrade decision is a distributional reasoning problem.

### Narrative frame

"You are a data scientist calibrating your statistical intuition. You start with a fair six-sided die — the uniform distribution, the blank slate. As you master concepts, you forge new die faces, shaping your personal sampling instrument. By the end, the die you roll reflects exactly what you've learned."

*(Hebrew learner-facing name: "גלגל הנתונים" — "The Data Die")*

### Session flow (full cycle, ~8 min)

```
┌────────────────────────────────────────────────────────────────┐
│  ROLL                                                          │
│  ↓  tap the die → samples from current face distribution      │
│                                                                │
│  OBSERVE                                                       │
│  ↓  outcome shown + live histogram updates                     │
│     distribution stats (μ, σ², mode) update in HUD           │
│                                                                │
│  QUESTION (20 s)                                               │
│  ↓  problem about YOUR die's current properties               │
│     e.g. "If you upgrade face 2→5, how does μ change?"        │
│                                                                │
│  ANSWER                                                        │
│  ↓  Correct → earn 1 face-upgrade token                       │
│     Wrong   → explanation ("translation shifts mean by Δ")    │
│              + reduced token (partial credit)                  │
│                                                                │
│  FORGE (player decision, 15–20 s)                             │
│  ↓  6 face slots visible. Choose one face to upgrade.         │
│     Preview: "changing face 3→6 shifts μ from 3.5→4.0,        │
│              variance from 2.9→3.5"                            │
│     Commit → die permanently updated                           │
│                                                                │
│  REPEAT (×6–8 per session)                                     │
└────────────────────────────────────────────────────────────────┘
```

### Topic-unlock tree (face forge gates)

| Prerequisite mastered | Unlocked forge action | Concept demonstrated |
|---|---|---|
| *(baseline)* | Upgrade face value (any face) | Mean shift; translation invariance of variance |
| Expected Value | Duplicate a face (one value appears twice) | Probability mass function weighting |
| Variance | Lock two faces together (change one → both) | Variance decomposition |
| Probability distributions | Add a "ghost face" (0.5× probability face) | Continuous vs. discrete; weighted PMF |
| Normal distribution | "Cluster forge": 3 faces must be within 1 of each other | Approximating normality; CLT setup |
| Central Limit Theorem | Combine 2 dice → observe sum distribution | CLT in action; sum of uniforms → normal |

### Questions generated from die state

Questions are **generated at runtime** from the current die configuration — not pulled from a static bank. Examples:

- Die faces `{1,2,3,4,5,6}`: "What is the expected value of this die?"
- Die faces `{1,2,4,4,5,6}`: "How has duplicating face 3→4 changed the variance?"
- Die faces `{2,3,4,4,4,6}`: "Which face upgrade would minimize variance while keeping mean above 3.5?"
- Two dice `{2,3,4,4,5,6}` and `{1,3,4,5,5,6}`: "What distribution do you expect the sum to follow after 30 rolls?"

This means the player is always reasoning about THEIR specific die — personalized statistics practice.

### UI / visual design

**Single-screen layout (mobile-first, RTL):**

```
┌────────────────────────────────────────┐
│  [הפצה שלך]                            │ ← HUD: μ / σ² / mode (--fg tokens)
│  ████████░░░░░░░░░░░░  rolls: 12       │ ← progress pill
│                                        │
│    ┌──┬──┬──┐                          │
│    │1 │4 │3 │  ← die face grid (2×3) │
│    ├──┼──┼──┤     tap to preview     │
│    │4 │5 │6 │     upgrade effect     │
│    └──┴──┴──┘                          │
│                                        │
│  [histogram: 20 roll history]          │ ← --teal bars, --bg-2 background
│  ▁ ▃ ▅ ▇ ▅ ▃ ▁                       │
│                                        │
│  [QUESTION CARD — bottom third]        │
│  "אם תשדרג פאס 2→5, מה יקרה לממוצע?"  │
│                                        │
│  [A] יגדל ב-0.5   [B] יישאר             │
│  [C] יגדל ב-1.0   [D] יקטן             │
│                                        │
│  ─────────────────────────────────    │
│  [ גלגל ]     [ מחשבה ]                │ ← thumb zone; bottom-sheet forge
└────────────────────────────────────────┘
```

**Color palette compliance:** `--bg` (#0e0f12) background, `--bg-2` (#16181d) cards, `--teal` (#10b981) histogram correct bars, `--gold` (#FFD700) forge token indicator, `--fg` (#e8eaed) text, `--mute` (#8a8f99) secondary stats, `--red` (#ef4444) wrong answer flash, `--amber` (#f59e0b) partial-credit indicator. **No new hex values.**

**UI source:** Mini Metro (histogram as permanent HUD, never in a modal) + Linear.app (die-face grid as interactive status board with keyboard shortcuts).

**UI anti-patterns avoided:**
- No modal-on-modal: forge options open as bottom sheet over the die, not a new modal
- No hamburger menu: bottom nav unchanged from existing app
- No hover-only affordances: die face tap-to-preview works on touch

### Vitest unit test plan (Cycle 2 target)

```typescript
// src/lib/diceEngine.test.ts
describe('computeDistribution(faces)', () => {
  it('returns mean=3.5 for standard fair die', ...)
  it('updating face 1→4 increases mean by 0.5', ...)
  it('translation does not change variance', ...)
  it('duplicating a face shifts PMF weight correctly', ...)
  it('sum of two dice converges toward normal (skewness check)', ...)
})
```

### Feature flag

```typescript
// src/config/featureFlags.ts (to be created in Cycle 2)
export const FLAGS = {
  MUTABLE_DICE_ENGINE: false,   // Cycle 2 builds behind this flag
} as const;
```

### Scope boundary for Cycle 2

| In scope | Out of scope |
|---|---|
| Die face grid UI | Sound effects |
| Roll → question → forge loop | Multiplayer |
| `computeDistribution` pure function + Vitest tests | Campaign/story mode |
| Zustand store: die state + roll history | Supabase persistence |
| Feature-flag gate from Study Hub | Teacher dashboard integration |
| RTL Hebrew question display | Full question generation engine (hardcode 10 questions in Cycle 2) |
| Bottom-sheet forge picker | Advanced topic-unlock tree beyond first 2 gates |

### Decision-rhythm validation

Target: 1 meaningful decision every 15–30 s.

```
Roll tap: ~2 s
Outcome + histogram: ~3 s
Read question: ~8 s
Answer: ~5 s
Review forge preview: ~8 s
Commit forge: ~2 s
─────────────────
Total cycle: ~28 s ✓ (within 15–30 s target)
```

### Why this loop rejects "decoration risk"

The 3D city (current iteration) has the following properties:
- Building appears AFTER mastery → building is a **reward**, not a **tool**
- Player cannot USE the city to make a statistical decision
- City is cosmetic confirmation, not gameplay

The Mutable-Dice Engine has the opposite properties:
- Die face IS the statistical system being studied
- Forge decision REQUIRES distributional reasoning
- Wrong forge choices are immediately visible (mean/variance readout changes)
- There is no way to make a cosmetically pleasing die that isn't also a statistically informed one

### Inspiration citations

- **Board game:** Dice Forge (BGG/255504) — mutable die faces as player-forged resources; the mechanic of choosing WHICH face to upgrade is directly borrowed and adapted.
- **Board game (secondary):** Century: Spice Road (BGG/209418) — topic-unlock tree as resource conversion pyramid mirrors the upgrade prerequisite structure.
- **Mobile game:** Threes! — early tile merges (die face choices) compound into late-game possibilities in ways not visible at decision time; teaches patience with engine-building.
- **Mobile game (secondary):** Mini Metro — histogram as a permanent, minimal HUD element that informs routing (forge) decisions without interrupting flow.
- **UI source:** Linear.app — die face grid treated as a Kanban-style status board; tap-to-preview upgrade effect mirrors Linear's issue-detail hover-preview.
- **UI source (secondary):** Apple HIG iOS dark mode — 44pt minimum tap targets on die face grid; elevation via `--card` vs `--bg-2` backgrounds.

---

## Open questions (not blocking Cycle 2)

1. **Metaphor test**: Does "forging a die" resonate for Israeli BA social-science students, or does it need a local metaphor (e.g., "adjusting a scale" / "calibrating a sensor")?
2. **Question generation**: Should questions be fully runtime-generated from die state (more novel, harder to validate) or selected from a tagged bank indexed on die properties (safer, easier to quality-check)?
3. **Session persistence**: Die state carries across sessions — this means a student with a highly upgraded die faces harder questions. Is this the right difficulty ramp?
4. **CLT "combine dice" mechanic**: Combining two custom dice is the most powerful CLT demonstration but requires two sessions of forging first. Cycle 3 could build this; leave as flag-off in Cycle 2.
5. **Wrong-answer forge penalty**: Should a wrong answer *reverse* a previous forge (lossy) or just withhold the next token (lossless)? VISION.md says "failure is informative + recoverable — never a wall" → lossless preferred, but lossy adds push-your-luck element from Loop C.

---

*End of Cycle 01 exploration document.*
