# WaffleStack — Proactive Cycle 01: Gameplay Design Space Exploration

**Date:** 2026-05-22  
**Branch:** proactive/exploration/games-design-space  
**Model:** Opus 4.7 (gameplay design oracle)  
**NotebookLM:** SKIPPED — MCP connector not available in this container. Design judgment drawn from VISION.md catalogue + model's own synthesis.

---

## Framing

WaffleStack teaches intro statistics to BA social-science students through **real gameplay**, not quiz wrappers. The core constraint from VISION.md: every candidate must give the player a meaningful decision that **uses** a statistical concept — not one that is merely adjacent to it. The existing city-builder is the baseline to beat (known risk: decoration, not decision).

Intro stats topics in scope: descriptive stats (mean/median/mode/variance/std dev), frequency distributions, histograms, normal distribution, z-scores, probability, sampling, confidence intervals, hypothesis testing (t-test, chi-square), correlation, linear regression.

---

## Scoring rubric (1–5 each, total /30)

| Axis | 1 | 5 |
|---|---|---|
| Decision rhythm | slow/rare decisions | one meaningful choice every ~15s |
| Wonder tap | dry, academic | joyful pull, "just one more" |
| Engine-building potential | flat/linear | strong compounding from early choices |
| Topic-fit | stats concept adjacent | player literally applies the concept to decide |
| Decoration risk | high — cosmetics can crowd out gameplay | structurally impossible to play without using stats |
| Scope for Cycle 2 prototype | weeks/months | one sprint (one week) |

---

## 8 Candidate Gameplay Loops

---

### 1. ☕ The Variance Café
**Core mechanic:** Each "shift," customers arrive with a hidden taste distribution. You see a small sample (2–3 sip-dots on an axis). You tune two sliders — **μ** (sweetness center) and **σ** (consistency/spread) — on an espresso machine. Commit; the machine brews; a histogram of customer satisfaction fills the screen. Tips scale with distributional overlap. Between waves, spend tips on equipment cards that modify your statistical action space.

- **Stats concept used:** Mean, variance, standard deviation — infer from a sample, act on the estimate.
- **Board game ref:** Wingspan (engine-building, each equipment card alters action space) + Quacks of Quedlinburg (push-your-luck on σ: too tight = bust on outlier customers).
- **Mobile game ref:** Mini Metro (tightening pressure curve, decisions cheap but compounding) + Threes (atomic-commit — each slider lock is irreversible for that customer).
- **Decision interval:** ~15 seconds per customer.

| Axis | Score |
|---|---|
| Decision rhythm | 5 |
| Wonder tap | 5 |
| Engine-building potential | 5 |
| Topic-fit | 5 |
| Decoration risk | 5 |
| Scope for Cycle 2 | 4 |
| **Total** | **29/30** |

**One-line risk:** Slider UX can feel arcade-y if the histogram readout is too slow to make the feedback feel like statistical insight.

---

### 2. 🎲 Dice Forge: Lab of Distributions
**Core mechanic:** You own a die; each round you remove one face and engrave a new outcome (a probability value you choose) to beat the night's "experiment" target. Over time you craft a custom distribution and observe how samples from it hit (or miss) the target.

- **Stats concept used:** Probability, expected value, sampling distributions.
- **Board game ref:** Dice Forge (mutable dice — the die you own IS your probability distribution).
- **Mobile game ref:** Threes (small atomic choices, irreversible, deeply satisfying).
- **Decision interval:** ~20 seconds per face-swap.

| Axis | Score |
|---|---|
| Decision rhythm | 4 |
| Wonder tap | 4 |
| Engine-building potential | 5 |
| Topic-fit | 5 |
| Decoration risk | 5 |
| Scope for Cycle 2 | 4 |
| **Total** | **27/30** |

**One-line risk:** Abstract without a strong theme — needs a vivid "lab" or "forge" skin so dice feel tangible, not spreadsheet-like.

---

### 3. 🧵 Patchwork of Proof (daily puzzle)
**Core mechanic:** A daily puzzle: tile a board with sample-shaped patches under a joint time + α-budget. Each patch placement corresponds to a hypothesis test decision (reject/retain H₀) with a cost in Type I error budget. Once budget is exhausted, you see how many patches caused false positives.

