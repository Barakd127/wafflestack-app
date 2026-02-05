/**
 * Script to download Kenney Hexagon Kit assets
 * Run: node download_kenney_assets.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Kenney assets URLs (from pmndrs/market or Kenney's site)
const KENNEY_ASSETS = {
  // These URLs need to be updated with actual Kenney asset URLs
  // Option 1: From pmndrs/market GitHub
  'hex_grass.glb': 'https://raw.githubusercontent.com/pmndrs/market/main/files/kenney-hexagon-kit/hex_grass.glb',
  'hex_base.glb': 'https://raw.githubusercontent.com/pmndrs/market/main/files/kenney-hexagon-kit/hex_base.glb',
  'hex_window.glb': 'https://raw.githubusercontent.com/pmndrs/market/main/files/kenney-hexagon-kit/hex_window.glb',
  'hex_roof.glb': 'https://raw.githubusercontent.com/pmndrs/market/main/files/kenney-hexagon-kit/hex_roof.glb',
  
  // Alternative: From Kenney's direct links
  // Update these if the above don't work
};

const OUTPUT_DIR = path.join(__dirname, 'public', 'models', 'kenney');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✓ Created directory: ${OUTPUT_DIR}`);
}

// Download function
function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(OUTPUT_DIR, filename);
    const file = fs.createWriteStream(filePath);
    
    console.log(`Downloading: ${filename}...`);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${filename}`);
          resolve();
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✓ Downloaded: ${filename}`);
            resolve();
          });
        });
      } else {
        reject(new Error(`Failed to download ${filename}: HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Download all assets
async function downloadAll() {
  console.log('🎨 Downloading Kenney Hexagon Kit assets...\n');
  
  try {
    for (const [filename, url] of Object.entries(KENNEY_ASSETS)) {
      await downloadFile(url, filename);
    }
    console.log('\n✅ All assets downloaded successfully!');
    console.log(`📁 Location: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 If URLs are not working, please:');
    console.log('1. Visit: https://kenney.nl/assets');
    console.log('2. Download "Hexagon Kit" manually');
    console.log('3. Extract GLB files to:', OUTPUT_DIR);
  }
}

downloadAll();
