# WaffleStack — Gameplay Design Space Exploration
## Proactive Cycle 01 — 2026-05-31

**Cycle type:** Exploration only (no code)
**Agent model routing:** Haiku (repo scan) → Opus (design decision) → Sonnet (write-up)
**NotebookLM:** SKIPPED — MCP connector not available this cycle. Design judgment drawn from VISION.md catalogue + own analysis.
**VISION.md read:** ✓ (full)

---

## Context: What Exists Today

The repo has a 3D city builder (R3F/Three.js), quiz lesson screens, an Arsenal of concept cards, a whiteboard canvas, and a concept map view. Git log shows ~106 PRs of iteration but no gameplay loop that ties decisions to statistical concepts. The city-builder exists as visual scaffolding but lacks the "decision that uses stats" core.

---

## Evaluation Criteria

Per VISION.md:
- **Topic-fit (1–5):** How naturally does the mechanic carry stats concepts? Does the decision *use* the concept, not merely display it?
- **Wonder-tap (1–5):** Emotional pull — would a tired BA student want to tap again?
- **Mobile-friendliness (1–5):** One-thumb play, portrait, 44pt targets.
- **Decoration risk (Low/Med/High):** Can the skin grow to consume the stats?
- **Engine-building potential (Low/Med/High):** Do early decisions compound into later state?
- **Decision interval:** How many seconds between meaningful choices?
- **Total score:** topic-fit × 2 + wonder-tap + mobile-friendliness (max 15)

---

## 7 Candidate Gameplay Loops

### 1. 🧪 Quacks Lab — "Push-Your-Sample"

> Draw observations from a bag to build your sample; cash out before variance ruins your estimate.

- **Board game inspiration:** Quacks of Quedlinburg — push-your-luck with bag composition = population distribution
- **Mobile game inspiration:** Suika/Watermelon Game — accumulative tension, satisfying convergence moment
- **Core decision:** Keep drawing data points or stop? Each draw updates the running mean/SD; outlier tokens explode your confidence interval.
- **Decision interval:** 8–15 seconds per draw
- **Engine-building:** High (upgrade bag composition between rounds — fewer outlier tokens = more controlled distribution)
- **Decoration risk:** Low — the bag composition *is* the distribution; you cannot skin it away
- **Topic-fit:** 5 | **Wonder-tap:** 4 | **Mobile:** 5
- **Total: 5×2 + 4 + 5 = 19 → normalized cap: 15** (high end of scale)

---

### 2. 🕵️ Hypothesis Heist

> You're a detective; collect evidence to reject the null before the trail goes cold.

- **Board game inspiration:** Sherlock/deduction games (Consulting Detective) — evidence weighting and inference
- **Mobile game inspiration:** Her Story — fragment gathering toward a conclusion
- **Core decision:** Which test (z/t/chi-square) fits the gathered evidence? Pick wrong = wasted turn; evidence type constrains valid tests.
- **Decision interval:** 20–30 seconds
- **Engine-building:** Low (linear investigation path)
- **Decoration risk:** Medium — narrative skin can overpower the stats if not carefully constrained
- **Topic-fit:** 4 | **Wonder-tap:** 4 | **Mobile:** 4
- **Total: 4×2 + 4 + 4 = 16 → cap: ~14**

---

### 3. 🍇 Distribution Vineyard

> Plant data-grapes; the shape of your harvest distribution determines wine quality.

- **Board game inspiration:** Viticulture — worker placement with seasonal rhythm
- **Mobile game inspiration:** Hay Day / Stardew Valley — land allocation, harvest anticipation
- **Core decision:** Allocate workers to shift the distribution's shape (skew, spread, peak) toward a target normal curve.
- **Decision interval:** 30 seconds
- **Engine-building:** High (vineyard grows across sessions)
- **Decoration risk:** **High** — farm world can eat the stats core; visually rich but loop-integrity fragile
- **Topic-fit:** 3 | **Wonder-tap:** 5 | **Mobile:** 3
- **Total: 3×2 + 5 + 3 = 14**

---

### 4. 🎲 Dice Forge Estimator

> Reforge your dice faces to match a hidden population; roll to sample it.

- **Board game inspiration:** Dice Forge — literal mutating dice faces as parameter levers
- **Mobile game inspiration:** Dicey Dungeons — dice as character expression, not pure chance
- **Core decision:** Which die faces to engrave so your rolls' mean and variance match the target parameter shown on screen.
- **Decision interval:** 12 seconds
- **Engine-building:** Very High — dice grow permanently over sessions
- **Decoration risk:** Low — die math is exposed, cannot be decorative
- **Topic-fit:** 4 | **Wonder-tap:** 4 | **Mobile:** 4
- **Total: 4×2 + 4 + 4 = 16 → cap: ~15**

