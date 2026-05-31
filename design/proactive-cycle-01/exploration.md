# WaffleStack — Gameplay Exploration, Cycle 01

**Date:** 2026-05-31  
**Branch:** `proactive/exploration/games-design-space`  
**VISION.md version consulted:** v1 (2026-05-21)  
**NotebookLM:** SKIPPED — MCP connector not available this container.  
**Model routing:** Haiku = VISION read + git history triage · Sonnet 4.6 = candidate synthesis + scoring · Opus 4.7 = gameplay design decision (one call, ≤4k output).

---

## Purpose

CYCLE 1 is exploration only — no code. Output: 5–8 candidate gameplay loops, scored against VISION criteria, top-3 ranking, and a detailed design spec for the #1 candidate. This file is the design bible for future build cycles.

---

## Scoring rubric (each axis 1–5)

| Axis | 1 (bad) | 5 (good) |
|---|---|---|
| **Decision rhythm** | decisions >60s apart | one meaningful decision every 15–30s |
| **Wonder tap** | no emotional pull | strong "I want to build / collect / see" |
| **Engine-building** | no compounding | early choices compound into powerful late state |
| **Topic fit** | stat concept adjacent to decision | stat concept IS the decision mechanism |
| **Low decoration risk** | cosmetic rewards could easily replace decisions | structure makes decoration-only mode impossible |

---

## 8 Candidate Gameplay Loops

### Candidate 1 — 🔭 Observatory Engine (Hybrid: Run-a-place × Mutable-Dice × Programming-Puzzle)

| Axis | Score |
|---|---|
| Decision rhythm | 5 |
| Wonder tap | 5 |
| Engine-building | 5 |
| Topic fit | 5 |
| Low decoration risk | 4 |
| **Total** | **24** |

**One-line:** You run an astronomical observatory; each night you craft telescope instruments (mutable statistical tools), pre-commit an observation program (pipeline of stats methods), and watch real noisy/outlier sky data distort your conclusions if you got the sequence wrong.

**Meaningful decisions:**
- Which statistical operation face to add to your telescope (opportunity cost, prerequisite gates)
- What order to sequence operations in tonight's program (cleaning before or after modeling?)
- When to stop collecting and commit to inference (push-your-luck: CI width vs. sample cost)

**Stats concepts used IN decision:** data cleaning order, outlier detection, regression, confidence intervals, sampling distributions, hypothesis testing.

**Decision interval:** ~15–25 seconds per card placement.

**Failure mode:** wrong pipeline order causes the fitted line to visibly tilt toward the outlier on sky; animated step-replay shows exactly which step diverged — never a wall, always re-runnable.

**Board game inspirations:** Dice Forge (mutable die faces = telescope instruments), Mechs vs Minions (pre-commit pipeline), Century Spice Road (prerequisite resource pyramid), Viticulture (seasonal plan/wait/harvest cycle).

**Mobile game inspirations:** Mini Metro (elegant pipeline routing + minimal HUD), Threes (one-session instant restart loop), Monument Valley (spatial/pattern satisfaction).

**Engine-building path:** Night 1 → descriptive faces → Night 2 → clean/outlier faces → Night 3 → regression face → Night 4 → CI face + push-your-luck → Night 5 → hypothesis-test face. The observatory you built over 5 nights is the externalised memory of every concept mastered.

---

### Candidate 2 — 🎲 Dice Forge × Stuffed Fables — "Data Dice Battle"

| Axis | Score |
|---|---|
| Decision rhythm | 5 |
| Wonder tap | 4 |
| Engine-building | 5 |
| Topic fit | 5 |
| Low decoration risk | 4 |
| **Total** | **23** |

**One-line:** Craft dice whose faces are statistical operations; each enemy encounter is a dataset puzzle — roll your toolkit, use what you roll to answer, and upgrade faces as you master concepts.

