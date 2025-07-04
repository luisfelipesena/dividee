import { useAuthStore } from '@/store/auth';
import { useRouter, Link } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

const loginUser = async (credentials: any) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthStore();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(data.token);
      router.replace('/(tabs)');
    },
    onError: (error) => {
      Alert.alert('Erro no Login', 'E-mail ou senha inválidos.');
      console.error(error);
    },
  });

  const handleLogin = () => {
    if (email && password) {
      mutation.mutate({ email, password });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carteira</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={mutation.isPending ? 'Entrando...' : 'Entrar'}
        onPress={handleLogin}
        disabled={mutation.isPending}
      />
      <Link href="/register" style={styles.link}>
        <Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
  },
  linkText: {
    color: '#2f95dc',
  },
}); 