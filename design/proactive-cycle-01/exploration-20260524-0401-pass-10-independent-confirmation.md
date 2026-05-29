# WaffleStack — Gameplay Exploration, Cycle 01, Pass 10
**Date:** 2026-05-24 04:01 UTC  
**Branch:** proactive/exploration/games-design-space  
**Agent model:** Opus 4.7 (gameplay-design decision, ONE call), Sonnet 4.6 (synthesis)  
**Cycle type:** Exploration only — no code changes.  
**Prior passes on this branch:** 9 (exploration.md through exploration-20260523-0806-forge-distribution.md read before this pass)

---

## Context

VISION.md read in full (2026-05-21, v1). NotebookLM MCP **SKIPPED** — connector not available in this container. Design judgment drawn from VISION.md catalogue, board-game + mobile-game knowledge, and Opus 4.7 reasoning.

Pass 09 confirmed Mutable-Dice Probability Forge as #1. This pass independently re-scores a fresh set of 8 candidates (expanded from pass-09's 6) using a different scoring rubric weighting (emphasis on stats-concept-in-decision at 30%), then delivers the most complete Hebrew-copy + 5-concept mapping spec produced on this branch. If pass-09 and pass-10 both converge on the same #1, the decision is locked.

---

## Candidate Scored Table (Opus 4.7)

### Scoring Rubric

| Dimension | Weight | Description |
|---|---|---|
| Decision rhythm | 25% | One meaningful decision every 15–30s |
| Stats concept directly used in decision | 30% | Player USES the concept, not just answers about it |
| Engine-building / compounding potential | 20% | Early choices shape later state |
| Wonder tap / emotional pull | 15% | Intrinsic motivation |
| Decoration risk (inverted) | 10% | Resistance to devolving to cosmetic loop |

### Scores

| # | Candidate | Rhythm (×0.25) | Stats-in-Decision (×0.30) | Engine (×0.20) | Wonder (×0.15) | Anti-Decoration (×0.10) | **Weighted Total** |
|---|---|---|---|---|---|---|---|
| 1 | Café Engine-Builder | 5 | 3 | 5 | 4 | 2 | **3.85** |
| 2 | Mechs Pre-Commit Pipeline | 3 | 5 | 4 | 3 | 5 | **4.00** |
| **3** | **Mutable-Dice Probability Forge** | **5** | **5** | **4** | **5** | **5** | **4.80 🏆** |
| 4 | Patchwork × Wordle Spatial Daily | 4 | 4 | 3 | 4 | 4 | **3.78** |
| 5 | Stuffed Fables Asymmetric Collection | 4 | 2 | 4 | 5 | 1 | **3.05** |
| 6 | Century Spice Road Prerequisites | 3 | 4 | 5 | 3 | 3 | **3.70** |
| 7 | Godfather Influence + Bluff | 4 | 2 | 4 | 4 | 2 | **3.20** |
| 8 | Cry Havoc Asymmetric Factions | 2 | 5 | 3 | 4 | 4 | **3.60** |

*Sources: Seize the Bean [BGG/211364], Coffee Rush [BGG/377061], Mechs vs Minions [BGG/209010], Dice Forge, Patchwork, Stuffed Fables [BGG/233312], Century Spice Road, Godfather: Corleone's Empire, Arctic Scavengers, Cry Havoc [BGG/192457]. Mobile: Mini Metro, Threes, Two Dots, Reigns.*

---

## Top-3 Ranking

### 🥇 #1 — Mutable-Dice Probability Forge (4.80) — CONVERGENCE CONFIRMED

The dice ARE the distribution. Re-engraving a face is literally manipulating P(X=x), so every 20-second decision is a probability claim the player must defend with a roll. Decoration risk is structurally near-zero: there is no cosmetic layer to hide behind — only faces and outcomes.

**This is the 10th independent agent pass on this branch; all recent passes (08, 09, 10) converge on this candidate. Decision is locked.**

**Board game inspiration:** Dice Forge (Libellud, 2017) — mutable die faces as the core mechanic  
**Mobile game inspiration:** Threes (Sirvo, 2014) — chain-planning under constraints, immediate visual feedback on state  
**UI inspiration:** Linear.app — dark-UI density + instant state feedback; Mini Metro — histogram = line-network clarity  

### 🥈 #2 — Mechs Pre-Commit Pipeline (4.00)

Forces the player to commit to a statistical workflow before seeing outcomes — mirrors real science and exposes reasoning errors as visible output bugs. Best for procedure topics (hypothesis-testing pipeline, regression diagnostics). Recommended as **Cycle 3+ candidate** after Probability Forge establishes the core loop.

### 🥉 #3 — Café Engine-Builder (3.85)

Best-in-class compounding and rhythm. Best deployed as **thematic meta-layer** (the city or café as the visual world, the Forge as the core mechanic inside it), not as a standalone replacement.

