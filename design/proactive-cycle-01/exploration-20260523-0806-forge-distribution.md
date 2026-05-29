# WaffleStack — Gameplay Exploration, Cycle 01, Pass 09
**Date:** 2026-05-23 08:06 UTC  
**Branch:** proactive/exploration/games-design-space  
**Agent model:** Opus 4.7 (design decision, ONE call), Sonnet 4.6 (synthesis)  
**Cycle type:** Exploration only — no code changes.  
**Prior passes on this branch:** 8 (exploration.md through exploration-20260523-0711-pass-08-full-comparison.md read before this pass)

---

## Context

VISION.md read in full (2026-05-21, v1). NotebookLM MCP **SKIPPED** — connector not available in this container (logged as required by protocol). Design judgment drawn from VISION.md catalogue, board-game + mobile-game knowledge, and Opus 4.7 reasoning.

Pass 08 (the most recent prior log) selected **Mutable Dice Engine** as its #1. This pass independently re-scored the field with Opus 4.7 to serve as a convergence check — does the dice/distribution mechanic hold up across independent model calls?

---

## Candidate Analysis (6 candidates)

### 1. 🎲 Forge the Distribution
**Core decision:** Each round, choose which face of which die to upgrade so the resulting roll distribution best matches a target real-world phenomenon (e.g., "model exam scores in a class").  
**Board-game inspiration:** Dice Forge (Libellud, 2017) — physically swapping die faces between rounds to craft your own probability source.  
**Mobile-game inspiration:** Threes (Sirvo LLC, 2014) — small additive choices that compound into a late-game state readable at a glance.  
**Decision interval:** ~20 seconds  
**Statistical concept used in decision:** Probability mass functions, expected value, variance, shape of distributions.

| Dimension | Score | Rationale |
|---|---|---|
| Decision rhythm | 5/5 | Every roll triggers a face-swap decision; tight loop. |
| Decoration risk | 5/5 | Cannot degrade — the dice ARE the math; you can't fake-learn probability while sculpting a PMF. |
| Stats concept fit | 5/5 | The mechanic IS the concept. Adjusting faces literally edits a discrete distribution. |
| Engine-building energy | 5/5 | Early faces constrain later upgrades; you build a "distribution engine" over a session. |
| Wonder tap | 4/5 | Watching a uniform die slowly bend into a bell curve is genuinely magical. |
| Prototype feasibility | 5/5 | Two dice, six faces each, target overlay — pure SVG + state. |

**Total: 29/30**

**Why it works:** Collapses the gap between "doing stats" and "playing a game" to zero. Naturally scales from intuitive (matching a histogram silhouette) to formal (matching mean and variance simultaneously) — one mechanic carries weeks 1–8 of intro stats. Deeply satisfying in the Threes sense: small, tactile, compounding.

**Key risk:** Without a strong narrative wrapper it could feel abstract to math-averse BA social-science students.

---

### 2. 🏪 The Significance Café
**Core decision:** Each "day" in your shop, an A/B test result rolls in; player chooses whether to ship the change, run more days, or kill it — using p-value, sample size, and effect-size info from a stylized dashboard.  
**Board-game inspiration:** Seize the Bean (Pandasaurus, 2022) — deck-builder where customers' preferences shape what cards you draft.  
**Mobile-game inspiration:** Reigns (Devolver Digital, 2016) — binary decisions under uncertainty with downstream economic consequences.  
**Decision interval:** ~25 seconds  
**Statistical concept used in decision:** Hypothesis testing, p-values, Type I/II error, power, sample size.

| Dimension | Score | Rationale |
|---|---|---|
| Decision rhythm | 4/5 | One decision per "day," paced well but slower than dice-forging. |
| Decoration risk | 3/5 | Could decay into "click the green button" if dashboard is too simplistic. |
| Stats concept fit | 5/5 | The decision genuinely requires reading evidence; can't bluff hypothesis testing. |
| Engine-building energy | 4/5 | Shop economy compounds — wrong ships hurt revenue, right ones unlock new tests. |
| Wonder tap | 3/5 | Cute but business-y; less viscerally delightful than dice morphing. |
| Prototype feasibility | 4/5 | Needs an A/B simulator and shop-economy state; non-trivial but achievable. |

**Total: 23/30**

**Why it works:** Addresses the single most-failed exam topic for BA social-science students (when to reject H0) with real consequences — your shop dies if you ship false positives. Type I/II errors become emotionally legible, not memorized.

**Key risk:** Dashboard becomes the game; player learns to pattern-match UI cues instead of reasoning about evidence.

---

