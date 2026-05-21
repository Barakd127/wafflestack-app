# WaffleStack — Games Design Space Exploration

**Cycle:** 01  
**Date:** 2026-05-21  
**Output:** 7 candidate gameplay loops, scored, ranked, top-3 detailed, #1 fully specced  
**Branch:** `proactive/exploration/games-design-space`

---

## Context

WaffleStack's current core loop:

```
Open app → SM-2 picks question → MCQ answer → XP → (eventually) building unlocks in Godot city
```

**The problem in one sentence:** The player has no meaningful decision at any point in a session — SM-2 is fully opaque, the city grows automatically, and the mind-map is a disconnected dead-end.

**Key observation from codebase:** The app already contains:
- `ConceptMapGalaxy.tsx`, `ConceptMapFlow.tsx`, `ConceptMapCluster.tsx` — fully functional concept graph renderers, **unused in the main flow**
- 30+ interactive graph components in `src/components/graphs/` (NormalDistributionInteractive, TTestInteractive, etc.) — **unused in the quiz flow**
- `ExamMode.tsx`, `FlashcardMode.tsx`, `ReviewMode.tsx` — multiple quiz modes built but **not surfaced**

This exploration answers: what should the next gameplay loop be?

---

## Design Criteria

Every candidate must score >2 on **Decision Depth** — must change *what* the player decides, not just *how* they experience an existing decision. Cosmetic-only improvements are rejected.

Scoring axes (1–5 each, max 25):
| Axis | Question |
|------|---------|
| Vision fit | Does it make statistics learning measurably more effective? |
| Decision depth | Does it give the player a new meaningful choice? |
| Emotional reward | Will it sustain motivation session-to-session? |
| Build feasibility | Can it be built cleanly in React/Zustand/Vite without a rewrite? |
| UI anti-pattern fix | Does it cure a documented current problem? |

---

## 7 Candidate Gameplay Loops

---

### A — City District Planning

**What it is:** Before each study session, the player sees the Godot 3D city map and chooses which topic *district* to enter. Each district corresponds to a statistics topic. Picking a district starts a focused quiz session on that topic. Different districts unlock different city areas and building types.

**Decision moment:** "Do I reinforce the Normal Distribution district (boost mastery, deepen buildings) or expand into the Regression district (lower mastery, more territory)?"

**Board game inspiration:** *Catan* — territory expansion vs resource consolidation creates natural strategic tension without requiring deep expertise.  
**Mobile game inspiration:** *Monument Valley* — spatial world as the navigation metaphor; moving through space = moving through curriculum.  
**UI inspiration:** *Duolingo's World Map* — hub-based navigation where the world IS the curriculum.

**What it fixes:** City is currently a passive viewer. This makes it a decision surface.

**Scores:**
| Vision | Decision | Emotion | Feasibility | UI Fix | Total |
|--------|----------|---------|-------------|--------|-------|
| 3 | 4 | 4 | 3 | 4 | **18/25** |

**Why not #1:** Godot city is an iframe; wiring topic-selection events across the iframe boundary requires non-trivial postMessage bridging. Also doesn't fix the mind-map disconnect.

---

### B — Hearts / Stakes System

**What it is:** 3 lives (potions, `PotionInventory.tsx` already exists) per session. Wrong answer costs a life. Lose all → session ends, streak endangered. Loss aversion layer added on top of the existing MCQ quiz.

**Decision moment:** No new decision — same MCQ, just higher stakes.

**Board game inspiration:** *Pandemic* — resource pressure creates urgency without changing the game's core mechanics.  
**Mobile game inspiration:** *Duolingo* — hearts system is the most recognizable lives mechanic in language learning.  
**UI inspiration:** *Duolingo* — potion/heart loss animations with clear visual feedback.

**What it fixes:** Nothing structural. Stakes without agency.

**Scores:**
| Vision | Decision | Emotion | Feasibility | UI Fix | Total |
|--------|----------|---------|-------------|--------|-------|
| 2 | 2 | 3 | 5 | 1 | **13/25** |

**Why not in top-3:** Decision depth is 2. Loss aversion without agency is anxiety, not engagement. Rejected as standalone.

---

### C — Concept Web Navigation ⭐ WINNER

**What it is:** The study session starts on `ConceptMapGalaxy` (full-screen), not a quiz screen. The player sees the full concept graph: mastered nodes glow gold, in-progress nodes pulse amber, locked nodes are dim with visible prerequisite edges. Player clicks any unlocked node → enters a 3–5 question micro-quiz (drawer overlay, not a route change) → watches the node brighten as correct answers accumulate. Hit mastery threshold → node locks gold, edges to neighbors animate as "charging," adjacent nodes unlock.

