import React from 'react'
import { View, Pressable, Text as RNText } from 'react-native'
import { getActiveDifficulty } from '../storage'
import { getDifficultyTheme } from '../theme/tokens'

interface NumberPadProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

const Key = ({
  label,
  onPress,
  disabled,
  isAction = false,
  theme
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  isAction?: boolean
  theme: ReturnType<typeof getDifficultyTheme>
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-1 h-16 m-1 items-center justify-center border rounded-md ${
        disabled ? 'opacity-40' : ''
      }`}
      style={({ pressed }) => ({
        borderColor: isAction ? theme.primary : theme.primaryDim,
        backgroundColor: pressed && !disabled ? '#2A2A2A' : '#141414', // active: border color, default: surface
      })}
    >
      <RNText className="text-3xl font-bold" style={{ color: isAction ? theme.primary : '#F0EDE8' }}>
        {label}
      </RNText>
    </Pressable>
  )
}

export function NumberPad({ value, onValueChange, disabled = false }: NumberPadProps) {
  const difficulty = getActiveDifficulty()
  const theme = getDifficultyTheme(difficulty)

  const handlePress = (key: string) => {
    if (disabled) return

    if (key === 'C') {
      onValueChange('')
    } else if (key === '⌫') {
      onValueChange(value.slice(0, -1))
    } else {
      if (value.length >= 6) return
      if (value === '' && key === '0') return
      onValueChange(value + key)
    }
  }

  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '⌫']
  ]

  return (
    <View className="w-full max-w-xs self-center">
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row w-full">
          {row.map((key) => (
            <Key
              key={key}
              label={key}
              onPress={() => handlePress(key)}
              disabled={disabled}
              isAction={key === 'C' || key === '⌫'}
              theme={theme}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

