# WaffleStack — Gameplay Loop Exploration
## Proactive Cycle 01 · Pass 14 · 2026-05-25 04:07

**Cycle type:** Exploration only (no code). Output: 5–8 candidate gameplay loops with scores, top-3 ranking, and #1 detailed spec.

**NotebookLM:** SKIPPED — MCP connector not available in this container. Design judgment drawn from VISION.md catalogue, git history (81 commits), and existing codebase analysis.

**VISION.md read:** yes (version 1, 2026-05-21)

**Prior passes:** 01–13 preserved in git history on this branch.

---

## Context: What Currently Exists

The codebase has a quiz/lesson shell with ~30 interactive graphs and a cosmetic R3F city builder. The gap the VISION flags:

> "buildings = topics — **Locked-in risk:** decoration not decision unless buildings consume/produce resources."

The current loop is: **read lesson → take quiz → earn XP → building cosmetically unlocks**. No compound state. No player decision between problems. XP and buildings are rewards, not gameplay.

Stats topics covered: mean, median, mode, variance, std dev, z-score, normal distribution, CLT, regression, correlation, IQR, confidence intervals, p-values, t-tests, ANOVA, chi-square, binomial, Poisson, permutations/combinations, effect size, Simpson's paradox, Bayes theorem.

---

## Scoring Rubric (7-criterion, 100-point scale)

| Criterion | Max pts | Rationale |
|---|---|---|
| Decision rhythm: meaningful choice every 15–30s | 20 | Matches Anki interval research; keeps flow |
| Statistical concept IS the mechanic (not adjacent) | 25 | The VISION's hardest constraint — highest weight |
| Engine-building compound effect | 15 | Early choices must shape late state |
| Failure is informative + recoverable | 10 | Never a wall; failure = teaching moment |
| Spatial/visual representation potential | 10 | City/map/distribution shape preferred |
| Player agency over what to learn next | 10 | Branching paths, not forced linear |
| Feasibility in React/TypeScript/Tailwind/R3F | 10 | Must ship in ≤2 more cycles |

---

## Candidate Scores

| ID | Name | Decision Rhythm | Concept IS Mechanic | Engine-Build | Failure Quality | Spatial | Agency | Feasibility | TOTAL |
|---|---|---|---|---|---|---|---|---|---|
| C1 | Mutable-Dice Engine | 18/20 | 22/25 | 15/15 | 8/10 | 8/10 | 8/10 | 7/10 | **86/100** |
| C2 | Pre-commit Pipeline | 10/20 | 20/25 | 8/15 | 9/10 | 6/10 | 5/10 | 8/10 | **66/100** |
| C3 | Run-a-Stats-Lab | 17/20 | 19/25 | 13/15 | 8/10 | 5/10 | 9/10 | 8/10 | **79/100** |
| C4 | Sampling Frontier | 19/20 | 25/25 | 11/15 | 10/10 | 10/10 | 6/10 | 8/10 | **89/100** |
| C5 | Distribution Architect | 16/20 | 23/25 | 7/15 | 9/10 | 10/10 | 5/10 | 8/10 | **78/100** |
| C6 | Data Trading Floor | 14/20 | 16/25 | 14/15 | 6/10 | 7/10 | 8/10 | 7/10 | **72/100** |
| C7 | Stuffed-Fables Encounters | 15/20 | 21/25 | 6/15 | 8/10 | 9/10 | 10/10 | 6/10 | **75/100** |
| C8 | Arctic-Scavengers School Choice | 11/20 | 17/25 | 12/15 | 7/10 | 4/10 | 8/10 | 5/10 | **64/100** |
| **H1** | **Sampling Frontier × Mutable-Dice (novel hybrid)** | **19/20** | **24/25** | **15/15** | **10/10** | **10/10** | **9/10** | **7/10** | **94/100** |

### Candidate Annotations

**C2 (Pre-commit Pipeline, 66)** — Low decision rhythm: players pre-commit once, then watch passively for 30–60s. Feels like watching a test run, not playing. Low agency (linear pipeline).

**C6 (Data Trading Floor, 72)** — Concept-mechanic gap: evaluating a trade requires computing stats, but the trading frame dominates. Stats is the tax, not the game.

**C8 (Arctic-Scavengers School Choice, 64)** — Brilliant framing but high scope risk: three complete game systems that must all be balanced. Right idea for a future V2 faction layer, wrong scope for cycles 1–3.

**H1 wins** because it fuses C4's perfect concept-mechanic unity (sampling variance IS the force you feel in your fingers) with C1's engine-building flywheel (mutable estimator kit). Each die upgrade changes not just power level but decision space.

---

## Top-3 Ranking

1. **H1 — Expedition: The Sample Map (94/100)** — Sampling a hidden Israeli population map is the irreducible stats action; layering an upgradeable estimator-kit on top gives compound engine-building without diluting the core. Reuses R3F city shell, 30 graphs, quiz cards, and mastery store — no throw-away work.

