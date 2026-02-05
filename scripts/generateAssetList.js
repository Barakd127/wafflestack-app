/**
 * Script to generate asset list from model folders
 * Run: node scripts/generateAssetList.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsPath = path.join(__dirname, '../public/models');

// Map folder names to kit IDs
const kitMap = {
  'fantasy-town': 'fantasy-town',
  'food': 'food',
  'industrial': 'industrial',
  'roads': 'roads',
  'furniture': 'furniture',
  'graveyard': 'graveyard',
  'mini-dungeon': 'mini-dungeon',
  'modular-buildings': 'modular-buildings',
  'pirate': 'pirate',
  'platformer': 'platformer',
  'retro-urban': 'retro-urban',
  'space': 'space',
  'watercraft': 'watercraft',
  'car': 'car'
};

function categorizeAsset(filename) {
  const name = filename.replace('.glb', '');
  
  // Categorization logic
  if (name.includes('wall')) return 'wall';
  if (name.includes('roof')) return 'roof';
  if (name.includes('door') || name.includes('gate')) return 'door';
  if (name.includes('window')) return 'window';
  if (name.includes('stair')) return 'stairs';
  if (name.includes('fence') || name.includes('hedge')) return 'fence';
  if (name.includes('road')) return 'road';
  if (name.includes('fountain')) return 'decoration';
  if (name.includes('tree') || name.includes('rock')) return 'nature';
  if (name.includes('cart') || name.includes('stall')) return 'prop';
  if (name.includes('banner') || name.includes('lantern')) return 'decoration';
  
  return 'structure';
}

function generateAssetList() {
  const results = {};
  
  Object.keys(kitMap).forEach(folder => {
    const folderPath = path.join(modelsPath, folder);
    
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.glb'));
      
      results[kitMap[folder]] = files.map((file, index) => {
        const name = file.replace('.glb', '')
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        return {
          id: `${kitMap[folder]}-${index}`,
          name: name,
          path: `/models/${folder}/${file}`,
          category: categorizeAsset(file)
        };
      });
      
      console.log(`${kitMap[folder]}: ${files.length} models`);
    }
  });
  
  // Write to JSON file
  fs.writeFileSync(
    path.join(__dirname, 'assetList.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n✅ Asset list generated: scripts/assetList.json');
  console.log(`Total kits: ${Object.keys(results).length}`);
  console.log(`Total models: ${Object.values(results).reduce((sum, kit) => sum + kit.length, 0)}`);
}

generateAssetList();
