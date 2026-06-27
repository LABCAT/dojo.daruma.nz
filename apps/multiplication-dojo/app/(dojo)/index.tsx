import { SafeAreaView } from 'react-native-safe-area-context'
import { View } from 'react-native'
import { Text } from '@daruma/ui'

export default function DojoIndex() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-4">
        <Text variant="heading" className="mb-2">
          Dojo Mode
        </Text>
        <Text variant="muted">Coming in Prompt 02</Text>
      </View>
    </SafeAreaView>
  )
}
