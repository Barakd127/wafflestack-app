# Proactive Vision Builder — Cycle 1: Games Design Space Exploration

**Date:** 2026-05-21  
**Cycle:** 1 (Exploration only — no code shipped)  
**Branch:** `proactive/exploration/games-design-space`  
**Author:** Claude Sonnet 4.6 + Opus 4.7 (ranking decision)

---

## 1. Context Read

### Vision (from PROJECT.md)
> "Transform statistics education for MA/research-track psychology students by making abstract concepts tangible, progressive, and genuinely rewarding. Every interaction should feel like progress, not study."

Key vision table:
| Principle | Current state |
|-----------|--------------|
| Gated by understanding, not time | ✅ SM-2 drives sequencing |
| Visual over notation | ✅ 30+ interactive graphs |
| Progress is spatial and satisfying | ⚠️ City is decorative — XP unlocks buildings but nothing decays or reacts dynamically |
| Every session moves learning forward | ⚠️ No session stakes; wrong answers have no consequence beyond repeating the card |

### NotebookLM Query
**LOG:** NotebookLM authentication is unavailable in this cloud execution environment. Proceeding without notebook query per skill spec fallback rule. This cycle proceeds from PROJECT.md + direct codebase reading as the vision source.

### Color Palette (LOCKED — no new hex values permitted)
| Token | Light | Dark |
|-------|-------|------|
| Primary text | `#1F3E6C` | `#e2e8f0` |
| Medium text | `#254A9F` | `#a5b4fc` |
| Light text | `#7F9BD9` | `#94a3b8` |
| Button | `#122460` | `#4ECDC4` |
| Sidebar | `#3351CA` | `#0f1245` |
| Gold accent | `#D4AF37` / `#FFC700` | `#E8C547` |
| Focus ring | `#C9A227` | `#E8C547` |
| Glass card | `rgba(255,255,255,0.45)` | `rgba(255,255,255,0.07)` |

### Existing Anti-Patterns Identified
1. **Passive topic selection** — player scrolls a flat list; no decision pressure.
2. **Decorative city** — XP unlocks buildings but nothing decays, reacts, or creates return incentive.
3. **No session stakes** — wrong answers restart the card; no consequence beyond "try again."
4. **Disconnected systems** — XP, city, arsenal, mind-map do not meaningfully interact.
5. **No consequence for neglect** — SM-2 overdue cards exist but are never surfaced as urgency.

---

## 2. Eight Candidate Gameplay Loops

### Loop 1 — Concept Chain Combat
**Board game:** Pandemic · **Mobile:** Slay the Spire · **UI source:** Hearthstone deck builder  
Each study session is a "run" with rising threat. Player chooses which concepts to defend before threat overwhelms them. Decision: which domain to study under time pressure.

### Loop 2 — City Planning Under Pressure
**Board game:** Suburbia · **Mobile:** Townscaper · **UI source:** SimCity HUD  
3D city districts decay when corresponding SM-2 cards go overdue. Player allocates limited study time to maintain vs. expand districts. Decision: spatial resource allocation.

### Loop 3 — Draft + Build
**Board game:** 7 Wonders / Splendor · **Mobile:** Legends of Kingdom Rush · **UI source:** novel  
Each session presents a face-up hand of 5 questions; player picks 3 to answer. Skipped cards return harder. Decision: strategic question selection vs. deferral.

### Loop 4 — Rival Student Race
**Board game:** Trivial Pursuit · **Mobile:** Duolingo leagues · **UI source:** Duolingo XP bar  
Ghost AI rival answers at steady pace. Player races it through curriculum. Wrong answers let rival catch up. Decision: speed vs. accuracy tradeoff.

### Loop 5 — Knowledge Tree Investment
**Board game:** Terraforming Mars · **Mobile:** Plants vs Zombies · **UI source:** Path of Exile skill tree  
Visible concept dependency graph. Answering earns tokens invested into branching unlock paths. Decision: which knowledge branch to develop next.

### Loop 6 — Exam Day Countdown (Triage Mode)
**Board game:** Pandemic Legacy · **Mobile:** Plague Inc · **UI source:** Apple Screen Time  
Exam date set (default 7 days). Each concept carries a live Risk Score derived from SM-2 state, days-overdue, and recent error rate. Home screen shows a Risk Board: top 5 at-risk concepts. Decision: which fires to fight and how deep to go.

