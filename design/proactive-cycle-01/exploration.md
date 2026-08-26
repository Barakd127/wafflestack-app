# WaffleStack Proactive Cycle 01 — Gameplay Loop Exploration

**Date:** 2026-05-31  
**Branch:** `proactive/exploration/20260531-0606`  
**Model:** Opus 4.8 (design decision), Sonnet 4.6 (synthesis)  
**Vision source:** VISION.md (root), read fully at cycle start  
**NotebookLM:** SKIPPED — MCP connector not available in this container  

---

## Purpose

VISION.md flags the current 3D Knowledge City as a "decoration not decision" risk (line 102). This cycle maps the full gameplay design space, scores 7 candidates against the VISION criteria, ranks the top 3, and produces a build-ready spec for #1.

---

## Scoring Rubric

| Axis | What it measures | Scale |
|---|---|---|
| Decision rhythm | Meaningful choice every 15–30s? | 1–5 |
| Wonder tap | Delight / curiosity / "just one more" pull | 1–5 |
| Engine-building | Do early decisions compound into later advantage? | 1–5 |
| Topic fit | How directly does the stat concept drive the decision? | 1–5 |
| Decoration risk | How hard to turn into cosmetic reward? (5=low risk) | 1–5 |
| Build feasibility | Prototypable in ≤3 more cycles in React/TypeScript? | 1–5 |

---

## Section 1 — Candidates

### 1. The Inference Lab — Run a research lab; spend a sampling budget to publish findings before rivals

- **Mechanic borrowed from:** Engine-building (Wingspan — BGG/266192) + Real-time triage (Coffee Rush — BGG/377061) + Reigns (mobile swipe-to-decide)
- **Decision:** Choose sample size, which test to run, and whether to publish or collect more data — under a fixed budget.
- **Statistical concept used:** Sampling, confidence intervals, p-values, statistical power, Type I/II error
- **Decision interval:** ~20 seconds
- **Scores:** Decision=5, Wonder=4, Engine=5, Topic=5, Decoration-risk=5, Feasibility=4 → **Total=28/30**
- **Why it could be #1:** Every core inferential concept becomes a resource the player literally spends and trades off, so the math IS the move. The "run your own lab" daydream (VISION.md line 86) gives durable session-over-session motivation through equipment upgrades that change the decision space.
- **Risk:** Could drift into a spreadsheet if the publish/consequence feedback is not visceral.

---

### 2. Estimator's Gambit — Push your luck collecting sample points before your estimate "breaks"

- **Mechanic borrowed from:** Push-your-luck (Quacks of Quedlinburg — BGG/244522) + Tomb of the Mask (mobile one-more-run)
- **Decision:** Draw another sample point (tightening your CI, risking a bust) or bank your current estimate.
- **Statistical concept used:** Law of large numbers, standard error, confidence interval width, bias-variance tradeoff
- **Decision interval:** ~10 seconds
- **Scores:** Decision=5, Wonder=4, Engine=3, Topic=4, Decoration-risk=4, Feasibility=5 → **Total=25/30**
- **Why it could be #1:** The push-your-luck tension makes standard error *felt in the gut* — each draw narrows the interval but costs budget. Extremely "just one more" addictive and trivial to prototype.
- **Risk:** The concept maps to a single idea (SE shrinks with n), so topic coverage is narrow for a full semester.

---

### 3. Distribution Garden — Plant data-creatures whose growth is governed by the distribution you assign them

- **Mechanic borrowed from:** Set-collection (Wingspan — BGG/266192) + Threes (mobile merge-to-grow)
- **Decision:** Assign each new "specimen" to a distribution bed (normal, skewed, uniform, binomial) that maximizes its yield.
- **Statistical concept used:** Distribution shapes, mean/median/mode, skew, variance
- **Decision interval:** ~15 seconds
- **Scores:** Decision=4, Wonder=5, Engine=4, Topic=4, Decoration-risk=3, Feasibility=4 → **Total=24/30**
- **Why it could be #1:** Tops the wonder axis — living creatures that visibly grow tap the "childlike-wonder collection" pull (VISION.md line 87) hard. Highly visual; distributions map naturally to spatial beds.
- **Risk:** High decoration risk — easy to make "cute creature" the reward instead of the distribution being the lever. That is exactly the trap VISION.md warns against.

---

### 4. P-Hack Detective — Spot the statistical lie in a stream of incoming research claims

