# WaffleStack — Cycle 01: Gameplay Design Space Exploration

**Date:** 2026-05-29  
**Cycle type:** CYCLE 1 — exploration only (no code)  
**Branch:** `proactive/exploration/games-design-space`  
**Vision source:** VISION.md (read in full this cycle)  
**NotebookLM:** SKIPPED — MCP connector not available in this container. Design judgment drawn from VISION.md catalogue + board game literature + Opus 4.x model design oracle.

---

## Context: What exists today

The current WaffleStack codebase (as of 2026-05-29, commit `9e7f8f5`) has:

- **Question bank** covering: normal distribution, hypothesis testing, correlation, mean, median, std dev, sampling, regression, CI, binomial.
- **SM-2 spaced repetition engine** in `src/store/learningStore.ts` — intervals, ease factors, XP multipliers.
- **Feature-unlock tier system** in `src/config/featureUnlocks.ts` — 13+ features unlocked by XP/topics milestones.
- **City-builder shell** with `blockConfig.ts` and R3F scene — currently aesthetic-only. Per VISION.md: "Locked-in risk: decoration not decision unless buildings consume/produce resources."
- **Tools layer** (arsenal, notebook, mindmap, AI tutor, Pomodoro, whiteboard, formula library) — well-built study utilities.
- **Quiz + lesson loop** as the primary progression mechanism — functional but not a real game loop.

**Gap diagnosed:** The current loop is a *quiz app with reward graphics*. VISION.md explicitly forbids this. No candidate should strengthen the quiz shell — each must propose a **different, independent mechanic** that the player chooses to enter.

---

## Candidate Loops — Evaluated

Eight gameplay loops were evaluated. Each was scored on 6 axes (1–5 each):

| Axis | Description |
|---|---|
| **Rhythm** | Meaningful decision every 15–30 seconds |
| **Wonder** | Delight / curiosity beyond quiz |
| **Engine** | Early choices compound into late power |
| **Fit** | Player USES statistics to decide (not adjacent) |
| **Decor-safe** | How hard to fake as cosmetic (5 = hard to fake = good) |
| **Build** | Solo dev ships playable prototype in 2–3 week sprints |

### Scorecard

| # | Candidate | Rhythm | Wonder | Engine | Fit | Decor-safe | Build | **Total** |
|---|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **C** | Push-Your-Luck Sampling *(Quacks)* | **5** | 4 | 3 | **5** | **5** | 4 | **26** |
| **A** | Mutable-Dice Engine *(Dice Forge)* | 4 | **5** | **5** | 4 | 4 | 3 | **25** |
| **H** | Boss-Battle Encounters *(Stuffed Fables)* | 4 | **5** | 4 | 4 | 4 | 2 | **23** |
| **D** | Run-Your-Own-Lab Engine Builder *(Seize the Bean)* | 3 | 4 | **5** | 4 | 3 | 3 | **22** |
| **B** | Pre-Commit Programming Puzzle *(Mechs vs Minions)* | 2 | 3 | 3 | **5** | **5** | 3 | **21** |
| **G** | NPC-Trading Data Marketplace *(Catan)* | 3 | 3 | 4 | 4 | 3 | 2 | **19** |
| **F** | Spatial-Tiling Daily Puzzle *(Patchwork × Wordle)* | 3 | 4 | 3 | 2 | 2 | 4 | **18** |
| **E** | Asymmetric Faction Schools *(Cry Havoc)* | 2 | 3 | 4 | 3 | 3 | 2 | **17** |

### Candidate rationales

**A — Mutable-Dice Engine (25):** Crafting your own distribution is the most literal "you ARE the statistics" mechanic — you modify the probability density function you roll from. Engine ceiling is highest on the list. Weakness: forging is a slow meta-decision (every few minutes, not every 20s), and moment-to-moment rolling can drift cosmetic if face upgrades don't visibly change outcomes. Strong second bet.

**B — Pre-Commit Programming Puzzle (21):** Perfect topic-fit for procedure topics (hypothesis-testing pipeline, regression diagnostics) — impossible to fake as decoration. Weakness: pre-commit batching breaks the 15–30s rhythm (one big commit, then passive watching), and covers a narrow slice of the stats curriculum for high build cost.

**C — Push-Your-Luck Sampling (26):** ★ Winner. See top-3 section.