---

### 5. 📉 Regression Racer

> Steer a line through a scatter cloud to predict where the prize lands.

- **Board game inspiration:** Azul — spatial line placement with residual cost
- **Mobile game inspiration:** Golf-aim / Angry Birds — drag-and-aim, immediate visual feedback
- **Core decision:** Set slope + intercept (drag handles) to minimize residuals before the next data point drops.
- **Decision interval:** 10 seconds
- **Engine-building:** Medium (unlock new scatter clouds / noise levels)
- **Decoration risk:** Low — residuals are naked math
- **Topic-fit:** 4 | **Wonder-tap:** 3 | **Mobile:** 5
- **Total: 4×2 + 3 + 5 = 16 → cap: ~15**

---

### 6. ☕ Confidence Coffee Rush

> Run a café; serve customers an estimate interval wide enough to be right but tight enough to tip well.

- **Board game inspiration:** Seize the Bean — café engine, time pressure, competing orders
- **Mobile game inspiration:** Coffee Rush / Diner Dash — real-time triage, customer satisfaction meter
- **Core decision:** Choose CI width (90/95/99%) under time pressure — wider = safer = lower tip; tighter = riskier = higher reward.
- **Decision interval:** 6 seconds (real-time)
- **Engine-building:** Medium (café upgrades over sessions)
- **Decoration risk:** **High** — café world and character animations can swamp the CI decision
- **Topic-fit:** 3 | **Wonder-tap:** 5 | **Mobile:** 4
- **Total: 3×2 + 5 + 4 = 15**

---

### 7. 🦎 Probability Zoo (Childlike Collection)

> Hatch creatures whose traits are random variables; breed toward rare combos.

- **Board game inspiration:** Wingspan — bird abilities as random variable modifiers; engine of combinations
- **Mobile game inspiration:** Pokémon / Neko Atsume — wonder-tap collection, rare spawn anticipation
- **Core decision:** Choose which probabilistic "egg" to incubate based on expected value and joint probability of traits aligning with your target combo.
- **Decision interval:** 20 seconds
- **Engine-building:** High (collection grows, combos compound)
- **Decoration risk:** **High** — creature art and collection screen become the pull; stats become flavor text
- **Topic-fit:** 3 | **Wonder-tap:** 5 | **Mobile:** 4
- **Total: 3×2 + 5 + 4 = 15**

---

## Scoring Summary

| # | Name | Topic-fit | Wonder-tap | Mobile | Total | Deco Risk |
|---|---|---|---|---|---|---|
| 1 | Quacks Lab | 5 | 4 | 5 | **15** | Low |
| 4 | Dice Forge Estimator | 4 | 4 | 4 | **15** | Low |
| 5 | Regression Racer | 4 | 3 | 5 | **15** | Low |
| 2 | Hypothesis Heist | 4 | 4 | 4 | **14** | Medium |
| 3 | Distribution Vineyard | 3 | 5 | 3 | **14** | High |
| 6 | Confidence Coffee Rush | 3 | 5 | 4 | **15** | High |
| 7 | Probability Zoo | 3 | 5 | 4 | **15** | High |

Tie-break on decoration risk: candidates with equal total scores ranked by decoration risk (Low beats High).

---

## TOP-3 RANKING

### 🥇 #1 — Quacks Lab (Push-Your-Sample)

**Why:** Highest topic-fit score (5/5) combined with lowest decoration risk. The bag-draw mechanic is the sampling distribution; push-your-luck tension is intrinsically about the cost of variance and the precision-sample-size tradeoff. You cannot skin it away — the math is the game dial. One-thumb mobile play. Teaches the conceptual spine of inferential statistics (sampling → variance → confidence intervals) through a single, addictive, analog decision repeated every 8–15 seconds.

**Ruled-out concern:** Lower wonder-tap (4/5) vs café/zoo candidates — but their wonder comes at the cost of high decoration risk. Quacks' wonder lives in the *convergence moment* (watching x̄ stabilize as n grows), which is both beautiful and educational.

### 🥈 #2 — Dice Forge Estimator

**Why:** Best engine-building potential ("reforge your dice to match a hidden population" = parameter estimation made tactile). Very strong for descriptive stats + distributions. Lower than Quacks because the hypothesis-testing concepts are harder to bolt on naturally; it shines brightest for probability + estimation. Natural second mode after Quacks unlocks the idea of distributions.

