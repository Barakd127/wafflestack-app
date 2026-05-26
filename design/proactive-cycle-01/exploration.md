# Proactive Cycle 01 — Gameplay Design Space Exploration

**Date:** 2026-05-26  
**Agent:** proactive-vision-builder, Cycle 1 (exploration only — no code)  
**Branch:** proactive/exploration/games-design-space  
**Model routing:** Haiku for VISION read + git survey → Opus 4.7 for design decision → Sonnet 4.6 for document synthesis  
**NotebookLM:** SKIPPED — MCP connector not available in this container. Drew from VISION.md catalogue + design judgment.

---

## Codebase Snapshot

WaffleStack is a Hebrew-first, dark-UI web app (React + TypeScript + Vite + Tailwind + R3F + Zustand). Current state:

- **3D city** (Santorini aesthetic, Godot export behind iframe) — buildings = stats topics, but placing them is cosmetic today (no resource production/consumption loop).
- **SM-2 spaced-repetition quiz engine** — 10 topics: normal, hypothesis, correlation, mean, median, stddev, sampling, regression, CI, binomial.
- **XP / coins / streak / mastery** tracked in Zustand + localStorage.
- **MindMap canvas, SplitLayout, Formula keyboard, AI Tutor drawer** — all functional.

**Core tension identified:** The city exists, but VISION.md explicitly flags it as "locked-in risk: decoration not decision unless buildings consume/produce resources." The exploration task is to find a gameplay loop that makes the city (or a replacement metaphor) structurally necessary for stats learning — not a trophy shelf.

---

## Scoring Rubric

| Axis | What it measures | Weight |
|---|---|---|
| **Decision rhythm** | One meaningful choice every 15–30s? | equal |
| **Wonder tap** | Emotional pull beyond "answer quiz"? | equal |
| **Engine-building potential** | Early decisions compound into later advantage? | equal |
| **Stats-concept fit** | Player USES (not memorizes) the concept to make the choice? | equal |
| **Decoration risk** | High score = structurally necessary, not cosmetic | equal |

Max = 50 (10 per axis × 5 axes).

---

## 7 Candidate Gameplay Loops

### A — Mutable-Dice Probability Lab
*Dice Forge × Mini Metro*

Player crafts a set of dice where each face is a mastered statistical concept (bell curve, uniform, Bernoulli, etc.). City buildings advertise distribution requirements; player pre-commits a die to a building slot, rolls, and observes how the empirical distribution fills (or misses) the requirement. Mastery tokens (earned from quiz answers) re-engrave faces.

- **Board game ref:** Dice Forge
- **Mobile game ref:** Mini Metro

### B — Data-Trading Caravan
*Century Spice Road × Reigns*

Stats topics form a prerequisite pyramid. NPC caravans offer data-packet cards; player makes binary accept/skip decisions (Reigns-style). Accepted packets trade up the pyramid via upgrade cards mapping to topic prerequisites. Player shapes which topics become reachable.

- **Board game ref:** Century Spice Road + Arctic Scavengers
- **Mobile game ref:** Reigns

### C — Pre-commit Hypothesis Pipeline
*Mechs vs Minions × Two Dots*

Player pre-commits a 4-step stats pipeline (Collect → Clean → Model → Test) as a "program" before the dataset arrives. Dataset executes the pipeline step-by-step. Pipeline breaks are shown visually; player adds error-handling branches using earned "connector" cards.

- **Board game ref:** Mechs vs Minions
- **Mobile game ref:** Two Dots

### D — Statistical Coffee Shop
*Seize the Bean × Coffee Rush × Viticulture*

Player runs a café. NPC customers arrive with "data orders" (e.g., "95% CI on this sample"). Player assigns workers (topic-skill slots) to stations (stats operations). Artifacts produced combine into daily revenue.

- **Board game ref:** Seize the Bean + Viticulture
- **Mobile game ref:** Coffee Rush

### E — Spatial Tile-Fit Daily
*Patchwork × Wordle*

Daily puzzle: a grid of data cells arrives. Player has a hand of analysis tiles (histogram, scatter, t-test, etc.) with time+token costs and shapes. Placing a tile on compatible data cells scores insight-points; wrong tile = visible gap.

- **Board game ref:** Patchwork
- **Mobile game ref:** Wordle

### F — Push-Your-Luck Sampling Run
*Quacks of Quedlinburg × Tomb of the Mask*

