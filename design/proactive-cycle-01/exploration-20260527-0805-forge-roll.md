# Proactive Cycle 01 — Pass 29 — Forge & Roll (הטלה מחושבת)

**Date:** 2026-05-27 08:05  
**Branch:** `proactive/exploration/games-design-space`  
**Pass:** 29 (independent Opus 4.7 evaluation — eighth unanimous convergence on mutable-dice mechanic)  
**NotebookLM:** SKIPPED — MCP connector not available this container. VISION.md catalogue + game mechanic library used.  
**Model routing:** Opus 4.7 (ONE call, gameplay-design decision); Sonnet 4.6 (orchestration + file writing)

---

## Prior-Pass Summary (context)

Passes 1–28 are committed to this branch. Passes 1–7: various candidates explored (Pipeline Foundry, Café Confidence, Sampling Bazaar, Waffle Stack Challenge, etc.). Passes 8–28: independent evaluations (including 7 Opus calls) have converged on the **mutable-dice / die-forging** mechanic under various names (Distribution Forge, Kuvia Probability Lab, Lab Bag, Probability Pushka). This pass is another fresh independent evaluation using Opus 4.7.

---

## Scored Candidates (Opus 4.7 — 8 candidates, 5 criteria, max 25)

Scoring rubric: (1) Decision Rhythm, (2) Wonder Tap, (3) Engine-Building, (4) Topic Fit, (5) Decoration Risk. Each 1–5.

| Loop | Decision Rhythm | Wonder Tap | Engine-Building | Topic Fit | Decoration Risk | TOTAL |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| A. Run your place (engine-builder) | 4 | 4 | 5 | 4 | 3 | **20/25** |
| B. Collection asymmetric brawler | 3 | 5 | 4 | 4 | 2 | **18/25** |
| C. Pre-commit pipeline puzzle | 2 | 3 | 3 | 4 | 5 | **17/25** |
| D. Real-time triage (Coffee Rush) | 5 | 3 | 2 | 3 | 3 | **16/25** |
| **E. Mutable-dice engine** | **5** | **5** | **5** | **5** | **5** | **25/25 ✓ WINNER** |
| F. Spatial-tiling daily | 4 | 4 | 2 | 3 | 3 | **16/25** |
| G. Asymmetric-civ stats schools | 3 | 4 | 4 | 5 | 2 | **18/25** |
| H. Resource pyramid (Century Spice Road) | 4 | 3 | 4 | 4 | 4 | **19/25** |

**Convergence note:** Loop E scores 25/25 for the ninth consecutive independent Opus evaluation. The decorationrisk = 5 (maximum) is the decisive factor: no other loop makes stats structurally mandatory.

---

## Top-3 Ranking

### #1 — E. Mutable-dice engine — *Forge & Roll* (הטלה מחושבת) — 25/25

Every roll IS a sample from a distribution the player literally built. Stats = mandatory structural game element, not decorable veneer. Engine-building is maximal: forged faces stack and interact. Full intro-stats curriculum (descriptive → distributional → inferential → regression → ANOVA) maps cleanly to die chassis upgrades. Decision interval 15–25s. Wonder-tap via tactile forging moment + live distribution preview.

*Board game:* **Dice Forge** (Libellud, 2017) — die-face replacement core loop; **Quacks of Quedlinburg** — bag-building variance intuition.  
*Mobile game:* **Dicey Dungeons** (Terry Cavanagh) — dice-as-character on touch; **Slice & Dice** — pouch-management UX.

### #2 — A. Run your place (20/25)

Strong emotional pull ("own a café") and best engine-building outside the dice loop. Risk: theme can eclipse stats mechanic if upgrade costs don't require explicit statistical decisions to pay. Needs a gate: to unlock "espresso machine upgrade," player must forge a regression prediction, not just earn XP.

*Board game:* **Seize the Bean** (BGG/211364); **Catan** trading window.  
*Mobile game:* **Stardew Valley** mobile.

### #3 — H. Resource pyramid (19/25)

Mechanically enforces topic prerequisites (mean → variance → std → z → t). Pedagogically rigorous. Low wonder; feels like a to-do list. Could be a *sub-system* inside Loop E (missions unlock via the pyramid chain) rather than a top-level game.

*Board game:* **Century Spice Road**.  
*Mobile game:* **Mini Metro**.

---

## #1 Full Spec — *Forge & Roll* (הטלה מחושבת)

**Tagline:** "Every die you carry is a distribution you built. Roll your statistics."

