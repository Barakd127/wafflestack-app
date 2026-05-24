# WaffleStack — Gameplay Exploration, Cycle 01

**Date:** 2026-05-24  
**Branch:** `proactive/exploration/20260524-0610`  
**Agent:** Proactive Vision Builder — Cycle 1 (exploration only, no code)  
**NotebookLM:** SKIPPED — MCP connector not available in this container. Design judgment used per VISION.md fallback rule.

---

## Scoring Rubric (each dimension 0–4, max 20)

| # | Dimension | What it measures |
|---|---|---|
| 1 | **Decision rhythm** | How tightly decisions are spaced and how meaningful each one is |
| 2 | **Wonder tap** | The pull that makes a player return (collection, mastery, narrative, zen flow) |
| 3 | **Engine-building** | Early choices compound into late-game power |
| 4 | **Stats-concept fit** | How directly the decision *mechanism* maps to a statistical concept |
| 5 | **Decoration risk** | Reverse-scored: 4 = low risk of becoming pure cosmetics |

---

## 8 Candidate Gameplay Loops

### Candidate 1: Mutable-Dice Engine — "WaffleDice"
*Dice Forge × Slay the Spire*

**Decision every ~18s:** Which die face to forge before a session; which die to roll against each scenario.  
**Stats concept USED:** Probability distributions — the player literally constructs a PMF and observes sampling variance against it.

| Dimension | Score | Justification |
|---|---|---|
| Decision rhythm | 4 | Roll-then-choose pulse is tight and meaningful |
| Wonder tap | 4 | "My dice are uniquely mine" — collection + mastery pull |
| Engine-building | 4 | Faces compound; early choices reshape the entire distribution |
| Stats-concept fit | 4 | The distribution IS the die — mechanism is the concept |
| Decoration risk | 3 | Risk that upgrades become cosmetic; mitigated by visible PMF histogram |
| **Total** | **19/20** | |

**Decoration-risk verdict:** Low — the die face IS the probability mass, not a sticker on top of it.  
**Board game borrowed from:** Dice Forge (face-replacement on dice = mutable PMF)  
**Mobile game borrowed from:** Slay the Spire (card/relic mutation compounding into a unique build)

---

### Candidate 2: Push-your-Luck Sampling
*Quacks of Quedlinburg × Threes*

**Decision every ~15s:** Draw another data token from the bag, or stop and commit to an inference?  
**Stats concept USED:** Sampling, confidence intervals, stopping rules, bias-variance tradeoff.

| Dimension | Score | Justification |
|---|---|---|
| Decision rhythm | 4 | Every single draw is a decision |
| Wonder tap | 3 | Push-your-luck dopamine is real but can feel repetitive across sessions |
| Engine-building | 3 | Bag composition evolves across runs; less within-session compounding |
| Stats-concept fit | 4 | CI width literally narrows as you draw — mechanism = concept |
| Decoration risk | 4 | Hard to fake; the math is the game |
| **Total** | **18/20** | |

**Decoration-risk verdict:** Very low.  
**Board game borrowed from:** Quacks of Quedlinburg (bag-draw + push-your-luck stopping rule)  
**Mobile game borrowed from:** Threes / 2048 (tight loop with escalating risk)

---

### Candidate 3: Run-your-Lab Engine
*Coffee Rush × Century Spice Road*

**Decision every ~20s:** Route incoming experiment to the right statistical method; choose which method-station to upgrade next.  
**Stats concept USED:** Test selection — matching data type to correct method under time pressure.

| Dimension | Score | Justification |
|---|---|---|
| Decision rhythm | 4 | Triage is naturally tight; queue pressure is constant |
| Wonder tap | 4 | "Run your own lab" hits the cool-place emotional pull hard |
| Engine-building | 4 | Lab grows; method upgrades compound |
| Stats-concept fit | 3 | Routing maps to test-selection, but the test itself becomes a black box |
| Decoration risk | 2 | Real risk: lab visuals swallow the stats — the 3D city failure mode |
| **Total** | **17/20** | |

**Decoration-risk verdict:** Medium-high — the "run your lab" theme can absorb the mechanism.  
**Board game borrowed from:** Viticulture (worker placement + resource routing)  
**Mobile game borrowed from:** Diner Dash (triage queue + upgrade loop)