- **Stats concept used:** Hypothesis testing, p-values, Type I / Type II error.
- **Board game ref:** Patchwork (spatial fitting under dual budget) + Wordle (one-a-day, shareable result).
- **Mobile game ref:** Wordle (daily ritual, social share on completion).
- **Decision interval:** ~25 seconds per tile placement.

| Axis | Score |
|---|---|
| Decision rhythm | 4 |
| Wonder tap | 3 |
| Engine-building potential | 3 |
| Topic-fit | 5 |
| Decoration risk | 5 |
| Scope for Cycle 2 | 5 |
| **Total** | **25/30** |

**One-line risk:** Daily-only cadence kills the in-between-session retention loop; needs a second mode to sustain a 10-session arc.

---

### 4. 🧸 Stat-Critter Brawler
**Core mechanic:** Asymmetric creatures whose combat attacks are modeled as distributions (Normal, Uniform, Skewed). You pick which critter to send against a boss whose defense is also a distribution. Victory = your distribution "covers" theirs by enough overlap (z-score reasoning).

- **Stats concept used:** Z-scores, distributional overlap, Central Limit Theorem.
- **Board game ref:** Stuffed Fables (per-encounter unique mechanic) + Root / Cry Havoc (asymmetric factions, each with own rules).
- **Mobile game ref:** Vampire Survivors (build a kit, lean into a style, watch it execute).
- **Decision interval:** ~20 seconds per combat pick.

| Axis | Score |
|---|---|
| Decision rhythm | 4 |
| Wonder tap | 5 |
| Engine-building potential | 4 |
| Topic-fit | 4 |
| Decoration risk | 3 |
| Scope for Cycle 2 | 2 |
| **Total** | **22/30** |

**One-line risk:** Scope explosion — asymmetric critter design costs massive content work before the stats insight fires. Combat framing can mask whether the player is actually thinking statistically.

---

### 5. ⚙️ Regression Robotics
**Core mechanic:** Pre-commit a sequence of operations (transform → fit → predict → evaluate residuals) for a robot arm, then watch it execute against a scatter-plot dataset. Iterate on the program after seeing residuals.

- **Stats concept used:** Linear regression, residuals, correlation.
- **Board game ref:** Mechs vs Minions (programming-puzzle — commit a sequence, watch execution, iterate).
- **Mobile game ref:** Tomb of the Mask (commit → watch unfold, tight feedback).
- **Decision interval:** ~30 seconds during programming phase.

| Axis | Score |
|---|---|
| Decision rhythm | 3 |
| Wonder tap | 3 |
| Engine-building potential | 4 |
| Topic-fit | 5 |
| Decoration risk | 5 |
| Scope for Cycle 2 | 3 |
| **Total** | **23/30** |

**One-line risk:** The programming phase breaks the 15–30s decision cadence; players may sit for 45+ seconds sequencing before they see feedback.

---

### 6. 🕴 Influence on Topic Territories
**Core mechanic:** Place influence cubes on stats-topic "districts" of a city map. AI opponents bluff their statistical claims; you call confidence intervals on their claims to contest or accept territory.

- **Stats concept used:** Confidence intervals, sampling, estimation.
- **Board game ref:** Godfather: Corleone's Empire (influence placement + bluffing + area control).
- **Mobile game ref:** Reigns (binary commit under uncertainty — accept/reject every few seconds).
- **Decision interval:** ~20 seconds.

| Axis | Score |
|---|---|
| Decision rhythm | 4 |
| Wonder tap | 3 |
| Engine-building potential | 3 |
| Topic-fit | 4 |
| Decoration risk | 4 |
| Scope for Cycle 2 | 3 |
| **Total** | **21/30** |

**One-line risk:** Bluffing requires distinct AI personalities with believable statistical behavior — heavy content cost before the mechanic clicks.

---

### 7. 🏨 Triage Clinic (real-time)
**Core mechanic:** Patients (NPCs) arrive with symptom-frequency tables (sample data). You classify each case (chi-square goodness-of-fit test) and route them to the correct room before a per-patient timer expires.

