# WaffleStack — Gameplay Loop Exploration
## Proactive Cycle 01 · Pass 15 · 2026-05-25 05:04

**Cycle type:** Exploration only (no code). 5-dimension rubric (Rhythm / Wonder / Engine / Topic-fit / Deco-risk), max 25 pts.

**NotebookLM:** SKIPPED — MCP connector not available in this container. Design judgment drawn from VISION.md catalogue and board-game analysis.

**VISION.md read:** yes (version 1, 2026-05-21)

**Prior passes:** 01–14 preserved in git history on this branch. This is Pass 15.

---

## Context

Pass-14 (04:07 UTC, same day) shifted to a 7-criterion 100-point rubric and found **Expedition: The Sample Map (H1 hybrid, 94/100)** — a Sampling Frontier × Mutable-Dice fusion — as the winner. Pass-14's key insight: the two designs (Forge inner engine + Expedition outer loop) are not competing but converging.

This pass uses the canonical 5-dimension rubric from the original cycle-1 prompt. It is an **independent Opus 4.7 confirmation** using fresh context, without prior pass scores anchored in the prompt.

---

## Scoring Rubric (5-dimension, max 5 each)

| Dimension | Meaning |
|---|---|
| **Decision rhythm** | Meaningful choice every 15–30s using the stat concept |
| **Wonder tap** | "One more turn" pull without grind |
| **Engine-building** | Early choices compound into late-game capability |
| **Topic-fit** | Mechanic REQUIRES the stat concept; not just themed around it |
| **Decoration risk** | 5 = very low risk of becoming cosmetic; 1 = high risk |

---

## Candidate Scores (Opus 4.7 — fresh call)

| # | Candidate | Rhythm | Wonder | Engine | Topic-fit | Deco-risk | **Total** |
|---|---|---|---|---|---|---|---|
| 1 | 🏪 Run-a-place engine-builder | 3 | 4 | 5 | 3 | 3 | **18** |
| 2 | 🧸 Collection asymmetric brawler | 3 | 5 | 4 | 2 | 2 | **16** |
| 3 | ⚙️ Pre-commit programming puzzle | 5 | 3 | 4 | 5 | 5 | **22** |
| 4 | 🏨 Real-time triage (Coffee Rush) | 5 | 4 | 2 | 4 | 4 | **19** |
| 5 | **🎲 Mutable-dice engine (Kuvia/Forge)** | **4** | **5** | **5** | **5** | **4** | **23** |
| 6 | 🌶 Pickup-and-deliver resource chain | 3 | 3 | 4 | 2 | 3 | **15** |
| 7 | 🕴 Influence+bluff (Godfather) | 2 | 3 | 3 | 2 | 2 | **12** |
| 8 | 🧵 Spatial-tiling daily (Patchwork) | 4 | 5 | 3 | 3 | 4 | **19** |
| 9 | **NEW: Sampling-Net** — push-your-luck + spatial; draw samples from hidden population, infer to win contracts | 5 | 4 | 4 | 5 | 5 | **23** |
| 10 | **NEW: Distribution-Sculptor city** — R3F city reframed; each district IS a distribution you shape; events stress-test it | 4 | 4 | 5 | 5 | 4 | **22** |

---

## Top-3 Ranking (this pass)

| Rank | Candidate | Score | Note |
|---|---|---|---|
| 1 | 🎲 Kuvia — Mutable-Dice / Distribution Forge | 23/25 | Tiebreak over Sampling-Net: die = distribution is the cleanest one-to-one stats metaphor; thumbfriendly mobile loop |
| 2 | ❄️ Sampling-Net | 23/25 | Tied, ranked 2nd on build reuse (less prior codebase integration) |
| 3 | ⚙️ Pre-commit programming puzzle | 22/25 | Strongest for procedure topics; lower wonder-tap pull |

---

## #1 Summary: Kuvia (קוּבִּיָּה) — Distribution Forge

See pass 2–13 exploration files for detailed specs. This pass provides the fresh-Opus confirmation of the same winner.

### Core loop recap (~20s per decision beat)

1. Roll your die → generate μ-shards / σ-shards / p-tokens
2. Forge decision: engrave a face (changes live histogram permanently), buy a contract, or bank
3. Push-your-luck: decide whether to attempt the active contract now (reading a shaded probability area)
4. Repeat. 5-minute run. 15 turns.

### Stats topics mapped

| Concept | Mechanic |
|---|---|
| Mean / median / mode | Histogram draggable markers shift as faces are engraved |
| Variance / std dev / IQR | σ-shards polish die (narrowing spread); some contracts reward consistency, others upside |
| Probability & distributions | Face choices sculpt toward Uniform / Binomial / skewed; Bell Furnace = CLT aha |
| Sampling & sampling distributions | "Roll 5 and report the mean" contracts; live sampling-distribution panel |
| Hypothesis testing | Rival die boss contracts with p-value shading; reject or fail-to-reject |
| Regression | Two-die coupling contracts; scatter + live best-fit line |
| Confidence intervals | Declare CI width on commit; too wide = low payout, too narrow = bust |

