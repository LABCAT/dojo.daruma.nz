import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'

export default function RankUnlock() {
  const router = useRouter()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0A0A0A',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 24,
      }}
    >
      <Text style={{ color: '#C9A84C', fontSize: 24, fontWeight: '700' }}>
        Rank Unlocked!
      </Text>
      <Pressable
        onPress={() => router.replace('/(dojo)')}
        style={{
          borderWidth: 1,
          borderColor: '#2A2A2A',
          borderRadius: 8,
          paddingHorizontal: 24,
          paddingVertical: 12,
        }}
      >
        <Text style={{ color: '#F0EDE8' }}>Continue</Text>
      </Pressable>
    </View>
  )
}
