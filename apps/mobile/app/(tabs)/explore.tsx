import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Button,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SubscriptionCard from '@/components/SubscriptionCard';
import { View as ThemedView } from '@/components/Themed';
import { Subscription } from '@monorepo/types';
import { api } from '@/lib/api';

const fetchPublicSubscriptions = async (): Promise<Subscription[]> => {
  const { data } = await api.get('/subscriptions/public');
  return data;
};

const joinSubscription = async (subscriptionId: string) => {
  await api.post(`/subscriptions/${subscriptionId}/join`);
};

export default function TabExploreScreen() {
  const queryClient = useQueryClient();
  const {
    data: subscriptions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public-subscriptions'],
    queryFn: fetchPublicSubscriptions,
  });

  const joinMutation = useMutation({
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

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.centered}>
        <Text>Ocorreu um erro ao buscar as assinaturas públicas.</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={subscriptions}
        renderItem={({ item }) => (
          <View>
            <SubscriptionCard subscription={item} />
            <Button title="Entrar" onPress={() => joinMutation.mutate(item.id)} />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 