---

### Candidate 4: Pre-commit Pipeline
*Mechs vs Minions × Two Dots*

**Decision every ~25s:** Slot a pipeline card (clean → transform → test → report) into a 5-step sequence; watch execution on a simulated dataset; iterate.  
**Stats concept USED:** Procedural reasoning — test selection, assumption-checking, order-of-operations.

| Dimension | Score | Justification |
|---|---|---|
| Decision rhythm | 3 | Decisions cluster in planning phase; long watch phase breaks pulse |
| Wonder tap | 3 | Programming-puzzle satisfaction is strong but niche |
| Engine-building | 2 | Each puzzle resets; cards unlock but no compounding state mid-session |
| Stats-concept fit | 4 | Pipeline order = analysis workflow — direct |
| Decoration risk | 3 | Could devolve into pattern-matching cards rather than understanding |
| **Total** | **15/20** | |

**Decoration-risk verdict:** Medium — risk of memorizing card sequences rather than understanding why.  
**Board game borrowed from:** Mechs vs Minions (pre-commit programming sequence)  
**Mobile game borrowed from:** Human Resource Machine (sequence execution loop)

---

### Candidate 5: Stuffed-Fables Encounter Engine
*Stuffed Fables × Reigns*

**Decision every ~20s (varies):** Which encounter to enter; inside each encounter, a unique micro-mechanic decision.  
**Stats concept USED:** Per-topic bespoke mechanism — ANOVA = territory, regression = slope-tuning, t-test = balance.

| Dimension | Score | Justification |
|---|---|---|
| Decision rhythm | 3 | Varies wildly between encounters; no consistent pulse |
| Wonder tap | 4 | Variety + narrative tree is highly returnable |
| Engine-building | 2 | Encounters are mostly self-contained |
| Stats-concept fit | 3 | Per-topic fit can be excellent; cohesion across topics is weak |
| Decoration risk | 3 | Quality varies; some encounters will be great, others lipstick |
| **Total** | **15/20** | |

**Decoration-risk verdict:** Medium, and scope risk is enormous (N mechanics to design well).  
**Board game borrowed from:** Stuffed Fables (per-encounter unique mechanic)  
**Mobile game borrowed from:** Slice & Dice (per-encounter mechanic variety)

---

### Candidate 6: Asymmetric-Schools Brawler
*Arctic Scavengers tribe leaders × Reigns*

**Decision every ~20s:** Reigns-style left/right swipe on a data scenario, constrained by your chosen statistical school's toolkit.  
**Stats concept USED:** Comparative epistemology — frequentist vs Bayesian vs non-parametric framing.

| Dimension | Score | Justification |
|---|---|---|
| Decision rhythm | 4 | Swipe pace is tight |
| Wonder tap | 4 | Reigns is genuinely magnetic; faction identity is sticky |
| Engine-building | 3 | School deepens across runs |
| Stats-concept fit | 2 | Bayesian-vs-frequentist is year-2 curriculum; intro students need descriptive + t-tests first |
| Decoration risk | 3 | The swipe could surface real priors/likelihoods |
| **Total** | **16/20** | |

**Decoration-risk verdict:** Medium — curriculum mismatch is the bigger structural problem.  
**Board game borrowed from:** Arctic Scavengers (asymmetric tribe leaders with different starting abilities)  
**Mobile game borrowed from:** Reigns (swipe-binary decision under constraint)

---

### Candidate 7: Spatial-Tiling Knowledge Map
*Patchwork × Mini Metro*

**Decision every ~25s:** Which concept-tile to place where, given shape and prerequisite-edge constraints.  
**Stats concept USED:** Conceptual *structure* of statistics (prerequisites, concept families) — not the math of any specific concept.

| Dimension | Score | Justification |
|---|---|---|
| Decision rhythm | 4 | Tile-placement is tight |
| Wonder tap | 4 | Patchwork + Wordle daily cadence is genuinely zen |
| Engine-building | 3 | Map fills, gaps become visible — nice metacognitive loop |
| Stats-concept fit | 2 | Teaches the *map* of stats, not stats — a tile labeled ANOVA doesn't make you do ANOVA |
| Decoration risk | 2 | Beautiful but risks teaching the table-of-contents, not the content |
| **Total** | **15/20** | |