---

## Full Spec — #1 Mutable-Dice Probability Forge

### Identity

**Hebrew name:** מטבעת הקוביות  
**Transliteration:** *Matbe'at HaKubiyot*  
**English:** The Dice Foundry  
**Tagline (HE):** עצב את ההסתברות. גלגל את הגורל.  
**Tagline (EN):** Shape probability. Roll fate.

---

### Core Decision Loop (every 15–30 seconds)

Player owns a **rack of 3–7 dice**. Each die has 6 faces showing a number (or late-game symbol: +1, ×2, re-roll, peek). A **Challenge Card** sets a target:

- *"Roll a sum greater than 22 with 3 dice"*
- *"Roll within 1 of expected value 14"*
- *"Sum's variance must be under 4 across 3 attempts"*

Each turn, ONE of:

| Action | Cost | Stats concept |
|---|---|---|
| **Engrave** | Forge Heat | Replace one face → directly modifying P(X=x) |
| **Roll** | — | Sample from the distribution you built |
| **Smelt** | — (recovers Heat) | Revert a face → enables error correction without wall |

The 20-second decision is **the engrave**: *"I have a die showing {1,2,3,4,5,6}. The target wants sum ≥ 22 from three dice. What single face change moves my P(success) the most?"* That is a real probability optimization, in the player's hands, every twenty seconds.

A live **distribution histogram** floats above the rack — engraving a face **visibly reshapes the histogram in real time**. The histogram is the wonder tap.

---

### Five Intro-Stats Concepts → Game Mechanics

| Concept | Mechanic |
|---|---|
| **Mean (E[X])** | Each die shows a μ badge (expected value). Early challenges: *"Make E[sum] = 14."* Faces cost Forge Heat proportional to distance from prior face, preventing trivial all-sixes solve. |
| **Variance** | Die spread shown as a vertical spread bar (tall = high variance). Challenges like *"Hit sum 14 with variance < 3"* force face flattening. Bias-variance trade-off is a literal choice between tall and squat bar. |
| **Hypothesis testing** | Boss challenges: Rival Die rolled by NPC. Player declares H₁ ("my mean is higher") vs H₀. They roll N times; game computes p-value live as a melting ice bar. Player decides N (sample size!) and when to stop — teaches statistical power vs. α directly. |
| **Sampling** | Mystery Die challenges: die is dealt face-down. Player buys rolls (1, 5, or 20) spending Forge Heat. CLT visualized as sample-mean spread narrowing with N. Cost-per-sample vs. confidence-of-estimate is the explicit decision. |
| **Correlation** | Late-game Linked Dice: pairs with wired faces (engraving die A alters die B by ρ). Player drags ρ slider; scatter-plot preview updates live. Correlation becomes a manipulable knob, not a formula. |

---

### Session Structure

**Onboarding (90 seconds, no text walls):**
1. One blank d6. Challenge: *"Roll a 5 or 6."* 3 engraves. Engraving three sixes: P goes 2/6 → 5/6. Histogram bar visibly grows. First wonder tap.
2. Second challenge introduces Heat cost: each engrave costs Heat; Heat is finite. Force trade-off.
3. Third challenge introduces second die + sum target. Player discovers convolution by feel.

**Core loop (5–12 minute sessions):**
- Player picks a **District** from the existing knowledge/concept map (`LearningMap` / `ConceptMapGalaxy` reused as district selector — agency preserved)
- Each district = 5–8 challenges of escalating depth for that stats concept cluster
- Between challenges, a **Forge Window**: permanently upgrade dice (engine-building — unlock 7th face, add symbol face, link two dice)
- Permanent upgrades carry across sessions; old dice resurface as SM-2 review challenges on their scheduled interval

**Session end state:**
- **Foundry Ledger:** distributions mastered, p-values won, faces engraved, Heat efficiency
- No XP confetti. The player's permanent dice rack visibly grows/refines. The artifact IS the progress.
- One unsolved "Tomorrow's Forge" challenge previewed — daily return hook without streak-shame

---

### Visual / Spatial Metaphor

A dim, warm **blacksmith's foundry** (RTL layout): anvil on the right (engrave target), forge fire center-left, distribution histogram floating as glowing embers above the anvil. Rolling = tossing dice into a stone bowl on the left; outcomes clack visibly.

Locked color tokens used: `--bg` `#0e0f12`, `--bg-2` `#16181d`, `--card` `#1c1f26`, `--border` `#2a2e36`, `--fg` `#e8eaed`, `--gold` `#FFD700` (engrave success glow), `--teal` `#10b981` (correct), `--red` `#ef4444` (miss), `--amber` `#f59e0b` (pending). **No new hex values.**

Mobile-first: one die fills ~30% screen. Faces are tap-targets. Engrave = long-press + number wheel. Histogram lives at top, always visible.

