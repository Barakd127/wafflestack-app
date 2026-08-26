# WaffleStack — Proactive Cycle 01: Gameplay Design Space Exploration

**Date:** 2026-05-27  
**Cycle type:** Exploration only (no code)  
**Branch:** `proactive/exploration/games-design-space`  
**Agent model (design decision):** Claude Opus 4.7  
**NotebookLM:** SKIPPED — MCP connector not available in this container. Design judgment from VISION.md catalogue + agent knowledge.

---

## Method

Eight gameplay candidates were generated from VISION.md's starter menu and mechanic catalogue. Each was scored by Opus 4.7 on five weighted dimensions derived directly from the VISION.md gameplay criteria:

| Dimension | Weight | Rationale |
|---|---|---|
| Decision rhythm | ×2 | Target: one meaningful choice every 15–30s |
| Concept-in-decision | ×3 | Must USE stats, not just recall it |
| Engine potential | ×2 | Early choices must compound |
| Wonder tap | ×1 | Emotional pull / curiosity hook |
| Decoration resistance | ×2 | Inverted: how hard is it to ruin with confetti? |

**Max score: 50**

---

## Scoring Matrix

| # | Candidate | Rhythm ×2 | Concept ×3 | Engine ×2 | Wonder ×1 | Decor-Resist ×2 | **Total** |
|---|---|---|---|---|---|---|---|
| A | Mutable-dice (Dice Forge) | 4→8 | 4→12 | 5→10 | 5→5 | 4→8 | **43** |
| B | Pre-commit pipeline (Mechs vs Minions) | 2→4 | 5→15 | 3→6 | 3→3 | 5→10 | **38** |
| C | Run-a-place builder (Seize the Bean) | 3→6 | 3→9 | 5→10 | 4→4 | 2→4 | **33** |
| D | Push-your-luck sampling (Quacks) | 5→10 | 5→15 | 3→6 | 5→5 | 4→8 | **44** |
| E | Pickup-and-deliver prereqs (Century Spice Road) | 2→4 | 2→6 | 4→8 | 2→2 | 2→4 | **24** |
| F | Asymmetric factions (Arctic Scavengers + Cry Havoc) | 2→4 | 4→12 | 4→8 | 4→4 | 4→8 | **36** |
| G | Real-time triage (Coffee Rush) | 5→10 | 3→9 | 2→4 | 3→3 | 2→4 | **30** |
| H | Spatial-tiling daily (Patchwork × Wordle) | 3→6 | 3→9 | 3→6 | 4→4 | 4→8 | **33** |

---

## Full Ranking

1. **D — Push-your-luck sampling — 44** ← #1 selected
2. **A — Mutable-dice engine — 43**
3. **B — Pre-commit pipeline — 38**
4. F — Asymmetric factions — 36
5. C — Run-a-place builder — 33
5. H — Spatial-tiling daily — 33
7. G — Real-time triage — 30
8. E — Pickup-and-deliver prereqs — 24

---

## Top-3 Justifications

### #1 — D: Push-your-luck sampling (44)

Sampling, bias, and inference ARE the intuition Israeli BA social-science students must internalize before any psychometric or survey course — and this loop makes "should I collect another participant?" the literal click, not a metaphor for it. Every other candidate teaches *around* stats; this one *is* stats, because the decision math (variance shrinking, bias risk, power) is identical to the cognitive math we want them to own.

### #2 — A: Mutable-dice engine (43)

Distributions are the second pillar of the intro syllabus, and choosing a die-face = choosing which random variable you bet on, which is exactly the mental motion of "what model fits this DGP?" It also has the highest engine score — every roll is a self-built distribution — and it's hardest to ruin with cosmetics because the die *is* the math.

### #3 — B: Pre-commit pipeline (38)

Strongest pure concept-in-decision score (5) because the player builds the actual analysis workflow, not a metaphor for it; but it loses on rhythm (long planning beats) and wonder. Best held in reserve as a Tier-2 mode unlocked after D establishes intuition.

---

## #1 Detailed Spec — "The Sampling Run"

