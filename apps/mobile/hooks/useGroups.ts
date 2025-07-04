import { Group, CreateGroupRequest } from '@monorepo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { apiClient } from '@/lib/api-client';
import { api } from '@/lib/api';

const inviteMember = async (groupId: number, email: string) => {
  const { data } = await api.post(`/groups/${groupId}/invite`, { email });
  return data;
};

// Hooks
export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => apiClient.getGroups(),
  });
};

export const useGroupDetails = (groupId: number) => {
  return useQuery({
    queryKey: ['group-details', groupId],
    queryFn: () => apiClient.getGroup(groupId),
    enabled: !!groupId, // Only run query if groupId is available
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupData: CreateGroupRequest) => apiClient.createGroup(groupData),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Grupo criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível criar o grupo.');
    },
  });
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, email }: { groupId: number; email: string }) =>
      inviteMember(groupId, email),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Convite enviado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['group-details'] });
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível enviar o convite.');
    },
  });
};
