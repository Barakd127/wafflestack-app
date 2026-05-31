# WaffleStack — Gameplay Loop Exploration
**Proactive Cycle 1 — 2026-05-26 07:09 (Pass 23)**
**Design brain:** Opus 4.7 (gameplay-design decision)
**Synthesis + scoring integration:** Sonnet 4.6
**Status:** Exploration only — no code written this cycle.

---

## Framing

The current app is a **quiz app with a decorative 3D city**. Buildings unlock at XP milestones; the city is cosmetic reward, not gameplay. VISION.md rule #1: "Gamification ≠ Gameplay." This cycle explores what replaces the decoration layer with a real decision engine.

The search criteria (from VISION.md):
- One meaningful decision every 15–30 seconds
- Decision **uses** the statistical concept being learned (not adjacent to it)
- Decisions compound — engine-building energy
- Failure is informative and recoverable
- Player has agency over what to learn next

---

## Candidate Gameplay Loops

### 1 — Distribution Forge (כּוּר ההתפלגויות)

**One-liner:** A Dice Forge-style smithy where you reshape your personal probability distribution by adding/removing faces or dragging a curve, then roll it against client challenges.

**Core mechanic:** Between rounds the player edits their own distribution (die or normal-curve dial) by spending "moments." Each challenge requires rolling a value above/below a threshold, or within a CI, or outside a rejection region. The player must decide: shift mean, tighten variance, add skew, install a second mode — each costs moments.

**Statistical concepts used AS the decision:**
- Variance vs. mean tradeoffs (tightening σ is a spend decision)
- Z-scores (challenge: "beat rival's mean + 2σ_rival" — player computes relative z)
- Confidence intervals (challenge: "produce 90% CI of width ≤ 4" — player physically narrows curve)

**Decision interval:** 15–25 seconds
**Engine-building potential:** 5 — curve carries forward; tools (new dials) compound
**Wonder-tap score:** 5 — the curve visibly deforms in real time with drag handles
**Topic-fit breadth:** 4 — distributions, sampling, CI, z-scores, variance; hypothesis testing reachable via rejection-region dial
**Decoration risk:** 2 — curve IS the model; nothing is cosmetic if the probability ticker is live
**Decision interval fit:** 5

**Board game inspiration:** Dice Forge (Libellud) — mutable die faces as core engine resource
**Secondary board game:** Quacks of Quedlinburg — push-your-luck: roll now or spend moments first?
**Mobile game feedback:** Threes — small deliberate edits, visible chain, addictive simplicity
**UI inspiration:** Polypad sliders + Apple HIG rings (live probability band)
**Kill if:** Players roll without editing → tradeoff isn't sharp enough; raise moments costs or tighten bands.

**Composite score: 23/25**

---

### 2 — Sampling Expedition (קרוואן הדגימה)

**One-liner:** You run an expedition crew that ventures into "data biomes" to capture samples — each haul reshapes a living distribution you bring home.

**Core mechanic:** Player chooses where to sample, how many units to draw, and when to stop. Each scoop costs stamina; each sample reveals one data point that snaps onto a growing histogram. Stopping too early = wide CI; stopping too late = stamina gone.

**Statistical concepts used AS the decision:**
- Sampling distributions (decide n)
- Central Limit Theorem (watch shape emerge with enough n)
- Confidence intervals (stop when CI width < target)
- Bias (which biome to enter)

**Decision interval:** 12–20 seconds
**Engine-building potential:** 5 — captured samples become reusable data-fauna cards
**Wonder-tap score:** 5 — histogram physically materialises as creatures land on shelves
**Topic-fit breadth:** 5 — excellent across sampling, CLT, CI, bias, stopping rules
**Decoration risk:** 2 — if the stop decision is genuinely costly
**Decision interval fit:** 3 (can drift below 12s)

**Board game inspiration:** Quacks of Quedlinburg (push-your-luck stopping) + Wingspan (creature collection engine)
**Mobile game feedback:** Two Dots (satisfying snap-into-place tactile)
**UI inspiration:** Pokédex shelf + Alto's Odyssey biome map
**Kill if:** Stopping decisions feel like "draw until told" rather than genuine weighing of variance vs. cost.

