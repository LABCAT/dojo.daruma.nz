import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View,
  Pressable,
  BackHandler,
  Animated,
  Easing,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  useChallenge,
  NumberPad,
  RANKS,
  PRESETS,
  getDifficultyTheme,
  advanceRank,
} from '@daruma/ui'
import type { PresetId, RankId } from '@daruma/ui'
import { Text } from '@daruma/ui'
import { ChevronLeft } from 'lucide-react-native'
import { RankCelebrationOverlay } from '../../components/RankCelebrationOverlay'

// ─── Constants ───────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width
const SLASH_WIDTH = SCREEN_WIDTH * 1.4

const RANK_JAPANESE: Record<number, string> = {
  1: '木刀',
  2: '短刀',
  3: '脇差',
  4: '刀',
  5: '野太刀',
}

// ─── Param Validation ────────────────────────────────────────────────────────

const VALID_PRESETS = PRESETS.map((p) => p.id) as readonly string[]

function validatePreset(raw: string | string[] | undefined): PresetId {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value && VALID_PRESETS.includes(value)) return value as PresetId
  return 'ashigaru'
}

function validateRankId(raw: string | string[] | undefined): RankId {
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = parseInt(value ?? '', 10)
  if (parsed >= 1 && parsed <= 5) return parsed as RankId
  return 1 as RankId
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ChallengeScreen() {
  const params = useLocalSearchParams<{ preset: string; rankId: string }>()
  const router = useRouter()

  const safePreset = validatePreset(params.preset)
  const safeRankId = validateRankId(params.rankId)

  const challenge = useChallenge(safePreset, safeRankId)
  const [input, setInput] = useState('')
  const [showCelebration, setShowCelebration] = useState(false)

  const theme = getDifficultyTheme(safePreset)
  const rank = RANKS.find((r) => r.id === safeRankId) ?? RANKS[0]
  const rankColor = theme.ranks[safeRankId - 1] ?? theme.primary

  // ── Animation refs ─────────────────────────────────────────────────────
  const progressAnim = useRef(new Animated.Value(0)).current
  const slashScale = useRef(new Animated.Value(0)).current
  const slashOpacity = useRef(new Animated.Value(0)).current
  const shakeAnim = useRef(new Animated.Value(0)).current
  const answerPulse = useRef(new Animated.Value(1)).current
  const hasAdvancedRef = useRef(false)

  // ── Start challenge on mount ───────────────────────────────────────────
  useEffect(() => {
    challenge.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (challenge.status !== 'passed') return
    if (hasAdvancedRef.current) return
    hasAdvancedRef.current = true
    advanceRank(safePreset, safeRankId)
    setShowCelebration(true)
  }, [challenge.status, safePreset, safeRankId])

  const handleCelebrationContinue = useCallback(() => {
    router.replace('/(dojo)')
  }, [router])

  // ── Reset input when auto-advancing ────────────────────────────────────
  useEffect(() => {
    if (challenge.lastAnswerCorrect === null) {
      setInput('')
    }
  }, [challenge.lastAnswerCorrect])

  // ── Animate progress bar ───────────────────────────────────────────────
  const answeredCount =
    challenge.lastAnswerCorrect !== null
      ? challenge.questionIndex + 1
      : challenge.questionIndex

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: answeredCount / challenge.totalQuestions,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [answeredCount, challenge.totalQuestions, progressAnim])

  // ── Block hardware back during active challenge ────────────────────────
  useEffect(() => {
    if (challenge.status !== 'active') return
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => sub.remove()
  }, [challenge.status])

  // ── Sword slash animation (correct) ────────────────────────────────────
  const playCorrect = useCallback(() => {
    // Reset everything
    slashScale.setValue(0)
    slashOpacity.setValue(0)
    shakeAnim.setValue(0)
    answerPulse.setValue(1)

    // Slash: scale outward from center + fade in, then fade out
    Animated.sequence([
      Animated.parallel([
        Animated.timing(slashScale, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slashOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(60),
      Animated.timing(slashOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start()

    // Answer pulse: scale up then back
    Animated.sequence([
      Animated.timing(answerPulse, {
        toValue: 1.1,
        duration: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(answerPulse, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }, [slashScale, slashOpacity, shakeAnim, answerPulse])

  // ── Shake animation (wrong) ────────────────────────────────────────────
  const playWrong = useCallback(() => {
    // Reset everything
    slashScale.setValue(0)
    slashOpacity.setValue(0)
    shakeAnim.setValue(0)
    answerPulse.setValue(1)

    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 14,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -14,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start()
  }, [slashScale, slashOpacity, shakeAnim, answerPulse])

  // ── Trigger animations on feedback ─────────────────────────────────────
  useEffect(() => {
    if (challenge.lastAnswerCorrect === true) playCorrect()
    if (challenge.lastAnswerCorrect === false) playWrong()
  }, [challenge.lastAnswerCorrect, playCorrect, playWrong])

  // ── Handlers ───────────────────────────────────────────────────────────
  const isWaiting = challenge.lastAnswerCorrect !== null
  const isActive = challenge.status === 'active'

  const handleSubmit = useCallback(() => {
    if (!input || isWaiting) return
    challenge.submitAnswer(input)
  }, [input, isWaiting, challenge])

  const handleBack = useCallback(() => {
    if (isActive) return
    router.back()
  }, [isActive, router])

  const handleRetry = useCallback(() => {
    setInput('')
    challenge.retry()
  }, [challenge])

  // ── Answer box styling ─────────────────────────────────────────────────
  const getAnswerBoxStyle = () => {
    if (challenge.lastAnswerCorrect === true) {
      return { backgroundColor: '#1A3A1A', borderColor: '#2D6A2D' }
    }
    if (challenge.lastAnswerCorrect === false) {
      return { backgroundColor: '#3A1A1A', borderColor: '#8B1A1A' }
    }
    return { backgroundColor: '#141414', borderColor: '#2A2A2A' }
  }

  const getAnswerTextColor = () => {
    if (challenge.lastAnswerCorrect === true) return '#4CAF50'
    if (challenge.lastAnswerCorrect === false) return '#E53535'
    return input ? '#F0EDE8' : '#3A3A3A'
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FAIL STATE — inline replacement
  // ═══════════════════════════════════════════════════════════════════════
  if (challenge.status === 'failed') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
        {/* Dark Red glow effect */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }} pointerEvents="none">
          <View style={{ position: 'absolute', top: -50, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: '#8B1A1A', opacity: 0.15 }} />
          <View style={{ position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#E53535', opacity: 0.1 }} />
        </View>

        <View style={{ flex: 1, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#E53535', fontSize: 24, fontWeight: '900', letterSpacing: 8, textTransform: 'uppercase', marginBottom: 24 }}>
            UNSUCCESSFUL
          </Text>

          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 12, overflow: 'visible' }}>
              <Text style={{ fontSize: 84, lineHeight: 96, fontWeight: '900', color: '#F0EDE8', includeFontPadding: false }}>
                {challenge.correctCount}
              </Text>
              <Text style={{ fontSize: 32, lineHeight: 40, color: '#8A8580', fontWeight: '300', marginLeft: 4, includeFontPadding: false }}>
                / {challenge.totalQuestions}
              </Text>
            </View>

            <View style={{ width: 64, height: 2, backgroundColor: '#8B1A1A', marginBottom: 24 }} />

            <Text style={{ fontSize: 16, color: '#8A8580', textAlign: 'center', lineHeight: 26 }}>
              You needed <Text style={{ color: '#F0EDE8', fontWeight: '700' }}>{challenge.passThreshold}</Text> to advance.
            </Text>
          </View>

          <View style={{ width: '100%', maxWidth: 320, gap: 16, alignItems: 'center' }}>
            <Pressable onPress={handleRetry}>
              {({ pressed }) => (
                <View style={{
                  width: 260,
                  paddingVertical: 18,
                  borderRadius: 16,
                  alignItems: 'center',
                  backgroundColor: '#8B1A1A',
                  opacity: pressed ? 0.9 : 1,
                  borderTopWidth: 1.5,
                  borderTopColor: 'rgba(255,255,255,0.2)',
                  borderBottomWidth: pressed ? 0 : 4,
                  borderBottomColor: 'rgba(0,0,0,0.4)',
                  transform: [{ translateY: pressed ? 4 : 0 }]
                }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 3, textTransform: 'uppercase' }}>
                    Try Again
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable onPress={() => router.back()}>
              {({ pressed }) => (
                <View style={{
                  width: 260,
                  paddingVertical: 18,
                  borderRadius: 16,
                  alignItems: 'center',
                  backgroundColor: pressed ? '#141414' : 'transparent',
                  borderWidth: 1,
                  borderColor: '#2A2A2A',
                }}>
                  <Text style={{ color: '#F0EDE8', fontWeight: '800', fontSize: 15, letterSpacing: 3, textTransform: 'uppercase' }}>
                    Back to Dojo
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTIVE / IDLE STATE
  // ═══════════════════════════════════════════════════════════════════════
  
  const safePrimary = theme?.primary || '#C9A84C'
  const safePrimaryDim = theme?.primaryDim || '#8A6F2E'
  // Guarantee a valid hex string fallback just in case theme arrays are empty
  const safeRankColor = (theme?.ranks && theme.ranks[safeRankId - 1]) ? theme.ranks[safeRankId - 1] : '#D2691E'
  const activeBgColor = '#0A0A0A'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: activeBgColor }}>
      {/* ── Background Glow Effects ─────────────────────────────────── */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }} pointerEvents="none">
        <View 
          style={{ 
            position: 'absolute', 
            top: -50, 
            left: -50, 
            width: 250, 
            height: 250, 
            borderRadius: 125, 
            backgroundColor: safePrimary, 
            opacity: 0.15 
          }} 
        />
        <View 
          style={{ 
            position: 'absolute', 
            bottom: -50, 
            right: -50, 
            width: 350, 
            height: 350, 
            borderRadius: 175, 
            backgroundColor: safeRankColor, 
            opacity: 0.1 
          }} 
        />
      </View>

      <View style={{ flex: 1 }}>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 56,
            paddingHorizontal: 16,
            position: 'relative',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <Pressable
            onPress={handleBack}
            disabled={isActive}
            style={{
              width: 44,
              height: 44,
              justifyContent: 'center',
              alignItems: 'flex-start',
              opacity: isActive ? 0.15 : 1,
              zIndex: 1,
            }}
          >
            <ChevronLeft size={24} color="#F0EDE8" />
          </Pressable>

          <View style={{ flex: 1 }} />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              zIndex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: safeRankColor,
              overflow: 'visible',
            }}
          >
            <Text style={{ fontSize: 20, lineHeight: 24, fontWeight: '900', color: safeRankColor, includeFontPadding: false }}>
              {challenge.correctCount}
            </Text>
            <Text style={{ fontSize: 13, lineHeight: 18, fontWeight: '700', color: '#8A8580', marginLeft: 4, includeFontPadding: false }}>
              / {challenge.totalQuestions}
            </Text>
          </View>

          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '900',
                letterSpacing: 4,
                textTransform: 'uppercase',
                color: '#F0EDE8',
              }}
            >
              {rank.name}
            </Text>
          </View>
        </View>

        {/* ── Progress Bar ────────────────────────────────────────────── */}
        <View style={{ height: 4, width: '100%', backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Animated.View
            style={{
              height: '100%',
              backgroundColor: safeRankColor,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </View>

        {/* ── Question Area ───────────────────────────────────────────── */}
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingTop: 20,
            paddingHorizontal: 16,
            position: 'relative',
          }}
        >
          {challenge.currentQuestion && (
            <View style={{ alignItems: 'center', width: '100%' }}>
              
              <View 
                style={{
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  marginBottom: 16,
                  backgroundColor: safeRankColor, 
                  shadowColor: safeRankColor,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '800',
                    letterSpacing: 3,
                    textTransform: 'uppercase',
                    color: '#000000',
                  }}
                >
                  Question{' '}
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#000000' }}>
                    {challenge.questionIndex + 1}
                  </Text>{' '}
                  of {challenge.totalQuestions}
                </Text>
              </View>

              {/* Multiplicands */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 48, fontWeight: '900', color: '#F0EDE8', lineHeight: 56 }}>
                  {challenge.currentQuestion.a}
                </Text>
                <Text style={{ fontSize: 32, color: safePrimary, marginHorizontal: 16, fontWeight: '900' }}>
                  ×
                </Text>
                <Text style={{ fontSize: 48, fontWeight: '900', color: '#F0EDE8', lineHeight: 56 }}>
                  {challenge.currentQuestion.b}
                </Text>
              </View>

              {/* = ?  (Optical alignment fix: text has native bottom padding, so we use more margin bottom than top) */}
              <Text style={{ fontSize: 22, color: safePrimaryDim, marginTop: 4, marginBottom: 24, fontWeight: '700' }}>
                = ?
              </Text>

              {/* Answer display */}
              <Animated.View
                style={{
                  transform: [{ translateX: shakeAnim }, { scale: answerPulse }],
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    minWidth: 150,
                    minHeight: 64,
                    paddingHorizontal: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 16,
                    borderWidth: 2,
                    backgroundColor: challenge.lastAnswerCorrect === true ? '#1A3A1A' : challenge.lastAnswerCorrect === false ? '#3A1A1A' : 'rgba(0,0,0,0.6)',
                    borderColor: challenge.lastAnswerCorrect === true ? '#4CAF50' : challenge.lastAnswerCorrect === false ? '#E53535' : safeRankColor,
                    shadowColor: safeRankColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  <Text style={{ fontSize: 36, fontWeight: '900', color: getAnswerTextColor(), lineHeight: 44 }}>
                    {input || '—'}
                  </Text>
                </View>

                {challenge.lastAnswerCorrect === false && challenge.currentQuestion && (
                  <Text style={{ fontSize: 18, color: '#F0EDE8', marginTop: 12, fontWeight: '700' }}>
                    Correct:{' '}
                    <Text style={{ color: '#E53535', fontWeight: '900', fontSize: 22 }}>
                      {challenge.currentQuestion.answer}
                    </Text>
                  </Text>
                )}
              </Animated.View>
            </View>
          )}

          {/* ── Sword Slash ────────────────────────────────────────────── */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: '40%',
              marginTop: -5,
              left: (SCREEN_WIDTH - SLASH_WIDTH) / 2,
              width: SLASH_WIDTH,
              height: 10,
              borderRadius: 5,
              backgroundColor: safeRankColor,
              opacity: slashOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }),
              transform: [{ rotate: '-28deg' }, { scaleX: slashScale }],
            }}
          />
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: '40%',
              left: (SCREEN_WIDTH - SLASH_WIDTH) / 2,
              width: SLASH_WIDTH,
              height: 2,
              backgroundColor: '#FFFFFF',
              opacity: slashOpacity,
              transform: [{ rotate: '-28deg' }, { scaleX: slashScale }],
            }}
          />
        </View>

        {/* ── NumberPad + Submit ───────────────────────────────────────── */}
        <View style={{ width: '100%', alignItems: 'center', paddingBottom: 48, paddingHorizontal: 16 }}>
          <View style={{ width: '100%', maxWidth: 320, alignItems: 'center' }}>
            
            <NumberPad
              value={input}
              onValueChange={setInput}
              disabled={isWaiting}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={!input || isWaiting}
            >
              {({ pressed }) => (
                <View
                  style={{
                    width: 220, // Smaller, sleeker width
                    paddingVertical: 14, // Compact height
                    marginTop: 24, // Clean space from number pad
                    borderRadius: 16, // Modern rounded rectangle
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: safeRankColor,
                    opacity: (!input || isWaiting) ? 0.35 : (pressed ? 0.9 : 1), 
                    borderTopWidth: 1.5, // Refined bevel
                    borderTopColor: 'rgba(255,255,255,0.4)',
                    borderBottomWidth: pressed ? 0 : 4, // Softer physical lip
                    borderBottomColor: 'rgba(0,0,0,0.35)',
                    borderLeftWidth: 1,
                    borderRightWidth: 1,
                    borderColor: 'rgba(0,0,0,0.1)', // Subtle side containment
                    shadowColor: safeRankColor, 
                    shadowOffset: { width: 0, height: pressed ? 0 : 4 },
                    shadowOpacity: pressed ? 0 : 0.8,
                    shadowRadius: 12,
                    elevation: pressed ? 0 : 6,
                    transform: [{ translateY: pressed ? 4 : 0 }],
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontWeight: '900',
                      fontSize: 16, // Proportional text
                      letterSpacing: 3,
                      textTransform: 'uppercase',
                      textShadowColor: 'rgba(0,0,0,0.4)', // Premium text shadow
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}
                  >
                    Submit
                  </Text>
                </View>
              )}
            </Pressable>
            
          </View>
        </View>
      </View>
      {showCelebration && (
        <RankCelebrationOverlay
          preset={safePreset}
          completedRankId={safeRankId}
          onContinue={handleCelebrationContinue}
        />
      )}
    </SafeAreaView>
  )
}