- **Mechanic borrowed from:** Reigns (BGG swipe accept/reject) + Two Dots (mobile escalating streak pressure)
- **Decision:** Accept or reject each incoming claim by judging whether its stats are sound.
- **Statistical concept used:** p-hacking, correlation vs causation, sampling bias, misleading graphs
- **Decision interval:** ~12 seconds
- **Scores:** Decision=4, Wonder=3, Engine=2, Topic=5, Decoration-risk=4, Feasibility=5 → **Total=23/30**
- **Why it could be #1:** Dead simple to build, fastest decision rhythm, and trains the single most exam-relevant skill (critical reading of statistical claims). Pure judgment, no fiddly UI.
- **Risk:** Binary swipe has weak engine-building — choices do not compound, so it may feel like a quiz in disguise.

---

### 5. Variable City Planner — Zone a city where each district's success depends on the relationships between variables

- **Mechanic borrowed from:** Spatial-puzzle (Calico / Azul — BGG/329525) + Mini Metro (mobile line-drawing under load)
- **Decision:** Place districts and draw connections that exploit correlations between district variables.
- **Statistical concept used:** Correlation, scatterplots, regression lines, confounders
- **Decision interval:** ~20 seconds
- **Scores:** Decision=4, Wonder=4, Engine=4, Topic=4, Decoration-risk=3, Feasibility=3 → **Total=22/30**
- **Why it could be #1:** Reuses the existing R3F city tech, turning the dead cosmetic city into a real decision space. Spatial correlation puzzles are genuinely novel.
- **Risk:** Reusing the 3D city tempts the team back into decoration; correlation-as-adjacency is a fuzzy metaphor that may mis-teach.

---

### 6. Hypothesis Duel — Asymmetric card battles where each statistical school has different powers

- **Mechanic borrowed from:** Asymmetric factions (Cry Havoc — BGG/192457, Root) + Slay the Spire (deck-driven boss runs)
- **Decision:** Play the test/evidence card that best counters the opponent's claim given the data on the table.
- **Statistical concept used:** Hypothesis testing, null/alternative, evidence strength, effect size
- **Decision interval:** ~25 seconds
- **Scores:** Decision=4, Wonder=4, Engine=4, Topic=4, Decoration-risk=4, Feasibility=2 → **Total=22/30**
- **Why it could be #1:** Asymmetric factions create huge replay depth and the duel framing makes null-vs-alternative dramatic. Arctic Scavengers tribe-leader vibe (VISION.md line 61).
- **Risk:** Lowest feasibility — balancing asymmetric card combat is a multi-cycle content treadmill.

---

### 7. Dice Forge Stats Crafter — Craft the distribution you roll from; mutable dice faces are your statistical toolkit

- **Mechanic borrowed from:** Dice Forge (BGG/242167) engine-building + Patchwork (BGG/163412) spatial-budget + Mini Metro (mobile minimal HUD)
- **Decision:** Upgrade which die face to replace: buying a "wider normal" face that risks a bust, or a "binomial" face that pays only on correct answers.
- **Statistical concept used:** Probability distributions, expected value, variance, distribution selection
- **Decision interval:** ~18 seconds
- **Scores:** Decision=4, Wonder=5, Engine=5, Topic=4, Decoration-risk=4, Feasibility=3 → **Total=25/30**
- **Why it could be #1:** The VISION.md explicitly calls out "player CRAFTS the distribution they roll from" as a direct fit for probability (line 98). Very high wonder + engine.
- **Risk:** Dice-face UX is harder to make mobile-friendly than a slider or card tap; also covers probability topics first, not sampling/inference which the curriculum weights more.

---

## Section 2 — Top-3 Ranking

**Rank 1: The Inference Lab (28/30)** — Rank 2: Estimator's Gambit (25/30) — Rank 3: Dice Forge Stats Crafter (25/30)

The Lab wins because it is the only candidate that scores 5 on both Topic-fit and Decoration-risk while also maxing Engine-building: it turns the entire intro-inference syllabus into spendable resources, so cosmetic drift is structurally hard. The full arc from sampling to power to effect size mirrors the Israeli BA stats curriculum.

Estimator's Gambit ranks second on raw addictiveness and feasibility but covers too narrow a concept slice to anchor a full semester. Critically, it is the ideal **mini-mode embedded inside the Lab** — the "buy more data" action in the Lab is Estimator's Gambit. Build the Lab and absorb the Gambit as its sampling sub-loop.

Dice Forge Stats Crafter ties Gambit on score but ranks third because its core mechanic (probability distributions) maps to the earlier part of the syllabus, while the Lab covers the more feared final third (inference) first. The Lab is higher-value to the target learner on exam day.

