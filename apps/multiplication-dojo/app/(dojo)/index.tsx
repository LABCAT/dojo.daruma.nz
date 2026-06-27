import { useState, useCallback } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { ArrowLeft, Check, ChevronRight, Lock } from 'lucide-react-native'
import { RANKS, PRESETS, getActiveDifficulty, getAllRankStatuses } from '@daruma/ui'
import type { PresetId, RankStatus } from '@daruma/ui'

const jpNames: Record<number, string> = {
  1: '木剣',
  2: '短刀',
  3: '脇差',
  4: '刀',
  5: '野太刀'
}

export default function DojoIndex() {
  const router = useRouter()
  const [activePreset, setActivePreset] = useState<PresetId>('ashigaru')
  const [statuses, setStatuses] = useState<Record<number, RankStatus>>({
    1: 'locked',
    2: 'locked',
    3: 'locked',
    4: 'locked',
    5: 'locked',
  })

  useFocusEffect(
    useCallback(() => {
      const preset = getActiveDifficulty()
      const newStatuses = getAllRankStatuses(preset)
      setActivePreset(preset)
      setStatuses(newStatuses)
    }, [])
  )

  const presetDef = PRESETS.find(p => p.id === activePreset)
  const difficultyName = presetDef?.label.toUpperCase() || 'ASHIGARU'

  // Reverse ranks so 5 is at top, 1 at bottom
  const displayRanks = [...RANKS].reverse()

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-16 pb-6 bg-[#141414] border-b border-[#2A2A2A]">
        <Pressable 
          onPress={() => router.back()} 
          className="p-2 -ml-2 rounded-full active:bg-white/10"
        >
          <ArrowLeft color="#F0EDE8" size={24} />
        </Pressable>
        <View className="ml-4">
          <Text className="text-[#8A8580] font-bold text-xs tracking-[2px]">DOJO MODE</Text>
          <Text className="text-[#C9A84C] font-bold text-xl tracking-widest mt-1">{difficultyName}</Text>
        </View>
      </View>

      {/* Ranks */}
      <ScrollView 
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {displayRanks.map((rank) => {
          const status = statuses[rank.id as keyof typeof statuses]
          const isComplete = status === 'complete'
          const isCurrent = status === 'current'
          const isLocked = status === 'locked'

          return (
            <Pressable
              key={rank.id}
              disabled={!isCurrent}
              onPress={() => {
                if (isCurrent) {
                  router.navigate({
                    pathname: '/(dojo)/challenge',
                    params: { preset: activePreset, rankId: String(rank.id) }
                  })
                }
              }}
              className={`mb-4 rounded-xl border p-5 flex-row items-center bg-[#141414] ${
                isCurrent 
                  ? 'border-[#C9A84C]' 
                  : isComplete
                    ? 'border-[#2A2A2A] opacity-70'
                    : 'border-[#1A1A1A] opacity-50'
              }`}
            >
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className={`font-bold text-sm tracking-[2px] mr-3 ${
                    isCurrent || isComplete ? 'text-[#C9A84C]' : 'text-[#8A8580]'
                  }`}>
                    0{rank.id}
                  </Text>
                  <Text className={`font-bold text-lg tracking-widest uppercase ${
                    isLocked ? 'text-[#8A8580]' : 'text-[#F0EDE8]'
                  }`}>
                    {rank.name}
                  </Text>
                </View>
                
                <Text className={`font-medium text-base mb-2 ${
                  isLocked ? 'text-[#5A5550]' : 'text-[#8A8580]'
                }`}>
                  {jpNames[rank.id as keyof typeof jpNames]}
                </Text>

                <Text className={isLocked ? 'text-[#5A5550]' : 'text-[#8A8580]'}>
                  {rank.description}
                </Text>
              </View>

              <View className="ml-4 justify-center items-center w-8 h-8">
                {isComplete && <Check color="#C9A84C" size={24} />}
                {isCurrent && <ChevronRight color="#C9A84C" size={32} />}
                {isLocked && <Lock color="#5A5550" size={20} />}
              </View>
            </Pressable>
          )
        })}
        
        {/* Footer Note */}
        <Text className="text-center text-[#8A8580] mt-4 font-medium px-8 leading-relaxed">
          Answer 17 of 20 to advance your rank
        </Text>
      </ScrollView>
    </View>
  )
}
