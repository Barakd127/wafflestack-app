# Proactive Vision Builder — Cycle 01: Gameplay Loop Exploration

**Date:** 2026-05-21  
**Branch:** `proactive/exploration/games-design-space`  
**Cycle type:** EXPLORATION ONLY — no code changes  
**Analyst model:** claude-sonnet-4-6  
**Design decision model:** claude-opus-4-7 (delegated inline via prompt)

---

## Context: Current State of WaffleStack's Core Loop

WaffleStack is a statistics-learning platform for MA-level psychology students. The current core loop is:

1. Student opens **Study Hub** → sees a grid of topic buildings (mean, SD, normal dist., etc.)
2. Student clicks a building → **StatChallenge** modal opens → quizzes them on that topic
3. Correct answers → XP awarded → SM-2 algorithm schedules next review
4. XP gates unlock new buildings in the 3D city
5. Session ends when student closes the modal

**Anti-patterns diagnosed in the current loop:**
- **No in-session player decision.** Once a building is selected, the student is purely reactive: question appears, student answers, repeat. The only "choice" is "which building to click," which is cosmetic (SM-2 should be driving this anyway).
- **SM-2 is passive/invisible.** The spaced repetition algorithm picks what needs reviewing, but the student never sees or influences it. There's no metacognitive engagement ("do I actually know this?").
- **No stakes, no tension, no risk.** Every question is equivalent. A correct answer on a concept you mastered a month ago earns the same XP as one you're seeing for the first time. No urgency.
- **Session structure is flat.** Five questions, each identical in structure. No arc, no climax, no ending ritual.
- **No replayability driver.** Once a student has answered the daily SM-2 cards, there's nothing that makes them want to do another session for intrinsic reasons.

---

## Vision Alignment Table

| Criterion | Source |
|-----------|--------|
| Statistics first — every session advances education | PROJECT.md vision |
| Visual/spatial progress that feels emotionally satisfying | PROJECT.md pillar 2 (3D city) |
| Collection + completion mechanics | PROJECT.md pillar 4 (gamification) |
| 5–10 min meaningful sessions | PROJECT.md success criteria |
| Mobile-aware (375px+) | PROJECT.md design principle 4 |
| Glassmorphism / frosted glass UI | PROJECT.md design principle 2 |
| Hebrew + English bilingual | PROJECT.md design principle 3 |
| No regressions to existing features | PROJECT.md design principle 5 |

---

## Scoring Rubric (per candidate, /10 each axis)

| Axis | What it measures |
|------|------------------|
| **Agency** | Does this change what the player *decides*? (0 = cosmetic, 10 = fundamentally new decision) |
| **Anti-pattern fix** | Does this directly address a diagnosed anti-pattern? |
| **Stats-first** | Does every interaction advance statistical understanding? |
| **Emotion** | Does it create satisfaction, tension, or pride visible to the student? |
| **Session fit** | Does it work in 5–10 min without requiring heavy setup? |
| **Mobile** | Can it be used one-handed on a 375px screen? |
| **Buildability** | Can it ship in ≤3 development cycles without a rewrite? |
| **Distinctiveness** | Is it not already in the app, and not a Duolingo clone? |

---

## The 8 Candidate Gameplay Loops

---

### Candidate 1 — Curriculum Tree (Directed Skill Graph)

**Concept:** Replace the free-pick building grid with a directed acyclic skill graph where nodes are concept clusters. Player traverses the tree and chooses which branch to take at each fork (e.g., "go to t-test OR ANOVA next"). SM-2 is retained but only operates within the branch the student is currently on.

**What the player decides:** Which learning path to walk — sequence of topics, not just "which one today."

**Board game inspiration:** *Pandemic Legacy* — players must decide which crisis to address first; the choice of ordering matters strategically.  
**Mobile game inspiration:** *Duolingo* (skill tree path) + *Slay the Spire* (branch selection on the map, each path offers different encounters).  
**UI inspiration:** Slay the Spire map screen — vertical nodes, branching paths, visible future states.

