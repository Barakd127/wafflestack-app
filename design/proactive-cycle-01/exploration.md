# WaffleStack — Proactive Cycle 01: Gameplay Design-Space Exploration

**Date:** 2026-05-29  
**Branch:** proactive/exploration/games-design-space  
**Cycle type:** Exploration only (no code)  
**Vision source:** VISION.md (root) — read in full  
**NotebookLM:** SKIPPED — MCP connector not available in this container. Used VISION.md catalogue + design judgment instead.

---

## Current App State (context)

The app currently has:
- A Godot 3D city in an iframe — buildings = topics, but **currently decorative** (no resource production/consumption)
- Quiz/mastery system: `TopicProgress`, XP, streaks, quiz sessions
- Components: `StudyHub`, `LearningMap` (path-tree), `StatChallenge`, `FlashcardMode`, `AchievementsPanel`, `ConceptMapFlow`, `AITutor` drawer, `DistributionChart`, `SamplingDistribution`, `ArsenalScreen`, `PotionInventory`
- **Gap flagged in VISION.md:** city is eye candy, not a decision engine. "Locked-in risk: decoration not decision unless buildings consume/produce resources."

---

## Scoring Rubric

Each candidate scored 1–5 per dimension:

| Dimension | What it measures |
|---|---|
| **Decision quality** | Does the player USE the stat concept to decide, or merely be near it? |
| **Decision rhythm** | Is there a meaningful choice every 15–30s naturally? |
| **Engine energy** | Do early choices compound into later advantage? |
| **Wonder tap** | Would a first-time player feel delight/surprise, not just progress? |
| **Decoration risk** | How easy to ship hollow version where game = just rewards? (1=high risk, 5=well-protected) |

---

## Section 1: Candidate Scores

| Candidate | Dec. quality | Rhythm | Engine | Wonder | Decor. risk | TOTAL | Rationale |
|---|---|---|---|---|---|---|---|
| A. Run-a-place engine-builder | 3 | 3 | 5 | 3 | 2 | **16** | Strong compounding, but "serve customer" can decay into quiz-with-coins. |
| B. Collection asymmetric brawler | 3 | 3 | 3 | 5 | 2 | **16** | Huge wonder-tap; risk that creatures are reskinned XP badges. |
| C. Pre-commit programming puzzle | 5 | 2 | 4 | 3 | 5 | **19** | Player literally builds a stats procedure; weak 15–30s rhythm (long planning phases). |
| D. Real-time triage | 4 | 5 | 2 | 3 | 4 | **18** | Best rhythm, but pressure punishes deliberate statistical reasoning; little compounding. |
| E. Mutable-dice engine | 5 | 4 | 5 | 4 | 4 | **22** | You CRAFT the distribution you sample from — concept IS the mechanic. |
| F. Push-your-luck sampler | 5 | 4 | 3 | 4 | 4 | **20** | Stopping decision = literal use of confidence/SE; engine weaker alone. |
| G. Asymmetric-factions civ | 3 | 2 | 4 | 3 | 3 | **15** | Rich but scope-creep magnet; out-of-scope Bayesian temptation. |
| H. Spatial-tiling daily | 3 | 3 | 2 | 4 | 3 | **15** | Lovely daily habit, but tile-fit is geometry, not statistics. |
| **X. Dice Forge × Quacks hybrid** _(invented)_ | 5 | 5 | 5 | 4 | 5 | **24** | Craft your sampling distribution (E), then push-your-luck draws from it (F): decision density + compounding + the concept lives in both halves. |
| Y. Programming-puzzle × Dice (C×E) _(invented)_ | 5 | 3 | 4 | 3 | 5 | **20** | Pre-commit a sampling plan then watch it run; rhythm still slow. |

**Board game citations:** Dice Forge [BGG/216225], Quacks of Quedlinburg [BGG/244521], Mechs vs Minions [BGG/209010], Stuffed Fables [BGG/233312], Seize the Bean [BGG/211364], Arctic Scavengers [BGG/40628], Coffee Rush [BGG/377061], Patchwork [BGG/163412], Cry Havoc [BGG/192457]  
**Mobile game citations:** Two Dots, Threes, Mini Metro

---

## Section 2: Top-3 Ranking

### #1 — X. מעבדת הדגימה / "Sampling Lab" — Dice Forge × Quacks hybrid (24/25)

The player **forges a sampling distribution** by upgrading die faces with mastered topics, then runs push-your-luck draws from that very distribution to hit a target estimate. Both the **build phase** AND the **draw phase** require using sampling theory (SE, CLT, variance, stopping rules) — the concept cannot be removed without removing the game. Highest decision density and strongest compounding of all candidates.

**Board-game inspiration:** Dice Forge (mutable-dice face-upgrading) × Quacks of Quedlinburg (push-your-luck bag drawing with stopping mechanic)  
**Mobile-game inspiration:** Threes / Two Dots — every tap produces an immediate legible state change (the CI band visibly contracts per draw)

