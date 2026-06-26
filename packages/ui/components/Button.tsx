import { Pressable, Text } from 'react-native'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'ghost'
  disabled?: boolean
}

export function Button({ label, onPress, variant = 'primary', disabled }: ButtonProps) {
  const base = 'px-6 py-4 rounded-lg items-center justify-center'
  const variants = {
    primary: 'bg-primary',
    ghost: 'border border-border',
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-40' : ''}`}
    >
      <Text className="text-background font-bold text-base uppercase tracking-wider">
        {label}
      </Text>
    </Pressable>
  )
}