### 🥉 #3 — Regression Racer

**Why:** Most honest "stats as skill" loop — drag-the-line is genuinely doing regression. Extremely mobile-native (pinch/drag). Lower wonder-tap keeps it from #1 but makes it the strongest *secondary mode* — a daily challenge ("fit today's scatter cloud") à la Wordle.

**Explicitly rejected for Cycle 1 core:**
- Distribution Vineyard, Confidence Coffee Rush, Probability Zoo — high wonder-tap but high decoration risk; better as the unlock-the-world meta-layer that Quacks winnings feed.

---

## DETAILED SPEC — #1: Quacks Lab (Push-Your-Sample)

### Full Game Loop Description

You are a researcher running an experiment. You have a **data bag** — a sack of tokens, each representing one observation. The bag's composition *is* the population distribution: common tokens cluster near the mean, rare tokens are outliers. Your goal each round: draw a sample whose statistics hit a target band without "busting."

You draw tokens one at a time by tapping the bag (or pressing Draw). With every draw, a live **running readout** updates: n (sample size), x̄ (sample mean), and s (sample SD). A gold target marker sits on a number line — "estimate the population mean within this band." Early draws are wildly noisy: with n=2 your mean swings violently. As n grows, the mean stabilizes and the confidence interval narrows visibly — the player *sees* the Central Limit Theorem happen in their hand. But the bag also contains **outlier tokens** (the "cherry bombs" of Quacks of Quedlinburg): draw one and your variance spikes, widening your confidence interval and potentially blowing your accuracy.

The push-your-luck heart: **at any moment you may STOP and cash out.** Score = f(how close x̄ is to true mean, CI tightness, draws used). More draws = tighter CI = more points — but each draw risks an outlier. Between rounds: a **shop phase** (Dice Forge buy-phase) where winnings upgrade the bag: buy low-variance tokens, a "median shield" that ignores one outlier, or a larger sample budget. These purchases are defined entirely by their effect on the distribution — every purchasable is a stats lever.

### Statistical Concept → Decision Mapping

| What the player decides | Statistical concept being exercised |
|---|---|
| Watch x̄ settle as draws accumulate | Law of large numbers; sampling distribution of the mean |
| Stop vs. draw one more | Sample size ↔ precision (standard error); n vs SE tradeoff |
| React to an outlier chip arriving | Variance, SD; effect of outliers on estimates |
| Choose CI width before cashing out (round 5+) | Confidence intervals; confidence level interpretation |
| Buy variance-reducing tokens in shop | What drives SD; understanding spread |
| "Does my interval cover the target band?" | CI coverage; what a CI actually means |
| Pick mean vs. median summary when outliers present (later) | Robustness; when to prefer median |

### Mobile Screen Layout (portrait, RTL, dark #0e0f12)

```
┌─────────────────────────────────┐
│  [  number line  •——[band]—— ]  │  ← teal dot = x̄, translucent band = CI
│                                 │    CI shrinks/fattens in real time
│   ┌──────────────────────────┐  │
│   │                          │  │
│   │      [BAG GRAPHIC]       │  │  ← tap anywhere on bag to draw
│   │                          │  │
│   └──────────────────────────┘  │
│                                 │
│  ○ ○ ○ ○ ○ ○ ○ ...chips...     │  ← drawn chips docked here (values visible)
│                                 │
│  n=7  x̄=42.3  s=8.1  נותרו:5  │  ← RTL HUD (gold numerals, large)
│                                 │
│  [      קבע תוצאה / CASH OUT     ]  ← full-width gold primary button
└─────────────────────────────────┘
```

