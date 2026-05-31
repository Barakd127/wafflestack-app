# WaffleStack — Proactive Cycle 01: Gameplay Design Space Exploration

**Date:** 2026-05-31  
**Branch:** `proactive/exploration/20260531-0409`  
**VISION.md consulted:** yes (full read)  
**NotebookLM consulted:** SKIPPED — MCP connector not available in this container. Design judgment drawn from VISION.md catalogue + web search.  
**Cycle type:** Exploration only (no code). Output: 5–8 candidates + scores + top-3 + #1 spec.  
**Model:** Opus 4.7 (gameplay-design decision call)

---

## Current State Diagnosis

The app today has:
- SM-2 spaced-repetition quiz engine (`learningStore.ts`, `useQuiz.ts`)
- 100-question quiz bank across 10 topics
- 3D city where buildings = mastered topics (R3F + drei)
- Arsenal, achievement badges, streak tracking
- AI Tutor drawer, Mind-Map Canvas, Distribution Explorer

**Critical gap (per VISION.md):** Buildings are cosmetic decoration. They have no resource production or consumption. The player makes no meaningful decision between problems — they are in a quiz-with-reward-graphics loop, which VISION.md explicitly rejects.

The question this cycle answers: **What is the real game?**

---

## Candidate Gameplay Loops

### Loop 1: לשכת הדגימה (The Sampling Bureau)

**Tagline:** משכו דגימות — תעצרו ברגע הנכון.

**Core mechanic:** Draw samples one tap at a time from a hidden population; each draw narrows your confidence interval but costs budget, and you must press your luck to "lock in" an estimate before the interval is tight enough to win the contract.

**Stats concept used in decision:** Sampling distribution, standard error shrinking with √n, confidence intervals, stopping rules.

**Decision interval:** Every ~8–15 seconds (each "draw vs lock" tap).

**Board game ref:** Quacks of Quedlinburg — push-your-luck "draw one more or stop" tension borrowed directly.

**Mobile game ref:** Reigns — binary swipe-style commitment (keep drawing / lock estimate) with immediate state shift.

| Criterion | Score |
|---|---|
| Decision rhythm | 5/5 |
| Wonder-tap | 4/5 |
| Engine-building | 4/5 |
| Topic-fit | 5/5 |
| Decoration risk (5 = low risk) | 5/5 |
| Build feasibility | 5/5 |
| **Total** | **28/30** |

---

### Loop 2: קו ההרכבה (The Stats Assembly Line)

**Tagline:** הרכיבו את צינור הניתוח לפני שהנתונים זורמים.

**Core mechanic:** Pre-commit an ordered sequence of analysis steps (clean → check assumptions → choose test → interpret), then watch it execute on a live dataset and debug where it breaks.

**Stats concept used in decision:** Hypothesis-testing pipeline, assumption checks (normality, equal variance), test selection (t vs ANOVA vs nonparametric).

**Decision interval:** Every ~20–30 seconds (each card placed in the program).

**Board game ref:** Mechs vs Minions — pre-program a move sequence, watch it run, iterate on failure.

**Mobile game ref:** Two Dots (chain-building) — feedback of a committed chain resolving step by step.

| Criterion | Score |
|---|---|
| Decision rhythm | 4/5 |
| Wonder-tap | 3/5 |
| Engine-building | 4/5 |
| Topic-fit | 5/5 |
| Decoration risk | 4/5 |
| Build feasibility | 3/5 |
| **Total** | **23/30** |

---

### Loop 3: מטבע הקוביות (Distribution Forge)

**Tagline:** חשלו את הקובייה — אתם מחליטים מאיזו התפלגות מגלגלים.

**Core mechanic:** Start with a uniform die; spend mastery to re-shape its faces, then roll it to meet target outcomes — you literally craft the distribution you sample from.

**Stats concept used in decision:** Probability distributions, expected value, variance, shape (skew/spread).

**Decision interval:** Every ~15 seconds (upgrade a face / roll).

**Board game ref:** Dice Forge — mutable dice faces upgraded over the game.

**Mobile game ref:** Threes — escalating combine-and-upgrade satisfaction.

| Criterion | Score |
|---|---|
| Decision rhythm | 4/5 |
| Wonder-tap | 5/5 |
| Engine-building | 5/5 |
| Topic-fit | 4/5 |
| Decoration risk | 3/5 |
| Build feasibility | 4/5 |
| **Total** | **25/30** |

---

### Loop 4: מגדל ההתפלגות (Distribution Tower)