### Loop 7 — Teach-Back Mode
**Board game:** Codenames (explanation mechanic) · **Mobile:** Kahoot · **UI source:** Mentimeter  
After learning a concept, player explains it to an AI avatar. Avatar signals confusion/understanding. Only passing teach-back unlocks the next concept. Decision: how to construct an explanation.

### Loop 8 — Arsenal Craft Loop
**Board game:** Dominion (deck building) · **Mobile:** Clash of Clans · **UI source:** inventory/crafting  
Errors captured to Arsenal become crafting materials. Player crafts "insight cards" from mistakes. Insight cards boost XP multipliers on future questions for that topic. Decision: how to invest mistake-learnings.

---

## 3. Scoring & Ranking

*Scored by Opus 4.7 per skill-spec routing rule.*

Dimensions (1–5 each):
- **Vision**: Advances statistical intuition, not just drilling
- **Decision**: Meaningfully changes WHAT player decides
- **Build**: Inverse of complexity (5 = easy weekend, 1 = months)
- **Anti-pattern**: Fixes an existing WaffleStack UX problem
- **Mobile**: Works on 375px portrait

| Rank | Loop | Vision | Decision | Build | Anti-pattern | Mobile | **Total** | Key sources |
|------|------|--------|----------|-------|--------------|--------|-----------|-------------|
| 🥇 1 | **#6 Exam Day Countdown** | 5 | 5 | 4 | 5 | 5 | **24** | Pandemic Legacy; Plague Inc; Apple Screen Time |
| 🥈 2 | **#8 Arsenal Craft Loop** | 4 | 4 | 3 | 5 | 4 | **20** | Dominion; Clash of Clans; inventory UIs |
| 🥉 3 | **#2 City Planning Under Pressure** | 4 | 4 | 3 | 5 | 3 | **19** | Suburbia; Townscaper; SimCity |
| 4 | #5 Knowledge Tree Investment | 5 | 4 | 3 | 4 | 3 | **19** | Terraforming Mars; PvZ; PoE |
| 5 | #3 Draft + Build | 3 | 5 | 4 | 3 | 4 | **19** | 7 Wonders; LoKR; novel |
| 6 | #1 Concept Chain Combat | 3 | 4 | 2 | 3 | 4 | **16** | Slay the Spire; Pandemic; Hearthstone |
| 7 | #7 Teach-Back Mode | 5 | 4 | 1 | 3 | 2 | **15** | Codenames; Kahoot; Mentimeter |
| 8 | #4 Rival Student Race | 2 | 3 | 4 | 2 | 4 | **15** | Trivial Pursuit; Duolingo; Duolingo bar |

**Opus 4.7 selection rationale:** Loop #6 is the only candidate that reframes the *core question itself* ("which concept right now?") rather than bolting a meta-layer onto the quiz. For anxiety-prone psychology students, an exam date is the real-world stake they already feel — surfacing it converts dread into tractable, visual triage. It reuses SM-2 as the answer engine, reuses the city (risk = decaying districts), reuses XP (risk reduction bonus), and directly fixes the "decorative city + passive next-question" anti-patterns. Runners-up (#8 Arsenal Craft, #2 City Planning) are strong but #6 subsumes their best ideas: risk *is* decay, and reviewing weak items *is* crafting.

---

## 4. Detailed Spec: #1 — Exam Day Countdown ("Triage Mode")

*Full spec authored by Opus 4.7.*

### Core mechanic

The student sets a target exam date (default 7 days, adjustable). Every concept in the SM-2 graph carries a live **Risk Score** (0–100) derived from: SM-2 ease factor, days-overdue, recent error rate, and exam-weight. Risk decays naturally as the exam approaches if untouched, but *grows* faster for weak concepts — exactly mirroring Pandemic's outbreak chain. The home screen replaces the current "Continue learning" CTA with a **Risk Board**: a vertical list (mobile-first) of the top 5 at-risk concepts, each shown as a glass card with a gold (`#D4AF37`) risk ring and the host 3D-city building rendered in miniature, slightly darkened when risk > 60. The player's decision each session is no longer "answer the next SM-2 card" but "which of these 5 fires do I put out today, and how deep do I go?"

### Player decision flow

