# תפוס את הפול! ☕ (Seize the Bul!)

A mock **coffee-shop management game** in the wacky spirit of *Seize the Bean*
(the Berlin café deck-builder) with a **MakeRoom-by-Kenney** style 3D diorama.
Hebrew RTL, mobile-portrait first, works on desktop too.

**Play:** open `/coffee-game/` on the deployed site
(e.g. `https://wafflestack-app.vercel.app/coffee-game/`), or locally:

```bash
# serve the repo's public/ folder (relative ../models paths must resolve)
cd public && python3 -m http.server 8123
# → http://localhost:8123/coffee-game/
```

## Gameplay

- Wacky customers (hipster, grandma, statistics student, influencer, mystery
  critic…) queue up with orders. Tap a customer to start brewing; each has a
  patience bar. Serve → coins + tips; fail → reputation drops.
- The shop (bottom button) has three tabs: **upgrades** (espresso machine
  levels = faster + parallel brews; pastry display = unlocks the menu up to
  the legendary waffle), **staff** (auto-serving barista + a barista cat),
  and **decor** (MakeRoom-style room decoration: plant, rug, waffle clock,
  string lights, gramophone, sidewalk parasol, neon sign) which raises
  ambience → more patience and bigger tips.
- Reputation stars gate new customer types and speed up arrivals.
  Progress autosaves to `localStorage`.

## Tech

- Self-contained static page: no build step, no React — plain ES modules.
- three.js r160 vendored in `vendor/` (mapped via importmap; GLTFLoader and
  RoundedBoxGeometry keep the upstream `examples/jsm` layout).
- 3D models: **Kenney** CC0 assets already committed in this repo —
  `public/models/food/*.glb` (food kit), `public/models/kenney-suburban/planter.glb`,
  `public/kenney/commercial/detail-parasol-a.glb`.
- `public/models/food/Textures/colormap.png` is a **custom-generated palette** —
  the food kit's original colormap was never committed, so the models loaded
  textureless. The GLBs sample a 16-column hue × vertical-shade gradient
  sheet; regenerate/retheme with `python3 tools/generate-food-colormap.py`.
- Everything else (room, furniture, machine, characters) is hand-built
  three.js primitives in a flat Kenney-ish palette; UI is plain DOM/CSS.

## Characters (Tripo AI, optional)

The customers render as built-in chibi peeps (three.js primitives). To
replace them with AI-generated 3D characters, run **on a machine with a
`TRIPO_API_KEY` in `.env.local`** (the remote/CI environment can't reach
the Tripo API):

```bash
npm run tripo:characters
```

This uses the repo's existing Tripo pipeline (`scripts/tripo/generate.mjs`)
with `scripts/tripo/characters.json` prompts and writes
`public/models/characters/<personaId>.glb`. The game auto-loads any file
that exists (per-persona), and `tools/build-artifact.mjs` embeds them in
the single-file build; missing files silently fall back to the chibi peeps.
Regenerate one: `npm run tripo:characters -- hipster --force`.

## Credits

- 3D models: [Kenney](https://kenney.nl) — Creative Commons Zero (CC0).
- Inspired by *MakeRoom* (Kenney) and *Seize the Bean* (Quality Beast) —
  homage only; no assets or text from either game are used.
