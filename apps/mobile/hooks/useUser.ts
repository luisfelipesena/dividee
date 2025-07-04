import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';

// Hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => apiClient.getUserProfile(),
    retry: false,
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => apiClient.getUserStats(),
  });
};
