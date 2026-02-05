/**
 * Asset Library Configuration
 * Catalogs all available 3D models organized by kit
 */

export interface AssetItem {
  id: string
  name: string
  path: string
  thumbnail?: string
  category: string
}

export interface AssetKit {
  id: string
  name: string
  color: string
  assets: AssetItem[]
}

// HEXAGON KIT
const hexagonKit: AssetKit = {
  id: 'hexagon',
  name: 'Hexagon Kit',
  color: '#4ECDC4',
  assets: [
    // Buildings
    { id: 'hex-archery', name: 'Archery', path: '/models/kenney/building-archery.glb', thumbnail: '/previews/hexagon/building-archery.png', category: 'building' },
    { id: 'hex-cabin', name: 'Cabin', path: '/models/kenney/building-cabin.glb', thumbnail: '/previews/hexagon/building-cabin.png', category: 'building' },
    { id: 'hex-castle', name: 'Castle', path: '/models/kenney/building-castle.glb', thumbnail: '/previews/hexagon/building-castle.png', category: 'building' },
    { id: 'hex-dock', name: 'Dock', path: '/models/kenney/building-dock.glb', thumbnail: '/previews/hexagon/building-dock.png', category: 'building' },
    { id: 'hex-farm', name: 'Farm', path: '/models/kenney/building-farm.glb', thumbnail: '/previews/hexagon/building-farm.png', category: 'building' },
    { id: 'hex-house', name: 'House', path: '/models/kenney/building-house.glb', thumbnail: '/previews/hexagon/building-house.png', category: 'building' },
    { id: 'hex-market', name: 'Market', path: '/models/kenney/building-market.glb', thumbnail: '/previews/hexagon/building-market.png', category: 'building' },
    { id: 'hex-mill', name: 'Mill', path: '/models/kenney/building-mill.glb', thumbnail: '/previews/hexagon/building-mill.png', category: 'building' },
    { id: 'hex-mine', name: 'Mine', path: '/models/kenney/building-mine.glb', thumbnail: '/previews/hexagon/building-mine.png', category: 'building' },
    { id: 'hex-port', name: 'Port', path: '/models/kenney/building-port.glb', thumbnail: '/previews/hexagon/building-port.png', category: 'building' },
    { id: 'hex-sheep', name: 'Sheep Farm', path: '/models/kenney/building-sheep.glb', thumbnail: '/previews/hexagon/building-sheep.png', category: 'building' },
    { id: 'hex-smelter', name: 'Smelter', path: '/models/kenney/building-smelter.glb', thumbnail: '/previews/hexagon/building-smelter.png', category: 'building' },
    { id: 'hex-tower', name: 'Tower', path: '/models/kenney/building-tower.glb', thumbnail: '/previews/hexagon/building-tower.png', category: 'building' },
    { id: 'hex-village', name: 'Village', path: '/models/kenney/building-village.glb', thumbnail: '/previews/hexagon/building-village.png', category: 'building' },
    { id: 'hex-wall', name: 'Wall', path: '/models/kenney/building-wall.glb', thumbnail: '/previews/hexagon/building-wall.png', category: 'building' },
    { id: 'hex-walls', name: 'Walls', path: '/models/kenney/building-walls.glb', thumbnail: '/previews/hexagon/building-walls.png', category: 'building' },
    { id: 'hex-watermill', name: 'Watermill', path: '/models/kenney/building-watermill.glb', thumbnail: '/previews/hexagon/building-watermill.png', category: 'building' },
    { id: 'hex-wizard', name: 'Wizard Tower', path: '/models/kenney/building-wizard-tower.glb', thumbnail: '/previews/hexagon/building-wizard-tower.png', category: 'building' },
    
    // Terrain
    { id: 'hex-grass', name: 'Grass', path: '/models/kenney/grass.glb', thumbnail: '/previews/hexagon/grass.png', category: 'terrain' },
    { id: 'hex-grass-forest', name: 'Forest', path: '/models/kenney/grass-forest.glb', thumbnail: '/previews/hexagon/grass-forest.png', category: 'terrain' },
    { id: 'hex-grass-hill', name: 'Hill', path: '/models/kenney/grass-hill.glb', thumbnail: '/previews/hexagon/grass-hill.png', category: 'terrain' },
    { id: 'hex-dirt', name: 'Dirt', path: '/models/kenney/dirt.glb', thumbnail: '/previews/hexagon/dirt.png', category: 'terrain' },
    { id: 'hex-dirt-lumber', name: 'Lumber', path: '/models/kenney/dirt-lumber.glb', thumbnail: '/previews/hexagon/dirt-lumber.png', category: 'terrain' },
    { id: 'hex-stone', name: 'Stone', path: '/models/kenney/stone.glb', thumbnail: '/previews/hexagon/stone.png', category: 'terrain' },
    { id: 'hex-stone-hill', name: 'Stone Hill', path: '/models/kenney/stone-hill.glb', thumbnail: '/previews/hexagon/stone-hill.png', category: 'terrain' },
    { id: 'hex-stone-mountain', name: 'Mountain', path: '/models/kenney/stone-mountain.glb', thumbnail: '/previews/hexagon/stone-mountain.png', category: 'terrain' },
    { id: 'hex-sand', name: 'Sand', path: '/models/kenney/sand.glb', thumbnail: '/previews/hexagon/sand.png', category: 'terrain' },
    { id: 'hex-water', name: 'Water', path: '/models/kenney/water.glb', thumbnail: '/previews/hexagon/water.png', category: 'terrain' },
    
    // Units
    { id: 'hex-unit-house', name: 'Small House', path: '/models/kenney/unit-house.glb', thumbnail: '/previews/hexagon/unit-house.png', category: 'unit' },
    { id: 'hex-unit-tower', name: 'Small Tower', path: '/models/kenney/unit-tower.glb', thumbnail: '/previews/hexagon/unit-tower.png', category: 'unit' },
    { id: 'hex-bridge', name: 'Bridge', path: '/models/kenney/bridge.glb', thumbnail: '/previews/hexagon/bridge.png', category: 'structure' },
  ]
}

