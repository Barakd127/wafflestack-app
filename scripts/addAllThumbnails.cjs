/**
 * Script to automatically add thumbnail paths to ALL assets based on preview files
 */

const fs = require('fs');
const path = require('path');

// Read the assetLibrary file
const assetLibraryPath = path.join(__dirname, '..', 'src', 'config', 'assetLibrary.ts');
let content = fs.readFileSync(assetLibraryPath, 'utf8');

// Map of kit IDs to preview folder names (already mapped in COPY_ALL_PREVIEWS.ps1)
const kitMappings = {
  'hexagon': 'hexagon',
  'commercial': 'commercial',
  'suburban': 'suburban',
  'castle': 'castle',
  'fantasy-town': 'fantasy-town',
  'food': 'food',
  'industrial': 'industrial',
  'roads': 'roads',
  'graveyard': 'graveyard',
  'mini-dungeon': 'mini-dungeon',
  'modular-buildings': 'modular-buildings',
  'pirate': 'pirate',
  'platformer': 'platformer',
  'retro-urban': 'retro-urban',
  'watercraft': 'watercraft',
  'car': 'car'
};

// Get all preview files for each kit
const previewsDir = path.join(__dirname, '..', 'public', 'previews');
const availablePreviews = {};

for (const [kitId, folderName] of Object.entries(kitMappings)) {
  const kitPreviewDir = path.join(previewsDir, folderName);
  if (fs.existsSync(kitPreviewDir)) {
    const files = fs.readdirSync(kitPreviewDir);
    availablePreviews[kitId] = files.map(f => f.replace('.png', ''));
    console.log(`✅ ${kitId}: Found ${files.length} preview images`);
  } else {
    console.log(`⏭️  ${kitId}: No previews folder`);
  }
}

// Function to add thumbnail to asset line
function addThumbnailToAsset(line, kitId, modelPath) {
  // Skip if already has thumbnail
  if (line.includes('thumbnail:')) {
    return line;
  }
  
  // Extract the model filename from path
  const pathMatch = line.match(/path: '([^']+)'/);
  if (!pathMatch) return line;
  
  const fullPath = pathMatch[1];
  const fileName = path.basename(fullPath, '.glb');
  
  // Check if we have a preview for this file
  const previewFolder = kitMappings[kitId];
  if (!previewFolder || !availablePreviews[kitId]) {
    return line;
  }
  
  // Try to find matching preview
  const previews = availablePreviews[kitId];
  const matchingPreview = previews.find(p => {
    // Direct match
    if (p === fileName) return true;
    // Handle double dashes (building-skyscraper--a -> building-skyscraper-a)
    if (p === fileName.replace('--', '-')) return true;
    return false;
  });
  
  if (matchingPreview) {
    // Add thumbnail before category
    const thumbnailPath = `/previews/${previewFolder}/${matchingPreview}.png`;
    const modifiedLine = line.replace(
      /, category:/,
      `, thumbnail: '${thumbnailPath}', category:`
    );
    return modifiedLine;
  }
  
  return line;
}

// Process each kit
let modifiedContent = content;
let addedCount = 0;

// Identify which kit we're in by looking for kit declarations
const kitPatterns = Object.keys(kitMappings).map(kitId => ({
  id: kitId,
  startRegex: new RegExp(`const ${kitId}Kit: AssetKit = {`, 'i'),
  endRegex: /^}/m
}));

// Process line by line
const lines = modifiedContent.split('\n');
let currentKit = null;
let result = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if we're entering a kit
  for (const kit of kitPatterns) {
    if (kit.startRegex.test(line)) {
      currentKit = kit.id;
      console.log(`\n📦 Processing ${currentKit} kit...`);
      break;
    }
  }
  
  // Check if we're leaving a kit
  if (currentKit && line.match(/^const \w+Kit: AssetKit/)) {
    currentKit = null;
  }
  
  // Process asset lines
  if (currentKit && line.includes('path:') && line.includes('.glb')) {
    const modifiedLine = addThumbnailToAsset(line, currentKit, line);
    if (modifiedLine !== line) {
      addedCount++;
      console.log(`  ✅ Added thumbnail for: ${line.match(/name: '([^']+)'/)?.[1] || 'asset'}`);
    }
    result.push(modifiedLine);
  } else {
    result.push(line);
  }
}

// Write the modified content
const finalContent = result.join('\n');
fs.writeFileSync(assetLibraryPath, finalContent, 'utf8');

console.log(`\n🎉 Complete! Added ${addedCount} thumbnail paths to assetLibrary.ts`);
console.log(`📄 File updated: ${assetLibraryPath}`);
