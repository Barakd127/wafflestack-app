# WaffleStack Cycle 1 — Gameplay Exploration (Pass 11)

> Proactive cycle 01 · pass 11 · 2026-05-24 · Model: Opus 4.7 (design decision)
>
> NotebookLM: SKIPPED — MCP connector not available in this container.
> Design judgment drawn from VISION.md catalogue + board-game / mobile-game analysis below.
>
> Prior passes (01–10) are preserved in git history on this branch.

---

## Candidates

### C1: Distribution Forge
**Mechanic core:** Mutable-dice engine. Player crafts a personal "data die" face-by-face by completing micro-challenges. Each round, they roll their die against a target distribution to power actions (hire, build, predict).
**Stats fit:** Every face IS a data point. Mean/variance of your die literally determines what you can do. Re-shaping faces teaches sampling distributions viscerally.
**Decision:** "Replace face value 7 with value 12?" raises mean but inflates std dev — and your next contract requires σ < 3. Trade-off uses mean+variance directly.
**Board-game ref:** Dice Forge + Quacks of Quedlinburg
**Mobile-game ref:** Dicey Dungeons, Slice & Dice
**Decision interval:** ~20s (face-swap per turn, ~3 turns/min)
**Scores:** Decision rhythm 5 | Wonder tap 4 | Engine 5 | Topic fit 5 | Decoration risk 5 | Build complexity 3 | **Total: 27/30**

---

### C2: Café Confidence (Coffee Rush + CI)
**Mechanic core:** Real-time triage. NPCs arrive with fuzzy orders ("something sweet-ish, ~15₪"). Player picks a confidence interval width before serving — narrow = big tip if right, wide = safe but small tip. Timer pressure.
**Stats fit:** CI width, point estimates, sample size (more questions to customer = narrower CI but costs time).
**Decision:** Pick CI width and serve, every ~12s.
**Board-game ref:** Coffee Rush, Bohnanza
**Mobile-game ref:** Diner Dash, Good Pizza Great Pizza
**Decision interval:** ~12s
**Scores:** Decision rhythm 5 | Wonder tap 4 | Engine 2 | Topic fit 3 | Decoration risk 3 | Build complexity 4 | **Total: 21/30**

---

### C3: Hypothesis Heist
**Mechanic core:** Pre-commit puzzle. Player programs a sequence of stats steps (sample → test → decide) for a heist crew, then watches it execute. Mis-specified α or n? The job blows up visibly.
**Stats fit:** Hypothesis testing as a literal plan-and-execute. Type I/II errors are guards tripping or loot missed.
**Decision:** Choose test, α, sample size before the run.
**Board-game ref:** Mechs vs Minions, Robo Rally
**Mobile-game ref:** Human Resource Machine, while True: learn()
**Decision interval:** ~25s during planning; spectator during execution
**Scores:** Decision rhythm 3 | Wonder tap 5 | Engine 3 | Topic fit 4 | Decoration risk 4 | Build complexity 2 | **Total: 21/30**

---

### C4: Regression Observatory
**Mechanic core:** Collect creature sightings (childlike wonder). Each species has hidden trait correlations. Player fits regression lines on a 2D scatter to predict where the next rare creature appears, then taps that spot on a map.
**Stats fit:** Regression, residuals, R², outliers (legendary creatures are outliers!).
**Decision:** Adjust slope/intercept handle, commit prediction.
**Board-game ref:** Wingspan, Cascadia
**Mobile-game ref:** Pokémon GO, Alba: A Wildlife Adventure
**Decision interval:** ~30s
**Scores:** Decision rhythm 3 | Wonder tap 5 | Engine 4 | Topic fit 3 | Decoration risk 3 | Build complexity 3 | **Total: 21/30**

---

### C5: Sampling Bag (Quacks-style)
**Mechanic core:** Push-your-luck. Bag of chips = your population. Draw chips; build a potion; stop before σ-of-draws exceeds a "bust" line. Buy new chips to reshape the population.
**Stats fit:** Sampling distributions, stopping rules, variance, CLT (as bag grows, draws stabilize).
**Decision:** Draw again or stop, every ~8s.
**Board-game ref:** Quacks of Quedlinburg
**Mobile-game ref:** Luck Be a Landlord, Balatro
**Decision interval:** ~8s
**Scores:** Decision rhythm 5 | Wonder tap 4 | Engine 5 | Topic fit 4 | Decoration risk 4 | Build complexity 4 | **Total: 26/30**

