import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import {
  View,
  Pressable,
  Animated,
  Easing,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import {
  NumberPad,
  getActiveDifficulty,
  getDifficultyTheme,
  PRESETS,
} from '@daruma/ui'
import type { PresetId } from '@daruma/ui'
import { Text } from '@daruma/ui'
import * as LucideIcons from 'lucide-react-native'
import { ChevronLeft } from 'lucide-react-native'

// ─── Constants ───────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width
const SLASH_WIDTH = SCREEN_WIDTH * 1.4
const QUESTIONS_PER_SESSION = 10

// ─── Types ───────────────────────────────────────────────────────────────────

interface Question {
  a: number
  b: number
  answer: number
}

type Phase = 'select' | 'playing' | 'results'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateQuestions(table: number, max: number): Question[] {
  // Build all questions for this table: table×1 … table×max
  const all: Question[] = []
  for (let i = 1; i <= max; i++) {
    all.push({ a: table, b: i, answer: table * i })
  }

  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }

  return all.slice(0, QUESTIONS_PER_SESSION)
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function PracticeScreen() {
  const router = useRouter()

  // Read preset once on mount
  const preset = useMemo<PresetId>(() => getActiveDifficulty(), [])
  const theme = getDifficultyTheme(preset)
  const presetData = PRESETS.find((p) => p.id === preset) ?? PRESETS[0]

  // Safely get the path icon component from lucide (same pattern as home screen)
  const PathIcon = (LucideIcons as any)[presetData.icon] || LucideIcons.Sword

  // ── Phase state machine ────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('select')
  const [selectInput, setSelectInput] = useState('')
  const [selectedTable, setSelectedTable] = useState(0)

  // Playing state
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [input, setInput] = useState('')
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null)
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Animation refs ─────────────────────────────────────────────────────
  const slashScale = useRef(new Animated.Value(0)).current
  const slashOpacity = useRef(new Animated.Value(0)).current
  const shakeAnim = useRef(new Animated.Value(0)).current
  const answerPulse = useRef(new Animated.Value(1)).current

  // ── Cleanup ────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
    }
  }, [])

  // ── Select phase logic ─────────────────────────────────────────────────
  const tableNum = parseInt(selectInput, 10)
  const isValidTable = !isNaN(tableNum) && tableNum >= 1 && tableNum <= presetData.max

  const handleStart = useCallback(() => {
    if (!isValidTable) return
    const qs = generateQuestions(tableNum, presetData.max)
    setSelectedTable(tableNum)
    setQuestions(qs)
    setQuestionIndex(0)
    setCorrectCount(0)
    setInput('')
    setLastAnswerCorrect(null)
    setPhase('playing')
  }, [isValidTable, tableNum, presetData.max])

  // ── Slash animation (correct) ──────────────────────────────────────────
  const playCorrect = useCallback(() => {
    slashScale.setValue(0)
    slashOpacity.setValue(0)
    shakeAnim.setValue(0)
    answerPulse.setValue(1)

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
    slashScale.setValue(0)
    slashOpacity.setValue(0)
    shakeAnim.setValue(0)
    answerPulse.setValue(1)

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 14, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -14, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start()
  }, [slashScale, slashOpacity, shakeAnim, answerPulse])

  // ── Trigger animations on feedback ─────────────────────────────────────
  useEffect(() => {
    if (lastAnswerCorrect === true) playCorrect()
    if (lastAnswerCorrect === false) playWrong()
  }, [lastAnswerCorrect, playCorrect, playWrong])

  // ── Submit answer ──────────────────────────────────────────────────────
  const isWaiting = lastAnswerCorrect !== null
  const currentQuestion = questions[questionIndex] ?? null

  const handleSubmit = useCallback(() => {
    if (!input || isWaiting || !currentQuestion) return

    const numValue = parseInt(input, 10)
    const isCorrect = numValue === currentQuestion.answer

    setLastAnswerCorrect(isCorrect)
    if (isCorrect) setCorrectCount((c) => c + 1)

    // Clear any existing timeout
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)

    advanceTimeoutRef.current = setTimeout(() => {
      const nextIndex = questionIndex + 1
      if (nextIndex >= questions.length) {
        // Session complete
        setCorrectCount((c) => {
          // Use the value that includes this answer
          return c
        })
        setPhase('results')
      } else {
        setQuestionIndex(nextIndex)
        setInput('')
        setLastAnswerCorrect(null)
      }
    }, 800)
  }, [input, isWaiting, currentQuestion, questionIndex, questions.length])

  // ── Reset input when auto-advancing ────────────────────────────────────
  useEffect(() => {
    if (lastAnswerCorrect === null) {
      setInput('')
    }
  }, [lastAnswerCorrect])

  // ── Back handler ───────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (phase === 'select') {
      router.back()
    } else {
      // From playing or results → go back to select
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
      setPhase('select')
      setSelectInput('')
      setInput('')
      setLastAnswerCorrect(null)
    }
  }, [phase, router])

  // ── Practice Again ─────────────────────────────────────────────────────
  const handlePracticeAgain = useCallback(() => {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
    setPhase('select')
    setSelectInput('')
    setInput('')
    setLastAnswerCorrect(null)
  }, [])

  // ── Answer box styling ─────────────────────────────────────────────────
  const getAnswerTextColor = () => {
    if (lastAnswerCorrect === true) return '#4CAF50'
    if (lastAnswerCorrect === false) return '#E53535'
    return input ? '#F0EDE8' : '#3A3A50'
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SELECT PHASE
  // ═══════════════════════════════════════════════════════════════════════
  if (phase === 'select') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F18' }}>
        {/* Ambient glow */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }} pointerEvents="none">
          <View style={{ position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: theme.primary, opacity: 0.12 }} />
          <View style={{ position: 'absolute', bottom: -80, right: -60, width: 320, height: 320, borderRadius: 160, backgroundColor: theme.primary, opacity: 0.08 }} />
        </View>

        <View style={{ flex: 1 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: 56,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Pressable
              onPress={handleBack}
              style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start', zIndex: 1 }}
            >
              <ChevronLeft size={24} color="#F0EDE8" />
            </Pressable>

            <View style={{ flex: 1 }} />

            {/* Path badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', zIndex: 1 }}>
              <View
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  borderWidth: 2, borderColor: theme.primary,
                  backgroundColor: theme.primary + '22',
                  alignItems: 'center', justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                <PathIcon size={18} color={theme.primary} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', color: theme.primary }}>
                {presetData.label}
              </Text>
            </View>

            {/* Centered title */}
            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '900', letterSpacing: 4, textTransform: 'uppercase', color: '#F0EDE8' }}>
                PRACTICE
              </Text>
            </View>
          </View>

          {/* Selection content */}
          <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 32, paddingHorizontal: 16 }}>
            {/* Prompt */}
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#8A8580', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
              Which table?
            </Text>

            {/* Big number display */}
            <View
              style={{
                minWidth: 150, minHeight: 80,
                paddingHorizontal: 32,
                justifyContent: 'center', alignItems: 'center',
                borderRadius: 20, borderWidth: 2,
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderColor: isValidTable ? theme.primary : '#3A3A50',
                shadowColor: isValidTable ? theme.primary : 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: isValidTable ? 0.5 : 0,
                shadowRadius: 12,
                elevation: isValidTable ? 5 : 0,
                marginBottom: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={{ fontSize: 48, fontWeight: '900', color: selectInput ? '#F0EDE8' : '#3A3A50', lineHeight: 56 }}>
                  {selectInput || '?'}
                </Text>
                {selectInput ? (
                  <Text style={{ fontSize: 28, fontWeight: '900', color: theme.primary, marginLeft: 8 }}>
                    ×
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Range hint */}
            <Text style={{ fontSize: 13, color: '#8A8580', marginBottom: 24 }}>
              {selectInput && !isValidTable
                ? `Enter a number between 1 and ${presetData.max}`
                : `Tables 1–${presetData.max}`}
            </Text>
          </View>

          {/* NumberPad + Start */}
          <View style={{ width: '100%', alignItems: 'center', paddingBottom: 48, paddingHorizontal: 16 }}>
            <View style={{ width: '100%', maxWidth: 320, alignItems: 'center' }}>
              <NumberPad
                value={selectInput}
                onValueChange={setSelectInput}
                disabled={false}
              />

              <Pressable onPress={handleStart} disabled={!isValidTable}>
                {({ pressed }) => (
                  <View
                    style={{
                      width: 220, paddingVertical: 14, marginTop: 24,
                      borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: theme.primary,
                      opacity: !isValidTable ? 0.35 : pressed ? 0.9 : 1,
                      borderTopWidth: 1.5, borderTopColor: 'rgba(255,255,255,0.4)',
                      borderBottomWidth: pressed ? 0 : 4, borderBottomColor: 'rgba(0,0,0,0.35)',
                      borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(0,0,0,0.1)',
                      shadowColor: theme.primary,
                      shadowOffset: { width: 0, height: pressed ? 0 : 4 },
                      shadowOpacity: !isValidTable ? 0 : pressed ? 0 : 0.8,
                      shadowRadius: 12,
                      elevation: !isValidTable ? 0 : pressed ? 0 : 6,
                      transform: [{ translateY: pressed ? 4 : 0 }],
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF', fontWeight: '900', fontSize: 16,
                        letterSpacing: 3, textTransform: 'uppercase',
                        textShadowColor: 'rgba(0,0,0,0.4)',
                        textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
                      }}
                    >
                      Start
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RESULTS PHASE
  // ═══════════════════════════════════════════════════════════════════════
  if (phase === 'results') {
    const ratio = questions.length > 0 ? correctCount / questions.length : 0
    const isGoodScore = ratio >= 0.8
    const accentColor = isGoodScore ? '#4CAF50' : theme.primary

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F18' }}>
        {/* Ambient glow */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }} pointerEvents="none">
          <View style={{ position: 'absolute', top: -50, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: accentColor, opacity: 0.15 }} />
          <View style={{ position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: theme.primary, opacity: 0.1 }} />
        </View>

        <View style={{ flex: 1, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>
          {/* Table label */}
          <View
            style={{
              paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
              backgroundColor: theme.primary + '20', borderWidth: 1.5,
              borderColor: theme.primary + '60', marginBottom: 32,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '900', letterSpacing: 4, textTransform: 'uppercase', color: theme.primary }}>
              {selectedTable}× Tables
            </Text>
          </View>

          {/* Big score */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 12, overflow: 'visible' }}>
              <Text style={{ fontSize: 84, lineHeight: 96, fontWeight: '900', color: accentColor, includeFontPadding: false }}>
                {correctCount}
              </Text>
              <Text style={{ fontSize: 32, lineHeight: 40, color: '#8A8580', fontWeight: '300', marginLeft: 4, includeFontPadding: false }}>
                / {questions.length}
              </Text>
            </View>

            <View style={{ width: 64, height: 2, backgroundColor: accentColor, marginBottom: 16, opacity: 0.6 }} />

            <Text style={{ fontSize: 16, color: '#8A8580', textAlign: 'center', lineHeight: 26 }}>
              {isGoodScore ? 'Great work!' : 'Keep practicing!'}
            </Text>
          </View>

          {/* Buttons */}
          <View style={{ width: '100%', maxWidth: 320, gap: 16, alignItems: 'center' }}>
            <Pressable onPress={handlePracticeAgain}>
              {({ pressed }) => (
                <View
                  style={{
                    width: 260, paddingVertical: 18, borderRadius: 16, alignItems: 'center',
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.9 : 1,
                    borderTopWidth: 1.5, borderTopColor: 'rgba(255,255,255,0.2)',
                    borderBottomWidth: pressed ? 0 : 4, borderBottomColor: 'rgba(0,0,0,0.4)',
                    transform: [{ translateY: pressed ? 4 : 0 }],
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 3, textTransform: 'uppercase' }}>
                    Practice Again
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable onPress={() => router.back()}>
              {({ pressed }) => (
                <View
                  style={{
                    width: 260, paddingVertical: 18, borderRadius: 16, alignItems: 'center',
                    backgroundColor: pressed ? '#1C1C28' : 'transparent',
                    borderWidth: 1, borderColor: '#3A3A50',
                  }}
                >
                  <Text style={{ color: '#F0EDE8', fontWeight: '800', fontSize: 15, letterSpacing: 3, textTransform: 'uppercase' }}>
                    Back to Home
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
  // PLAYING PHASE
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F18' }}>
      {/* Ambient glow */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }} pointerEvents="none">
        <View style={{ position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: theme.primary, opacity: 0.12 }} />
        <View style={{ position: 'absolute', bottom: -80, right: -60, width: 320, height: 320, borderRadius: 160, backgroundColor: theme.primary, opacity: 0.08 }} />
      </View>

      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', height: 56,
            paddingHorizontal: 16, position: 'relative',
            borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <Pressable
            onPress={handleBack}
            style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start', zIndex: 1 }}
          >
            <ChevronLeft size={24} color="#F0EDE8" />
          </Pressable>

          <View style={{ flex: 1 }} />

          {/* Score badge */}
          <View
            style={{
              flexDirection: 'row', alignItems: 'baseline', zIndex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              paddingHorizontal: 12, paddingVertical: 6,
              borderRadius: 12, borderWidth: 1, borderColor: theme.primary,
              overflow: 'visible',
            }}
          >
            <Text style={{ fontSize: 20, lineHeight: 24, fontWeight: '900', color: theme.primary, includeFontPadding: false }}>
              {correctCount}
            </Text>
            <Text style={{ fontSize: 13, lineHeight: 18, fontWeight: '700', color: '#8A8580', marginLeft: 4, includeFontPadding: false }}>
              / {questions.length}
            </Text>
          </View>

          {/* Centered title */}
          <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '900', letterSpacing: 4, textTransform: 'uppercase', color: '#F0EDE8' }}>
              {selectedTable}× TABLES
            </Text>
          </View>
        </View>

        {/* Question Area */}
        <View
          style={{
            flex: 1, justifyContent: 'flex-start', alignItems: 'center',
            paddingTop: 20, paddingHorizontal: 16, position: 'relative',
          }}
        >
          {currentQuestion && (
            <View style={{ alignItems: 'center', width: '100%' }}>
              {/* Question progress pill */}
              <View
                style={{
                  borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6,
                  marginBottom: 16,
                  backgroundColor: theme.primary,
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase', color: '#000000' }}>
                  Question{' '}
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#000000' }}>
                    {questionIndex + 1}
                  </Text>{' '}
                  of {questions.length}
                </Text>
              </View>

              {/* Multiplicands */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 48, fontWeight: '900', color: '#F0EDE8', lineHeight: 56 }}>
                  {currentQuestion.a}
                </Text>
                <Text style={{ fontSize: 32, color: theme.primary, marginHorizontal: 16, fontWeight: '900' }}>
                  ×
                </Text>
                <Text style={{ fontSize: 48, fontWeight: '900', color: '#F0EDE8', lineHeight: 56 }}>
                  {currentQuestion.b}
                </Text>
              </View>

              {/* = ? */}
              <Text style={{ fontSize: 22, color: theme.primaryDim, marginTop: 4, marginBottom: 24, fontWeight: '700' }}>
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
                    minWidth: 150, minHeight: 64, paddingHorizontal: 24,
                    justifyContent: 'center', alignItems: 'center',
                    borderRadius: 16, borderWidth: 2,
                    backgroundColor:
                      lastAnswerCorrect === true ? '#1A3A1A'
                        : lastAnswerCorrect === false ? '#3A1A1A'
                          : 'rgba(0,0,0,0.6)',
                    borderColor:
                      lastAnswerCorrect === true ? '#4CAF50'
                        : lastAnswerCorrect === false ? '#E53535'
                          : theme.primary,
                    shadowColor: theme.primary,
                    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  <Text style={{ fontSize: 36, fontWeight: '900', color: getAnswerTextColor(), lineHeight: 44 }}>
                    {input || '—'}
                  </Text>
                </View>

                {lastAnswerCorrect === false && currentQuestion && (
                  <Text style={{ fontSize: 18, color: '#F0EDE8', marginTop: 12, fontWeight: '700' }}>
                    Correct:{' '}
                    <Text style={{ color: '#E53535', fontWeight: '900', fontSize: 22 }}>
                      {currentQuestion.answer}
                    </Text>
                  </Text>
                )}
              </Animated.View>
            </View>
          )}

          {/* Sword Slash */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute', top: '40%', marginTop: -5,
              left: (SCREEN_WIDTH - SLASH_WIDTH) / 2,
              width: SLASH_WIDTH, height: 10, borderRadius: 5,
              backgroundColor: theme.primary,
              opacity: slashOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }),
              transform: [{ rotate: '-28deg' }, { scaleX: slashScale }],
            }}
          />
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute', top: '40%',
              left: (SCREEN_WIDTH - SLASH_WIDTH) / 2,
              width: SLASH_WIDTH, height: 2,
              backgroundColor: '#FFFFFF',
              opacity: slashOpacity,
              transform: [{ rotate: '-28deg' }, { scaleX: slashScale }],
            }}
          />
        </View>

        {/* NumberPad + Submit */}
        <View style={{ width: '100%', alignItems: 'center', paddingBottom: 28, paddingTop: 40, paddingHorizontal: 16 }}>
          <View style={{ width: '100%', maxWidth: 320, alignItems: 'center' }}>
            <NumberPad value={input} onValueChange={setInput} disabled={isWaiting} />

            <Pressable onPress={handleSubmit} disabled={!input || isWaiting}>
              {({ pressed }) => (
                <View
                  style={{
                    width: 220, paddingVertical: 14, marginTop: 14,
                    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: theme.primary,
                    opacity: !input || isWaiting ? 0.35 : pressed ? 0.9 : 1,
                    borderTopWidth: 1.5, borderTopColor: 'rgba(255,255,255,0.4)',
                    borderBottomWidth: pressed ? 0 : 4, borderBottomColor: 'rgba(0,0,0,0.35)',
                    borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(0,0,0,0.1)',
                    shadowColor: theme.primary,
                    shadowOffset: { width: 0, height: pressed ? 0 : 4 },
                    shadowOpacity: !input || isWaiting ? 0 : pressed ? 0 : 0.8,
                    shadowRadius: 12,
                    elevation: !input || isWaiting ? 0 : pressed ? 0 : 6,
                    transform: [{ translateY: pressed ? 4 : 0 }],
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF', fontWeight: '900', fontSize: 16,
                      letterSpacing: 3, textTransform: 'uppercase',
                      textShadowColor: 'rgba(0,0,0,0.4)',
                      textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
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
    </SafeAreaView>
  )
}