**Anti-patterns fixed:** Removes the "click any building randomly" anti-pattern; makes learning sequence a strategic player decision.

| Axis | Score | Notes |
|------|-------|-------|
| Agency | 9 | Fork decisions change entire learning trajectory |
| Anti-pattern fix | 8 | Fixes free-pick; doesn't fix flat session structure |
| Stats-first | 9 | Concept dependencies map to real statistical prerequisites |
| Emotion | 8 | Seeing path progress is satisfying; "I chose this route" ownership |
| Session fit | 8 | One node = one session, clean boundary |
| Mobile | 8 | Vertical tree maps naturally to scroll |
| Buildability | 7 | Requires DAG data model + new UI — 2-3 cycles |
| Distinctiveness | 8 | Not in app; less clone-y than raw Duolingo |
| **TOTAL** | **73** | |

---

### Candidate 2 — Exam Gauntlet (Roguelite Session Run)

**Concept:** Each session is a discrete "run" — 10 questions drawn from mixed topics, styled as an exam scenario with a narrative wrapper ("Your professor has assigned a surprise quiz..."). Player sees the 10 question *topics* (but not the questions) before beginning, and must decide the order in which to tackle them. A "boss question" at position 10 is always a complex multi-step problem requiring synthesis across 2+ topics.

**What the player decides:** Order of questions within the run; pacing (can skip and return to a question once).

**Board game inspiration:** *Spirit Island* — players must triage and sequence responses to escalating crises; order of operations determines outcomes.  
**Mobile game inspiration:** *Alto's Odyssey* — each run has a clear arc (start → flow → obstacle → landing); sessions feel complete in themselves.  
**UI inspiration:** *Slay the Spire* — the "run" framing; discrete sessions that feel like episodes.

**Anti-patterns fixed:** Flat session structure (adds arc + boss moment); no stakes (run completion is binary win/fail).

| Axis | Score | Notes |
|------|-------|-------|
| Agency | 8 | Question ordering is genuine strategic choice |
| Anti-pattern fix | 7 | Adds arc; doesn't fix SM-2 passivity |
| Stats-first | 8 | Cross-topic boss question is educationally strong |
| Emotion | 9 | Run structure creates clear tension/resolution |
| Session fit | 9 | 10 questions ≈ 8 min; perfect |
| Mobile | 9 | Vertical card stack works on phone |
| Buildability | 8 | Boss question requires some new question data |
| Distinctiveness | 9 | Roguelite framing for education is rare |
| **TOTAL** | **77** | |

---

### Candidate 3 — Research Project Mode (Narrative Wrapper)

**Concept:** Student plays the role of a researcher publishing a paper. They must "collect data points" (answer questions correctly on specific topics) to unlock analysis phases: Intro → Hypothesis → Data Collection → Analysis → Conclusion. Each phase requires mastery of specific concepts. The paper PDF assembles as the student progresses.

**What the player decides:** Which data to collect and in what order to assemble their "paper."

**Board game inspiration:** *Ticket to Ride* — collecting route cards and fulfilling them to complete a journey; resource collection toward a goal.  
**Mobile game inspiration:** *Monument Valley* — structured, purposeful puzzle progression with a narrative payoff.  
**UI inspiration:** *Notion* task-board — dependency unlocks, kanban phases.

**Anti-patterns fixed:** Gives context/meaning to why statistics topics matter (research framing).

| Axis | Score | Notes |
|------|-------|-------|
| Agency | 7 | Collecting sequence is strategic |
| Anti-pattern fix | 6 | Doesn't fix session flatness or SM-2 passivity |
| Stats-first | 9 | Research framing is pedagogically grounded |
| Emotion | 7 | Paper assembly is satisfying but slow |
| Session fit | 6 | Phases may take multiple sessions — unclear boundaries |
| Mobile | 6 | Paper UI complex on small screen |
| Buildability | 5 | High content cost: must write narrative copy |
| Distinctiveness | 7 | Not novel enough vs. existing "quests" in edtech |
| **TOTAL** | **63** | |

