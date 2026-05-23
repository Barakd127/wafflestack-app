# WaffleStack — Proactive Cycle 01: Gameplay Design Space Exploration

**Date:** 2026-05-23  
**Branch:** `proactive/exploration/games-design-space`  
**Cycle type:** Exploration only (no code)  
**Model used for design decision:** Claude Opus 4.7 (one call, ≤4k output)

---

## Context

WaffleStack teaches intro statistics to Israeli BA social-science students through a game — not quizzes with cosmetic rewards. The core rule from VISION.md:

> **Gamification ≠ Gameplay.** The player must make a meaningful decision that USES a statistical concept, every 15–30 seconds.

The existing app ships a 3D city where buildings appear as XP rewards. VISION.md flags this as "decoration risk" — buildings must be consequences of player decisions, not prizes for answering.

This exploration evaluates candidate gameplay loops against the vision criteria and selects the #1 loop for Cycle 2 implementation.

---

## 1. Scored Candidates (5–8 loops)

| # | Loop name | Mechanics drawn from | Decision rhythm /10 | Stats integration /10 | Wonder-tap /10 | Engine-building /10 | Anti-decoration /10 | **Total /50** |
|---|---|---|---|---|---|---|---|---|
| L1 | **Pipeline Foundry** | Mechs vs Minions (pre-commit) × Century: Spice Road (station upgrade) × Mini Metro (author-a-network) | 8 | 10 | 9 | 9 | 9 | **45** |
| L2 | **Dice Forge Lab** | Dice Forge (mutable dice) × engine-builder | 9 | 9 | 8 | 10 | 7 | **43** |
| L3 | **Triage Cafe** | Coffee Rush (real-time triage) × collection | 10 | 7 | 7 | 6 | 8 | **38** |
| L4 | **Patchwork Hypothesis** | Patchwork (spatial tiling) × Wordle (daily puzzle) | 7 | 9 | 7 | 5 | 10 | **38** |
| L5 | **School Wars** | Cry Havoc (asymmetric factions) × Godfather: Corleone's Empire (influence) | 6 | 8 | 8 | 9 | 6 | **37** |
| L6 | **Resource Pyramid** | Century: Spice Road (pickup-and-deliver) × city builder | 7 | 8 | 5 | 8 | 8 | **36** |
| L7 | **Stat-Beasts Brawler** | Stuffed Fables (asymmetric encounters) × Arctic Scavengers (tribe leader) | 7 | 6 | 9 | 7 | 5 | **34** |

### Scoring rubric

| Axis | 10 = | 0 = |
|---|---|---|
| Decision rhythm | Meaningful choice every 15–30s, no dead time | Long idle stretches or micro-spam |
| Stats integration | Player USES the concept to make the decision | Player only sees the concept as flavour |
| Wonder-tap | The moment you lean forward | Feels like any other school exercise |
| Engine-building | Early choices compound into late leverage | Each session is flat, no accumulation |
| Anti-decoration | Very safe — loop structurally prevents cosmetic slippage | High risk of slipping into XP-confetti |

---

## 2. Rationales

**L1 — Pipeline Foundry (45/50)**  
Player drafts a hypothesis-testing pipeline (sample → assumption check → test → effect size → interpret) as factory belts in the 3D city. Each tick, simulated data flows through the placed buildings and breaks visibly at the wrong station. Every concept is a *placed component*, not a placard. Salvages the existing R3F city entirely — buildings now exist because the player bought them, not because they answered correctly.

**L2 — Dice Forge Lab (43/50)**  
Each "die" is a sampling distribution sculpted by buying faces (n, σ, transformation). Roll against daily challenges; watch distributions converge. Strongest pure engine, but the 3D city becomes a backdrop — slight decoration risk returns and would require a city rethink.

**L3 — Triage Cafe (38/50)**  
NPCs arrive with statistical needs under a timer; player decides who to serve first. Fast and addictive. Degenerates into pattern-matching once players learn the recipes — statistics becomes a lookup table, not a tool.

**L4 — Patchwork Hypothesis (38/50)**  
Daily tile puzzle: pieces are α, n, effect size, power — fit them in a budget. Excellent constraint pedagogy (tradeoff between sample size and effect size is *felt*, not explained). But this is a *daily mode*, not a campaign spine.

**L5 — School Wars (37/50)**  
Place influence (frequentist/Bayesian/nonparametric) on contested datasets. Identity-rich, strong asymmetry. Heavy localization cost; scope risk high.

**L6 — Resource Pyramid (36/50)**  
Carry "means" to make "variances" to make "t-stats". Honestly maps prerequisite topology. Low wonder-tap — resource conversion feels like arithmetic, not statistics.