2. **C4 — Sampling Frontier (89/100)** — The purest concept-IS-mechanic candidate: stopping rules, confidence intervals, and the variance/precision tradeoff become physical decisions felt in real time. Lacks engine-building depth of H1.

3. **C1 — Mutable-Dice Engine (86/100)** — Strongest pure engine-builder; mutating dice faces literally IS mutating a distribution. Would shine as the Kit Forge sub-system inside H1 rather than as a standalone loop.

---

## #1 Detailed Spec: Expedition — The Sample Map (H1)

### Elevator Pitch

The player runs sampling expeditions across a hidden Israeli population map — cities, supermarkets, neighborhoods — to estimate unknown truths: mean salary in Haifa, std dev of falafel prices in Tel Aviv, whether two regions differ. Every 15–25 seconds they decide where to sample, whether to keep sampling or commit, and which estimator-die from their kit to apply. Mastered stats topics permanently upgrade the kit, so each run gets sharper and faster — the engine compounds.

---

### Core Decision Loop (step by step)

1. **Mission brief (5s):** A client question appears in Hebrew with Israeli context, e.g., _"מה הגובה הממוצע של תלמידי כיתה י' בארץ?"_ with a budget of N time-tokens and a target confidence band shown visually.

2. **Place a sampler (10s):** Tap a grid cell on the population map (hex overlay on R3F terrain). Each cell hides a true value drawn from the underlying distribution — you see only what you sample. The tap IS a statistical draw.

3. **Running estimate updates (live):** A side panel shows your sample mean, SE, and live 95% CI shrinking. This is the same visual primitive as the existing `CLTInteractive` and `ConfidenceIntervalInteractive` graphs — zero new chart code.

4. **Compound choice every ~20s:** Place another sampler (spend a token), switch to a more expensive but better die (stratified sampler costs 2 tokens, weighted costs 3), or commit your answer.

5. **Commit (the punch line):** Lock in a point estimate and a CI width. If the true population mean lands inside your CI AND your CI is tight enough → reward scaled by tokens unspent (push-your-luck). Outside CI → no reward, but the full distribution is revealed with your samples overlaid — informative failure.

6. **Loot phase:** Rewards convert to upgrade tokens in the Kit Forge. Build a new die, upgrade an existing face, or unlock a new estimator for next run.

---

### How the Statistical Concept IS the Mechanic

- **Sampling variance** is felt physically: 3 samples gives a wobbly estimate, 30 gives a stable one. The CI bar literally shrinks per √n in front of you.
- **Stopping rules:** every "should I sample once more?" click IS the optional-stopping problem. The game penalizes over-spending tokens (sampled past diminishing returns) just as much as committing too early.
- **Stratification:** clusters on the map have genuinely different true means. A stratified sampler die forces one sample per stratum, dramatically reducing variance — players discover *why* stratification works because uniform random sampling visibly fails on clustered maps.
- **Hypothesis testing:** later missions are two-region comparisons; the t-test die outputs a p-value bar the player must interpret to commit "same" or "different." Reading the p-value IS the decision.
- **Bayesian priors:** a prior die lets you bias the starting estimate using a client hint. Good priors mean fewer samples; bad priors mean overconfidence. The tradeoff is visceral.

---

### Engine-Building Progression

**Early game (topics: mean, variance, std dev):**
Only uniform-random sampler die + raw mean estimator. Every mission is brute-force. Player learns *why* sampling is expensive through resource scarcity.

**Mid game (z-score, CLT, CI, t-test):**
Unlock stratified sampler, weighted sampler, CI calculator die, two-sample t-test die. Missions add comparison and proportion questions. CLT topic literally unlocks the "see your sampling distribution" overlay.

**Late game (regression, Bayes, ANOVA, chi-square):**
Multi-variable maps (2D data points), regression die with live best-fit line, Bayes prior die, ANOVA die for >2 group comparisons. Missions become Simpson's-paradox traps where naive estimators fail.

---

### Failure Modes and Recovery

| Failure type | What player sees | Teaching moment | Recovery |
|---|---|---|---|
| Over-confident commit (truth outside CI) | True value shown, your CI vs the correct CI | "You committed too early — here's how wide you needed" | Refund 50% tokens; unlock drill from existing quiz bank |
| Token bankruptcy (sampled too much) | SE-vs-n curve flattening post-mortem | "Diminishing returns — sampling past √n efficiency is wasteful" | Forced commit, partial XP, SE curve as takeaway card |
| Wrong die choice (raw mean on bimodal data) | Histogram of samples post-commit reveals bimodal shape | "Your estimator assumed unimodal — here's the stratified fix" | Next mission pre-highlights the stratified die |

Never a wall: every failure refunds partial tokens into Kit Forge and unlocks a contextual drill — the same quiz card system that already exists.

---

### Visual Representation

