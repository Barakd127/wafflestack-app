/**
 * Block Configuration - "Asset Lab" System
 * 
 * Defines all available block types with their visual properties,
 * materials, and metadata. This is the foundation of our voxel city builder.
 */

export interface BlockType {
  id: string
  name: string
  category: 'structure' | 'neon' | 'glass' | 'special'
  icon: string
  color: string
  description: string
  material: {
    type: 'standard' | 'physical' | 'neon'
    properties: Record<string, any>
  }
  price?: number
  unlocked?: boolean
}

export const BLOCK_TYPES: Record<string, BlockType> = {
  // NEON CATEGORY - Cyberpunk glow blocks
  neon_cyan: {
    id: 'neon_cyan',
    name: 'Neon Cyan',
    category: 'neon',
    icon: '💠',
    color: '#00ffff',
    description: 'Glowing cyan block with emissive properties',
    material: {
      type: 'neon',
      properties: {
        color: '#00ffff',
        emissive: '#00ffff',
        emissiveIntensity: 2.0,
        metalness: 0.8,
        roughness: 0.2,
      }
    },
    unlocked: true,
  },
  
  neon_magenta: {
    id: 'neon_magenta',
    name: 'Neon Magenta',
    category: 'neon',
    icon: '🔮',
    color: '#ff00ff',
    description: 'Glowing magenta block with intense glow',
    material: {
      type: 'neon',
      properties: {
        color: '#ff00ff',
        emissive: '#ff00ff',
        emissiveIntensity: 2.5,
        metalness: 0.8,
        roughness: 0.2,
      }
    },
    unlocked: true,
  },

  neon_yellow: {
    id: 'neon_yellow',
    name: 'Neon Yellow',
    category: 'neon',
    icon: '⚡',
    color: '#ffff00',
    description: 'Electric yellow glow block',
    material: {
      type: 'neon',
      properties: {
        color: '#ffff00',
        emissive: '#ffff00',
        emissiveIntensity: 2.2,
        metalness: 0.8,
        roughness: 0.2,
      }
    },
    unlocked: true,
  },

  // GLASS CATEGORY - Transparent architectural blocks
  glass_clear: {
    id: 'glass_clear',
    name: 'Clear Glass',
    category: 'glass',
    icon: '◻️',
    color: '#ffffff',
    description: 'Transparent glass block with high clarity',
    material: {
      type: 'physical',
      properties: {
        color: '#ffffff',
        metalness: 0.0,
        roughness: 0.05,
        transmission: 0.95,
        thickness: 0.5,
        envMapIntensity: 1.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.3,
      }
    },
    unlocked: true,
  },

  glass_tinted: {
    id: 'glass_tinted',
    name: 'Tinted Glass',
    category: 'glass',
    icon: '▫️',
    color: '#88ccff',
    description: 'Semi-transparent tinted glass',
    material: {
      type: 'physical',
      properties: {
        color: '#88ccff',
        metalness: 0.0,
        roughness: 0.1,
        transmission: 0.7,
        thickness: 0.8,
        envMapIntensity: 1.2,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        transparent: true,
        opacity: 0.5,
      }
    },
    unlocked: true,
  },

  // STRUCTURE CATEGORY - Solid architectural blocks
  concrete: {
    id: 'concrete',
    name: 'Concrete Block',
    category: 'structure',
    icon: '⬛',
    color: '#666666',
    description: 'Industrial concrete building block',
    material: {
      type: 'standard',
      properties: {
        color: '#666666',
        metalness: 0.1,
        roughness: 0.9,
      }
    },
    unlocked: true,
  },

  metal_beam: {
    id: 'metal_beam',
    name: 'Metal Beam',
    category: 'structure',
    icon: '🔩',
    color: '#888888',
    description: 'Metallic structural beam',
    material: {
      type: 'standard',
      properties: {
        color: '#888888',
        metalness: 0.9,
        roughness: 0.3,
      }
    },
    unlocked: true,
  },

  wood_plank: {
    id: 'wood_plank',
    name: 'Wood Plank',
    category: 'structure',
    icon: '🪵',
    color: '#8B4513',
    description: 'Natural wood building material',
    material: {
      type: 'standard',
      properties: {
        color: '#8B4513',
        metalness: 0.0,
        roughness: 0.8,
      }
    },
    unlocked: true,
  },

  // SPECIAL CATEGORY - Unique blocks
  hologram: {
    id: 'hologram',
    name: 'Hologram',
    category: 'special',
    icon: '✨',
    color: '#00ffcc',
    description: 'Futuristic holographic projection',
    material: {
      type: 'physical',
      properties: {
        color: '#00ffcc',
        emissive: '#00ffcc',
        emissiveIntensity: 1.5,
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.5,
        thickness: 0.1,
        transparent: true,
        opacity: 0.6,
      }
    },
    price: 100,
    unlocked: true,
  },
}

// Helper to get blocks by category
export const getBlocksByCategory = (category: BlockType['category']) => {
  return Object.values(BLOCK_TYPES).filter(block => block.category === category)
}

// Helper to get all unlocked blocks
export const getUnlockedBlocks = () => {
  return Object.values(BLOCK_TYPES).filter(block => block.unlocked !== false)
}

// Tool type for the eraser
export interface ToolType {
  id: string
  name: string
  icon: string
  description: string
  type: 'block' | 'eraser' | 'paint'
}

export const ERASER_TOOL: ToolType = {
  id: 'eraser',
  name: 'Eraser',
  icon: '🗑️',
  description: 'Remove blocks from the grid',
  type: 'eraser',
}