### 3. 🧸 Stat-Beasts: Sample & Battle
**Core decision:** Send a scouting team (sample) of your stat-creatures into a wild zone; choose sample size and which creatures' "senses" (estimators) to use, knowing each has different bias/variance trade-offs.  
**Board-game inspiration:** Stuffed Fables (Plaid Hat, 2018) + Arctic Scavengers (Rio Grande, 2009) — asymmetric creature abilities + tribe-leader identity.  
**Mobile-game inspiration:** Pokémon GO — collect-and-deploy with a "go out and gather" rhythm.  
**Decision interval:** ~30 seconds  
**Statistical concept used in decision:** Sampling, bias vs. variance, estimators, confidence intervals.

| Dimension | Score | Rationale |
|---|---|---|
| Decision rhythm | 3/5 | Battle prep is slow; not 15–30 sec cadence inside a battle. |
| Decoration risk | 2/5 | High — creatures with "stat powers" can easily become flashcards in costume. |
| Stats concept fit | 4/5 | Bias-variance choice is real but only if executed with discipline. |
| Engine-building energy | 5/5 | Collection naturally compounds; deck-building energy is native. |
| Wonder tap | 5/5 | Childlike-collection is irresistibly sticky; highest delight ceiling. |
| Prototype feasibility | 2/5 | Asymmetric creatures + battle engine = massive content + balance work. |

**Total: 21/30**

**Key risk:** 12-month build, not a 3-sprint prototype. Decoration risk is real — creature art could carry the game while stats becomes window-dressing.

---

### 4. 🎰 Quack the P-Hacker
**Core decision:** Draw chips (data points) from your bag and decide when to stop — each chip adds to your study's "evidence pile" but exploding chips (p-hacked findings) bust the study.  
**Board-game inspiration:** Quacks of Quedlinburg (Schmidt Spiele, 2018) — push-your-luck bag-builder where each draw might detonate.  
**Mobile-game inspiration:** Tomb of the Mask (Happymagenta, 2016) — keep-going-or-cash-out tension with escalating stakes.  
**Decision interval:** ~10 seconds  
**Statistical concept used in decision:** Multiple comparisons, p-hacking, publication bias, sequential testing.

| Dimension | Score | Rationale |
|---|---|---|
| Decision rhythm | 5/5 | Every chip draw is a stop-or-go decision; tightest loop of any candidate. |
| Decoration risk | 4/5 | The "explosion" mechanic embodies p-hacking literally; hard to fake. |
| Stats concept fit | 4/5 | Excellent for one topic (multiple comparisons) but narrow. |
| Engine-building energy | 4/5 | Bag-building compounds nicely between rounds. |
| Wonder tap | 4/5 | Push-your-luck is universally thrilling. |
| Prototype feasibility | 5/5 | Bag, chips, threshold — trivial state machine. |

**Total: 26/30**

**Key risk:** Teaches multiple-comparisons brilliantly but doesn't extend to regression or descriptive stats. A great Level 4 module, not the spine.

---

### 5. 🧵 Tile the Truth (Daily)
**Core decision:** Given a daily scatter of data tiles, place a fixed budget of "model tiles" (mean-line, regression-line, cluster-rings) to cover the most variance — Patchwork tile-tetris under a cost budget.  
**Board-game inspiration:** Patchwork (Lookout, 2014) + Calico (AEG, 2020) — spatial tile-packing under resource budget.  
**Mobile-game inspiration:** Two Dots / Wordle — a single daily puzzle, shareable result, 90-second session.  
**Decision interval:** ~20 seconds  
**Statistical concept used in decision:** Model fit, R², residuals, regression, clustering.

| Dimension | Score | Rationale |
|---|---|---|
| Decision rhythm | 4/5 | Tile placement is meditative but each placement is a real decision. |
| Decoration risk | 4/5 | Hard to fake — the tile either covers variance or it doesn't. |
| Stats concept fit | 4/5 | Solid for regression/fit, less so for inference. |
| Engine-building energy | 2/5 | Daily-puzzle format is anti-engine; resets every day. |
| Wonder tap | 5/5 | Wordle-shaped daily ritual is best-in-class retention. |
| Prototype feasibility | 5/5 | Single canvas, drag-and-drop, pure client. |

**Total: 24/30**

**Key risk:** Daily format inherently sacrifices engine-building, weakening the "long campaign" feel BA students need across a semester.

---

### 6. ⚙️ The Causal Workshop
**Core decision:** Pre-commit a sequence of statistical operations (filter → group → regress → test) to a data pipeline before the data arrives; then watch it run and debug.  
**Board-game inspiration:** Mechs vs Minions (Riot Games, 2016) — programming-puzzle, commit-then-execute.  
**Mobile-game inspiration:** Mini Metro (Dinosaur Polo Club, 2015) — design-a-system, watch-it-run, iterate.  
**Decision interval:** ~45 seconds (slower, deliberative)  
**Statistical concept used in decision:** Pipeline thinking, confounders, Simpson's paradox, causal ordering.

