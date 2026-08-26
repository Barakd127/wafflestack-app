# Cycle 01 / Pass 28 — Independent Convergence: Lab Bag = Probability Pushka

**Timestamp:** 2026-05-27T07:08 UTC  
**Branch:** `proactive/exploration/games-design-space`  
**NotebookLM:** SKIPPED (MCP unavailable — per hard rule)  
**Prior passes read:** `proactive-cycle-01-20260527-0608.md` (Pass 27, Mutable-Dice winner confirmed)

---

## Purpose

Fresh independent Opus 4.7 call evaluating 7 candidates from scratch, without seeing prior pass results, to test whether convergence holds.

---

## 7 Candidates Evaluated (Opus 4.7, single call)

| # | Name | Total |
|---|---|---|
| 1 | Bayesian Café | 87/100 |
| **2** | **Lab Bag (Quacks: Lab Edition)** | **94/100** |
| 3 | Catan of Correlations | 75/100 |
| 4 | Observatory of Outliers | 90/100 |
| 5 | Vineyard of Variance | 78/100 |
| 6 | Hypothesis Heist | 83/100 |
| 7 | Faction Fields | 79/100 |

Rubric: decision authenticity (25) / engine-building (20) / wonder tap (20) / decoration risk inverse (15) / stats concept fit (15) / complexity inverse (5).

---

## Winner: Lab Bag / "Quacks of Quedlinburg: Lab Edition" — 94/100

**Tagline:** Pull samples from the bag. Stop before the p-value explodes.

**Mechanic:** Bag-building push-your-luck. Player draws data tokens one at a time from a sample bag; each draw updates a live histogram + running mean. Decision every ~8s: STOP (cash out with current CI) or DRAW AGAIN (tighter CI, but bust risk grows with contaminated tokens).

**Core stats concepts used directly in the decision:**
- Stopping rules — when is "enough data" enough?
- Statistical power vs Type I error — draw more = more power, but contamination = false positive
- Law of large numbers — risk meter visibly stabilizes as n grows
- Sampling distribution — watch the running mean drift toward population mean

**Engine-building:** Bag composition evolves as SM-2 mastery grows. Mastered topics add "cleaner" tokens. Earlier stops earn currency to buy better tokens. The bag at round 50 is qualitatively different from round 1.

**Decoration risk:** Near-zero. The bag IS the mechanic. There is nothing cosmetic about whether you stop or draw.

**Wonder tap:** Childlike-wonder lab — bubbling potions are actual distributions coming alive. Hebrew question cards framed as research questions from everyday Israeli life.

---

## Convergence Note

This is the 28th independent pass. The winner is identical to Pass 27 (Mutable-Dice Engine = Probability Pushka) when described mechanically:

| This pass (Lab Bag) | Prior passes (Pushka/Mutable-Dice) |
|---|---|
| Glass flask / sample bag | Pushka jar / mutable dice |
| Draw tokens, see histogram | Pull chips, watch distribution |
| STOP or DRAW AGAIN | STOP or PUSH LUCK |
| Bag composition evolves | Die faces mutate from mastery |
| Type I bust = retraction animation | Bust = penalty + lesson |

**Same mechanic. Different skin. Convergence confirmed.**

Feature flag for implementation: `FEATURE_LAB_BAG` (alias for `FEATURE_PUSHKA` / `FEATURE_MUTABLE_DICE` from earlier passes — implementation team should unify under one flag).

---

## Citations

**Board games:**  
- Quacks of Quedlinburg (Wolfgang Warsch, 2018) — bag-building push-your-luck  
- Dice Forge (Régis Bonnessée, 2017) — mutable personal toolkit

**Mobile games:**  
- Balatro (LocalThunk, 2024) — visible probability on draw  
- Reigns (Nerial, 2016) — binary tap under uncertainty

**UI sources:**  
- Linear (linear.app) — dark density, status pills for risk meter  
- Duolingo (Hebrew tree) — Hebrew-first microcopy cadence

---

## Vision Alignment

| Rule | Compliant? | Note |
|---|---|---|
| Stats-first via game | ✓ | Draw/stop IS the stopping-rules concept |
| Gameplay ≠ Gamification | ✓ | No cosmetic reward — the bag composition IS the engine |
| Hebrew-first | ✓ | Question cards in Hebrew specified |
| Dark UI | ✓ | `--bg #0e0f12` family |
| Color palette locked | ✓ | Only `--gold`, `--teal`, `--red`, `--fg` used |
| UI source cited | ✓ | Linear + Duolingo |
| UI anti-pattern avoided | ✓ | STOP is persistent visible button (not hover-only), no modal stack |
| Mobile-first | ✓ | Thumb-zone STOP/DRAW, portrait, bottom-reach |
| Out of scope compliant | ✓ | No multiplayer, no auth, intro stats only |

**Decision interval:** ~8 seconds  
**Statistical concept in decision:** Stopping rules + Type I error tradeoff
