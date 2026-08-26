# Proactive Cycle 01 — Gameplay Loop Exploration

**Date:** 2026-05-30  
**Branch:** proactive/exploration/20260530-0800  
**Cycle type:** Exploration only (no code)  
**NotebookLM:** SKIP — MCP connector not available in this container. Design judgment drawn from VISION.md catalogue + codebase analysis.

---

## Context: Current State Anti-Pattern

The existing app delivers a **quiz-with-XP-and-city-decoration** loop. Players answer questions → earn XP → city buildings unlock as cosmetics. The 3D city grows but buildings **do not produce or consume resources**. XP flows one-way. The quiz answer does not affect what the player decides next — the city is a reward graphic, not a game system.

VISION.md names this explicitly: `🏙️ City builder (current iteration) — Locked-in risk: decoration not decision unless buildings consume/produce resources.`

Every candidate below is measured against the prime directive: **the statistical concept must be the mechanism of the game, not just the reward trigger.**

---

## Scoring Rubric

Each candidate scored 0–10 on five dimensions:

| Dimension | What it measures |
|---|---|
| **Decision Rhythm** | Is there a meaningful player choice every 15–30 s? |
| **Wonder Tap** | Does the mechanic create genuine delight / identity? |
| **Engine-Building** | Do early decisions compound into later advantage? |
| **Topic-Fit** | Does the player USE the stats concept, not just memorize it? |
| **Decoration Risk** | How easy is it to hollow this out into cosmetics? (lower score = lower risk = better) |

Total is out of 40 (Decoration Risk inverted: a score of 1 means nearly zero decoration risk).

---

## 8 Candidate Gameplay Loops

---

### Candidate A — Mutable Dice Oracle
**Tagline:** You craft the distribution you roll from.

**Core mechanic:**
Player starts with a set of generic dice. Each die face represents a statistical concept (e.g., "normal dist", "t-test", "standard deviation"). When rolling, the outcome samples from the player's **custom-built probability distribution** — better faces = more useful outcomes in the lab scenario.

The player upgrades die faces by correctly answering questions about that concept. Upgrading face X means replacing a generic blank face with a specialist face — literally **mutating the die's probability mass function**. Upgrade currency is earned by running successful lab experiments (rolling well + making the right inference call).

**Decision every cycle:**
1. *Which die face to upgrade?* (Which concept to deepen — affects ALL future rolls.)
2. *Which experiment to run this session?* (Different experiments reward different die configurations.)

**Stats concepts used:**
- Probability distributions (you ARE engineering the PMF of your dice).
- Expected value (which upgrade has the best expected payoff?).
- Sample size vs. variance (rolling more dice = bigger sample = less variance in outcome).

**Decision interval:** ~20 s — roll → read outcome → decide upgrade path.

**Engine-building:** Strong. Upgraded dice → better lab outcomes → more upgrade currency → better dice.

**Wonder tap:** Very high. Players can see the literal shape of their knowledge (a histogram of their die faces). "My dice are bimodal because I over-invested in distributions but skipped inference."

**Decoration risk:** Low. Die faces have mechanical consequences. A blank face = a failed roll = a real setback.

**Failure mode:** If the upgrade currency is trivially abundant, it degenerates into "unlock everything eventually." Needs scarcity and dead-end branches.

**Board game citations:**
- **Dice Forge** (Libellud, 2017) — core mechanic borrowed: replaceable die faces that the player crafts from a shared market. Exact precedent.
- **Arctic Scavengers** (Rio Grande, 2009) — tribe-leader asymmetry: each player's starting die configuration is different (frequentist / Bayesian / nonparametric starter kits).

**Mobile game citations:**
- **Threes** (Sirvo, 2014) — compounding: each good decision compounds into a better board state, same as upgraded dice compounding into better distributions.
- **Reigns** (Nerial, 2016) — binary decision weight: every upgrade choice has a cascading second-order effect that isn't immediately obvious.

**UI source:**
- **Linear.app** — status pills per die face (mastered / partial / blank), dark-panel density.
- **Apple HIG (iOS dark mode)** — 44 pt touch targets mandatory for dice faces on mobile.

**Score:**

