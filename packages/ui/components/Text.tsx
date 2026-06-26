import { Text as RNText, TextProps } from 'react-native'

interface DarumaTextProps extends TextProps {
  variant?: 'heading' | 'body' | 'muted' | 'question'
}

export function Text({ variant = 'body', className, ...props }: DarumaTextProps) {
  const variantClass = {
    heading: 'text-2xl font-bold text-text tracking-wide uppercase',
    body: 'text-base text-text',
    muted: 'text-sm text-text-muted',
    question: 'text-6xl font-bold text-text text-center',
  }[variant]

  return <RNText className={`${variantClass} ${className ?? ''}`} {...props} />
}
