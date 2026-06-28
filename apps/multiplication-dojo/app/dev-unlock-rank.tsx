import { Pressable, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import {
  RANKS,
  getActiveDifficulty,
  getRankStatus,
  setRankStatus,
  getDifficultyTheme,
  getRankColor,
  Text,
} from '@daruma/ui'
import type { PresetId, RankId } from '@daruma/ui'
import * as LucideIcons from 'lucide-react-native'

export default function DevUnlockRankScreen() {
  const router = useRouter()
  const preset = getActiveDifficulty()
  const theme = getDifficultyTheme(preset)

  function handleSelectRank(rankId: RankId) {
    for (let i = 1; i <= 5; i++) {
      const id = i as RankId
      if (i < rankId) {
        setRankStatus(preset, id, 'complete')
      } else if (i === rankId) {
        setRankStatus(preset, id, 'current')
      } else {
        setRankStatus(preset, id, 'locked')
      }
    }
    router.back()
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="items-center pt-4 mb-8">
          <View className="flex-row items-center mb-5 gap-3">
            <View className="flex-1 h-px bg-border" />
            <LucideIcons.Crown size={16} color="#8A8580" />
            <View className="flex-1 h-px bg-border" />
          </View>
          <Text className="text-2xl font-bold text-text tracking-widest uppercase text-center mb-2">
            Unlock Rank
          </Text>
          <Text className="text-sm text-text-muted text-center tracking-wide px-4">
            Dev only — select a rank to set as current on {theme.name}.
          </Text>
        </View>

        <View className="gap-4">
          {RANKS.map((rank) => {
            const rankId = rank.id as RankId
            const status = getRankStatus(preset, rankId)
            const isCurrent = status === 'current'
            const rankColor = getRankColor(preset, rank.id)

            return (
              <Pressable
                key={rank.id}
                testID={`dev-rank-option-${rank.id}`}
                onPress={() => handleSelectRank(rankId)}
                className={[
                  'rounded-lg p-5 border flex-row items-center justify-between',
                  isCurrent ? 'bg-surface' : 'bg-background opacity-80',
                ].join(' ')}
                style={{ borderColor: isCurrent ? rankColor : '#2A2A2A' }}
              >
                <View className="flex-row items-center gap-4">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: isCurrent ? rankColor + '40' : '#141414' }}
                  >
                    <Text className="font-bold" style={{ color: rankColor }}>
                      0{rank.id}
                    </Text>
                  </View>
                  <View>
                    <Text
                      className="text-xl font-bold tracking-widest uppercase"
                      style={{ color: isCurrent ? rankColor : '#F0EDE8' }}
                    >
                      {rank.name}
                    </Text>
                    <Text className="text-sm text-text-muted mt-1 capitalize">{status}</Text>
                  </View>
                </View>

                {isCurrent && (
                  <View>
                    <LucideIcons.Check size={24} color={rankColor} />
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>

        <View className="mt-8">
          <Pressable
            onPress={() => router.back()}
            className="border border-border rounded-lg py-4 items-center justify-center"
          >
            <Text className="text-text font-bold text-base tracking-widest uppercase">
              Return
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