---

## Section 3 — #1 Detailed Spec: The Inference Lab

### Premise

You run a small social-science research lab. Grant money is finite. Rival labs are racing to publish the same questions. Every cycle you decide what to study, how much data to buy, which test to run, and whether your evidence is strong enough to publish. Publishing first with *valid* results earns reputation and bigger grants (the engine). Publishing junk gets you retracted — informative and recoverable, never a wall.

---

### Core Loop (one "study", ~90 seconds, several decisions)

**Step 1 — Pick a research question.**  
Two or three question cards are offered (e.g., "Does study method A raise exam scores vs B?"). Each shows: a topic area, a deadline (turns before a rival publishes), and a base difficulty. The player chooses which question to pursue. *This is the agency-over-what-to-learn axis (VISION.md line 77).*

**Step 2 — Buy a sample.**  
A stepper control sets `n`. The UI shows live: CI half-width shrinks proportional to `1/√n`; cost (gold coins) ticks up linearly; a colour band shifts from red → amber → teal as n crosses the power threshold. *This is the embedded Estimator's Gambit sub-loop: more n = tighter CI, but drains budget.*

**Step 3 — Choose a test.**  
The player's unlocked toolkit shows as tappable tiles: t-test, chi-square, Pearson correlation, proportion test. Each tile shows a one-line description (in Hebrew). Locked tiles are greyed (`--border` colour). Choosing the wrong test for the data type yields an invalid result even with good data. *This is the single most-tested exam skill: match test to data type.*

**Step 4 — Read the output and decide: Publish, Collect More, or Abandon.**  
The screen shows: p-value pill (red if p > α, teal if p ≤ α), CI error bar, effect size estimate, and a plain-Hebrew verdict sentence. Publishing a true effect = reputation + budget. A false positive (lucky small-n) = retraction, with an explanation. Abandoning a real effect = rival scoops. *Trade-off: Type I error vs statistical power under time pressure.*

**Step 5 — Resolve and upgrade.**  
Reputation points buy lab equipment: faster sampling (reduces cost-per-n), a new test type, a replication action, a power calculator that previews the n needed to detect the question's hidden effect size at 80% power. Equipment permanently changes the decision space — this is the engine-building layer.

---

### Statistical Scaffolding

| Statistical concept | Game element |
|---|---|
| Sampling / SE / LLN | Sample-size slider; CI half-width visibly shrinks ∝ 1/√n |
| Confidence intervals | Error bar on every estimate; overlapping bars = inconclusive |
| p-value and significance | Publish gate; p shown numerically and as a colour pill |
| α policy | Tunable lab setting (unlock in session 5+); loose α publishes faster, risks retraction |
| Type I error | False-positive retraction with explanation |
| Type II error / power | Rival scoops the effect you abandoned; power calculator upgrade previews needed n |
| Choosing the right test | Test-selection step, gated by data type |
| Effect size vs significance | Late-game questions: small-but-real effects, and large-but-noisy ones |

---

### Progression Arc (10 sessions)

| Sessions | New element | Concept introduced |
|---|---|---|
| 1–2 | One test (t-test), fixed α, tiny budget | Sampling, SE, CI, p-value |
| 3–4 | Unlock chi-square + correlation; data types appear | Test selection |
| 5–6 | Rival labs add deadline pressure | Push-your-luck on collect-more; Type I/II tension |
| 7–8 | Tunable α; replication action; false-positive streaks punish reflexive publishing | α policy, power |
| 9–10 | Multi-study "grant portfolio" — manage budget across 2–3 concurrent studies (Viticulture worker-placement layer) | Effect size vs significance; allocation tradeoff |

---

### UI Sketch — Main "Study Bench" Screen

