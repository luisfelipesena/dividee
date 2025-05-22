import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  
  const auth = useAuth();
  
  // Check if user is already logged in
  useEffect(() => {
    if (auth.user) {
      Alert.alert('Info', `Logged in as ${auth.user.email}`);
    }
  }, [auth.user]);
  
  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    try {
      if (isLogin) {
        await auth.loginAsync({ email, password });
        Alert.alert('Success', 'Logged in successfully');
      } else {
        const response = await auth.signupAsync({ email, password });
        Alert.alert('Success', response.message || 'Signed up successfully');
      }
      
      // Clear form after successful submission
      setEmail('');
      setPassword('');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
    }
  };
  
  const handleLogout = async () => {
    try {
      await auth.logoutAsync();
      Alert.alert('Success', 'Logged out successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred during logout');
    }
  };
  
  return (
    <View className="items-center justify-center flex-1 p-6 bg-white">
      <Text className="mb-6 text-2xl font-bold text-blue-500">
        {isLogin ? 'Login' : 'Sign Up'}
      </Text>
      
      {auth.isAuthenticated && (
        <Text className="mb-4 text-green-500">
          Logged in as: {auth.user?.email}
        </Text>
      )}
      
      <TextInput
        className="w-full h-12 px-4 mb-4 border border-gray-300 rounded-md"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        className="w-full h-12 px-4 mb-6 border border-gray-300 rounded-md"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        className="items-center justify-center w-full h-12 mb-4 bg-blue-500 rounded-md"
        onPress={handleSubmit}
        disabled={auth.isLoading}
      >
        {auth.isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="font-bold text-white">
            {isLogin ? 'Login' : 'Sign Up'}
          </Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="items-center justify-center w-full h-12 mb-6 border border-blue-500 rounded-md"
        onPress={() => setIsLogin(!isLogin)}
        disabled={auth.isLoading}
      >
        <Text className="font-bold text-blue-500">
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        className="items-center justify-center w-full h-12 bg-red-500 rounded-md"
        onPress={handleLogout}
        disabled={auth.isLoading || !auth.isAuthenticated}
      >
        <Text className="font-bold text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
} 