**Tagline:** הניחו אריחים — תנו לעקומה לקבל את צורתה.

**Core mechanic:** Place data-point tiles into bins on a spatial grid to sculpt a histogram toward a target shape (normal, skewed, bimodal) under a budget constraint.

**Stats concept used in decision:** Distribution shape, mean/median shift under skew, variance as spread.

**Decision interval:** Every ~12 seconds (each tile placed).

**Board game ref:** Patchwork — spatial tiling under a time/cost budget; Azul — satisfy a target pattern under constrained pieces.

**Mobile game ref:** Mini Metro — minimal-HUD spatial layout with emergent visual feedback.

| Criterion | Score |
|---|---|
| Decision rhythm | 4/5 |
| Wonder-tap | 4/5 |
| Engine-building | 3/5 |
| Topic-fit | 4/5 |
| Decoration risk | 3/5 |
| Build feasibility | 4/5 |
| **Total** | **22/30** |

---

### Loop 5: שוק הנתונים (The Data Bazaar)

**Tagline:** סחרו במדגמים — מלאו את הפערים בנתונים שלכם.

**Core mechanic:** Trade sample-chips with NPC vendors to assemble a dataset that satisfies a research brief (enough n, balanced groups, right scale of measurement).

**Stats concept used in decision:** Scales of measurement, sample size/power, balanced design, confounds.

**Decision interval:** Every ~20 seconds (accept/reject a trade).

**Board game ref:** Century Spice Road — pickup-and-deliver where higher goods require lower prerequisites; Catan trade window.

**Mobile game ref:** Stack the States — collect-to-build progression with geography analogy.

| Criterion | Score |
|---|---|
| Decision rhythm | 3/5 |
| Wonder-tap | 3/5 |
| Engine-building | 4/5 |
| Topic-fit | 3/5 |
| Decoration risk | 3/5 |
| Build feasibility | 3/5 |
| **Total** | **19/30** |

---

### Loop 6: מצפה ההשערות (Observatory of Hypotheses)

**Tagline:** כווננו את הטלסקופ — האם הסטייה אמיתית או רעש?

**Core mechanic:** Two noisy signals appear; tune α (telescope aperture) and decide reject/fail-to-reject under uncertainty, racking up Type I/II errors that compound your reputation meter.

**Stats concept used in decision:** Significance level α, p-values, Type I/II error tradeoff, power.

**Decision interval:** Every ~15 seconds (one reject/retain call).

**Board game ref:** Welcome To... — push-your-luck commitment under a tightening budget, risk of error compounds.

**Mobile game ref:** Reigns — binary consequential decisions with a visible meter.

| Criterion | Score |
|---|---|
| Decision rhythm | 5/5 |
| Wonder-tap | 4/5 |
| Engine-building | 3/5 |
| Topic-fit | 5/5 |
| Decoration risk | 4/5 |
| Build feasibility | 4/5 |
| **Total** | **25/30** |

---

## Top-3 Ranking

| Rank | Loop | Total | Key strength | Key risk |
|---|---|---|---|---|
| 1 | לשכת הדגימה (Sampling Bureau) | 28/30 | Pure stats-as-decision; tightest rhythm; lowest decoration risk | Visualizing the narrowing band must feel tactile, not chart-y |
| 2 | מטבע הקוביות (Distribution Forge) | 25/30 | Highest wonder-tap + strongest engine-building | Risk of becoming a slot-machine reward skin |
| 3 | מצפה ההשערות (Observatory) | 25/30 | Directly trains the hardest intro concept (error tradeoff) | Narrow topic; needs framing to cover the whole quiz bank |

*Distribution Forge and Observatory tie at 25/30. Forge ranks #2 for stronger engine-building and build feasibility.*

---

## #1 Detailed Spec: לשכת הדגימה — The Sampling Bureau

### Elevator Pitch

You run a statistical research bureau that wins contracts by delivering estimates that fall inside a required confidence band. Every contract hides a true population value; you tap to draw samples one at a time, watching your interval tighten with √n, and must decide the exact moment to **stop sampling and lock your estimate** — too few draws and your band is too wide to win; too many and you go broke.

---

### How a 5-Minute Session Works

**Step 1 — Contract selection (agency, ~30s)**  
A district map (the existing path-tree / `LearningMap.tsx` shape) shows available contracts. Each contract card shows: topic area (sampling, CI, t-test), required band width, payout (₪), and difficulty. Player picks which to attempt — this is the branching agency VISION.md requires.

