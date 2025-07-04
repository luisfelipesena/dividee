import { Subscription } from '@monorepo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { api } from '@/lib/api';

// API functions
const fetchSubscriptions = async (): Promise<Subscription[]> => {
  const { data } = await api.get('/subscriptions');
  return data;
};

const fetchPublicSubscriptions = async (): Promise<Subscription[]> => {
  const { data } = await api.get('/subscriptions/public');
  return data;
};

const joinSubscription = async (subscriptionId: number) => {
  await api.post(`/subscriptions/${subscriptionId}/join`);
};

const createSubscription = async (subscriptionData: {
  name: string;
  iconUrl?: string;
  totalCost: number;
  maxMembers: number;
  isPublic: boolean;
  groupId?: number;
}) => {
  const { data } = await api.post('/subscriptions', subscriptionData);
  return data;
};

// Hooks
export const useSubscriptions = () => {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: fetchSubscriptions,
  });
};

export const usePublicSubscriptions = () => {
  return useQuery({
    queryKey: ['public-subscriptions'],
    queryFn: fetchPublicSubscriptions,
  });
};

export const useJoinSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinSubscription,
    onSuccess: () => {
      Alert.alert('Sucesso', 'Você entrou na assinatura!');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['public-subscriptions'] });
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível entrar na assinatura.');
    },
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      Alert.alert('Sucesso', 'Assinatura criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível criar a assinatura.');
    },
  });
};
