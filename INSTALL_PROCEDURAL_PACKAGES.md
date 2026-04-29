# Install Procedural Generation Packages

> ⚠️ **HISTORICAL** — This was for the cancelled BASE44 cyberpunk voxel project's procedural-terrain experiment. WaffleStack ships a fixed Kenney GLB city (`WaffleStackCity.tsx`), not procedural terrain, so `simplex-noise` and `seedrandom` are **not** dependencies of the current app. Do not run the install commands below unless you're reviving the procedural-terrain experiment in a branch.

## Required NPM Packages

Run these commands in the WaffleStack project root (in this vault: `AI/WaffleStack/code/`; cancelled path: `~/Projects/base44/`):

```bash
cd AI/WaffleStack/code   # or your local clone of barakd127/wafflestack-app

# Install procedural generation dependencies
npm install simplex-noise seedrandom

# Install TypeScript types
npm install --save-dev @types/seedrandom
```

## What These Packages Do:

1. **simplex-noise** - Generates smooth, organic noise for terrain
2. **seedrandom** - Creates deterministic random numbers (same seed = same terrain)
3. **@types/seedrandom** - TypeScript type definitions

## After Installation:

The TypeScript errors in `terrainGenerator.ts` will disappear and you can run the development server to see the procedural terrain in action!

```bash
npm run dev
```
