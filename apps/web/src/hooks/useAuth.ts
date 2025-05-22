import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { env } from '@/config/env';

// Types
export type AuthCredentials = {
  email: string;
  password: string;
};

export type User = {
  id: string;
  email: string;
};

/**
 * Hook for authentication operations
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const apiUrl = env.apiUrl;
  
  // Get the current user session
  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}/api/auth/session`);
      return response.data?.user || null;
    },
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: AuthCredentials) => {
      const response = await axios.post(`${apiUrl}/api/auth/login`, credentials);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
  
  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (credentials: AuthCredentials) => {
      const response = await axios.post(`${apiUrl}/api/auth/signup`, credentials);
      return response.data;
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${apiUrl}/api/auth/logout`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
  
  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
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