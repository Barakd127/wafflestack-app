# WaffleStack — Gameplay Exploration
## Proactive Cycle 01 | 2026-05-21

**Branch:** `proactive/exploration/games-design-space`
**Cycle type:** Exploration only — no code changes.
**NotebookLM:** SKIP — MCP connector not available in this container. VISION.md catalogue + design judgment used instead.

---

### 1. Candidate Gameplay Loops

---

#### Candidate A: Cafe Forecaster (קפה ניבוי) — ☕📈
- **One-line concept:** Run a Tel Aviv cafe where you predict daily customer demand from sample data, then stock inventory under uncertainty.
- **Core mechanic:** Engine-building + push-your-luck (Seize the Bean × Quacks of Quedlinburg).
- **The player's decision:** Given a sample of past-day demand, decide a confidence interval for tomorrow's traffic and stock accordingly — over-stock wastes capital, under-stock loses customers. Player chooses both the point estimate AND the interval width (risk tolerance).
- **Decision interval:** ~20s per stocking decision; 4–6 decisions per "day"; ~8 days per session.
- **Stats concepts used:** sampling distributions, confidence intervals, mean/median, standard deviation, normal distribution, z-scores (for interval width).
- **Compounding mechanism:** Profit funds equipment (espresso machine = lower variance, marketing = higher mean), staff (more samples per day = tighter CIs), and cafe expansion (new locations = new distributions to learn). Better instruments literally shrink the sigma you're estimating against.
- **Failure mode:** Bankrupt day = lose one location, not the run. Sample data preserved. Player sees ex-post which interval would have caught the true demand — explicit calibration feedback.
- **Mobile feasibility:** Excellent. One-handed; slider for CI width sits in bottom third; histogram of past demand sits top. Hebrew RTL friendly.
- **Decoration risk:** LOW. Every cosmetic upgrade is a statistical parameter (μ, σ, n). Cannot drift cosmetic without breaking the loop.
- **Score: 28/30** — Decision Quality 10, Wonder 8, Stats Fit 10.

---

#### Candidate B: Creature Hypothesis Lab (מעבדת היצורים) — 🦕🔬
- **One-line concept:** Collect mysterious creatures; test hypotheses about their hidden traits via experiments you fund.
- **Core mechanic:** Set-collection + boss-encounter (Stuffed Fables × Pokémon).
- **The player's decision:** Allocate a limited testing budget across creatures, choosing sample size and significance threshold per experiment to confirm/reject trait hypotheses before a "field exam."
- **Decision interval:** ~25s per experiment design; 6–8 experiments per session.
- **Stats concepts used:** hypothesis testing, p-values, t-tests, effect size, sample size / power, type I/II errors.
- **Compounding mechanism:** Confirmed creatures join your roster and grant lab upgrades (cheaper sampling, higher power). Wrong rejections leave permanent "?" cards reminding you of past type II errors.
- **Failure mode:** A false confirmation in the field exam reveals the truth visually — the creature literally fails its predicted behavior. Recoverable: re-test with bigger n.
- **Mobile feasibility:** Good. Creature cards swipe-stack; budget allocation is tap-and-hold. Some risk of cramped UI with 4+ variables on screen.
- **Decoration risk:** MEDIUM. The creature collection layer can drift toward pure Pokédex if the experiment math gets bypassed. Must enforce: no creature joins roster without a passed hypothesis test.
- **Score: 26/30** — Decision Quality 9, Wonder 9, Stats Fit 8.

---

#### Candidate C: Signal in the Static (אות ברעש) — 📡🎛️
- **One-line concept:** Zen puzzle: tune dials to extract a true signal from increasingly noisy data streams.
- **Core mechanic:** Spatial puzzle + real-time dexterity (Two Dots × Mini Metro).
- **The player's decision:** Adjust three dials (sample size, smoothing window, threshold) to maximize true-positive detection while data streams in. Choose when to commit a reading.
- **Decision interval:** ~10–15s per commit; continuous micro-adjustments.
- **Stats concepts used:** mean vs median (robustness), standard deviation, z-scores, signal-to-noise, sampling.
- **Compounding mechanism:** Unlocked dials add new dimensions (correlation filter, regression detrender). Levels remix prior noise profiles, rewarding learned intuition.
- **Failure mode:** Missed signal = level retry with same data; you see what dial setting would have worked. Strong calibration feedback.
- **Mobile feasibility:** Excellent. Dials are radial sliders, perfect for thumb. Beautiful at small screens.
- **Decoration risk:** MEDIUM. Risk of becoming "pretty waveform game" if dials don't map 1:1 to named statistical operations.
- **Score: 24/30** — Decision Quality 8, Wonder 9, Stats Fit 7.

