import { Pressable, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import {
  PRESETS,
  getActiveDifficulty,
  setActiveDifficulty,
  getDifficultyTheme,
  Text,
} from '@daruma/ui'
import type { PresetId } from '@daruma/ui'
import * as LucideIcons from 'lucide-react-native'

export default function DifficultyScreen() {
  const router = useRouter()
  const activePresetId = getActiveDifficulty()

  function handleSelectPreset(id: PresetId) {
    setActiveDifficulty(id)
    router.back()
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── Title Block ────────────────────────────────────────────────── */}
        <View className="items-center pt-4 mb-8">
          <View className="flex-row items-center mb-5 gap-3">
            <View className="flex-1 h-px bg-border" />
            <LucideIcons.Compass size={16} color="#8A8580" />
            <View className="flex-1 h-px bg-border" />
          </View>
          <Text className="text-2xl font-bold text-text tracking-widest uppercase text-center mb-2">
            Choose Your Path
          </Text>
          <Text className="text-sm text-text-muted text-center tracking-wide px-4">
            Select a difficulty level. Each path offers a unique theme and increasingly challenging trials.
          </Text>
        </View>

        {/* ── Difficulty Cards ─────────────────────────────────────────────── */}
        <View className="gap-4">
          {PRESETS.map((preset) => {
            const theme = getDifficultyTheme(preset.id as PresetId)
            const isActive = activePresetId === preset.id
            const IconComponent = LucideIcons.Target // Generic icon for difficulty

            return (
              <Pressable
                key={preset.id}
                onPress={() => handleSelectPreset(preset.id as PresetId)}
                className={[
                  'rounded-lg p-5 border flex-row items-center justify-between',
                  isActive ? 'bg-surface' : 'bg-background opacity-80'
                ].join(' ')}
                style={{ borderColor: isActive ? theme.primary : '#2A2A2A' }}
              >
                <View className="flex-row items-center gap-4">
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: isActive ? theme.primaryDim : '#141414' }}
                  >
                    <IconComponent size={24} color={isActive ? '#F0EDE8' : theme.primary} />
                  </View>
                  <View>
                    <Text 
                      className="text-xl font-bold tracking-widest uppercase"
                      style={{ color: isActive ? theme.primary : '#F0EDE8' }}
                    >
                      {preset.label}
                    </Text>
                    <Text className="text-sm text-text-muted mt-1">
                      Multipliers 1–{preset.max}
                    </Text>
                  </View>
                </View>

                {isActive && (
                  <View>
                    <LucideIcons.Check size={24} color={theme.primary} />
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>

        {/* ── Back Button ────────────────────────────────────────────────── */}
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