*(Candidate D: Push-your-luck sampling)*

### Concept in one sentence

You are running a study. Draw participants one at a time from a bag — each costs budget and raises bias risk. Stop when your confidence interval is tight enough. Every click IS the statistical decision.

### Core loop — one turn narrated (~60–90 seconds)

1. **Brief (5s):** Hebrew card slides in from the right (RTL). Example: *"רוצים לדעת אם סטודנטים במכללה X תומכים ברפורמה. תקציב: 200 ש"ח. כל משתתף עולה זמן וכסף."* Target parameter shown (e.g., estimate support within ±5%).

2. **Bag reveal (2s):** A translucent bag at screen center. Tokens visibly bulge inside: green (valid respondent), yellow (noisy), red (biased / non-response), purple (rare high-leverage outlier).

3. **Draw decision (every 8–15s):** Player taps **"משוך"** (Draw). A token arcs out, lands on a running tray. The live mean, CI width, and bias indicator update beside the tray. The CI bar literally shrinks with each valid draw.

4. **Stop-or-continue (the core choice):** After each draw, player chooses **"עצור ושלח"** (Stop & Submit) or **"משוך שוב"** (Draw Again). Each additional draw costs budget AND increases the probability of a contaminating red token (non-linearly, à la Quacks' "explode at 8" mechanic).

5. **Resolve (5s):** On Stop, estimate is compared to a hidden true value. Score = precision × accuracy × budget remaining. On Bust (≥3 reds before stopping), the sample collapses.

6. **Reward (5s):** Player earns **Method Tokens** — small permanent bag upgrades applicable to future runs (e.g., "stratification ladle," "consent filter," "pilot study lens").

**Decision interval:** one stop/draw choice every 10–15 seconds. One full run every 60–120 seconds. 4–6 runs per session.

### Statistical concept used in each decision

| Decision moment | Statistical concept the player USES |
|---|---|
| Draw vs Stop | Standard error, CI width, sample-size–variance relationship |
| Which study scenario to enter | Sampling frame definition, population boundary |
| Which Method Token to buy between runs | Stratification, weighting, bias correction |
| Reading the live tray during run | Mean, variance, outlier identification, distribution shape |
| Bust → Diagnostic Card | Type I/II error, selection bias, non-response bias |

The player cannot brute-force. The CI bar gives honest real-time feedback. The only way to win consistently is to internalize *when* the marginal draw is worth the marginal bias risk — which IS frequentist inference.

### Engine-building (compounding)

Method Tokens persist across runs and modify the bag composition:

| Token | Effect | Stats concept unlocked |
|---|---|---|
| Stratification ladle | Split bag into two sub-bags, draw proportionally | Stratified sampling |
| Consent filter | Removes 1 red token/run but caps max sample | Opt-in bias tradeoffs |
| Pilot study lens | Peek at 3 tokens before committing | Pilot studies, pre-registration |
| Weighting spoon (advanced) | Post-hoc reweight draws | Bayesian updating, weighted regression |

By run 10, the player has a personalized "methodology kit." Early choices (precision vs. unbiasedness) shape which late-game studies they can even attempt — this is engine-building in the Dominion/Seize the Bean sense, mapped onto research design.

### Failure state + recovery

- **Bust (≥3 reds before stopping):** Run scores 0 points but awards a **Diagnostic Card** naming the specific bias type (e.g., *"Self-selection: students who answered were already politically active"*). Diagnostic Cards are tradeable for discounted Method Tokens — failure literally funds the cure.
- No session-level wall. Budget resets per session; only the single run is lost.
- Wrong answers on any stat question within the run show a one-sentence Hebrew explanation of *why*, not a formula dump.

### Visual / spatial representation

- **Center screen:** the bag (soft translucent SVG for MVP; R3F cloth physics as enhancement)
- **Right side (RTL: left for Hebrew layout):** live tray with running mean + CI bar that breathes and shrinks — the visual IS the math
- **Bottom:** budget meter + bust-risk gauge (green → amber → red as risk rises)
- **Top shelf:** owned Method Tokens, draggable into pre-run setup
- **Color usage (locked palette only):**
  - Green tokens → `--teal` (#10b981)
  - Red tokens → `--red` (#ef4444)
  - Yellow tokens → `--amber` (#f59e0b)
  - CI bar fill → `--blue` (#3b82f6)
  - Method Token glow → `--gold` (#FFD700)
  - All backgrounds → `--bg` / `--bg-2` / `--card`

### MVP scope

**Ship in cycle 2:**
- 1 bag composition (70% green, 20% yellow, 10% red)
- Stop/Draw loop with live mean + CI bar
- 3 Method Tokens (stratify, pilot, consent)
- 5 hand-authored Hebrew scenarios covering: political survey, medical study, classroom experiment, market research, social media analysis
- Bust → Diagnostic Card → 1 redemption path
- Feature-flagged behind `SAMPLING_RUN_ENABLED` in `src/config/featureFlags.ts`

**Cut for v0:**
- Bayesian weighting spoon (cycle 3+)
- Multiple simultaneous bags
- Leaderboard, XP bar, confetti — explicitly cut to avoid decoration trap
- 3D bag physics (upgrade from SVG only if user testing justifies R3F cost)
- Supabase persistence (blocked on provisioning)

### Citations

- **Board game:** *Quacks of Quedlinburg* (Bohm, 2018) — bag-builder + push-your-luck "explode" threshold. Borrowed: the *visible* rising risk and the post-bust "you still got something" rule (Diagnostic Cards mirror Quacks' ruby payoff on bust).
- **Board game 2:** *Seize the Bean* [BGG/211364] — persistent upgrades between rounds that change the composition of your available moves. Borrowed: Method Tokens as between-run permanent bag upgrades.
- **Mobile game:** *Balatro* — feedback pattern of "score builds visibly as you commit one more card," with snappy number-pop tied directly to the underlying math (not decorative). Borrowed: every draw triggers a value-update animation that *is* the calculation.
- **UI source:** *Linear* — dark, dense information hierarchy with one primary action per screen. Borrowed: single-action focus (Draw/Stop only), persistent metric rail, restraint in motion (no bounce/sparkle on stat updates — clean number transitions only).

### Why this wins for Israeli BA social-science students specifically

Their dominant downstream task is survey research and experimental design in psychology, sociology, education, and political science. The loop trains the exact judgment those courses assume but never teach: when is your N enough, and what kind of wrong is your sample? Every other candidate teaches stats-as-topic. This one teaches stats-as-decision — in Hebrew, on a phone, in 90-second bursts between classes.

---

## Candidates not selected — brief notes

| Candidate | Why not #1 |
|---|---|
| A: Mutable-dice | Excellent runner-up. Decision interval and wonder are strong, but the die-upgrade decision is one step removed from the stat concept (you choose an upgrade, then roll). Candidate for cycle 3 as a companion mode covering distributions. |
| B: Pre-commit pipeline | Highest concept-in-decision score but rhythm is poor (long planning phases). Best as an advanced mode unlocked after D. |
| C: Run-a-place builder | Strong engine potential but high decoration risk — "buy the upgrade" easily becomes "cosmetic shop." Needs much tighter design to survive. |
| E: Pickup-and-deliver | The mechanic (routing through prereqs) doesn't put stats in the decision — it just mirrors the stats curriculum map. Reject. |
| F: Asymmetric factions | Interesting for advanced learners; wrong for intro BA students who don't yet know what "frequentist" means. Cycle 5+ candidate. |
| G: Real-time triage | Decision rhythm is good but it's essentially a priority-queue game — the stat concept (type I/II error) is gestural, not mathematical. |
| H: Spatial-tiling | Good for daily engagement habit but concept-in-decision score is weak — placement doesn't USE stats, it *represents* it. |

---

*Cycle 2 will implement The Sampling Run behind a feature flag. Begin with the Stop/Draw loop + live CI bar + 5 Hebrew scenarios. No cosmetics.*