**Composite score: 22/25**

---

### 3 — Mini Distributions (מטרו של נתונים)

**One-liner:** A Mini Metro-like map where you draw "data pipes" between sources and analyses; flow rate is governed by statistical assumptions you maintain.

**Core mechanic:** Drag lines between data-source nodes and test-station nodes. Each new line forces choice: parametric vs. non-parametric, paired vs. unpaired. Lines clog when assumptions break — the clog IS the learning.

**Statistical concepts used AS the decision:**
- Test selection (t-test vs Mann-Whitney vs ANOVA)
- Assumption checking (normality, independence)
- Correlation routing

**Decision interval:** 20–30 seconds
**Engine-building potential:** 5
**Wonder-tap score:** 4 — weekly tick, gentle alarms
**Topic-fit breadth:** 4
**Decoration risk:** 2 — risk is stats label becomes a sticker on the pipe
**Decision interval fit:** 5

**Board game inspiration:** Catan road network + Power Grid routing
**Mobile game feedback:** Mini Metro (pipeline drag-and-drop density)
**UI inspiration:** Mini Metro visual language
**Kill if:** Route choice becomes purely topological and the stats label is decorative.

**Composite score: 22/25**

---

### 4 — Regression Garden (גן הרגרסיה)

**One-liner:** A patchwork garden where you plant data-points; the fitted line is a living vine whose fruit yield depends on R².

**Core mechanic:** Place point-tiles on a 2D plot. After each placement, a vine re-fits and bears fruit proportional to R². Outliers can be pruned (cost) or kept (risk). Leverage points have special glow.

**Statistical concepts used AS the decision:**
- Correlation and simple regression
- Leverage and influence
- Residuals and overfitting

**Decision interval:** 15–25 seconds
**Engine-building potential:** 4
**Wonder-tap score:** 5 — vine re-fitting in real time is visually stunning
**Topic-fit breadth:** 3 — deep on regression, thin elsewhere
**Decoration risk:** 3 — garden looks pretty but R² must be visible and causal
**Decision interval fit:** 5

**Board game inspiration:** Patchwork (Uwe Rosenberg) — spatial tile placement under cost budget
**Mobile game feedback:** Threes / Two Dots
**UI inspiration:** Desmos + Animal Crossing island layout
**Kill if:** R² is computed off-screen and players don't see the line move.

**Composite score: 20/25**

---

### 5 — Pipeline Programmer (מסלול הניתוח)

**One-liner:** Mechs vs. Minions for stats — pre-commit a 5-step analysis pipeline, hit run, watch it execute against a mystery dataset.

**Core mechanic:** Drag-drop ordered cards: [load → clean → describe → test → conclude]. Run reveals each step's output sequentially. Player diagnoses mismatches.

**Statistical concepts used AS the decision:**
- Full workflow: descriptive stats choice, outlier handling, test choice, alpha selection
- Hypothesis testing appropriateness

**Decision interval:** 25–40 seconds (slow but rich)
**Engine-building potential:** 4
**Wonder-tap score:** 3
**Topic-fit breadth:** 5 — covers entire curriculum
**Decoration risk:** 2
**Decision interval fit:** 3 (too slow; risks one decision per minute)

**Board game inspiration:** Mechs vs. Minions (League of Legends) — programmed instructions commit
**Mobile game feedback:** Human Resource Machine
**UI inspiration:** Scratch blocks + Jupyter cell outputs
**Kill if:** Pipeline becomes a checklist with one valid sequence per problem.

**Composite score: 19/25**

---

### 6 — Hypothesis Court (בית הדין להשערות)

**One-liner:** A Reigns-style courtroom where claims arrive on cards and you rule "reject / fail to reject" using evidence you've stockpiled.

**Core mechanic:** Swipe left/right on incoming claims. Each ruling consumes evidence tokens; wrong rulings shift the population of future claims toward harder territory.

