import { useState } from 'react'
import { ASSET_LIBRARY, AssetItem, AssetKit } from '../config/assetLibrary'

interface BuildingLibraryProps {
  selectedAsset: AssetItem | null
  onSelectAsset: (asset: AssetItem) => void
  selectedKit: string
  onSelectKit: (kitId: string) => void
}

// Category-based icon helper
const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    building: '🏠',
    tower: '🗼',
    wall: '🧱',
    structure: '🏛️',
    terrain: '🌲',
    unit: '⚔️',
    nature: '🌳',
    siege: '🏹',
    house: '🏡',
    skyscraper: '🏙️',
    factory: '🏭',
    warehouse: '📦',
    plant: '⚙️',
    road: '🛣️',
    bridge: '🌉',
    decoration: '✨',
    fruit: '🍎',
    bakery: '🍞',
    'fast-food': '🍔',
    dessert: '🍰',
    seafood: '🐟',
    japanese: '🍣',
    meat: '🍖',
    roof: '🏠',
    fence: '🚧',
    stairs: '🪜',
  }
  return icons[category] || '🏗️'
}

const BuildingLibrary = ({ selectedAsset, onSelectAsset, selectedKit, onSelectKit }: BuildingLibraryProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const currentKit = ASSET_LIBRARY.find(kit => kit.id === selectedKit)
  
  if (!currentKit) return null

  // Get unique categories
  const categories = ['all', ...new Set(currentKit.assets.map(a => a.category))]
  
  // Filter assets
  const filteredAssets = categoryFilter === 'all' 
    ? currentKit.assets 
    : currentKit.assets.filter(a => a.category === categoryFilter)

  return (
    <div className="absolute bottom-6 left-6 pointer-events-auto z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 px-4 py-2 backdrop-blur-xl bg-white/90 border-2 border-black rounded-xl font-semibold hover:scale-105 transition-all shadow-xl"
      >
        {isOpen ? '📦 Hide Library' : '📦 Show Library'}
      </button>

      {/* Library Panel */}
      {isOpen && (
        <div className="backdrop-blur-xl bg-white/95 border-2 border-black rounded-2xl p-4 shadow-2xl max-w-3xl">
          {/* Kit Selector */}
          <div className="mb-4">
            <h3 className="text-sm font-bold mb-2 text-gray-800">Asset Kit:</h3>
            <div className="flex gap-2 flex-wrap">
              {ASSET_LIBRARY.map(kit => (
                <button
                  key={kit.id}
                  onClick={() => onSelectKit(kit.id)}
                  disabled={kit.assets.length === 0}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border-2 ${
                    selectedKit === kit.id
                      ? 'border-black scale-105 shadow-lg'
                      : 'border-gray-300 hover:scale-105'
                  } ${kit.assets.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ 
                    backgroundColor: kit.assets.length > 0 ? kit.color : '#ccc',
                    color: 'white'
                  }}
                >
                  {kit.name}
                  {kit.assets.length === 0 && ' (Coming Soon)'}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-3">
            <h3 className="text-sm font-bold mb-2 text-gray-800">Category:</h3>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border-2 ${
                    categoryFilter === cat
                      ? 'border-black bg-gray-800 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Grid */}
          <div className="mb-2">
            <h3 className="text-sm font-bold mb-2 text-gray-800">
              Select Building ({filteredAssets.length} available):
            </h3>
            <div className="grid grid-cols-5 gap-3 max-h-80 overflow-y-auto p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-inner">
              {filteredAssets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className={`
                    group relative rounded-xl border-2 transition-all duration-300
                    hover:scale-110 hover:shadow-2xl hover:z-10 flex flex-col overflow-hidden
                    ${selectedAsset?.id === asset.id
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 scale-105 shadow-xl ring-4 ring-blue-300'
                      : 'border-gray-300 bg-white hover:border-blue-400 shadow-md'
                    }
                  `}
                  title={asset.name}
                >
                  {/* Thumbnail Container with ENHANCED hover effects + POLISHED styling */}
                  <div className="aspect-square w-full p-3 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 group-hover:from-blue-50 group-hover:to-purple-50 transition-colors duration-300 relative">
                    {asset.thumbnail ? (
                      <img 
                        src={asset.thumbnail} 
                        alt={asset.name}
                        className="w-full h-full object-contain drop-shadow-lg group-hover:scale-125 group-hover:rotate-3 transition-all duration-300"
                        onError={(e) => {
                          // Fallback to emoji if image fails
                          const target = e.currentTarget
                          target.style.display = 'none'
                          const fallback = document.createElement('div')
                          fallback.className = 'text-5xl group-hover:scale-125 group-hover:rotate-3 transition-all duration-300'
                          fallback.textContent = getCategoryIcon(asset.category)
                          target.parentElement?.appendChild(fallback)
                        }}
                      />
                    ) : (
                      <div className="text-5xl group-hover:scale-125 group-hover:rotate-3 transition-all duration-300">
                        {getCategoryIcon(asset.category)}
                      </div>
                    )}
                  </div>
                  
                  {/* Label with refined background */}
                  <div className={`
                    px-2 py-1.5 text-center border-t transition-colors duration-300
                    ${selectedAsset?.id === asset.id
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 group-hover:bg-blue-50'
                    }
                  `}>
                    <p className="text-xs font-bold truncate">
                      {asset.name}
                    </p>
                  </div>
                  
                  {/* Selection indicator */}
                  {selectedAsset?.id === asset.id && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Asset Info */}
          {selectedAsset && (
            <div className="mt-3 p-2 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <p className="text-xs font-semibold text-gray-700">
                ✓ Selected: <span className="text-blue-600">{selectedAsset.name}</span>
              </p>
              <p className="text-xs text-gray-500">Category: {selectedAsset.category}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BuildingLibrary