**Meaningful decisions:** which face to add to which die (opportunity cost), how to combine rolled operations to answer the specific dataset question, which encounter to challenge next (asymmetric target selection).

**Stats concepts used IN decision:** sampling distributions, probability of rolling specific combinations, descriptive statistics as combat moves.

**Decision interval:** ~15–20 seconds per roll + assignment.

**Failure mode:** rolled a die with no useful faces against this puzzle → informative stall, lets you see the gap in your toolkit.

**Board game inspirations:** Dice Forge (mutable dice), Stuffed Fables (per-encounter asymmetric mechanic), Arctic Scavengers (asymmetric "statistical school" class choice).

**Mobile game inspirations:** Slay the Spire mobile (deck/die crafting meets encounter routing), Clash Royale (live toolkit deployment).

**Risk:** combat framing may slip into "quiz with dice skin"; asymmetric Bayesian/frequentist class distinction conflicts with VISION out-of-scope rule (no Bayesian inference this quarter).

---

### Candidate 3 — ⚙️ Pre-commit Pipeline — "Statistical Rogue"

| Axis | Score |
|---|---|
| Decision rhythm | 4 |
| Wonder tap | 3 |
| Engine-building | 3 |
| Topic fit | 5 |
| Low decoration risk | 5 |
| **Total** | **20** |

**One-line:** Roguelite; each run is a full analysis pipeline — pre-commit a sequence (collect → clean → explore → model → test → conclude), watch it execute on a noisy dataset, and iterate from the failure replay.

**Meaningful decisions:** pipeline step order, which branching path to take at each cleaning stage, when to accept a "good enough" conclusion vs. keep refining.

**Stats concepts used IN decision:** hypothesis testing workflow, Type I/II errors emerge directly from over/under-cleaning choices.

**Decision interval:** ~20–30 seconds per step selection.

**Failure mode:** bad pipeline step produces wrong conclusion; replay shows propagation of error — never a loss, always a diagnosis.

**Board game inspirations:** Mechs vs Minions (pre-commit sequence + iterate), Pandemic (cascading consequence of wrong action order).

**Mobile game inspirations:** Mini Metro (pipeline routing), Hades-mobile (roguelite iteration loop).

**Risk:** pipeline-builder loop largely absorbed by Observatory Engine's nightly program mechanic; standalone version weaker without the visual/spatial sky payoff.

---

### Candidate 4 — 🧵 Spatial Tiling Daily — "StatsGrid"

| Axis | Score |
|---|---|
| Decision rhythm | 4 |
| Wonder tap | 5 |
| Engine-building | 3 |
| Topic fit | 4 |
| Low decoration risk | 4 |
| **Total** | **20** |

**One-line:** Daily Wordle-style puzzle: place stats-concept tiles onto a grid, where tile edges connect only if the underlying statistical logic is adjacent (mean → variance → standard-deviation), maximising connected concept clusters under a fixed budget.

**Meaningful decisions:** which tile to place where (spatial + conceptual adjacency), which cluster to grow vs. abandon under budget, whether to gamble on a rare high-value tile.

**Stats concepts used IN decision:** understanding conceptual relationships (prerequisite structure, related families) IS the optimal placement strategy.

**Decision interval:** ~20–30 seconds per tile.

**Failure mode:** orphaned cluster = wasted budget; immediately visible spatially.

**Board game inspirations:** Patchwork (spatial tiling + budget), Azul (set completion scoring), Calico (adjacent-cluster bonuses).

**Mobile game inspirations:** Two Dots (spatial satisfaction + daily ritual), Wordle (daily streak ritual).

**Risk:** lower engine-building potential; satisfaction could tip cosmetic (pretty tile patterns without stats understanding).

---

### Candidate 5 — 🕴 Asymmetric School War — "Stats Factions"

| Axis | Score |
|---|---|
| Decision rhythm | 3 |
| Wonder tap | 3 |
| Engine-building | 4 |
| Topic fit | 4 |
| Low decoration risk | 3 |
| **Total** | **17** |