---

#### Candidate D: Election Night (ליל בחירות) — 🗳️📊
- **One-line concept:** You're a pollster on election night; allocate field teams to sample districts and call races before rivals.
- **Core mechanic:** Worker-placement + push-your-luck (Viticulture × Quacks of Quedlinburg).
- **The player's decision:** Where to send pollsters (which districts), how large a sample to take, when to "call" a race based on current CI. Calling early scores big but wrong calls cost reputation.
- **Decision interval:** ~20s per allocation; ~10 districts per night.
- **Stats concepts used:** sampling, margin of error, confidence intervals, sample size effects, stratified sampling.
- **Compounding mechanism:** Reputation buys more pollsters next night; correctly-called districts become "known" demographics, transferring priors to similar districts.
- **Failure mode:** Wrong call shown on a giant map with the ex-post true result and CI overlay. Recoverable next election.
- **Mobile feasibility:** Good but map-heavy — risks small tap targets on small screens. Israel map is small enough though.
- **Decoration risk:** LOW-MEDIUM. The map is the gameplay; hard to make purely cosmetic.
- **Score: 25/30** — Decision Quality 9, Wonder 7, Stats Fit 9.

---

#### Candidate E: Correlation Detective (בלש המתאם) — 🔍🕵️
- **One-line concept:** Narrative mystery: examine scatterplots to identify spurious vs real correlations and accuse suspects.
- **Core mechanic:** Narrative branching + set-collection (Reigns × Sushi Go).
- **The player's decision:** Choose which variables to investigate next, decide whether observed correlations imply a real effect or confounding, accuse a suspect when confident.
- **Decision interval:** ~30–45s per evidence card (slower).
- **Stats concepts used:** correlation, confounding, regression, effect size, scatterplot reading.
- **Compounding mechanism:** Solved cases unlock new datasets and detective tools (partial correlation, control variables). Weak.
- **Failure mode:** Wrong accusation reveals confounder visually. Story can continue with reputation loss.
- **Mobile feasibility:** Excellent for narrative; charts can be pinch-zoomed.
- **Decoration risk:** HIGH. The narrative wrapper threatens to overshadow the math.
- **Score: 20/30** — Decision Quality 6, Wonder 8, Stats Fit 6.

---

#### Candidate F: Distribution Tetris (טטריס התפלגויות) — 🧩📐
- **One-line concept:** Spatial puzzle where you place distribution-shaped tiles onto a grid; tiles must satisfy mean/median/sd constraints per row.
- **Core mechanic:** Spatial puzzle (Patchwork × Azul).
- **The player's decision:** Choose which distribution tile to draft from a market and where to place it so row constraints (e.g., "this row's mean ≤ 50, sd ≥ 10") are met.
- **Decision interval:** ~15s per tile placement.
- **Stats concepts used:** descriptive statistics, shape of distributions, mean/median/mode interplay, std dev.
- **Compounding mechanism:** Locked-in tiles constrain future rows — engine-building via prior placements. Strong compounding.
- **Failure mode:** Unsatisfiable board = remove one tile at a cost. Recoverable.
- **Mobile feasibility:** Excellent. Drag-and-drop is native to touch.
- **Decoration risk:** LOW. Tiles must show their parameters; pure abstraction keeps it math-first.
- **Score: 23/30** — Decision Quality 8, Wonder 6, Stats Fit 9.

---

