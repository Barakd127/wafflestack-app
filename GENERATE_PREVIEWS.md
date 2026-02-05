# 🖼️ Preview Image Generation Guide

## Problem
The asset library shows placeholder icons because preview images don't exist yet.

## Solution Options

### Option 1: Auto-Generate Previews (Recommended)
Use a script to render each 3D model to a PNG thumbnail.

**Install packages:**
```bash
npm install --save-dev @react-three/offscreen three-offscreen-renderer
```

**Script location:** `scripts/generatePreviews.js`

### Option 2: Use Kenney's Official Previews
Download from Kenney.nl:
1. Go to each kit page
2. Download the preview images
3. Place in `public/previews/[kit-name]/`

### Option 3: Quick Fix - Enhanced Placeholders
Update the UI to show better placeholder icons based on category.

---

## Current Implementation

The `BuildingLibrary.tsx` already has excellent hover animations:
- ✅ `hover:scale-105` - Card scales up
- ✅ `group-hover:scale-110` - Image zooms
- ✅ `hover:shadow-xl` - Shadow grows
- ✅ Selection indicator with checkmark

**The animations ARE working!** The issue is just missing images.

---

## Quick Fix Applied

I've updated the system to use category-based emojis as fallback:
- 🏰 Buildings
- 🗼 Towers  
- 🧱 Walls
- 🌲 Terrain
- ⚔️ Siege
- 🌳 Nature

These show immediately while you download actual preview images.

---

## To Add Real Previews

1. **Create the directory:**
```bash
mkdir -p public/previews/hexagon
mkdir -p public/previews/commercial
mkdir -p public/previews/suburban
```

2. **Add PNG files** matching the thumbnail paths in `assetLibrary.ts`:
```
public/previews/hexagon/building-archery.png
public/previews/hexagon/building-cabin.png
public/previews/hexagon/building-castle.png
... etc
```

3. **File format:**
- Size: 256x256px or 512x512px
- Format: PNG with transparency
- Background: Transparent or white

The UI will automatically switch from emojis to real images!
