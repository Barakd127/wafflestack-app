# WaffleStack — guide for Shirley's Claude Code

**Read this first, in full, before doing anything in this repo.** You are assisting **Shirley, a graphic
designer**, who proposes **visual/design improvements** to WaffleStack. Your job: help her make safe changes on
a branch, preview them, and open a Pull Request. **Barak (the owner) reviews and merges — you do not.**

If Shirley points you here, treat everything below as binding rules for this repo.

---

## 🚫 HARD RULES (never break these)

1. **Never commit, push, or merge to `master`.** `master` deploys straight to the live site (Vercel + GitHub
   Pages). All work happens on a branch named `design/<short-topic>` (e.g. `design/home-hero-spacing`).
2. **Never merge a Pull Request. Never deploy.** You open the PR; Barak approves and merges. Branch protection
   will reject any direct push to `master` anyway.
3. **Default to visual-only changes** — colors, spacing, typography, layout, copy, images, component styles.
   If a change would touch **logic, data, scoring, or quiz/lesson content**, STOP and tell Shirley to confirm
   with Barak first. Say what you'd change and why.
4. **Do not touch the Godot game internals** (`public/godot/*`, the Godot export/patch pipeline). Out of scope
   for design work.
5. **Never commit secrets** (`.env`, API keys). If you see them, don't stage them.
6. **When unsure, ask Shirley** in plain language. Don't guess on anything that ships.

---

## What this project is

- **WaffleStack**: a Hebrew, **right-to-left (RTL)** statistics learning app. React + **Vite** + TypeScript + Tailwind.
- **Repo**: `Barakd127/wafflestack-app` (Barak's account; Shirley is a Write collaborator).
- **Deploys from `master`**: Vercel (`wafflestack-app.vercel.app`) and GitHub Pages. That's why `master` is protected.
- **Every branch/PR gets its own live preview URL** automatically (Vercel). That's how Shirley sees her work.

---

## One-time setup

```bash
git clone https://github.com/Barakd127/wafflestack-app.git
cd wafflestack-app
npm install
```

To preview locally (hot-reloads as you edit):

```bash
npm run dev
# open http://localhost:3000
```

---

## The workflow — do this for every change

```bash
# 1. Always start from an up-to-date master, on a NEW design branch
git checkout master
git pull origin master
git checkout -b design/<short-topic>

# 2. Make the visual change (edit files). Preview with `npm run dev` at http://localhost:3000

# 3. Commit
git add -A
git commit -m "design: <what changed in plain words>"

# 4. Push the branch (NOT master)
git push -u origin design/<short-topic>

# 5. Open a Pull Request for Barak to review
gh pr create --base master --fill
# (or open the link GitHub prints after the push)
```

Then give Shirley **two links**: the **Pull Request URL** and the **Vercel Preview URL** (appears as a check on
the PR within ~1 minute). She reviews, and can click elements on the preview to leave **Vercel Comments**.

To make revisions after feedback: edit → commit → `git push` **on the same branch**. The PR and preview update
themselves. Do **not** open a new PR for tweaks.

---

## Design conventions (match these — Barak is strict about them)

- **RTL Hebrew.** Check every change in right-to-left layout. Don't hardcode left/right where start/end is meant.
- **Check mobile width**, not just desktop.
- **Home / primary CTAs stay SOLID**: navy `#122460` or white. **No "liquid glass" / translucent effect on CTAs.**
  (Glass is only ever allowed on 3D-world overlays.)
- **Readable, human-first.** Legible type + contrast, plain-language labels, clarity over cleverness.
- **No forced/punny/gimmicky names.** Plain or evocative, never subject-matter puns.
- Keep changes small and focused — one topic per branch/PR.

## Finding things
- Styling is Tailwind classes + CSS in `src/`; components live under `src/`. Explore before editing.
- If the repo root has `graphify-out/graph.json`, prefer `graphify query "where is <X>"` over broad grepping.

## If something goes wrong
- Merge conflict on `git pull`: tell Shirley; don't force-push, don't touch `master`.
- Unsure whether a change is "just visual": assume it's NOT, and ask Shirley to check with Barak.
- You cannot make the site go live — the worst case is a PR that waits for review. The live site is always safe.
