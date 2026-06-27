import { useCallback, useState } from 'react'
import { Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import {
  PRESETS,
  RANKS,
  getActiveDifficulty,
  setActiveDifficulty,
  getRankStatus,
} from '@daruma/ui'
import type { PresetId } from '@daruma/ui'
import { Text } from '@daruma/ui'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCurrentRank(preset: PresetId) {
  const currentRank = RANKS.find((r) => getRankStatus(preset, r.id) === 'current')
  return currentRank ?? RANKS[0]
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface PresetCardProps {
  id: PresetId
  label: string
  max: number
  isActive: boolean
  onPress: () => void
}

function PresetCard({ id, label, max, isActive, onPress }: PresetCardProps) {
  const japaneseLabel: Record<PresetId, string> = {
    ashigaru: '足軽',
    samurai: '侍',
    ronin: '浪人',
    shogun: '将軍',
  }

  return (
    <Pressable
      id={`preset-card-${id}`}
      onPress={onPress}
      className={[
        'flex-1 rounded-lg p-3 items-center border',
        isActive ? 'bg-surface border-primary' : 'bg-surface border-border opacity-60',
      ].join(' ')}
    >
      {/* Active indicator bar */}
      {isActive && (
        <View className="w-8 h-0.5 bg-primary mb-2 rounded-full" />
      )}
      <Text
        className={[
          'text-base font-bold tracking-wider uppercase',
          isActive ? 'text-primary' : 'text-text-muted',
        ].join(' ')}
      >
        {label}
      </Text>
      <Text className="text-xs text-text-muted mt-0.5">{japaneseLabel[id]}</Text>
      <Text className="text-xs text-text-muted mt-1">1–{max}</Text>
    </Pressable>
  )
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter()
  const [activePreset, setActivePreset] = useState<PresetId>(() => getActiveDifficulty())
  const [currentRank, setCurrentRank] = useState(() => getCurrentRank(getActiveDifficulty()))

  // Re-read state every time the screen gains focus (e.g. returning from a challenge)
  useFocusEffect(
    useCallback(() => {
      const preset = getActiveDifficulty()
      setActivePreset(preset)
      setCurrentRank(getCurrentRank(preset))
    }, []),
  )

  function handleSelectPreset(id: PresetId) {
    setActiveDifficulty(id)
    setActivePreset(id)
    setCurrentRank(getCurrentRank(id))
  }

  const rankNumber = String(currentRank.id).padStart(2, '0')

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-6 justify-between">

        {/* ── Title Block ────────────────────────────────────────────────── */}
        <View className="items-center pt-4">
          {/* Decorative top line */}
          <View className="flex-row items-center mb-5 gap-3">
            <View className="flex-1 h-px bg-border" />
            <View className="w-1.5 h-1.5 rounded-full bg-primary" />
            <View className="flex-1 h-px bg-border" />
          </View>

          <Text className="text-3xl font-bold text-text tracking-widest uppercase text-center">
            Multiplication
          </Text>
          <Text className="text-3xl font-bold text-primary tracking-widest uppercase text-center">
            Dojo
          </Text>

          {/* Japanese subtitle */}
          <Text className="text-lg text-text-muted mt-2 tracking-wider">
            乗算道場
          </Text>

          {/* Decorative bottom line */}
          <View className="flex-row items-center mt-5 gap-3 w-full">
            <View className="flex-1 h-px bg-border" />
            <View className="w-1.5 h-1.5 rounded-full bg-primary-dim" />
            <View className="flex-1 h-px bg-border" />
          </View>
        </View>

        {/* ── Difficulty Selector ────────────────────────────────────────── */}
        <View>
          <Text className="text-xs text-text-muted tracking-widest uppercase mb-3 text-center">
            ── Choose Your Path ──
          </Text>
          <View className="flex-row gap-2">
            {PRESETS.map((preset) => (
              <PresetCard
                key={preset.id}
                id={preset.id as PresetId}
                label={preset.label}
                max={preset.max}
                isActive={activePreset === preset.id}
                onPress={() => handleSelectPreset(preset.id as PresetId)}
              />
            ))}
          </View>
        </View>

        {/* ── Current Rank Display ───────────────────────────────────────── */}
        <View
          id="current-rank-display"
          className="bg-surface border border-primary rounded-lg p-4 flex-row items-center justify-between"
        >
          <View>
            <Text className="text-xs text-text-muted tracking-widest uppercase mb-1">
              Current Rank
            </Text>
            <Text className="text-xl font-bold text-text tracking-wide uppercase">
              {currentRank.name}
            </Text>
            <Text className="text-base text-text-muted mt-0.5">
              {currentRank.japanese}
            </Text>
          </View>

          {/* Rank number */}
          <View className="items-end">
            <Text className="text-xs text-text-muted tracking-widest uppercase mb-1">
              Rank
            </Text>
            <Text className="text-4xl font-bold text-primary tracking-tight">
              {rankNumber}
            </Text>
          </View>
        </View>

        {/* ── CTA Buttons ────────────────────────────────────────────────── */}
        <View className="gap-3">
          {/* Primary: Enter the Dojo */}
          <Pressable
            id="btn-enter-dojo"
            onPress={() => router.push('/(dojo)')}
            className="bg-primary rounded-lg py-4 items-center justify-center"
          >
            <Text className="text-background font-bold text-base tracking-widest uppercase">
              Enter the Dojo
            </Text>
          </Pressable>

          {/* Ghost: Practice */}
          <Pressable
            id="btn-practice"
            onPress={() => router.push('/(practice)')}
            className="border border-border rounded-lg py-4 items-center justify-center"
          >
            <Text className="text-text font-bold text-base tracking-widest uppercase">
              Practice
            </Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  )
}
