export const colors = {
  background: '#0A0A0A',
  surface: '#141414',
  border: '#2A2A2A',
  text: '#F0EDE8',
  textMuted: '#8A8580',
  success: '#2D6A2D',
  successBright: '#4CAF50',
  accent: '#8B1A1A',
  accentBright: '#E53535',
  // Keep primary around for fallbacks, but we'll use theme colors for the most part
  primary: '#C9A84C',
  primaryDim: '#8A6F2E',
} as const

export const difficultyThemes = {
  ashigaru: {
    name: 'Ashigaru',
    primary: '#B87333', // Copper / Bronze base
    primaryDim: '#8B5A2B',
    // Wood -> Slate/Iron -> Bronze -> Silver -> Gold
    ranks: ['#8B5A2B', '#708090', '#CD7F32', '#C0C0C0', '#FFD700'], 
  },
  samurai: {
    name: 'Samurai',
    primary: '#4682B4', // Steel Blue base
    primaryDim: '#315C80',
    // Cadet Blue -> Dodger Blue -> Spring Green -> Purple -> Pink
    ranks: ['#5F9EA0', '#1E90FF', '#00FA9A', '#9370DB', '#FF1493'], 
  },
  ronin: {
    name: 'Ronin',
    primary: '#DC143C', // Crimson / Red base
    primaryDim: '#8B0000',
    // Indian Red -> Dark Orange -> Gold -> Crimson -> Blood Red
    ranks: ['#CD5C5C', '#FF8C00', '#FFD700', '#DC143C', '#8B0000'], 
  },
  shogun: {
    name: 'Shogun',
    primary: '#9370DB', // Purple / Gold base
    primaryDim: '#4B0082',
    // Blue Violet -> Cyan Lightning -> Magenta -> Orange Red -> Pure White Mastery
    ranks: ['#8A2BE2', '#00FFFF', '#FF00FF', '#FF4500', '#FFFFFF'], 
  },
} as const

// Mapping rank IDs to specific lucide-react-native icons
export const weaponRanks = [
  { 
    id: 1, 
    name: 'Bokken', 
    icon: 'Flame', 
    description: 'Wooden sword',
    testDescription: 'Foundational challenge with mixed difficulty.',
    passRequirement: 'Score 14/20 to advance'
  },
  { 
    id: 2, 
    name: 'Tanto', 
    icon: 'Shield', 
    description: 'Dagger',
    testDescription: 'Increased difficulty with fewer easy questions.',
    passRequirement: 'Score 16/20 to advance'
  },
  { 
    id: 3, 
    name: 'Wakizashi', 
    icon: 'Sword', 
    description: 'Short sword',
    testDescription: 'Moderate difficulty focus.',
    passRequirement: 'Score 18/20 to advance'
  },
  { 
    id: 4, 
    name: 'Katana', 
    icon: 'Swords', 
    description: 'Sword',
    testDescription: 'Advanced difficulty only.',
    passRequirement: 'Score 19/20 to advance'
  },
  { 
    id: 5, 
    name: 'Nodachi', 
    icon: 'Crown', 
    description: 'Great sword',
    testDescription: 'The ultimate test. Only the hardest questions.',
    passRequirement: 'Score 20/20 (Flawless) to conquer'
  },
] as const

export const difficultyPresets = [
  { id: 'ashigaru', label: 'Ashigaru', max: 10 },
  { id: 'samurai', label: 'Samurai', max: 20 },
  { id: 'ronin', label: 'Ronin', max: 50 },
  { id: 'shogun', label: 'Shogun', max: 100 },
] as const

export type DifficultyId = typeof difficultyPresets[number]['id']
export type WeaponRankId = typeof weaponRanks[number]['id']

// ─── Named aliases used by app screens ───────────────────────────────────────

/** Aliased type used in Home screen imports */
export type PresetId = DifficultyId

/** Array of difficulty presets (alias — iterate to build UI) */
export const PRESETS = difficultyPresets

/** Array of weapon ranks (alias — iterate to build rank UI) */
export const RANKS = weaponRanks

export function getDifficultyTheme(presetId: PresetId) {
  return difficultyThemes[presetId]
}

export function getRankColor(presetId: PresetId, rankId: number) {
  return difficultyThemes[presetId].ranks[rankId - 1] || difficultyThemes[presetId].primary
}
