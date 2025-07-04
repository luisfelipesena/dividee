import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { env } from '../config/env';
import { authApi } from '../services/api';

// Types
export type AuthCredentials = {
  email: string;
  password: string;
};

export type SignupCredentials = {
  email: string;
  password: string;
  name?: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
};

/**
 * Hook for authentication operations in the mobile app
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const apiUrl = env.apiUrl;
  
  // Get the current user session
  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/auth/session`, {
          withCredentials: true
        });
        return response.data?.user || null;
      } catch (error) {
        console.error('Session fetch error:', error);
        return null;
      }
    },
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: AuthCredentials) => {
      return await authApi.login(credentials.email, credentials.password);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
  
  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      return await authApi.signup(credentials.email, credentials.password, credentials.name);
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await authApi.logout();
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
  
  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading || loginMutation.isPending,
    isAuthenticated: !!userQuery.data,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    signup: signupMutation.mutate,
    signupAsync: signupMutation.mutateAsync,
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
    logoutError: logoutMutation.error,
  };
} 