#### Candidate G: ANOVA Arena (זירת ANOVA) — ⚔️🏟️
- **One-line concept:** Roster-management combat: send "fighters" (samples from groups) into arena trials; compare group means to win.
- **Core mechanic:** Deck-building + asymmetric factions (Dominion × Cry Havoc).
- **The player's decision:** Recruit fighters into groups, decide which groups to enter into multi-way comparisons, choose sample size per group.
- **Decision interval:** ~20s.
- **Stats concepts used:** ANOVA, t-tests, effect size, variance within/between groups.
- **Compounding mechanism:** Winning groups gain stat boosts; losing groups can be retrained.
- **Failure mode:** Lost trial shows F-statistic breakdown of within vs between variance. Recoverable.
- **Mobile feasibility:** Good but combat metaphor may feel juvenile to BA students.
- **Decoration risk:** MEDIUM-HIGH. Easy to drift into combat-game where stats are flavor text.
- **Score: 19/30** — Decision Quality 7, Wonder 5, Stats Fit 7.

---

### 2. Top-3 Ranking

**#1 — Cafe Forecaster (28/30).** The strongest stats-decision marriage: every business decision IS a statistical decision, and the "run your own cool place" daydream gives natural wonder. Decoration risk is structurally low because cosmetic upgrades are math parameters (σ, μ, n). Covers the broadest intro-stats topic range and maps cleanly onto the existing Israeli BA curriculum.

**#2 — Creature Hypothesis Lab (26/30).** High wonder via the childlike-collection emotional pull; hypothesis testing is a notoriously hard topic that maps naturally onto creature confirmation. Ranks second because of medium decoration risk and the need for strict math gates; a strong Cycle 3 candidate once Cafe Forecaster has proved the engine pattern.

**#3 — Election Night (25/30).** Cleanest pure-stats fit for sampling and margin of error; the map metaphor makes the decision spatial and visible. Loses to Cafe Forecaster on emotional pull and session-arc warmth; political theming needs careful neutral re-skinning for the Israeli cohort.

---

### 3. #1 Detailed Spec — Cafe Forecaster

#### Title and Hebrew subtitle
**Cafe Forecaster** — *הקפה של הסטטיסטיקאי* ("The Statistician's Cafe")

#### Premise
You inherit a struggling neighborhood cafe in south Tel Aviv. Every morning you see yesterday's customer log — a histogram of demand — and must decide today's stock: pastries, beans, milk, staff hours. Stock too little and customers walk; stock too much and inventory spoils. The only way to survive is to think in distributions: estimate tomorrow's mean demand, choose a confidence interval wide enough to be safe but tight enough to be profitable, then commit. As profits accumulate, you buy equipment that literally narrows the variance of your demand, hire baristas who give you more samples per day, and eventually open a second location with its own unknown distribution to learn. The fantasy is "run your own cool place" — but the engine is statistical reasoning under uncertainty.

#### Core loop

1. **Morning briefing:** see histogram of last N days demand, with current sample mean and sample sd annotated.
2. **Forecast:** drag a confidence interval slider (50%/80%/95%/99%) over the demand distribution. UI shows the implied stock quantity.
3. **Commit stock:** lock the order. Cash deducted. Player sees expected cost and expected waste.
4. **Day plays out (5s animation):** true demand drawn from underlying distribution; customers served until stock runs out OR closing time.
5. **Day report:** actual demand vs. your CI overlaid; profit calculated; "calibration streak" updated (did the true value fall in your interval?).
6. **Decision — upgrade or expand:** spend earnings on (a) equipment that reduces σ, (b) staff that grows n, (c) marketing that shifts μ, or (d) a new location with a fresh unknown distribution.
7. **Next morning:** repeat with updated samples. Every ~5 days a "market event" perturbs the distribution (a festival, a rainstorm) — player must detect the shift.
8. **Session end:** at day 8 or 12, a season-close screen scores total profit, calibration score, and detection-of-shift score.

#### Stats concepts mapped to mechanics