**Decoration-risk verdict:** High — could become a very aesthetic index card organizer.  
**Board game borrowed from:** Patchwork (spatial-puzzle tile placement with budget)  
**Mobile game borrowed from:** Mini Metro (spatial routing + network growth)

---

### Candidate 8: Trading-Market Stats
*Catan × Sushi Go*

**Decision every ~30s:** Accept or reject an NPC trade offer; bid for specific dataset cards.  
**Stats concept USED:** Sample composition, representativeness, matching design to test requirements.

| Dimension | Score | Justification |
|---|---|---|
| Decision rhythm | 2 | Trades are slow; negotiation is high-latency even with NPCs |
| Wonder tap | 2 | Solo trading with NPCs lacks the social juice of real Catan |
| Engine-building | 3 | Dataset grows over time |
| Stats-concept fit | 2 | Trading is adjacent to sampling, not the mechanism itself |
| Decoration risk | 2 | NPCs become flavor text; trading becomes a theatrical quiz wrapper |
| **Total** | **11/20** | |

**Decoration-risk verdict:** High — the trade is theatrical wrapping around a sample-matching quiz.  
**Board game borrowed from:** Catan (trade window with NPCs)  
**Mobile game borrowed from:** Offerland / Travian-style trade games

---

## Summary Scores

| Rank | Candidate | Score | Decoration Risk |
|---|---|---|---|
| 🥇 1 | Mutable-Dice Engine "WaffleDice" | 19/20 | Low |
| 🥈 2 | Push-your-Luck Sampling | 18/20 | Very Low |
| 🥉 3 | Run-your-Lab Engine | 17/20 | Medium-High |
| 4 | Asymmetric-Schools Brawler | 16/20 | Medium |
| 5 (tie) | Pre-commit Pipeline | 15/20 | Medium |
| 5 (tie) | Stuffed-Fables Encounter Engine | 15/20 | Medium |
| 5 (tie) | Spatial-Tiling Knowledge Map | 15/20 | High |
| 8 | Trading-Market Stats | 11/20 | High |

---

## Top-3 Reasoning

**WaffleDice beats Push-your-Luck** because it covers the full intro curriculum (distributions, z-scores, hypothesis tests, CI, correlation) whereas push-your-luck natively fits only sampling and stopping rules. Both have very low decoration risk, but WaffleDice has stronger engine-building — a session-specific forge makes each run feel personal.

**WaffleDice beats Run-your-Lab** because Run-your-Lab has medium-high decoration risk (the "lab" visuals can swallow the statistics, exactly like the 3D city did). WaffleDice's mechanism *is* the math; Run-your-Lab's mechanism *routes to* the math.

**Push-your-Luck is the best fallback** if WaffleDice's PMF-histogram literacy floor proves too steep for the target population. It can ship as a self-contained module for the sampling + CI topic cluster.

---

## #1 Detailed Spec: WaffleDice — Mutable-Dice Engine

### Concept
The player owns a set of 3–6 custom dice. Each die face is a *statistical move* mastered via SM-2. Each session has two phases: (1) a **Forge phase** where the player reshapes dice by replacing faces using earned shards, and (2) a **Scenario phase** where dice are rolled against real statistical scenarios. The PMF histogram of each die is always visible — the player is always looking at a probability distribution they crafted.

### One-Session Walkthrough (~8 minutes)

1. **Forge phase (60s):** Player sees 4 dice with live face histograms beside each. A shard budget (5 shards) is shown. Player melts off 1–2 faces and forges new ones from the unlocked-concept pool (populated by SM-2 mastery). Each forge updates the PMF bar chart in real time. Decision: "If I add two z-score faces, my average roll is stronger against small-sample scenarios but weaker against categorical ones."

2. **Scenario phase (5 min, ~20 scenarios):** A scenario card appears — e.g., "A clinic reports n=12 patient improvements. Is the effect real?" Player picks WHICH die to roll. Roll lands on a face (actual RNG against the player-built PMF). The face's effectiveness is computed: "one-sample t-test" is a strong fit for small-n continuous data; "chi-square" on this scenario is a mismatch. Shards awarded proportional to fit.