// COMMERCIAL KIT (41 buildings)
const commercialKit: AssetKit = {
  id: 'commercial',
  name: 'City Commercial',
  color: '#FF6B6B',
  assets: [
    // Main buildings
    { id: 'com-a', name: 'Building A', path: '/models/commercial/building-a.glb', thumbnail: '/previews/commercial/building-a.png', category: 'building' },
    { id: 'com-b', name: 'Building B', path: '/models/commercial/building-b.glb', thumbnail: '/previews/commercial/building-b.png', category: 'building' },
    { id: 'com-c', name: 'Building C', path: '/models/commercial/building-c.glb', thumbnail: '/previews/commercial/building-c.png', category: 'building' },
    { id: 'com-d', name: 'Building D', path: '/models/commercial/building-d.glb', thumbnail: '/previews/commercial/building-d.png', category: 'building' },
    { id: 'com-e', name: 'Building E', path: '/models/commercial/building-e.glb', thumbnail: '/previews/commercial/building-e.png', category: 'building' },
    { id: 'com-f', name: 'Building F', path: '/models/commercial/building-f.glb', thumbnail: '/previews/commercial/building-f.png', category: 'building' },
    { id: 'com-g', name: 'Building G', path: '/models/commercial/building-g.glb', thumbnail: '/previews/commercial/building-g.png', category: 'building' },
    { id: 'com-h', name: 'Building H', path: '/models/commercial/building-h.glb', thumbnail: '/previews/commercial/building-h.png', category: 'building' },
    { id: 'com-i', name: 'Building I', path: '/models/commercial/building-i.glb', thumbnail: '/previews/commercial/building-i.png', category: 'building' },
    { id: 'com-j', name: 'Building J', path: '/models/commercial/building-j.glb', thumbnail: '/previews/commercial/building-j.png', category: 'building' },
    { id: 'com-k', name: 'Building K', path: '/models/commercial/building-k.glb', thumbnail: '/previews/commercial/building-k.png', category: 'building' },
    { id: 'com-l', name: 'Building L', path: '/models/commercial/building-l.glb', thumbnail: '/previews/commercial/building-l.png', category: 'building' },
    { id: 'com-m', name: 'Building M', path: '/models/commercial/building-m.glb', thumbnail: '/previews/commercial/building-m.png', category: 'building' },
    { id: 'com-n', name: 'Building N', path: '/models/commercial/building-n.glb', thumbnail: '/previews/commercial/building-n.png', category: 'building' },
    // Skyscrapers
    { id: 'com-sky-a', name: 'Skyscraper A', path: '/models/commercial/building-skyscraper--a.glb', thumbnail: '/previews/commercial/building-skyscraper-a.png', category: 'skyscraper' },
    { id: 'com-sky-b', name: 'Skyscraper B', path: '/models/commercial/building-skyscraper--b.glb', thumbnail: '/previews/commercial/building-skyscraper-b.png', category: 'skyscraper' },
    { id: 'com-sky-c', name: 'Skyscraper C', path: '/models/commercial/building-skyscraper--c.glb', thumbnail: '/previews/commercial/building-skyscraper-c.png', category: 'skyscraper' },
    { id: 'com-sky-d', name: 'Skyscraper D', path: '/models/commercial/building-skyscraper--d.glb', thumbnail: '/previews/commercial/building-skyscraper-d.png', category: 'skyscraper' },
    { id: 'com-sky-e', name: 'Skyscraper E', path: '/models/commercial/building-skyscraper--e.glb', thumbnail: '/previews/commercial/building-skyscraper-e.png', category: 'skyscraper' },
  ]
}

