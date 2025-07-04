import { Group } from '@monorepo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { api } from '@/lib/api';

// API Functions
const fetchGroups = async (): Promise<Group[]> => {
  const { data } = await api.get('/groups');
  return data;
};

const fetchGroupDetails = async (groupId: number): Promise<Group> => {
  const { data } = await api.get(`/groups/${groupId}`);
  return data;
};

const createGroup = async (groupData: {
  name: string;
  description?: string;
}): Promise<Group> => {
  const { data } = await api.post('/groups', groupData);
  return data;
};

const inviteMember = async (groupId: number, email: string) => {
  const { data } = await api.post(`/groups/${groupId}/invite`, { email });
  return data;
};

// Hooks
export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
  });
};

export const useGroupDetails = (groupId: number) => {
  return useQuery({
    queryKey: ['group-details', groupId],
    queryFn: () => fetchGroupDetails(groupId),
    enabled: !!groupId, // Only run query if groupId is available
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
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
