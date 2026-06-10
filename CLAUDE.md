# WaffleStack (base44 repo) — Claude Code Rules

This is the LIVE WaffleStack app (React + Vite, Hebrew RTL statistics learning).
Deployed from master: Vercel (wafflestack-app.vercel.app) + GitHub Pages.

## Godot export rule (MANDATORY for every agent)

`public/godot/index.html` carries three hand-patched additions that a Godot
re-export silently wipes (the engine regenerates the file from its template):

1. `godot-progress` / `godot-ready` postMessage hooks — the React loading
   screen depends on them.
2. WebGL context-loss guard — recovers from GPU resets instead of a silent
   freeze on integrated GPUs.
3. `GODOT_CONFIG.mainPack` cache-bust tag + correct `fileSizes` — browsers
   cache the 11 MB pck and serve stale builds without it.

**After ANY copy of a new index.pck / index.html into `public/godot/`, run:**

```
python tools/patch-godot-index.py --tag <short-tag>-<yyyymmdd>
```

It is idempotent and exits non-zero if an anchor is missing. Never commit a
re-export without running it. Verify after: `grep -c "webglcontextlost\|godot-ready\|godot-progress\|mainPack" public/godot/index.html` → must be 4 lines ≥1.

## Game modes (experimental, 2026-06)

The Godot game has an admin-only version selector (ModeManager autoload in
the waffle-stack Godot project): classic / טייקון / קלפים / יריבות. Students
always get classic. Mode source: `C:\Users\BARAK\waffle-stack\scripts\modes\`.
Design docs: `C:\Users\BARAK\waffle-stack\design\` (GAME-DESIGN-BRIEF.md = the
12 Laws; VERSIONS-SPEC.md = the contracts). Rollback tag: pre-overnight-20260610.

## Other standing rules

- Branch races: scheduled agents push to master frequently — `git fetch` +
  rebase before every push; verify file state before assuming your edit stuck.
- Never commit `.env` / API keys. `graphify-out/` is gitignored.
- Knowledge graph: `graphify-out/graph.json` exists at repo root — for
  "where is X / how does Y relate" questions run `graphify query "..."`
  before grepping.