---

### Candidate 4 — Concept Constellation (Player-Drawn Knowledge Graph)

**Concept:** As the student masters concepts, they appear as stars in a constellation canvas. The student's job is to draw **connections** between them — edge labels explain the relationship ("t-test uses mean and SD"). Each valid connection earns bonus XP; invalid connections (misunderstood relationships) decay. The constellation becomes their personalized knowledge graph, distinct from the pre-built mind map.

**What the player decides:** What to connect, and what relationship label to use.

**Board game inspiration:** *Codenames* — players must form meaningful associations between words; quality of associations reveals conceptual understanding.  
**Mobile game inspiration:** *Threes!* — merging cells into larger meaningful units; spatial relationship building.  
**UI inspiration:** *Obsidian* graph view — emergent web of connected notes; personal knowledge architecture.

**Anti-patterns fixed:** Passive mind-map (currently pre-built) becomes active construction by the player.

| Axis | Score | Notes |
|------|-------|-------|
| Agency | 7 | Connection drawing is creative and personal |
| Anti-pattern fix | 8 | Mind map was passive; this makes it active |
| Stats-first | 8 | Relationship labeling deepens conceptual understanding |
| Emotion | 9 | "My constellation" creates ownership and beauty |
| Session fit | 7 | Could work in 5 min but depth rewards longer play |
| Mobile | 5 | Graph drawing on phone is painful |
| Buildability | 5 | Relationship validation is hard (NLP? pre-defined edges?) |
| Distinctiveness | 9 | Beautiful and novel |
| **TOTAL** | **68** | |

---

### Candidate 5 — Daily Triage (Calibration Board, fixing passive SM-2)

**Concept:** Instead of SM-2 silently picking questions, each session starts with a "triage board": 5 SM-2-due cards are shown as topic tiles. Before answering, the student **sorts them** into difficulty buckets (Easy / Medium / Hard) using drag-and-drop. After answering all 5, a Calibration Score shows how accurately the student predicted their own performance. Metacognitive accuracy itself earns a bonus multiplier.

**What the player decides:** Pre-answer difficulty estimation; the metacognitive prediction.

**Board game inspiration:** *Hanabi* — players must reason about their own knowledge under uncertainty; estimation and communication of confidence.  
**Mobile game inspiration:** *Photomath* — step-by-step confidence check; knowing whether you understand each step.  
**UI inspiration:** *Trello* — drag-and-drop kanban; tactile card sorting on mobile.

**Anti-patterns fixed:** SM-2 is currently invisible/passive — this surfaces it and adds metacognitive layer.

| Axis | Score | Notes |
|------|-------|-------|
| Agency | 9 | Pre-answer sorting is a genuine new decision |
| Anti-pattern fix | 9 | Directly fixes "SM-2 passive/invisible" anti-pattern |
| Stats-first | 8 | Metacognition is an evidence-backed learning technique |
| Emotion | 6 | Calibration score is satisfying to power users; less flashy |
| Session fit | 9 | Board setup + 5 answers + calibration score ≈ 6 min |
| Mobile | 9 | Drag-and-drop card sort works great on touch |
| Buildability | 8 | Mostly UI work on top of existing SM-2 |
| Distinctiveness | 8 | Metacognition in edtech is validated but not common |
| **TOTAL** | **74** | |

---

### Candidate 6 — Waffle Stack Challenge (Press-Your-Luck Depth System) ⭐ TOP PICK

**Concept:** Each question "chain" is a **stack** of 3 questions on the same statistical concept, scaling in difficulty (Recognition → Application → Transfer). After each *correct* answer, the player faces a binary decision: **"Bank It"** (collect tentative XP and move to the next stack) or **"Push the Stack"** (risk the tentative XP for a 2.5× multiplier if the next layer is also correct). A wrong answer mid-stack causes the stack to *collapse*, losing all tentative XP for that stack. The "waffle stack" metaphor is literal: each answered layer adds a waffle to the visual stack; collapse knocks them off.

