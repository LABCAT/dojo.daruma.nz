import { Stack } from 'expo-router'

export default function PracticeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F0F18' },
      }}
    />
  )
}