---

### C6: Stat-School Drafts (Asymmetric Factions)
**Mechanic core:** Pick a school (Frequentist / Bayesian / Nonparametric). Each has unique cards and win paths. Draft cards round-by-round; build a tableau that scores via your school's rules.
**Stats fit:** Same data, different inferential machinery — teaches WHY methods differ.
**Decision:** Card pick per round (~20s).
**Board-game ref:** 7 Wonders, Arctic Scavengers
**Mobile-game ref:** Slay the Spire, Marvel Snap
**Decision interval:** ~20s
**Scores:** Decision rhythm 4 | Wonder tap 3 | Engine 5 | Topic fit 4 | Decoration risk 4 | Build complexity 2 | **Total: 22/30**

---

### C7: Patchwork Stat-Tiles
**Mechanic core:** Spatial tiling on a 9×9 city grid. Each tile is a "statistical district" (a histogram, a CI bar, a regression chip). Tiles must satisfy adjacency rules drawn from stats (e.g., a "high-variance" tile next to "small-n" tile penalizes).
**Stats fit:** Variance, sample size effects, multicollinearity (overlapping tiles).
**Decision:** Where to place the offered tile, every ~25s.
**Board-game ref:** Patchwork, Cascadia
**Mobile-game ref:** Dorfromantik, Mini Metro
**Decision interval:** ~25s
**Scores:** Decision rhythm 4 | Wonder tap 4 | Engine 4 | Topic fit 3 | Decoration risk 3 | Build complexity 4 | **Total: 22/30**

---

### C8: Vineyard Variance
**Mechanic core:** Engine-builder. Plant vine plots; each plot has a yield distribution. Choose where to sample (which plots, how many), then decide harvest timing using CI on expected yield.
**Stats fit:** Sampling, CI, hypothesis (is this vintage better than last year?), regression (sun hours → yield).
**Decision:** Sample plot / commit harvest, every ~20s.
**Board-game ref:** Viticulture, Wingspan
**Mobile-game ref:** Stardew Valley, Hay Day
**Decision interval:** ~20s
**Scores:** Decision rhythm 4 | Wonder tap 4 | Engine 5 | Topic fit 5 | Decoration risk 3 | Build complexity 3 | **Total: 24/30**

---

## Top-3 Ranking

| Rank | Candidate | Score | Why |
|---|---|---|---|
| 1 | C1 Distribution Forge | 27/30 | The die IS the lesson. Stats concepts cannot be decorated away because rolling/shaping the die is the only verb. Hits every topic, compounds beautifully. |
| 2 | C5 Sampling Bag | 26/30 | Quacks-proven loop; pure tension every 8s. Slightly narrower topic range (sampling-centric) keeps it #2. |
| 3 | C8 Vineyard Variance | 24/30 | Strongest "run your own place" pull, full topic coverage, but heavier build and decision rhythm sags between harvests. |

---

## #1 Detailed Spec: Distribution Forge

### Concept
You are a forger crafting a single magical die — your **data die** — face by face. Each face is a number; the die's mean, variance, and shape determine which contracts (mini-missions) you can complete. To upgrade a face, you must answer a stats challenge whose difficulty matches the change's statistical impact. The world (a small Hebrew-mythic workshop town) unlocks shops, customers, and rivals as your die evolves.

### Core Loop (step-by-step)
1. **Contract offered (~2s):** "Deliver a roll between 14–18 with ≥70% probability." Three contracts visible; player picks one.
2. **Inspect your die (~5s):** See current 6 (later: 8, 12, 20) faces, with live mean/σ/histogram beside it.
3. **Forge decision (~15–25s):** Tap a face to replace. Replacement options are 3 numbers, each with a Hebrew micro-question gating it ("מהו החציון של 3,7,7,9,12?"). Correct answer = face changes.
4. **Roll (~3s):** Animated die roll. Outcome resolves contract.
5. **Reward / setback:** Win → coins + a "blessed face" (rare value); lose → contract goes to rival; mean drifts (informative failure: the die literally shows what went wrong).
6. **Branch (~5s):** Choose next district to visit (each district = topic: Mean Square, Variance Vault, CI Cathedral, Regression Road). Player picks what to learn.

Decision every ~20s, sometimes every 8s in forge bursts.

### Statistical Concept Mapping

