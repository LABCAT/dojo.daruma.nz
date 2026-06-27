import { useCallback, useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { ArrowLeft, Check, ChevronRight, Lock } from 'lucide-react-native'
import { 
  RANKS, 
  getActiveDifficulty, 
  getAllRankStatuses, 
  getDifficultyTheme,
  getRankColor
} from '@daruma/ui'
import type { PresetId, RankStatus, RankId } from '@daruma/ui'

const JAPANESE_NAMES: Record<number, string> = {
  1: '木刀',
  2: '短刀',
  3: '脇差',
  4: '刀',
  5: '野太刀',
}

export default function DojoIndex() {
  const router = useRouter()
  const [activePreset, setActivePreset] = useState<PresetId>('ashigaru')
  const [statuses, setStatuses] = useState<Record<RankId, RankStatus>>({
    1: 'current',
    2: 'locked',
    3: 'locked',
    4: 'locked',
    5: 'locked',
  })

  useFocusEffect(
    useCallback(() => {
      const preset = getActiveDifficulty()
      setActivePreset(preset)
      setStatuses(getAllRankStatuses(preset))
    }, [])
  )

  const theme = getDifficultyTheme(activePreset)

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Pressable 
            onPress={() => router.back()}
            className="w-12 h-12 justify-center items-center -ml-2"
          >
            <ArrowLeft size={24} color="#F0EDE8" />
          </Pressable>
          <View className="flex-1 items-center mr-10">
            <Text className="text-text font-bold tracking-widest text-lg">DOJO MODE</Text>
            <Text style={{ color: theme.primary }} className="font-bold uppercase tracking-widest mt-1">
              {theme.name}
            </Text>
          </View>
        </View>

        {/* Rank List */}
        <ScrollView className="flex-1" contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
          {RANKS.map((rank) => {
            const status = statuses[rank.id as RankId]
            const isCurrent = status === 'current'
            const isComplete = status === 'complete'
            const isLocked = status === 'locked'
            const rankColor = getRankColor(activePreset, rank.id)

            // Add 15% opacity to the hex color for a glowing background tint
            const tintedBackground = rankColor + '26'

            return (
              <Pressable
                key={rank.id}
                disabled={!isCurrent}
                onPress={() => {
                  if (isCurrent) {
                    // MAIN BRANCH NAVIGATION: use navigate
                    router.navigate({
                      pathname: '/(dojo)/challenge',
                      params: { preset: activePreset, rankId: String(rank.id) }
                    })
                  }
                }}
                className={`
                  rounded-lg p-4
                  ${isCurrent ? 'border-2 active:scale-[0.98]' : 'border'}
                `}
                style={{
                  backgroundColor: isCurrent || isComplete ? tintedBackground : '#1A1A1A',
                  borderColor: isCurrent ? rankColor : (isComplete ? rankColor + '40' : rankColor + '30')
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-3">
                    <Text 
                      className="text-2xl font-bold"
                      style={{ color: isLocked ? rankColor + '80' : rankColor }}
                    >
                      0{rank.id}
                    </Text>
                    <View className="flex-row items-baseline gap-2">
                      <Text className={`font-bold uppercase tracking-wider text-lg ${isLocked ? 'text-[#C4C0BA]' : 'text-text'}`}>
                        {rank.name}
                      </Text>
                      <Text className={`text-sm font-medium ${isLocked ? 'text-[#8A8580]' : 'text-textMuted'}`}>
                        {JAPANESE_NAMES[rank.id] || ''}
                      </Text>
                    </View>
                  </View>

                  {/* Status Indicator */}
                  <View className="ml-2">
                    {isComplete && <Check size={24} color={rankColor} />}
                    {isCurrent && <ChevronRight size={24} color={rankColor} />}
                    {isLocked && <Lock size={20} color={rankColor + '60'} />}
                  </View>
                </View>

                {/* Description & Requirements */}
                <View className="pl-[2.75rem]">
                  <Text className={`text-sm mb-1 ${isLocked ? 'text-[#A39E98]' : 'text-text'}`}>
                    {/* @ts-ignore - property exists dynamically now */}
                    {rank.testDescription}
                  </Text>
                  <Text className={`text-xs font-bold ${isComplete ? 'text-successBright' : (isCurrent ? 'text-text' : 'text-[#8A8580]')}`}>
                    {/* @ts-ignore - property exists dynamically now */}
                    {isComplete ? 'COMPLETED' : rank.passRequirement}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