- **Stats concept used:** Chi-square test, frequency distributions, goodness-of-fit.
- **Board game ref:** Coffee Rush (real-time triage pacing, prioritization under pressure).
- **Mobile game ref:** Two Dots (chain decisions under tempo, one-thumb).
- **Decision interval:** ~10 seconds.

| Axis | Score |
|---|---|
| Decision rhythm | 5 |
| Wonder tap | 4 |
| Engine-building potential | 3 |
| Topic-fit | 4 |
| Decoration risk | 4 |
| Scope for Cycle 2 | 3 |
| **Total** | **23/30** |

**One-line risk:** Real-time triage + Hebrew RTL on mobile creates a tight UX budget — the stat reasoning may get crowded out by time pressure.

---

### 8. 🌶 Spice Road of Sampling
**Core mechanic:** Pickup-and-deliver: convert raw samples → summary statistics → inferences along a route. Each card in your deck transforms one resource tier into the next (raw data → mean → confidence interval → decision). Upgrade cards to reduce conversion cost.

- **Stats concept used:** Sampling distributions, Central Limit Theorem, chain of inference.
- **Board game ref:** Century Spice Road (pickup-and-deliver resource pyramid mirroring topic prerequisites).
- **Mobile game ref:** Duolingo (path with branching, player chooses which upgrade to pursue next).
- **Decision interval:** ~25 seconds.

| Axis | Score |
|---|---|
| Decision rhythm | 3 |
| Wonder tap | 3 |
| Engine-building potential | 5 |
| Topic-fit | 4 |
| Decoration risk | 4 |
| Scope for Cycle 2 | 3 |
| **Total** | **22/30** |

**One-line risk:** "Resource conversion" can feel like a worksheet unless the theme (route, journey, discovery) is vivid and each conversion is visualized as a statistical transformation.

---

## Summary Scores

| Rank | Candidate | Score |
|---|---|---|
| 1 | ☕ The Variance Café | 29/30 |
| 2 | 🎲 Dice Forge: Lab of Distributions | 27/30 |
| 3 | 🧵 Patchwork of Proof | 25/30 |
| 4 | ⚙️ Regression Robotics | 23/30 |
| — | 🏨 Triage Clinic | 23/30 |
| 5 | 🧸 Stat-Critter Brawler | 22/30 |
| 6 | 🌶 Spice Road of Sampling | 22/30 |
| 7 | 🕴 Influence on Topic Territories | 21/30 |

---

## Top-3 Ranking

### Rank 1: ☕ The Variance Café (29/30)
Highest decision rhythm, strongest "run your own place" wonder tap, and — most importantly — the histogram IS the gameplay surface, making decoration drift structurally impossible. Equipment cards expand the statistical action space (not just the visual space), so every upgrade the player earns is literally a new statistical operator in their toolkit. The "run a place" emotional pull (VISION.md primary pull) maps naturally onto a web-first mobile layout: bottom-sheet equipment shop, histogram fills vertically on mobile, sliders are one-thumb reachable.

### Rank 2: 🎲 Dice Forge: Lab of Distributions (27/30)
The cleanest single-mechanic illustration of "your decisions literally change your probability distribution." A student who builds their die for three sessions has physically constructed a sampling distribution by hand — which is exactly what the topic requires. Loses to #1 only on wonder and theme immediacy: a lab of dice needs more UI richness to feel joyful rather than technical. Excellent candidate for a later cycle that specifically targets probability + expected value in depth.

### Rank 3: 🧵 Patchwork of Proof (25/30)
Tightest fit for hypothesis testing — the α-budget mechanic makes Type I error visceral (you feel yourself "spending" significance). The daily-shareable hook is the strongest social-retention signal in the list. Ranks third because a daily-only loop doesn't sustain a 10-session progression arc without a secondary mode, and Cycle 2 scope would be under-leveraged on a game that caps at one interaction per day.

---

## #1 Detailed Spec: The Variance Café