1. **Open app** → Risk Board shows 5 cards sorted by risk desc, with a countdown banner: *"4 days to exam — 2 concepts critical."*
2. **Scan & triage** → Each card surfaces: concept name (Hebrew), risk %, exam-weight pill, "last seen 6d ago", and miniature city district image.
3. **Pick one** → Tap a card. A bottom sheet asks: **Quick Treatment** (3 cards, ~2 min) or **Deep Treatment** (7 cards + prerequisite check, ~6 min). This is the real decision — breadth vs. depth under time pressure.
4. **Answer SM-2 cards** → Existing engine unchanged. Risk ring drains live; correct answers chip the ring gold, errors flare in `#3351CA→#1F3E6C` blue and route to Arsenal.
5. **Post-session debrief** → One screen: risk delta, XP earned, and forecast: *"If you do nothing tomorrow, 3 concepts will go critical."* Player taps "Plan tomorrow" to optionally pin 1–2 concepts.
6. **City update** → Treated district's building re-illuminates; Godot iframe receives a `risk_cleared` message to trigger a brief camera pan. Decay resumes silently.

### Integration with existing systems

| System | Change |
|--------|--------|
| **SM-2** | Untouched as answer engine. `risk_score` is a derived view cached in localStorage on every quiz answer. No schema migration. |
| **XP** | Risk-Reduction Bonus multiplier (×1.0–×1.5) applied based on concept risk at session start. Shown in debrief. Does not change base XP table. |
| **3D city** | Buildings gain a `decayLevel` prop (0/1/2). `decayLevel > 0` lowers emissive intensity and adds a blue-dark overlay using existing `#1F3E6C` token. No new shaders. |
| **Arsenal** | Errors from Treatment Sessions route to Arsenal unchanged. Risk Board deep-links into Arsenal per concept. |
| **Mind-map** | Risk color overlays on existing concept nodes — a free win, zero extra code. |

### Feature flag

`ws_triage_mode_v1` (localStorage key for now; Supabase remote flag once auth is provisioned). Falls back to the existing "Continue learning" CTA when off.

### Biggest implementation risk

**Risk Score calibration.** If risk grows too fast, anxious users feel doom-scrolled; too slow, no stakes — and this is the population most likely to uninstall on a bad first week. Mitigation: ship behind flag to a small cohort, expose two tunable curves (gentle/standard) via config, instrument session-7 retention and self-reported anxiety (1-tap weekly pulse), and gate rollout on retention parity + anxiety neutrality.

### Acceptance criteria

**AC1 — Risk visibility**
- *Given* a user has ≥5 concepts with SM-2 history and an exam date set,
- *When* they open the home screen,
- *Then* the Risk Board renders the top 5 concepts sorted by risk desc within 400ms, each showing risk %, exam-weight, days-since-seen, and a miniature of its city building.

**AC2 — Risk reduction drives XP**
- *Given* a user starts a Treatment Session on a concept with risk = 78,
- *When* they answer all queued cards correctly,
- *Then* the concept's risk drops below 30, a Risk-Reduction Bonus multiplier (×1.0–×1.5) is applied to base XP, the multiplier is shown in the debrief, and the building's decay overlay clears in the 3D city.

**AC3 — Decision is real, not cosmetic**
- *Given* the Risk Board offers Quick (3 cards) vs. Deep (7 cards + prereq check) treatment,
- *When* a user picks Quick on a concept whose prerequisites are themselves at-risk,
- *Then* the post-session forecast explicitly warns that 1+ prerequisite concepts will go critical within 24h, and offers a one-tap pin for tomorrow's session.

---

## 5. Runners-Up Notes (for future cycles)

### #2 — Arsenal Craft Loop (score 20)
Strong because it directly metabolizes the error-capture mechanic already in production. Recommend as Cycle 3–4 enhancement *on top of* Triage Mode: treat Arsenal items as "insight tokens" that reduce risk for their associated concept.

### #3 — City Planning Under Pressure (score 19)
The spatial resource-allocation mechanic is elegant but requires deeper Godot bridge work. Recommend as a Cycle 5–6 investment once Triage Mode proves the decay concept works with users.

---

## 6. Next Cycle

**Cycle 2:** Build `ws_triage_mode_v1` behind feature flag.
- Compute `risk_score` from SM-2 state in `learningStore.ts`
- Add Risk Board UI as a new home screen section (feature-flagged)
- Wire Quick/Deep Treatment session lengths into existing quiz engine
- Add `decayLevel` prop to 3D city building component
- Write unit tests for risk score formula

---

*Cycle 1 complete. Output: markdown exploration doc. No code shipped.*
