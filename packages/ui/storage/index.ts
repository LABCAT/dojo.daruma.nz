import { MMKV } from 'react-native-mmkv'
import { PresetId } from '../theme/tokens'

export type RankId = 1 | 2 | 3 | 4 | 5
export type RankStatus = 'locked' | 'current' | 'complete'

// Expo Go does not include the native C++ code for MMKV.
// We catch the error and provide an in-memory fallback so you can continue
// developing in Expo Go until you build a native Dev Client.
let storage: any;
try {
  storage = new MMKV({
    id: 'daruma-dojo'
  })
} catch (e) {
  console.warn("Native MMKV module not found (likely running in Expo Go). Using in-memory fallback.");
  const memoryStore = new Map<string, string | number | boolean>();
  storage = {
    set: (key: string, value: string | number | boolean) => memoryStore.set(key, value),
    getString: (key: string) => memoryStore.get(key) as string | undefined,
    delete: (key: string) => memoryStore.delete(key),
    clearAll: () => memoryStore.clear()
  }
}

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
  console.log('💾 [advanceRank] START — preset:', preset, 'completedRankId:', completedRankId)
  setRankStatus(preset, completedRankId, 'complete')
  console.log('💾 [advanceRank] set rank', completedRankId, 'to complete')
  
  if (completedRankId === 5) {
    console.log('💾 [advanceRank] rank 5 completed — mastered, returning null')
    return null
  }
  
  const nextRankId = (completedRankId + 1) as RankId
  setRankStatus(preset, nextRankId, 'current')
  console.log('💾 [advanceRank] set rank', nextRankId, 'to current — returning', nextRankId)
  
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