**L7 — Stat-Beasts Brawler (34/50)**  
Charisma but concept-creature mapping is forced ("what is a chi-square beast?"). Risk of stats becoming flavour text on creature cards.

---

## 3. Top-3 Ranking

| Rank | Loop | Score | Why it ranks here |
|---|---|---|---|
| 🥇 1 | Pipeline Foundry | 45 | Keeps and *justifies* the R3F city; every decision uses a stats concept; content scales via JSON datasets with no new mechanics |
| 🥈 2 | Dice Forge Lab | 43 | Strongest engine-builder; but city becomes vestigial — would require admitting the city was a mistake |
| 🥉 3 | Patchwork Hypothesis | 38 | Best per-minute pedagogy; excellent as a *daily mode* feature nested inside L1, not as the spine |

**Tiebreaker L1 vs L2:** Pipeline Foundry earns its place because it transforms the existing 3D city from cosmetic reward into authored infrastructure — each building is a pipeline station the player placed and upgraded. Dice Forge Lab is superior as a *standalone*, but WaffleStack already has a city; we should fix it, not abandon it.

**Note on L4:** Patchwork Hypothesis should be built as the *daily challenge* mode inside Cycle 2's Pipeline Foundry — it slots in naturally as the "Headline Case" feature.

---

## 4. #1 Detailed Spec — Pipeline Foundry

*Produced by Claude Opus 4.7, single design call.*

### Premise