**Statistical concepts used AS the decision:**
- Null/alt hypothesis framing
- Type I/II error budgets (error tokens as scarce resource)
- P-values as currency
- Effect size weighing

**Decision interval:** 8–15 seconds (too fast)
**Engine-building potential:** 3
**Wonder-tap score:** 4 — kingdom map visibly tilts with each ruling
**Topic-fit breadth:** 3
**Decoration risk:** 4 — easy to drift into quiz-with-card-flip
**Decision interval fit:** 3

**Board game inspiration:** Cry Havoc (asymmetric faction pressure); Arctic Scavengers (tribe identity)
**Mobile game feedback:** Reigns (swipe + meter consequences)
**UI inspiration:** Papers Please
**Kill if:** Swipe outcome reduces to "is answer right" without weighing error costs.

**Composite score: 15/25**

---

### 7 — Variance Vineyard (כרם הסטיות)

**One-liner:** Viticulture-style worker placement where you allocate workers across plots that differ in expected yield vs. variance.

**Core mechanic:** Each week place 3 workers across plots. Plots have known μ, hidden σ. Workers harvest a sample; payout = realised draw. Spend payouts to buy more reliable plots or accept volatile high-mean ones.

**Statistical concepts used AS the decision:**
- Mean-variance tradeoff
- Expected value and risk
- Standard error (more workers on one plot = lower SE)
- Diversification (portfolio intuition)

**Decision interval:** 20–30 seconds
**Engine-building potential:** 5
**Wonder-tap score:** 3
**Topic-fit breadth:** 3
**Decoration risk:** 3 — vineyard decoration if σ becomes invisible
**Decision interval fit:** 5

**Board game inspiration:** Viticulture (worker placement); Stardew Valley weekly cadence
**Mobile game feedback:** Stardew Valley satisfying harvest pulse
**UI inspiration:** Viticulture board top-down
**Kill if:** σ becomes invisible and players just chase μ.

**Composite score: 19/25**

---

### 8 — Bayes Bazaar (השוק של תומאס)

**One-liner:** Trade samples with NPC merchants whose "honesty priors" you update each session — prior × likelihood = posterior = next trade decision.

**Core mechanic:** Each merchant has a hidden quality distribution. Buy samples, observe outcomes, update posterior belief, decide whether to trade more. The player must choose how much weight to give new evidence vs. prior.

**Statistical concepts used AS the decision:**
- Conditional probability and Bayesian updating
- Base rates and prior vs. likelihood weighting

**Decision interval:** 15–25 seconds
**Engine-building potential:** 4 — posteriors carry forward as trust meters
**Wonder-tap score:** 4 — merchants' trust auras visibly shift
**Topic-fit breadth:** 3
**Decoration risk:** 3
**Decision interval fit:** 5

**Board game inspiration:** Catan trade window + Sheriff of Nottingham bluffing
**Mobile game feedback:** Reigns dialogue choices + Pokémon market stalls
**UI inspiration:** Pokémon mart + Linear status pills
**Kill if:** Updating happens automatically without the player choosing how much to weight new evidence.

**Composite score: 19/25**

---

## Scoring Summary

Composite = engine-building + wonder-tap + topic-fit + (5 − decoration-risk) + interval-fit

| # | Loop | Eng | Won | Top | Decor⁻¹ | Int | **Total/25** |
|---|---|---|---|---|---|---|---|
| 1 | Distribution Forge | 5 | 5 | 4 | 3 | 5 | **23** |
| 2 | Sampling Expedition | 5 | 5 | 5 | 3 | 3 | **22** |
| 3 | Mini Distributions | 5 | 4 | 4 | 3 | 5 | **22** |
| 4 | Regression Garden | 4 | 5 | 3 | 2 | 5 | **20** |
| 5 | Pipeline Programmer | 4 | 3 | 5 | 3 | 3 | **19** |
| 6 | Variance Vineyard | 5 | 3 | 3 | 2 | 5 | **19** |
| 7 | Bayes Bazaar | 4 | 4 | 3 | 2 | 5 | **19** |
| 8 | Hypothesis Court | 3 | 4 | 3 | 1 | 3 | **15** |

