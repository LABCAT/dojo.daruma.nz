// Theme
export * from './theme/tokens'

// Components (add as created)
export * from './components/Text'
export * from './components/Button'

// Storage stubs — replaced by real MMKV implementations in Prompt 03
let _activeDifficulty: import('./theme/tokens').PresetId = 'ashigaru'

export function getActiveDifficulty(): import('./theme/tokens').PresetId {
  return _activeDifficulty
}
export function setActiveDifficulty(id: import('./theme/tokens').PresetId): void {
  _activeDifficulty = id
}
export function getRankStatus(
  _preset: import('./theme/tokens').PresetId,
  _rankId: number,
): 'locked' | 'current' | 'complete' {
  return _rankId === 1 ? 'current' : 'locked'
}
