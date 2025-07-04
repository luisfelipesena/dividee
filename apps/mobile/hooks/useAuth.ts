import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

const loginUser = async (credentials: LoginCredentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

const registerUser = async (data: RegisterData) => {
  const { data: response } = await api.post('/auth/register', data);
  return response;
};

export const useLogin = () => {
  const { login } = useAuthStore();
  const router = useRouter();

  return useMutation({
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
};

export const useRegister = () => {
  const { login } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: registerUser,
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
