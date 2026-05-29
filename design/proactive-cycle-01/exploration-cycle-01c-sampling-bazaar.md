# Proactive Cycle 01c — Sampling Bazaar Exploration

**Date:** 2026-05-22T05:02 UTC  
**Branch:** proactive/exploration/games-design-space  
**Cycle type:** CYCLE 1 pass 3 (01c) — Exploration only (no code)  
**Model routing:** Haiku (VISION read + repo survey) → Opus 4.7 (gameplay-design decision) → Sonnet 4.6 (doc synthesis)  
**NotebookLM:** SKIPPED — MCP connector not available in this container. Used VISION.md catalogue + design judgment. Logged per hard rule.  
**Prior passes:** exploration.md (Cafe Forecaster #1, 28/30), exploration-20260522.md (Mutable Dice Forge #1)

---

## 8 Candidate Gameplay Loops

Scoring criteria (1–5 each, /25 total):
- **Decision Rhythm** — meaningful player choice every 15–30s
- **Wonder** — tap-hook, visual delight, curiosity pull
- **Engine** — early choices compound into later power
- **Stats Fit** — player *uses* the statistical concept, not just memorizes it
- **Decor Risk** — low = cosmetic rewards can't substitute for gameplay (5 = bulletproof against drift)

| # | Name | Decision Rhythm | Wonder | Engine | Stats Fit | Decor Risk | Total |
|---|------|:-:|:-:|:-:|:-:|:-:|:-:|
| 1 | **Sampling Bazaar** | 5 | 4 | 5 | 5 | 5 | **24** |
| 2 | Confidence Cartographer | 4 | 5 | 4 | 5 | 5 | **23** |
| 3 | Distribution Forge | 5 | 4 | 5 | 4 | 4 | **22** |
| 4 | Hypothesis Heist | 4 | 4 | 4 | 5 | 4 | **21** |
| 5 | Correlation Canals | 4 | 5 | 4 | 4 | 4 | **21** |
| 6 | Bayesian Bakery | 3 | 3 | 5 | 5 | 4 | **20** |
| 7 | P-Value Push-Your-Luck | 5 | 4 | 3 | 4 | 3 | **19** |
| 8 | Variance Vineyard | 4 | 3 | 4 | 4 | 3 | **18** |

### Candidate descriptions (1–2 sentences each)

**1. Sampling Bazaar** — A bag-building market where each district you build is a population, and every turn you must draw a sample (size N you choose) to estimate its true mean before bidding on contracts. Bigger samples cost gold but tighten your estimate; underestimating variance loses you the bid, overestimating wastes resources.

**2. Confidence Cartographer** *(Novel: spatial-puzzle × interval estimation)* — A spatial-puzzle map where you place "confidence interval bands" over fog-of-war territory; wider bands guarantee coverage but earn fewer settlement points, narrow bands score huge if the hidden value lands inside.

**3. Distribution Forge** — Dice-forge engine builder where you literally re-skin die faces over time to shape your output distribution; contracts demand specific means, variances, or skewness, and you must reshape your dice to fit them.

**4. Hypothesis Heist** — A worker-placement caper where each "job" is a null hypothesis about a rival guild; you allocate evidence-gathering workers (sample size) before deciding to reject or fail-to-reject, with Type I errors triggering police raids and Type II errors letting rivals escape.

**5. Correlation Canals** *(Novel: network-building × correlation/causation)* — Build a canal network between resource nodes; the "flow strength" of each canal equals the correlation coefficient you estimate from a tiny scatter sample, and miscalibrating spurious vs real correlations floods your city.

**6. Bayesian Bakery** — Run-your-own-place loop where each morning you set a prior on customer demand, gather noon evidence, update to a posterior, and re-stock. Pure Bayes engine but slow rhythm, and Bayesian inference is out of intro-stats scope per VISION.md.

**7. P-Value Push-Your-Luck** — Quacks-style bag draw where you keep drawing data points until you "call significance"; bust if your alpha inflates past 0.05. Fun but pedagogically thin: over-rewards stopping rules without teaching *why* p < 0.05 matters.

**8. Variance Vineyard** — Viticulture-style worker placement where harvest yields are random draws; you invest in "variance reduction" workers (replication, stratification). High risk of becoming a slot machine without strong stats anchoring.

---

## Top-3 Ranking

### #1 — Sampling Bazaar (24/25)

Wins because the statistical concept (sampling distribution, standard error, n-vs-precision tradeoff) **is literally the decision**, not a wrapper around it. You cannot skip the stats and still play — the bid math collapses without estimating SE. Engine-building emerges naturally as districts compound into larger populations and the player unlocks stratification/cluster sampling tools.

This satisfies VISION.md's hardest requirement verbatim: *"Decision must use the statistical concept being learned, not adjacent to it."*

Board-game mechanic: **Wingspan** (engine-building compounds) + **Quacks of Quedlinburg** (bag-draw randomness per sample draw).  
Mobile-game: **Reigns** (drag-slider with live consequence preview) + **Mini Metro** (proportional calibration reward).

### #2 — Confidence Cartographer (23/25)

Spatial metaphor for CI width is genuinely novel — the player *sees* their uncertainty as a shape on the map. Slightly lower decision rhythm (20–30s vs 15s) because placement is deliberate. Strong secondary candidate for Cycle 2B if Bazaar stalls on implementation.

Board-game: **Patchwork** (spatial tile placement under budget).  
Mobile-game: **Mini Metro** (network coverage under uncertainty).

### #3 — Distribution Forge (22/25)

Strongest pure engine-builder; the wonder of watching a custom distribution emerge over 20 turns is high. Drops one point on stats-fit because shape-matching can degrade into pattern-matching without forcing the player to reason about moments (mean, variance, skewness as separate levers). Viable for a later cycle on probability distributions.

Board-game: **Dice Forge** (mutable die faces = mutable distribution).  
Mobile-game: **Threes** (compounding small decisions into a large emergent shape).

---

## Detailed Spec: Sampling Bazaar

### Concept

You are a Tel Aviv merchant building a bazaar of districts — coffee, textiles, spice, tech. Each district is secretly a *population* with a true mean price and true variance you never see directly. Every ~25 seconds the city posts a contract ("deliver goods at avg price ≤ 14₪, payout: 30 gold"). To bid, you must first *sample* your district: pay gold to draw n shoppers, see their prices, then commit a bid price. Win bids → expand the bazaar → unlock better sampling tools (stratification, paired sampling, bootstrap). The bazaar grows into a city; your sampling toolkit grows into a research lab.

### Statistical concept per decision type

| Decision | Statistical concept forced |
|---|---|
| How many shoppers to draw (n slider)? | **Standard error of the mean**: SE = σ/√n. Each extra draw costs 1 gold; the player feels diminishing returns because SE halves only when n quadruples. |
| Which district to bid on? | **Sampling distribution + point estimation.** Compare x̄ ± SE across 3 visible districts. |
| How aggressive a bid price? | **Confidence intervals.** Tight bid (x̄ + 0.5·SE) scores more but busts often; safe bid (x̄ + 2·SE) scores less but reliable. Player picks k explicitly. |
| Which sampling tool to unlock next? | **Stratification vs SRS vs cluster.** Heterogeneous district → stratify (lower SE for same n); homogeneous but spread → cluster cheaper. |

### Decision tree (one turn ≈ 25s)

```
1. SEE [~2s]
   Contract card flips: "Spice district, deliver ≤ X₪, payout Y gold, deadline 25s."
   Three district tiles show last-round x̄ and sample history.

2. CHOOSE A [~5s]
   Pick a district to investigate.
   Consequence: locks you out of other contracts this turn.

3. CHOOSE B [~8s]
   Buy a sample. Slider: n = 1…30, cost = n gold.
   Live readout shows predicted SE shrinking as slider moves.
   Consequence: spend gold now vs. save for later contracts.

4. SEE [~2s]
   n data points animate into a dotplot above the district.
   x̄ renders in --gold, SE bar renders in --teal.

5. CHOOSE C [~8s]
   Set bid price using a slider snapped to x̄ ± k·SE.
   k options visible: 0.5, 1.0, 1.5, 2.0 (= coverage tradeoff).
   Consequence: bid resolves against the *true* mean (hidden draw from population).
   Win → gold + district level-up. Lose → gold burned, contract goes to AI rival.

6. SEE [~2s]
   Result animation. If bid price bracketed true mean, district tile
   gains "calibrated" stamp (+1 future sample efficiency). Engine compounds.
```

### Prototype scope — smallest playable (one screen, 3-minute session)

**Layout (RTL, mobile-first, thumb zone at bottom):**
- Top strip: 3 district tiles (`--card` background, `--gold` x̄ marker, `--teal` SE bar)
- Center: 1 contract card (`--bg-2`, `--amber` timer border)
- Bottom sheet: n slider → dotplot animation → bid k-slider → Bid button (`--teal`)
- Corner: gold counter + 3-minute countdown

**Session shape:** 3 minutes = 6–8 contracts. Win: reach 100 gold before clock. Lose: bankrupt.

**Mechanics in prototype only:**
- Simple random sample (SRS) — no stratification/bootstrap yet
- 3 fixed districts with randomized population μ and σ per session
- 1 AI rival that always bids at x̄ (median strategy — player must beat it)

**Out of prototype scope (unlock tiers v2+):**
- Stratification tool, cluster sampling, bootstrap CI
- District upgrades, multiple AI rivals with asymmetric strategies

### Why it cannot become decoration

The bid resolution is a *real draw from the hidden population distribution* compared against the player's bid. If the player ignores SE and always picks n=1, their bids miss the true mean ~70% of the time — bankrupt within 90 seconds. If they always pick n=30, they run out of gold buying samples and cannot bid. The only winning strategy is to compute the SE tradeoff and price the bid relative to it. The gold economy makes the statistical reasoning the resource management itself. Remove the cosmetic district art: game still works. Remove the SE math: game is unplayable.

### Board-game mechanic borrowed

- **Wingspan** (Stonemaier Games, 2019) — engine-building: each district powers up and unlocks capabilities that compound across turns.
- **Quacks of Quedlinburg** (Schmidt Spiele, 2018) — bag-draw randomness: each sample is a literal draw from the district's "bag" (population), creating push-your-luck tension over n.

### Mobile-game feedback pattern borrowed

- **Reigns** (Devolver Digital, 2016) — drag-the-slider with live consequence preview: as you move the n slider, SE updates in real time before you commit.
- **Mini Metro** (Dinosaur Polo Club, 2015) — proportional visual reward: the coin shower on contract resolution is sized proportionally to *how close your bid was to the true mean*, rewarding calibration, not luck.

---

## Vision Alignment Check

| Rule | Compliant? | Citation |
|---|---|---|
| What we are: stats-first via game | ✓ | SE + CI drive every bid decision |
| Gameplay ≠ Gamification | ✓ | Game collapses without stats reasoning; gold reward ≠ cosmetic |
| Design rule: Hebrew-first | ✓ | All UI copy in Hebrew RTL (prototype spec) |
| Design rule: dark UI | ✓ | `--bg #0e0f12` family throughout |
| Color palette: only locked tokens used (NO new hexes) | ✓ | `--card`, `--gold`, `--teal`, `--amber`, `--red`, `--bg-2`, `--mute` — no new hex |
| UI source cited | ✓ | Reigns slider feedback; Mini Metro calibration reward; Duolingo path-tree for unlock tiers |
| UI anti-pattern avoided | ✓ | Bottom-sheet (not modal) for bid UI; no hamburger; no toast for bid result (inline tile state update) |
| Tech invariant: Tailwind only | ✓ (N/A cycle 1) | Exploration only |
| Tech invariant: Zustand only | ✓ (N/A cycle 1) | Exploration only |
| Tone rule: encouragement | ✓ | Bust state (Hebrew): "SE רחב יותר היה שומר עליך — נסה דגימה גדולה יותר" |
| Mobile-first (thumb-reach + 44pt targets) | ✓ | Bottom-sheet sliders in thumb zone; 44pt min hit targets |
| Out of scope: stays in scope | ✓ | No Bayesian inference, no multiplayer, no teacher dashboard. Topics: SE + CI (intro stats) |

**NotebookLM consulted:** no — MCP connector not available in container. SKIPPED per hard rule.  
**Board-game inspiration:** Wingspan (engine-building) + Quacks of Quedlinburg (bag-draw push-your-luck).  
**Mobile-game inspiration:** Reigns (live-feedback slider) + Mini Metro (proportional calibration reward).  
**Decision interval:** every ~25 seconds.  
**Statistical concept used in decision:** Standard error of the mean (n choice) + confidence intervals (bid price choice).

---

## Open Questions for Barak

1. **Population setup:** Randomized μ/σ per session (replayability) or fixed and discoverable over days (progressive mastery à la Anki spacing)?
2. **n cost model:** Gold-per-draw flat vs. a "sampling budget" that resets per round to prevent bankrupt-from-over-sampling edge case?
3. **AI rival:** Static median-bid rival (beatable quickly) or epsilon-greedy adaptive rival to maintain pressure?
4. **Hebrew math terms:** "שגיאת תקן" (standard error) — scaffold with "how spread out my guess is" language first for primary audience?
