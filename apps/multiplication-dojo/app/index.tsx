import { useCallback, useState, useEffect } from 'react'
import { Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import {
  getActiveDifficulty,
  getRankStatus,
  getDifficultyTheme,
  RANKS,
} from '@daruma/ui'
import type { PresetId } from '@daruma/ui'
import { Text } from '@daruma/ui'
import * as LucideIcons from 'lucide-react-native'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCurrentRank(preset: PresetId) {
  const currentRank = RANKS.find((r) => getRankStatus(preset, r.id) === 'current')
  return currentRank ?? RANKS[0]
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  console.log('⚪ [HomeScreen] RENDER')
  const router = useRouter()
  const [activePreset, setActivePreset] = useState<PresetId>(() => getActiveDifficulty())
  const [currentRank, setCurrentRank] = useState(() => getCurrentRank(getActiveDifficulty()))

  useEffect(() => {
    console.log('⚪ [HomeScreen] MOUNTED')
    return () => {
      console.log('⚪⚪⚪ [HomeScreen] UNMOUNTED')
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      console.log('⚪ [HomeScreen] useFocusEffect FIRED')
      const preset = getActiveDifficulty()
      setActivePreset(preset)
      setCurrentRank(getCurrentRank(preset))
    }, []),
  )

  const theme = getDifficultyTheme(activePreset)
  const rankColor = theme.ranks[currentRank.id - 1] || theme.primary
  const rankNumber = String(currentRank.id).padStart(2, '0')

  // Safely get the icon component from lucide
  const RankIcon = (LucideIcons as any)[currentRank.icon] || LucideIcons.Sword

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-6 justify-between">

        {/* ── Title Block ────────────────────────────────────────────────── */}
        <View className="items-center pt-8">
          <LucideIcons.Swords size={48} color={theme.primary} className="mb-6" />

          <Text className="text-4xl font-black text-text tracking-widest uppercase text-center leading-none">
            Multiplication
          </Text>
          <Text 
            className="text-4xl font-black tracking-widest uppercase text-center mt-2 leading-none"
            style={{ color: theme.primary }}
          >
            Dojo
          </Text>

          <View className="mt-8 px-6">
            <Text className="text-base text-text-muted text-center tracking-wide leading-relaxed">
              Master your multiplication tables. Train your mind, earn your weapons, and become a true math warrior.
            </Text>
          </View>
        </View>

        <View className="flex-1 justify-center max-h-64 mt-8">
          {/* ── Current Rank & Difficulty ──────────────────────────────────── */}
          <View
            className="bg-surface rounded-2xl p-6 border-2 items-center relative"
            style={{ borderColor: theme.primaryDim }}
          >
            <View 
              className="absolute -top-8 bg-background p-2 rounded-full border-2"
              style={{ borderColor: theme.primaryDim }}
            >
              <RankIcon size={32} color={rankColor} />
            </View>

            <View className="items-center mt-6">
              <Text className="text-xs text-text-muted tracking-widest uppercase mb-1">
                Current Weapon
              </Text>
              <Text className="text-2xl font-bold text-text tracking-widest uppercase" style={{ color: rankColor }}>
                {currentRank.name}
              </Text>
              <Text className="text-xs text-text-muted mt-2 tracking-widest uppercase">
                Rank {rankNumber}
              </Text>
            </View>

            <View className="w-full h-px bg-border my-6" />

            <View className="flex-row items-center justify-between w-full">
              <View>
                <Text className="text-xs text-text-muted tracking-widest uppercase mb-1">
                  Active Path
                </Text>
                <Text className="text-lg font-bold tracking-wide uppercase" style={{ color: theme.primary }}>
                  {theme.name}
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/difficulty')}
                className="px-4 py-2 rounded-lg border"
                style={{ borderColor: theme.primaryDim }}
              >
                <Text className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.primary }}>
                  Change Path
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── CTA Buttons ────────────────────────────────────────────────── */}
        <View className="gap-3 mt-8">
          <Pressable
            onPress={() => router.push('/(dojo)')}
            className="rounded-lg py-5 items-center justify-center"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-background font-bold text-lg tracking-widest uppercase">
              Enter the Dojo
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(practice)')}
            className="border border-border rounded-lg py-5 items-center justify-center"
          >
            <Text className="text-text font-bold text-lg tracking-widest uppercase">
              Practice
            </Text>
          </Pressable>

          {/* TODO: TEMPORARY — remove after testing challenge screen */}
          <Pressable
            onPress={() => router.push('/(dojo)/challenge?preset=ashigaru&rankId=1')}
            className="border rounded-lg py-5 items-center justify-center"
            style={{ borderColor: '#E53535', borderStyle: 'dashed' }}
          >
            <Text className="font-bold text-lg tracking-widest uppercase" style={{ color: '#E53535' }}>
              Test Challenge
            </Text>
          </Pressable>


        </View>

      </View>
    </SafeAreaView>
  )
}
