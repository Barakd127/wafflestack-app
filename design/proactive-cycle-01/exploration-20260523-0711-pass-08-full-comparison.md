# WaffleStack — Proactive Cycle 01 Pass 8: Full 8-Candidate Comparison + Mutable Dice Engine MVP Spec

**Date:** 2026-05-23T07:11  
**Branch:** proactive/exploration/games-design-space  
**Cycle type:** Exploration only (no code)  
**Model routing:** Opus 4.7 → gameplay decision + full spec; Sonnet 4.6 → synthesis  
**Pass number:** 8 (7 prior passes on this branch)

> **What's new in this pass:** Prior passes each explored a narrow slate. This pass does a clean full-field comparison of the same 8 canonical VISION.md candidates (A–H), using a 6-axis rubric, with Opus 4.7 making the final call. Confirms Mutable Dice Engine as #1 AND delivers a **complete MVP spec** for Cycle 2 build, including state model, play-by-play, and open questions for Barak.

**NotebookLM:** not available in this container (MCP not provisioned). Used VISION.md catalogue + Opus 4.7 judgment instead.

---

## Scoring Rubric (6 axes, 1–5 each, max 30)

| Axis | 5 means | 1 means |
|---|---|---|
| **Decision rhythm** | Meaningful choice every 15–30 s | Mostly passive |
| **Stats integration** | Concept IS the mechanic | Concept adjacent, not required |
| **Engine-building** | Early choices strongly compound | Flat progression |
| **Decoration risk** | Extremely hard to make cosmetic-only | Trivially cosmetic |
| **Scope Cycle 2** | Solo dev ships playable prototype in 1 sprint | Multi-month |
| **Emotional pull** | Strong "run your own thing" / wonder / flow | Generic |

---

## 8 Candidates — Full Scores (Opus 4.7)

| # | Name | Decision | Stats | Engine | Decor | Scope | Pull | **TOTAL** |
|---|---|---|---|---|---|---|---|---|
| A | Mutable-Dice Engine | 4 | 5 | 5 | 5 | 3 | 4 | **26** |
| E | Push-Your-Luck Sampler | 5 | 5 | 2 | 5 | 5 | 4 | **26** |
| C | Pre-commit Pipeline | 3 | 5 | 4 | 5 | 3 | 3 | **23** |
| G | Influence Map + Bluff | 4 | 4 | 3 | 4 | 3 | 4 | **22** |
| D | Statistical Diner | 5 | 3 | 3 | 3 | 4 | 3 | **21** |
| F | Asymmetric Schools | 3 | 4 | 4 | 4 | 2 | 4 | **21** |
| B | Data-Trading Caravan | 4 | 3 | 4 | 3 | 3 | 3 | **20** |
| H | Spatial Knowledge Quilt | 2 | 2 | 3 | 2 | 5 | 4 | **18** |

---

## Candidate Scoring Reasoning

**A. Mutable-Dice Engine (26/30)** — Dice ARE distributions; modifying a face IS reasoning about how distribution shape changes expected value. Engine-building at 5 because every face upgrade is a permanent strategic asset with compounding effect. Decoration-risk score of 5 because the dice determine session inputs — you cannot bypass them without surrendering agency. Scope 3 because the Forge screen drag-drop UI is non-trivial for Sprint 1.

**B. Data-Trading Caravan (20/30)** — Stats content sits NEXT TO the trading, not inside it. Correct answers unlock trades, but the trade decision is economic, not statistical. Decent engine-building via the prerequisite pyramid, but decoration risk is moderate (the trading skin can be swapped without changing learning).

**C. Pre-commit Pipeline (23/30)** — Strongest "real statistician workflow" candidate. Pre-committing describe/clean/model/test IS the EDA pipeline. Slow decision rhythm (one big commit per ~2-3 min) is its Achilles heel as a session hook. Best long-term Cycle 4–5 target, possibly hybridized with A.

**D. Statistical Diner (21/30)** — Highest decision intensity (5), but under time pressure stats become trivia lookups rather than reasoning. Ingredient upgrades drift cosmetic easily — exactly the pattern VISION.md warns against.

**E. Push-Your-Luck Sampler (26/30)** — Tied with A on total. The bag IS a population, draws ARE sampling, stopping IS a confidence decision — mechanically pure. Loses to A because it's flat per-session (engine-building score of 2) and covers only sampling/LLN/CI topics. Best fallback pivot if A's Forge screen stalls in Cycle 2.

**F. Asymmetric Schools (21/30)** — Identity-forming faction pick is powerful, but three balanced asymmetric rule-sets is 12+ months of design. Scope 2 kills it for Cycle 2.

**G. Influence Map + Bluff (22/30)** — Metacognition ("do I actually know this?") is a rare and brilliant pedagogical angle. Needs an AI-inspector proxy to keep the bluff honest in solo play. Strong candidate for Cycle 5+ after core loop is established.

**H. Spatial Knowledge Quilt (18/30)** — Aesthetic satisfaction is real; daily-puzzle ritual is proven. But the tile-placement decision has almost no statistical content. Highest decoration risk in the field — exactly what VISION.md calls a locked-in risk.

---

