# WaffleStack — Gameplay Loop Exploration
## Proactive Cycle 01 · Pass 16 · 2026-05-25 06:06

**Cycle type:** Exploration only (no code). 5-dimension rubric, max 50 pts (0–10 per axis).

**NotebookLM:** SKIPPED — MCP connector not available in this container. Design judgment drawn from VISION.md catalogue + Opus 4.7 design call.

**VISION.md read:** yes (version 1, 2026-05-21)

**Prior passes:** 01–15 preserved in git history on this branch. This is Pass 16.

**Continuity note:** Passes 01–15 converge on Distribution Forge / Mutable-Dice variants as the clear winner. This pass re-runs an independent fresh Opus evaluation using a distinct framing — 8 candidates, 5 axes × 10 pts each — to stress-test that convergence. Outcome: confirmed. Factory/Forge mechanic wins again (45/50). New contribution: **more detailed UX spec** for the "Distribution Forge Factory" variant, distinguishing it from prior "Kuvia" (Mutable-Dice roll loop) framing. The Forge Factory emphasizes the factory/pipeline metaphor over the die-rolling metaphor, and is closer to an implementation starting point.

---

## Scoring Rubric (this pass)

| Axis | Definition |
|---|---|
| **Decision rhythm** | Meaningful choice every 15–30s without external forcing? (0–10) |
| **Wonder tap** | Hits "run your own place," "childlike collection," or other VISION emotional pull? (0–10) |
| **Engine-building** | Early decisions compound into later power? (0–10) |
| **Topic fit** | Statistical concept IS inside the mechanic, not beside it? (0–10) |
| **Decoration risk** | 10 = zero risk of becoming cosmetic XP grind; 0 = pure decoration |

---

## Candidates

### A. Mutable-Dice Probability Engine *(Dice Forge × sampling)*
Player starts with a d6, answers stats questions to forge new faces. Each face = a statistical outcome. Roll = draw a sample. After 10 rolls, predict where 95% of values fall → CI. Unlock face types: uniform, normal, skewed, bimodal. Engine: better faces → harder questions unlock.

**Decision:** Which face to upgrade (add tail vs thicken center — tradeoff uses mean/variance directly).  
**Interval:** ~20s. **Concept:** Probability distributions, sampling, CLT, CIs.  
**Board-game ref:** Dice Forge (BGG/223242). **Mobile-game ref:** Threes.

### B. Pre-commit Pipeline Puzzle *(Mechs vs Minions × hypothesis testing)*
Commit a 4-step sequence before seeing data: [collect, clean, test type, α]. Data revealed; pipeline executes with live visualization. Mastered pipelines become reusable cards.

**Decision:** Which pipeline to commit given data shape clues.  
**Interval:** ~25s. **Concept:** Hypothesis testing, test selection, Type I/II errors, α.  
**Board-game ref:** Mechs vs Minions (BGG/209010). **Mobile-game ref:** Reigns.

### C. Sampling Expedition *(Patchwork × Mini Metro)*
Grid of hidden population cells. Sample cells (costs time-budget). After sampling, estimate a parameter. Commit estimate vs actual. Mastered sampling strategies cost less.

**Decision:** How many cells, and WHERE (clustered vs random vs stratified).  
**Interval:** 10–20s. **Concept:** Sampling methods, SE, CI, sampling bias.  
**Board-game ref:** Patchwork (BGG/163412). **Mobile-game ref:** Mini Metro.

### D. Run-a-Stats-Lab Engine-Builder *(Seize the Bean × Viticulture)*
Run a statistics consulting lab. NPC clients arrive with datasets. Deploy instruments (mean-machine, SD-meter, t-test rig). Trade result cards with NPC labs to fill gaps.

**Decision:** Which instrument on this client's data shape.  
**Interval:** ~20s. **Concept:** Choosing the right test for data type.  
**Board-game ref:** Seize the Bean (BGG/211364). **Mobile-game ref:** Good Pizza Great Pizza.

### E. Push-Your-Luck Confidence Interval *(Quacks × Reigns)*
Flip observation cards from a population deck. See running estimate + CI width. Decide: flip another (narrower CI) or commit. Oversample → overfit shown visually.