// SUBURBAN KIT (40 houses)
const suburbanKit: AssetKit = {
  id: 'suburban',
  name: 'City Suburban',
  color: '#FFE66D',
  assets: [
    { id: 'sub-a', name: 'House A', path: '/models/suburban/building-type-a.glb', thumbnail: '/previews/suburban/building-type-a.png', category: 'house' },
    { id: 'sub-b', name: 'House B', path: '/models/suburban/building-type-b.glb', thumbnail: '/previews/suburban/building-type-b.png', category: 'house' },
    { id: 'sub-c', name: 'House C', path: '/models/suburban/building-type-c.glb', thumbnail: '/previews/suburban/building-type-c.png', category: 'house' },
    { id: 'sub-d', name: 'House D', path: '/models/suburban/building-type-d.glb', thumbnail: '/previews/suburban/building-type-d.png', category: 'house' },
    { id: 'sub-e', name: 'House E', path: '/models/suburban/building-type-e.glb', thumbnail: '/previews/suburban/building-type-e.png', category: 'house' },
    { id: 'sub-f', name: 'House F', path: '/models/suburban/building-type-f.glb', thumbnail: '/previews/suburban/building-type-f.png', category: 'house' },
    { id: 'sub-g', name: 'House G', path: '/models/suburban/building-type-g.glb', thumbnail: '/previews/suburban/building-type-g.png', category: 'house' },
    { id: 'sub-h', name: 'House H', path: '/models/suburban/building-type-h.glb', thumbnail: '/previews/suburban/building-type-h.png', category: 'house' },
    { id: 'sub-i', name: 'House I', path: '/models/suburban/building-type-i.glb', thumbnail: '/previews/suburban/building-type-i.png', category: 'house' },
    { id: 'sub-j', name: 'House J', path: '/models/suburban/building-type-j.glb', thumbnail: '/previews/suburban/building-type-j.png', category: 'house' },
    { id: 'sub-k', name: 'House K', path: '/models/suburban/building-type-k.glb', thumbnail: '/previews/suburban/building-type-k.png', category: 'house' },
    { id: 'sub-l', name: 'House L', path: '/models/suburban/building-type-l.glb', thumbnail: '/previews/suburban/building-type-l.png', category: 'house' },
    { id: 'sub-m', name: 'House M', path: '/models/suburban/building-type-m.glb', thumbnail: '/previews/suburban/building-type-m.png', category: 'house' },
    { id: 'sub-n', name: 'House N', path: '/models/suburban/building-type-n.glb', thumbnail: '/previews/suburban/building-type-n.png', category: 'house' },
    { id: 'sub-o', name: 'House O', path: '/models/suburban/building-type-o.glb', thumbnail: '/previews/suburban/building-type-o.png', category: 'house' },
    { id: 'sub-p', name: 'House P', path: '/models/suburban/building-type-p.glb', thumbnail: '/previews/suburban/building-type-p.png', category: 'house' },
    { id: 'sub-q', name: 'House Q', path: '/models/suburban/building-type-q.glb', thumbnail: '/previews/suburban/building-type-q.png', category: 'house' },
    { id: 'sub-r', name: 'House R', path: '/models/suburban/building-type-r.glb', thumbnail: '/previews/suburban/building-type-r.png', category: 'house' },
    { id: 'sub-s', name: 'House S', path: '/models/suburban/building-type-s.glb', thumbnail: '/previews/suburban/building-type-s.png', category: 'house' },
    { id: 'sub-t', name: 'House T', path: '/models/suburban/building-type-t.glb', thumbnail: '/previews/suburban/building-type-t.png', category: 'house' },
    { id: 'sub-u', name: 'House U', path: '/models/suburban/building-type-u.glb', thumbnail: '/previews/suburban/building-type-u.png', category: 'house' },
    // Props
    { id: 'sub-tree-lg', name: 'Tree Large', path: '/models/suburban/tree-large.glb', thumbnail: '/previews/suburban/tree-large.png', category: 'nature' },
    { id: 'sub-tree-sm', name: 'Tree Small', path: '/models/suburban/tree-small.glb', thumbnail: '/previews/suburban/tree-small.png', category: 'nature' },
    { id: 'sub-fence', name: 'Fence', path: '/models/suburban/fence.glb', thumbnail: '/previews/suburban/fence.png', category: 'decoration' },
  ]
}