## Top-3 Ranking

### 🥇 #1 — Mutable-Dice Engine (A, 26/30)

Only candidate where the player physically manipulates probability distributions as the core verb, with permanent compounding state. Engine-building score of 5 is what separates it from the tied Push-Your-Luck Sampler (flat per-session). Decoration-risk defense is structural: dice ARE session inputs.

**Board-game inspiration:** Dice Forge (Régis Bonnessée) — face-replacement as progression vector; Quacks of Quedlinburg — bag-as-distribution intuition  
**Mobile-game inspiration:** Slice & Dice (Tann Gamel) — per-die tooltip showing face distribution + satisfying roll-settle animation; Balatro — engine-build "watch it crit" dopamine arc

### 🥈 #2 — Push-Your-Luck Sampler (E, 26/30)

Cleanest single-mechanic stats lesson in the field. Ships in one week. Reserve as Cycle 2 fallback if Dice Engine Forge screen stalls. Could also be a daily side-mode once the core loop exists.

**Board-game inspiration:** Quacks of Quedlinburg — bag-draw stopping mechanic  
**Mobile-game inspiration:** Threes — risk/reward stop-or-continue decisions

### 🥉 #3 — Pre-commit Pipeline (C, 23/30)

Best "think like a statistician" simulator. Slow decision rhythm hurts session hooks now, but it's the right direction for covering hypothesis-testing + EDA at scale. Revisit for Cycle 4–5 hybrid.

**Board-game inspiration:** Mechs vs Minions (BGG/209010) — pre-commit sequence execution  
**Mobile-game inspiration:** Slay the Spire (mobile port) — deck/sequence selection before battle

---

## #1 Full Spec: Mutable-Dice Engine

*(Opus 4.7 design decision — Cycle 1 Pass 8)*

### Core mechanic in one sentence

The player owns a small set of probability dice whose faces they progressively rewrite by mastering statistical concepts; every session begins by rolling those dice to generate the session's challenges, resources, and constraints — so engineering the dice IS engineering your own probability distribution over learning outcomes.

---

### Decision interval

Every **15–25 seconds** (three nested tiers):
1. **Pre-session:** Face-swap decisions in the Forge screen (~60 s total)
2. **Roll-resolution:** Re-roll decision (conditional probability — commit or push)
3. **In-session:** Interactive micro-challenge (~15-20 s each, 5–7 per session)

---

### Statistical concepts used in decision

| Tier | Concept | When it appears |
|---|---|---|
| Primary | Discrete probability distributions, PMF editing | Every face swap and roll |
| Primary | Expected value, variance, risk vs reward | Choosing face upgrades |
| Secondary | Conditional probability | Re-roll decision: "given 2 good faces + 1 bad, is EV of re-rolling positive?" |
| Tertiary | Bayesian updating | Face-swap under uncertainty about which topics appear in future sessions |

---

### Full Play-by-Play Loop

1. Player opens session → sees their 3-die loadout laid out RTL, each rendered as an unfolded cube net showing all 6 faces.
2. **Forge beat (pre-session):** Spend face-tokens to swap faces before rolling. E.g., replace "variance grows" with "regression-to-mean." Live histogram preview shows how the swap changes the distribution over the next 20 simulated rolls.
3. Player taps **גלגל** ("Roll") — dice tumble and settle in R3F animation. The 3 outcome faces determine: which stats topics appear in today's challenges, which resources arrive at the city, which NPC visitors come.
4. **Re-roll decision:** Player gets ONE re-roll per session, choosing all-3 or specific dice. Must reason: given the current roll, is expected value of re-rolling positive? This IS conditional probability.
5. **Session (5–7 micro-challenges):** Each challenge is ≤30 s, drawn from rolled topics. Interactive format (read a chart, estimate a parameter, choose the right test). Reuses existing quiz infrastructure.
6. **Earn face-tokens:** Correct answers drop face-tiles (small engraved tiles with stat effects: "+1 sample", "shift mean +0.5σ", "halve variance once").
7. **Post-session Forge:** Return to Forge screen. Drag earned tiles onto die faces. Commit the new configuration — **permanent, no undo** — making this a real decision under uncertainty.
8. **City visualization:** Building production rates in the city are now derived from the player's current die distribution, not from buildings themselves. City becomes a visualization of the dice state (existing Godot iframe, re-scoped).
9. **End screen:** Rolled outcomes summary, XP earned, faces unlocked, "what your dice predict for tomorrow" preview nudging return.

---

### Why This Cannot Become Cosmetic-Only

The dice are the literal **input function** to every session — remove them and there is no session. Die faces are not skins; they are RNG modifiers that change which questions appear and which resources flow. Players cannot bypass them without surrendering agency over the game. Buildings in the city render as **visualizations of die-face effects** (a "low-variance" face powers a stable factory; a "heavy-tail" face powers a volatile lottery house), so even the cosmetic layer is mechanically anchored to the statistical state.

---

### What the Player Learns (Uses, Not Memorizes)

