# WaffleStack — Gameplay Loop Exploration
## Proactive Vision Builder Cycle 01

**Date:** 2026-05-21  
**Status:** Exploration complete. #1 candidate: District Expedition.  
**Next:** Cycle 02 builds `ff_district_expedition`.

---

## Problem Statement

WaffleStack's current study loop works but has shallow player agency:

- **Topic selection is arbitrary** — 10 tiles with no signal about which to pick
- **Wrong answers carry minimal consequence** — practice variation, no tension
- **3D city is a reward layer, not a decision layer** — buildings appear after mastery but don't inform study choices
- **No preview of commitment cost** — students can't see "what will I learn / need before this unlocks"

The gap: statistics has an inherent prerequisite graph (std dev before normal distribution, normal distribution before CI, CI before hypothesis testing) but the app treats all 10 topics as flat peers.

---

## Design Space: 8 Candidate Loops

### A — Knowledge Deck (Deck Construction)
**Core:** Player curates a study "deck." Each session draws 5 cards from that deck. Synergy bonuses for pedagogically linked concepts in the same deck.  
**Decision changed:** *Which concepts to include in your deck.*  
**Board game:** Dominion. **Mobile:** Slay the Spire mobile.  
**Score: 28/40** — High decision depth but RNG draw weakens agency; synergy tuning is hard.

---

### B — Exam Siege (Tower Defense)
**Core:** Simulated exam waves arrive based on quiz bank difficulty. Player pre-allocates study resources to reinforce knowledge zones before the wave. Neglected zones fail.  
**Decision changed:** *Which knowledge zones to defend each session.*  
**Board game:** Pandemic. **Mobile:** Bloons TD Battles.  
**Score: 27/40** — Compelling tension but wave simulation + zone balancing is 600+ LOC and hard to calibrate.

---