**Decision:** Stop vs continue sampling under time pressure.  
**Interval:** 5–10s. **Concept:** CIs, sample size tradeoff, stopping rules.  
**Board-game ref:** Quacks of Quedlinburg. **Mobile-game ref:** Reigns.

### F. Asymmetric Stats-School Duel *(Arctic Scavengers × Cry Havoc)*
Pick a school: Frequentist, Bayesian, Nonparametric. Each has unique mechanics. You and an NPC solve the same dataset problem using your school's tools.

**Decision:** Which school move given data shape.  
**Interval:** ~20–30s. **Concept:** Comparing approaches, when each is appropriate.  
**Board-game ref:** Arctic Scavengers (BGG/56570). **Mobile-game ref:** Clash Royale.

### G. Distribution Forge Factory *(Dice Forge × CLT live visualization)*
Build a mini-factory of statistical machines: Sampler → Transformer → Aggregator. Each machine is a statistical operation. Watch raw data flow through — histogram updates live. Save locked pipelines as "blueprint" macro-machines for harder clients.

**Decision:** Which machine to place/swap to reshape output distribution toward client's target shape.  
**Interval:** ~20–25s. **Concept:** CLT, transformations, standardization, robust stats, bootstrap CIs.  
**Board-game ref:** Dice Forge + Splendor. **Mobile-game ref:** Mini Motorways / Good Pizza Great Pizza.

### H. Data Market *(Catan × regression)*
Collect data variable tiles from different city zones. Short quiz gates each variable before it enters a regression model. Trade redundant variables with NPCs. Build regression to predict a city outcome.

**Decision:** Which variables to include (multicollinearity → bad prediction shown live).  
**Interval:** ~30–40s. **Concept:** Regression, variable selection, correlation, multicollinearity.  
**Board-game ref:** Catan (trade window). **Mobile-game ref:** Two Dots.

---

## Scores (Opus 4.7 — fresh call, independent of passes 01–15)

| Candidate | Decision rhythm | Wonder tap | Engine-building | Topic fit | Decoration risk | **TOTAL** |
|---|---|---|---|---|---|---|
| A. Mutable-Dice Probability Engine | 9 | 8 | 9 | 9 | 9 | **44** |
| B. Pre-commit Pipeline Puzzle | 6 | 5 | 7 | 9 | 8 | **35** |
| C. Sampling Expedition | 9 | 7 | 7 | 10 | 9 | **42** |
| D. Run-a-Stats-Lab | 6 | 9 | 8 | 5 | 5 | **33** |
| E. Push-Your-Luck CI | 10 | 6 | 5 | 9 | 8 | **38** |
| F. Stats-School Duel | 5 | 7 | 7 | 6 | 7 | **32** |
| **G. Distribution Forge Factory** | **8** | **9** | **9** | **10** | **9** | **45 ✓** |
| H. Data Market | 4 | 7 | 8 | 8 | 6 | **33** |

---

## Top-3 Ranking

| Rank | Candidate | Score | Note |
|---|---|---|---|
| **1** | **G. Distribution Forge Factory** | **45/50** | Tightest fusion of mechanic-as-concept; the factory IS the statistical operation. Visual thinkers see distributions reshape in real time, which directly addresses stats anxiety. |
| 2 | A. Mutable-Dice Probability Engine | 44/50 | Strongest "childlike collection" pull; highest tactile satisfaction. Slightly less topic breadth than G. |
| 3 | C. Sampling Expedition | 42/50 | Purest topic fit for sampling/CI, clean rhythm. Narrower concept range, weaker collection/wonder pull. |

**Honorable mention:** E (Push-Your-Luck CI) has the best decision rhythm (10/10) and would make an excellent mini-mode for the Bootstrap-CI machine inside G.

**Cross-pass convergence:** G (Distribution Forge Factory) is consistent with Kuvia/Forge winner declared in passes 11–15. Pass-14's Expedition hybrid (94/100 on 7-criterion rubric) maps to a combination of G + A. The Forge/Factory mechanic wins all independent evaluations.