**The SM-2 algorithm still picks the specific question inside each topic.** The player picks the concept. This is the missing meaningful choice.

**Decision moment:** Every session opens with: "Deepen what I know (push a pulsing node to gold) or expand into new territory (enter a dim node whose prerequisite just unlocked)?" This creates a genuine risk/reward choice driven by the player's real learning state, not an arbitrary game mechanic.

**Board game inspiration:** *Dominion* (deck-building) — the player shapes their own knowledge base by choosing which "cards" (concepts) to acquire, and the order of acquisition has long-term consequences.  
**Mobile game inspiration:** *Hades* — the skill web / mirror of night gives players visible, meaningful choices about character development each run. The graph IS the progression. Players spend time studying the graph, which is itself educational.  
**UI inspiration:** *Obsidian's graph view* — a knowledge graph that visually represents the connectedness of ideas, making the structure of knowledge legible.

**What it fixes:**
1. Mind-map is a disconnected dead-end → concept graph becomes the app's primary navigation surface
2. SM-2 is opaque → player's agency over topic selection made explicit
3. Concept relationships are invisible during study → the graph makes them the UI

**Scores:**
| Vision | Decision | Emotion | Feasibility | UI Fix | Total |
|--------|----------|---------|-------------|--------|-------|
| 4 | 5 | 4 | 4 | 5 | **22/25** |

**Detailed spec:** see §Detailed Spec — Concept Web Navigation below.

---

### D — Lab Experiment Mode

**What it is:** Instead of MCQ, player manipulates sliders/parameters to *build* the concept themselves. For Normal Distribution: drag mean and SD sliders until the 68/95/99.7 rule emerges from the curve. For t-test: adjust sample size and see the t-distribution narrow. Hypothesis → verify loop. 30+ interactive graph components already exist in `src/components/graphs/`.

**Decision moment:** "What parameters create this outcome?" Player constructs understanding rather than recognizing it.

**Board game inspiration:** *Wingspan* (engine-building) — each correct "experiment" adds a piece to a self-reinforcing system of understanding.  
**Mobile game inspiration:** *Kerbal Space Program Mobile* — tinker until physics makes sense; failure teaches more than explanation.  
**UI inspiration:** *Desmos* — parameter sliders with live curve updates; the tool is the lesson.

**What it fixes:** MCQ = recognition, not construction. This fixes the core pedagogical weakness of the quiz format.

**Scores:**
| Vision | Decision | Emotion | Feasibility | UI Fix | Total |
|--------|----------|---------|-------------|--------|-------|
| 5 | 5 | 5 | 3 | 4 | **22/25** |

**Why #2 not #1:** Tied score with C. Tiebreaker: D has per-concept authoring cost (need a bespoke experiment for each of the 10 topics), doesn't fix the mind-map disconnect, and its interactive graph components already exist but need orchestration. Best built *inside* C as the content layer for each node's micro-quiz in a later cycle.

---

### E — Flash Judgment

**What it is:** 8-second countdown timer per question. Correct streaks compound XP multipliers (1× → 2× → 4×). Difficulty auto-scales with response speed. Same MCQ, just timed.

**Decision moment:** None new. Just speed pressure.

**Board game inspiration:** *Codenames* — speed round variant creates social urgency.  
**Mobile game inspiration:** *Quiz Up* — timed competitive quizzing.  
**UI inspiration:** Progress bar timer animations.

**What it fixes:** Nothing structural. Speed ≠ understanding.

**Scores:**
| Vision | Decision | Emotion | Feasibility | UI Fix | Total |
|--------|----------|---------|-------------|--------|-------|
| 2 | 2 | 3 | 5 | 1 | **13/25** |

**Why not in top-3:** Same Decision depth problem as B. Creates test anxiety, not learning. Rejected.

---

### F — Concept Auction

**What it is:** After each session, player is shown 3 unlockable concept cards. Spend accumulated XP to choose which 1 to unlock next. Creates strategic path-building decisions around a limited resource budget.

**Decision moment:** "Spend 150 XP on Confidence Intervals (complex, unlocks regression) or 80 XP on Binomial Distribution (easier, different branch)?"

**Board game inspiration:** *Terraforming Mars* — resource allocation to competing development paths; players specialize based on their hand.  
**Mobile game inspiration:** *Alto's Odyssey* — upgrade selection between runs shapes the next session's feel.  
**UI inspiration:** *Duolingo's gem shop* — spend earned currency on path options.

**What it fixes:** XP currently flows into a single automatic progression. This makes XP spending a real choice.

**Scores:**
| Vision | Decision | Emotion | Feasibility | UI Fix | Total |
|--------|----------|---------|-------------|--------|-------|
| 3 | 4 | 3 | 5 | 3 | **18/25** |

