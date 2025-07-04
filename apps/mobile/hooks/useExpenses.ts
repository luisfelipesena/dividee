import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { api } from '@/lib/api';

interface Expense {
  id: number;
  subscriptionId: number;
  userId: number;
  description: string;
  amount: number;
  category?: string;
  date: string;
  createdAt: string;
  user?: {
    id: number;
    fullName: string;
  };
  subscription?: {
    id: number;
    name: string;
  };
}

interface ExpenseSummary {
  totalAmount: number;
  totalCount: number;
  bySubscription: Array<{
    subscriptionId: number;
    subscriptionName: string;
    totalAmount: number;
    count: number;
  }>;
  byCategory: Array<{
    category: string;
    totalAmount: number;
    count: number;
  }>;
}

interface CreateExpenseData {
  subscriptionId: number;
  description: string;
  amount: number;
  category?: string;
  date?: string;
}

// API functions
const fetchUserExpenses = async (): Promise<Expense[]> => {
  const { data } = await api.get('/expenses');
  return data;
};

const fetchSubscriptionExpenses = async (subscriptionId: number): Promise<Expense[]> => {
  const { data } = await api.get(`/expenses/subscription/${subscriptionId}`);
  return data;
};

const fetchExpenseSummary = async (): Promise<ExpenseSummary> => {
  const { data } = await api.get('/expenses/summary');
  return data;
};

const createExpense = async (expenseData: CreateExpenseData): Promise<Expense> => {
  const { data } = await api.post('/expenses', expenseData);
  return data;
};

const deleteExpense = async (expenseId: number): Promise<void> => {
  await api.delete(`/expenses/${expenseId}`);
};

// Hooks
export const useUserExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: fetchUserExpenses,
  });
};

export const useSubscriptionExpenses = (subscriptionId: number) => {
  return useQuery({
    queryKey: ['expenses', 'subscription', subscriptionId],
    queryFn: () => fetchSubscriptionExpenses(subscriptionId),
    enabled: !!subscriptionId,
  });
};

export const useExpenseSummary = () => {
  return useQuery({
    queryKey: ['expenses', 'summary'],
    queryFn: fetchExpenseSummary,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      Alert.alert('Sucesso', 'Despesa adicionada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível adicionar a despesa.');
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      Alert.alert('Sucesso', 'Despesa removida com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível remover a despesa.');
    },
  });
};