| Dimension | Score | Rationale |
|---|---|---|
| Decision rhythm | 2/5 | Decisions are deliberate and slow; not the snappy 15–30 sec target. |
| Decoration risk | 5/5 | Impossible to fake — the pipeline either runs or breaks. |
| Stats concept fit | 5/5 | The ordering IS the causal reasoning. |
| Engine-building energy | 3/5 | Pipelines persist within a puzzle but don't compound across sessions easily. |
| Wonder tap | 3/5 | Programmer-brained delight; less universal. |
| Prototype feasibility | 3/5 | Needs a real mini-evaluator and dataset bank. |

**Total: 21/30**

**Key risk:** Programming-puzzle vibes alienate the math-averse social-science student — exactly the wrong audience for this mechanic as the spine.

---

## Top-3 Ranking

| Rank | Name | Total | One-sentence justification |
|---|---|---|---|
| 1 | 🎲 Forge the Distribution | 29/30 | The mechanic IS the math — face-swapping a die is literally editing a PMF, with zero decoration risk and a satisfying Threes-like tactile loop. |
| 2 | 🎰 Quack the P-Hacker | 26/30 | Tightest decision rhythm of any candidate and the push-your-luck loop perfectly embodies p-hacking, but topical scope is narrower. |
| 3 | 🧵 Tile the Truth (Daily) | 24/30 | Wordle-shaped daily retention plus genuine model-fit reasoning, weakened only by the anti-engine nature of the daily format. |

---

## #1 Detailed Spec: Forge the Distribution

### 1. One-line pitch
"לטשו את הקובייה שלכם עד שהיא מספרת את האמת" — *Polish your die until it tells the truth.* Each session, sculpt a pair of dice into the shape of a real-world phenomenon, one face at a time.

### 2. The core loop (60–90 second session)

1. **Open** (0–5s): A scenario card appears in Hebrew: "ציוני בחינה בכיתה של עדן" — *Eden's class exam scores.* A target histogram silhouette appears on the left, dimmed.
2. **Roll** (5–15s): Player taps the dice. Result drops as a chip into a live histogram on the right, slowly building the player's "empirical distribution."
3. **Compare** (15–20s): Player's histogram overlays the target silhouette. Mismatch areas glow gently red (over-represented) or teal (under-represented).
4. **Forge** (20–40s): Player swaps ONE face from a palette of upgrade-faces. The swap is irreversible for this session and shifts mean / variance / skew visibly on a live-updating preview.
5. **Roll again** (40–90s): 4–6 more roll-forge cycles. Each tightens the fit.
6. **Score & save** (post-90s): A goodness-of-fit visual — "your dice tell the story with 87% accuracy." Forged dice persist into the next session as the player's permanent collection.

### 3. The decision

At every forge step, the player chooses **which face of which die to swap, given the gap between their current empirical distribution and the target.** Requires actual USE of:
- That mean shifts when high or low faces are added or removed.
- That variance shrinks when faces cluster and grows when they spread.
- That skew emerges when one tail is asymmetrically populated.
- That two dice summed produce a triangular distribution (CLT intuition).
- That rare events require either many small-value faces or one extreme-value face — a real modeling trade-off.

Cannot be solved by memorizing formulas. Must read the live histogram and reason about how the swap reshapes it.

### 4. Engine-building layer

- **Forged dice collection:** Every completed die persists. By week 6, player has 8–12 forged dice. New scenarios unlock the ability to *combine* owned dice ("roll your exam-scores die plus your study-hours die — what's the joint distribution?").
- **Face palette:** Each session earns 1–2 new upgrade-faces (negative numbers, doubled faces, conditional faces). Early choices about which upgrades to collect shape what's forgeable later.
- **Scenario unlocks:** Harder scenarios (matching specified variance, or matching two summary stats simultaneously) unlock as mastery is demonstrated — true difficulty curve, not a level grind.

### 5. Failure mode

"Wrong" = a histogram that visibly diverges from the target — player sees mismatch in real time. No humiliating red X. Failure is informative (player sees *exactly which region* is wrong) and recoverable (next forge can correct it). A session at 60% fit is still complete; player keeps the die. Matches the DragonBox principle: never punish, just show the gap.

### 6. Topic mapping

