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
    primary: '#FF9933', // Bright Copper
    primaryDim: '#CC6600',
    // Wood -> Slate/Iron -> Bronze -> Silver -> Gold
    ranks: ['#FFA040', '#99CCFF', '#FFB060', '#E0E0E0', '#FFE033'], 
  },
  samurai: {
    name: 'Samurai',
    primary: '#33AAFF', // Bright Blue
    primaryDim: '#0066CC',
    // Cadet Blue -> Dodger Blue -> Spring Green -> Purple -> Pink
    ranks: ['#00FFCC', '#33AAFF', '#00FF66', '#B066FF', '#FF33AA'], 
  },
  ronin: {
    name: 'Ronin',
    primary: '#FF5E36', // Sunset Red-Orange base
    primaryDim: '#C23A1B',
    // Sunset Orange -> Golden Amber -> Scarlet Crimson -> Deep Amethyst/Purple -> Obsidian Charcoal
    ranks: ['#FF5E36', '#FFAE19', '#E62B4C', '#8A1C7C', '#444444'], 
  },
  shogun: {
    name: 'Shogun',
    primary: '#AA00FF', // Purple Glow
    primaryDim: '#6600CC',
    // Blue Violet -> Cyan Lightning -> Magenta -> Orange Red -> Pure White Mastery
    ranks: ['#AA00FF', '#00FFFF', '#FF00FF', '#FF5500', '#FFFFFF'], 
  },
} as const

// Mapping rank IDs to specific lucide-react-native icons
export const weaponRanks = [
  { 
    id: 1, 
    name: 'Bokken',
    japanese: '木刀',
    icon: 'Flame', 
    description: 'Wooden sword',
    testDescription: 'Foundational challenge with mixed difficulty.',
    passRequirement: 'Score 14/20 to advance'
  },
  { 
    id: 2, 
    name: 'Tanto',
    japanese: '短刀',
    icon: 'Shield', 
    description: 'Dagger',
    testDescription: 'Increased difficulty with fewer easy questions.',
    passRequirement: 'Score 16/20 to advance'
  },
  { 
    id: 3, 
    name: 'Wakizashi',
    japanese: '脇差',
    icon: 'Sword', 
    description: 'Short sword',
    testDescription: 'Moderate difficulty focus.',
    passRequirement: 'Score 18/20 to advance'
  },
  { 
    id: 4, 
    name: 'Katana',
    japanese: '刀',
    icon: 'Swords', 
    description: 'Sword',
    testDescription: 'Advanced difficulty only.',
    passRequirement: 'Score 19/20 to advance'
  },
  { 
    id: 5, 
    name: 'Nodachi',
    japanese: '野太刀',
    icon: 'Crown', 
    description: 'Great sword',
    testDescription: 'The ultimate test. Only the hardest questions.',
    passRequirement: 'Score 20/20 (Flawless) to conquer'
  },
] as const

/** Lucide icon name — resolve via lucide-react-native in app screens */
export const difficultyPresets = [
  { id: 'ashigaru', label: 'Ashigaru', max: 10, icon: 'Footprints' },
  { id: 'samurai', label: 'Samurai', max: 20, icon: 'Swords' },
  { id: 'ronin', label: 'Ronin', max: 50, icon: 'Flame' },
  { id: 'shogun', label: 'Shogun', max: 100, icon: 'Crown' },
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