**What the player decides:** Risk management — how deep to push based on perceived mastery. This is a genuine, repeated, statistically-interesting decision.

**Board game inspiration:** *Push* (Stronghold Games) — eponymous press-your-luck mechanic; push the pile or take the safe payout.  
**Board game 2:** *Blackjack* — hit or stand decision; known probabilities, player calibrates risk against self-assessed confidence.  
**Mobile game inspiration:** *Alto's Odyssey* — combo chains that multiply reward; breaking the chain loses the multiplier, incentivizing careful extension.  
**Mobile game 2:** *Hearthstone Battlegrounds* — deciding when to upgrade vs. fight; risk/reward tradeoff at every turn.  
**UI inspiration:** *Duolingo Hearts* — XP-on-the-line creates stakes; the tentative-XP visualization model.

**Anti-patterns fixed:**
1. **No in-session player decision** — Push/Bank is a decision after every correct answer.
2. **No stakes, no tension** — Losing a stack's tentative XP creates real tension.
3. **Session flatness** — Each of the 5 stacks has its own arc (build → bank/collapse → next).
4. **SM-2 passivity** — Depth reached (L1/L2/L3) becomes the SM-2 quality rating, surfacing the algorithm's logic.

| Axis | Score | Notes |
|------|-------|-------|
| Agency | 8 | Push/Bank decision changes per-stack outcome |
| Anti-pattern fix | 7 | Fixes stakes + session arc; SM-2 still partially hidden |
| Stats-first | 8 | Layer 3 (Transfer) questions require real application |
| Emotion | 8 | Stack collapse is dramatic; successful L3 is euphoric |
| Session fit | 9 | 5 stacks ≈ 5–15 min depending on depth |
| Mobile | 9 | Two big buttons (Bank / Push) are phone-perfect |
| Buildability | 9 | Builds on StatChallenge; 3 difficulty levels already exist in quiz-bank |
| Distinctiveness | 9 | WaffleStack = stacking; this is the most thematically native mechanic |
| **TOTAL** | **77** | |

---

### Candidate 7 — Study Group Voting (Argument Evaluation)

**Concept:** Each question presents 4 AI "student" personas who each argue for a different answer option. The player must identify which argument is statistically sound (and which are flawed). Wrong arguments are seeded with common misconceptions (e.g., "confusing correlation with causation"). XP scales with how well the player *explains* why the others are wrong (multiple-choice explanation selection, not free text).

**What the player decides:** Which argument to trust; evaluation of statistical reasoning quality, not just the answer.

**Board game inspiration:** *The Resistance / Avalon* — social deduction; identifying who is trustworthy requires reasoning about arguments and motives.  
**Mobile game inspiration:** *QuizUp* — competitive Q&A with persona framing.  
**UI inspiration:** *Reddit/HackerNews* voting thread — argument evaluation as a familiar UI.

**Anti-patterns fixed:** Students often know the "right" answer without understanding why others are wrong; this forces deeper engagement with common misconceptions.

| Axis | Score | Notes |
|------|-------|-------|
| Agency | 8 | Evaluating arguments requires deeper engagement |
| Anti-pattern fix | 7 | Fixes surface-level answering; doesn't fix session structure |
| Stats-first | 8 | Misconception exposure is pedagogically validated |
| Emotion | 6 | Voting thread aesthetic may feel academic not playful |
| Session fit | 7 | Each question takes longer; may feel slow |
| Mobile | 8 | Chat bubble UI works on phone |
| Buildability | 7 | Requires writing 3 wrong-argument explanations per question |
| Distinctiveness | 8 | Argument evaluation is rare in stats education apps |
| **TOTAL** | **69** | |

---

### Candidate 8 — Deadline Pressure (Timer Sprint Mode)