The player runs a small **statistical consultancy** rendered as a 3D city block. Each building is a *pipeline station* (Sampler, Assumption Checker, Test Engine, Effect-Size Reporter, Visualizer). Clients arrive with messy datasets and a question ("Did the new curriculum raise scores?"). The player **routes the dataset through their city**, choosing which stations process it, in which order, with which parameters. They pre-commit the pipeline, hit RUN, and watch data flow building-to-building — like Mechs vs Minions cards executing, except the "cards" are buildings they placed and upgraded. Wrong pipelines produce *visibly wrong inferences* (a CI that doesn't cover, a p-value inflated by violated assumptions) and the client gives diagnostic feedback.

### Core Decision Loop (~20s cadence)

| t | Player sees | Decides | Consequence | Feedback |
|---|---|---|---|---|
| 0–5s | Client card: question + dataset preview (n, variables, scale) | Which question type? (compare means / test association / estimate) | Routes to a pipeline track | Track lights up |
| 5–15s | Empty conveyor with slots; available stations glow | Sequence 3–5 stations; set 1 parameter per station (α, tail, transform) | Pipeline compiles; warnings appear on incompatible adjacencies | Inline lint: "t-test after Levene fail → did you mean Welch?" |
| 15–25s | RUN — data packets visibly flow building-to-building | Watch; optional mid-flow interrupt (spend a token to re-route) | Inference card produced | Client reaction + ground-truth reveal |
| 25–30s | Outcome screen: your CI vs true parameter, your decision vs truth | Bank reward, upgrade a station, or accept a harder client | Compounds | New unlock |

### Concept → Decision Map

| Statistical concept | Decision the player makes |
|---|---|
| **Sampling / n** | Sampler station: pay more for larger n, or risk wider CI |
| **Assumption checks (normality, homoscedasticity)** | Place (or skip) the Levene/Shapiro station; skipping is faster but lints the downstream test |
| **Test selection (Student's t vs Welch vs Mann-Whitney)** | Test Engine dial; wrong dial = wrong null distribution, visibly wrong p |
| **Effect size vs p-value** | Reporter station: choose to surface Cohen's d, η², r — clients pay more for effect size |
| **Confidence intervals** | Visualizer shows CI as a bar over true parameter; coverage is the score |
| **Multiple comparisons (Bonferroni / FDR)** | Fan out to 5 tests → Correction station appears as buildable; ignoring inflates false positives across the session |

### Failure State

A wrong pipeline produces a **wrong inference card** — not a fail screen. The client says: "You told me the curriculum worked, but here's next year's data and it didn't replicate." The post-mortem **replays the pipeline highlighting the violated step** (e.g., "Levene p = .003, you ran Student's t"). The player loses *reputation* (soft currency), not progress. Repeated same-error triggers an SM-2 review card for that concept — tying the existing spaced-repetition engine directly into the failure path.

### 3D City Integration — Keep and Justify

The city stops being decoration the moment every building is an *authored station*. New buildings appear because the player bought a Welch's t Engine, not because they answered a quiz. Upgrades visibly modify the building (bigger Sampler = taller silo). Conveyor belts between buildings render data flow in real time — this is the wonder-tap moment. R3F is already in the stack; implementation needs belts (extruded splines along Catmull-Rom curves) and packet meshes (instanced geometries animated on a shared clock).

### Session Length & Stopping Point

- **Target:** 6–10 minutes, 3 clients per session.
- **Natural stop:** After each client, a clear "End shift / Next client" prompt. End-of-shift screen shows reputation delta, concepts reinforced, and tomorrow's headline client.
- **Daily challenge:** One "Headline Case" with optional leaderboard (variance of player CIs vs ground truth).

### Technical Feasibility

| Component | Approach | Risk |
|---|---|---|
| Pipeline DSL | Typed array of station configs; pure-function executor in a Web Worker | Low |
| Data simulation | Seeded PRNG (SM-2 already needs this); generate datasets from declared ground truth | Low |
| 3D conveyor belts | `<TubeGeometry>` on Catmull-Rom spline, instanced packet meshes, shared clock | Medium — needs R3F performance tuning |
| Hebrew RTL | Pipeline reads right-to-left naturally; no new i18n work | Low |
| Persistence | Extend existing Zustand store + IndexedDB with `pipelines`, `stations`, `reputation` | Low |
| New dependencies | None | — |

### Inspirations

- **Board games:** *Mechs vs Minions* (pre-commit watch-execute loop) + *Century: Spice Road* (station-as-engine upgrade path)
- **Mobile games:** *Mini Metro* (author a network, watch it run, intervene under pressure) — primary. *Reigns* (client-card cadence) — secondary.
- **UI:** *Linear* for the pipeline composer (keyboard-first, dense, monospace parameter chips). *Mini Metro* for the in-city HUD (minimal, glanceable, one accent per active dataset).

### Risk Flags

| Risk | Mitigation |
|---|---|
| R1 — Pipeline complexity creep | Cap at 6 stations per track for first 10 hours; unlock branching later |
| R2 — "Just memorize the recipe" | Randomize dataset pathologies per client (sometimes t-test is correct, sometimes Welch, sometimes nonparametric) — assumption-check station stays load-bearing |
| R3 — 3D performance on low-end laptops | Instanced geometry for packets; offer 2D fallback toggle under a feature flag |
| R4 — Hebrew technical vocabulary | Station names get glossary tooltip on first sight (reuse existing coachmark pattern) |
| R5 — Client question authoring cost | Build a JSON schema + 20 templates before scaling; each client is a pure-data file |

---

## 5. Recommendation for Cycle 2

**Build Pipeline Foundry.** Start with:

1. `src/config/featureFlags.ts` — add `PIPELINE_FOUNDRY: false` flag
2. `src/stores/pipelineStore.ts` — stations, client queue, reputation, active pipeline DSL
3. `src/components/PipelineComposer.tsx` — the slot-based pre-commit UI (desktop prototype; mobile after validation)
4. `src/lib/pipelineEngine.ts` — pure-function executor (Web Worker candidate)
5. `src/lib/dataSimulator.ts` — seeded dataset generator with ground-truth parameters
6. Extend existing R3F city scene with belt geometry between placed station buildings

**L4 Patchwork Hypothesis** → implement as the daily Headline Case feature inside the same flag, once the client-card loop is stable.

---

## 6. Vision Alignment Check (Exploration Cycle)

| Rule | Compliant? | Note |
|---|---|---|
| What we are: stats-first via game | ✓ | Pipeline Foundry: every decision uses a stats concept |
| Gameplay ≠ Gamification | ✓ | Buildings = authored stations, not XP prizes |
| Design rule: Hebrew-first | ✓ | No new UI this cycle; Cycle 2 spec includes RTL by default |
| Design rule: dark UI | ✓ | No new colors this cycle |
| Color palette: only locked tokens | ✓ | Exploration only — no hex values introduced |
| UI source cited | ✓ | Linear (pipeline composer) + Mini Metro (city HUD) |
| UI anti-pattern avoided | ✓ | Bottom-sheet for client card, no modal stacks |
| Tech invariant: Tailwind only | ✓ | No styling shipped this cycle |
| Tech invariant: Zustand only | ✓ | Spec uses Zustand store |
| Tone rule: encouragement | ✓ | Failure = diagnostic replay, not punishment |
| Mobile-first | ✓ | Desktop prototype first; mobile validated second (explicitly noted as risk) |
| Out of scope: stays in scope | ✓ | No multiplayer, no auth, no monetization |

**NotebookLM consulted:** no — MCP connector not available in this container. Design judgment + VISION.md catalogue + Opus 4.7 used instead.  
**Board-game inspiration:** *Mechs vs Minions* (pre-commit execute) + *Century: Spice Road* (station engine).  
**Mobile-game inspiration:** *Mini Metro* (author network, watch run, intervene).  
**Decision interval:** every ~20 seconds.  
**Statistical concept used in decision:** hypothesis-testing pipeline (test selection, assumption checks, effect size, CI coverage, multiple comparisons).