3. **Re-roll window (optional, between scenarios):** Player may spend 1 shard to re-roll once — but the acceptable-answer band widens (simulating a wider confidence interval). This is the key CI mechanic: re-rolling is statistically valid but costs precision.

4. **Session reflection (30s):** The game shows an empirical histogram of all rolls vs the theoretical PMF of each die. Players *see* sampling variance in their own dice. SM-2 review queue updates based on which faces underperformed.

### Statistics Topic → Mechanic Map

| Topic | Mechanic |
|---|---|
| Distributions (normal, binomial, Poisson) | Each die IS a distribution; forging faces shapes its PMF |
| Mean, variance, standard deviation | The face histogram shows mean and spread numerically; player optimizes them |
| z-scores | Compare roll outcome to die's own mean/SD to determine "crit" (strong fit) or "fumble" (weak fit) |
| Sampling variability | Each roll is one draw; the running histogram across a session IS the sampling distribution |
| Hypothesis tests (t, chi-square, ANOVA) | Faces represent test types; scenarios are matched or mismatched data situations |
| Confidence intervals | Re-roll mechanic: spend shards to re-roll, but acceptance band visibly widens |
| Correlation and regression | Two dice rolled together onto a scatterplot grid; joint outcome = model fit |
| Sampling methods (SRS, stratified) | Bag of scenario cards drawn under different rules — unlocked as a late-game meta-layer |

### Decision Interval
- Forge phase: 1 decision per 10–15s (5 forges in 60s)
- Scenario phase: 1 decision per 15–18s (pick die, optionally re-roll)
- **Average: ~1 meaningful decision every 18s** — within the 15–30s spec

### Core Loop (pseudocode)

```
session_start():
  shards = player.shard_balance
  
  // Forge phase
  while player_wants_to_forge and shards > 0:
    face_out = player.pick_face_to_melt()
    face_in  = player.pick_from_unlocked_pool()
    die.replace_face(face_out, face_in)
    die.update_pmf_histogram()
    shards -= cost(face_in)
  
  // Scenario phase
  for scenario in draw_scenarios(n=20, difficulty=player.level):
    die = player.pick_die(scenario_visible=True)
    face = die.roll()                        // RNG against player-built PMF
    fit  = score_fit(face, scenario)         // exact | partial | mismatch
    shards += reward(fit)
    if player.spends_shard_for_reroll():
      face = die.roll()
      scenario.acceptance_band = WIDE        // CI mechanic
    render_feedback(face, scenario, fit)
  
  // Reflection
  show_empirical_vs_theoretical(session_rolls, dice)
  update_sm2(face_performance_log)
  player.shard_balance = shards
```

### Failure State Design
No game over. A mismatched roll yields low shards and a one-sentence diagnostic (e.g., "Chi-square expects categorical counts — this scenario has continuous measurements"). The scenario resolves weakly and play continues. Every session ends with the empirical-vs-theoretical histogram reveal: even a bad session teaches sampling variability. The next forge lets the player immediately reshape the die that let them down. Failure is informative, visible in the math, and immediately actionable.

### What the Player Accumulates
- **A unique dice set** — collectible, screenshot-worthy, shareable
- **Unlocked face pool** — grows as SM-2 confirms mastery of each topic
- **PMF expressiveness score** — a meta-stat showing how well dice cover the curriculum
- **Shard economy** — allows forging, re-rolls, and (post-MVP) cosmetic die skins
- **Daily seed leaderboard** — fixed scenario deck, compare dice strategies across players

### Why This Is NOT Decoration
The face the player forges is the probability mass that determines what they roll. Over-investing in one concept creates a skewed die with low coverage — the player *empirically observes* high variance and low scenario fit. Remove the dice and there is no game. Compare with the existing 3D city: removing the city changes nothing about learning. The consequence of every forge decision is in the statistics, not in a coin counter.

