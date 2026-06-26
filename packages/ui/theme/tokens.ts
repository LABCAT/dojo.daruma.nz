export const colors = {
  background: '#0A0A0A',
  surface: '#141414',
  border: '#2A2A2A',
  primary: '#C9A84C',
  primaryDim: '#8A6F2E',
  accent: '#8B1A1A',
  accentBright: '#E53535',
  text: '#F0EDE8',
  textMuted: '#8A8580',
  success: '#2D6A2D',
  successBright: '#4CAF50',
} as const

export const weaponRanks = [
  { id: 1, name: 'Bokken', japanese: '木刀', description: 'Wooden sword' },
  { id: 2, name: 'Tanto', japanese: '短刀', description: 'Dagger' },
  { id: 3, name: 'Wakizashi', japanese: '脇差', description: 'Short sword' },
  { id: 4, name: 'Katana', japanese: '刀', description: 'Sword' },
  { id: 5, name: 'Nodachi', japanese: '野太刀', description: 'Great sword' },
] as const

export const difficultyPresets = [
  { id: 'ashigaru', label: 'Ashigaru', max: 10 },
  { id: 'samurai', label: 'Samurai', max: 20 },
  { id: 'ronin', label: 'Ronin', max: 50 },
  { id: 'shogun', label: 'Shogun', max: 100 },
] as const

export type DifficultyId = typeof difficultyPresets[number]['id']
export type WeaponRankId = typeof weaponRanks[number]['id']
