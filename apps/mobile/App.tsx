import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthScreen from './src/screens/AuthScreen';
import 'nativewind';

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
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="auto" />
        <View className="flex-1">
          <Text className="p-4 text-xl font-bold text-center text-blue-500">Dividee</Text>
          <AuthScreen />
        </View>
      </SafeAreaView>
    </QueryClientProvider>
  );
}