---

## Top-3 Ranking

1. **Distribution Forge (23/25)** — highest combined; uniquely teaches distribution shape + variance + CI as the GAME. The curve IS the model. Engine-building is unambiguous. Wonder-tap (visible curve deformation) is immediate on first session.

2. **Sampling Expedition (22/25)** — best topic breadth; CLT, sampling, CI all emerge from the same mechanic. Ranked below Forge because the wonder-tap requires creatures/biome assets (more scope for Cycle 2) and the decision interval can drop below 15s.

3. **Mini Distributions (22/25)** — strong visual metaphor; assumptions-as-pipe-pressure is elegant. Ranked below Expedition because "route becomes topological" risk is harder to design around.

---

## #1 Detailed Spec: Distribution Forge

*(Opus 4.7 authoritative spec)*

### Pitch

You inherit a tiny forge. On its anvil sits *your* distribution — at first a flat boring uniform. Each session, challenges arrive from client NPCs: "hit a value ≥ 18 on a single roll," "land inside a 90% CI of width ≤ 4," "beat the rival's mean without exceeding σ = 3." Between challenges you spend "moments" to reshape your curve: shift mean, tighten variance, add skew, install a second mode. The forge is the engine; the rolls are the test.

---

### Player Experience Arc

**First 5 minutes.**
Client NPC appears (Hebrew speech bubble): "אני צריך נתונים שמתחלקים בצורה אחידה." Player sees biased die where face 6 = 50%. Tutorial: "גרור את ה-6 למטה ופזר את ההסתברות." Player drags sliders. Live histogram updates. Uniform shape hit → click sound → 30 animated spheres drop into buckets → match → coins rain. Total: ~90 seconds.

**First session (≈10 min, 6 challenges).**
Challenge 3: σ matters — "roll between 10 and 14." Challenge 5: bimodal — "roll ≥ 20 OR ≤ 2." Player ends with a signature curve saved as first artifact.

**Week 1 arc.**
Day 1: uniform + skewed. Day 2: normal bell curve. Day 3: bimodal. Day 4: real dataset (n=50 exam scores), goodness-of-fit. Day 7: CI client. Rival NPC curves appear day 4. Branching map: "Z-Score Cliffs," "Confidence Cove," "Effect-Size Foundry."

---

### The One Core Screen

```
┌─────────────────────────────────────────────────┐
│  [moments: 7]    [day 3 — Confidence Cove]      │
│                                                 │
│        ╭──────── THE CURVE ────────╮            │
│        │   interactive PDF/PMF    │            │
│        │   drag handles on peak   │            │
│        ╰──────────────────────────╯            │
│                                                 │
│  μ ●────────|────   σ ●──|──────               │
│  skew ●──|────    modes  [1]  [2]              │
│                                                 │
│  challenge: "land inside [8,12] with ≥80% conf"│
│  P(in band) = 54%   ← target ≥ 80%            │
│                                                 │
│    [FORGE (−2 moments)]   [ROLL]   [skip]      │
└─────────────────────────────────────────────────┘
```

- **Curve canvas:** PDF is the hero. Tap-drag peak shifts μ; pinch sides changes σ. Skew handle on right tail. Mode toggle injects second bump.
- **Challenge ribbon:** Hebrew sentence + **live P(success)** — every dial nudge updates it. This is the decision-interval engine.
- **Roll button:** marble animation → sampled value. Win/loss binary; payout scales with tightness (risk premium).
- No hamburger menu. Bottom-strip CTA in thumb zone (Apple HIG ≥44pt).

---

### The One Core Feedback Loop