**One-line:** Three factions (frequentist / nonparametric / descriptive schools) compete for topic-territory on a map; each faction has a unique mechanic for answering questions in their school's domain.

**Meaningful decisions:** which territory to contest, when to defend vs. expand, which faction ability to deploy.

**Stats concepts used IN decision:** understanding that different statistical approaches exist for the same question, and knowing when each applies.

**Decision interval:** ~30–45 seconds (slower; territory map transitions).

**Risk:** "Bayesian" faction violates VISION out-of-scope; scope creep (Cry Havoc risk noted in VISION); slower decision interval; territorial map reading adds a non-stats cognitive layer.

**Board game inspirations:** Cry Havoc (asymmetric factions), Arctic Scavengers (tribe leader specialisation), Root (asymmetric mechanics per faction).

---

### Candidate 6 — 🏃 Confidence Chase — "Sampling Endless Runner"

| Axis | Score |
|---|---|
| Decision rhythm | 5 |
| Wonder tap | 3 |
| Engine-building | 2 |
| Topic fit | 5 |
| Low decoration risk | 4 |
| **Total** | **19** |

**One-line:** Endless runner mechanic: tap/swipe = collecting a data sample; your confidence interval shrinks as n grows but the timer pushes you forward — the core stopping-rule decision is when you have "enough" data.

**Meaningful decisions:** when to stop collecting and commit to inference (push-your-luck: every extra sample narrows the CI at increasing time cost), which population to sample from (different noise profiles).

**Stats concepts used IN decision:** sampling distributions, CI width as a function of n, stopping rules — these ARE the decisions, not adjacent to them.

**Decision interval:** 5–10 seconds (highest rhythm of all candidates).

**Failure mode:** CI too wide → null overlaps → "not significant"; visually the wide band is the lesson.

**Board game inspirations:** Quacks of Quedlinburg (push-your-luck stopping rule), Welcome To... (parallel resource tracking).

**Mobile game inspirations:** Tomb of the Mask (swipe-to-collect rhythm), Downwell (controlled falling = controlled sampling).

**Risk:** shallow engine (no meaningful compounding beyond CI math); best as a standalone topic-drill or minigame rather than a full game shell.

---

### Candidate 7 — 🌶 Pickup-and-Deliver Engine — "DataMart"

| Axis | Score |
|---|---|
| Decision rhythm | 3 |
| Wonder tap | 3 |
| Engine-building | 4 |
| Topic fit | 3 |
| Low decoration risk | 3 |
| **Total** | **16** |

**One-line:** A data-science marketplace; you trade raw datasets, cleaned samples, and derived insights with NPCs who each want different statistical products — the prerequisite pyramid (collect → clean → model → test) maps to Century Spice Road's resource chain.

**Meaningful decisions:** which trade chain to optimise for, which NPC to supply first, when to vertically integrate (do all steps yourself) vs. specialise.

**Stats concepts used IN decision:** understanding prerequisite chains and concept dependencies.

**Decision interval:** ~30–45 seconds.

**Risk:** abstraction layer between trading action and stats concept is thin — easy to win the market game without understanding statistics.

**Board game inspirations:** Century Spice Road (resource pyramid), Catan (negotiated trading), Bohnanza (trade sequencing).

---

### Candidate 8 — 🏪 Run-a-Place Engine-Builder — "Research Lab"

| Axis | Score |
|---|---|
| Decision rhythm | 3 |
| Wonder tap | 4 |
| Engine-building | 5 |
| Topic fit | 3 |
| Low decoration risk | 2 |
| **Total** | **17** |

**One-line:** You run a statistics research lab; NPCs bring data requests, you assign mastered-concept staff to specialised rooms, and process requests to grow funding.

**Meaningful decisions:** room upgrade priority, staff assignment, which client requests to prioritise.

**Stats concepts used IN decision:** indirectly — the room system could become fully cosmetic (assign researcher → get XP → unlock room art) without stats knowledge.

