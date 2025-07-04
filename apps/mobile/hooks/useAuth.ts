import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { LoginRequest, RegisterRequest } from '@monorepo/types';

import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth';

export const useLogin = () => {
  const { login } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => apiClient.login(credentials),
    onSuccess: (data) => {
      login(data.token);
      router.replace('/(tabs)');
    },
    onError: (error) => {
      Alert.alert('Erro no Login', 'E-mail ou senha inválidos.');
      console.error(error);
    },
  });
};

export const useRegister = () => {
  const { login } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (userData: RegisterRequest) => apiClient.register(userData),
    onSuccess: (data) => {
      login(data.token);
      router.replace('/(tabs)');
    },
    onError: (error) => {
      Alert.alert('Erro no Cadastro', 'Não foi possível criar sua conta.');
      console.error(error);
    },
  });
};
