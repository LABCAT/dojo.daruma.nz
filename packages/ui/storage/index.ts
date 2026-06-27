import { MMKV } from 'react-native-mmkv'
import { PresetId } from '../theme/tokens'

export type RankId = 1 | 2 | 3 | 4 | 5
export type RankStatus = 'locked' | 'current' | 'complete'

export const storage = new MMKV({
  id: 'daruma-dojo'
})

export function getActiveDifficulty(): PresetId {
  const value = storage.getString('difficulty')
  if (value === 'ashigaru' || value === 'samurai' || value === 'ronin' || value === 'shogun') {
    return value
  }
  return 'ashigaru'
}

export function setActiveDifficulty(preset: PresetId): void {
  storage.set('difficulty', preset)
}

export function getRankStatus(preset: PresetId, rankId: RankId): RankStatus {
  const key = `rank:${preset}:${rankId}`
  const value = storage.getString(key)
  
  if (value === 'locked' || value === 'current' || value === 'complete') {
    return value
  }
  
  return rankId === 1 ? 'current' : 'locked'
}

export function setRankStatus(preset: PresetId, rankId: RankId, status: RankStatus): void {
  const key = `rank:${preset}:${rankId}`
  storage.set(key, status)
}

export function getAllRankStatuses(preset: PresetId): Record<RankId, RankStatus> {
  return {
    1: getRankStatus(preset, 1),
    2: getRankStatus(preset, 2),
    3: getRankStatus(preset, 3),
    4: getRankStatus(preset, 4),
    5: getRankStatus(preset, 5),
  }
}

export function advanceRank(preset: PresetId, completedRankId: RankId): RankId | null {
  setRankStatus(preset, completedRankId, 'complete')
  
  if (completedRankId === 5) {
    return null
  }
  
  const nextRankId = (completedRankId + 1) as RankId
  setRankStatus(preset, nextRankId, 'current')
  
  return nextRankId
}

export function resetProgress(preset: PresetId): void {
  for (let i = 1; i <= 5; i++) {
    storage.delete(`rank:${preset}:${i}`)
  }
}

export function resetAllProgress(): void {
  storage.clearAll()
}