// CASTLE KIT (76 pieces)
const castleKit: AssetKit = {
  id: 'castle',
  name: 'Castle Kit',
  color: '#AA96DA',
  assets: [
    // Towers
    { id: 'castle-tower-sq', name: 'Square Tower', path: '/models/castle/tower-square.glb', thumbnail: '/previews/castle/tower-square.png', category: 'tower' },
    { id: 'castle-tower-base', name: 'Tower Base', path: '/models/castle/tower-base.glb', thumbnail: '/previews/castle/tower-base.png', category: 'tower' },
    { id: 'castle-tower-hex', name: 'Hex Tower Base', path: '/models/castle/tower-hexagon-base.glb', thumbnail: '/previews/castle/tower-hexagon-base.png', category: 'tower' },
    { id: 'castle-tower-top', name: 'Tower Top', path: '/models/castle/tower-top.glb', thumbnail: '/previews/castle/tower-top.png', category: 'tower' },
    // Walls
    { id: 'castle-wall', name: 'Wall', path: '/models/castle/wall.glb', thumbnail: '/previews/castle/wall.png', category: 'wall' },
    { id: 'castle-wall-corner', name: 'Wall Corner', path: '/models/castle/wall-corner.glb', thumbnail: '/previews/castle/wall-corner.png', category: 'wall' },
    { id: 'castle-wall-door', name: 'Wall Doorway', path: '/models/castle/wall-doorway.glb', thumbnail: '/previews/castle/wall-doorway.png', category: 'wall' },
    { id: 'castle-gate', name: 'Gate', path: '/models/castle/gate.glb', thumbnail: '/previews/castle/gate.png', category: 'structure' },
    // Bridges
    { id: 'castle-bridge', name: 'Bridge', path: '/models/castle/bridge-straight.glb', thumbnail: '/previews/castle/bridge-straight.png', category: 'structure' },
    { id: 'castle-drawbridge', name: 'Drawbridge', path: '/models/castle/bridge-draw.glb', thumbnail: '/previews/castle/bridge-draw.png', category: 'structure' },
    // Siege
    { id: 'castle-catapult', name: 'Catapult', path: '/models/castle/siege-catapult.glb', thumbnail: '/previews/castle/siege-catapult.png', category: 'siege' },
    { id: 'castle-trebuchet', name: 'Trebuchet', path: '/models/castle/siege-trebuchet.glb', thumbnail: '/previews/castle/siege-trebuchet.png', category: 'siege' },
    { id: 'castle-ram', name: 'Battering Ram', path: '/models/castle/siege-ram.glb', thumbnail: '/previews/castle/siege-ram.png', category: 'siege' },
    // Nature
    { id: 'castle-tree-lg', name: 'Tree Large', path: '/models/castle/tree-large.glb', thumbnail: '/previews/castle/tree-large.png', category: 'nature' },
    { id: 'castle-tree-sm', name: 'Tree Small', path: '/models/castle/tree-small.glb', thumbnail: '/previews/castle/tree-small.png', category: 'nature' },
  ]
}