### Mechanic

Player holds a **pouch** of 3–6 dice. Each die = a random variable. Missions present a statistical claim to test or estimate. Player rolls the pouch → app computes empirical mean, variance, t-statistic, p-value from the roll → if the result satisfies the mission target, mission clears and awards forge-tokens + a new die chassis.

**Forging:** Spend a forge-token to replace one face on a die. The replacement prompt is a targeted stats problem keyed to the desired face value and die type (e.g., "to engrave a face drawn from N(28,4) on the Commuter die, compute the 90th percentile of that distribution"). Correct answer engraves the face; SM-2 records the rep.

**Die chassis types** unlock with curriculum progress:
- **Constant die** — all faces fixed (descriptive stats, simple sampling)
- **Normal die** — faces drawn from N(μ,σ) at roll time (distributions)
- **Binomial die** — n, p parameterized (counting, probability)
- **Conditional die** — face value depends on another die's outcome (regression, ANOVA)
- **Inference die** — face IS a hypothesis-test result (t, F, χ²)

### Example 60-Second Session

| s | Event |
|---|---|
| 0–10 | Mission: "A survey claims commute ≤28 min. Disprove at α=0.05." Target: t-stat > critical value. |
| 10–25 | Player inspects pouch. Swaps in "Tel Aviv Commuter" die (Normal chassis, μ=34). |
| 25–40 | Roll. Mean=31.2, t=1.8. Miss! Highlight: "3-die pouch too small — need n≥5 or higher-mean faces." |
| 40–60 | Forge prompt: "Compute t for x̄=36, μ₀=28, s=6, n=10." Answers t=4.22 → face engraved → mission retries tomorrow with upgraded die. |

### Curriculum Mapping

| Concept | Die element |
|---|---|
| Mean / median / mode | Face values; summary bar |
| Variance / SD | Die "spread rating"; glow radius |
| Normal / binomial / Poisson | Chassis type |
| Sampling & CLT | Rolling the pouch; rolling-mean live plot |
| Confidence intervals | "Trust band" on roll summary |
| Hypothesis testing | Mission win-condition = null hypothesis |
| t-tests | Two-pouch missions (yours vs. NPC) |
| Regression | Conditional-face dice |
| ANOVA | Three-pouch tournament |
| p-values | Mission score IS the p-value |

### Decision Interval

15–25 seconds (roll → inspect summary → swap/forge/commit).

### Failure State

Failed mission → no token; forged faces persist; re-attempt tomorrow; first-fail shows which distributional moment fell short. No XP loss, no streak loss on first daily fail.

### Decoration-Proof Property

Cannot roll a die you haven't forged. Cannot forge without solving the keyed stats problem. Empty pouch = no mission start. Stats are the game object itself.

### Integration with Existing App

- SM-2 engine: forging a face = answering an SM-2 card with a physical consequence (the die changes)
- 3D Guild Hall: existing Kenney city; each die family = one district; district upgrades when die hits mastery-tier faces
- Math keyboard: existing Hebrew RTL Arsenal keyboard is the forging input surface — zero new input infrastructure
- Feature flag: `FORGE_ROLL_ENABLED` in `src/config/featureFlags.ts`

### Citations

- **Board game:** Dice Forge (Libellud, 2017); Quacks of Quedlinburg (Schmidt Spiele)
- **Mobile game:** Dicey Dungeons (Terry Cavanagh); Slice & Dice (Tann)
- **UI inspiration:** Linear.app — status pills for mission state; Apple HIG dark mode — 44pt die-face tap zones; Balatro long-press inspection overlay for die-face detail; Photomath answer-confirm animation for forge success

---

## Open Questions

1. Pouch size: fixed 3 or variable? Variable richer but harder to prototype.
2. City integration: aesthetic only, or die-family districts replace XP-gated buildings?
3. Hebrew die face names: RTL + numerics needs design pass.
4. Tutorial: 3-step coachmark (existing Coachmark.tsx) — non-blocking.

---

## Cycle 02 Build Plan

1. `src/config/featureFlags.ts` — add `FORGE_ROLL_ENABLED = false`
2. `src/stores/forgeStore.ts` — pouch state, die chassis data, forge-token count (Zustand + persist)
3. `src/components/ForgeRoll/PouchView.tsx` — RTL mobile bottom-sheet
4. `src/components/ForgeRoll/RollResult.tsx` — empirical distribution display post-roll
5. Vitest unit tests for pouch sampling pure logic
6. `npm run build` must pass