| Concept | Game mechanic | What the player decides |
|---|---|---|
| Sample mean / median | Yesterday's demand summary card | Whether to trust mean (low-skew days) or median (festival outliers) |
| Standard deviation | Width of histogram + slider feedback | Interval width — wider σ → wider needed CI |
| Confidence interval | The CI slider itself | What confidence level matches today's risk |
| Normal distribution | Overlay curve on histogram | Whether to model as normal or empirical |
| Sampling / sample size | "Hire barista" upgrade (more samples/day) | When to invest in n vs μ vs σ upgrades |
| Z-scores | Stock-quantity readout | Reading off the z to back out the stock level |
| Hypothesis testing | "Market shift detected?" weekly check | When to reject the null that distribution is unchanged |
| Effect size | Marketing upgrade preview | Is the μ shift worth the cost? |
| t-test / two-sample | Compare two cafes' demands | Is location B genuinely better than A, or just lucky? |

#### Session structure
A session is one **season** (8–12 in-game days), approximately 10–15 real minutes. Arc: cautious early days with wide CIs and small profits → mid-season equipment upgrades narrow σ → late-season expansion adds a new distribution to learn → season-close report with three scores (profit, calibration, shift-detection). Sessions chain via persistent cafe upgrades; player chooses next season's neighborhood (= next distribution type) — branching agency.

#### Compounding engine
- **Session 1:** estimating one distribution with n=7 samples, wide CIs, frequent stock-outs.
- **Session 3:** same cafe has σ-reduction gear; player learns to anticipate weekend bumps and reads skew at a glance.
- **Session 5:** two cafes, three pieces of equipment, a "regression dashboard" upgrade unlocks letting you predict demand from temperature data. Player isn't memorizing — they've internalized the feel of distributions and now reasons about covariates.

The goal: by session 5, the player thinks in σ.

#### Failure design
Three failure modes, all informative and recoverable:

- **Stock-out day:** screen shows the true demand exceeded your CI. Overlay: "a 95% CI would have caught this — you chose 80%." No cash penalty beyond opportunity cost. Teaches: interval width tradeoff.
- **Waste day:** unused stock spoils. Overlay shows how much narrower a CI would have sufficed. Teaches: over-confidence cost.
- **Bankruptcy:** lose one location, keep your equipment and samples. Restart with a smaller cafe. Never a wall.

Calibration streak (out of 10): how often did the true demand fall in your stated CI? A well-calibrated player at 80% CI should hit ~8/10. This is the deepest pedagogical signal — direct feedback on probabilistic intuition.

#### Mobile UX sketch
- **Top third (non-interactive):** histogram of past demand with current μ̂, σ̂, and n labeled. Hebrew labels right-aligned. Bars in teal `#10b981`, mean marker in gold `#FFD700`.
- **Middle third:** the CI slider — a horizontal bar overlaid on the histogram showing the chosen interval. Drag handles at left and right edges, or a single "confidence %" slider that symmetrically widens. Z-score and implied stock quantity update live in a small readout.
- **Bottom third (thumb zone):** primary CTA button "אשר הזמנה" (gold) and secondary "הרץ סימולציה" (blue) which previews 10 hypothetical days. Upgrade shop accessed via a bottom tab.
- **On tap of histogram bar:** drill into that day's detail (was it a Tuesday? was it raining?).
- **RTL note:** slider direction reverses; readout numbers stay LTR per Hebrew typography convention; cash flows display with ₪ symbol.

#### First 10 decisions
1. **Day 1 stock:** see 5 days of past demand, mean ≈ 60, sd ≈ 12. Choose a CI width — most players pick 80%, stock ~75 units.
2. **Day 1 reaction:** demand was 68; comfortably in CI. Choose to spend ₪20 on a "data-board" upgrade (shows σ explicitly) or save.
3. **Day 2 stock:** with σ now visible, choose 80% vs 95%. Decide whether to trust the slight downtrend (regression-to-mean intuition).
4. **Day 2 surprise:** demand was 92 — an outlier. Stock-out screen shows the day was a holiday. Decision: tag holiday days separately or treat as one population?
5. **Day 3 stock:** smaller n if holiday tagged. Choose: wider CI to compensate, or trust the cleaner non-holiday subsample?
6. **Day 4 upgrade choice:** ₪50 for a "barista" (n+1/day) vs ₪50 for "espresso machine" (σ × 0.9). First real engine-building decision.
7. **Day 5 stock:** apply your upgrade choice. See the histogram tighten or widen accordingly.
8. **Day 5 market event:** a notice says "construction starts next week." Decision: pre-emptively shift μ estimate down, or wait for data?
9. **Day 6 hypothesis check:** game asks "do you think the distribution has shifted?" — two-sample t-test framing. Player rejects or fails to reject.
10. **Day 7 expansion offer:** open a second cafe in a new neighborhood with no prior data. Decision: accept the cold-start uncertainty for higher ceiling, or stay and master the known distribution?