const natureKit: AssetKit = {
  id: 'nature',
  name: 'Nature Kit',
  color: '#A8E6CF',
  assets: [] // Nature kit doesn't have GLB format
}

// FANTASY TOWN KIT (167 pieces! - showing 10 samples)
const fantasyTownKit: AssetKit = {
  id: 'fantasy-town',
  name: 'Fantasy Town',
  color: '#F38181',
  assets: [
    { id: 'ft-wall', name: 'Wall', path: '/models/fantasy-town/wall.glb', thumbnail: '/previews/fantasy-town/wall.png', category: 'wall' },
    { id: 'ft-wall-door', name: 'Wall Door', path: '/models/fantasy-town/wall-door.glb', thumbnail: '/previews/fantasy-town/wall-door.png', category: 'wall' },
    { id: 'ft-wall-window', name: 'Wall Window Glass', path: '/models/fantasy-town/wall-window-glass.glb', thumbnail: '/previews/fantasy-town/wall-window-glass.png', category: 'wall' },
    { id: 'ft-roof', name: 'Roof', path: '/models/fantasy-town/roof.glb', thumbnail: '/previews/fantasy-town/roof.png', category: 'roof' },
    { id: 'ft-roof-gable', name: 'Roof Gable', path: '/models/fantasy-town/roof-gable.glb', thumbnail: '/previews/fantasy-town/roof-gable.png', category: 'roof' },
    { id: 'ft-fence', name: 'Fence', path: '/models/fantasy-town/fence.glb', thumbnail: '/previews/fantasy-town/fence.png', category: 'fence' },
    { id: 'ft-stairs', name: 'Stairs Stone', path: '/models/fantasy-town/stairs-stone.glb', thumbnail: '/previews/fantasy-town/stairs-stone.png', category: 'stairs' },
    { id: 'ft-tree', name: 'Tree', path: '/models/fantasy-town/tree.glb', thumbnail: '/previews/fantasy-town/tree.png', category: 'nature' },
    { id: 'ft-fountain', name: 'Fountain Square', path: '/models/fantasy-town/fountain-square.glb', thumbnail: '/previews/fantasy-town/fountain-square.png', category: 'decoration' },
    { id: 'ft-windmill', name: 'Windmill', path: '/models/fantasy-town/windmill.glb', thumbnail: '/previews/fantasy-town/windmill.png', category: 'structure' },
  ]
}