**Decision interval:** ~30–60 seconds.

**Risk:** highest decoration risk on the list; rooms easily become cosmetic upgrades without stats-decision content unless heavily guarded.

**Board game inspirations:** Viticulture (worker placement + seasonal cycles), Caverna (room-building specialisation), Coffee Rush (real-time request triage).

---

## Top-3 Ranking (by Opus 4.7 design decision)

| Rank | Candidate | Score | Key reason |
|---|---|---|---|
| **#1** | 🔭 Observatory Engine | 24 | Only candidate satisfying all 6 VISION hard criteria simultaneously; spatial sky makes the stats consequence *visible*; persistent place the player builds = mastery externalised |
| **#2** | 🎲 Data Dice Battle | 23 | Excellent decision rhythm + engine, but Bayesian class conflicts with out-of-scope rule; combat framing risks quiz-skin; engine resets per encounter so mastery never accretes into a visible place |
| **#3** | 🏃 Confidence Chase | 19 | Promoted over Statistical Rogue because its pipeline mechanic is absorbed by Observatory's nightly program; Confidence Chase teaches a distinct, critical concept (stopping rules / CI width) not covered until Night 4 of Observatory — best complement or future minigame |

> **Opus 4.7 note on #3 promotion:** Statistical Rogue (original #3, score 20) is demoted because its core mechanic is subsumed by the Observatory's pre-commit program — it is redundant as a standalone. Confidence Chase (score 19) teaches a genuinely distinct concept cluster, making it the better #3 and a natural future extension of Observatory's Night 4.

---

## #1 Detailed Spec — מצפה הכוכבים (The Observatory)

**Full title:** מצפה הכוכבים  
**Subtitle:** *תכנת את הלילה, גלה את האמת* ("Program the night, uncover the truth")

> This section is reproduced from the Opus 4.7 design decision (one call, ≤4k output as required).

### Core loop (5-minute session = one "night")

The player runs an astronomical observatory rendered as a calm dark-sky R3F scene. A session is one **night** in four beats:

1. **Craft (ייצר)** — spend mastered-concept tokens to add/upgrade *faces* on telescope instruments (each face = a statistical operation: trim-outliers, fit-line, compute-CI, run-test).
2. **Aim (כוון)** — pick which sky targets (datasets) to observe tonight from a branching star-map; player has full agency over topic order.
3. **Pre-commit the program (תכנת)** — drag operation-cards into an ordered pipeline (collect → clean → explore → model → conclude) *before* seeing results.
4. **Execute & diagnose (הרץ ואבחן)** — the night plays out: noisy/outlier/missing sky data flows through the committed pipeline, results animate onto the sky (fitted line, CI band, verdict). Player reads the outcome and sees *which step distorted the truth*; banks insight.

Each beat holds a meaningful decision every ~15–25 seconds.

### Decision anatomy (3 critical decisions)

**A. Cleaning order — "Do I trim before or after I model?"**
- **Concept taught:** outliers, robustness, mean vs. median, leverage in regression.
- **Must understand:** an outlier dragged through a regression face corrupts the slope; trimming after modeling is too late — order matters.
- **If wrong:** the fitted line visibly tilts toward the outlier star; verdict = "מסקנה מוטה" (biased conclusion) with the offending star pulsing `--red`. Re-runnable immediately.

**B. Telescope face crafting — "Which operation deserves a face?"**
- **Concept taught:** probability + sampling — each instrument is a die you roll from; adding a face changes the sampling distribution of available operations.
- **Must understand:** faces are scarce (cost mastered-tokens); CI-face is useless without sufficient collection-faces. Prerequisite structure (Century Spice Road pyramid) made visible.
- **If wrong:** pipeline stalls at the un-crafted step with "אין כלי למשימה" (no tool for this task) — informative, not a loss; the night is re-craftable.