**Step 2 — Bureau table opens (~10s setup)**  
A "draw table" appears: a horizontal number line with a wide glowing blue confidence band (very wide, spanning most of the range). Budget meter top-right. A large "משוך דגימה" (draw sample) button in the thumb zone. No other HUD elements.

**Step 3 — Drawing loop (core, ~10s per cycle)**  
Each tap draws one sample point. A dot falls onto the number line with a slight physics bounce. The running mean marker slides. The confidence band visibly contracts. A subtle cost is deducted from budget. Early draws are cheap and narrow dramatically (√n diminishing returns curve); later draws cost more for less narrowing. Player **feels** standard error as a physical/tactile phenomenon.

**Step 4 — Surprise event (once per contract)**  
A "נתון חריג" (outlier) appears — player can include or exclude it. Including shifts the mean, excluding costs 1 free draw. Tests understanding of outlier influence on mean/SD.

**Step 5 — Lock decision (the crux)**  
At any point player taps "נעל אומדן" (lock estimate). The true population value is revealed as a gold pin rising from the table. **Win:** pin is inside the band → payout scales with how *tight* the band was (reward precision over luck). **Miss:** pin outside band → narrated one-sentence Hebrew explanation: "הרווח שלך היה רחב מדי — עוד 4 דגימות והיית בפנים" or "דגמת מספיק, אבל נפלת על זנב נדיר — זה קורה ב-5% מהמקרים גם כשאתה צודק." Unspent budget rolls over.

**Step 6 — Engine move (between contracts)**  
Won ₪ + mastery tokens unlock **Bureau Upgrades** (see below). Player selects which upgrade to install — triggers an SM-2 quiz question from the relevant topic. Correct = upgrade installs. Then chooses which district/contract to open next.

---

### What the Player Decides Every ~20 Seconds

1. **Draw another sample or lock now** (~every 10s) — the core push-your-luck beat.
2. **Include or exclude the outlier** (~once per contract).
3. **Which upgrade to install** (between contracts, every ~90s).
4. **Which district/topic to open next** (every ~2–3 contracts).

---

### How Choices Compound (Engine-Building)

Each won contract earns **mastery tokens** in that topic, which buy persistent Bureau Upgrades. Each upgrade requires answering an SM-2 quiz question correctly to install:

| Upgrade | Mechanic | Stats concept reinforced |
|---|---|---|
| **כיול מוקדם** (Early Calibration) | Start each contract with n=5 free draws | Baseline SE intuition |
| **גלאי שונות** (Variance Detector) | Preview σ before drawing → plan sample size | Power analysis |
| **דגימת אשכולות** (Cluster Sampling) | Cheap bulk draws but correlated → wider band | Sampling design tradeoffs |
| **רווח סמך 99%** (99% CI Contracts) | Higher-confidence contracts unlock, pay more | Width↔confidence tradeoff |
| **מסנן חריגים** (Outlier Filter) | Outlier events shown with their z-score | Outlier detection |

Upgrades stack. A player who built variance-preview + calibration can attempt the tightest, highest-paying contracts that an un-upgraded bureau cannot afford. Early correct answers → richer toolkit → harder districts. This is the Dice Forge / Wingspan compounding loop VISION.md requires.

---

### Failure State (Informative, Not Punishing)

Missing a contract never ends the run. The pin-reveal animation narrates the cause in one Hebrew sentence. Two failure flavors:

- **Method correct, unlucky tail:** "דגמת מספיק, אבל נפלת על זנב נדיר — זה קורה ב-5% מהמקרים גם כשאתה צודק." This explicitly teaches that a correct method can still miss — the meaning of 95% confidence.
- **Band too wide:** "הרווח שלך היה רחב מדי — עוד 4 דגימות והיית בפנים." Teaches that precision requires more n.

Budget rolls over; the district stays open at a cheaper clause. The underlying SM-2 card is rescheduled so the miss feeds spaced repetition.

---

### Mapping to Existing Codebase

**Reuse (untouched or lightly extended):**
- `learningStore.ts` — SM-2 engine (`CardData`, `sm2Update`, XP multiplier) drives upgrade-unlock answers and review scheduling.
- `quiz-bank.json` — supplies install-upgrade questions, keyed by existing topic strings.
- `arsenalStore.ts` — "potions" map onto consumable bureau boosts.
- `LearningMap.tsx` / `ConceptMapFlow.tsx` — repurposed as the district map for contract selection.
- R3F `CityLighting.tsx`, `CameraRig.tsx`, post-processing pipeline — the city backdrop gains meaning as districts grow.