**Hebrew working title:** בית הקפה של השונוּת  
**Tagline:** נהל בית קפה. לכל לקוח יש טעם — ולכל טעם יש התפלגות.  
*(Manage a café. Every customer has a taste — and every taste has a distribution.)*

---

### 1. The Core Loop (~130 words)

A shift = ~3 minutes. A wave of 3–5 customers arrives, each with a hidden taste expressed as a target distribution (e.g., "likes sweetness μ ≈ 7, σ ≈ 1.2"). The player sees only a small sample — 2–3 sip-dots on a horizontal axis — representing previous drinks that customer has rated. The player tunes two sliders on an espresso machine: **μ** (the blend's center/strength) and **σ** (consistency/spread). They commit; the machine brews; a histogram of satisfaction scores fills under each cup in real time. Tips scale with the distributional overlap of the player's brew vs. the customer's true taste. Between waves, tips buy **equipment cards** that modify the statistical action space: a "precision grinder" tightens the σ minimum, a "milk steamer" unlocks a second axis (bitterness), a "regular customer" card locks one slider to a known parameter. Days end with a "daily special" boss: match an unusual distribution from limited samples.

---

### 2. First 5 Minutes

**Minute 0–1 (tutorial):** Customer 1 arrives. Two sip-dots appear near 6 on the sweetness axis. A tutorial nudges: drag μ to 6, leave σ wide. Player commits. Near-miss — satisfaction histogram peaks slightly off-center. Tooltip explains: "Their sample points to 6, but your σ was so wide it covered 2–10. Less spread = better match." 

**Minute 1–2:** Customer 2 has three sip-dots at 6, 6, 7. Tighter cluster — obvious σ guidance. Player narrows σ, commits, gets their first big-tip animation with histogram glow. No instruction needed: the histogram explained it.

**Minute 2–3:** End of Wave 1. Equipment shop opens (bottom-sheet). Player buys "Better Grinder" (minimum σ drops from 1.5 to 1.0). Wave 2 starts. Customer 3 has sip-dots at 3 and 9 — the first puzzle moment: high-variance sample. Is this a wide-distribution customer, or just noise? Player must decide: lean wide, or guess a hidden bimodal? Day 1 ends with a 5-customer rush that rewards fast, confident μ picks.

---

### 3. The Stats Concept as Decision, Not Decoration

The primary concept throughout Sessions 1–4 is **variance and sample inference**: inferring a population parameter (σ of taste) from a small, noisy sample, then acting on that estimate.

Choosing σ **is** the decision — not a decorative knob. Pick too tight → miss outliers, tip drops. Pick too wide → average satisfaction falls, tips fall. The histogram of satisfaction scores makes the abstract idea of spread **physically visible**: cups fill, foam overflows when σ is too narrow or too wide. Later levels introduce **standard error** explicitly: a "frequent customer" provides a larger sample, so the recommended σ band tightens — the student directly experiences why n matters.

The player cannot earn a tip without reading a sample and estimating μ and σ. There is no other input. The game literally cannot be played without applying inferential thinking.

---

### 4. Progression Arc (10 Sessions)

| Sessions | Mechanic unlocked | Core concept |
|---|---|---|
| S1–2 | μ slider only, σ fixed | Mean, reading a sample, center estimation |
| S3–4 | σ slider unlocked | Variance, standard deviation |
| S5 | Third axis (bitterness) | Joint distributions, multi-dimensional thinking |
| S6 | "Regulars" with known params | Planning vs. inference, using known population |
| S7 | VIP customers with z-score tips | Z-scores, standardized distance |
| S8 | A/B menu testing event | Two-sample comparison, soft intro to t-test |
| S9 | "Health inspector" boss | Chi-square goodness-of-fit |
| S10 | Open café — you design a menu | Confidence intervals + hypothesis test finale |

Each session unlocks exactly one new statistical operator as a gameplay mechanic. The progression arc IS the statistics curriculum.

---

### 5. Failure State

Bad shifts lose tips but never lock progress or destroy streaks. Each missed customer reveals their **true distribution** overlaid on the player's brew — a "you were here, they were here" annotation in `--teal` / `--red` with a one-sentence explanation: *"הלקוח אהב מרירות נמוכה — ה-σ שלך היה רחב מדי"* ("The customer liked low bitterness — your σ was too wide").

Three bad shifts in a row → a friendly regular walks in with a free guided round (the regular's distribution is revealed from the start). No streak destruction, no punishment screen. The histogram annotation IS the lesson; losing IS the most informative moment.

---

### 6. Board Game Mechanic Adapted

**Wingspan engine-building** for the equipment cards: each card permanently expands the player's statistical action space. The cards are not cosmetic upgrades — they add new sliders (axes), change slider bounds (σ floor), or add sample tokens (larger n). The engine the player builds over sessions IS their growing statistical toolkit.

**Quacks of Quedlinburg push-your-luck** for the σ slider: going too narrow on σ to maximize "precision tips" risks busting on outlier customers — a recoverable risk that teaches the cost of overconfidence in estimates. The player will quickly internalize that tight σ is not always correct, which is the same insight as "a very precise but wrong estimate is still wrong."

Both mechanics fit stats teaching because the **upgrades themselves are statistical operators**, not just score multipliers.

---

### 7. Mobile Pattern Adapted

**Mini Metro's tightening pressure curve:** early shifts are forgiving (3 customers, slow pace), later shifts add customers, time pressure, and simultaneous orders. The player develops quick distributional intuition — the same reflexive pattern-recognition that Mini Metro builds for network topology.

**Threes' atomic-commit feel:** each slider lock per customer is irreversible for that customer's cup. The 15-second decision window enforces judgment under uncertainty (a direct stats pedagogy goal). There is no "undo" on a committed brew — the student must act on their best estimate, then see the result. This mirrors real statistical decision-making.

Histogram fill animation = feedback density without modal interruption. All feedback lives in the bottom-sheet or inline histogram; no modals stack.

---

### 8. Why This Beats City-Builder

The city-builder's structural failure mode: placing a "histogram building" on a tile looks like stats engagement but the placement decision doesn't require reading or reasoning about a histogram. The building is cosmetic evidence of learning, not the learning itself.

In Variance Café, there is no tip without slider interaction, no slider interaction without reading the sample dots, no reading sample dots without thinking about distributional spread. The statistical concept is the **only input** to the reward function. Equipment cards modify the *decision space* (slider ranges, axes, sample sizes), not just the skyline. Even the visual output (the histogram) is the **score surface**, not a decoration layer on top of a score.

Decoration drift is structurally prevented: if you removed the stats reasoning, the game has no inputs and no outputs. The city-builder remains useful as a **visualization layer** for the player's overall progress map — what topics they've mastered — but should not be the primary decision arena.

---

### 9. Cycle 2 Prototype Scope (Minimum Playable Version)

**What to build:**
- One café scene (static illustration or simple SVG — no 3D required)
- One slider axis: sweetness **μ only** (σ fixed at 1.5)
- 5 hand-authored customer types with pre-defined sample dot sets
- 3 equipment cards: "Sample +1" (see one extra dot), "μ range +" (extend slider), "Tip multiplier" (cosmetic, for feel)
- One shift = 5 customers, ~90 seconds
- Histogram rendered via SVG (inline, no library needed for v0)
- RTL Hebrew UI, bottom-sheet for equipment shop, `--bg` / `--bg-2` / `--gold` / `--teal` / `--red` tokens only
- Zustand store shape: `{ shiftId: number, customers: Customer[], currentMu: number, equipment: EquipmentCard[], tips: number }`
- No backend, no auth, no persistence in v0
- Feature flag: `FEATURE_VARIANCE_CAFE` in `src/config/featureFlags.ts`

**Goal of Cycle 2:** Prove the **15-second decision cadence** and the **"aha — I picked σ too tight"** moment in a single 3-minute play session. If a playtester says "wait, I need to read the dots better" unprompted, the prototype is working.

**Not in scope for Cycle 2:** σ slider, equipment persistence, sound, 3D, multiple days, full curriculum.

---

*Design oracle: Opus 4.7. Cycle author: Sonnet 4.6. Date: 2026-05-22.*