**C. Stopping / sample-size — "Enough light collected?"**
- **Concept taught:** CI width vs. n, precision–cost tradeoff, hypothesis test power.
- **Must understand:** more observation slots = narrower CI band but fewer targets covered; push-your-luck tradeoff.
- **If wrong:** CI band renders so wide it overlaps the null line → "לא מובהק — דגימה קטנה מדי" (not significant — sample too small). The wide band is the lesson, visually.

### Engine-building progression (5 sessions)

| Night | New faces available | New sky phenomena | Unlocked concept |
|---|---|---|---|
| 1 | collect, mean | clean dataset | Descriptive stats: מדדי מרכז |
| 2 | median, trim-outlier, missing-value handler | dirty data (outliers + gaps) | מדדי פיזור + חריגים |
| 3 | correlation, fit-line | two-variable star fields | מתאם ורגרסיה |
| 4 | CI band, push-your-luck slots | high-variance sky noise | רווחי סמך + כוח סטטיסטי |
| 5 | hypothesis-test, null line overlay | contradictory datasets | מבחני השערות |

The observatory the player built over 5 nights is the externalised memory of every concept mastered — visible, spatial, persistent.

### Failure-mode design

Failure is never a wall. Every night is re-runnable with the same sky seed. On a wrong conclusion:

1. The sky **replays the pipeline step-by-step**, pausing at the divergence point.
2. A bottom-sheet explanation appears: *"כאן הנתון החריג הטה את הקו"* ("here the outlier tilted the line") with the offending data point pulsing `--red`.
3. Player edits one card in the pipeline and re-executes. The contrast between the two runs is the teaching moment.
4. No HP, no game-over. Currency is "תובנות" (insights) — banked or not-yet-banked.

### Hebrew UX sketch (4 screen states)

1. **לוח לילה (Night board):** dark R3F sky, instrument tray at bottom (thumb zone, 44pt+ hit targets), "התחל תצפית" CTA above fold. Palette: `--bg` sky, `--card` tray, `--gold` for ready-to-craft indicators.
2. **בחירת יעדים (Aim / star-map):** branching constellation path-tree, mobile-vertical Duolingo-mountain shape, RTL labels, each star = dataset target with difficulty pip (`--teal` = accessible, `--amber` = intermediate, `--red` = advanced).
3. **תכנות התצפית (Program):** ordered drag-list of operation-cards (RTL), prerequisite hairlines between cards (`--border`), disabled slots show "🔒" with unlock cost.
4. **תוצאות הלילה (Results):** fitted line / CI band animating onto sky, bottom-sheet verdict in one sentence + "הרץ שוב" (re-run same seed) and "גלה מדוע" (step-replay). No modal-on-modal.

### Stats curriculum map (Israeli intro-stats syllabus)

| Topic (Hebrew) | Observatory mapping | Night |
|---|---|---|
| סטטיסטיקה תיאורית — מדדי מרכז | Mean / median face crafting | 1 |
| מדדי פיזור + חריגים | Trim face; outlier visual | 2 |
| התפלגויות וצורת נתונים | Histogram sky overlay | 2–3 |
| הסתברות ומשתנים מקריים | Underlies face-crafting throughout | 1–5 |
| מתאם ורגרסיה לינארית | Fit-line face; two-variable sky | 3 |
| התפלגות הדגימה ושגיאת תקן | Sampling face + CI band | 4 |
| רווחי סמך | CI band + push-your-luck slots | 4 |
| מבחני השערות | Hypothesis-test face + null line | 5 |

Out of scope: Bayesian inference, time-series, causal inference (VISION line 213).

### Board game + mobile game citations

