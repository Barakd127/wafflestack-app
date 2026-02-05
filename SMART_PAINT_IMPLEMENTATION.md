# 🎨 Smart Paint Implementation

## Overview
The "Smart Paint" system intelligently applies user-selected colors to 3D buildings while **preserving** the original colors of windows, doors, roofs, and decorative details.

---

## ✨ Features

### 1. **Material-Targeted Coloring**
- Only colors the main structure (walls, facades)
- Preserves original colors for:
  - 🪟 Windows and glass
  - 🚪 Doors and doorways
  - 🏠 Roofs and shingles
  - ✨ Details, trim, and accents
  - 🔩 Metallic elements

### 2. **Debug Mode**
- Console logging shows ALL mesh and material names
- Helps identify Kenney's asset naming conventions
- Easy to adjust filtering rules based on actual names

### 3. **Smart Filtering Logic**
```typescript
// Example filters:
meshName.includes('window') || materialName.includes('window')
meshName.includes('glass') || materialName.includes('glass')
meshName.includes('door') || materialName.includes('door')
meshName.includes('roof') || materialName.includes('roof')
// ... and more
```

---

## 🔍 How to Use

### Testing the System:

1. **Open Browser Dev Console** (F12)
2. **Place a Building** in the scene
3. **Check the Console Logs:**
   ```
   🎨 Smart Paint Debug: {
     meshName: "building_wall_001",
     materialName: "Material.001",
     color: "808080"
   }
   ```
4. **Observe the Results:**
   - `⏭️ Skipping: window (preserving original color)` - Element NOT painted
   - `✅ Painted: wall with #FF6B6B` - Element colored

### Adjusting the Filter:

If windows/doors are still being colored (or shouldn't be), update the `shouldSkipColoring` logic in `ColorableModel.tsx`:

```typescript
const shouldSkipColoring = 
  meshName.includes('your-custom-keyword') ||
  materialName.includes('another-keyword')
```

---

## 📊 Current Filter Keywords

### **Preserved Elements:**
- `window`, `glass`
- `door`
- `roof`, `shingle`
- `detail`, `trim`, `accent`
- `metal`, `chrome`, `gold`, `copper`

### **Colored Elements:**
- Everything else (walls, structures, facades)

---

## 🎯 Expected Result

### Before Smart Paint:
❌ Entire building turns red (including blue windows)

### After Smart Paint:
✅ Walls turn red
✅ Windows stay blue
✅ Doors keep original color
✅ Roof maintains its color

---

## 🔧 Technical Details

### Material Cloning:
```typescript
child.material = child.material.clone()
```
- Prevents shared-state issues
- Each building has independent materials

### Color Application:
```typescript
mat.color = selectedColor
mat.metalness = 0.1
mat.roughness = 0.8
```
- Applies user color only to non-filtered materials
- Maintains good PBR properties

---

## 📝 Debug Mode Control

To **enable/disable** debug logging:

```typescript
const DEBUG_MATERIALS = true  // Set to false to disable
```

---

## 🚀 Next Steps

1. **Test with multiple building types**
2. **Check console for any unexpected names**
3. **Adjust filtering keywords if needed**
4. **Turn off debug mode when satisfied**

---

## 💡 Pro Tips

- **Different kits may use different naming conventions**
- **Check console logs for each new kit**
- **Add custom keywords as needed**
- **The filter is case-insensitive**

---

**Goal Achieved:** Paint walls red, keep windows blue, preserve roof colors! 🎨🏘️✨
