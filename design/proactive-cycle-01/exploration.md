# WaffleStack — Gameplay Loop Exploration (Cycle 01)

**Date:** 2026-05-28  
**Branch:** proactive/exploration/games-design-space  
**Model routing:** Haiku (read/browse) → Sonnet 4.6 (synthesis) → Opus 4.7 (design decision, one call)  
**NotebookLM:** SKIP — MCP connector not available this cycle.

---

## Context Summary

Current state: SM-2 quiz engine, XP system, 3D Kenney city where buildings appear on topic mastery.  
Core VISION.md problem: the city is decoration, not gameplay. Buildings are trophies, not decision surfaces.  
Goal this cycle: find a gameplay loop where the statistical concept is what the player *uses* to decide, not what they memorizes to earn the reward.

Scoring rubric (1–5 each, decoration risk = lower is better):
- **R** — Decision rhythm (1 = slow/sparse, 5 = 15–30 s cadence met)
- **W** — Wonder tap (1 = dry, 5 = genuine awe/delight)
- **E** — Engine-building potential (1 = self-contained, 5 = early choices compound)
- **T** — Topic-fit (1 = adjacent to stats, 5 = player *uses* the concept to decide)
- **D** — Decoration risk (1 = lowest risk, 5 = highest)
- **Total** = R + W + E + T − D

---

## 7 Candidate Gameplay Loops

### 1. Distribution Forge — מחשלת ההתפלגויות
> "Craft the dice you roll. The world runs on your odds."

**Mechanic (Dice Forge × Threes):** Mastering a stats concept engraves a *face* onto your sample-dice — a Mean die, a Variance die, a Skew die. City buildings emit demands ("supply a sample with mean ≥ 50 at 95% confidence"). You choose which dice to roll and when to stop rolling; each roll is a literal draw from the distribution you built. Buildings consume your rolled samples as fuel.

**Stats used in decision:** Normal/empirical rule (reading where a roll lands in σ-bands), sampling + SE (more dice → tighter spread), CI width (demand threshold IS the confidence bar you must clear), stddev (face values widen/narrow spread), mean (combining faces).

**Board game inspiration:** Dice Forge (Libellud) — mutable die faces as upgradeable toolkit.  
**Mobile game inspiration:** Threes — merge-to-upgrade tactile clarity + instant restart loop.

| R | W | E | T | D | Total |
|---|---|---|---|---|-------|
| 5 | 4 | 5 | 5 | 1 | **18** |

---

### 2. Sampling Run — ריצת הדגימה
> "Stop too early you're wrong; too late you're broke."

**Mechanic (Quacks of Quedlinburg × Two Dots):** A demand needs an estimate within a tolerance band. You pull observations one at a time from a hidden population, watching the running mean + shrinking CI band animate live. Each pull costs budget; lock in when confident or bust.

**Stats used in decision:** Law of large numbers, SE shrinkage (1/√n), stopping rules, CI width vs n tradeoff. The core choice — *draw again or lock in* — IS the confidence/precision decision.

**Board game inspiration:** Quacks of Quedlinburg (Schmidt Spiele) — push-your-luck draw bag.  
**Mobile game inspiration:** Two Dots — chain-then-commit tension.

| R | W | E | T | D | Total |
|---|---|---|---|---|-------|
| 5 | 3 | 3 | 5 | 1 | **15** |

---

### 3. The Stats Lab Engine — מעבדת הסטטיסטיקה
> "Run the lab. Every machine is a method."

**Mechanic (Century Spice Road × Mini Metro):** Your lab has machine slots; mastered topics unlock machines (t-test centrifuge, regression press). Incoming client datasets demand a pipeline; you route data through machines you've built, outputs feed/upgrade other machines. Catan-style trade window swaps surplus data with NPC labs.

**Stats used in decision:** Method selection (which test fits which data shape = the placement decision), regression, ANOVA, prerequisite chains. Player *chooses the correct analysis* to satisfy the demand.

**Board game inspiration:** Century Spice Road (Plan B Games) + Viticulture (Stonemaier) — pickup-and-deliver engine with prerequisite pyramid.  
**Mobile game inspiration:** Mini Metro — route-under-pressure with constrained resources.

| R | W | E | T | D | Total |
|---|---|---|---|---|-------|
| 3 | 4 | 5 | 4 | 2 | **14** |

---

### 4. Pipeline Mechs — מכניקת הצינור
> "Program the analysis. Press run. Watch it break."

**Mechanic (Mechs vs Minions):** Drag step-cards (clean → check assumptions → choose test → interpret) into a sequence, hit run, watch it execute on a live dataset, see exactly which step failed, re-sequence.

**Stats used in decision:** Hypothesis-testing procedure, regression diagnostics, assumption order. Player assembles the procedure; wrong order fails informatively.

