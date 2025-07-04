import { User } from '@monorepo/types';
import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';

// API functions
const fetchUserProfile = async (): Promise<User> => {
  const { data } = await api.get('/auth/profile');
  return data;
};

const fetchUserStats = async () => {
  const { data: subscriptions } = await api.get('/subscriptions');

  const subscriptionCount = subscriptions.length;
  let totalSavings = 0;

  subscriptions.forEach((sub: any) => {
    const yourCost = sub.cost / sub.members;
    const fullCost = sub.cost;
    totalSavings += fullCost - yourCost;
  });

  return {
    subscriptionCount,
    totalSavings,
  };
};

// Hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
    retry: false,
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: fetchUserStats,
  });
};