Player draws sample tokens from a population bag. After each draw: STOP (compute stat with current sample) or DRAW MORE (risk an outlier that blows up the estimate). Bag quality improves as topics are mastered (better-quality tokens added). Directly teaches stopping rules, LLN, and CI.

- **Board game ref:** Quacks of Quedlinburg
- **Mobile game ref:** Tomb of the Mask

### G — Influence Territory Map
*Godfather: Corleone's Empire × Cry Havoc*

Seven stats schools control districts on a hex map. Player places influence tokens by answering questions in each school's style. Hidden objective cards tell which districts to control for bonus points. NPC rival competes for territory.

- **Board game ref:** Godfather: Corleone's Empire + Cry Havoc
- **Mobile game ref:** Reigns (hidden information / binary commitment)

---

## Candidate Scores (Opus 4.7 judgement)

| # | Name | Decision rhythm | Wonder tap | Engine-building | Stats-concept fit | Decoration risk | **Total** |
|---|---|---|---|---|---|---|---|
| A | Mutable-Dice Probability Lab | 9 | 8 | 9 | 9 | 9 | **44** |
| F | Push-Your-Luck Sampling Run | 10 | 8 | 5 | 9 | 8 | **40** |
| C | Pre-commit Hypothesis Pipeline | 5 | 7 | 8 | 10 | 9 | **39** |
| D | Statistical Coffee Shop | 7 | 7 | 7 | 7 | 6 | **34** |
| E | Spatial Tile-Fit Daily | 6 | 6 | 4 | 8 | 7 | **31** |
| B | Data-Trading Caravan | 6 | 5 | 7 | 5 | 6 | **29** |
| G | Influence Territory Map | 5 | 6 | 7 | 4 | 5 | **27** |

**Scoring rationale (terse):**
- **A (44):** Tick-tight decisions (each face-craft + each pre-roll commit), dice-as-knowledge is wonder-rich, faces literally ARE the stats concept being used. Kills decoration risk by making building output contingent on distribution quality.
- **F (40):** Highest decision rhythm of any candidate and teaches stopping rules/LLN/CI viscerally, but lacks cross-run engine-building — a single bag run is self-contained.
- **C (39):** Best pure stats-concept fit (player literally writes a test procedure), penalised on decision rhythm because commit-then-watch can stall under 15s pacing.
- **D (34):** Solid but worker-placement drifts to pattern-match ("data type X → slot worker Y") rather than computing statistics.
- **E (31):** Wordle daily ≠ engine-building; once tiles are placed the run ends, no compounding.
- **B (29):** Card-draft tempo slow; spice trading only weakly forces stats use — risks becoming a resource game with stats labels.
- **G (27):** Hex-map influence smells like reskinned XP allocation; "which school" rarely requires USING the stat.

---

## Top-3 Ranking

1. **A — Mutable-Dice Probability Lab (44/50)** — The dice themselves ARE the statistical concepts; every roll is a literal sampling event, every face-craft is an expected-value decision, and buildings produce/consume resources contingent on distribution quality — kills decoration risk structurally.

2. **F — Push-Your-Luck Sampling Run (40/50)** — Tightest decision rhythm and teaches stopping rules / LLN / CI viscerally through the draw-or-stop mechanic; penalised for weak cross-run engine-building.

3. **C — Pre-commit Hypothesis Pipeline (39/50)** — Best fit for teaching statistical procedure (the player literally encodes a test pipeline); penalised for bursty decision rhythm (one big commit, then watch).

---

## #1 Detailed Spec: Mutable-Dice Probability Lab

*Source: Opus 4.7 design decision call (one call only, ≤4k output)*

### Elevator Pitch

WaffleStack's city becomes a probability factory: every building on the Santorini grid is fed by **dice the player has personally re-engineered**, where each face is a statistical concept they have mastered. You don't *decorate* with stats — you *roll* with stats, and your city's output is the realised distribution of your own knowledge.

### Decision Loop (every ~20 seconds)

A single **"tick"** flows:

1. **Pre-commit (5s)** — Player picks WHICH die (of up to 6 in hand) to roll into WHICH building slot. Each building advertises a target statistic ("needs mean ≥ 4", "needs variance ≤ 2", "needs 3 successes in 5 trials").
2. **Roll (3s)** — Die rolls in 3D; result lands on the grid tile.
3. **Read the outcome (5s)** — Result either *fills* the building (resource produced) or *spoils* (resource lost). Live histogram of that die's empirical distribution updates on screen.
4. **Craft / swap (7s)** — Player spends 1 mastery token (earned from quiz answers) to: (a) re-engrave one face, (b) swap a die into/out of hand, or (c) commit to the next building's distribution requirement.