**Board game inspiration:** Mechs vs Minions (Riot Games) — pre-commit programming puzzle.  
**Mobile game inspiration:** Mini Metro — sequence routing + iteration.

| R | W | E | T | D | Total |
|---|---|---|---|---|-------|
| 2 | 3 | 3 | 5 | 2 | **11** |

---

### 5. Creature Variance Zoo — גן חיות ההתפלגויות
> "Tame distributions. Each one is alive."

**Mechanic (Stuffed Fables × Stack the States):** Each distribution is a creature whose behavior = its shape (a skewed creature lurches right; high-variance one is jittery). Feed and calibrate them to hit target params for daily challenges. Collection comes alive.

**Stats used in decision:** Distribution shapes, skew, variance, params as living behavior. Player reads/adjusts shape — risk that behavior-reading becomes cosmetic rather than quantitative.

**Board game inspiration:** Stuffed Fables (Plaid Hat Games) — per-encounter asymmetric mechanic, childlike wonder.  
**Mobile game inspiration:** Stack the States — collect-with-personality, facts embedded in identity.

| R | W | E | T | D | Total |
|---|---|---|---|---|-------|
| 3 | 5 | 3 | 3 | 3 | **11** |

---

### 6. Hypothesis Reigns — שליטת ה-H₀
> "One swipe. Reject or fail to reject."

