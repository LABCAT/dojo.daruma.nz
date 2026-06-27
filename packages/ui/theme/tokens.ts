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
    ranks: ['#CD7F32', '#D2691E', '#B8860B', '#DAA520', '#FF8C00'], // Progressive shades
  },
  samurai: {
    name: 'Samurai',
    primary: '#4682B4', // Steel Blue base
    primaryDim: '#315C80',
    ranks: ['#5F9EA0', '#4682B4', '#4169E1', '#0000CD', '#000080'], // Progressive shades
  },
  ronin: {
    name: 'Ronin',
    primary: '#DC143C', // Crimson / Red base
    primaryDim: '#8B0000',
    ranks: ['#CD5C5C', '#DC143C', '#B22222', '#8B0000', '#800000'], // Progressive shades
  },
  shogun: {
    name: 'Shogun',
    primary: '#9370DB', // Purple / Gold base
    primaryDim: '#4B0082',
    ranks: ['#9370DB', '#8A2BE2', '#9932CC', '#800080', '#4B0082'], // Progressive shades
  },
} as const

// Mapping rank IDs to specific lucide-react-native icons
export const weaponRanks = [
  { id: 1, name: 'Bokken', icon: 'Flame', description: 'Wooden sword' },
  { id: 2, name: 'Tanto', icon: 'Shield', description: 'Dagger' },
  { id: 3, name: 'Wakizashi', icon: 'Sword', description: 'Short sword' },
  { id: 4, name: 'Katana', icon: 'Swords', description: 'Sword' },
  { id: 5, name: 'Nodachi', icon: 'Crown', description: 'Great sword' },
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
