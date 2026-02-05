import { Trash2, RotateCcw } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { BLOCK_TYPES, ERASER_TOOL, getBlocksByCategory } from '../config/blockConfig'

const BottomDock = () => {
  const selectedTool = useGameStore((state) => state.selectedTool)
  const setSelectedTool = useGameStore((state) => state.setSelectedTool)
  const stats = useGameStore((state) => state.stats)
  const resetCanvas = useGameStore((state) => state.resetCanvas)
  
  // Group blocks by category
  const neonBlocks = getBlocksByCategory('neon')
  const glassBlocks = getBlocksByCategory('glass')
  const structureBlocks = getBlocksByCategory('structure')
  const specialBlocks = getBlocksByCategory('special')

  const allTools = [
    ...neonBlocks,
    ...glassBlocks,
    ...structureBlocks,
    ...specialBlocks,
  ]

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
      <div className="backdrop-blur-2xl bg-gradient-to-r from-slate-900/95 via-slate-950/95 to-slate-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with Stats */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>{stats.blocksPlaced} placed</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span>{stats.blocksRemoved} removed</span>
            </div>
          </div>
          
          <button
            onClick={resetCanvas}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium transition-all"
            title="Reset Canvas (Clears all blocks)"
          >
            <RotateCcw size={14} />
            Reset Canvas
          </button>
        </div>

        {/* Tools Grid */}
        <div className="p-4">
          <div className="flex items-center gap-2 overflow-x-auto max-w-[90vw] pb-2 scrollbar-thin">
            {/* Eraser Tool */}
            <button
              onClick={() => setSelectedTool(ERASER_TOOL.id)}
              className={`
                flex-shrink-0 group relative w-16 h-16 rounded-xl transition-all
                ${selectedTool === ERASER_TOOL.id
                  ? 'bg-red-500/30 border-2 border-red-400 shadow-lg shadow-red-500/50'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
              title={ERASER_TOOL.description}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Trash2 
                  size={24} 
                  className={selectedTool === ERASER_TOOL.id ? 'text-red-400' : 'text-white/60 group-hover:text-white'}
                />
              </div>
              
              {/* Selection Ring */}
              {selectedTool === ERASER_TOOL.id && (
                <div className="absolute -inset-1 rounded-xl border-2 border-red-400 animate-pulse" />
              )}
            </button>

            {/* Separator */}
            <div className="w-px h-12 bg-white/10 mx-1" />

            {/* Neon Blocks */}
            {neonBlocks.map((block) => (
              <button
                key={block.id}
                onClick={() => setSelectedTool(block.id)}
                className={`
                  flex-shrink-0 group relative w-16 h-16 rounded-xl transition-all
                  ${selectedTool === block.id
                    ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400 shadow-lg shadow-cyan-500/50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                `}
                title={block.description}
              >
                {/* Block Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: block.color,
                      boxShadow: `0 0 20px ${block.color}40`,
                    }}
                  >
                    {block.icon}
                  </div>
                </div>
                
                {/* Selection Ring - Figma-like */}
                {selectedTool === block.id && (
                  <>
                    <div className="absolute -inset-1 rounded-xl border-2 border-cyan-400 animate-pulse" />
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-cyan-400 font-medium">
                      {block.name}
                    </div>
                  </>
                )}

                {/* Hover Label */}
                {selectedTool !== block.id && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    {block.name}
                  </div>
                )}
              </button>
            ))}

            {/* Separator */}
            <div className="w-px h-12 bg-white/10 mx-1" />

            {/* Glass Blocks */}
            {glassBlocks.map((block) => (
              <button
                key={block.id}
                onClick={() => setSelectedTool(block.id)}
                className={`
                  flex-shrink-0 group relative w-16 h-16 rounded-xl transition-all
                  ${selectedTool === block.id
                    ? 'bg-gradient-to-br from-white/20 to-blue-200/20 border-2 border-white/60 shadow-lg shadow-white/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                `}
                title={block.description}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-2xl bg-white/20 border border-white/40"
                    style={{
                      boxShadow: `0 0 15px ${block.color}30`,
                    }}
                  >
                    {block.icon}
                  </div>
                </div>
                
                {selectedTool === block.id && (
                  <>
                    <div className="absolute -inset-1 rounded-xl border-2 border-white/60 animate-pulse" />
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white font-medium">
                      {block.name}
                    </div>
                  </>
                )}

                {selectedTool !== block.id && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    {block.name}
                  </div>
                )}
              </button>
            ))}

            {/* Separator */}
            <div className="w-px h-12 bg-white/10 mx-1" />

            {/* Structure Blocks */}
            {structureBlocks.map((block) => (
              <button
                key={block.id}
                onClick={() => setSelectedTool(block.id)}
                className={`
                  flex-shrink-0 group relative w-16 h-16 rounded-xl transition-all
                  ${selectedTool === block.id
                    ? 'bg-gradient-to-br from-gray-500/30 to-gray-700/30 border-2 border-gray-400 shadow-lg shadow-gray-500/50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                `}
                title={block.description}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: block.color,
                    }}
                  >
                    {block.icon}
                  </div>
                </div>
                
                {selectedTool === block.id && (
                  <>
                    <div className="absolute -inset-1 rounded-xl border-2 border-gray-400 animate-pulse" />
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-gray-400 font-medium">
                      {block.name}
                    </div>
                  </>
                )}

                {selectedTool !== block.id && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    {block.name}
                  </div>
                )}
              </button>
            ))}

            {/* Separator */}
            <div className="w-px h-12 bg-white/10 mx-1" />

            {/* Special Blocks */}
            {specialBlocks.map((block) => (
              <button
                key={block.id}
                onClick={() => setSelectedTool(block.id)}
                className={`
                  flex-shrink-0 group relative w-16 h-16 rounded-xl transition-all
                  ${selectedTool === block.id
                    ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-400 shadow-lg shadow-purple-500/50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                `}
                title={block.description}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: block.color,
                      boxShadow: `0 0 20px ${block.color}40`,
                    }}
                  >
                    {block.icon}
                  </div>
                </div>
                
                {selectedTool === block.id && (
                  <>
                    <div className="absolute -inset-1 rounded-xl border-2 border-purple-400 animate-pulse" />
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-purple-400 font-medium">
                      {block.name}
                    </div>
                  </>
                )}

                {selectedTool !== block.id && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    {block.name}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="px-6 py-2 border-t border-white/10 bg-white/5">
          <div className="text-xs text-white/50 text-center">
            Click on grid to place • Click on blocks to stack • Right-click or use Eraser to remove
          </div>
        </div>
      </div>
    </div>
  )
}

export default BottomDock