**Why not in top-3:** Decisions happen between sessions, not during. Doesn't improve the core session experience. Good candidate for layering on top of C in a later cycle.

---

### G — Exam Gauntlet

**What it is:** Weekly "boss encounter" — 15 questions, 20-minute hard cap, no hints, no second chances. Results render a visual knowledge-gap map in the Godot city: unmastered topics glow red, well-mastered topics glow gold. Players see exactly what needs work before the next week's sessions.

**Decision moment:** When to enter Gauntlet mode (gated by a weekly cooldown).

**Board game inspiration:** *Thunderstone Advance* — boss encounters that force players to confront their weaknesses in the deck they've built.  
**Mobile game inspiration:** *Lumosity* — weekly brain performance score with topic breakdown.  
**UI inspiration:** *Kahoot!* — timed assessment with immediate visual results and emoji reaction moments.

**What it fixes:** No current mechanism for students to see their global knowledge gaps. Weekly Gauntlet makes those gaps explicit and motivates targeted remediation.

**Scores:**
| Vision | Decision | Emotion | Feasibility | UI Fix | Total |
|--------|----------|---------|-------------|--------|-------|
| 4 | 3 | 4 | 3 | 4 | **18/25** |

**Why not in top-3:** Tied with A and F at 18. Decision depth is 3 (lower than C/D). Good companion to C, not a replacement.

---

## Scored Summary

| Rank | Loop | Total | Decision | Build for Cycle |
|------|------|-------|----------|-----------------|
| 1 | **C — Concept Web Navigation** | **22** | 5 | **Cycle 2** |
| 2 | **D — Lab Experiment Mode** | **22** | 5 | Cycle 4–5 (inside C) |
| 3 | **A — City District Planning** | **18** | 4 | Cycle 6 |
| 4 | F — Concept Auction | 18 | 4 | Cycle 6 |
| 5 | G — Exam Gauntlet | 18 | 3 | Cycle 7 |
| 6 | B — Hearts / Stakes | 13 | 2 | Not planned |
| 7 | E — Flash Judgment | 13 | 2 | Not planned |

---

## Detailed Spec — Concept Web Navigation (Loop C)

### The core decision moment

Session opens on `ConceptMapGalaxy` (full-screen, glassmorphism HUD overlay: streak pill, XP counter, "?" hint button). The graph shows:
- **Gold nodes** — mastered (≥80% SM-2 quality, ≥4 repetitions)
- **Pulsing amber nodes** — in-progress (seen but not mastered)
- **Dim grey nodes** — locked (prerequisite not met)
- **Dim blue nodes** — unlocked but not started

Player clicks any non-locked node. That click is the session's primary decision. Two natural strategies:
- **Deepen** — click an amber node, push it to gold, earn the mastery XP bonus
- **Expand** — click a blue node at the edge of knowledge, start something new, earn curiosity XP

No separate "Start Session" button. The graph click IS the session start.

### The feedback loop

```
Click node (player decision)
  → Concept header slides in from bottom (Framer Motion)
  → 3–5 MCQ questions (SM-2-scoped to this topic)
    → Each correct answer: node brightens slightly in real-time
    → Each wrong answer: node dims slightly, explanation shown
  → Hit mastery threshold (≥60% correct + sufficient repetitions)
    → Node locks gold
    → Edge animations "charge" toward adjacent nodes
    → Adjacent prerequisites check: newly unlockable nodes pulse blue → amber
    → XP awarded, achievement checked
    → Godot iframe receives window.postMessage({ type: 'node_mastered', topic })
  → Return to graph (drawer closes)
  → Graph reflects new state: 1 gold, new blue nodes visible
```

### What changes in the UI

| Current | New |
|---------|-----|
| "Study Hub" as default view | `ConceptMapGalaxy` as default view (gated by `VITE_FEATURE_CONCEPT_WEB=true`) |
| SM-2 picks topic and question | SM-2 picks question; player picks topic |
| Mind-map accessible via sidebar | Mind-map tab removed; graph IS the navigation |
| Quiz is full-screen route | Quiz is a bottom-drawer/modal overlay on the graph |
| XP appears in header only | XP charges the graph node in real-time |

### How it connects existing systems