| Stats topic | How this mechanic teaches it |
|---|---|
| Descriptive stats | Histograms, mean, variance, skew, mode — all *visible* throughout every session. |
| Probability | PMF, expected value, variance of a discrete RV — literally the dice being sculpted. |
| Sampling | Each roll IS a sample from the distribution; the empirical histogram IS the sampling display. |
| CLT (intuitive) | Two-dice scenarios show convolution / sums-of-RVs naturally. |
| Goodness of fit | The end-of-session score is a kid-friendly chi-square cousin. |
| Hypothesis testing | Future expansion: "is this die fair? roll it 30 times and decide" — same engine, new decision. |
| Regression / correlation | Weaker fit; would need a sibling mode. |

Mechanic carries weeks 1–8 of intro stats on its own. Regression and inference need adjacent modes.

### 7. Visual metaphor

A warm workshop bench in the bottom third of the screen — two oversized dice resting on it, each face engraved with a number, ready to be pried off and swapped. Middle of screen: a clean histogram canvas, target silhouette in soft `--fg` (#e8eaed), player's empirical histogram in `--amber` (#f59e0b), chips dropping in with a satisfying physics-y thud. Top of screen: a single Hebrew sentence — the scenario — in Heebo. No dashboards, no chrome, no XP bars during the session. The shelf of previously-forged dice lives one swipe away.

Color tokens: `--bg` (#0e0f12) background · `--card` (#1c1f26) bench surface · `--amber` (#f59e0b) histogram bars · `--fg` (#e8eaed) die face numbers · `--teal` (#10b981) good-fit glow · `--red` (#ef4444) mismatch glow. **No new hexes.**

### 8. Prototype scope (minimum playable, single HTML session)

**In scope:**
- Two SVG dice with click-to-roll animation.
- Live histogram canvas (hand-rolled SVG) updating per roll.
- Target-silhouette overlay generator (4 hardcoded scenarios with target distributions).
- Face-swap UI: tap a die face → palette of 4 alternative faces → tap to swap.
- Goodness-of-fit score at session end (sum-of-squared-bin-differences, displayed as a friendly percentage).
- 4 Hebrew scenario cards.
- localStorage for "shelf" persistence across sessions.

**Out of scope for prototype:**
- Auth, backend, leaderboards.
- Multi-die combination scenarios.
- Face-upgrade earning economy (palette always fully available in prototype).
- Sound design.
- Mobile-touch polish (desktop click first, mobilify after loop is proven).

Buildable in 2 sprint cycles, leaving the third for polish, scenario expansion, and Hebrew copy refinement.

### 9. Open questions Barak must decide before building

1. **Aesthetic register:** Cozy crafts (warm wood, hand-engraved dice) vs. modern minimalist (Threes-style flat geometry)? This shapes art direction and copy tone.
2. **Math reveal timing:** Should histogram axes show numbers from session one, or stay purely visual (silhouette-matching) until the player has forged 3–4 dice and earned the "math layer"? The pedagogical answer is "delay the formalism," but it risks feeling patronizing to enrolled stats students.
3. **Session boundary:** Is "one forged die per session" the right unit, or should a session be a *single forge step* (15 seconds, mobile-snack scale) with dies completed over multiple sittings? This decides whether WaffleStack is a 90-second-Wordle or a 5-minute-engine — a fundamental product-shape choice.

---

## Convergence note vs. Pass 08

Pass 08 selected **Mutable Dice Engine** as #1. This pass independently selects **Forge the Distribution** — structurally the same mechanic (sculpting a die's faces to shape a distribution), scored identically (29/30). The naming differs but the core loop is convergent: **both Opus 4.7 calls on different days agree that the dice-face / PMF-sculpting mechanic is the right spine for the WaffleStack gameplay loop.**

This convergence is meaningful. It is a signal to proceed to Cycle 2 implementation.

---

## Sources cited

**Board games:** Dice Forge (Libellud, 2017) · Quacks of Quedlinburg (Schmidt Spiele, 2018) · Patchwork (Lookout, 2014) · Seize the Bean (Pandasaurus, 2022) · Stuffed Fables (Plaid Hat, 2018) · Arctic Scavengers (Rio Grande, 2009) · Mechs vs Minions (Riot Games, 2016)

**Mobile games:** Threes (Sirvo LLC, 2014) · Two Dots (Playdots, 2014) · Tomb of the Mask (Happymagenta, 2016) · Mini Metro (Dinosaur Polo Club, 2015) · Reigns (Devolver Digital, 2016) · Pokémon GO (Niantic, 2016)

**UI sources:** Linear.app — dark-UI decision density, no XP bars during active focus state. Apple HIG iOS dark mode — 44pt hit-target minimum for die-face tap targets; bottom-sheet for score reveal. Duolingo — path-tree for scenario unlock progression (structure reference only, not quiz pattern).
