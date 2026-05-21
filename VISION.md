---
title: WaffleStack Vision
status: living document
tags: [vision, north-star, system]
created: 2026-05-17
updated: 2026-05-21
audience: agents + Barak
---

# WaffleStack — Vision (North Star)

**Every proactive agent reads this before acting. Every PR is graded against it.** If a change cannot be justified against a rule below, the agent must NOT make it — must surface the conflict as an open question in the PR description instead.

---

## What we are

A Hebrew-first, gamified web app that teaches statistics through **city/world building**, not flashcards. The player learns by playing a real game — not by being quizzed inside a thin game wrapper. Statistics mastery is the **win condition**, not a side effect.

Target learners:
- **BA social-science students** in Israel taking intro statistics (primary).
- **High-school exam-preppers** (secondary).
- **Self-directed curious learners** (tertiary).

Live: https://barakd127.github.io/wafflestack-app/

---

## What we are NOT

- **NOT a quiz app with reward graphics on top.** Confetti and XP are NOT the game. The game is whatever decision the player makes between problems.
- **NOT a textbook.** No long lecture pages. If a concept needs >150 words to explain, it needs a model/visualization/manipulable instead.
- **NOT a generic gamified course.** Duolingo, Khan Academy, Brilliant all exist. We win by being a real game first.
- **NOT optimized for completion rate.** Optimized for **mastery + curiosity**. Better to lose 50% of users than ship a hollow loop that retains them.
- **NOT a teacher dashboard product (yet).** Focus on solo learner first.

---

## Gameplay Loop — the core rule

> **Gamification ≠ Gameplay.** Cosmetic rewards (XP, confetti, badges) are decoration. **Gameplay** is the player making meaningful decisions with real consequences.

The right metaphor (city / house / snowball / world / something else) is **still being discovered**. Proactive agents help explore this. **Inspiration sources, in priority order:**

1. **NotebookLM notebook "WaffleStack"** — primary source. Use NotebookLM MCP (`mcp__notebooklm__notebook_query`) to query before designing any gameplay feature. Theory + worked examples live there. If auth expired, refresh first (`mcp__notebooklm__refresh_auth`).
2. **Board game mechanics** — wide menu, not prescription. **Agents are FREE to draw from any of these (or others not listed)**. Goal is to find the right mechanic for teaching statistics, NOT to clone a specific game.

   **Mechanic catalogue** (sortable by what stats concept they could carry):

   | Mechanic | Example games | Possible stats fit |
   |---|---|---|
   | Deck-building | **Seize the Bean** [BGG/211364], **Arctic Scavengers** [asymmetric tribe leaders!], Dominion | mastered topics → new "moves" in deck. Tribe leader = which stats path you specialise in. |
   | Engine-building | Wingspan, Splendor, Race for the Galaxy, **Century Spice Road**, **Dice Forge** | early correct answers compound. Dice Forge = mutable dice = mutating your statistical toolkit. |
   | Push-your-luck | Quacks of Quedlinburg, Welcome To... | when to "stop sampling" — direct fit for stopping rules, confidence levels. |
   | Worker-placement | Viticulture, Caverna | allocate attention budget across topics. |
   | Spatial-puzzle | **Patchwork**, Calico, Azul | layout = how your knowledge tiles fit, gaps visible. |
   | Set-collection | Sushi Go, Splendor | gather concept families to combo. |
   | Real-time / dexterity | **Coffee Rush** [BGG/377061], Captain Sonar | decision density under pressure = quick reflexive stats. |
   | Programming-puzzle | **Mechs vs Minions** [BGG/209010], Robo Rally | pre-commit a sequence of stats moves (collect → clean → model → test), watch it execute on data, iterate. **Strong fit for procedure topics.** |
   | Trading / negotiation | **Catan** (trade window!), Sidereal Confluence, Bohnanza | exchange data / samples / models with NPCs to fill gaps in your dataset. |
   | Asymmetric factions | **Cry Havoc** [BGG/192457], Root, Vast | each topic-cluster has its own rules under one shell. **Arctic Scavengers tribe-leader** = pick your statistical "school" (frequentist vs Bayesian vs nonparametric). |
   | Asymmetric smart-battles | **Stuffed Fables** [BGG/233312] | per-encounter unique mechanic. Each topic = its own mini-mechanic. |
   | Boss-battles / encounters | Gloomhaven, Stuffed Fables | "boss" = high-stakes stats challenge that needs combining everything. |
   | Mafia / influence | **Godfather: Corleone's Empire** | placement + bluffing + areas of influence. Power-control = which schools dominate the data. |
   | Theme: run-your-own-place | Seize the Bean, Coffee Rush, Viticulture, Stardew Valley | coffee shop / hotel / lab / observatory / vineyard. Engine-building feel + thematic resonance. |
   | Theme: childlike-collection | Stuffed Fables, Toy Story, Pokémon | toy / pet / creature collection comes alive. Asymmetric per-item mechanic. Wonder-tap. |

   **Don't feel constrained.** If an agent finds a niche game or pattern not listed (Splotter, GMT war-game, Knizia auction, Reiner's "Tigris & Euphrates" tension mechanic, Wordle daily-puzzle pattern, Vampire Survivors auto-aim attention pattern), USE IT — cite it in PR.
