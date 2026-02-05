import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BlockType } from '../config/blockConfig'

/**
 * Game State Management using Zustand with Persistence
 * 
 * This store manages the voxel city builder state including:
 * - Placed voxels on the grid
 * - Selected tool/block type
 * - UI state and camera settings
 * - Auto-save to localStorage
 */

// Voxel represents a placed block in the 3D grid
export interface Voxel {
  id: string
  position: [number, number, number] // Grid coordinates (x, y, z)
  blockType: string // Reference to BlockType.id
  rotation: number // 0, 90, 180, 270
  timestamp: number
}

interface CameraState {
  position: [number, number, number]
  target: [number, number, number]
}

interface GameState {
  // Voxel Grid System
  voxels: Voxel[]
  selectedVoxelId: string | null
  hoveredPosition: [number, number, number] | null
  
  // Tool System
  selectedTool: string // BlockType.id or 'eraser'
  toolMode: 'place' | 'erase' | 'paint'
  
  // Game Mode
  mode: 'edit' | 'play' | 'preview'
  
  // Camera
  camera: CameraState
  
  // UI State
  isLoading: boolean
  activeToolPanel: string | null
  showGrid: boolean
  gridSize: number
  
  // Statistics
  stats: {
    blocksPlaced: number
    blocksRemoved: number
    lastSaved: number
  }
  
  // Actions - Voxel Management
  addVoxel: (voxel: Omit<Voxel, 'id' | 'timestamp'>) => void
  removeVoxel: (id: string) => void
  removeVoxelAt: (position: [number, number, number]) => void
  updateVoxel: (id: string, updates: Partial<Voxel>) => void
  getVoxelAt: (position: [number, number, number]) => Voxel | undefined
  selectVoxel: (id: string | null) => void
  setHoveredPosition: (position: [number, number, number] | null) => void
  
  // Actions - Tool System
  setSelectedTool: (toolId: string) => void
  setToolMode: (mode: 'place' | 'erase' | 'paint') => void
  
  // Actions - General
  setMode: (mode: 'edit' | 'play' | 'preview') => void
  setCamera: (camera: Partial<CameraState>) => void
  setLoading: (isLoading: boolean) => void
  setActiveToolPanel: (panel: string | null) => void
  setShowGrid: (show: boolean) => void
  
  // Utils
  clearAll: () => void
  resetCanvas: () => void
  exportScene: () => string
  importScene: (data: string) => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial State
      voxels: [],
      selectedVoxelId: null,
      hoveredPosition: null,
      
      selectedTool: 'neon_cyan', // Default to first neon block
      toolMode: 'place',
      
      mode: 'edit',
      camera: {
        position: [10, 10, 10],
        target: [0, 0, 0],
      },
      isLoading: false,
      activeToolPanel: null,
      showGrid: true,
      gridSize: 20,
      
      stats: {
        blocksPlaced: 0,
        blocksRemoved: 0,
        lastSaved: Date.now(),
      },

      // Voxel Management Actions
      addVoxel: (voxel) => {
        const state = get()
        
        // Check if position is already occupied
        const existing = state.getVoxelAt(voxel.position)
        if (existing) {
          // Replace existing voxel
          set((state) => ({
            voxels: state.voxels.map(v => 
              v.id === existing.id 
                ? { ...voxel, id: existing.id, timestamp: Date.now() }
                : v
            ),
            stats: {
              ...state.stats,
              lastSaved: Date.now(),
            }
          }))
        } else {
          // Add new voxel
          const newVoxel: Voxel = {
            ...voxel,
            id: `voxel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
          }
          
          set((state) => ({
            voxels: [...state.voxels, newVoxel],
            stats: {
              ...state.stats,
              blocksPlaced: state.stats.blocksPlaced + 1,
              lastSaved: Date.now(),
            }
          }))
        }
      },

      removeVoxel: (id) => {
        set((state) => ({
          voxels: state.voxels.filter(v => v.id !== id),
          selectedVoxelId: state.selectedVoxelId === id ? null : state.selectedVoxelId,
          stats: {
            ...state.stats,
            blocksRemoved: state.stats.blocksRemoved + 1,
            lastSaved: Date.now(),
          }
        }))
      },

      removeVoxelAt: (position) => {
        const voxel = get().getVoxelAt(position)
        if (voxel) {
          get().removeVoxel(voxel.id)
        }
      },

      updateVoxel: (id, updates) => {
        set((state) => ({
          voxels: state.voxels.map(v => 
            v.id === id ? { ...v, ...updates, timestamp: Date.now() } : v
          ),
          stats: {
            ...state.stats,
            lastSaved: Date.now(),
          }
        }))
      },

      getVoxelAt: (position) => {
        return get().voxels.find(v => 
          v.position[0] === position[0] &&
          v.position[1] === position[1] &&
          v.position[2] === position[2]
        )
      },

      selectVoxel: (id) => set({ selectedVoxelId: id }),

      setHoveredPosition: (position) => set({ hoveredPosition: position }),

      // Tool System Actions
      setSelectedTool: (toolId) => {
        set({ 
          selectedTool: toolId,
          toolMode: toolId === 'eraser' ? 'erase' : 'place'
        })
      },

      setToolMode: (mode) => set({ toolMode: mode }),

      // General Actions
      setMode: (mode) => set({ mode }),

      setCamera: (camera) => set((state) => ({
        camera: { ...state.camera, ...camera }
      })),

      setLoading: (isLoading) => set({ isLoading }),

      setActiveToolPanel: (panel) => set({ activeToolPanel: panel }),

      setShowGrid: (show) => set({ showGrid: show }),

      clearAll: () => set({
        voxels: [],
        selectedVoxelId: null,
        hoveredPosition: null,
        stats: {
          blocksPlaced: 0,
          blocksRemoved: 0,
          lastSaved: Date.now(),
        }
      }),

      resetCanvas: () => {
        if (confirm('Are you sure you want to reset the canvas? This will remove all blocks.')) {
          get().clearAll()
        }
      },

      exportScene: () => {
        const state = get()
        return JSON.stringify({
          voxels: state.voxels,
          camera: state.camera,
          gridSize: state.gridSize,
          stats: state.stats,
          version: '2.0.0',
          exportedAt: Date.now(),
        }, null, 2)
      },

      importScene: (data) => {
        try {
          const parsed = JSON.parse(data)
          set({
            voxels: parsed.voxels || [],
            camera: parsed.camera || { position: [10, 10, 10], target: [0, 0, 0] },
            gridSize: parsed.gridSize || 20,
            stats: parsed.stats || {
              blocksPlaced: 0,
              blocksRemoved: 0,
              lastSaved: Date.now(),
            }
          })
        } catch (error) {
          console.error('Failed to import scene:', error)
        }
      },
    }),
    {
      name: 'base44-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        voxels: state.voxels,
        camera: state.camera,
        gridSize: state.gridSize,
        stats: state.stats,
        selectedTool: state.selectedTool,
        showGrid: state.showGrid,
      }),
    }
  )
)

export default useGameStore