### #2 — F. Push-your-luck sampler (20/25)

Cleanest single-concept fit: "stop sampling now or draw one more?" is the confidence-interval decision made physical. Slightly weaker engine-building alone, which is exactly why candidate X absorbs it as one phase. Worth revisiting as a standalone daily mini-mode after the Lab ships.

**Board-game inspiration:** Quacks of Quedlinburg (push-your-luck draw from bag)  
**Mobile-game inspiration:** Mini Metro (constrained-resource depletion under pressure)

### #3 — C. Pre-commit programming puzzle (19/25)

Best decoration-resistance and the truest model of a statistical procedure, but planning phases break the 15–30s rhythm. Reserved as the eventual "boss encounter" layer on top of the Sampling Lab — the "sequence and execute" mechanic maps perfectly onto multi-step hypothesis testing once the player has CLT mastered.

**Board-game inspiration:** Mechs vs Minions (pre-commit a sequence, watch execution, iterate)  
**Mobile-game inspiration:** Mini Metro (plan a network, watch it run under load)

---

## Section 3: #1 Detailed Spec — מעבדת הדגימה / Sampling Lab

### Name + pitch

**מעבדת הדגימה** ("The Sampling Lab")  
You forge your own probability dice from mastered statistics, then push your luck drawing samples from them to estimate a hidden parameter before your variance budget runs out.

---

### Core loop (one ~3-min session)

1. **Brief (5s):** A "client" NPC states a goal: "Estimate the mean of this hidden population within ±2." Target shown as a band on a live `DistributionChart`.
2. **Forge phase (~45s, 3–4 decisions):** You have a bag of dice. Spend mastered-topic tokens to swap die faces — e.g., replace a high-variance face with a tighter one, or add a face that lets you "average two draws." Each upgrade visibly reshapes a live distribution preview.  
   _Decision: which face-swap shrinks my standard error most per token?_
3. **Draw phase (~90s, ~8–12 decisions):** Roll a die = draw one sample. Running mean + a shrinking confidence band updates live after each draw. After every roll: **stop and submit, or draw again?** Drawing more tightens the band (n↑ → SE↓) but each draw costs from a variance/fatigue budget, and a "noise face" can blow the estimate.  
   _Decision: is my CI now inside the client's target band, or do I risk one more draw?_
4. **Resolve (15s):** Submit. Reveal true parameter. Score = accuracy × efficiency (fewer draws = bonus). Earn topic tokens that unlock new die faces.

---

### Statistical concept wired into each decision

| Phase | Player decision | Statistical concept |
|---|---|---|
| Forge: face swap | Which face lowers my σ most? | Variance / standard deviation of a single observation |
| Forge: CLT face | Add "average two draws" face? | Central Limit Theorem — SE = σ/√n; averaging narrows sampling distribution |
| Draw: stop or continue | Is my current CI inside the target band? | Confidence interval width; stopping rules |
| Draw: noise face trigger | Drop the outlier or include it? | Robustness; trimmed estimator / mean vs median |
| Resolve: target band | Did my estimate land inside ±margin? | Margin of error as win condition |

---

### Engine-building mechanic

Mastered topics in the existing `TopicProgress` / quiz system mint **face-tokens**. Early mastery (CLT, variance) unlocks structurally better faces that compound: a CLT face bought in session 2 makes every future draw phase cheaper, so early correct answers permanently widen strategic options. Die collection persists across runs — ties into existing `ArsenalScreen`/`PotionInventory` inventory.

---

### Failure state

Missing the target band never ends the game. The reveal overlays *your* CI against the true value and says (in Hebrew), e.g.:

> "עצרת אחרי 4 דגימות — רווח הסמך עוד היה רחב מדי; עוד 3 דגימות היו מספיקות."  
> _(You stopped at n=4; the CI was still too wide. Three more draws would have sufficed.)_

You retry the same client immediately with knowledge intact. Failure teaches the exact stopping miscalibration.

---

### Mobile UX sketch (RTL, thumb-zone)

```
┌─────────────────────────────────────┐
│  [Distribution chart — glanceable]  │  top third: live preview, no touch
│  μ̂ = 18.4  │  CI ±3.2  │  n=5      │
├─────────────────────────────────────┤
│                                     │
│        [ DIE ]  big, centered       │  middle: tap to roll in draw phase
│                                     │
├─────────────────────────────────────┤
│  [face tile] [face tile] [+token]   │  forge phase: face swap tiles
│  ━━━━━━━━━━━━━━━ budget bar ━━━━━━  │
│  [הגש הערכה]        [דגום שוב 🎲]   │  draw phase: submit (RTL primary) / draw again
└─────────────────────────────────────┘
```

- Bottom-sheet pattern (no modals-on-modals)
- Primary CTA ("הגש הערכה" / submit) on the right-thumb side (RTL primary position)
- Budget meter as a thin progress bar — persistent banner, not a toast
- Hit targets ≥44pt (Apple HIG)
- Single active touch-region per phase (no hover-only affordances)