---

## #1 Detailed Spec: Distribution Forge Factory

### Core loop (3 steps)

1. **Observe target** — A "client distribution" shape appears at the factory output (e.g., "normalize this skewed income data so we can run a t-test"). Raw data flows in on the left as animated particles; target shape ghosted on the right as a faint histogram outline. Player has 3–5 seconds to read the shape difference before the decision window opens.

2. **Place / swap one machine** — Drag a machine from the owned shelf onto the conveyor belt. Histogram at output updates live (< 1 second) as data re-flows through the new pipeline. **This is the meaningful decision, every ~20–25s.** The wrong machine produces a visibly wrong output shape — not a modal error, a histogram that misses the target ghost.

3. **Lock & score** — When output histogram is within tolerance of target, player taps "lock." Earns a **blueprint card** (the locked pipeline becomes a reusable single drag-able macro-machine) + coins to buy new machines from the machine shop. Next client arrives whose target shape requires the previous blueprint as a sub-component — explicit, visible compounding.

### Statistical concepts per decision point

| Decision | Concept learned by making it |
|---|---|
| Choose Sampler size n | CLT — watch sampling distribution of the mean tighten as n grows live |
| Choose Log vs Sqrt vs Box-Cox | Skew transformations — skewness statistic drops live on screen |
| Choose Standardize (z) vs Min-max | Scale preservation vs distribution preservation |
| Choose Aggregate-n | Core CLT moment — bimodal or uniform input becomes bell-shaped; n slider is the proof |
| Choose Trim vs Winsorize | Robust statistics — effect on mean vs median shown by two parallel dials |
| Chain order matters | Non-commutativity — "standardize-then-log" vs "log-then-standardize" gives different output; discovered by trying |
| Bootstrap-CI machine | Confidence intervals as a factory output with visible width + coverage |

### 3-session progression arc

**Session 1 (~12 min): "Make it normal."**  
Player owns 3 machines: Sampler, Aggregate-n, Standardize. Three clients with increasingly non-normal data arrive. Key discovery: drag the n slider on Aggregate from 2 to 30 — any input becomes a bell curve. Session ends with first blueprint saved: "CLT-Normalizer."  
Concepts: sampling, mean, CLT, z-scores.

**Session 2 (~15 min): "Tame the tail."**  
Skewed income data, reaction-time data, count data. Unlocks Log, Sqrt, Trim. Player must choose the transformation (no auto-suggest). Failure cases teach why Log fails on zeros (half the sample disappears, shown visually), and why Trim biases the mean. Blueprint saved: "Skew-Buster."  
Concepts: transformations, robust statistics, when normality assumptions matter.

**Session 3 (~18 min): "Compose factories."**  
Clients require blueprint-chaining: a survey dataset needs Skew-Buster → CLT-Normalizer → new Bootstrap-CI machine. Player builds a factory of factories. Output is now a CI with width the player optimizes.  
Concepts: composition, bootstrap, CIs, inference as factory output.

### What failure looks like + recovery

Never a red X or lockout. The output histogram simply **misses** the target ghost — the factory runs but produces a wrong shape. A soft pulse highlights the offending machine. One-line Hebrew diagnostic in plain language:

> "הלוג לא אוהב אפסים — חצי מהדגימה נעלמה"  
> ("Log doesn't like zeros — half your sample disappeared")

The run is not over; player swaps one machine and re-runs. Three consecutive misses on the same client unlocks a **hint shard** — highlights which category of machine (transform vs aggregate vs scale) is needed, but not which specific one. Failure is always one swap away from success. The mis-shape IS the lesson.

### Engine-building definition

Three compounding axes:
1. **Owned machines (collection):** Start with 3; grow to ~25. Each is a tangible draggable card with its own art and a Hebrew name (e.g., "מנוע הנורמליזציה", "מכונת ה-Log"). This is the "childlike collection" pull.
2. **Saved blueprints (composition):** Locked pipelines become single draggable macro-machines. A Session 3 factory visibly contains Session 1 blueprints inside it — literal, visual compounding.
3. **Machine upgrades (depth):** Each machine has 3 tiers (Sampler → Smart-Sampler → Stratified-Sampler). Upgrading costs coins earned from solved clients. Higher tiers unlock harder client tiers, requiring chained blueprints — closed loop.

