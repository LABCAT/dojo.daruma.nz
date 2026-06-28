import { useCallback, useState } from 'react'
import { View, Pressable, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { ArrowLeft, Check, Lock, ChevronRight } from 'lucide-react-native'
import * as LucideIcons from 'lucide-react-native'
import { Text } from '@daruma/ui'
import {
  RANKS,
  getActiveDifficulty,
  getAllRankStatuses,
  getDifficultyTheme,
  getRankColor,
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
    }, []),
  )

  const theme = getDifficultyTheme(activePreset)

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-6">
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

        <ScrollView className="flex-1" contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
          {RANKS.map((rank) => {
            const status = statuses[rank.id as RankId]
            const isCurrent = status === 'current'
            const isComplete = status === 'complete'
            const isLocked = status === 'locked'
            const rankColor = getRankColor(activePreset, rank.id)

            // Invert the active rank card (rankColor background, white text, black icons/numbers)
            const rowStyle = {
              backgroundColor: isCurrent ? rankColor : '#141414',
              borderColor: rankColor,
              borderWidth: isCurrent ? 8 : isComplete ? 5 : 3,
              borderRadius: 16, // Increased radius to offset thick borders
              padding: 16,
            }
            
            // Safely get the icon component from lucide
            const RankIcon = (LucideIcons as any)[rank.icon] || LucideIcons.Sword

            const rowContent = (
              <>
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-3">
                    <RankIcon size={24} color={isCurrent ? '#FFFFFF' : rankColor} />
                    <Text
                      className="text-2xl font-bold"
                      style={{ color: isCurrent ? '#FFFFFF' : rankColor }}
                    >
                      0{rank.id}
                    </Text>
                    <View className="flex-row items-baseline gap-2">
                      <Text
                        className={`font-bold uppercase tracking-wider text-lg ${isLocked ? 'text-[#8A8580]' : 'text-text'}`}
                        style={isCurrent ? { color: '#000000' } : undefined}
                      >
                        {rank.name}
                      </Text>
                      <Text
                        className={`text-sm font-medium ${isLocked ? 'text-[#6A6560]' : 'text-text-muted'}`}
                        style={isCurrent ? { color: '#000000', opacity: 0.7 } : undefined}
                      >
                        {JAPANESE_NAMES[rank.id] || ''}
                      </Text>
                    </View>
                  </View>

                  <View className="ml-2">
                    {isComplete && <Check size={24} color={rankColor} />}
                    {isCurrent && <ChevronRight size={24} color="#FFFFFF" />}
                    {isLocked && <Lock size={20} color={rankColor} />}
                  </View>
                </View>

                <View style={{ paddingLeft: 44 }}>
                  <Text 
                    className={`text-sm mb-1 ${isLocked ? 'text-[#A39E98]' : 'text-text'}`}
                    style={isCurrent ? { color: '#000000' } : undefined}
                  >
                    {/* @ts-ignore */}
                    {rank.testDescription}
                  </Text>
                  <Text
                    className={`text-xs font-bold ${isComplete ? 'text-success-bright' : 'text-[#8A8580]'}`}
                    style={isCurrent ? { color: '#000000', fontWeight: '900' } : undefined}
                  >
                    {/* @ts-ignore */}
                    {isComplete ? 'COMPLETED' : rank.passRequirement}
                  </Text>
                </View>
              </>
            )

            if (isCurrent) {
              return (
                <Pressable
                  key={rank.id}
                  onPress={() =>
                    router.push({
                      pathname: '/(dojo)/challenge',
                      params: { preset: activePreset, rankId: String(rank.id) },
                    })
                  }
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.9 : 1,
                    borderRadius: 16,
                    transform: [{ scale: 1.04 }],
                    // Standard shadow properties on the outer container
                    shadowColor: rankColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.9,
                    shadowRadius: 12,
                    elevation: 8,
                  })}
                >
                  <View style={rowStyle}>
                    {rowContent}
                  </View>
                </Pressable>
              )
            }

            return (
              <View key={rank.id} style={rowStyle}>
                {rowContent}
              </View>
            )
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
