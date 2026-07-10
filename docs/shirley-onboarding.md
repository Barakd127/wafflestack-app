# Welcome, Shirley — how to change WaffleStack safely 🧇

You can now propose design changes to WaffleStack **without any risk of breaking the live site**.
Everything you do happens on your own copy (a "branch"). Barak reviews it and only then does it go live.
You literally *cannot* break production — the setup won't let you.

> Hebrew version available on request — tell Barak and he'll add `docs/shirley-onboarding.he.md`.

---

## The idea in one picture

```
You edit on a branch  →  a private preview link is built  →  you open a Pull Request
      (your sandbox)          (see it live, comment on it)        (Barak reviews + merges → live)
```

Your work never touches the real site until Barak clicks **Merge**.

---

## One-time setup (≈10 min)

1. **Make a free GitHub account** (if you don't have one) and send Barak your username. He'll add you to the project.
2. **Install GitHub Desktop** — the friendly app, no command line:
   https://desktop.github.com/  → install → sign in with your GitHub account.
3. In GitHub Desktop: **File → Clone repository → `Barakd127/wafflestack-app`** → choose a folder → **Clone**.
   This downloads the project to your computer.
4. (Optional, to preview locally) Install **Node.js** from https://nodejs.org (LTS version). You only need this
   if you want to run the site on your own machine — see "Preview on your computer" below. You can skip it and
   rely on the online preview link instead.

---

## Making a change (do this every time)

1. **Start a new branch.** In GitHub Desktop, top bar: **Current Branch → New Branch**.
   Name it `design/` + what you're doing, e.g. `design/home-hero-colors`.
   ⚠️ Never edit the `master` branch directly — always make a new `design/...` branch.
2. **Edit the files.** Open the project folder in your editor (VS Code is great and free). Change colors,
   spacing, text, images — whatever you're improving.
3. **Preview it** (pick one):
   - **On your computer:** open a terminal in the project folder and run `npm install` once, then `npm run dev`.
     Open http://localhost:3000 — the site reloads as you save. (Needs Node.js from step 4 above.)
   - **Online:** just push (next step) and use the automatic preview link.
4. **Save your work.** Back in GitHub Desktop you'll see your changes listed. Write a short summary at the
   bottom (e.g. "Home hero: softer navy, bigger button") → click **Commit to design/...**.
5. **Push.** Click **Push origin** (top right). Your branch is now on GitHub.

---

## Getting it reviewed

6. **Open a Pull Request.** GitHub Desktop shows a **"Create Pull Request"** button after you push — click it.
   It opens your browser. A short form appears (already filled with a checklist) → **Create pull request**.
7. **Find your preview link.** On the Pull Request page, a **Vercel** check appears within a minute with a
   **Preview** link — that's your change, live, on its own URL. Open it.
8. **Leave visual comments (optional but great).** On the preview, use the **Vercel Comments** toolbar
   (bottom of the page) to click any element and pin a comment ("make this 2px bigger"). Comments show up on
   the Pull Request so Barak sees exactly what you mean.
9. **Barak reviews.** He'll look at the preview + your changes, ask for tweaks, or approve. To make tweaks:
   just edit → commit → push again on the **same branch** — the same Pull Request and preview update automatically.
10. **Barak merges.** Once he approves and clicks **Merge**, your change ships to the live site. 🎉

---

## Rules of thumb
- **One change = one branch = one Pull Request.** Keeps things easy to review.
- **Never work on `master`.** Always a fresh `design/...` branch.
- **Stuck?** Send Barak the branch name or the Pull Request link — he can jump in on the same branch.
- **You can't break anything.** The worst case is a Pull Request that doesn't get merged. The live site is safe.