### The Hebrew UX moment ("wait, that's actually cool")

Session 1, third client. Input: wildly bimodal salary distribution from two cities. Goal: the bell curve. Player places Aggregate-n at n=2 — output still looks weird. Drag n slider to 5 — bumps soften. n=15 — clean bell. n=30 — textbook normal.

A Hebrew banner slides in, low-key, no confetti:

> **"זה משפט הגבול המרכזי. גילית אותו עכשיו."**  
> ("That's the Central Limit Theorem. You just discovered it.")

The slider stays on screen. The student drags it back to 2 and forward to 30 a few more times because they want to see it again. That re-drag is the moment the game has earned them.

### Vision alignment check

| Rule | Compliant? | Citation |
|---|---|---|
| What we are: stats-first via game | ✓ | Every machine placement = a hypothesis about a statistical operation |
| Gameplay ≠ Gamification | ✓ | XP not the decision — machine placement + histogram outcome is |
| Design rule: Hebrew-first | ✓ | Hebrew machine names, Hebrew diagnostic copy, Hebrew discovery banner |
| Design rule: dark UI | ✓ | Factory aesthetic fits `--bg #0e0f12` dark industrial look |
| **Color palette: only locked tokens** | ✓ | Histograms use `--teal` / `--gold` / `--red`; machines use `--card` / `--border` |
| **UI source cited** | ✓ | Mini Motorways (live spatial simulation) + Linear (drag interaction density) |
| **UI anti-pattern avoided** | ✓ | No modal-on-modal; diagnostic is inline; no hamburger; no hover-only affordances |
| Tech invariant: Tailwind only | ✓ | All styling via Tailwind tokens |
| Tech invariant: Zustand only | ✓ | Factory state in new `forgeStore.ts` |
| Tone rule: encouragement | ✓ | Failure = informative diagnostic, never punishment |
| Mobile-first | ✓ | Drag-and-drop designed for one-handed touch; machine shelf bottom-anchored |
| Out of scope: stays in scope | ✓ | Intro stats only; no multiplayer; no teacher dashboard |

**NotebookLM consulted:** SKIP — MCP connector not available in this container.  
**Board-game inspiration:** Dice Forge (BGG/223242) + Splendor — permanent personal-engine modification via small upgrade choices; blueprint-as-resource compounding.  
**Mobile-game inspiration:** Mini Motorways — live spatial simulation reacting to a single placement with a client-target driving each round.  
**Decision interval:** every ~20–25 seconds.  
**Statistical concept used in decision:** Distribution shape transformation — every machine placement is a hypothesis about how a statistical operation reshapes data, validated visually within 1 second.

---

## Open questions for cycle 02

1. **Session entry point:** Does the Forge Factory replace the Study Hub entirely, or unlock from it? VISION says no forced linear path — lean toward accessible from Study Hub via the `city-editor` feature gate (Tier 8, ≥1500 XP or 12 topics) OR as a standalone mode behind `FORGE_FACTORY` feature flag.
2. **Integration with XP system:** Earning a blueprint card = mastering a stats concept. Map blueprint types → existing `featureUnlocks.ts` topic IDs. "CLT-Normalizer" blueprint = completing the `normal` + `sampling` topics.
3. **E as mini-mode:** The Bootstrap-CI machine in Session 3 should internally use the Push-Your-Luck CI (candidate E) mechanic for choosing CI width — a nested mini-game.
4. **Hebrew machine names:** Need native-speaker stats review. Working names: מנוע הנורמליזציה (Normalize Engine), מכונת ה-Log (Log Machine), מצבר המדגם (Sample Aggregator), מנקה-קצוות (Trim Machine), מכיל קיצוניות (Winsorize Machine).
5. **Persistence:** Blueprint collection (Zustand `persist`) must gracefully handle 50+ blueprint cards. Pagination or category tabs needed.
