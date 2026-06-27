// Theme
export * from './theme/tokens'

// Components (add as created)
export * from './components/Text'
export * from './components/Button'

// Storage stubs — replaced by real MMKV implementations in Prompt 03
export function getActiveDifficulty(): import('./theme/tokens').PresetId {
  return 'ashigaru'
}
export function setActiveDifficulty(_id: import('./theme/tokens').PresetId): void {}
export function getRankStatus(
  _preset: import('./theme/tokens').PresetId,
  _rankId: number,
): 'locked' | 'current' | 'complete' {
  return _rankId === 1 ? 'current' : 'locked'
}
