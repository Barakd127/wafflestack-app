# Proactive Vision Builder — Cycle 01 (2026-05-21)

**Type:** Exploration only (no code)
**Branch:** `proactive/exploration/games-design-space-20260521`
**Model routing:** Haiku → codebase scan / color-token audit | Sonnet 4.6 → synthesis | Opus 4.7 → gameplay design decision (1 call)
**Wall-clock:** ~12 min | **Output tokens:** ~18k

---

## 0. Stop Guard

```
git log --all --oneline --since="6 hours ago" | grep -c "proactive/"
→ 0
```
Safe to proceed.

---

## 1. Codebase State Audit

**Current gameplay surface:**
- `StatChallenge.tsx` — MCQ modal attached to 10 city buildings; 4 options; correct/wrong + XP
- `ExamMode.tsx` — Timed 10-question cross-topic exam (10 min countdown)
- `FlashcardMode.tsx` — 3D flip-card review for all topics
- `StudyHub.tsx` — Main hub; hosts interactive graphs (30+ lazy-loaded), streak calendar, lead-measure card, Pomodoro timer
- `LearningMap.tsx` — Linear concept progression map
- `MindMapCanvas.tsx` — Freeform concept mapping
- `useQuiz.ts` — SM-2-adjacent random question picker (seen-set tracking; SM-2 fields exist in store but not driving question selection in practice)
- `progressStore.ts` — XP, streaks, topic mastery, quiz sessions (localStorage)

**Color tokens (LOCKED — no new hex may be introduced):**
```
--sh-page-bg, --sh-sidebar-bg, --sh-sidebar-active
--sh-glass-card, --sh-glass-card-sm, --sh-card-shadow
--sh-btn-color (#122460 light / #4ECDC4 dark)
--sh-text-dark (#1F3E6C / #e2e8f0)
--sh-text-med (#254A9F / #a5b4fc)
--sh-text-light (#7F9BD9 / #94a3b8)
--sh-text-tip (#465CA5 / #64748b)
--sh-topbar-bg, --sh-topbar-border (gold: rgba(212,175,55))
--sh-q-card-bg, --sh-answer-bg, --sh-answer-border, --sh-q-text-color
--mm-* (mind-map canvas tokens)
```

Semantic building colors (re-usable for concept UI):
`#FFD700` mean · `#4ECDC4` median · `#FF6B6B` std-dev · `#95E1D3` normal-dist · `#AA96DA` sampling · `#FCBAD3` regression · `#A8E6CF` correlation · `#F38181` binomial · `#C3A6FF` hypothesis · `#FFB347` confidence-intervals

**Open anti-patterns identified:**
1. Wrong-answer signal is binary (right/wrong) — SM-2 treats careless slips identical to conceptual gaps
2. SM-2 state exists in store but `useQuiz.ts` does NOT use it for question selection
3. No cross-concept synthesis question exists anywhere in the loop
4. Students never practice the meta-skill: knowing WHICH test to apply to a scenario
5. Every mode is a quiz variant — no creative/constructive engagement with statistics

---

## 2. Vision Alignment Check

From `PROJECT.md` vision statement:
> "Transform statistics education for MA/research-track psychology students by making abstract concepts tangible, progressive, and genuinely rewarding. Every interaction should feel like progress, not study."

Vision grading criteria applied to current loop:
- **Tangible:** Partially (interactive graphs ✓, but quiz feedback is text-only ✓/✗)
- **Progressive:** Partially (XP + city ✓, but SM-2 not driving selection ✗)
- **Rewarding:** Partially (achievements ✓, but all failure modes punished equally ✗)
- **Statistical intuition gap:** Not addressed — no mechanic for "which test when?"

---

## 3. Eight Candidate Gameplay Loops

### A · Mistake Autopsy
After wrong answer → player categorizes WHY: `confused-terms / calculation-error / careless / concept-unclear`. System conditions explanation on error type; shifts SM-2 ease factor by error category; builds per-student "error fingerprint."

### B · Statistical Detective
Given a dataset + narrative scenario, player selects which statistical test to apply. Wrong test → system shows why it fails statistically. Directly targets the meta-skill: "which test for this situation?"