| Decision Rhythm | Wonder Tap | Engine-Building | Topic-Fit | Decoration Risk | **Total** |
|---|---|---|---|---|---|
| 8 | 9 | 8 | 10 | 2 | **37 / 40** |

---

### Candidate B — Stats Pipeline Programmer
**Tagline:** Pre-commit your methodology, watch it execute on real data.

**Core mechanic:**
Inspired by **Mechs vs Minions** (CMON, 2016). Each "day" the player receives a dataset scenario. They must pre-commit a sequence of 4–6 statistical steps before seeing all the data: *select test → check assumptions → compute → interpret → report*. After committing, the pipeline executes step-by-step. If a step fails (the player chose the wrong test or missed an assumption), the pipeline halts at that node. The player must diagnose the fault and re-route — not restart from scratch.

**Stats concepts used:**
- Hypothesis-testing procedure (you sequence it, not recall it).
- Assumption checking (normality, homoscedasticity) — each assumption is a node that can fail.
- Type I / Type II error trade-offs — visible at the "interpret" node.

**Decision interval:** ~15 s between pipeline node selections; ~25 s for diagnosis-and-re-route.

**Engine-building:** Medium. Mastered steps become "auto-execute" (faster pipeline). Later scenarios have 8-node pipelines that reward mastery of earlier 4-node ones.

**Wonder tap:** Watching a correctly designed pipeline execute with no faults — clean satisfaction, similar to watching a Mini Metro line run without congestion.

**Decoration risk:** Very low. The pipeline IS the game. There's no decoration layer to add.

**Board game citations:**
- **Mechs vs Minions** (CMON, 2016) — pre-commit programming, then watch execution.
- **Cry Havoc** (Portal, 2016) — branching encounter results; choosing the wrong branch has mechanical consequences you must recover from.

**Mobile game citations:**
- **Mini Metro** (Dinosaur Polo Club, 2015) — routing decisions under constraint; the satisfaction of a clean network.
- **Threes** (Sirvo, 2014) — chaining sub-decisions for a compound payoff.

**UI source:**
- **Stripe Docs** — instructional step layout (sidebar progress + current step detail).
- **Linear.app** — status pills showing each pipeline node as "running / passed / failed / skipped."

**Score:**

| Decision Rhythm | Wonder Tap | Engine-Building | Topic-Fit | Decoration Risk | **Total** |
|---|---|---|---|---|---|
| 9 | 8 | 7 | 10 | 1 | **35 / 40** |

---

### Candidate C — Data Marketplace Trader
**Tagline:** Your agency, your clients, your data quality standard.

**Core mechanic:**
The player runs a statistical consulting agency. Each round 3 NPC clients arrive, each carrying a research problem (dataset + goal). The player evaluates which client's data is clean enough, which test they'll need, and which problem is within their current skill set. They accept 1–2 clients per round. Then they negotiate with the client for cleaner data (a Catan-style trade window: "I'll lower my confidence interval if you give me 20 more observations"). Finally they solve the problem to earn reputation.

**Stats concepts used:**
- Data quality evaluation (USED to decide which client to take).
- Appropriate test selection (USED to confirm capacity before accepting).
- Power analysis and sample size (USED in trade negotiation).

**Decision interval:** ~20 s per client evaluation, ~30 s per trade negotiation.

**Engine-building:** Medium. Reputation unlocks better clients (harder stats, better pay). Over-specializing in one test type closes doors.

**Wonder tap:** Narrative — each client has a backstory. Building a prestigious firm feels like Viticulture's winery identity.

**Decoration risk:** Medium. The client narrative could swallow the stats if not carefully designed. Risk of becoming "stat trivia with story paint."

**Board game citations:**
- **Catan** (Mayfair, 1995) — trade window mechanic: negotiating resources (data quality) with NPCs.
- **Godfather: Corleone's Empire** (CMON, 2017) — influence placement + hidden objectives per area (each client specialty = a territory).

**Mobile game citations:**
- **Reigns** (Nerial, 2016) — binary accept/reject with cascading reputation consequences.
- **Two Dots** (Playdots, 2014) — chain reaction: each client accepted chains into the next round's available pool.

**UI source:**
- **Notion** — inline content cards for each client profile (slash-command-driven intake form).
- **Linear.app** — status pills for client state (pending / accepted / in-progress / closed).