They learn to **reason about distributions as objects** — every face-swap forces the question "how does this change my distribution of outcomes?" They develop expected-value intuition by repeatedly choosing between high-EV-low-variance and high-EV-high-variance face sets. They internalize conditional probability via the re-roll decision. The live histogram preview turns abstract distributional thinking into a direct visual feedback loop: wrong intuitions are corrected immediately by watching the histogram change.

---

### State Model (Persistent Between Sessions)

```typescript
interface Die {
  id: string
  faces: [Face, Face, Face, Face, Face, Face]
}

interface Face {
  id: string
  effect: FaceEffect          // { type: 'shift-mean', delta: 0.5 } | { type: 'narrow-variance', factor: 0.8 } | ...
  statConcept: ConceptId      // which topic this face "is" — gates what challenges it draws
  rarity: 'common' | 'rare' | 'mastered'
  shape: TileShape            // for Cycle 3 Patchwork-style placement constraints
}

interface PlayerDiceState {
  dice: Die[]                                    // 2 at MVP, expandable
  unlockedFaces: Face[]                          // inventory: earned but not yet installed
  faceTokens: number                             // forge currency
  conceptMastery: Record<ConceptId, MasteryLevel> // gates which face types are even offered
  rollHistory: Roll[]                            // last N rolls; drives streak hook + coaching
  sessionSeed: string                            // deterministic roll (reproducible if tab closed)
}

// cityState (existing store) derives production rates FROM dice rather than own state
```

---

### MVP Scope for Cycle 2 (1-Sprint Deliverable)

| # | Feature | Notes |
|---|---|---|
| 1 | `src/config/featureFlags.ts` | Add `ENABLE_DICE_ENGINE: boolean` |
| 2 | `src/store/diceStore.ts` | Zustand store — dice, faces, tokens, mastery |
| 3 | `src/components/DiceEngine/DieLoadout.tsx` | RTL display of 2 dice as unfolded cube nets |
| 4 | `src/components/DiceEngine/ForgeScreen.tsx` | Drag-drop face-swap, 6-slot grid per die |
| 5 | `src/components/DiceEngine/HistogramPreview.tsx` | Live SVG histogram of 20 simulated rolls, updates on hover |
| 6 | `src/components/DiceEngine/RollAnimation.tsx` | R3F tumbling dice using existing drei (physical cubes) |
| 7 | 5-question session | Driven by rolled topics; reuses existing quiz infrastructure |
| 8 | `src/tests/diceEngine.test.ts` | Vitest unit test for pure logic: expected-value calc for a face set |
| 9 | `npm run build` must pass | |

**Deferred to Cycle 3:** City integration, re-roll mechanic, multi-die joint effects, Patchwork-style shape constraints for face tiles.

---

### Open Design Questions for Barak

1. **Dice visibility:** Always-on HUD (constant "deck" awareness) vs. hidden until session start (ritual reveal / "draw" feeling)? Decides the primary emotional register of the game.

2. **Variance punishment:** Guarantee a session floor (player always gets at least 2 good topics), or let raw variance teach the lesson viscerally (sometimes you roll badly — that IS the lesson about variance)? Affects anxiety profile for the target audience (BA students pre-exam).

3. **City coupling:** Keep the Godot iframe re-scoped to visualize dice effects, or accept that the city should be rebuilt natively in R3F to truly couple it to dice state? This is the "locked-in risk" decision VISION.md flagged — and the biggest architectural call of Cycle 2.

---

## Sources Cited

**Board games (≥1 per candidate):**
- Dice Forge (Régis Bonnessée) — face-replacement as core mechanic *(#1 winner)*
- Quacks of Quedlinburg — bag-as-distribution; stopping rules *(#1 and #2)*
- Patchwork — spatial tile-fitting; Forge screen shape constraints future *(#1 and #8)*
- Mechs vs Minions (BGG/209010) — pre-commit sequence *(#3)*
- Century Spice Road — prerequisite pyramid *(#2 candidate)*
- Arctic Scavengers — tribe-leader / school identity *(#6)*
- Cry Havoc (BGG/192457) — faction asymmetry *(#6)*
- Godfather: Corleone's Empire — influence + hidden objectives *(#7)*
- Stuffed Fables (BGG/233312) — per-encounter unique mechanic (reference)
- Coffee Rush (BGG/377061) — real-time triage pacing *(#4)*
- Catan — trading window (reference)
- Seize the Bean — "run your own place" engine-builder (reference)

**Mobile games (≥1 per candidate):**
- Slice & Dice (Tann Gamel) — mutable-dice touch loop + per-face tooltip UI *(#1)*
- Balatro — engine-build dopamine arc *(#1)*
- Threes — risk/reward stop decisions *(#2 Push-Luck)*
- Two Dots — commit-a-path push-your-luck *(#2 Push-Luck)*
- Mini Metro — resource routing + graph growth *(#2 Caravan, #7 Garden)*
- Reigns — binary confidence declarations *(#7 Bluff, #2 Caravan)*

**UI sources:**
- Linear.app — dark-UI density; status pills for die-face effects
- Apple HIG (iOS dark mode) — 44pt hit targets on die-face tap zones
- Anthropic.com — typography rhythm + whitespace for Forge screen instructional text
- Duolingo — path-tree progression for showing which topics gate which face unlocks
