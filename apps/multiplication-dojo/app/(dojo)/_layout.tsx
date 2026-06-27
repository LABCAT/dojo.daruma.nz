import { Stack } from 'expo-router'
import { useEffect } from 'react'

export default function DojoLayout() {
  console.log('🟠 [DojoLayout] RENDER')

  useEffect(() => {
    console.log('🟠 [DojoLayout] MOUNTED')
    return () => {
      console.log('🟠🟠🟠 [DojoLayout] UNMOUNTED — (dojo) Stack is DEAD')
    }
  }, [])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0A' },
        animation: 'fade',
      }}
    />
  )
}
