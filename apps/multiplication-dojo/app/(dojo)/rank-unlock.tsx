import React, { useEffect, useRef } from 'react'
import { View, Text, Pressable, Animated, Easing, Dimensions } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { RANKS, getDifficultyTheme } from '@daruma/ui'
import type { PresetId, RankId } from '@daruma/ui'
import { Flame, Shield, Sword, Swords, Crown } from 'lucide-react-native'

const ICON_MAP: Record<string, any> = {
  Flame,
  Shield,
  Sword,
  Swords,
  Crown
}

const KANJI_MAP: Record<number, string> = {
  1: '木刀',
  2: '短刀',
  3: '脇差',
  4: '刀',
  5: '野太刀',
}

export default function RankUnlock() {
  const router = useRouter()
  const params = useLocalSearchParams<{ preset: string; completedRankId: string }>()

  // 1. Process unlock data on first mount
  const preset = (params.preset as PresetId) || 'ashigaru'
  const completedId = parseInt(params.completedRankId || '1', 10) as RankId
  
  // Calculate next rank directly to show it instantly
  const nextRankId = (completedId >= 5 ? 5 : completedId + 1) as RankId
  const isMastered = completedId === 5

  // Lookup visuals for the NEXT rank (or current if mastered)
  const theme = getDifficultyTheme(preset)
  const rank = RANKS.find(r => r.id === nextRankId) || RANKS[0]
  const rankColor = theme.ranks[nextRankId - 1] || theme.primary
  const IconComponent = ICON_MAP[rank.icon] || Flame

  // 3. Animations
  const flashAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0)).current
  const textOpacity = useRef(new Animated.Value(0)).current
  const btnOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.delay(100),
      
      // Flash the background
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      
      // Heavy Haptic + BOOM scale up
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
        })
      ]),
      
      // Wait to bask
      Animated.delay(1000),
      
      // Show continue button
      Animated.timing(btnOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start()

  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Background Flash */}
      <Animated.View 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: rankColor,
          opacity: flashAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.4]
          })
        }}
      />

      <Animated.View style={{ alignItems: 'center', opacity: textOpacity, marginBottom: 50 }}>
        <Text style={{ color: rankColor, fontSize: 18, fontWeight: '900', letterSpacing: 8, textTransform: 'uppercase' }}>
          {isMastered ? 'DOJO MASTERED' : 'RANK UNLOCKED'}
        </Text>
      </Animated.View>

      {/* The Reveal */}
      <Animated.View 
        style={{ 
          alignItems: 'center',
          transform: [{ scale: scaleAnim }]
        }}
      >
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
            shadowColor: rankColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 30,
            elevation: 10,
          }}
        >
          <IconComponent size={80} color={rankColor} />
        </View>

        <Text style={{ fontSize: 56, fontWeight: '900', color: '#F0EDE8', marginBottom: 4 }}>
          {KANJI_MAP[nextRankId]}
        </Text>
        <Text style={{ fontSize: 28, fontWeight: '800', color: rankColor, letterSpacing: 6, textTransform: 'uppercase', marginBottom: 8 }}>
          {rank.name}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#8A8580', textTransform: 'uppercase', letterSpacing: 2 }}>
          {rank.description}
        </Text>
      </Animated.View>

      {/* Continue Button */}
      <Animated.View style={{ position: 'absolute', bottom: 64, opacity: btnOpacity, width: '100%', alignItems: 'center' }}>
        <Pressable
          onPress={() => {
            // MAIN BRANCH NAVIGATION: use navigate
            router.navigate('/(dojo)')
          }}
        >
          {({ pressed }) => (
            <View
              style={{
                width: 200,
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: 'center',
                backgroundColor: rankColor,
                opacity: pressed ? 0.9 : 1,
                borderTopWidth: 1.5,
                borderTopColor: 'rgba(255,255,255,0.4)',
                borderBottomWidth: pressed ? 0 : 4,
                borderBottomColor: 'rgba(0,0,0,0.35)',
                transform: [{ translateY: pressed ? 4 : 0 }]
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 3, textTransform: 'uppercase' }}>
                Continue
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  )
}
