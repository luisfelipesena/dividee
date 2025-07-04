import { Expense, CreateExpenseRequest } from '@monorepo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { apiClient } from '@/lib/api-client';

// Hooks
export const useUserExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: () => apiClient.getExpenses(),
  });
};

export const useSubscriptionExpenses = (subscriptionId: number) => {
  return useQuery({
    queryKey: ['expenses', 'subscription', subscriptionId],
    queryFn: () => apiClient.getSubscriptionExpenses(subscriptionId),
    enabled: !!subscriptionId,
  });
};

export const useGroupExpenses = (groupId: number) => {
  return useQuery({
    queryKey: ['expenses', 'group', groupId],
    queryFn: () => apiClient.getGroupExpenses(groupId),
    enabled: !!groupId,
  });
};

export const useExpenseSummary = () => {
  return useQuery({
    queryKey: ['expenses', 'summary'],
    queryFn: () => apiClient.getExpenseSummary(),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseData: CreateExpenseRequest) => apiClient.createExpense(expenseData),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Despesa adicionada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['group-details'] });
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível adicionar a despesa.');
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: number) => apiClient.deleteExpense(expenseId),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Despesa removida com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível remover a despesa.');
    },
  });
};
