# Install Procedural Generation Packages

## Required NPM Packages

Run these commands in the `base44` directory:

```bash
cd base44

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