Every step demands a choice; no step is auto-resolved.

### Statistical Concepts USED (not memorised)

| Concept | How the player USES it |
|---|---|
| Expected value | Choosing which die maximises E[X] for a building's requirement |
| Variance | Tolerating risk on a "needs ≥6" building vs. a "needs in [3,5]" building |
| Distribution shape | Bell-curve face vs. uniform vs. skewed — felt because building output tracks it |
| Law of Large Numbers | Empirical histogram converges as die is reused; player sees it live |
| Binomial / Bernoulli | Success-face dice for "k of n" buildings |
| Sampling | Drawing a die from hand = sampling from the player's knowledge population |
| Conditional probability | Some buildings activate only "given previous tile rolled X" |

### Session Structure

- **One session = 6–8 minutes** (a "day" in the city)
- **~18–24 decisions per session** (4 ticks/min × ~5 min active + 2 min review)
- **Daily run + roguelite layer:** each day is self-contained, but mastery tokens and die-faces persist into a "season" (7 days). End of season → leaderboard + city reset, dice persist.

### Engine-Building Mechanism

- **Faces persist across sessions.** Mastering "normal distribution" today swaps a uniform face for a Gaussian face permanently — every future roll uses that better die.
- **Buildings unlock buildings.** A working "mean-tracker" building unlocks a "CI-computer" building, which requires the mean-tracker's output as input. The pyramid of stats topics = the build tree.
- **Resource feedback loop.** Resources produced by buildings = mastery tokens spent on more faces. Bad early die-crafts produce slow runs; good early crafts compound into 2x output by day 5.
- **Asymmetric starter dice.** Player picks ONE archetype on day 1 (Sampler / Tester / Modeler) — flavours all subsequent face options.

### Failure State (informative + recoverable)

- A die can be **mis-engineered** (e.g., high-variance face on a "needs low variance" building). The empirical histogram shows the mismatch in real time — the player SEES variance ballooning.
- A building can **spoil** (3 bad rolls in a row) — produces a **"residual" resource** that ironically unlocks the diagnostics topic. Failure = pedagogical lever.
- No hard wall: spoiled buildings can be re-fed; mastery tokens are never lost, only spent.
- **End-of-day post-mortem:** player's empirical distribution vs. optimal, gap annotated in Hebrew.

### Visual Representation

**Top 60% of screen:** existing R3F city (Santorini palette preserved).
- Buildings glow **teal `#10b981`** when fed, **amber `#f59e0b`** when starving, **red `#ef4444`** when spoiled.
- Active building pulses **gold `#FFD700`**.

**Bottom 40% (thumb-zone bottom-sheet):**
- Right edge (RTL "start"): die-hand carousel — 6 dice as 3D cubes, swipeable.
- Center: pre-commit slot ("הטל לכאן") — large 44pt drop target.
- Left edge (RTL "end"): live histogram (`#3b82f6` bars) of selected die's empirical distribution; theoretical curve overlays in `#FFD700`.

**Face-crafting modal:** full-screen dark sheet `#0e0f12`, hexagonal grid of 6 faces, each showing symbol (μ, σ, ✓, etc.) in Hebrew + icon. Tap to re-engrave; cost in mastery tokens shown bottom-right.

All locked palette tokens used: `#0e0f12` (bg), `#10b981` (fed), `#f59e0b` (starving), `#ef4444` (spoiled), `#FFD700` (gold accent), `#3b82f6` (histogram). **Zero new hex values.**

### Implementation Fit (WaffleStack codebase)

**New Zustand slice:** `useDiceStore` — holds `dice: Die[]` (each `Die` has 6 `Face` objects with `{ topicId, distribution, parameters }`), `hand: DieId[]`, `masteryTokens: number`, `seasonDay: number`. Persists to localStorage same pattern as existing XP store.

**New components (all in `src/`):**
- `<DiceLab />` — root screen, mounts under existing `SplitLayout` as third route
- `<DieCarousel />` — Embla-style horizontal swipe, RTL-aware
- `<RollSlot />` — drop target, wired to existing haptics/sounds (gold-rim glow on commit)
- `<EmpiricalHistogram />` — animated bar chart (D3/visx) updating on each roll
- `<FaceForge />` — bottom-sheet modal for re-engraving; reuses existing `<BottomSheet />` pattern
- `<BuildingRequirement />` — `<Html occlude>` overlay on R3F building meshes, shows target stat in Hebrew