UI notes: All text RTL. Numbers left-to-right within RTL context (standard). Bottom button always in thumb zone. Chip row scrolls horizontally. Outlier chip glows amber (#f59e0b) before docking, then red (#ef4444) at rest. CI band color: teal (#10b981) when covering target, amber when marginal, red when busted.

### First 2 Minutes of Play

**0:00** — Dark screen. A fabric bag, a number line with a gold band. Hebrew prompt: "משכו דגימה כדי לאמוד את הממוצע" (Draw a sample to estimate the mean). No further instruction. Player taps bag.

**0:05** — First chip flies up: "7." Teal dot snaps to 7 — far left of the gold band. CI band is enormous. Player intuits: *not enough data.*

**0:10–0:40** — Player taps 6 more times. Dot visibly wanders, then *converges* toward the gold band as n reaches 8. CI band tightens. The "aha — it settles!" moment is the hook. No one told the player about the Law of Large Numbers; they just watched it happen.

**0:45** — An outlier chip appears (glows amber). Player may stop or draw it. If drawn: "24" — dot jerks right, CI fattens. Player feels variance viscerally, perhaps for the first time.

**1:00** — Prompt: "הדגימה מספיק מדויקת?" (Sample precise enough?). Player weighs: draw to re-tighten? Stop now? They cash out. Score shown with teal animation if CI covers target band; amber/red with short explanation if not. No lecture — just: "הטווח לא כיסה את הממוצע האמיתי. נסו גודל מדגם גדול יותר." (The interval didn't cover the true mean. Try a larger sample.)

**1:15** — Shop phase: two purchasable tokens. "אסימון שונות נמוכה: −2 ל-SD הבאה" (Low-variance token: −2 to next SD). Player buys one, round 2 begins. Now there's also an SD target displayed.

### Why This Is NOT a Quiz with Graphics

There is no question with a list of answers. The player never "selects the correct definition of standard deviation." They manipulate a live sample and watch real statistics respond. The only way to score well is to *understand* that more data tightens estimates while outliers inflate variance — and to time their STOP accordingly. The decision is analog, continuous, and consequence-laden, not multiple-choice. A player who doesn't understand the sample size → precision relationship literally loses points every round. Statistical intuition is the skill. The badge is evidence of the skill, not a substitute for it.

### How It Resists Decoration Drift

The bag's token composition defines the population distribution. The HUD readout is the live sample statistic. The score is a function of CI tightness and coverage. None of these can be reskinned into cosmetics without gutting the game. Any visual flourish decorates *the numbers themselves* (chip animations, dot-trail on number line). World-building and cosmetic unlocks are deliberately placed in the *meta layer* (unlock new "lab rooms" = new distribution types), so the core loop stays pure stats. The shop only sells items that modify distribution parameters — every purchasable is a stats lever.

### Feature Flag

```ts
FEATURE_PUSH_YOUR_SAMPLE_LOOP = false
```

File location: `src/config/featureFlags.ts`

---

## Open Questions for Cycle 2

1. **Outlier mechanic:** Should outliers be visible before drawing (risk-reward choice), or hidden (true surprise)? Visible = more strategic; hidden = more visceral.
2. **Hebrew numeral format:** Display statistics as `42.3` or `42,3` (Israeli convention uses comma for decimal)? Need localization check.
3. **Round length:** 5 draws or 10? Shorter = faster feedback loop, better for mobile sessions. Longer = more variance to observe. Suggest starting at 8 max draws, test with users.
4. **CI explanation:** After a bust, how much do we explain? Current spec: one-sentence. But for first-time players, might need a visual before next round.
5. **How Quacks Lab hooks into existing city-builder:** Winnings could unlock buildings in the 3D city — preserving existing work. Or city-builder becomes the meta-reward world. Worth discussing with Barak.
6. **Regression Racer as second mode:** After Quacks Lab ships behind feature flag, Regression Racer is the logical second cycle (scatter cloud + drag-line). Spec it in Cycle 3.

---

## Board Game + Mobile Game Citations

- **Quacks of Quedlinburg** (Schmidt Spiele, 2018) — push-your-luck bag-building; bag composition = distribution shape; boom tokens = outliers. Core mechanic borrowed directly.
- **Dice Forge** (Libellud, 2017) — mutable die faces as parameter levers; buy-phase upgrading of a random variable's distribution. Inspires the shop phase.
- **Seize the Bean** (BGG/211364) — run-your-own-café engine; thematic wrapper candidate for meta-layer.
- **Arctic Scavengers** (Rio Grande Games) — asymmetric tribe leaders = statistical "school" (frequentist vs Bayesian) for future faction mode.
- **Mechs vs Minions** (BGG/209010) — programming-puzzle mechanic; inspires future Regression Racer "pre-commit your line" variant.
- **Suika/Watermelon Game** (mobile) — accumulative tension with satisfying convergence; emotional template for watching x̄ settle.
- **Dicey Dungeons** (mobile, Terry Cavanagh) — dice as self-expression not pure chance; emotional model for the shop phase.
- **Mini Metro** (mobile, Dinosaur Polo Club) — minimal HUD, one-thumb play, instant restart. UI template for Quacks Lab screen layout.
- **Duolingo** — path-tree progression; model for how topic unlocks hang off Quacks Lab mastery.

---

*Authored by proactive-vision-builder | Cycle 01 | 2026-05-31*
