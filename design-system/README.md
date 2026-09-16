# WaffleStack Design System (Claude Design bundle)

`bundle/` is the WaffleStack design system for [Claude Design](https://claude.ai/design) —
**extracted verbatim from this repo's code** (branch `master`, see the `@ <sha>` provenance
header at the top of each generated file). It replaces the July 2026 bundle, which was
brand-accurate but invented its own tokens and components instead of mirroring the code.

## Why this exists

Claude Design cannot share projects across Anthropic organizations, so this repo is the
shared source of truth: each collaborator syncs the *same* bundle into their *own*
claude.ai/design account. Prototypes made there then match the real app pixel-for-pixel,
and hand-off back to code uses class names and CSS variables that actually exist.

## What's in the bundle

- `tokens/app.css` + `app-classes.css` — byte-verbatim split of `src/index.css`
  (the split script fails hard if a re-merge doesn't reproduce the source).
- `tokens/landing.css` — whole `src/landing/landing.css`.
- `tokens/preflight.css` / `tokens/tailwind-utilities.css` — emitted by the app's own
  Tailwind + build; utilities are the verbatim subset the bundle markup uses.
- `components/` — 17 real components extracted from source with runtime seams replaced
  by props (every replacement marked `[ds-extract]` and independently audited).
- `templates/` — the real screens (study hub, lesson, quiz, landing) as Design Canvas
  templates + standalone previews.
- `foundations/` — reference cards showing the real tokens/classes.

## Updating after app changes

```
node design-system/scripts/extract-master.mjs
npm run build && node design-system/scripts/subset-css.mjs
node design-system/scripts/build-ds-bundle.mjs
node design-system/scripts/gen-manifest.mjs
node design-system/scripts/render-check.mjs     # must end bad=0
```

Component `.jsx` files are extracted by hand+audit (see `[ds-extract]` seams) — if a source
component changes visually, re-extract it and re-run the audit + render check.

## Syncing into your own Claude Design account (Shirly: this is your part)

1. Clone/pull this repo, branch `master` (after the PR merges).
2. In Claude Code, from the repo root, ask:
   *"Sync design-system/bundle into my Claude Design design-system project"* —
   Claude uses the DesignSync tool: `list_projects` (or `create_project` named
   "WaffleStack Design System"), then `finalize_plan` with `localDir = design-system/bundle`
   and writes of `**` , then `write_files` for every file in `bundle/`.
3. Open claude.ai/design → the project now shows the WaffleStack cards, and new
   prototypes inherit the real app's look. Re-sync after each merged design-system PR.

Known app quirk mirrored on purpose: `--sh-gold`/`--sh-cream` are consumed but never
defined in the app (`src/components/economy/*`, `RiskBoard.tsx`). Fix it in the app first
if it bothers you, then re-extract.