### C — Study Budget (Resource Allocation)
**Core:** N focus tokens per session (starts at 3, upgrades to 5). Each concept costs tokens to enter. Hard topics cost 2, easy 1. Diminishing returns on over-studied topics.  
**Decision changed:** *How to allocate limited attention across topics.*  
**Board game:** Agricola. **Mobile:** Threes!  
**Score: 30/40** — Most implementable; weaker vision alignment (doesn't make stats structure visible).

---

### D — Synergy Discovery (Combo Chains)
**Core:** Real pedagogical concept pairs award bonus XP. correlation + regression = "Prediction Chain" (bridge building in the 3D city). Player discovers combos by experimenting with topic order.  
**Decision changed:** *Which topics to pair in the same session.*  
**Board game:** Terra Mystica. **Mobile:** Monument Valley.  
**Score: 30/40** — High pedagogical fit; discovery mechanic is genuinely fun but combo-tuning risks confusion without in-game guidance.

---

### E — District Expedition ⭐ TOP PICK
**Core:** 10 topics partitioned into 3 districts mirroring the actual pedagogical arc:
- **Foundation Quarter** — mean, median, std dev, sampling
- **Inference City** — normal distribution, CI, hypothesis testing
- **Advanced Research** — correlation, regression, binomial

Player chooses which district to invest in each session. Districts lock/unlock based on SM-2 ease factor averages across prereq topics. Locked districts show *exactly what's missing*.  
**Decision changed:** *Which district to invest in this session, with full visibility of the unlock trail.*  
**Anti-pattern fixed:** Replaces arbitrary 10-tile flat picker with 3-choice prereq-gated map.  
**Board game:** Arkham Horror 3rd ed. **Mobile:** Dead Cells (mobile). **UI:** Duolingo post-2022 path.  
**Score: 34/40** — Highest combined score. Makes the discipline's structure tangible. Directly reduces "where do I even start" anxiety.

---

### F — Sprint Mode (Speed/Accuracy)
**Core:** 90-second sprint session. Answer fast for max XP multiplier (5×), but wrong answers halve the multiplier. Fixes "infinite staring at options" anti-pattern.  
**Decision changed:** *Speed vs. accuracy tradeoff on each question.*  
**Board game:** Set. **Mobile:** Tetris Effect mobile.  
**Score: 21/40** — Easiest to build; poor pedagogy fit. Speed pressure directly increases stats anxiety for this user group. Rejected.

---

### G — Concept Map Arena (Strategic Placement)
**Core:** Player places concept cards as nodes on the mind-map canvas. Neighboring nodes that are pedagogically linked create edge bonuses. Ties quiz performance to the existing mind-map feature.  
**Decision changed:** *Which concept to place next to maximize graph rewards.*  
**Board game:** Wingspan. **Mobile:** Clash Royale.  
**Score: 32/40** — Solves orphaned mind-map problem; closer to 600 LOC; tight layout at 375px.

---

### H — The Advisor (Override Mechanic)
**Core:** AI Advisor suggests next concept based on SM-2 weak spots. Player can ACCEPT (full XP) or OVERRIDE (costs 1 focus token). If override turns out to address a genuine weak spot, player earns a "self-insight" badge.  
**Decision changed:** *Do I trust the algorithm or my self-assessment? Forces metacognitive reflection.*  
**Board game:** Civilization series. **Mobile:** Duolingo.  
**Score: 33/40** — Highest decision depth; doesn't make statistics structure itself tangible. #2 pick.

---

## Scoring Summary

| Candidate | Vision | Decision | Feasibility | Pedagogy | Total |
|-----------|--------|----------|-------------|----------|-------|
| A Deck | 7 | 9 | 6 | 6 | 28 |
| B Siege | 8 | 8 | 4 | 7 | 27 |
| C Budget | 7 | 7 | 9 | 7 | 30 |
| D Synergy | 8 | 6 | 7 | 9 | 30 |
| **E District** ⭐ | **9** | **8** | **8** | **9** | **34** |
| F Sprint | 4 | 5 | 9 | 3 | 21 |
| G Map Arena | 9 | 9 | 6 | 8 | 32 |
| H Advisor | 7 | 9 | 8 | 9 | 33 |

---

## #1 Detailed Spec: District Expedition

### What the Player Decides (New)
Before each study session, the player sees a 3-card district map. They choose which district to invest in. The choice is informed by:
- Lock/unlock status (with exact prereqs listed if locked)
- Which topics in the district are weakest (SM-2 ease < 2.0)
- Projected XP from completing this district's session goal
- How close they are to unlocking the *next* district

This replaces 10 arbitrary taps with 3 strategic options, each carrying full context.

### UI Anti-Pattern Fixed
The current topic grid offers no signal about why to pick one topic over another. Every tile looks the same. District Expedition replaces it with structured choices where the player can see *consequence* before committing.

### District Structure

```
Foundation Quarter           Inference City             Advanced Research
──────────────────────       ──────────────────         ─────────────────────
• Mean (power)           →   • Normal Dist (hospital)   • Correlation (market)
• Median (housing)       →   • CI (news)                • Regression (bank)
• Std Dev (traffic)      →   • Hypothesis (research)    • Binomial (city-hall)
• Sampling (school)
```

Prerequisite gates:
- **Foundation → Inference:** avg SM-2 ease ≥ 2.3 across mean + std dev
- **Inference → Advanced:** avg SM-2 ease ≥ 2.3 across normal distribution + hypothesis testing

### New Store Fields (5 max)

```typescript
// 1. Static district config (hydrated once at startup)
districts: Record<DistrictId, {
  label: string
  hebrewLabel: string
  topicIds: TopicId[]
  prereqTopicIds: TopicId[]   // topics that must be mastered before unlock
  unlockEaseThreshold: number  // default 2.3
}>

// 2. Cached district state (derived from SM-2 cards, updated after each answer)
districtProgress: Record<DistrictId, {
  unlocked: boolean
  avgEase: number
  sessionsCompleted: number
}>

// 3. Active session scope
activeDistrictId: DistrictId | null  // null = legacy free-study mode

// 4. Per-session progress toward daily goal
districtSessionGoal: {
  districtId: DistrictId | null
  cardsRequired: number   // e.g., 8
  cardsAnswered: number
}

// 5. Unlock history (celebration moment + analytics)
districtUnlockHistory: Array<{
  districtId: DistrictId
  unlockedAt: number  // ms timestamp
}>
```

### Component Sketch: `<DistrictSelectScreen />`

Mobile-first (375px = single column). Three large vertical cards. Each card:
- District name (Hebrew + English)
- City zone thumbnail (static render of existing 3D city buildings in that district)
- Status line: "3 topics need review" (unlocked) or "השלם: סטיית תקן, חציון" (locked — lists exact missing prereqs)
- XP projection pill: "≈ 45 XP this session"

Tapping unlocked: sets `activeDistrictId`, navigates to quiz with filtered SM-2 queue.  
Tapping locked: expands inline prereq trail (no navigation — preserves context).  
Bottom: "לימוד חופשי" escape hatch routes to legacy 10-tile picker.

Estimated size: ~120 LOC.

### Pedagogical Justification

MA-level Israeli psychology students face statistics anxiety primarily because the field feels *unstructured* — a wall of disconnected formulas before the psychometric exam. District Expedition externalizes the discipline's actual scaffolding: you cannot meaningfully reason about confidence intervals without owning std dev and the normal distribution first.

Visible prerequisites:
- Validate student intuition ("I'm not ready for regression yet")
- Channel effort into the genuine bottleneck
- Reduce decision fatigue (3 choices, not 10)

Unlock moments provide discrete, narratively satisfying milestones — exactly what anxiety-prone learners use to regulate study sessions. Aligns with Vygotsky's zone of proximal development: the next unlockable district is always one step beyond current mastery.

### Inspirations

| Source | What we borrow |
|--------|----------------|
| **Arkham Horror** 3rd ed. (board) | District-based map; locked locations show *why* locked, not just that they are |
| **Dead Cells** mobile | Biome-gating via traversal runes; world map IS the progression tracker |
| **Duolingo** 2022 path redesign (UI) | Vertical scroll, locked nodes show exact requirement, completion triggers celebration |
| **Apple Fitness** rings | Session-goal progress indicator (cardsAnswered / cardsRequired) |

### Feature Flag

```typescript
// vite.config.ts or a runtime flags object
const FF = {
  ff_district_expedition: false,  // flip to true for cohort rollout
}
```

Rollout cohort: Hebrew-locale users with `totalAnswered >= 15` (ensures enough SM-2 history for the unlock threshold to be meaningful).

---

## Cycle 2 Engineering Plan

1. Add 5 new fields to `learningStore.ts`
2. Write `<DistrictSelectScreen />` component in `src/components/`
3. Wire `ff_district_expedition` flag to render either `<DistrictSelectScreen />` or existing topic grid
4. Filter `getNextQuestion()` to respect `activeDistrictId` when set
5. Add district progress computation (derived from existing `cards` SM-2 data)
6. `npm run build` must pass (TypeScript strict)

Estimated LOC: ~250 (store fields + component + flag wire-up).  
Branch: `proactive/feat/district-expedition/20260521`

---

*Generated by proactive-vision-builder Cycle 01. Log: AI/Outputs/Logs/proactive-cycle-01-20260521.md*
