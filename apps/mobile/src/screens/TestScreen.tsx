import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function TestScreen() {
  return (
    <View className="flex-1 items-center justify-center p-4 bg-gray-100">
      <Text className="text-2xl font-bold text-blue-500 mb-4">NativeWind Test</Text>
      
      <View className="w-full bg-white p-6 rounded-lg shadow-md mb-4">
        <Text className="text-lg text-gray-800 mb-2">This is a card with NativeWind styles</Text>
        <Text className="text-sm text-gray-600">If you can see colors and styling, it's working!</Text>
      </View>
      
      <TouchableOpacity 
        className="bg-green-500 py-3 px-6 rounded-full"
        onPress={() => alert('NativeWind is working!')}
      >
        <Text className="text-white font-bold">Test Button</Text>
      </TouchableOpacity>
    </View>
  );
} 