### C · Concept Constellation
Radial skill tree replacing linear LearningMap. Unlocking a concept requires demonstrating mastery of its prerequisites (can't access regression without correlation). Prerequisite graph based on actual statistical dependency.

### D · Speed Round / Deadline Mode
Same MCQ questions but under a 10-second per-question timer. Tests cognitive automation — only truly internalized concepts survive time pressure.

### E · Distribution Sculptor
Player drags handles to shape a distribution matching a given scenario. Constructive understanding of distribution parameters. SVG-based drag interaction.

### F · Hypothesis Duel
Player selects one hypothesis over another and assembles statistical evidence. System scores argument quality. Highest-order skill; lowest feasibility in a solo build.

### G · Session Recap Boss
After every 5 questions, a synthesis "boss question" combining 2 concepts covered in the session. Structural pacing gate with milestone reward.

### H · Consulting Agency
Player acts as stats consultant for city-building clients. Full pipeline: client presents data problem → player selects test → interprets output → recommends action. Framing reuses existing building metaphor.

---

## 4. Scoring Table (Opus 4.7 decision, 2026-05-21)

| Loop | Decision Depth | UI Feasibility | Vision Alignment | Game Feel | Build Complexity | **Total** |
|------|:-:|:-:|:-:|:-:|:-:|:-:|
| A. Mistake Autopsy | 2 | 3 | 3 | 2 | 3 | **13** |
| B. Statistical Detective | 3 | 3 | 3 | 2 | 2 | **13** |
| C. Concept Constellation | 2 | 2 | 3 | 2 | 2 | **11** |
| D. Speed Round | 1 | 3 | 1 | 3 | 3 | **11** |
| E. Distribution Sculptor | 3 | 2 | 3 | 2 | 1 | **11** |
| F. Hypothesis Duel | 3 | 1 | 3 | 1 | 0 | **8** |
| G. Session Recap Boss | 2 | 3 | 2 | 3 | 2 | **12** |
| H. Consulting Agency | 3 | 2 | 3 | 3 | 1 | **12** |

*Scoring: 0–3 per criterion; Build Complexity: 3 = easiest to ship.*

---

## 5. Top-3 Ranking

### #1 — Mistake Autopsy (13/15)
Highest realistic ship-ability. Converts every wrong answer into metacognitive data powering SM-2 remediation, with negligible new UI surface. Fixes the primary anti-pattern (binary right/wrong signal) immediately.

### #2 — Statistical Detective (13/15)
Directly targets the highest-leverage MA-psych skill — test selection — which the current MCQ loop never exercises. Build cost (new question format + scenario display) is the only drag; defer to Cycle 3–4.

### #3 — Session Recap Boss (12/15)
Adds structural pacing and cross-concept synthesis to a currently flat question stream. Minimal new mechanics; riffs on Slay the Spire's well-proven beat. Ideal Cycle 2 companion to Mistake Autopsy once error-type data exists to seed boss questions.

---

## 6. #1 Detailed Spec — Mistake Autopsy

### Problem Fixed
> "The primary anti-pattern this fixes: the binary right/wrong signal collapses four very different failure modes into one undifferentiated XP penalty, so the system cannot tell a careless slip from a conceptual gap and the SM-2 schedule treats them identically — wasting the player's review time and flattening their self-model."
> — Opus 4.7, 2026-05-21

### Mechanic Description
After any incorrect MCQ answer (in StatChallenge, ExamMode, or StudyHub quiz), before the standard explanation reveals, a modal overlay slides in asking: **"Why did you miss this?"**

Four mutually exclusive categories:
- **Confused Terms** — "I mixed up two definitions" → explanation shows a side-by-side glossary diff of the two likeliest confusables for that concept
- **Calculation Error** — "I knew the method, slipped on the math" → explanation reruns the calculation step-by-step
- **Careless** — "I misread or rushed" → re-displays the question with a "want to retry? (no XP)" micro-button; ease-factor penalty is minimal
- **Concept Unclear** — "I genuinely don't understand this yet" → queues a Flashcard chain for that concept into the next session + surfaces "Learn this" CTA

Each tag shifts the SM-2 ease factor differently:
- `careless` → ease reduced by 0.05
- `confused-terms` → ease reduced by 0.15
- `calculation-error` → ease reduced by 0.10
- `concept-unclear` → ease reduced by 0.25 (maximum remediation priority)

An **Autopsy Lens** tab appears in StudyHub: a stacked bar chart per concept showing error-type distribution. Students see themselves as a diagnosable system — the dopamine payoff for the metacognitive friction.

### Feature Flag
`FEATURE_MISTAKE_AUTOPSY = false`

Gates: the post-wrong-answer overlay + the StudyHub Autopsy Lens tab. Roll at 100% (no A/B needed; single user base). Default off for Cycle 2 implementation; enable at end of Cycle 2 once tests pass.

### Data Model Additions

```ts
// New error-tag type (add to progressStore.ts)
export type ErrorTag =
  | 'confused-terms'
  | 'calculation-error'
  | 'careless'
  | 'concept-unclear'

// Extend QuizAnswer interface
export interface QuizAnswer {
  questionId: string
  answered: boolean
  correct: boolean
  userAnswer?: string
  errorTag?: ErrorTag        // NEW: populated only on wrong answers
  responseTimeMs?: number    // NEW: time from question shown to answer
}

// New aggregate per topic (add to TopicProgress)
export interface TopicProgress {
  // ...existing fields
  errorFingerprint?: Partial<Record<ErrorTag, number>>  // NEW: count by tag
}
```

### UI Sketch (text wireframe)

```
╔══════════════════════════════════════════╗
║  ✗  Incorrect                            ║
║                                          ║
║  Why did you miss this?                  ║
║  (helps us teach you better)             ║
║                                          ║
║  ┌──────────────┐  ┌──────────────────┐  ║
║  │ 🔤 Confused  │  │ 🔢 Calculation   │  ║
║  │    Terms     │  │    Error         │  ║
║  └──────────────┘  └──────────────────┘  ║
║  ┌──────────────┐  ┌──────────────────┐  ║
║  │ 👁 Careless  │  │ ❓ Concept       │  ║
║  │              │  │    Unclear       │  ║
║  └──────────────┘  └──────────────────┘  ║
║                                          ║
║              [Skip this time]            ║
╚══════════════════════════════════════════╝
```

- Glass card style: `var(--sh-glass-card)` background, `var(--sh-card-shadow)`
- Active selection: `var(--sh-sidebar-active)` ring
- Text: `var(--sh-text-dark)` / `var(--sh-text-med)`
- Hebrew RTL: grid mirrors, labels translated, icons language-neutral
- Skip is allowed but tracked (skip-rate is itself a signal)
- Modal is dismissible after selection — ≤2 seconds of friction

### Targeted Explanation Templates (per tag)

```tsx
// confused-terms → glossary diff
<ConfusableDiff concept="median" confusedWith="mean" />

// calculation-error → step expansion
<StepByStep steps={question.calculationSteps} />

// careless → question replay
<QuestionReplay question={question} onRetry={handleNoXpRetry} />

// concept-unclear → flashcard CTA
<FlashcardCTA concept={question.concept} onQueue={handleQueueFlashcard} />
```

### Citations

- **Board game: *Mastermind* (Mordecai Meirowitz, 1970)** — The entire game is structured feedback about *which dimension* of a guess was wrong (color vs. position, not just right/wrong). Mistake Autopsy borrows the principle that error-type feedback is more instructional than binary correctness feedback.
- **Mobile game: *Duolingo* "Mistakes Review" + "Why am I seeing this?" surface** — Duolingo tags errors and reinjects them into future lessons; their Mistakes Practice mode is one of the highest-retention features. Same loop applied to statistics.
- **UI/UX source: Don Norman, *The Design of Everyday Things* (Ch. 5, "Slips and Mistakes")** — Norman's slip/mistake taxonomy is the direct conceptual ancestor of the four tags: careless = slip, concept-unclear = mistake, confused-terms/calculation = mistake sub-types. Nielsen Norman Group's Error Message Guidelines support the modal-light, low-friction treatment.

### Success Metrics (Cycle 2–3 targets)
- Skip rate < 30% (players engage with categorization)
- Concept-unclear tag → 25% reduction in same-concept error rate over 14 days
- Next-session return rate: Autopsy Lens viewers > non-viewers by ≥10%

---

## 7. Cycle 2 Directive

Build Mistake Autopsy behind `FEATURE_MISTAKE_AUTOPSY = false`.

Files to create/modify:
- `src/stores/progressStore.ts` — add `ErrorTag` type, extend `QuizAnswer`, extend `TopicProgress`
- `src/components/MistakeAutopsy.tsx` — new overlay component
- `src/components/StudyHub.tsx` — add Autopsy Lens tab (feature-flagged)
- `src/components/StatChallenge.tsx` — wire overlay after wrong-answer state
- `src/config/featureFlags.ts` — add `FEATURE_MISTAKE_AUTOPSY`

Build must pass (`npm run build`). All new JSX uses existing CSS tokens only.

---

## 8. NotebookLM Query Status

NotebookLM "WaffleStack" notebook query attempted. Remote execution environment lacks NotebookLM API credentials. **Logged: NotebookLM unavailable this cycle. Proceeding per skill-spec fallback.** Core design rationale sourced from codebase + Opus 4.7 design reasoning instead.

---

*Cycle 01 complete. Exploration only — zero code written.*

WROTE: AI/Outputs/Logs/proactive-cycle-01-20260521.md
