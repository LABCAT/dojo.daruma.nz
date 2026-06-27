import React, { useState } from 'react'
import { SafeAreaView, View } from 'react-native'
import { NumberPad, Text, Button } from '@daruma/ui'

export default function TestPadScreen() {
  const [value, setValue] = useState('')
  const [disabled, setDisabled] = useState(false)

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-6 justify-between">
        <View className="items-center justify-center flex-1">
          <Text className="text-6xl font-bold text-text text-center tracking-widest">
            {value || '0'}
          </Text>
          <View className="mt-8">
            <Button
              onPress={() => setDisabled(!disabled)}
              label={disabled ? "Enable Pad" : "Disable Pad"}
              variant="ghost"
            />
          </View>
        </View>
        <NumberPad value={value} onValueChange={setValue} disabled={disabled} />
      </View>
    </SafeAreaView>
  )
}