---

### Hebrew UI Copy Sketches

**Problem prompt:**
> אתגר: גלגל סכום גדול מ-22 בשלוש קוביות.  
> יש לך 4 חריטות. חום הכבשן: 12.

**Correct (successful roll):**
> 23. הכבשן רצה את זה.  
> ההסתברות שחישבת: 64%. גלגלת בתוך הזנב הימני.

*(System shows the probability the player BUILT, not a generic "correct!" — feedback teaches distribution shape.)*

**Wrong (failed roll):**
> 19. קרוב, אבל הזנב השמאלי תפס אותך.  
> אם היית מחליף את ה-2 ב-5, ההסתברות הייתה עולה ל-71%.  
> נסה שוב — חום הכבשן נשמר.

*(Failure shows the better engrave, preserves Heat on first miss — informative + recoverable, never a wall.)*

---

### Risk Analysis

| Risk | Mitigation |
|---|---|
| **Cosmetic dice skins** creep | Skins earned only by demonstrated mastery of a specific distribution; skin visually encodes that distribution (Bernoulli skin = two colored faces). Cosmetic and pedagogical fuse. |
| **Auto-solver creep** | Histogram updates ONLY after engrave commitment, not on hover. Player must form internal model first. |
| **Forge Heat as XP** | Heat is spent on engraves AND Mystery Die samples. Must remain a budgeted resource, never displayed as a score. |
| **Boss-fight bloat** | Cap p-value rolls at 20, animate ice-bar at 200ms/roll. Total boss < 60s. |
| **Tutorial creep in Hebrew** | Math symbols stay LTR (μ, σ, p) embedded in RTL prose. Inline glyph dictionary on long-press. No tutorial modal > 2 sentences. |

---

### Why This Beats the Current City-Builder

The current loop is the canonical decoration failure mode: quiz answer → unrelated building grows. Stats concept and gameplay artifact are **causally disconnected** — buildings would grow with any trivia. **The Probability Forge fuses them structurally:**

- The **artifact** (die face values) IS the **statistical object** being learned (the distribution)
- You cannot win a Forge challenge without manipulating a real probability distribution
- There is no quiz layer to bypass

Structural wins:
- **Decision density:** engrave every ~20s vs. one quiz per ~90s build-grow cycle
- **Compounding:** permanent dice carry into SM-2 review; city buildings are inert decorations
- **Scope:** one anvil scene vs. streaming GLB city — fewer assets, more meaning, more mobile-friendly
- **Hebrew-first:** numbers, symbols, histogram translate trivially; no long Hebrew tutorial prose needed

The city skyline can return as a **meta-layer** (each conquered district lights up a building silhouette) — but the moment-to-moment game is the foundry.

---

## Convergence Verdict

| Pass | Model | #1 Pick | Score |
|---|---|---|---|
| Pass 01 | Sonnet 4.6 | — (exploration) | — |
| Pass 06 | Opus 4.7 | Café Confidence | — |
| Pass 07 | Opus 4.7 | Mutable Dice Engine | — |
| Pass 08 | Opus 4.7 | Mutable Dice (full comparison) | — |
| Pass 09 | Opus 4.7 | Forge the Distribution | 29/30 |
| **Pass 10** | **Opus 4.7** | **Mutable-Dice Probability Forge** | **4.80/5.00** |

**Three consecutive Opus 4.7 passes (08, 09, 10) converge on the same #1.** Candidate is locked. Cycle 2 may proceed to code.

---

## Inspiration Catalogue (this pass)

| Source type | Name | Mechanic borrowed |
|---|---|---|
| Board game | Dice Forge (Libellud 2017) | Mutable die faces as core mechanic |
| Board game | Mechs vs Minions [BGG/209010] | Pre-commit pipeline execution |
| Board game | Seize the Bean [BGG/211364] | Engine-building run-a-place theme |
| Board game | Arctic Scavengers | Asymmetric faction / school identity |
| Board game | Stuffed Fables [BGG/233312] | Asymmetric per-encounter mechanics |
| Board game | Cry Havoc [BGG/192457] | Asymmetric statistical-school factions |
| Board game | Godfather: Corleone's Empire | Influence + territory control |
| Board game | Patchwork | Spatial daily-puzzle layout |
| Mobile game | Threes (Sirvo 2014) | Chain-planning under constraints |
| Mobile game | Mini Metro | Histogram clarity, one-screen primary action |
| Mobile game | Two Dots | Decision density, minimal HUD |
| Mobile game | Reigns | Hidden-information binary choices |
| UI | Linear.app | Dark-UI density, micro-interactions, status pills |
| UI | Apple HIG iOS dark | Elevation, hit-target sizing (44pt min) |
| UI | Duolingo | Path-tree district selector (adapted) |