**Score:**

| Decision Rhythm | Wonder Tap | Engine-Building | Topic-Fit | Decoration Risk | **Total** |
|---|---|---|---|---|---|
| 7 | 7 | 6 | 8 | 5 | **27 / 40** |

---

### Candidate D — Spatial Knowledge Tiler
**Tagline:** Your knowledge gaps are visible. Fill them.

**Core mechanic:**
A daily puzzle (Wordle-cadence). The player has a hexagonal grid representing "statistical knowledge space." Concepts are irregularly shaped tiles — the shape encodes conceptual relationship (prerequisite tiles must be placed before advanced ones, and they physically must be adjacent). Each tile placement requires answering 2–3 questions correctly. When placed, the tile locks permanently into the grid. Gaps in the grid are visually obvious — "I know t-tests and ANOVA but there's a hole where effect size should be."

**Stats concepts used:**
- Conceptual prerequisite ordering (which tile fits where — encodes topic dependency graph).
- Understanding of concept relationships (tile adjacency = conceptual proximity).

**Decision interval:** ~15 s to evaluate grid state and choose next tile.

**Engine-building:** Weak per session (each day partially resets). Strong across weeks (unlocked tiles persist; the gap map becomes richer).

**Wonder tap:** High. The visible gap is emotionally compelling — the Zeigarnik effect applied spatially. Seeing a near-complete row creates powerful pull to complete it.

**Decoration risk:** Medium-high. If tile placement has no downstream mechanical consequence (just visual), it collapses into cosmetics. Needs tiles to unlock new quiz modes or special "ability" tiles.

**Board game citations:**
- **Patchwork** (Lookout, 2014) — spatial tiling with opportunity cost (button economy mirrors XP budget).
- **Arctic Scavengers** (Rio Grande, 2009) — resource efficiency under constraint.

**Mobile game citations:**
- **Threes** (Sirvo, 2014) — spatial awareness + satisfying fit.
- **Wordle** (NYT, 2022) — daily cadence + social sharing of grid state.

**UI source:**
- **Duolingo** — path tree visual inspiration (but we want spatial vs. linear).
- **Apple HIG** — thumb-zone grid interaction; 44 pt tile targets.

**Score:**

| Decision Rhythm | Wonder Tap | Engine-Building | Topic-Fit | Decoration Risk | **Total** |
|---|---|---|---|---|---|
| 7 | 9 | 4 | 7 | 6 | **29 / 40** |

---

### Candidate E — Push-Your-Luck Sampler
**Tagline:** One more draw — or is the evidence already enough?

**Core mechanic:**
Inspired by **Quacks of Quedlinburg** (Schmidt Spiele, 2018). The player is running a study. They tap to draw one data point at a time from a virtual "data bag." Each draw reveals a value. The player decides: stop now and use this (incomplete but safe) sample, or draw another (bigger sample, more confidence, but risk of an outlier "contaminating" the bag and forcing a re-draw). The bag composition (proportion of outliers vs. clean data) is unknown and shifts per scenario.

**Stats concepts used:**
- Confidence intervals (visually show CI shrinking as n grows).
- Stopping rules (the core decision IS when to stop sampling).
- Outlier effect (a drawn outlier visibly widens the CI and may cross the significance threshold).
- Sample size vs. variance trade-off (direct, tactile).

**Decision interval:** ~10–15 s (fast, tension-driven).

**Engine-building:** Weak across sessions. Strong within a session (early good draws create momentum — same as Quacks "good bag run").

**Wonder tap:** High tension. The tactile pull of "one more draw" is one of gaming's most reliable hooks (slot machine psychology redirected toward pedagogy).

**Decoration risk:** Very low. The stopping decision IS the statistics. No decoration layer needed.

**Board game citations:**
- **Quacks of Quedlinburg** (Schmidt Spiele, 2018) — core mechanic: push-your-luck bag draw with unknown bag composition.
- **Century: Spice Road** (Plan B Games, 2017) — resource trade-off; when to convert vs. hold.

**Mobile game citations:**
- **Two Dots** (Playdots, 2014) — chain-or-stop decision, visual feedback on chain length.
- **Tomb of the Mask** (Playgendary, 2016) — risk/reward timing under pressure.

