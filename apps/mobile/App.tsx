import './global.css';
import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthScreen from './src/screens/AuthScreen';
import TestScreen from './src/screens/TestScreen';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [showTest, setShowTest] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="auto" />
        <View className="flex-1">
          <View className="flex-row items-center justify-between p-4">
            <Text className="text-xl font-bold text-blue-500">Dividee</Text>
            <TouchableOpacity 
              className="px-4 py-2 bg-blue-100 rounded-md"
              onPress={() => setShowTest(!showTest)}
            >
              <Text className="text-blue-500">{showTest ? 'Show Auth' : 'Test NativeWind'}</Text>
            </TouchableOpacity>
          </View>
          {showTest ? <TestScreen /> : <AuthScreen />}
        </View>
      </SafeAreaView>
    </QueryClientProvider>
  );
}