// FOOD KIT (200+ items! - showing 10 samples)
const foodKit: AssetKit = {
  id: 'food',
  name: 'Food Kit',
  color: '#FCBAD3',
  assets: [
    { id: 'food-apple', name: 'Apple', path: '/models/food/apple.glb', thumbnail: '/previews/food/apple.png', category: 'fruit' },
    { id: 'food-bread', name: 'Bread', path: '/models/food/bread.glb', thumbnail: '/previews/food/bread.png', category: 'bakery' },
    { id: 'food-burger', name: 'Burger', path: '/models/food/burger.glb', thumbnail: '/previews/food/burger.png', category: 'fast-food' },
    { id: 'food-pizza', name: 'Pizza', path: '/models/food/pizza.glb', thumbnail: '/previews/food/pizza.png', category: 'fast-food' },
    { id: 'food-cake', name: 'Cake', path: '/models/food/cake.glb', thumbnail: '/previews/food/cake.png', category: 'dessert' },
    { id: 'food-donut', name: 'Donut', path: '/models/food/donut.glb', thumbnail: '/previews/food/donut.png', category: 'dessert' },
    { id: 'food-ice-cream', name: 'Ice Cream', path: '/models/food/ice-cream.glb', thumbnail: '/previews/food/ice-cream.png', category: 'dessert' },
    { id: 'food-fish', name: 'Fish', path: '/models/food/fish.glb', thumbnail: '/previews/food/fish.png', category: 'seafood' },
    { id: 'food-sushi', name: 'Sushi Salmon', path: '/models/food/sushi-salmon.glb', thumbnail: '/previews/food/sushi-salmon.png', category: 'japanese' },
    { id: 'food-turkey', name: 'Turkey', path: '/models/food/turkey.glb', thumbnail: '/previews/food/turkey.png', category: 'meat' },
  ]
}

// INDUSTRIAL KIT (25 total - showing 10)
const industrialKit: AssetKit = {
  id: 'industrial',
  name: 'Industrial',
  color: '#95A5A6',
  assets: [
    { id: 'ind-a', name: 'Factory A', path: '/models/industrial/building-a.glb', thumbnail: '/previews/industrial/building-a.png', category: 'factory' },
    { id: 'ind-b', name: 'Factory B', path: '/models/industrial/building-b.glb', thumbnail: '/previews/industrial/building-b.png', category: 'factory' },
    { id: 'ind-c', name: 'Warehouse C', path: '/models/industrial/building-c.glb', thumbnail: '/previews/industrial/building-c.png', category: 'warehouse' },
    { id: 'ind-d', name: 'Plant D', path: '/models/industrial/building-d.glb', thumbnail: '/previews/industrial/building-d.png', category: 'plant' },
    { id: 'ind-e', name: 'Industrial E', path: '/models/industrial/building-e.glb', thumbnail: '/previews/industrial/building-e.png', category: 'building' },
    { id: 'ind-f', name: 'Industrial F', path: '/models/industrial/building-f.glb', thumbnail: '/previews/industrial/building-f.png', category: 'building' },
    { id: 'ind-chimney-lg', name: 'Chimney Large', path: '/models/industrial/chimney-large.glb', thumbnail: '/previews/industrial/chimney-large.png', category: 'structure' },
    { id: 'ind-chimney-md', name: 'Chimney Medium', path: '/models/industrial/chimney-medium.glb', thumbnail: '/previews/industrial/chimney-medium.png', category: 'structure' },
    { id: 'ind-chimney-sm', name: 'Chimney Small', path: '/models/industrial/chimney-small.glb', thumbnail: '/previews/industrial/chimney-small.png', category: 'structure' },
    { id: 'ind-tank', name: 'Tank', path: '/models/industrial/detail-tank.glb', thumbnail: '/previews/industrial/detail-tank.png', category: 'structure' },
  ]
}