**D — Run-Your-Own-Lab (22):** Strongest thematic "run your own cool place" daydream (VISION emotional pull #1) and deck compounding. Main risk: methodology-as-card-play easily collapses into "play the matching card" pattern-matching unless every card is carefully authored. High content burden per sprint.

**E — Asymmetric Faction Schools (17):** Conceptually gorgeous — Frequentist vs Bayesian vs Nonparametric as faction identities. Wrong layer for an intro course: students don't have the conceptual frame to choose a school until mid-course. Scope cost 3× other candidates. Post-product-market-fit target.

**F — Spatial Tiling Daily (18):** Beautiful for the prerequisite map and daily habit loop. Main risk: tile placement is about graph topology of concept relationships, not statistics itself — stats sits *next to* the puzzle rather than *inside* it. Decoration risk high.

**G — NPC-Trading Data Marketplace (19):** "Transform datasets to fill orders" does use real statistical operations. Main weakness: trading/inventory UI is significant plumbing for a decision that's often "which transformation label matches?" — easily becomes resource-shuffling.

**H — Boss-Battle Encounters (23):** Highest wonder ceiling — a regression boss attacking with outliers teaches leverage viscerally. Unfakeable per-encounter mechanics. Weakness: every boss is a hand-authored bespoke mechanic. Highest content cost, slowest to first playable. Ideal *end-game shell* for C (the sampling loop could be one boss's mechanic), not a first build.

---

## Top-3 Ranking

### #1 — C: Push-Your-Luck Sampling — "The Sampling Cauldron" *(Score: 26)*

The decision *is* the concept with zero translation loss: every pull is a sample, every "stop" is a stopping rule, and the tension the player feels in their gut — *"is my estimate good enough yet, or do I risk one more pull?"* — is literally the sampling-precision tradeoff that intro students fail to *feel* from a textbook.

It has the best decision rhythm (live choice every 3–8 seconds), is essentially impossible to implement as decoration (bag math drives the outcome), and a solo dev can ship a real prototype in one sprint. It is the rare candidate that is simultaneously the most honest, the most playable, and the cheapest. It reuses the existing SM-2 store and question bank directly.

**Board game:** *Quacks of Quedlinburg* (Wolfgang Warsch)  
**Mobile game:** *Threes / Two Dots* + *Reigns* (binary high-stakes single-decision pacing)  
**Educational precedent:** Brilliant.org CLT simulations, *Seeing Theory* (Daniel Kunin)

### #2 — A: Dice Forge — "Forge Your Distribution" *(Score: 25)*

Dice Forge's ceiling is higher — crafting the distribution you roll from is the most beautiful "you become the statistics" idea in the set, and its engine-building compounds harder than C's. Weakness vs #1: forging is a slow, deliberate meta-decision (every few minutes), not a continuous heartbeat. Moment-to-moment rolling can feel like watching dice rather than deciding. C wins because its core tension is *continuous and self-evidently statistical*; A wins the long game but is a riskier first bet.

### #3 — H: Boss Battles — "Statistical Bestiary" *(Score: 23)*

Key strength: the highest wonder-per-topic floor and branching boss-select gives genuine agency over what to learn next. Every boss is unfakeable (per-encounter unique mechanic). Ranks third only because every boss is hand-authored — content cost makes it the slowest to a playable loop. Natural **end-game architecture** once C is shipped: the Sampling Cauldron becomes one boss, Dice Forge becomes another, and the Bestiary is the meta-layer.

---

## #1 Detailed Spec: "The Sampling Cauldron" (דוד הדגימה)

### Concept + pitch

A push-your-luck brewing game where you pull data tokens from a bag to estimate a hidden truth. The only real decision is *when you have sampled enough* to cash in before noise or contamination ruins your batch.

**Theme (VISION emotional pull #1):** The player runs an **estimation apothecary** — a Hebrew-named shop that takes "reading requests" from NPC clients. Each reading = estimating a population parameter. You brew readings by drawing samples into your cauldron.

### Core loop

A *session* = one client order (~60–120s). A *turn* = one pull (~3–8s).

1. **Order arrives.** Client states a target parameter, a **tolerance** (how close the estimate must land), and a **payout curve** (tighter estimate = more gold).
2. **Inspect the bag.** See the bag's *advertised* properties: token count, spread indication, cost per pull. The true parameter is hidden.
3. **Pull a token.** Each token = one data point. Running estimate (sample mean / proportion) and a live **confidence band** update on every pull.
4. **Decide: pull again or cash in.** The heartbeat. More pulls → narrower band → higher payout, BUT each pull costs gold, and the bag contains **contaminant tokens** (outliers / biased samples) that widen the band; a "spoil" token triggers a partial reset.
5. **Cash in.** Final estimate locked. Score = how close the interval covered the true value × payout curve − pull costs.
6. **Reward → engine.** Gold buys **brewing tools** that change how future bags behave.

### Stats integration (concepts player USES to decide)

| Concept | How it drives the decision |
|---|---|
| Law of large numbers | Watch the estimate stabilize — "is it stable enough?" IS the LLN |
| Confidence intervals | Live band IS a CI; player chooses 90/95/99% level — wider vs safer |
| Standard error / √n | Band visibly shrinks slower as n grows; player feels diminishing returns |
| Sampling distribution + variance | High-variance bags need more pulls to hit tolerance |
| Outliers / robustness | Contaminant tokens teach: median vs mean as a tool choice |
| Sampling bias | Some bags are *biased* — a late tool lets you detect and correct |

Every statistic is the *input to the decision*, never the answer to a question about itself.

### Decision rhythm

| Decision | Frequency |
|---|---|
| Pull or stop | Every 3–8s (heartbeat) |
| Which confidence level / estimator to equip | Once per session (~60–120s) |
| Which order to accept from order board | Once per session (topic-branch agency) |
| Which brewing tool to buy | Every few sessions (engine layer) |

The order board shows 3 orders tagged by topic (proportion / mean / two-group). Player *chooses* which to take — this satisfies the "branching paths, not forced linear" agency requirement and feeds the SM-2 spaced-repetition scheduler.

### Engine-building mechanic

Mastered concepts unlock **brewing tools** that permanently upgrade the loop:

| Tool | Unlocked by | Effect |
|---|---|---|
| **Sieve** | Std error mastery | See bag's variance numerically before accepting |
| **Twin Ladle** | Sampling distribution | Pull 2 tokens per action (speed vs cost tradeoff) |
| **Filter** | Outlier mastery | Auto-discard single most extreme token per batch |
| **Tolerance Lens** | CI mastery | Set a custom confidence level mid-brew |
| **Bayesian Pinch** | (Late game) | Start each brew with a prior from past similar orders |

Compounding: mastering variance early → accept high-variance/high-payout orders → earn more gold → buy Twin Ladle → faster brews → snowball. Tools are the deck that thickens (Splendor / Dice Forge energy).

### Failure modes (informative + recoverable)

| Failure | What happens | Lesson conveyed |
|---|---|---|
| Cash in too early | Reduced (not zero) payout; reveal shows truth outside band | Band too wide; stopped at n too small |
| Pull too long | Costs eat profit despite perfect estimate | Precision has a price; over-sampling is an error |
| Pull a spoil token | Partial reset (lose last few pulls), not total loss | Contaminated sample — the Filter tool counters this |

Every failure ends on a **reveal screen** showing the final band vs the true parameter on the same number line. Wrongness is *geometry*, never a red X.

### Visual / spatial representation (locked palette only)

- **Center:** horizontal **number line** (the estimand axis). Tokens drop as dots. Running mean = `--gold` vertical marker. Confidence band = translucent `--teal` rectangle that *visibly narrows* with each pull. Wonder tap: students watch certainty tighten.
- **Bottom thumb-zone (Apple HIG 44pt):** giant **PULL** button (`--teal`), **CASH IN** button (`--gold`). One-handed, above the fold.
- **Top:** client order card (Hebrew RTL) — target, tolerance shown as `--amber` goalpost zone on the number line, gold spent so far.
- **Contaminant tokens:** drop in `--red`, visibly widen the band — cause-and-effect spatial.
- **Reveal:** true parameter drops as `--gold-light` star. Band glows `--teal` (covered) or `--red` (missed). Scale-bounce + sound.
- **Background:** `--bg` (`#0e0f12`). Panels: `--bg-2` / `--card`. No new hex values introduced.

*UI inspiration: Linear.app (dark density + status feedback), Apple HIG iOS dark (44pt targets, bottom thumb-zone), Mini Metro (minimal HUD, immediate feedback on every action).*

### First 5 minutes (new player walkthrough)

| Time | Action |
|---|---|
| 0:00 | Demo mode, no login. Single client card slides up: *"כמה מהדגים נגועים?"* Amber goalpost zone on the number line from 0–1. |
| 0:15 | Pulsing PULL button. Tap. Dot drops at 0.0. Wide teal band fills most of the line. Copy: *"דגמת דג אחד. עדיין לא יודעים הרבה."* |
| 0:30 | Tap again × 4. Dots scatter, gold marker settles near 0.3, band narrows toward amber zone. No instruction needed. |
| 1:00 | Band edges inside amber. CASH IN glows gold. First real decision: stop (safe) or pull for bonus? |
| 1:20 | Cash in. Reveal: truth at 0.28 lands inside band. Teal glow, bounce, coin sound. +40 gold. |
| 1:40 | Second order: higher variance, bigger payout. Tooltip: "יצטרך יותר משיכות". First strategic choice: risk vs reward. |
| 2:30 | Over-pulled. Perfect estimate, low net profit. Lesson: *precision costs.* |
| 3:30 | Shop: Sieve vs Twin Ladle. First engine decision. Either changes next session. |
| 4:30 | Order board with 3 orders, topics tagged. Branch + agency surface. Player chooses what to learn next (SM-2 surfaces weak topic). |

By minute 5: internalized LLN, felt precision–cost tradeoff, made an engine choice, chose their next topic — all through play, no lecture.

### MVP scope

**Sprint 1 (~2 weeks):** Proportion estimand only (binary tokens, simplest math). Bag draw engine + running estimate + live Wald CI band. PULL / CASH IN loop, cost per pull, payout curve, reveal screen. 3 hand-authored orders. 1 tool (the Sieve). Hebrew RTL UI, locked palette, number-line viz. Wire mastery → existing SM-2 scheduler.

**Sprint 2:** Mean estimand (continuous tokens), variance reading, contaminant tokens + spoil reset, Filter + Twin Ladle tools, topic-tagged order board.

**Sprint 3:** Confidence-level choice (Tolerance Lens), median vs mean robust decision, biased-bag detection, Bayesian Pinch.

**Cuttable without breaking the loop:** everything except the irreducible core — **bag → pull → live band → stop → reveal.** That alone teaches LLN and CI as a real game.

### Risks + mitigations

**Risk 1 — "Just keep pulling" degenerate strategy.** If pulls are too cheap, optimal play is always max-sample, killing the decision. *Mitigation:* tune cost curve so payout gain from pull n+1 crosses below its cost near the tolerance threshold. Add a per-order pull budget (bag runs dry). Tune the cost curve as the #1 lever — this is where the game lives or dies.

**Risk 2 — Players pattern-match the band without learning the underlying math.** They stop when "teal touches amber" without understanding it's a CI. *Mitigation:* periodically inject micro-interrogations at cash-in ("the truth has ~95% chance of being inside this band — true or false?") tied to the existing question bank. Vary the confidence level so the band-to-goalpost rule changes, forcing conceptual reading. Keeps the question bank alive without reverting to quiz-only.

---

## Required citations (per VISION rules)

### Board game
- **Primary: Quacks of Quedlinburg** (Wolfgang Warsch) — bag-building push-your-luck; the "pull until you decide to stop, risk a spoil token" tension is the direct mechanic template.
- **Secondary: Dice Forge** (Régis Bonnessée) — informs the tool-upgrade engine layer (mutable starting conditions that compound into differentiated strategies).
- **Supporting: Stuffed Fables** (Jerry Hawthorne) — informs the end-game Boss-Battle architecture that C grows toward.

### Mobile game
- **Primary: Two Dots / Threes** — minimal HUD, one-thumb primary action, instant-restart loop. Informs the PULL/CASH-IN button sizing and the "one screen, one decision" layout rule.
- **Secondary: Reigns** — binary high-stakes single-decision pacing informs the pull-or-stop heartbeat rhythm.

### UI source
- **Linear.app** — dark UI density, immediate status feedback (band width change = status update on every action).
- **Apple HIG iOS dark mode** — 44pt hit targets, bottom-zone primary action, depth layering for card/panel hierarchy.
- **Mini Metro** — minimal HUD, spatial data representation on a clean axis, no instructional overhead.

### Educational precedent
- **Brilliant.org** interactive sampling/probability simulations — watching an estimate converge as n grows.
- **Seeing Theory** (Daniel Kunin, Brown University) — proves that watching a CI band narrow teaches sampling precision better than the formula.
- **Anki / SM-2 interval research** — the 15–30s decision interval spec draws from memory-research consensus on optimal decision density in active recall.

---

## What comes next (Cycle 2)

Cycle 2 should build Sprint 1 of "The Sampling Cauldron" behind a feature flag. Minimum shippable:

1. `src/config/featureFlags.ts` — add `SAMPLING_CAULDRON: false` (off by default).
2. `src/components/SamplingCauldron/` — the core loop component.
3. Wire into existing routing behind the flag.
4. At least one Vitest unit test for the bag-draw / CI-band pure logic.
5. `npm run build` must pass.

The architecture decision for Cycle 2: treat the Cauldron as a **self-contained game mode** accessible from the existing learning map (or as a new route `/cauldron`) — not a replacement for the existing quiz loop. It competes for player time and proves the loop stands alone.
