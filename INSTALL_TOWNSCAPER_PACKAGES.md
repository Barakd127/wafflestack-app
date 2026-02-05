# 🏘️ Install Townscaper Experience Packages

## Required Dependencies

Run these commands to install the animation and post-processing libraries:

```bash
cd c:\Users\BARAK\Projects\base44

# Animation library for "The Juice"
npm install @react-spring/three

# Post-processing for "Illustration Look"
npm install @react-three/postprocessing postprocessing

# Ensure peer dependencies are satisfied
npm install three@latest @react-three/fiber@latest @react-three/drei@latest
```

## What Each Package Does

### @react-spring/three
- **Purpose**: Elastic spring animations
- **Used For**: PopIn "plop" effect when buildings spawn
- **Config**: Tension 180, Friction 12 for Townscaper bounce

### @react-three/postprocessing
- **Purpose**: Shader-based visual effects
- **Used For**: 
  - Outline shader (black ink lines)
  - N8AO (Ambient Occlusion for soft shadows)
  - Bloom and other effects

### postprocessing
- **Purpose**: Core postprocessing library
- **Note**: Peer dependency of @react-three/postprocessing

## Verify Installation

After installation, check `package.json`:

```json
{
  "dependencies": {
    "@react-spring/three": "^9.x.x",
    "@react-three/postprocessing": "^2.x.x",
    "postprocessing": "^6.x.x"
  }
}
```

## Next Steps

1. Install packages
2. Restart dev server
3. Components will auto-import from these libraries
4. Enjoy the Townscaper experience! 🎨✨