3. **Mobile games that retain** — Two Dots, Threes, Mini Metro, Reigns, Tomb of the Mask, Stack the States. Note their feedback density + decision interval, not their monetization.
4. **Educational games that actually teach** — DragonBox (algebra), Polypad (math sandbox), Prodigy Math, Brilliant's puzzle paths.

**Gameplay candidate criteria:**
- One meaningful decision every 15–30 seconds (matches Anki interval research).
- Decision must use the statistical concept being learned, not adjacent to it.
- Decisions compound — early choices shape later state (engine-building energy).
- Failure is informative + recoverable — never a wall.
- Spatial/visual representation if the concept allows it (city block, building heights, distribution shape).
- Player has agency over what to learn next (branching paths, not forced linear).

**Currently exploring (none locked in):**

### Emotional pulls worth tapping (hints, not constraints)

These are pulls Barak has noticed in himself + similar learners. **Agents should test them, not assume them.** A cycle that rejects both and finds a better pull is welcome — explain why in the PR.

- **"Run your own cool place" daydream** — coffee shop, hotel, observatory, lab, vineyard, bakery. Engine-building feel. Each stats concept maps to a system inside the place.
- **Childlike-wonder collection** — toys, creatures, artifacts that "come alive." Asymmetric per-item mechanic. Wonder-tap without grind.
- **Other pulls to consider** (don't limit to above): mastery for its own sake (Brilliant), social showoff (Duolingo leaderboards), zen / flow (Two Dots), unlock-the-world (Civilization), customize-my-thing (Animal Crossing), beat-the-clock (Wordle daily), narrative curiosity (Reigns), competitive-self (chess.com rating).

**Starter menu (NOT a closed list — invent new):**

These are seeds, not boxes. Agents should mix/match mechanics across rows, OR propose entirely new combinations not on this list. Score each candidate on: decision rhythm / wonder tap / engine-building potential / topic-fit / decoration risk.

- 🏪 **"Run a place" engine-builder** — coffee shop, hotel, lab, observatory, vineyard, bakery, food truck. Cards/upgrades = stats moves. Mastered topics thicken deck. Trading window (Catan-style) to exchange resources with NPCs. Decision: which upgrade compounds best.
- 🧸 **Collection asymmetric brawler** — stat-creatures or stat-toys, each with unique mechanic à la Stuffed Fables. Tribe-leader (Arctic Scavengers-style) choice frames your collection's identity.
- ⚙️ **Pre-commit programming puzzle** — Mechs vs Minions vibe. Sequence stats steps, watch execution on data, iterate. Strong for procedure topics (hypothesis-testing pipeline, regression diagnostics).
- 🏨 **Real-time triage** — Coffee Rush pacing. NPCs arrive with statistical needs, you decide who to serve first under timer.
- 🎲 **Mutable-dice engine** — Dice Forge. Start with default dice, upgrade faces with mastered topics. Each roll = a statistical sample. Player CRAFTS the distribution they roll from. Direct fit for probability.
- 🌶 **Pickup-and-deliver engine** — Century Spice Road. Trade resource pyramid where higher concepts need lower ones. Direct map to topic prerequisites.
- 🕴 **Influence + bluff** — Godfather: Corleone's Empire. Place influence on schools/topics. Hidden objectives. Stats topic = territory you control.
- 🧵 **Spatial-tiling daily** — Patchwork + Wordle. Daily puzzle: place stats-tile pieces under time-and-cost budget. Aesthetic satisfaction + measurable progress.
- 🏙️ **City builder** (current iteration) — buildings = topics. **Locked-in risk:** decoration not decision unless buildings consume/produce resources.
- ❄️ **Snowball / accrete** — start tiny, grow. **Locked-in risk:** progression without decision.
- 🌍 **Asymmetric civ** — Cry Havoc factions = different stats schools. **Locked-in risk:** scope creep.
- 🏗️ **Townscaper sandbox** — emergent beauty. **Locked-in risk:** no learning anchor.

**The right answer might not be on this list yet.** Agents earn points for inventing combinations (e.g., "Patchwork × Dice Forge × Stuffed Fables" — daily spatial puzzle where the tile faces are mutating stat-dice that battle asymmetrically against the day's challenge).

**Proactive agents working on gameplay MUST:**
1. Query NotebookLM "WaffleStack" notebook for relevant theory before proposing a mechanic.
2. Cite ≥1 board game and ≥1 mobile game whose mechanic the proposal borrows from.
3. State the **decision interval** (seconds between meaningful player choices).
4. State which statistical concept the player **uses** (not just memorizes) to make that decision.
5. Propose as **playable prototype on isolated branch**, never as cosmetic tweak to existing screens.

---

## Design rules (hard constraints)

- **Hebrew-first** UI. RTL throughout. English in vault + code, never in user-facing text unless technical term has no Hebrew equivalent.
- **Dark UI.** Background `#0e0f12` family. **Loyal to existing palette — DO NOT introduce new accent hues.**
- **Font:** Assistant 400–500 for body, Heebo for headings. `-webkit-font-smoothing: antialiased` mandatory on dark.
- **Mobile-first** layout. Desktop is enhancement, not primary.
- **No external auth required to play** (demo mode preserved). Sign-up only for saved progress.
- **Performance budget:** First Contentful Paint <1.5s on Israeli 4G. R3F city scene ≤16ms frame budget.

### Color palette (locked)

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#0e0f12` | page background |
| `--bg-2` | `#16181d` | card / panel |
| `--card` | `#1c1f26` | inner surface |
| `--border` | `#2a2e36` | hairlines |
| `--fg` | `#e8eaed` | body text |
| `--mute` | `#8a8f99` | secondary text |
| `--gold` | `#FFD700` | XP / mastered / "win" cues (primary accent) |
| `--gold-warm` | `#D4A017` | gold gradient bottom |
| `--gold-light` | `#FFE066` | gold gradient top |
| `--teal` | `#10b981` | correct / valid / "go" |
| `--blue` | `#3b82f6` | info / link / building-info |
| `--amber` | `#f59e0b` | warn / pending |
| `--red` | `#ef4444` | wrong / blocked |
| `--accent-orange` | `#ff7a1a` | command-center plugin ONLY (vault, not app) |

**New features MUST use existing tokens.** Adding a new hex is a P0 critique-routine flag. Gradients allowed within same family only (gold→gold-warm OK; gold→teal NOT).

## UI/UX rules (hard constraints)

Inspiration sources, in priority order — agents MUST cite ≥1 per UI change:

1. **Anthropic.com** — for typography rhythm + whitespace + restraint. Not for color (they're light, we're dark).
2. **Linear.app** — for dark-UI density, keyboard-driven flows, micro-interactions, status pills.
3. **Stripe Docs** — for instructional layout (sidebar TOC + code-alongside-prose).
4. **Notion** — for slash-command-driven UI + inline editors.
5. **Apple HIG (iOS dark mode)** — for elevation, depth, hit-target sizing (44pt min).
6. **Duolingo** — for streak + progress + path-tree (BUT we are NOT Duolingo — they are quiz-app reference, we want gameplay deeper).
7. **Mini Metro / Threes / Two Dots** — for one-handed mobile play + minimal HUD + instant restart loops.

**UI patterns to FOLLOW:**
- **Path-tree over linear list** for topic progression (Duolingo-style, but mobile-mountain shape).
- **Bottom-sheet over modal** for quiz/feedback on mobile (one-thumb reach).
- **Skeleton loaders, never spinners**, on first paint.
- **Optimistic state**: XP/coins/streak update instantly, reconcile on response.
- **Haptic-equivalent feedback**: scale-bounce + sound on every meaningful tap.
- **Empty states with action**, never "no data" text alone.
- **Inline editable equations** (MathLive) — never modal-popup math input.
- **One-screen primary action** — main CTA always above the fold + thumb-zone.

**UI patterns to AVOID:**
- Hamburger menus (kill discovery). Bottom nav or sidebar always.
- Toast notifications for important state. Use persistent banners.
- Modal-on-modal stacks. Max 1 modal depth.
- Hover-only affordances on mobile. Tap-and-hold or visible.
- Light-mode-grafted-onto-dark gradients (washed look).
- Generic Material/Bootstrap components without restyling.
- Loading >1.5s without progress indication.

---

## Tech invariants

- **React + TypeScript + Vite.** No Next.js, no Remix.
- **Tailwind only** for styling. No CSS modules, no styled-components.
- **Zustand** for state. No Redux. No MobX.
- **R3F + drei** for 3D. No raw Three.js components in app code (wrap them).
- **No class components.** Function + hooks only.
- **MathLive** for editable equations (dynamic import; not in main bundle).
- **KaTeX** for static math display.
- **Vitest + Playwright** for tests. No Jest, no Cypress.
- **GitHub Pages** deploy. No Vercel/Netlify (changes baseline assumptions).
- **Supabase** when backend ships (blocked on provisioning).
- **PostHog** for analytics (blocked on env vars).

---

## Tone rules

- Hebrew copy: warm, second-person singular (אתה/את — adapt per detected gender), avoid stiff academic register.
- Encouragement after wrong answers, never punishment.
- No emoji storms. Sparingly: 1 emoji per heading max, 0 in body copy.
- No metric units in stats explanations unless contextually needed (use ש"ח not USD, Israeli school grade band examples).
- Quiz feedback explains the **why** in one sentence, not the formula.

---

## Out of scope (current quarter)

- Multiplayer / classroom mode (post-Supabase).
- Teacher dashboard (post-paid users).
- Native mobile app (web is enough until DAU >1k).
- Languages other than Hebrew (Arabic possible later; English never priority).
- Statistics topics beyond intro (no Bayesian inference, no time series, no causal inference — until intro mastered).
- Monetization design (not until product-market fit signals).
- Marketing site polish (not until app loop is satisfying).

---

## How agents grade against this vision

Every proactive PR description MUST include:

```
## Vision alignment check

| Rule | Compliant? | Citation |
|---|---|---|
| What we are: stats-first via game | ✓ / ✗ | line/screen ref |
| Gameplay ≠ Gamification | ✓ / ✗ | what decision player makes |
| Design rule: Hebrew-first | ✓ / ✗ | copy locations |
| Design rule: dark UI | ✓ / ✗ | bg color used |
| **Color palette: only locked tokens used (NO new hexes)** | ✓ / ✗ | hex list used |
| **UI source cited** (Linear / Anthropic / Stripe / etc.) | ✓ / ✗ | pattern + name |
| **UI anti-pattern avoided** (no modals-on-modals, no hamburger, etc.) | ✓ / ✗ | what was avoided |
| Tech invariant: Tailwind only | ✓ / ✗ | files changed |
| Tech invariant: Zustand only | ✓ / ✗ | state store path |
| Tone rule: encouragement | ✓ / ✗ | error-state copy |
| Mobile-first (thumb-reach + 44pt targets) | ✓ / ✗ | screen size tested |
| Out of scope: stays in scope | ✓ / ✗ | what's included |

**NotebookLM consulted:** yes / no — query: "<...>" → key insight: <...>
**Board-game inspiration:** <name>, mechanic borrowed: <...>
**Mobile-game inspiration:** <name>, feedback pattern borrowed: <...>
**Decision interval:** every <N> seconds.
**Statistical concept used in decision:** <concept>.
```

Critique routine validates this table is present + honest. Any ✗ that the PR doesn't openly address in "open questions" section → critique flags P0.

---

## Update protocol

This document is **living**. Agents propose updates via PR to `Hybrid/VISION.md` on branch `proactive/vision/<slug>`. Updates require Barak approval (`/remote-control` notification). Major shifts (changing the gameplay metaphor lock-in) require explicit Barak prompt; agents only propose.

Version: 1 (2026-05-21)