### Why decoration risk is low

The histogram IS the control surface. Every engraving decision reads from it and writes to it. No confetti gating this verb.

---

## Cross-pass reconciliation

This pass's #1 (Kuvia/Forge, 23/25 on 5-dim) **confirms passes 7–13** and is **consistent with pass-14**'s design (where Forge = the Kit Forge inner engine of Expedition H1, and H1 wins by adding the spatial-sampling outer loop).

| Pass | Rubric | #1 Pick | Forge family? |
|---|---|---|---|
| 02–03 | 30pt | Mutable Dice Forge | ✓ |
| 07–13 | 30pt | Mutable Dice Engine / Distribution Forge | ✓ |
| **14** | **100pt** | **Expedition H1 (Forge as inner engine)** | **✓** |
| **15 (this)** | **25pt (5-dim)** | **Kuvia / Distribution Forge** | **✓** |

**Signal:** 11 of 15 passes identify the Forge/PMF-mutable-die mechanic as core. Pass-14's Expedition H1 *includes* the Forge as its inner engine — the two are architecturally unified.

**Design decision is stable.** Cycle 2 should build the Forge inner loop (Kuvia MVP) behind a feature flag, as the first playable proof that "die = distribution" works. The Expedition outer loop (spatial sampling map) is Cycle 3.

---

## Recommended Next Cycle (Cycle 2) — unchanged from pass-14

- `src/config/featureFlags.ts` → `EXPEDITION_MODE: false`
- Kuvia single-screen MVP: 1 die, 6 blank faces, 4 engraving types, 5 contracts
- SVG live histogram + sampling-distribution side panel
- Hebrew RTL single screen, 5-minute run
- Vitest tests: die distribution math, p-value shading, SE calc
- `npm run build` must pass
- No Kit Forge UI yet; no Hebrew copy yet (English placeholder); no city-builder changes

---

## Vision Alignment Check

| Rule | Compliant? | Citation |
|---|---|---|
| What we are: stats-first via game | ✓ | Die = distribution; every mechanic IS a stats concept |
| Gameplay ≠ Gamification | ✓ | Shards are consequences of gameplay decisions, not cosmetic rewards |
| Design rule: Hebrew-first | ✓ | Exploration only this cycle; game name קוּבִּיָּה; Cycle 2 adds Hebrew copy |
| Design rule: dark UI | ✓ | Workshop theme → dark surfaces; glow in `--gold` only |
| Color palette: only locked tokens (NO new hexes) | ✓ | Zero hex values introduced; planned: `--bg` `--bg-2` `--card` `--border` `--fg` `--mute` `--gold` `--teal` `--amber` `--red` |
| UI source cited | ✓ | Linear.app (dark UI density + micro-interactions on die reveal); Apple HIG (44pt die face tap targets) |
| UI anti-pattern avoided | ✓ | Single-screen run; bottom-sheet for contract details; no hamburger; no modal-on-modal |
| Tech invariant: Tailwind only | ✓ | Exploration only; Cycle 2 spec calls for Tailwind + SVG only |
| Tech invariant: Zustand only | ✓ | `kuviaStore.ts` Zustand slice planned for Cycle 2 |
| Tone rule: encouragement | ✓ | Failure → retrospective + free re-engrave; "כדאי לנסות שוב" not "נכשלת" |
| Mobile-first (thumb-reach + 44pt targets) | ✓ | Single-screen; 44pt die face taps; bottom-sheet contracts |
| Out of scope: stays in scope | ✓ | No multiplayer, no teacher dashboard, intro stats only |

**NotebookLM consulted:** No — MCP not available. Skipped per cycle rules.  
**Board-game inspiration:** *Dice Forge* (Régis Bonnessée, Libellud 2017) — face-replacement PMF engine; *Seize the Bean* [BGG/211364] — mastery-thickens-toolkit + workshop theme.  
**Mobile-game inspiration:** *Threes!* (Sirvo 2014) — every tap mutates persistent board state; instant feedback; one-more-turn compulsion without a single reward animation.  
**Decision interval:** ~20 seconds.  
**Statistical concept used in decision:** Mean, variance, probability, sampling distribution, hypothesis testing, CI — each mapped to a specific mechanic.

---

*Proactive Cycle 01, Pass 15. Model chain: Sonnet 4.6 (orchestrator + synthesis) → Opus 4.7 (gameplay oracle, one call per cycle). 2026-05-25 05:04 UTC.*
