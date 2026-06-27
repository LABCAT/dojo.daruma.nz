import 'react-native-gesture-handler'
import '../global.css'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useEffect } from 'react'

export default function RootLayout() {
  console.log('🔴 [RootLayout] RENDER')

  useEffect(() => {
    console.log('🔴 [RootLayout] MOUNTED')
    return () => {
      console.log('🔴🔴🔴 [RootLayout] UNMOUNTED — NavigationContainer is GONE')
    }
  }, [])

  return (
    <GestureHandlerRootView className="flex-1">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0A' },
        }}
      />
    </GestureHandlerRootView>
  )
}
