import React, { useEffect, useRef } from 'react'
import { View, Text, Pressable, Animated, Easing } from 'react-native'
import { RANKS, getDifficultyTheme } from '@daruma/ui'
import type { PresetId, RankId } from '@daruma/ui'
import { Flame, Shield, Sword, Swords, Crown } from 'lucide-react-native'

const ICON_MAP: Record<string, typeof Flame> = {
  Flame,
  Shield,
  Sword,
  Swords,
  Crown,
}

const KANJI_MAP: Record<number, string> = {
  1: '木刀',
  2: '短刀',
  3: '脇差',
  4: '刀',
  5: '野太刀',
}

interface RankCelebrationOverlayProps {
  preset: PresetId
  completedRankId: RankId
  onContinue: () => void
}

export function RankCelebrationOverlay({
  preset,
  completedRankId,
  onContinue,
}: RankCelebrationOverlayProps) {
  const nextRankId = (completedRankId >= 5 ? 5 : completedRankId + 1) as RankId
  const isMastered = completedRankId === 5

  const theme = getDifficultyTheme(preset)
  const rank = RANKS.find((r) => r.id === nextRankId) || RANKS[0]
  const rankColor = theme.ranks[nextRankId - 1] || theme.primary
  const IconComponent = ICON_MAP[rank.icon as keyof typeof ICON_MAP] || Flame

  const flashAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0)).current
  const textOpacity = useRef(new Animated.Value(0)).current
  const btnOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.delay(100),
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000),
      Animated.timing(btnOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [flashAnim, scaleAnim, textOpacity, btnOpacity])

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#0A0A0A',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: rankColor,
          opacity: flashAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.4],
          }),
        }}
      />

      <Animated.View style={{ alignItems: 'center', opacity: textOpacity, marginBottom: 50 }}>
        <Text
          style={{
            color: rankColor,
            fontSize: 18,
            fontWeight: '900',
            letterSpacing: 8,
            textTransform: 'uppercase',
          }}
        >
          {isMastered ? 'DOJO MASTERED' : 'RANK UNLOCKED'}
        </Text>
      </Animated.View>

      <Animated.View style={{ alignItems: 'center', transform: [{ scale: scaleAnim }] }}>
        <View
          style={{
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: rankColor + '15',
            borderWidth: 2,
            borderColor: rankColor + '40',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <IconComponent size={80} color={rankColor} />
        </View>

        <Text style={{ fontSize: 56, fontWeight: '900', color: '#F0EDE8', marginBottom: 4 }}>
          {KANJI_MAP[nextRankId]}
        </Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: rankColor,
            letterSpacing: 6,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          {rank.name}
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#8A8580',
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          {rank.description}
        </Text>
      </Animated.View>

      <Animated.View
        style={{ position: 'absolute', bottom: 64, opacity: btnOpacity, width: '100%', alignItems: 'center' }}
      >
        <Pressable testID="rank-unlock-continue" onPress={onContinue}>
          {({ pressed }) => (
            <View
              style={{
                width: 200,
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: 'center',
                backgroundColor: rankColor,
                opacity: pressed ? 0.9 : 1,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: '900',
                  fontSize: 16,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                }}
              >
                Continue
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  )
}