- **SM-2 (`learningStore.ts`):** Unchanged algorithm. `getNextQuestion()` receives a `topicFilter` parameter — only the clicked topic's `CardData` entries are eligible. XP multipliers unchanged.
- **ConceptMapGalaxy (`src/components/ConceptMapGalaxy.tsx`):** Promoted from unused component to primary view. Needs: click handler per node, mastery-state props, edge animation triggers.
- **Godot city:** Already receives events via `localStorage`/`window.postMessage`. Add `node_mastered` event for the matching district to light up.
- **Achievements:** No change. `recordSM2Answer` in `learningStore.ts` fires existing achievement checks.
- **Feature flag:** `VITE_FEATURE_CONCEPT_WEB=true` in `.env.local`. When false, existing StudyHub renders. No regression risk.

### Prerequisite graph data

New file: `src/data/conceptGraph.ts`

```typescript
export const CONCEPT_GRAPH = {
  nodes: [
    { id: 'mean', label: 'Mean', prerequisites: [] },
    { id: 'median', label: 'Median', prerequisites: [] },
    { id: 'stddev', label: 'Std Dev', prerequisites: ['mean'] },
    { id: 'normal', label: 'Normal Distribution', prerequisites: ['mean', 'stddev'] },
    { id: 'sampling', label: 'Sampling', prerequisites: ['normal'] },
    { id: 'ci', label: 'Confidence Intervals', prerequisites: ['sampling', 'normal'] },
    { id: 'hypothesis', label: 'Hypothesis Testing', prerequisites: ['ci'] },
    { id: 'correlation', label: 'Correlation', prerequisites: ['mean', 'stddev'] },
    { id: 'regression', label: 'Regression', prerequisites: ['correlation'] },
    { id: 'binomial', label: 'Binomial', prerequisites: ['mean'] },
  ],
  edges: 'derived from prerequisites'
}
```

Early sessions: only `mean`, `median`, `binomial` unlocked — 3 viable picks, not 10. Natural on-ramp prevents choice paralysis.

### Key risk: choice paralysis

**Problem:** A fully unlocked graph (6+ nodes) could overwhelm students with decisions, increasing time-to-first-click.

**Mitigations:**
1. **"Recommended" pulse** — 1–2 nodes highlighted in the UI as optimal next picks (computed from SM-2 urgency: overdue cards surface first). Hint button confirms recommendation.
2. **Prerequisite gating** — Only 3 nodes visible at session 1; graph expands gradually.
3. **Telemetry trigger** — If median time-to-click > 8s (PostHog, when env var available), increase prerequisite gating threshold automatically.

### What this is NOT

- Not a rewrite of the quiz engine
- Not removing SM-2 — it still governs question selection inside the node
- Not removing the Godot city — it gains a new event source
- Not removing streaks/achievements — unchanged
- Not a full-screen graph with no escape — quiz drawer is dismissible, returns to graph

### Open questions for Cycle 2

1. Does `ConceptMapGalaxy.tsx` support per-node click handlers and state props natively, or does it need a wrapper?
2. Should the quiz drawer be a `Drawer` (bottom-sheet mobile pattern) or a side panel?
3. Hebrew RTL: does the graph layout algorithm (force-directed?) handle RTL node labels correctly?
4. Should node click require confirming ("Enter Normal Distribution quiz?") or immediate entry? (Lean toward immediate — fewer taps.)

---

## Sources cited (per skill requirement)

**Board games:**
- *Dominion* (Rio Grande Games, 2008) — deck-building as knowledge path selection model for Loop C
- *Catan* (Klaus Teuber, 1995) — territory vs resource consolidation for Loop A
- *Pandemic* (Z-Man Games, 2008) — resource pressure under stakes for Loop B
- *Terraforming Mars* (FryxGames, 2016) — XP resource allocation for Loop F
- *Thunderstone Advance* (AEG, 2012) — boss encounters for Loop G
- *Wingspan* (Stonemaier, 2019) — engine-building as competence growth for Loop D

**Mobile games:**
- *Hades* (Supergiant, 2020) — skill web / Mirror of Night as visible graph progression model for Loop C
- *Monument Valley* (ustwo, 2014) — spatial world as curriculum navigation for Loop A
- *Duolingo* — hearts system for Loop B; gem shop for Loop F; world map navigation for Loop A
- *Kerbal Space Program Mobile* (Private Division, 2023) — experimental learning loop for Loop D
- *Alto's Odyssey* (Snowman, 2018) — between-session upgrade selection for Loop F
- *Lumosity* (Lumos Labs) — weekly performance score with topic breakdown for Loop G

**UI / design sources:**
- *Obsidian graph view* — knowledge graph as primary navigation surface for Loop C
- *Desmos graphing calculator* — parameter sliders with live curve updates for Loop D
- *Figma's prototype preview* — drawer/modal overlay pattern preserving spatial context for Loop C quiz drawer
- *Kahoot!* — timed assessment with immediate visual results for Loop G

---

*Proactive Vision Builder — Cycle 01 | 2026-05-21*