```
[Challenge arrives]
        ↓
[Player edits curve] — drags μ/σ/modes; costs moments; live P(success) ticks
        ↓
[ROLL] → marble draws sample
        ↓
Win: tool awarded (new dial, moments, curve slot)
Loss: tail-area overlay shows WHERE sample landed → internalises WHY
        ↓
[State update: moments, tools, biome tick, SM-2 log]
        ↓
[Next challenge auto-loads]
```

Fail = diagnostic, never a wall.

---

### Three Stats Concepts Used AS the Decision

**1. Z-scores.** Challenge: "roll ≥ μ_rival + 2σ_rival." Sliding μ vs. tightening σ are different z-routes — the choice IS the learning.

**2. Confidence intervals.** Challenge: "90% CI of width ≤ 4." Player tightens σ trading future flexibility. Width + confidence visible as shaded band on canvas.

**3. Variance / mean-variance tradeoff.** Bimodal challenges force deliberate variance addition — variance isn't "bad," it's a tool.

---

### Technical Prototype Scope for Cycle 2

**`<DistributionCanvas />`** — SVG PDF renderer. Props: `{ mu, sigma, skew, modes }`. Drag handles, challenge-band shading, `onChange` emit.

**`<ChallengePanel />`** — Reads curve params → Simpson's rule P(success) (200pts). Hebrew challenge text + live probability ticker + Roll/Forge/Skip.

**`<ForgeHUD />`** — Moments, tools, biome. Spend-on-edit. localStorage (v0).

Zustand: `src/store/forgeStore.ts`

**Feature flag:** `ff_distribution_forge_v0` in `src/config/featureFlags.ts`

**Out of scope Cycle 2:** rival NPC curves, multi-biome map, 3D animation. One biome, 6 challenges, 1 curve slot.

**Playtest metric:** Do players edit before rolling? Yes → loop works.

---

## Inspirations Ledger

| Source | Type | Mechanic borrowed |
|---|---|---|
| Dice Forge (Libellud) | Board game | Mutable die faces as core engine resource |
| Quacks of Quedlinburg | Board game | Push-your-luck stopping decisions |
| Mechs vs. Minions | Board game | Pre-commit programming-puzzle pipeline |
| Patchwork (Uwe Rosenberg) | Board game | Spatial tiling under cost budget |
| Wingspan | Board game | Creature collection engine |
| Century Spice Road | Board game | Prerequisite pyramid / resource trade chain |
| Viticulture | Board game | Worker placement across variance plots |
| Arctic Scavengers | Board game | Asymmetric tribe-leader school choice |
| Cry Havoc | Board game | Faction-vs-faction territory pressure |
| Catan (trade window) | Board game | NPC resource exchange |
| Seize the Bean | Board game | Run-your-own-place engine |
| Coffee Rush | Board game | Real-time triage queue |
| Stuffed Fables | Board game | Per-encounter unique mini-mechanic |
| Threes | Mobile game | Small deliberate edits, visible chain |
| Two Dots | Mobile game | Chain-completion aesthetic satisfaction |
| Mini Metro | Mobile game | Pipeline drag-and-drop density |
| Reigns | Mobile game | Binary-feel swipe, instant consequence |
| Stack the States | Mobile game | Collection + map unlock dopamine |
| Linear.app | UI | Dark density, status pills |
| Stripe Docs | UI | Side-by-side instructional layout |
| Apple HIG (iOS dark) | UI | 44pt hit targets, thumb zone |
| Anthropic.com | UI | Whitespace restraint, typography rhythm |
| Duolingo | UI | Daily streak + path-tree (biome map) |

---

## Open Questions for Cycle 2

1. **Discrete die vs. continuous curve:** PMF vs PDF — both valid. Cycle 2 should prototype both and let playtest decide.
2. **Hebrew copy:** Placeholder English in component props; Hebrew strings in `challenges.he.ts`.
3. **3D marble vs. SVG:** Start SVG; promote to R3F if ≤16ms frame budget.
4. **Coexistence:** Feature-flagged; current quiz/city flow untouched.

---

*Generated: 2026-05-26 07:09 | Pass 23 | Design: Opus 4.7 | Synthesis: Sonnet 4.6*