**Concept:** Student chooses their time pressure before each session: 1-min blitz (3 questions), 3-min focus (5 questions), or 5-min deep work (8 questions). XP is multiplied by time efficiency — finishing early within a time window grants a bonus. Questions adapt to the chosen duration: 1-min sessions draw from easier recall questions; 5-min sessions include multi-step problems. The 3D city building for that session glows while the timer runs.

**What the player decides:** How much time pressure to accept; implicit difficulty selection.

**Board game inspiration:** *Boggle* / *Codenames Duet* (timed variant) — time pressure as a mechanic that changes strategy.  
**Mobile game inspiration:** *Tetris Effect* — flow state under time pressure; music synchronizes with urgency.  
**UI inspiration:** *Duolingo Timer Challenge* — countdown creates urgency without penalizing too harshly.

**Anti-patterns fixed:** Current loop has no urgency, no pacing, no reason to engage quickly.

| Axis | Score | Notes |
|------|-------|-------|
| Agency | 7 | Duration selection is a real choice |
| Anti-pattern fix | 8 | Fixes no-urgency anti-pattern |
| Stats-first | 7 | Harder questions in longer sessions is good |
| Emotion | 7 | Timer creates stress — good for some, bad for anxious students |
| Session fit | 9 | Cleanly bounded by the timer |
| Mobile | 9 | Simple timer UI, big buttons |
| Buildability | 9 | Timer + question-count parameter change only |
| Distinctiveness | 7 | Duolingo already does this |
| **TOTAL** | **73** | |

---

## Score Summary

| Rank | Candidate | Score |
|------|-----------|-------|
| 🥇 1 | **Waffle Stack Challenge** | **77** |
| 🥈 2 | **Exam Gauntlet** | **77** |
| 🥉 3 | **Daily Triage** | **74** |
| 4 | Curriculum Tree | 73 |
| 5 | Deadline Pressure | 73 |
| 6 | Study Group Voting | 69 |
| 7 | Concept Constellation | 68 |
| 8 | Research Project Mode | 63 |

**Tiebreaker — #1 vs #2 (both 77):**
- **Waffle Stack Challenge** wins because:
  1. The app is literally called "WaffleStack" — stacking waffle layers IS the visual metaphor, making this the most thematically native mechanic possible
  2. It changes player decisions at a *higher frequency* (once per correct answer, not once per session) — more agency per minute
  3. It directly exposes the SM-2 quality scale to the player through the Push/Bank decision
  4. It builds on top of existing StatChallenge code with minimal new UI (just two buttons per correct answer)
  5. The 3 difficulty levels (`easy/medium/hard`) already exist in `quiz-bank.json` — Layer 1/2/3 maps directly

---

## Detailed Spec: Waffle Stack Challenge (#1 Pick)

### The Problem It Solves

Current StatChallenge session: student sees Q1, answers, sees Q2, answers, sees Q3... There is zero player agency during the session. SM-2 picks the topic, the question is shown, the answer is submitted. This is **passive consumption**, not active learning. The student's only "decision" is whether to open the app.

The Waffle Stack Challenge introduces a **press-your-luck mechanic** that puts a meaningful binary decision after every correct answer, turning the session from a passive quiz into an active risk-management game.

---

### Core Mechanic

#### The Stack

Each "stack" is a set of 3 questions on the *same statistical concept*, drawn from the existing quiz bank's 3 difficulty tiers:

| Layer | Difficulty | Question type | Example |
|-------|-----------|--------------|----------|
| Layer 1 (Base) | `easy` | Recognition / Definition | "What is the standard deviation?" |
| Layer 2 (Middle) | `medium` | Application / Computation | "Given these data points, which set has higher SD?" |
| Layer 3 (Top) | `hard` | Transfer / Real-world judgment | "A researcher reports SD=0.5 in both groups. What does this imply for effect size?" |

#### The Push/Bank Decision