// ROADS KIT (72 total - showing 10)
const roadsKit: AssetKit = {
  id: 'roads',
  name: 'Roads',
  color: '#34495E',
  assets: [
    { id: 'road-straight', name: 'Road Straight', path: '/models/roads/road-straight.glb', thumbnail: '/previews/roads/road-straight.png', category: 'road' },
    { id: 'road-bend', name: 'Road Bend', path: '/models/roads/road-bend.glb', thumbnail: '/previews/roads/road-bend.png', category: 'road' },
    { id: 'road-curve', name: 'Road Curve', path: '/models/roads/road-curve.glb', thumbnail: '/previews/roads/road-curve.png', category: 'road' },
    { id: 'road-cross', name: 'Road Crossroad', path: '/models/roads/road-crossroad.glb', thumbnail: '/previews/roads/road-crossroad.png', category: 'road' },
    { id: 'road-intersection', name: 'Road Intersection', path: '/models/roads/road-intersection.glb', thumbnail: '/previews/roads/road-intersection.png', category: 'road' },
    { id: 'road-bridge', name: 'Road Bridge', path: '/models/roads/road-bridge.glb', thumbnail: '/previews/roads/road-bridge.png', category: 'bridge' },
    { id: 'road-roundabout', name: 'Roundabout', path: '/models/roads/road-roundabout.glb', thumbnail: '/previews/roads/road-roundabout.png', category: 'road' },
    { id: 'road-light', name: 'Street Light', path: '/models/roads/light-square.glb', thumbnail: '/previews/roads/light-square.png', category: 'decoration' },
    { id: 'road-cone', name: 'Construction Cone', path: '/models/roads/construction-cone.glb', thumbnail: '/previews/roads/construction-cone.png', category: 'decoration' },
    { id: 'road-barrier', name: 'Construction Barrier', path: '/models/roads/construction-barrier.glb', thumbnail: '/previews/roads/construction-barrier.png', category: 'decoration' },
  ]
}

// FURNITURE KIT
const furnitureKit: AssetKit = {
  id: 'furniture',
  name: 'Furniture',
  color: '#8B4513',
  assets: []
}

// GRAVEYARD KIT
const graveyardKit: AssetKit = {
  id: 'graveyard',
  name: 'Graveyard',
  color: '#7F8C8D',
  assets: []
}

// MINI DUNGEON
const miniDungeonKit: AssetKit = {
  id: 'mini-dungeon',
  name: 'Mini Dungeon',
  color: '#8E44AD',
  assets: []
}

// MODULAR BUILDINGS
const modularBuildingsKit: AssetKit = {
  id: 'modular-buildings',
  name: 'Modular Buildings',
  color: '#E67E22',
  assets: []
}

// PIRATE KIT
const pirateKit: AssetKit = {
  id: 'pirate',
  name: 'Pirate',
  color: '#2C3E50',
  assets: []
}

// PLATFORMER KIT
const platformerKit: AssetKit = {
  id: 'platformer',
  name: 'Platformer',
  color: '#16A085',
  assets: []
}

// RETRO URBAN
const retroUrbanKit: AssetKit = {
  id: 'retro-urban',
  name: 'Retro Urban',
  color: '#D35400',
  assets: []
}

// SPACE KIT
const spaceKit: AssetKit = {
  id: 'space',
  name: 'Space',
  color: '#2E4053',
  assets: []
}

// WATERCRAFT
const watercraftKit: AssetKit = {
  id: 'watercraft',
  name: 'Watercraft',
  color: '#3498DB',
  assets: []
}

// CAR KIT
const carKit: AssetKit = {
  id: 'car',
  name: 'Car',
  color: '#C0392B',
  assets: []
}

export const ASSET_LIBRARY: AssetKit[] = [
  hexagonKit,
  commercialKit,
  suburbanKit,
  castleKit,
  fantasyTownKit,
  foodKit,
  industrialKit,
  roadsKit,
  furnitureKit,
  graveyardKit,
  miniDungeonKit,
  modularBuildingsKit,
  pirateKit,
  platformerKit,
  retroUrbanKit,
  spaceKit,
  watercraftKit,
  carKit,
  natureKit,
]

export function getAssetById(id: string): AssetItem | undefined {
  for (const kit of ASSET_LIBRARY) {
    const asset = kit.assets.find(a => a.id === id)
    if (asset) return asset
  }
  return undefined
}

export function getKitById(id: string): AssetKit | undefined {
  return ASSET_LIBRARY.find(kit => kit.id === id)
}