**UI source:**
- **Apple HIG (iOS dark mode)** — bottom sheet for draw result (one-thumb reach, always in thumb zone).
- **Linear.app** — live CI bar that updates per draw (progress indicator as epistemic state).

**Score:**

| Decision Rhythm | Wonder Tap | Engine-Building | Topic-Fit | Decoration Risk | **Total** |
|---|---|---|---|---|---|
| 9 | 8 | 3 | 10 | 1 | **31 / 40** |

---

### Candidate F — Asymmetric Statistics School
**Tagline:** Frequentist. Bayesian. Nonparametric. Pick your school, master your domain.

**Core mechanic:**
At session start, the player chooses (or is assigned) a "statistical school" — Frequentist, Bayesian, or Nonparametric. Each school has a unique toolset, resource type, and win condition. Encounters are data challenges where one school has a natural edge. The player must recognize that edge (or lack of it) and decide whether to use their school's tools (efficient but bounded) or borrow a cross-school tool (weaker, but sometimes the right call).

This is **Arctic Scavengers' tribe-leader system** applied to statistics epistemology.

**Stats concepts used:**
- Which approach is appropriate for which data (the core methodological judgment skill).
- School-specific tools: frequentists use p-values and CIs; Bayesians use priors and posterior updates; nonparametrics use rank tests.
- Cross-school trade-offs (when to use Mann-Whitney instead of t-test = when to borrow a nonparametric tool).

**Decision interval:** ~20 s per tool-deployment decision.

**Engine-building:** Very strong. School identity compounds — unlocking "advanced frequentist" techniques requires mastering basic ones. School specialization creates strategic depth.

**Wonder tap:** Identity-level. "I'm a Bayesian" is a personality statement for statistics students. The faction flag creates emotional investment comparable to Hogwarts houses or Pokémon starter choices.

