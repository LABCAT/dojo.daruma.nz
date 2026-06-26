import { View } from 'react-native'
import { Text, Button } from '@daruma/ui'

export default function Home() {
  return (
    <View className="flex-1 bg-background justify-center items-center p-4">
      <Text variant="heading" className="mb-4">Multiplication Dojo</Text>
      <Text variant="body" className="mb-6 text-center">
        Welcome to the Multiplication Dojo. Prepare your mind!
      </Text>
      <Button label="Enter Dojo" onPress={() => console.log('Enter')} />
    </View>
  )
}