### MVP Scope (smallest playable prototype)
- 2 dice, 6 faces each
- 8 unlocked face types: mean, standard deviation, z-score, one-sample t-test, chi-square, Pearson correlation, normal-distribution-fit, "pass" (empty face)
- 20 scenario cards with face-fit scoring matrix
- Forge UI: drag-face-off → drag-face-on → live PMF bar chart updates
- Session length: 8 minutes = 1 forge phase + 12 scenarios
- Hebrew RTL from day one; no 3D scenes; plug into existing SM-2 (learningStore.ts) to feed unlocked-face pool
- Ship behind a feature flag in `src/config/featureFlags.ts` alongside current quiz

### Open Design Risks
1. **PMF-literacy floor:** Beginners may not read a histogram. Mitigation: animate each roll as a ball dropping into the histogram bin (Mini Metro-style dot).
2. **Scenario authoring cost:** ~100 scenarios needed with correct face-fit scoring. Risk of becoming a quiz in disguise if scenarios are too rigid; mitigate with multi-fit (several faces partially work on each scenario).
3. **Re-roll = CI mechanic readability:** The widened acceptance band needs a clear visual indicator — a bracket that visibly expands on re-roll.
4. **Paired-dice regression:** Most novel sub-mechanic (two dice on a scatterplot grid). Prototype last, as a separate isolated spike.
5. **SM-2 signal integrity:** When a face underperforms, is the concept failing or the scenario-match failing? Telemetry needs to separate face-mastery from scenario-fit to avoid muddying the spaced-repetition queue.
6. **Daily seed leaderboard:** Strong social hook but adds scope. Defer past MVP.

### Implementation Order (Cycles 2+)
1. `featureFlags.ts` → add `WAFFLE_DICE_ENABLED = false`
2. Forge UI component (2 dice, face drag-replace, live PMF bar chart)
3. Scenario engine (draw card, pick die, roll, score fit, show feedback)
4. SM-2 integration (feed unlocked-face pool from `learningStore.ts`)
5. Session reflection screen (empirical vs theoretical histogram)
6. Shard economy persistence (Zustand + localStorage, keyed per user)
7. Hebrew copy pass on all UI strings
8. Vitest unit tests for `scorefit()` and `updatePmf()`

---

## Vision Alignment Check

| Rule | Compliant? | Citation |
|---|---|---|
| What we are: stats-first via game | ✓ | Die face = PMF = stats concept; player decision uses the math |
| Gameplay ≠ Gamification | ✓ | Shards are consequence of fit, not participation reward |
| Design rule: Hebrew-first | ✓ | MVP spec mandates Hebrew RTL from day one |
| Design rule: dark UI | ✓ | No new UI components in this cycle (exploration only) |
| **Color palette: only locked tokens used** | ✓ | No new hex values in this cycle |
| **UI source cited** | ✓ | Mini Metro (ball-drop histogram), Linear (dark density), Apple HIG (44pt hit targets) |
| **UI anti-pattern avoided** | ✓ | No modals; forge UI uses bottom-sheet; no hamburger |
| Tech invariant: Tailwind only | ✓ | No code in this cycle |
| Tech invariant: Zustand only | ✓ | Shard economy and face pool spec'd for Zustand + localStorage |
| Tone rule: encouragement | ✓ | Mismatch feedback is diagnostic (one sentence explaining why), not punitive |
| Mobile-first (thumb-reach + 44pt) | ✓ | Forge UI spec'd for one-thumb drag on 375px+ |
| Out of scope: stays in scope | ✓ | No multiplayer, no Bayesian inference beyond intro, no teacher dashboard |

**NotebookLM consulted:** no — MCP connector not available in this container; design judgment used per VISION.md fallback rule.  
**Board-game inspiration:** Dice Forge (Régis Bonnessée / Libellud) — face-replacement mechanic directly maps to PMF mutation.  
**Mobile-game inspiration:** Slay the Spire (MegaCrit) — card/relic mutation compounding into a unique run build; decision density.  
**Secondary board-game inspiration:** Quacks of Quedlinburg — push-your-luck bag draw = sampling with stopping rules (cited for Candidate 2, relevant to the re-roll mechanic in WaffleDice).  
**Secondary mobile-game inspiration:** Mini Metro — spatial visual, running histogram, zen flow; ball-drop animation pattern for sampling visualization.  
**Decision interval:** every ~18 seconds.  
**Statistical concept used in decision:** Probability mass function construction (forge); test-selection + distribution fit (scenarios); confidence interval tradeoff (re-roll).