**UI citations:** Linear.app (status-pill budget bar, dark-UI density) / Apple HIG dark mode (elevation, 44pt targets) / Mini Metro (one-handed play, minimal HUD)

---

### Integration with existing app

| Integration point | How |
|---|---|
| **Godot city** | New building "מעבדת הדגימה" — tapping it opens the Lab as a route. Closes the decoration gap: city now drives a decision. |
| **TopicProgress / XP** | Mastered topics mint face-tokens. No new mastery system needed. |
| **LearningMap** | Topic mastery in LearningMap unlocks specific die faces — "what to learn next" has direct mechanical payoff. |
| **DistributionChart / SamplingDistribution** | Reused for live distribution preview (forge) and running CI band (draw). |
| **ArsenalScreen / PotionInventory** | Die/face collection stored alongside existing inventory. |
| **StudyHub** | Unchanged — remains the primary study path; Lab is an alternate entry point that reinforces the same topics. |

---

### Decision interval

- Draw phase: **~5–12s** per stop-or-draw choice (comfortable inside 15–30s ceiling, denser than required).
- Forge phase: **~10–15s** per face-swap decision.

---

### Risk flags and guards

| Risk | Guard |
|---|---|
| Forge = "buy upgrade with coins" (gamification) | Face choices must change the *shape* of the live distribution preview; optimal swap depends on client's target band — no dominant universal upgrade exists. |
| Draw phase = "spam draw mindlessly" | Hard variance/fatigue budget + noise faces make over-sampling a losing strategy. Stopping must be reasoned from the visible CI. |
| Numbers shown but never used (decoration) | The CI band IS the win condition and IS the submit trigger. You cannot win without reading SE. |
| RNG feels unfair | Post-reveal shows the correct stopping point with proof. Failure is skill-attributable, not luck-attributable. |

---

### Prototype scope for Cycle 2 (1 sprint, isolated branch)

Minimum playable version:
- One client/goal: estimate a mean, fixed hidden population (no NPC variety yet).
- 3 forgeable faces only: tight (low σ), wide (high σ), CLT "average-two-draws" face.
- Single die, hardcoded token grant (stub `TopicProgress` wiring for now).
- Draw phase with live running-mean + CI band reusing `DistributionChart`, fat submit/draw-again buttons, fixed 10-draw budget.
- Reveal screen with informative-failure overlay (Hebrew copy, shows optimal n).
- No persistence, no city entry point yet — launched from a dev route (`/#lab`).
- Feature flag: `SAMPLING_LAB_ENABLED` in `src/config/featureFlags.ts`.
- At least one Vitest unit test covering the CI-width calculation and stop/draw logic.

**Goal:** Prove the stop-or-draw decision *feels like statistics in the hand* before wiring it to the city.

---

## Vision-Alignment Check

| Rule | Compliant? | Citation |
|---|---|---|
| What we are: stats-first via game | ✓ | CI width IS the win condition; stats concept drives every decision |
| Gameplay ≠ Gamification | ✓ | Stop-or-draw is a real decision with real statistical consequence; no confetti-only path |
| Design rule: Hebrew-first | ✓ | All UX copy in Hebrew; RTL bottom-sheet layout |
| Design rule: dark UI | ✓ | Uses `--bg`, `--bg-2`, `--card` tokens throughout |
| **Color palette: only locked tokens used** | ✓ | No new hex values introduced in this spec |
| **UI source cited** | ✓ | Linear.app (density/status-pill), Apple HIG (44pt targets, elevation), Mini Metro (one-handed, minimal HUD) |
| **UI anti-pattern avoided** | ✓ | No hamburger, no modal-on-modal, no hover-only affordances, no toast for budget state |
| Tech invariant: Tailwind only | ✓ | Spec references Tailwind-compatible bottom-sheet pattern |
| Tech invariant: Zustand only | ✓ | Die/face state via Zustand store (beside existing `ArsenalScreen` store) |
| Tone rule: encouragement | ✓ | Failure overlay is warm Hebrew explanation, never punishment |
| Mobile-first (thumb-reach + 44pt) | ✓ | Bottom-sheet with RTL CTA in thumb zone; explicit 44pt target call-out |
| Out of scope: stays in scope | ✓ | No Bayesian, no multiplayer, no teacher dashboard; intro stats only |

**NotebookLM consulted:** no — MCP connector not available in this container (SKIPPED per rules).  
**Board-game inspiration:** Dice Forge (mutable dice faces as engine), Quacks of Quedlinburg (push-your-luck stopping mechanic).  
**Mobile-game inspiration:** Threes / Two Dots — per-tap immediate legible state change sustains decision density.  
**Decision interval:** 5–12s in draw phase; 10–15s in forge phase.  
**Statistical concept used in decision:** Standard error, confidence interval width, Central Limit Theorem (SE = σ/√n), stopping rules, margin of error.

---

_Cycle 1 complete. Next: Cycle 2 = build the Sampling Lab prototype behind feature flag._