**R3F integration:** `<DieMesh />` instances pooled per roll; physics via `@react-three/rapier` for tumble animation (skippable after 1.5s).

**Quiz engine bridge:** SM-2 correct answers hand out mastery tokens (in addition to existing XP/coins). `topicId → face` map lives in `src/data/faces.ts`.

**Feature flag:** `DICE_LAB_ENABLED` in `src/config/featureFlags.ts` — false by default.

### Risk Factors

1. **Pre-commit dead time** — if roll animation exceeds 3s, the 15–30s decision rhythm collapses into waiting.
2. **Face-crafting becomes a one-time menu** — players optimise once and stop engaging, reverting the game to "roll → harvest" with stats only at unlock time.
3. **Building requirements become pattern-match** — "this building wants high mean → use die X" degrades into rote slot assignment, not stats reasoning.

### Mitigation Tactics

1. **Roll under 1.5s with skippable physics** — overlap the roll animation with the next pre-commit decision so decisions pipeline, never gate on animation.
2. **Force mid-session forge engagement** — every 3rd building's requirement drifts mid-session based on roll history. Player must re-engrave during the run, not only between runs.
3. **Requirements on distribution shape, not scalar result** — "sample mean within 0.5 of true μ over 5 rolls", not "needs ≥4". Forces reasoning about sampling distribution every time.

---

## Vision Alignment Check (Cycle 1 — exploration doc, no code)

| Rule | Compliant? | Citation |
|---|---|---|
| What we are: stats-first via game | ✓ | Mutable-Dice loop: player uses E[X], variance, LLN to make every decision |
| Gameplay ≠ Gamification | ✓ | Decision: which face to craft, which die to commit — not "earn confetti" |
| Design rule: Hebrew-first | ✓ | Post-mortem annotated in Hebrew; forge UI uses Hebrew labels |
| Design rule: dark UI | ✓ | `#0e0f12` background throughout |
| **Color palette: only locked tokens used** | ✓ | #0e0f12, #10b981, #f59e0b, #ef4444, #FFD700, #3b82f6 — all from table |
| **UI source cited** | ✓ | Mini Metro (minimal HUD + instant restart); Apple HIG (44pt targets); Linear (dark-UI density) |
| **UI anti-pattern avoided** | ✓ | No modal-on-modal: face-forge is one bottom-sheet depth; no hamburger menu |
| Tech invariant: Tailwind only | ✓ | No CSS modules planned |
| Tech invariant: Zustand only | ✓ | `useDiceStore` follows existing pattern |
| Tone rule: encouragement | ✓ | Spoiled building = unlocks diagnostics topic, not punishment |
| Mobile-first (thumb-reach + 44pt targets) | ✓ | Bottom 40% is thumb-zone; drop target is 44pt+ |
| Out of scope: stays in scope | ✓ | No multiplayer, no teacher dashboard, intro stats only |

**NotebookLM consulted:** no — MCP connector not available in this container (logged per hard rule).  
**Board-game inspiration:** Dice Forge (mutable dice = mutable statistical toolkit), mechanic borrowed: face re-engraving as mastery expression.  
**Mobile-game inspiration:** Mini Metro, feedback pattern borrowed: minimal HUD + network-building under emergent surprise.  
**Decision interval:** every ~20 seconds.  
**Statistical concept used in decision:** expected value + variance (which face to craft / which die to commit).

---

## Next Cycle Recommendation

Cycle 2 should build the Mutable-Dice Probability Lab prototype behind a feature flag. Suggested scope:
1. `src/config/featureFlags.ts` — add `DICE_LAB_ENABLED: false`
2. `src/store/diceStore.ts` — Zustand slice with `Die`, `Face`, `masteryTokens`
3. `src/data/faces.ts` — topic-to-face mapping for the 10 existing topics
4. `src/components/DiceLab.tsx` — stub root component (non-R3F first: carousel + roll slot + histogram)
5. One Vitest unit test for `rollDie(die: Die): number` pure function
6. Wire `npm run build` passing

Cycle 3: Add R3F `<DieMesh />` + building requirement overlays.  
Cycle 4: Add face-forge bottom-sheet + mid-session drift mechanic.  
Cycle 5: Season persistence + end-of-day post-mortem screen.