| Source | Type | Mechanic borrowed |
|---|---|---|
| **Dice Forge** [BGG/241964] | Board | Mutable die faces → upgradeable telescope instruments; your statistical toolkit literally mutates |
| **Mechs vs Minions** [BGG/209010] | Board | Pre-commit a move sequence then watch it execute → the observation-program pipeline |
| **Century Spice Road** [BGG/209685] | Board (supporting) | Resource-pyramid prerequisites → faces gate faces |
| **Viticulture** [BGG/128621] | Board (supporting) | Seasonal plan/wait/harvest cycle → nightly plan/observe/bank-insight cycle |
| **Mini Metro** | Mobile | Minimal-HUD elegant routing → program-pipeline drag UI and visual restraint |
| **Threes** | Mobile | Instant one-session restart loop → "הרץ שוב" same-seed re-run |

### Prototype scope (~2 weeks focused dev)

**IN scope:**
- Single instrument; 4 faces (collect, mean, trim-outlier, fit-line)
- One hardcoded sky seed with a planted outlier and clean variant
- Pre-commit drag-pipeline of ≤4 cards
- R3F sky scene: stars (instanced points, single draw call) + animated fitted line
- Step-replay diagnosis animation
- Hebrew RTL for all 4 screen states
- Zustand store for night-state
- Feature flag `OBSERVATORY_PROTOTYPE` in `src/config/featureFlags.ts`
- Covers curriculum topics: descriptive stats (Night 1) + outliers (Night 2) + regression (Night 3)
- At least one Vitest unit test for the pipeline-execution pure logic

**OUT of scope for prototype:**
- CI bands, hypothesis-test face, push-your-luck slots
- Full star-map branching (use 3 fixed targets)
- Token economy / crafting cost balance
- Sound / haptics
- Multi-instrument observatory
- Save / auth / Supabase
- Bayesian / nonparametric anything
- Teacher dashboard

### Risk analysis

| Risk | Likelihood | Mitigation |
|---|---|---|
| Pipeline-builder feels like a quiz with extra steps | Medium | The spatial sky payoff (line visibly tilting) must be the dominant feedback channel, not a text verdict. Prototype the visual-divergence replay first, before any copy is written. |
| Cognitive overload — too many faces/concepts at once | Medium | Hard gate to ≤4 faces in prototype; introduce one new face per night; prerequisite hairlines make structure visible, not memorised. |
| R3F sky blows 16ms / FCP <1.5s budget on Israeli 4G | High | Instanced star points (single draw call), no post-processing, lazy-load R3F off the main bundle, skeleton sky (CSS) on first paint. |

### Why Observatory beats Data Dice Battle (#2)

Observatory gives the player a **persistent place they build over nights** — the instruments are the externalised memory of every concept mastered, so progression is *spatial and visible*, not a stat sheet. Data Dice Battle's per-encounter engine resets each fight, so mastery never accretes into a visible thing. Crucially, Observatory's pre-commit-then-watch-it-distort loop teaches *procedure* (the heart of intro stats — the analysis workflow) which combat's roll-and-answer structure cannot.

---

## Open questions (for Barak's consideration)

1. **Theme fit:** Does "astronomical observatory" resonate with Israeli BA social-science students? Alternative: run a **hospital ER's diagnostic lab** (same mechanic, medical data context) — may be more relatable for social-science learners studying surveys and populations. Agent proposes; Barak decides.
2. **Push-your-luck in Night 4:** The stopping-rule mechanic (Confidence Chase absorbed) requires the player to feel the tension between precision and speed. This needs live playtesting — hard to validate without a real user. Prototype should include a simulated CI-width animation on the pipeline even before Night 4 to test if the visual resonates.
3. **Face crafting cost balance:** Token cost for faces is a balance problem that will require iteration. Prototype should expose a dev-mode slider for cost tuning.
4. **Mobile gesture for pipeline reorder:** RTL drag-to-reorder on a vertical list on mobile has known usability issues (conflicting with scroll gesture). Needs UX decision: tap-to-select + tap-destination, or long-press drag with haptic confirmation?

---

*Exploration cycle complete. Next cycle: implement Observatory prototype behind `OBSERVATORY_PROTOTYPE` feature flag.*