- **Map:** R3F isometric Israeli terrain (reuses existing city-builder shell) with hex/square overlay. Cells are fog-of-war until sampled; sampled cells glow with their revealed value.
- **Side dock:** live running mean, live CI bar (shrinks/widens per n in real time), die rack showing current kit.
- **Commit screen:** full distribution reveal — samples as glowing dots, CI as a bar, truth as a vertical line. Same chart primitive as existing 30 graphs.
- **Kit Forge:** between-run screen. Die faces shown as draggable tiles (Dice Forge-inspired). Reuses existing `FeatureGate` / unlock system.

---

### Codebase Integration Points

| Existing system | How it gets reused |
|---|---|
| R3F city shell (`WaffleStackCityGodot`, `ProceduralTerrain`) | Becomes the map renderer; terrain IS the sampling space |
| 30 interactive graphs (lazy-loaded in StudyHub) | Become live overlay panels — CI, sampling dist, regression line |
| Quiz system + `recordQuizSession` | Becomes the post-failure contextual drill |
| `progressStore` mastery (avg >85% over 3 sessions) | Directly gates die unlocks in Kit Forge; no new state |
| Feature-gate XP system (`FEATURE_UNLOCKS`) | XP buys Kit Forge upgrade tokens; same store |
| StudyHub lesson cards | Become the "field manual" shown mid-mission via Hebrew tooltip |

---

### Hebrew-First Notes

All mission briefs use real Israeli contexts — שכר ממוצע בחיפה, מחירי דירות בתל אביב, ציוני בגרות, סקרי בחירות. Die names in Hebrew with English subtitle: קובייה מרובדת, אומדן בייסיאני, מבחן t. RTL-aware map labels. Numbers in Israeli locale format.

---

### Citations

**Board game citations:**
- **Dice Forge** (Libellud, BGG/228346) — mechanic borrowed: permanently mutable die faces as the engine-building substrate.
- **Cartographers** (Thunderworks Games) — mechanic borrowed: spatial reveal under fog-of-war as the exploration loop.
- **Arctic Scavengers** (BGG/146786) — mechanic borrowed: asymmetric starting kits (frequentist vs Bayesian die loadout at game start).

**Mobile game citations:**
- **Slay the Spire** — feedback pattern: between-run kit view makes accumulated upgrades legible.
- **Threes** (Asher Vollmer) — feedback pattern: tiny tactile decisions that compound without the player noticing.
- **Mini Metro** — feedback pattern: minimal HUD + spatial placement under soft time pressure; one-thumb play compatible.

**UI source citations:**
- **Linear.app** — pattern: dense live-updating side panels; status pills for CI state.
- **Apple HIG (iOS dark mode)** — pattern: 44pt tap targets on grid cells; haptic-equivalent scale-bounce on each sample.
- **Stripe Docs** — pattern: post-commit failure screen uses Stripe's error-detail + fix-suggestion layout.

---

### Decision Interval

Every **~20 seconds** (one sample placement or one die switch). Matches the 15–30s window from VISION.md's Anki-interval research.

### Statistical Concept Player USES (not memorizes)

**The sampling distribution and the precision/cost tradeoff.** Every click is a draw from the sampling distribution. Every commit is a confidence-interval bet.

---

### Risk Flags

| Risk | Severity | Mitigation |
|---|---|---|
| Kit Forge needs ~15 distinct dies for full topic coverage | Medium | Stage rollout: mean/var/CI tier ships in Cycle 2; t-test/regression in Cycle 3 |
| Early missions must not require stratification before it's unlocked | Medium | Mission generator gates die requirements to unlocked kit; same pattern as `FEATURE_UNLOCKS` |
| Hex-grid tap targets on phones need ≥44px | Low–Medium | Use square grid at launch; hex grid as cosmetic upgrade later |
| RNG frustration: correct play loses ~5% of the time (95% CI) | High | UI reframes: "הסטטיסטיקה עבדה, המזל לא" — show how many times this CI would have been right across 100 runs |
| R3F + heavy chart overlays on low-end Android | Medium | 2D Canvas fallback for the map; R3F on desktop/high-end only |

---

## Recommended Next Cycle

**Cycle 2:** Build Sampling Frontier core (stripped C4) behind `EXPEDITION_MODE` feature flag in `src/config/featureFlags.ts`. Deliverables: hidden population grid → place samplers → running CI → commit → reveal. One mission type. Reuse existing CLT/CI graph components as live overlay. At least one Vitest unit test for the sampling/CI logic.

**Cycle 3:** Add Kit Forge (mutable estimator dies). Wire mastery store → die unlocks. Add stratified sampler + two-region comparison mission type (t-test).

**Cycle 4:** Israeli thematic map, fog-of-war renderer, mission briefs in Hebrew. Polish + Vitest coverage.

---

*Generated by proactive-vision-builder Cycle 01 Pass 14 · Sonnet 4.6 (synthesis) + Opus 4.7 (design decision)*