| Topic | Gameplay mechanic |
|---|---|
| Mean | Die's expected value gates contracts; faces shown as a live histogram |
| Std dev | "Spread" stat — wide dies fail narrow-window contracts |
| CI | Pre-roll, player draws a CI band on the outcome; tight band = bonus |
| Hypothesis test | Rival challenges: "My die's mean > yours." Pick α, sample size, accept/reject. |
| Regression | Predict tomorrow's contract reward from today's die stats — fit line on past rolls. |
| Sampling | Practice-roll N times before committing; N costs coins (sample-size trade-off). |
| Distributions | Unlock die shapes (d6 uniform, d12 skewed, d20 normal-ish). |
| SM-2 review | Faces "rust" over time; refresh by re-answering the gating question. |

### Screen Layout (mobile-first, RTL)
- **Top bar (RTL):** Coins right · District name center · XP left.
- **Center:** Large 3D die (reuses R3F scene) rotating, tappable faces. Below: live mini-histogram + mean/σ readout in Hebrew.
- **Right rail (RTL primary):** Active contract card with target distribution shaded in `--teal` / `--amber`.
- **Bottom sheet:** Forge button (גדול, `--gold`). Tapping a face slides up a bottom sheet with 3 candidate numbers + Hebrew micro-question (avoids modal-on-modal anti-pattern; bottom-sheet is thumb-reach).
- **Map screen:** Town map with 4–6 district nodes; tap to travel (path-tree, not linear list).

### State Model (Zustand)

```ts
interface DieFace { value: number; freshness: number /* ms, SM-2 hook */ }

interface DistributionForgeState {
  die: { faces: DieFace[]; shape: 'd6' | 'd8' | 'd12' | 'd20' }
  derivedStats: { mean: number; sd: number; skew: number } // memoized
  coins: number
  xpByTopic: Record<TopicId, number>
  activeContract: Contract | null
  contractQueue: Contract[]
  currentDistrict: DistrictId
  unlockedDistricts: DistrictId[]
  rollHistory: Array<{ faceValue: number; contractId: string; ts: number }>
  rivals: Rival[]
  blessedFaces: number[] // rare face inventory
}
```

### Open Questions
1. Do players grasp that mean/σ is a property of *their die* (population) vs the rolls (sample)? Needs onboarding playtest.
2. Is ~20s/decision too slow for a mobile session? Maybe forge bursts should chain 3 face-swaps per contract to create denser windows.
3. Should rivals be async real players (leaderboard) or NPCs? Async adds wonder but is expensive to build without Supabase ready.
4. How punishing should "rust" be — does forced review feel like Duolingo guilt or like caring for a beloved object?

### Why This Beats the Others
The die is the curriculum: you cannot reduce Distribution Forge to a quiz-with-skin because every game verb — forge, roll, contract, rival — reads off the die's actual statistics. It reuses the existing R3F scene (low incremental build cost), covers all intro topics in one object, and the "my die" attachment delivers the wonder that Dice Forge and Pokémon both tap: mastery becomes a thing you can hold, roll, and show off.

---

## Citations

**Board games consulted:**
- Dice Forge (Régis Bonnessée) — mutable die faces as the core loop
- Quacks of Quedlinburg — push-your-luck chip draw = sampling under uncertainty
- Mechs vs Minions — pre-commit programming puzzle for procedural topics
- Wingspan / Viticulture — engine-building with thematic resonance
- Arctic Scavengers — asymmetric tribe leader framing for "stats school" identity
- Patchwork — spatial tiling under budget = spatial representation of knowledge gaps
- Century Spice Road — resource pyramid = topic prerequisites
- Coffee Rush — real-time triage under timer pressure

**Mobile games consulted:**
- Dicey Dungeons / Slice & Dice — mutable-dice roguelikes
- Balatro / Luck Be a Landlord — push-your-luck loops with compound engine energy
- Mini Metro — minimal HUD + one-handed play (UI reference)
- Pokémon GO — spatial wonder + creature attachment

**UI sources:**
- Linear.app — dark-UI density, status pills for contract cards
- Apple HIG (iOS dark mode) — 44pt hit targets on all tappable faces and bottom-sheet CTA
- Duolingo — path-tree district map (but gameplay is deeper than quiz)

---

*Generated by Opus 4.7 on 2026-05-24 (pass 11). Cycle 1 is exploration-only — no code shipped.*