**Decoration risk:** Low. School choice has hard mechanical consequences (Bayesian tools literally don't work for certain frequentist-encoded problems). The discipline IS the faction.

**Open question:** Scope risk. Three asymmetric factions is a large content surface. May need to start with two schools (Frequentist vs. Nonparametric) and add Bayesian later.

**Board game citations:**
- **Cry Havoc** (Portal, 2016) — fully asymmetric factions under one ruleset.
- **Arctic Scavengers** (Rio Grande, 2009) — tribe-leader choice defines your entire play style and available moves.

**Mobile game citations:**
- **Mini Metro** (Dinosaur Polo Club, 2015) — each city map rewards a different routing style (analogous to each faction having a different problem profile).
- **Stack the States** (Freecloud Design, 2010) — identity + collection + specialization.

**UI source:**
- **Linear.app** — dark UI with faction-colored status pills; keyboard-driven tool selection.
- **Apple HIG** — elevation and depth for faction card display; hero element above fold.

**Score:**

| Decision Rhythm | Wonder Tap | Engine-Building | Topic-Fit | Decoration Risk | **Total** |
|---|---|---|---|---|---|
| 7 | 9 | 9 | 9 | 2 | **36 / 40** |

---

### Candidate G — WaffleStack Café Engine-Builder
**Tagline:** Run the café. Your stats skills are your kitchen staff.

**Core mechanic:**
Thematic resonance with the app name. The player runs a waffle shop. Customers arrive carrying "data orders" (research problems). The player fulfills orders by assigning "stats workers" — cards representing mastered skills. Each worker can perform one statistical operation (e.g., "Normality Checker", "T-Test Cook", "Regression Chef"). Workers are added to the player's deck by completing lessons.

The decision: **which workers to chain together to fill this order?** A customer who wants a regression analysis needs: a "Data Cleaner" + "Assumption Checker" + "Regression Chef" in sequence. Getting the sequence wrong wastes a worker's turn.

The deck grows as topics are mastered, creating a richer engine. Higher-tier customers (graduate students, researchers) require rarer workers that unlock at higher mastery.

**Stats concepts used:**
- Statistical workflow sequencing (correct order of operations = correct methodology).
- Worker assignment is understanding which skill is needed for which task.
- Deck composition reflects your current statistical knowledge portfolio.

**Decision interval:** ~20 s (customer arrives → evaluate order → assign workers → submit).

**Engine-building:** Very strong. Better deck → more complex orders → more income → better shop → higher-tier customers → more mastery.

**Wonder tap:** The "run your own place" emotional pull is VISION.md's top-listed pull. Hebrew-first + Israeli café culture is thematically resonant.

**Decoration risk:** Medium. Shop upgrades (better counter, fancier decor) must be resource-generators (more customer slots, faster worker cooldowns), not pure cosmetics. This discipline is the main design challenge.

**Board game citations:**
- **Seize the Bean** (Weird Giraffe Games, BGG #211364) — café deck-building; exact thematic match.
- **Viticulture** (Stonemaier, 2013) — worker placement with seasonal rhythm (customers arrive in "waves").
- **Century: Spice Road** (Plan B Games, 2017) — upgrade chain where higher resources require lower ones (advanced stats require basic stats — direct prerequisite map).

**Mobile game citations:**
- **Coffee Rush** (BGG #377061) — real-time customer triage; decision density under pressure.
- **Stardew Valley** (ConcernedApe, 2016) — build-your-place satisfaction with seasonal rhythm and long-term compounding.

**UI source:**
- **Duolingo** — skill tree for worker unlocks (our Hebrew version of the path tree, RTL).
- **Linear.app** — order queue management (linear list of pending customers, status pills per order state).

**Score:**

| Decision Rhythm | Wonder Tap | Engine-Building | Topic-Fit | Decoration Risk | **Total** |
|---|---|---|---|---|---|
| 8 | 10 | 9 | 8 | 4 | **35 / 40** |

---

### Candidate H — Mutation Lab Draft
**Tagline:** Draft your analytical toolkit from a shared market. Every pick closes a door.

**Core mechanic:**
Each round, a market of N "mutations" (stats techniques) is revealed. The player drafts one — this permanently upgrades one facet of their research lab (e.g., widened confidence interval tolerance, new available test type, reduced sample-size requirement). Other players or NPC "rival labs" draft from the remaining market. The combination of chosen mutations creates emergent lab identities, and certain mutation combos unlock "breakthrough research" scenarios (boss encounters).

**Stats concepts used:**
- Recognizing which technique improves which limitation in your current lab.
- Understanding that choosing nonparametric tools changes what data you can handle.
- Combo recognition: "Power analysis + Larger Samples + Effect Size = publishable study."

**Decision interval:** ~25 s per draft (evaluate N options, pick best for your current lab configuration).

**Engine-building:** Strong. Mutations compound; the draft order creates permanent strategic differentiation.

**Wonder tap:** Moderate. The "lab identity" that emerges is interesting but less visceral than faction pride (Candidate F) or café ownership (Candidate G).

**Decoration risk:** Medium. Mutations need to be mechanical (change what data you can analyze) not cosmetic (change how your lab looks).

**Board game citations:**
- **Dice Forge** (Libellud, 2017) — market-draft of die-face upgrades; pick from face-up row.
- **Patchwork** (Lookout, 2014) — opportunity cost in drafting (taking one piece means others advance the time track).

**Mobile game citations:**
- **Reigns** (Nerial, 2016) — binary draft decision with cascading second-order effects.
- **Threes** (Sirvo, 2014) — compounding: each draft layers onto the previous state.

**UI source:**
- **Linear.app** — card selection at high density (dark background, clear hierarchy).
- **Stripe Docs** — side-by-side mutation comparison (two-column layout for "current state vs. with this mutation").

**Score:**

| Decision Rhythm | Wonder Tap | Engine-Building | Topic-Fit | Decoration Risk | **Total** |
|---|---|---|---|---|---|
| 7 | 7 | 8 | 8 | 4 | **30 / 40** |

---

## Master Scoring Summary

| Rank | Candidate | Rhythm | Wonder | Engine | Fit | Decor Risk | **Total** |
|---|---|---|---|---|---|---|---|
| 1 | **A — Mutable Dice Oracle** | 8 | 9 | 8 | 10 | 2 | **37 / 40** |
| 2 | **F — Asymmetric School** | 7 | 9 | 9 | 9 | 2 | **36 / 40** |
| 3 | **B — Stats Pipeline Programmer** | 9 | 8 | 7 | 10 | 1 | **35 / 40** |
| 4 | G — WaffleStack Café | 8 | 10 | 9 | 8 | 4 | 35 / 40 |
| 5 | E — Push-Your-Luck Sampler | 9 | 8 | 3 | 10 | 1 | 31 / 40 |
| 6 | H — Mutation Lab Draft | 7 | 7 | 8 | 8 | 4 | 30 / 40 |
| 7 | D — Spatial Knowledge Tiler | 7 | 9 | 4 | 7 | 6 | 29 / 40 |
| 8 | C — Data Marketplace Trader | 7 | 7 | 6 | 8 | 5 | 27 / 40 |

**Tiebreaker B vs G (both 35):** B has Decoration Risk of 1 vs. G's 4 → B ranks 3rd.

---

## Top-3 Ranking & Rationale

### #1 — Mutable Dice Oracle (A)
Wins because: it makes **probability theory** — the hardest abstraction in intro stats — **physically manipulable**. You're not answering a question about normal distributions; you are literally building one with your die faces. The direct mapping from player action (replace this face) to statistical concept (change the PMF) has no mediation layer. Decoration risk is minimal because die faces with blank values produce objectively worse experimental outcomes. Engine-building is strong (upgraded dice → better experiments → more currency → more upgrades). Wonder tap is high because the player can literally see their knowledge as a histogram of die-face distributions.

The one weakness: needs careful economy design to prevent "upgrade everything trivially." A scarcity model (limited upgrade slots per session, mutually exclusive face types) addresses this and is well-precedented in Dice Forge itself.

### #2 — Asymmetric School Faction (F)
Wins second because it attacks the **deepest pedagogical problem**: students memorize tests without knowing when to use them. Making test-selection a faction identity with real mechanical consequences (Bayesian tools fail on frequentist-encoded problems) teaches the conceptual layer, not just the mechanics. The wonder tap is very high (faction identity is emotionally sticky). Engine-building is the strongest of all candidates. The risk is content surface — three asymmetric factions is a large build. Recommend starting with two (Frequentist vs. Nonparametric) in cycle 2.

### #3 — Stats Pipeline Programmer (B)
Wins third because it teaches **procedural fluency** — the exact gap between "I know what a t-test is" and "I know when to run one, in what order, and how to interpret the output." Pre-committing a pipeline before seeing full data forces the player to think in sequences (not stimulus-response). Decoration risk is lowest of all candidates (the pipeline IS the game). Decision rhythm is fastest (9/10). Weakness: lower wonder tap and engine-building than A and F; each session feels somewhat self-contained.

---

## Detailed Spec: Candidate A — Mutable Dice Oracle

### Elevator Pitch
> You are a statistics researcher. Your research generates results based on the dice you roll. You customize those dice by mastering statistical concepts. The shape of your dice IS the shape of your knowledge.

### Statistical Concepts Covered (scope: intro stats)
Phase 1 dice faces: Mean, Median, Mode, Standard Deviation, Variance, Normal Distribution, Z-score, Probability  
Phase 2 die faces: T-test, Confidence Interval, Sample Size, Type I Error, Type II Error  
Phase 3 die faces: ANOVA, Correlation, Regression, Effect Size, Chi-Square  
(Each phase requires Phase N–1 faces to be at least 50% upgraded.)

### Player-Facing Loop (one session, ~8 minutes)
1. **Roll phase (30 s):** Player rolls their current set of dice. The combined outcome generates a "data reading" (e.g., "Your sample mean came out as X, but your variance die rolled BLANK — you can't characterize spread.").
2. **Experiment phase (60–120 s):** Based on the data reading, 3 possible experiments appear. Each experiment requires specific die faces to succeed (e.g., Experiment A needs "Normal Distribution" + "Z-score" faces; Experiment B needs "T-test" + "Sample Size"). Player selects one.
3. **Quiz phase (60–90 s):** Player answers 2–3 questions testing the concept behind the faces used. Correct answers generate "upgrade crystals." Incorrect answers cost crystals and reveal a one-sentence explanation (the "why," not the formula).
4. **Upgrade phase (30 s):** Player spends crystals to upgrade one die face. A face-up market of 4 available upgrades is shown. Picking upgrade A removes it from market — others get cheaper (Dice Forge market mechanic). Decision interval peak: which upgrade maximizes next session's experiment options?
5. **Compound reveal (10 s):** After upgrade, a brief visualization shows the player's updated die as a histogram — the distribution of possible future rolls has shifted. This is the wonder-tap moment.

### Prototype Scope (Cycle 2 buildable)
- 2 dice, 6 faces each = 12 possible face types to design.
- 1 experiment tier (Phase 1 faces only).
- Market of 4 upgrades per session.
- Crystal economy: 3 correct answers = 1 crystal; upgrade costs 2–3 crystals.
- Visualization: a simple bar chart of die-face frequencies (no 3D needed in MVP; R3F can be added later).

### UI Sketch (mobile-first, RTL, Hebrew)
```
┌──────────────────────────────────┐
│  [🎲 הגרלה]   • ניסוי 1/3       │  ← status pill (Linear-style)
│                                  │
│  קובייה 1: [▒][★][▒][N][▒][▒]   │  ← die faces, 44pt touch targets
│  קובייה 2: [μ][▒][σ][▒][▒][▒]   │
│                                  │
│  תוצאה: μ = 4.2, σ = ?          │  ← blank face = unknown spread
│                                  │
│  [ניסוי A] [ניסוי B] [ניסוי C]  │  ← bottom 3 choices (thumb zone)
└──────────────────────────────────┘
```
- Background: `--bg` (#0e0f12). Cards: `--card` (#1c1f26). Borders: `--border` (#2a2e36).
- Correct outcome: `--teal` (#10b981). Upgrade available: `--gold` (#FFD700). Blank face: `--mute` (#8a8f99).
- Zero new hex values introduced.
- Bottom-sheet (not modal) for quiz questions.
- Hebrew copy throughout. Second-person singular.

### Feature Flag (for Cycle 2)
```typescript
// src/config/featureFlags.ts
export const FEATURE_FLAGS = {
  MUTABLE_DICE_ORACLE: false, // Cycle 2: prototype
};
```

### State Design (Zustand, for Cycle 2 reference)
```typescript
interface DieFace {
  id: string
  conceptId: string       // references quiz-bank concept
  tier: 1 | 2 | 3
  masteryLevel: 0 | 1 | 2 | 3  // 0=blank, 3=fully upgraded
}

interface OracleState {
  dice: DieFace[][]        // array of dice, each is array of faces
  crystals: number
  sessionExperiment: string | null
  upgradeMarket: string[]  // 4 available face IDs this session
}
```

### Vision Alignment Check (preview — full table in PR body)
| Rule | Compliant? | Note |
|---|---|---|
| Stats-first via game | ✓ | PMF crafting IS stats concept |
| Gameplay ≠ Gamification | ✓ | Die faces have mechanical, not cosmetic, consequences |
| Decision every 15–30 s | ✓ | Upgrade decision at ~20 s |
| Decoration risk | Low | Blank faces cause failed experiments = real setback |
| Color palette: locked tokens only | ✓ | No new hex values |
| Hebrew-first | ✓ | All UI copy Hebrew, RTL |

---

## Open Questions for Barak

1. **Thematic skin:** Should the Dice Oracle live inside the existing WaffleStack world (researcher in the city), or should it be a completely separate "mode" with its own framing? The thematic resonance of the café (Candidate G) might be stronger for the WaffleStack brand.

2. **Faction layer:** Candidate F (Asymmetric Schools) scored very close to A. Should Cycle 2 attempt to *combine* them — the player's starting dice configuration is their chosen school (Frequentist gets σ-heavy dice, Bayesian gets prior-weight dice)? This hybrid would be the most novel design in the space.

3. **Session length target:** VISION.md says 5–10 min. The Oracle loop above is ~8 min. Is that acceptable, or should cycles be shorter (3 min) with multiple rounds per session?

4. **Existing quiz bank compatibility:** The 100-question quiz bank (`src/data/quiz-bank.json`) maps 1:1 to the die face concept IDs proposed. No new quiz content needed in Cycle 2 — we can use existing questions as the "quiz phase" driver.

---

*End of Cycle 1 exploration document.*