**Replace/extend:**
- The cosmetic city (`WaffleStackCityGodot.tsx`, `ProceduralBuilding.tsx`) — buildings become **districts that physically grow** when their topic's contracts are won (building height = mastery level), so the 3D scene gains a consequence and stops being decoration.
- `StatChallenge.tsx` — demoted from "the game" to the upgrade-install quiz surface only. The bureau table becomes the primary game screen.

**New Zustand store (`src/store/bureauStore.ts`, persist key `wafflestack-bureau-v1-${userId}`):**
```typescript
interface BureauState {
  budget: number;
  masteryTokens: Record<string, number>; // topic → tokens
  installedUpgrades: string[];
  activeContract: {
    topic: string;
    trueValue: number;
    sigma: number;
    requiredWidth: number;
    payout: number;
    clause: 'tight' | 'standard' | 'loose';
  } | null;
  draws: number[];
  currentMean: number;
  currentSE: number;
  bandWidth: number;
  openDistricts: string[];
  contractsWon: number;
  contractsFailed: number;
}
```

**Visual output (R3F scene):**
- Bureau table: a dark `#1c1f26` surface, dots falling with Framer Motion physics, confidence band as a glowing `--blue` horizontal slab contracting with each draw → `--teal` on win, `--red` on miss, `--gold` for payout reveal.
- City backdrop: buildings grow in height as mastery tokens accumulate — the 3D scene now reflects real game state.
- All within the locked VISION.md color palette. Zero new hex values.

---

### Why This Loop Wins Against VISION Rules

| Rule | Verdict | Evidence |
|---|---|---|
| Gameplay ≠ Gamification | ✓ | The only way to win is to internalize how SE shrinks with √n. There is no answer-then-confetti; the band IS the decision surface. |
| Decision interval ≤30s | ✓ | Draw-or-lock tap every 8–15s; upgrade/branch every ~90s. |
| Decisions compound | ✓ | Bureau upgrades make early correct concepts permanently expand available contracts. |
| Stats-first | ✓ | The decision *uses* sampling distributions, SE, and CI width — not adjacent to them, they are the controller. |
| Wonder-tap | ✓ | Live narrowing band + dots raining onto number line + gold pin reveal. |
| Hebrew-first RTL | ✓ | All copy in Hebrew, RTL layout, ₪ currency. |
| Dark UI locked tokens | ✓ | `--blue`, `--teal`, `--red`, `--gold` only. |
| Mobile-first | ✓ | One large thumb-zone draw button; bottom-sheet for upgrade selection. |
| Player agency | ✓ | District/topic choice is explicit and branching, not linear. |
| Failure informative | ✓ | Narrated one-sentence cause; budget rolls over; SM-2 reschedules. |

---

### Open Questions / Risks

1. **Tactility of the narrowing band:** Must read as physical/spatial on a small mobile screen, not as a stats chart. Needs a Framer Motion prototype to validate the wonder-tap before building the full bureau.
2. **σ honesty:** Showing a true σ and drawing real Gaussian samples client-side is trivial, but seeds must be per-contract and revealed post-lock to avoid players reverse-engineering the RNG.
3. **Coverage breadth:** Sampling/CI/SE/variance are the native fit. t-test, ANOVA, and regression must be framed as *contract types* ("compare two districts' means") or they will feel bolted on. A full contract-type taxonomy mapping all 10 existing quiz topics is needed before Cycle 2.
4. **Difficulty calibration:** Budget vs draw-cost vs required width must be balanced so failure is frequent-but-fair (~50% loss rate tolerated per VISION.md) — requires playtesting numbers, not just math.
5. **Two progression systems:** Must merge the district map with the existing `LearningMap`/SM-2 due-cards so the player is not navigating two competing progression UIs.

---

## Next Cycle (Cycle 2) Recommendation

Build the core bureau table loop behind a feature flag `SAMPLING_BUREAU` in `src/config/featureFlags.ts`. Scope:
1. `bureauStore.ts` — state machine for active contract.
2. `BureauTable.tsx` — draw-or-lock screen with live band animation.
3. `ContractCard.tsx` — contract selection UI.
4. Vitest unit tests for `computeMean`, `computeSE`, `computeBandWidth` pure logic.
5. Integrate with existing SM-2 for upgrade-install questions.
6. Do NOT replace the city or `LearningMap` — run bureau as an isolated route behind the flag.
