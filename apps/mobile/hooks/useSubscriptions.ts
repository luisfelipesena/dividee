import { CreateSubscriptionFormData, Subscription } from '@monorepo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { apiClient } from '@/lib/api-client';

// Hooks
export const useSubscriptions = () => {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => apiClient.getSubscriptions(),
  });
};

export const usePublicSubscriptions = () => {
  return useQuery({
    queryKey: ['public-subscriptions'],
    queryFn: () => apiClient.getPublicSubscriptions(),
  });
};

export const useJoinSubscription = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: number) => apiClient.joinSubscription(subscriptionId),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Você entrou na assinatura!');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['public-subscriptions'] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      Alert.alert('Erro', 'Não foi possível entrar na assinatura.');
      options?.onError?.(error);
    },
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionData: CreateSubscriptionFormData) => apiClient.createSubscriptionFromForm(subscriptionData),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Assinatura criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível criar a assinatura.');
    },
  });
};