After each *correct* answer, the player sees their tentative XP and two buttons:

```
┌──────────────────────────────────────────┐
│  ✓ Correct! You earned 10 tentative XP   │
│                                           │
│  [🏦 Bank It (+10 XP)]  [⬆ Push! → 2.5×] │
└──────────────────────────────────────────┘
```

- **Bank It** — Collect all tentative XP for this stack, move to the next stack.
- **Push the Stack** — Attempt the next layer. If correct, tentative XP is multiplied. If wrong, entire tentative XP for this stack is lost (stack collapses).

#### XP Table

| Action | Tentative XP accumulation |
|--------|---------------------------|
| Layer 1 correct + Bank | 10 XP collected |
| Layer 1 correct + Push → Layer 2 correct + Bank | 35 XP collected (10 + 25) |
| Layer 1 correct + Push → Layer 2 correct + Push → Layer 3 correct | 85 XP collected (10 + 25 + 50) — auto-banked |
| Layer 2 wrong (mid-push) | 0 XP collected (lose the 10 tentative) |
| Layer 3 wrong (mid-push) | 0 XP collected (lose the 35 tentative) |

The expected-value math rewards players who are *correctly calibrated* about their mastery:
- If you know the concept cold: push all 3 layers → 8.5× base XP
- If you're uncertain: bank at Layer 1 → 1× base XP
- If you misjudge (push when shaky): 0 XP and a harder SM-2 interval

#### Session Structure

Each session: **5 stacks** (not 5 individual questions).

```
Session Progress: [■■□□□] Stack 2 of 5
```

- Each stack takes 1–3 questions depending on Push/Bank decisions
- A session where the player pushes all 5 stacks to Layer 3 = 15 questions ≈ 12 min
- A session where the player banks all 5 at Layer 1 = 5 questions ≈ 4 min
- The player controls session length through their risk decisions

#### SM-2 Integration

The existing SM-2 `quality` rating (0–5) is replaced with the depth-based rating:

| Stack result | SM-2 quality |
|-------------|-------------|
| Layer 3 completed | 5 (highest; very well known) |
| Layer 2 banked | 4 |
| Layer 1 banked | 3 |
| Layer 2 collapse | 2 (knew L1, not L2; needs review) |
| Layer 3 collapse | 1 (knew L1+L2, not application; review harder) |
| Layer 1 wrong | 0 (reset interval; review soon) |

This means the SM-2 *quality* is now directly observable by the student — "I pushed to Layer 2 and collapsed, so this concept needs review soon" is visible cause-and-effect.

---

### 3D City Integration

- **Layer 1 banked** → building shows a partial progress ring (1/3 lit)
- **Layer 2 banked** → building shows 2/3 ring lit
- **Layer 3 completed** → building receives a golden crown particle effect
- **Stack collapse** → building flickers once (visual feedback, no lasting punishment)
- Session end → Post-session "Stack Report" panel showing all 5 stacks, depths reached, and XP earned

---

### Visual Design: The Waffle Stack UI

The in-session UI shows a **literal waffle** that grows layer by layer:

```
Layer 3 → [🧇🧇🧇]   ← shows when actively on Layer 3
Layer 2 → [🧇🧇  ]   ← lit after Layer 2 correct
Layer 1 → [🧇    ]   ← lit after Layer 1 correct
```

On collapse, the stack animates falling apart. On successful Layer 3 completion, the waffle gets a golden syrup drizzle (CSS animation, no external assets).

---

### Feature Flag

All new code behind:
```
VITE_FEATURE_WAFFLE_STACK=true
```

Feature flag defaults to `false`; existing StatChallenge behavior unchanged when flag is off.

---

### Files to Create/Modify (Cycles 2–4)

