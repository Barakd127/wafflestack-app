# WaffleStack — Gameplay Exploration, Cycle 1

**Date:** 2026-05-30  
**Branch:** `proactive/exploration/games-design-space`  
**Model routing:** Haiku → context read + git history; Opus → design decision; Sonnet 4.6 → synthesis + PR

---

## Framing

WaffleStack must be a **real game first**. The current city-builder loop is diagnosed in VISION.md as "decoration not decision": a building appears *after* you answer correctly — the statistics and the reward are causally separate. The math is removable without breaking the loop, which is the failure mode to escape.

**Candidate criteria (from VISION.md):**
- Decision every 15–30 seconds
- Decision MUST USE the statistical concept, not just be adjacent to it
- Choices compound (engine-building energy)
- Failure is informative + recoverable
- Spatial/visual representation where the concept allows
- Player agency over what to learn next

---

## Scoring Table

All 8 candidates scored 1–5 on six dimensions (max 30). Scoring conducted by Opus 4.8, model routing per cycle spec.

| # | Candidate | Decision rhythm | Wonder tap | Engine-building | Topic fit | Decoration-risk resist | Mobile feasibility | **Total** |
|---|---|---|---|---|---|---|---|---|
| 5 | 🎲 **Mutable-dice engine** (Dice Forge) | 5 | 4 | 5 | 5 | 5 | 5 | **29** |
| 1 | 🏪 **"Run a place" engine-builder** | 4 | 5 | 5 | 4 | 3 | 4 | **25** |
| 6 | 🌶 **Pickup-and-deliver** (Century Spice Road) | 4 | 3 | 5 | 5 | 4 | 4 | **25** |
| 3 | ⚙️ **Pre-commit programming puzzle** (Mechs vs Minions) | 3 | 3 | 4 | 5 | 4 | 3 | **22** |
| 8 | 🧵 **Spatial-tiling daily** (Patchwork + Wordle) | 4 | 4 | 3 | 3 | 3 | 5 | **22** |
| 2 | 🧸 **Collection asymmetric brawler** (Stuffed Fables) | 4 | 5 | 3 | 2 | 2 | 3 | **19** |
| 4 | 🏨 **Real-time triage** (Coffee Rush) | 5 | 3 | 2 | 3 | 3 | 3 | **19** |
| 7 | 🕴 **Influence + bluff** (Godfather: Corleone's Empire) | 2 | 3 | 4 | 2 | 3 | 3 | **17** |

**Scoring notes:**
- **Topic fit** is where most candidates quietly fail. Real-time triage and collection-brawler score 2–3 because statistics becomes a *gate* in front of an unrelated combat/serving mechanic — you answer a question, *then* you play the game. That is the exact "quiz-with-a-game-wrapper" VISION.md rejects.
- **Decoration-risk resistance** asks: if you stripped the math out, does the game collapse? Mutable-dice scores 5 because die faces *are* the probability distribution — remove stats and there is literally no die to roll. "Run a place" scores 3: a coffee shop is fun without stats, so the math can drift to flavor (the city-builder's exact failure mode).

---

## Top-3 Ranking

### 🥇 #1 — 🎲 Mutable-Dice Engine ("Probability Forge"), score 29/30

The only candidate where **the object the player manipulates is itself a statistical distribution.** You do not answer a question to earn a die face; you reshape the die's faces, and the shape you build determines what you roll. Probability, sampling, expected value, variance, and distribution families are not topics *behind* the mechanic — they *are* the mechanic. Tightest decision rhythm (every roll + every face-craft is a choice), best mobile fit (a die is one thumb-tap). One weakness — natively a *probability* engine — is solvable by extending to inference in Cycles 2–3.

**Why it beats the city-builder:** The city's flaw is causal separation — stats and reward disconnect. In the Forge, the die's faces *are* the distribution's parameters. You cannot remove the statistics without removing the only object the player touches.

### 🥈 #2 — 🏪 "Run a Place" Engine-builder, score 25/30

Strongest *wonder tap* (the "run your own cool place" daydream VISION.md explicitly names) and genuine compounding. But it carries the same latent disease as the current city: a coffee shop is intrinsically charming, so under deadline pressure the stats slides into decoration. It wins only if every upgrade is *defined by* a statistical operation — hard to maintain over multiple build cycles.

### 🥉 #3 — 🌶 Pickup-and-Deliver / Resource Pyramid (Century Spice Road), score 25/30

The cleanest *curriculum map* on the list: higher concepts literally require lower concepts as input resources, so prerequisite structure becomes the board. Excellent engine-building and topic fit, but lower wonder and a flatter emotional pull.

---

## #1 Detailed Spec — 🎲 "קוביית ההסתברות" / The Probability Forge

**Board inspiration:** Dice Forge (Régis Bonnessée, 2017 — BGG/233097)  
**Mobile inspiration:** Dicey Dungeons (Terry Cavanagh, 2019) + Threes (Sirvo, 2014) — one-thumb craft-then-commit loop, instant restart  
**Decision interval:** 12–20 seconds  
**Statistical concept used in decision:** Expected value + variance trade-off (player CRAFTS the distribution, not answers about it)  
**UI inspiration:** Mini Metro (minimal HUD, spatial clarity), Duolingo path-tree (topic branching)

---

### Core Game Loop

You own a set of **blank dice** rendered as physical waffle-tiles. Each die has 6 faces you can *forge*. To win a round you must satisfy a **target** — "produce a sample whose mean lands inside this band," "make the probability of a success ≥ 0.7," "build a die whose variance is lowest among the three." You forge faces using **mastered topics as currency**, then **roll**, watching the outcomes stack as a live waffle-chart (the existing waffle metaphor, finally load-bearing). You read the empirical result against the target, decide whether to re-forge, roll more (push-your-luck: more rolls = tighter estimate but costs turns), or commit. The die you craft *is* the distribution; the rolls *are* the sample; the chart *is* the sampling result. Every decision is a statistical judgment.

---

### How the Player USES the Concept (Concrete Example)

**Target topic: Expected value + variance trade-off.**

The round-target says: *"Land a sample mean between 3.4 and 3.6 across 10 rolls. Reward scales inversely with variance."*

The player has two forge options with the same EV:
- **Die A:** faces {3, 3, 4, 4, 3, 4} → E[X] = 3.5, low variance
- **Die B:** faces {1, 1, 6, 6, 1, 6} → E[X] = 3.5, high variance

Both have identical expected value — a beginner picks B because the faces "look bigger." The player must **compute or feel that B's spread will overshoot the band far more often**, so Die A is correct under a variance-penalized target. The decision *is* the variance concept; there is no separate quiz.

A second concrete example, **binomial:** the die is a coin the player forges (faces = H/T ratio). Target: *"P(at least 4 heads in 6 flips) ≥ 0.5."* The player forges the head-probability by adding head-faces, runs the trial, and reads the empirical proportion against the binomial expectation. They are **building the parameter p** with their thumb.

---

### Session Structure (5–10 min)

| Time | What happens |
|---|---|
| 0:00–0:30 | Daily forge target appears (Wordle-style shared daily + your own branch path). Bottom-sheet, one CTA. |
| 0:30–4:00 | 3–4 short rounds. Each: forge (2–3 face decisions) → roll → read waffle chart → re-forge or commit. ~12–20s per decision, ~6–10 decisions per round. |
| 4:00–7:00 | One "combine" round: two mastered dice interact (sum of two dice → introduces convolution / CLT visually — summed-die chart bulges toward normal). Engine payoff moment. |
| 7:00–9:00 | Commit results; mastered faces get **etched permanently** into your forge inventory (collection/wonder tap). Streak + next branch unlocks. |

---

### Progression — How Early Decisions Compound

Forged faces are **persistent inventory**, not consumed. Mastering "normal distribution" unlocks a *bell-curve face-set* you can slot into any future die; mastering "effect size" unlocks a face that *shifts a die's mean by a chosen δ*. Early choices compound like Dice Forge: a player who invested in low-variance precision faces can tackle confidence-interval rounds cheaply later; a spread-specialist breezes through power/effect-size rounds.

**Branching agency** (VISION rule): the topic tree is a forge-tree — you choose to deepen "distributions" or branch into "inference," and your die inventory reflects your school. This directly carries the Arctic Scavengers tribe-leader pattern VISION.md flagged.

**Recommended build order:**
- Cycle 2 — single-die EV/variance forge + waffle-roll histogram (proof-of-concept prototype)
- Cycle 3 — persistent inventory + binomial/coin target + topic branch tree
- Cycle 4 — two-die "combine" (CLT/convolution visual) + daily challenge

---

### Visual Metaphor + Spatial Representation

The **waffle** is finally a mechanic, not a logo: every roll drops a square into a 10×10 waffle grid, so a sample *builds a waffle-shaped histogram in real time*. Die faces are physical waffle-tiles the player drag-slots (spatial). Distribution shape = the silhouette of the stacked waffle. Variance = visible width of the splatter.

This satisfies the "spatial/visual if the concept allows" rule and **reuses the existing R3F/waffle assets** — the 3D city's grow-an-object wonder survives, but now each forged die is the collectible that "comes alive" when rolled.

---

### Failure State (Informative + Recoverable)

There is **no wall.** If your sample misses the band, the waffle chart *shows you why*: the overlay marks the target band in `--teal`, your empirical mean as a `--gold` line, and the miss distance in `--red`. Feedback is one Hebrew sentence (Tone rule): *"הקובייה שלך מפזרת רחב מדי — התוחלת נכונה אבל השונות הקפיצה אותך החוצה"* ("Your die spreads too wide — the mean is right but variance threw you out"). The player re-forges and retries the same round for reduced reward, or banks a partial. Failure **teaches the exact parameter they mis-set** — that is the definition of informative.

---

### Hebrew-First Considerations

- Full RTL layout: forge-tray on the right, roll-zone on the left; Latin numerals on die faces are fine (technical-term exception per Tone rules).
- Copy warm, second-person, gender-adapted (אתה/את) per Tone rules; encouragement language on miss.
- All accents from locked palette: target band `--teal`, player's mean `--gold`, miss `--red`, info/label `--blue`. No new hexes.
- Bottom-sheet feedback (not modal), 44pt drag targets, one-thumb forge — satisfies mobile-first + avoids VISION.md's listed UI anti-patterns.

---

## Sources Cited

| Category | Source | Mechanic borrowed |
|---|---|---|
| Board game | Dice Forge (BGG/233097, Régis Bonnessée) | Mutable die faces as persistent upgradeable inventory |
| Board game | Arctic Scavengers (BGG/2905, Robert Kyle Volko) | Tribe-leader / school branching identity |
| Board game | Century: Spice Road (BGG/209685) | Resource-pyramid map for prerequisites (runner-up reference) |
| Board game | Mechs vs. Minions (BGG/209010) | Pre-commit sequence mechanic (runner-up reference) |
| Mobile game | Dicey Dungeons (Terry Cavanagh, 2019) | One-thumb roll-and-respond loop, instant feedback density |
| Mobile game | Threes (Sirvo, 2014) | Craft-then-commit decision interval, zen flow |
| Mobile game | Mini Metro | Minimal HUD, spatial histogram readability |
| UI source | Duolingo | Path-tree (topic branch / forge-tree visual) |
| UI source | Linear.app | Dark-UI density, status pill feedback, bottom-sheet on mobile |
| UI source | Apple HIG (iOS dark mode) | 44pt hit targets, one-thumb reach zone |

---

## Open Questions for Barak

1. **Waffle grid reuse:** The existing 3D city's waffle visuals — can they be forked into a 2D waffle-histogram component without breaking the city scene? (Needs a read of `src/three/` + `src/components/` before Cycle 2.)
2. **Hebrew die-face typography:** Do Latin numerals on die faces feel right, or should we use Hebrew letter-numerals (א=1, ב=2…)? The latter adds cultural resonance but may confuse students used to Western notation.
3. **Scope gate for Cycle 2:** Should Cycle 2 build *only* the single-die EV/variance forge as an isolated screen (cleanest proof), or wire it into the existing Study Hub session flow?
4. **Existing SM-2 quiz bank:** The 100-question bank currently drives the quiz loop. In the Forge, questions become *round targets* (not multiple-choice). Is it acceptable to derive Forge targets from quiz-bank concept tags, or build a separate target library?
