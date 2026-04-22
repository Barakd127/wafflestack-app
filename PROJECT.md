# WaffleStack — Statistics Learning Platform

## Vision
Transform statistics education for MA/research-track psychology students by making abstract concepts tangible, progressive, and genuinely rewarding. Every interaction should feel like progress, not study.

## The Core Problem
Statistics is the most-feared subject in psychology programs. It's taught through passive lectures and dry exercises. Students memorize formulas without understanding them, fail exams, and lose confidence. The gap between "statistical literacy" and "statistical intuition" never closes.

## The Solution: Learning Through Play
WaffleStack turns the statistics curriculum into a game where:
- Every concept mastered unlocks the next (not gated by time, gated by understanding)
- Visual representations replace abstract notation wherever possible
- Progress is visible, spatial, and emotionally satisfying (the 3D city)
- The mind-map canvas externalizes the student's mental model

## Target User
Psychology/social science students at MA level who:
- Are required to learn statistics but find it anxiety-inducing
- Respond to visual thinking and narrative
- Are motivated by completion and collection mechanics
- Have limited time and need efficient, high-retention study sessions

## Feature Pillars

### 1. Study Hub (Core Loop)
Adaptive quiz engine that drives the progression system:
- Questions tagged by concept (normal distribution, t-test, ANOVA, etc.)
- Spaced repetition algorithm determines what to show when
- Correct answer → XP → potentially unlocks next concept
- Wrong answer → micro-explanation → practice variation → retry
- Session length: target 5-10 minutes for a meaningful session

### 2. 3D Knowledge City
Visual representation of what the student knows:
- Each mastered statistical concept = a building in the city
- Building style reflects concept type (distributions = curved buildings, tests = structured towers)
- City grows and becomes more complex as mastery increases
- Seeing your city motivates return (loss aversion + collection mechanics)

### 3. Mind-Map Canvas (xmind-replica.html)
For concept mapping and relationship visualization:
- Students map how concepts relate to each other
- Template library: normal distribution, Venn diagrams, 2×2 matrices, SWOT
- Export for exam preparation
- LaTeX equation support for formula notation

### 4. Gamification Layer
- XP system: 10 XP for correct answer, 25 XP for streak, 50 XP for concept mastery
- Achievement system: "First t-test", "Distribution Master", "5-day Streak"
- Daily challenges: 3 questions, bonus XP if done before 10am
- Leaderboard (optional social layer)

## Success Criteria — v1

### Must Have (MVP)
- [x] Student can complete a full quiz session (5 questions) end-to-end — useQuiz.ts + StatChallenge.tsx wired 2026-04-18
- [x] XP is awarded and persists between sessions (localStorage) — learningStore.ts Zustand persist 2026-04-15
- [x] At least 3 statistics topics with 5 questions each (15 total) — quiz-bank.json v1.3: 10 topics × 10 questions (100 total) 2026-04-18
- [x] 3D city shows at least 3 different building types based on mastery — 5 Kenney building types unlock at XP milestones 2026-04-15
- [x] The default view when opening the app is the Study Hub (not 3D scene) — App.tsx default changed to 'study' 2026-04-15

### Should Have
- [x] Spaced repetition algorithm (even simple version) — SM-2 (CardData + sm2Update + recordSM2Answer + getNextQuestion) in learningStore.ts 2026-04-18
- [ ] Achievement unlock animation — XP milestone celebration overlay added 2026-04-15 (partial; per-achievement badges not yet implemented)
- [ ] Mind-map canvas accessible from Study Hub — Canvas mode exists; Study Hub nav link TBD
- [x] Streak tracking (consecutive days) — lastSessionDate/currentStreak/longestStreak in learningStore.ts + 🔥 pill in StudyHub header 2026-04-21

### Won't Have in v1
- User accounts / server-side persistence
- Social features
- Video content
- Payment system

## Current State (as of 2026-03-21)
The 3D engine is impressive but overbuilt for v1. The default view opens to TownscaperScene (3D city builder), not the study experience. StudyHub exists but is not the entry point.

**The critical gap:** App feels like a tech demo, not an educational tool. The 3D work is beautiful but the student-facing learning loop is incomplete.

## Tech Stack
- React + TypeScript + Vite
- Three.js + React Three Fiber (3D)
- Zustand (state management)
- Tailwind CSS
- Served from VPS: 76.13.151.44

## GSD Agent Instructions

### Working Directory
`C:\Users\BARAK\Projects\base44\src\`

### Design Principles
1. **Statistics first** — Every session should move the education forward, not just the 3D rendering
2. **Glassmorphism** — Frosted glass UI throughout (backdrop-blur, rgba backgrounds, subtle borders)
3. **Bilingual** — Hebrew + English support (RTL where appropriate)
4. **Mobile-aware** — Students study on phones, design should work at 375px+
5. **No regressions** — Never break working features when adding new ones

### Priority Order
1. Fix default view → Study Hub
2. Complete quiz content (15+ questions across 3 topics)
3. Connect XP to city growth
4. Achievement system
5. Spaced repetition
6. Polish and animations
GITHUB_BRIDGE=https://github.com/Barakd127/wafflestack-ops 
GITHUB_BRIDGE=https://github.com/Barakd127/wafflestack-ops 
