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
- [x] Achievement unlock animation — per-achievement badges shipped 2026-04-22; badge toast wired in StudyHub.tsx (3 achievements: First T-Test, Distribution Master, 5-Day Streak)
- [x] Mind-map canvas accessible from Study Hub — sidebar nav item + bento card wired 2026-04-22 (id: mindmap, icon: Network)
- [x] Streak tracking (consecutive days) — lastSessionDate/currentStreak/longestStreak in learningStore.ts + 🔥 pill in StudyHub header 2026-04-21

### Won't Have in v1
- User accounts / server-side persistence
- Social features
- Video content
- Payment system

## Current State (as of 2026-04-27)
Educational loop is live. F1–F7 shipped: 7-step onboarding (with skip), 5 Hebrew lesson pages, 100-question quiz bank with SM-2 spaced repetition + interval-based XP multipliers, 3D city with 10 XP-gated Kenney buildings, Learning Map, daily challenges, streak tracking, and achievement badges.

Default entry is the Study Hub (changed 2026-04-15). Mind-Map Canvas reachable from sidebar; Distribution Explorer + LaTeX equation library shipped. R3F perf pass complete (memoized scene.clone, ContactShadows@256, shadow-map@512). Mobile + RTL screen-reader + prefers-reduced-motion all addressed.

**Open work:** F8 Auth (Supabase) — code ready, blocked on human provisioning of supabase.com project + env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). PostHog analytics similarly blocked on `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST`.

## Tech Stack
- React + TypeScript + Vite
- Three.js + React Three Fiber + Drei (3D)
- Zustand with `persist` middleware (state)
- Tailwind CSS (styling)
- KaTeX (equation rendering)
- Framer Motion (animations)
- Deployed via GitHub Actions → GitHub Pages: https://barakd127.github.io/wafflestack-app/

## GSD Agent Instructions

### Repo
GitHub: https://github.com/barakd127/wafflestack-app
Vault working copy: `C:\Users\ofekd\Documents\Obsidian Vault\AI\WaffleStack\code\src\`

### Design Principles
1. **Statistics first** — Every session should move the education forward, not just the 3D rendering
2. **Glassmorphism** — Frosted glass UI throughout (backdrop-blur, rgba backgrounds, subtle borders)
3. **Bilingual** — Hebrew + English support (RTL where appropriate)
4. **Mobile-aware** — Students study on phones, design should work at 375px+
5. **No regressions** — Never break working features when adding new ones

### Priority Order
1. **F8 Auth (Supabase)** — code drafted (`supabase.ts`, `authStore.ts`, `AuthPage.tsx`); blocked on human provisioning of supabase.com project + `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars
2. **PostHog analytics wiring** — `useAnalytics` hook + 8 event wrappers ready; blocked on `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` env vars
3. Post-unblock: server-side progress sync + per-student SM-2 state persistence

GITHUB_BRIDGE=https://github.com/Barakd127/wafflestack-ops