| File | Change |
|------|--------|
| `src/components/StatChallenge.tsx` | Add `stackDepth` state, Push/Bank buttons, tentative XP display |
| `src/store/learningStore.ts` | Add `recordStackAnswer(depth, collapsed)` action; depth-based SM-2 quality |
| `src/hooks/useQuiz.ts` | Add `getStackForTopic(topic)` returning `[easy, medium, hard]` question triple |
| `src/components/WaffleStackProgress.tsx` | New component — session progress + waffle visual |
| `src/config/featureFlags.ts` | New file — `WAFFLE_STACK` flag |

---

### Session-End Screen Design

```
┌─────────────────────────────────────────┐
│  Session Complete! 🧇                    │
│                                         │
│  Stack 1 (Normal Dist.)  |||  85 XP    │
│  Stack 2 (Mean)          |    10 XP    │
│  Stack 3 (T-Test)        COLLAPSE  0 XP│
│  Stack 4 (SD)            ||   35 XP    │
│  Stack 5 (Correlation)   |||  85 XP    │
│                                         │
│  Total: 215 XP                          │
│  Master Stacker! (4/5 stacks positive)  │
└─────────────────────────────────────────┘
```

---

### Risk and Calibration Psychology

The Push/Bank decision mirrors the *illusion of knowing* phenomenon — a well-documented issue in statistics education where students believe they understand a concept at the definition level but fail at application. The mechanic:

1. **Layer 1 easy → student feels confident → pushes**
2. **Layer 2 application reveals the gap → collapse**
3. **Student learns: "I knew the definition but not the application"**
4. **SM-2 quality = 2 → concept scheduled for earlier review**

This is *metacognitive calibration* disguised as a game mechanic. Students get feedback not just on whether they answered correctly, but on how accurately they assessed their own mastery depth.

---

### Sources Cited

**Board games:**
- *Push* (Stronghold Games, 2016) — press-your-luck mechanic; exact inspiration for the Push/Bank binary decision after each layer
- *Blackjack* — hit-or-stand under incomplete information about your own performance; risk calibration against confidence
- *Pandemic* (Z-Man Games, 2008) — session structure with 5 distinct crises (stacks), each requiring attention and sequencing

**Mobile games:**
- *Alto's Odyssey* (Snowman, 2018) — combo system where extending a trick combo multiplies score; breaking combo loses multiplier; exact analogue for the Push chain
- *Hearthstone Battlegrounds* (Blizzard, 2019) — deciding to upgrade tavern vs. fight each turn; risk/reward decision with observable consequences each turn

**UI design sources:**
- *Duolingo* Hearts system — XP-on-the-line visualization creates stakes without punishing the student permanently
- *Slay the Spire* combat UI (MegaCrit, 2019) — tentative resource visualization before commitment; cards in hand vs. committed plays
- *Alto's Odyssey* scoring UI — combo multiplier shown as a growing number with visual emphasis, creating "don't break it" psychology

---

## Top-3 Ranking Summary

| # | Name | Score | Why |
|---|------|-------|-----|
| 🥇 | Waffle Stack Challenge | 77 | Most thematically native to app name + brand; highest agency per minute; builds directly on existing code; maps to real metacognition research; mobile-perfect Push/Bank UX |
| 🥈 | Exam Gauntlet | 77 | Strong emotional arc; roguelite session framing is novel in edtech; cross-topic boss questions force synthesis |
| 🥉 | Daily Triage | 74 | Best anti-pattern fix for SM-2 passivity; drag-and-drop triage has highest mobile UX quality; metacognition backed by learning science |

**Cycle 2 will implement #1: Waffle Stack Challenge.**

---

## Cycle 2 Entry Conditions

Before Cycle 2 starts, the following must be true:
- [ ] `quiz-bank.json` has been audited to confirm `easy/medium/hard` tags exist per topic
- [ ] `StatChallenge.tsx` has been read in full
- [ ] Feature flag infrastructure is in place (`src/config/featureFlags.ts`)
- [ ] Build passes (`npm run build`) on the `proactive/exploration/games-design-space` branch after any changes

---

*Generated by proactive-vision-builder Cycle 01 — exploration only, no code changes.*