Dark `--bg` (#0e0f12) background. Single `--bg-2` (#16181d) card centred, RTL layout throughout.

**Top bar (right to left):** Lab name, budget display (gold coin icon + `--gold`), reputation meter (teal bar), turn/deadline clock (amber, turns red near zero). This follows Linear.app's status-pill density principle for a dark UI.

**Left third (in RTL: rightmost visual column):** The active research question card — Hebrew title, redacted effect-size badge, rival progress bar filling amber to red.

**Center hero:** A live estimate plot — a horizontal dot with a CI error bar drawn in `--blue` that tightens as the player drags the sample-size stepper directly beneath it. Cost shows in `--gold` to the right of the stepper. This is the only animated element and is the moment of core learning.

**Right third (in RTL: leftmost visual column):** The test toolkit as tappable tiles (44pt min touch target per Apple HIG). Locked tiles greyed with `--border` border. Tapping one runs the test and renders the result below.

**Bottom action zone (thumb-reach):** Three large buttons — Publish (`--teal`), Collect More (`--blue`), Abandon (`--mute`). Follows VISION.md "bottom-sheet over modal" and "one-screen primary action always above the fold" rules.

**Failure state:** An inline `--red` panel below the CI plot explains *why* (e.g., "ה-n שלך קטן מדי — ה-CI שלך כלל אפס; זה סיכון לשגיאה מסוג I"). Encouragement variant follows VISION.md tone rules.

---

### Minimum Playable Prototype

One hardcoded question with a known true effect. A sample-size stepper that recomputes a simulated sample (seeded RNG), updates a live CI error bar (SVG), and shows cost. One t-test button that outputs p-value + CI. Three action buttons where Publish checks the hidden true effect and shows correct/retracted with a Hebrew one-sentence explanation.

No upgrades, no rivals, no 3D. Pure React + Zustand + a tiny stats utility (mean, SE, t-statistic, t-distribution CDF) + one SVG error-bar plot.

**This alone proves the central thesis:** does narrowing a CI by spending budget feel like a real decision? If yes, the engine layer is justified.

---

### Open Questions (could kill it)

1. **Does the math feel like a game or like homework?** If players experience the buy-test-publish loop as "doing a stats problem," the framing failed. The rival/deadline tension and the visceral CI animation must carry it. Needs a live playtest in Cycle 3 or 4.

2. **Is the false-positive punishment legible?** Retraction must teach (clear "your n was too small" feedback), not feel like an arbitrary dice-roll, or players learn helplessness instead of statistical power. Needs copy review in Cycle 2.

3. **RTL Hebrew + a left-anchored CI plot:** Does the spatial "tighter = better" intuition survive right-to-left layout, or does the error bar need to grow/shrink toward the reading direction? Flag for Cycle 2 UI design.

---

## Vision Alignment Check

| Rule | Compliant? | Citation |
|---|---|---|
| What we are: stats-first via game | ✓ | Inference Lab: every decision requires statistical reasoning to make |
| Gameplay ≠ Gamification | ✓ | Player decides sample size / test / publish — all require stats knowledge |
| Design rule: Hebrew-first | ✓ | All UI copy in Hebrew specified in UI Sketch; code only in English |
| Design rule: dark UI | ✓ | `--bg` #0e0f12 used throughout spec |
| Color palette: only locked tokens used (NO new hexes) | ✓ | Only `--bg`, `--bg-2`, `--blue`, `--teal`, `--gold`, `--amber`, `--red`, `--mute`, `--border` |
| UI source cited (Linear / Anthropic / Stripe / etc.) | ✓ | Linear.app: status-pill density; Apple HIG: 44pt touch targets; VISION.md: bottom-sheet pattern |
| UI anti-pattern avoided | ✓ | No modals; bottom action zone not hamburger; persistent inline failure banner not toast |
| Tech invariant: Tailwind only | ✓ | Design-only cycle; no CSS written |
| Tech invariant: Zustand only | ✓ | Design-only cycle; Zustand specified for prototype |
| Tone rule: encouragement | ✓ | Failure state copy is explanatory + encouraging, not punitive |
| Mobile-first (thumb-reach + 44pt targets) | ✓ | Bottom action zone, 44pt tiles per Apple HIG |
| Out of scope: stays in scope | ✓ | Intro stats only; no multiplayer; no teacher dashboard |

**NotebookLM consulted:** No — MCP connector not available in this container (per cycle rules, SKIPPED, cycle not blocked).  
**Board-game inspiration:** Wingspan (BGG/266192), engine-building compound-moves mechanic; Coffee Rush (BGG/377061), real-time triage pacing; Quacks of Quedlinburg (BGG/244522), push-your-luck sampling sub-loop; Cry Havoc (BGG/192457), asymmetric paths for test-selection; Dice Forge (BGG/242167), mutable toolkit concept; Patchwork (BGG/163412), spatial-budget constraint pattern.  
**Mobile-game inspiration:** Reigns — swipe-to-decide under deadline; Tomb of the Mask — one-more-run addictive loop; Mini Metro — minimal HUD + load-management.  
**Decision interval:** ~20 seconds per step; ~90 seconds per full study cycle.  
**Statistical concept used in decision:** Sampling, confidence intervals, p-values, Type I/II error, statistical power, test selection.