#### Open design questions
1. **Calibration math vs intuition:** do we show p-values and z-scores explicitly from day 1, or unlock them progressively? Risk: too much notation early scares non-quant BA students; too little defeats the pedagogy.
2. **Quiz integration:** how does the existing SM-2 quiz engine plug in? Proposal — between days, an optional "study card" (the SM-2 item) grants a small bonus next day if answered correctly. Needs prototyping for balance.
3. **Distribution diversity:** how many distribution archetypes per session feel rich without overwhelming? Three? Five? Affects content authoring.
4. **Hebrew terminology consistency:** intervals, σ, μ — do we use Hebrew translations (סטיית תקן, ממוצע) consistently or anglicize statistical symbols? Needs user testing with target BA cohort.
5. **3D city tie-in:** the existing Three.js city — does each cafe location appear there as a building? Cosmetic-only is acceptable here because the gameplay decisions live in 2D screens; the city becomes the "save file you can see" rather than the gameplay surface.

#### Citations
- **Board game inspiration:** Seize the Bean (cafe operations + deck-building) and Quacks of Quedlinburg (push-your-luck on a known-but-noisy distribution).
- **Mobile game inspiration:** Mini Metro — minimal UI, every visual element is a gameplay variable, color-coded scarcity, no decorative chrome.
- **UI source:** Linear — dark theme with single accent color, dense numeric readouts that stay readable, keyboard-style command emphasis adapted as touch-zone hierarchy.

---

### 4. What was rejected and why

**Signal in the Static (C)** was rejected despite a strong wonder score because the dials risk becoming abstract knobs whose statistical names are decorative labels rather than load-bearing concepts. A player can succeed by feel alone — turning dials until the waveform looks clean — without ever forming a model of mean-vs-median robustness or z-thresholds. The decoration risk is structural: the prettier the waveform UI, the more it pulls toward dexterity-juicing and away from explicit statistical reasoning. Could be salvaged as a mini-game inside Cafe Forecaster (a "tuning the espresso grind" micro-puzzle), not as the spine.

**Election Night (D)** was rejected for the #1 slot — though it ranked #3 — because the worker-placement allocation pattern, while statistically pure, gives less emotional pull than the cafe daydream and risks political-fatigue with the Israeli student cohort even with neutral re-skinning. It also concentrates all stats concepts around sampling/CI and leaves hypothesis testing and effect size as bolt-ons. Strong contender for a Cycle 2 module once players have internalized the basics.

**Correlation Detective (E)** was rejected because the narrative wrapper is a known decoration-risk pattern: players succeed by reading story cues and ignoring the scatterplots. The compounding mechanism is also weak — solved cases don't change the next case's math, they just unlock content. Reigns works because every choice reshapes the same kingdom; here, cases are episodic. Could become an end-of-session "detective episode" rather than the core loop.

**Distribution Tetris (F)** was rejected because despite excellent decoration-resistance and compounding, the wonder score is low. It feels like a math worksheet with drag-and-drop. The "run your own cool place" emotional pull is absent. It is the strongest candidate for a focused practice mode — perhaps the SM-2 quiz engine's spatial replacement — but not as the gameplay spine that draws students back daily.

**ANOVA Arena (G)** was rejected on tone and decoration risk. The combat metaphor will read as juvenile to BA social-science students who are the target cohort, and within-vs-between variance — while it maps cleanly onto faction-vs-faction combat — risks becoming pure flavor text once the player learns which fighter types win. The asymmetric-faction pattern is powerful but better deployed in a later module focused on group comparisons specifically (e.g., a "research lab" theme), not as the first impression of WaffleStack gameplay.

---

*Generated by proactive-vision-builder cycle 01 on 2026-05-21.*
*NotebookLM: SKIP — MCP connector not available in this container.*