**Mechanic (Reigns × Godfather: Corleone's Empire):** A card states a scenario + statistic; swipe to reject/retain H₀. Four balancing meters (Type I rate, Type II rate, power, credibility) shift with each call; survive the semester.

**Stats used in decision:** Type I/II error tradeoff, power, p-value interpretation as a governing tension. Fast rhythm but thin engine; drifts toward quiz-with-swipe.

**Board game inspiration:** Godfather: Corleone's Empire (CMON) — influence meters, placement + bluffing.  
**Mobile game inspiration:** Reigns — binary-decision meter management.

| R | W | E | T | D | Total |
|---|---|---|---|---|-------|
| 5 | 2 | 2 | 4 | 3 | **10** |

---

### 7. Knowledge Patchwork — פאצ'וורק הידע
> "Tile your understanding. Gaps are visible."

**Mechanic (Patchwork × Wordle):** Place irregular concept-tiles on a board under time+cost budget. Tile shapes encode prerequisites (a regression tile only fits abutting correlation+mean tiles). Gaps in your board = gaps in knowledge, literally visible.

**Stats used in decision:** Topic prerequisite structure, set-collection of concept families. Spatial fit = curriculum logic, but the stats *use* is structural not computational — lowest topic-fit score.

**Board game inspiration:** Patchwork (Uwe Rosenberg) + Calico (AEG) — spatial tiling with cost/time budgets.  
**Mobile game inspiration:** Threes — spatial merge clarity + tactile satisfaction.

| R | W | E | T | D | Total |
|---|---|---|---|---|-------|
| 3 | 4 | 3 | 2 | 2 | **10** |

---

## Top-3 Ranking

### #1 — Distribution Forge (Total: 18)

The only candidate that maxes decision rhythm, engine-building, AND topic-fit simultaneously at the lowest decoration risk. The roll IS the statistic — you bet on a distribution you personally engraved, so XP and buildings stop being decoration and become *capacity you spend and earn*. Dice Forge's mutable faces are an unusually direct metaphor for "your statistical toolkit grows as you master more concepts." The embedded Sampling Run sub-loop (push-or-stop) means two fundamental stats decisions nest inside each turn.

It maps cleanly onto the existing 10 BUILDINGS_REGISTRY entries — each building becomes a *demand emitter* rather than a trophy. SM-2 `cards` already track mastery intervals; those directly gate face-tier upgrades. No new question infra needed. Resolves the VISION.md "city is decoration" problem by turning buildings into consumers of player-forged distributions.

### #2 — Sampling Run (Total: 15)

The purest single-concept decision in the set: "draw again or stop" is exactly the confidence/precision tradeoff, every 5–8 seconds, with a live-animating CI band for wonder. It scores equal to #1 on rhythm and topic-fit. It falls behind only on engine-building (each run is somewhat self-contained) and concept breadth (it nails CI/sampling but leaves regression/ANOVA homeless). Strong candidate to *embed inside* #1 as the per-demand resolution mini-loop — they compose naturally without conflict.

### #3 — The Stats Lab Engine (Total: 14)

The strongest thematic home for the "run your own place" emotional pull and the deepest engine potential. Its natural territory is the higher-order topics (regression, ANOVA, method selection) that #1 and #2 handle weakly. It slips on decision rhythm (pipeline routing takes ~30–45 seconds, slightly over the 30s ceiling) and carries slightly higher decoration risk (machines can look like trophies if their outputs don't visibly feed back into state). Long-term, this could be the outer shell that #1's Forge lives inside — topic prerequisites unlocking lab machines, while rolling/sampling is how you *run* each machine.

---

## Detailed Spec — #1 Distribution Forge (מחשלת ההתפלגויות)

### Core Game Loop (7 Steps)

1. **Open a demand.** A city building flashes a need. Example (power plant, concept = Mean):  
   *"ספק מדגם עם ממוצע ≥ 50, ברמת ביטחון 95%."*
2. **Pick your dice.** Player selects up to 3 sample-dice from their forged set. Each die represents a distribution they have built through past mastery (faces = engraved stats).
3. **Roll = sample.** Tap to roll; each face is a draw. Running mean + live CI band animate on a number line against the demand threshold.
4. **Push or stop** (embedded Sampling Run sub-loop): roll again to tighten the band (costs 1 energy) OR lock in. This decision exercises SE-shrinkage and CI-width reasoning directly.
5. **Resolve.** CI clears threshold → demand met, building gains fuel, `level` ticks toward mastery. CI misses → informative failure: "הרווח עדיין רחב מדי — חסרות תצפיות" (band too wide — not enough observations).
6. **Forge.** Spend demand reward at the מחשלת: answer 1–3 SM-2 questions for that concept to **engrave/upgrade a die face** (e.g. narrow a Variance face, raise a Mean face value). This is where the quiz engine lives.
7. **Compound.** Better faces → tighter spreads → harder demands become reachable. Return to step 1 with a stronger toolkit.

**Decision interval:** ~8–12 s (pick-or-stop sub-loop ~5 s; forge choice ~15 s). Meets the 15–30 s rule.

---

### Decision Moment (On-Screen Description)

Dark panel (`--bg #0e0f12`), RTL. Layout top → bottom:

- **Demand card** (`--card #1c1f26`, hairline `--border #2a2e36`): Hebrew goal text right-aligned + a target marker pin on the number line.
- **Number line**: horizontal, faint σ-band guide markers. Animated **CI band** — teal `--teal #10b981` when it clears the target threshold, neutral `--mute #8a8f99` while still wide. Running-mean dot in `--fg #e8eaed`.
- **Dice row** (RTL): 2–3 die tiles (`--bg-2 #16181d`, rounded), each showing its current faces as a tiny inline histogram sparkline. Selected dice glow `--gold #FFD700`.
- **Two thumb-reach CTAs** (bottom, RTL order):
  - "הטל שוב" — ghost/grey, shows energy cost (`--mute`).
  - "נעל תשובה" — filled gold `--gold #FFD700` only when CI clears; otherwise dimmed.

The choice: which dice to commit and exactly when the band is tight enough vs over-spending energy. That single decision exercises SE-shrinkage + CI-width reasoning. No explanation overlay needed; the CI band width IS the feedback.

Typography rhythm and whitespace restraint per **Anthropic.com** (no chrome, no decoration).  
Merge/commit tactile feedback density per **Threes** (face-upgrade slide-up animation).

---

### State That Persists Between Sessions

Extend `learningStore` (persist key `wafflestack-learning`):

```typescript
forge: Record<BuildingId, DieFace[]>
// DieFace = { stat: 'mean' | 'var' | 'skew', value: number, tier: 0|1|2|3 }

energy: number          // push-your-luck currency
energyRefillAt: number  // daily regen timestamp
```

- Reuse existing `cards: Record<id, CardData>` (SM-2): a face's max tier is capped by that concept's card `interval` / `repetitions` — mastery depth directly unlocks better faces. No new question infrastructure.
- Reuse `BUILDINGS_REGISTRY[].level` (0/1/2) as per-building demand progress — buildings now emit demands AND track fuel consumed.
- `xp` unchanged; demands grant XP through existing `recordAnswer`.

---

### Concept → Mechanic Map

| Concept (existing topic) | Mechanic in Distribution Forge |
|---|---|
| Mean | Die face value; demand threshold = "mean ≥ X" |
| Standard deviation / Variance | Face spread; forge to *narrow* spread |
| Normal distribution / empirical rule | σ-band guides on the roll number line; predict landing zone |
| Sampling / Standard Error | More dice / more rolls → 1/√n band shrink |
| Confidence intervals | The demand threshold = the CI bar you must clear |
| Skewness | Skew face; some demands require shaped draws |
| Correlation / Regression (v2) | Two-die *paired* demands (joint distribution) |
| Hypothesis testing | "Reject the broken supplier" demands = clear threshold at α |

---

### MVP Scope (Smallest Playable Prototype)

- **One concept (Mean) + one building (power plant)**, one die with 6 forgeable faces.
- Loop: demand → roll/stop sub-loop → resolve → 1 SM-2 question to upgrade a face → harder demand.
- Reuse `recordAnswer` / SM-2 grade path verbatim. Add `forge` + `energy` fields to `learningStore`. No new 3D yet — render the building demand as a 2D card that *links* to the existing city pin.
- One screen, Hebrew RTL, locked palette, no new hex values.
- Ship on isolated branch as playable prototype. `npm run build` must pass.

---

### "Mastery" as Win Condition

A concept is **mastered** when:
1. Its die is fully engraved (all faces at max tier, gated by SM-2 `interval ≥ ~16d` — the existing 3.5× XP sweet-spot band).
2. Its building clears its hardest demand (CI clears a tight threshold using only that die alone).

Master all 10 dice → the city runs entirely on player-forged distributions = the win.  
**Win = statistical capacity. Not XP total. Not building count.**

---

### Integration Points with Existing App

| Existing surface | How Distribution Forge uses it |
|---|---|
| SM-2 `gradeAnswer` / `recordAnswer` | Forge step calls these directly — quiz questions become *upgrade actions* |
| `getXpMultiplier` sweet-spot | Preserved; demands grant XP through existing path |
| `cards[id].interval` | Gates face tier cap — mastery depth → better dice |
| `BUILDINGS_REGISTRY` + `level` | Buildings become demand emitters + fuel consumers (not trophies) |
| City lighting / hover glow (`/src/three/`) | Buildings light up when demand met — existing visual feedback repurposed |
| `arsenalStore` collectible entries | Forged faces surface as collectibles — wonder-tap, no new persistence model |

---

### UI Sources Cited

- **Anthropic.com** — typography rhythm, whitespace restraint, dark surface without chrome (primary UI reference).
- **Threes** — merge/upgrade tactile feedback density, instant restart, one-handed mobile clarity.
- **Linear.app** — dark-UI status pill for CI band state (clearing/wide), micro-interaction on lock-in.
- **Apple HIG iOS dark mode** — 44pt minimum hit targets for all CTAs, bottom-sheet for Forge overlay (one-thumb reach).

---

### Vision Alignment Check (Cycle 01 Exploration PR)

| Rule | Compliant? | Citation |
|---|---|---|
| What we are: stats-first via game | ✓ | Player uses CI/SE/stddev to make the roll-or-stop decision |
| Gameplay ≠ Gamification | ✓ | Roll/forge decisions change game state; XP is a byproduct, not the point |
| Design rule: Hebrew-first | ✓ | All demand text + CTA labels specified in Hebrew above |
| Design rule: dark UI | ✓ | `--bg #0e0f12` family throughout |
| Color palette: only locked tokens (NO new hexes) | ✓ | `#0e0f12`, `#16181d`, `#1c1f26`, `#2a2e36`, `#e8eaed`, `#8a8f99`, `#FFD700`, `#10b981` only |
| UI source cited | ✓ | Anthropic.com (typography) + Threes (feedback density) + Linear (status pills) + Apple HIG (hit targets) |
| UI anti-pattern avoided | ✓ | Bottom-sheet Forge overlay (not modal-on-modal); no hamburger menu; no hover-only affordances |
| Tech invariant: Tailwind only | ✓ | No CSS modules proposed; palette tokens via Tailwind classes |
| Tech invariant: Zustand only | ✓ | Extends `learningStore` with `forge` + `energy` fields; no Redux |
| Tone rule: encouragement | ✓ | Failure copy: "הרווח עדיין רחב מדי — חסרות תצפיות" (informative, not punishing) |
| Mobile-first (thumb-reach + 44pt targets) | ✓ | Primary CTAs in thumb zone, Forge as bottom-sheet, Apple HIG sizing |
| Out of scope: stays in scope | ✓ | Intro stats only; no multiplayer; no auth changes |

**NotebookLM consulted:** no — MCP connector not available this cycle. Used VISION.md catalogue + Opus 4.7 design judgment.  
**Board-game inspiration:** Dice Forge (Libellud), mechanic borrowed: mutable die faces as upgradeable statistical toolkit.  
**Mobile-game inspiration:** Threes, feedback pattern borrowed: merge-clarity tactile feedback + instant restart loop.  
**Decision interval:** every 8–12 seconds (sub-loop ~5 s, forge choice ~15 s).  
**Statistical concept used in decision:** Standard Error shrinkage and Confidence Interval width — the player decides when 1/√n is tight enough.

---

## Next Cycle Directive

Cycle 2 should implement the Distribution Forge MVP:
- Add `forge` + `energy` to `learningStore` behind feature flag `DISTRIBUTION_FORGE_ENABLED` in `src/config/featureFlags.ts`.
- Build the single-concept prototype (Mean + power plant building) as a new component.
- Wire SM-2 `recordAnswer` as the forge-upgrade gate.
- Add at least one Vitest unit test covering the die-roll → CI-width calculation.
- `npm run build` must pass.
