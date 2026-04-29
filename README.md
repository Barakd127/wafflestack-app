# 🎓 WaffleStack — Statistics Learning Platform

A Hebrew-first, gamified statistics learning experience for psychology/social-science students. Concepts unlock as you master them; progress is rendered as a 3D city you build.

🌐 **Live**: https://barakd127.github.io/wafflestack-app/
📦 **Repo**: https://github.com/barakd127/wafflestack-app

## 🎯 Concept

WaffleStack combines:
- **Study Hub**: Adaptive quiz engine (SM-2 spaced repetition) with XP, streaks, achievements, and daily challenges
- **3D Knowledge City**: Each mastered statistics concept becomes a Kenney-styled building in your city
- **Mind-Map Canvas**: Infinite canvas with LaTeX equations and interactive distribution explorers
- **Hebrew RTL UI**: Full RTL/screen-reader/mobile support; built for the Israeli classroom

## 🎨 Design Philosophy

- **Glassmorphism** throughout (backdrop-blur, rgba, subtle borders)
- **Statistics first** — every interaction must move learning forward, not just rendering
- **Visual over notation** — distributions, sliders, and curves replace abstract symbols where possible
- **Mobile-aware** — usable from 375px up

## 🏗️ Architecture

### Study Hub (entry view)
- 100-question quiz bank (10 topics × 10 questions, v1.3)
- SM-2 algorithm with interval-based XP multipliers (1×/2×/3.5×/2.5×)
- Streak tracking, daily challenges (2× XP), achievement badges
- Lesson pages for the 5 core topics (mean, median, std-dev, probability, sampling)

### 3D City (`WaffleStackCity.tsx`)
- React Three Fiber + Kenney City Kit (Suburban) GLB models
- 10 buildings unlock at XP milestones (0 → 800 XP)
- Hover preview ghost + click-to-quiz; sound effects on placement
- Color variation picker (A/B/C palettes), persisted per building

### Mind-Map Canvas (`MindMapCanvas.tsx`)
- Distribution Explorer (Normal/t/χ²/F) with parameter sliders + dual-color PDF/CDF overlay
- LaTeX equation library (20 equations across 5 categories) with one-click insertion
- Reachable from Study Hub sidebar (`mindmap` nav item)

## 🚀 Tech Stack

- React + TypeScript + Vite
- Three.js + React Three Fiber + Drei (3D)
- Zustand with `persist` middleware (state)
- Tailwind CSS (styling)
- Framer Motion (animations)
- KaTeX (equation rendering)
- Supabase (auth + persistence — env vars pending provisioning)
- PostHog (analytics — env vars pending provisioning)

## 📦 Local Development

```bash
git clone https://github.com/barakd127/wafflestack-app.git
cd wafflestack-app
npm install
npm run dev
```

Build & deploy (GitHub Actions auto-deploys `main` → GitHub Pages):

```bash
npm run build
npm run preview
```

## 🎮 Shipped Features (PRD F1–F7)

- ✅ F1 Onboarding (7-step flow + skip dialog from step 3)
- ✅ F2 Lesson pages (5 topics, Hebrew RTL)
- ✅ F3 Quiz system (100 questions, sound effects, correct-answer highlight)
- ✅ F4 SM-2 spaced repetition + "keep practicing" badge
- ✅ F5 3D city with XP-gated buildings + R3F perf optimizations
- ✅ F6 Learning Map (5 topic nodes, complete/current/locked states)
- ✅ F7 Continue Learning CTA wired to SM-2 next-question

⏳ F8 Auth (Supabase) — code ready, blocked on human Supabase provisioning

---

**Transform statistics from feared to fun.** 🚀✨
