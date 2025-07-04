import { useRouter, Link } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

const registerUser = async (credentials: any) => {
  const { data } = await api.post('/auth/register', credentials);
  return data;
};

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      Alert.alert('Sucesso!', 'Sua conta foi criada. Faça o login para continuar.');
      router.push('/login');
    },
    onError: (error) => {
      Alert.alert('Erro no Cadastro', 'Não foi possível criar a conta. Verifique os dados e tente novamente.');
      console.error(error);
    },
  });

  const handleRegister = () => {
    if (fullName && email && password) {
      mutation.mutate({ fullName, email, password });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome Completo"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />
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
        title={mutation.isPending ? 'Criando...' : 'Criar Conta'}
        onPress={handleRegister}
        disabled={mutation.isPending}
      />
      <Link href="/login" style={styles.link}>
        <Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
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