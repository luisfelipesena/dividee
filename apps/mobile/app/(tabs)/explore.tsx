import { FontAwesome } from '@expo/vector-icons';
import { Subscription } from '@monorepo/types';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import SubscriptionCard from '@/components/SubscriptionCard';
import { View as ThemedView } from '@/components/Themed';
import { Button } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  useJoinSubscription,
  usePublicSubscriptions,
} from '@/hooks/useSubscriptions';

export default function TabExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    data: subscriptions,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = usePublicSubscriptions();

  const joinMutation = useJoinSubscription();

  const handleJoinSubscription = (subscription: Subscription) => {
    const costPerPerson = subscription.cost / (subscription.members + 1);

    Alert.alert(
      'Entrar na Assinatura',
      `Ao entrar em ${subscription.name}, você pagará R$ ${costPerPerson.toFixed(2)} por mês.\n\nDeseja continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => joinMutation.mutate(subscription.id),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Carregando assinaturas...
        </Text>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.centered}>
        <FontAwesome name="exclamation-circle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Erro ao carregar assinaturas
        </Text>
        <Button
          title="Tentar Novamente"
          onPress={() => refetch()}
          variant="outline"
          style={styles.retryButton}
        />
      </ThemedView>
    );
  }

  const renderItem = ({ item }: { item: Subscription }) => {
    const isFull = item.members >= item.maxMembers;

    return (
      <View style={styles.cardContainer}>
        <SubscriptionCard subscription={item} />
        <Button
          title={isFull ? 'Assinatura Cheia' : 'Entrar'}
          onPress={() => handleJoinSubscription(item)}
          disabled={isFull || joinMutation.isPending}
          variant={isFull ? 'outline' : 'primary'}
          fullWidth
          style={styles.joinButton}
          icon="sign-in"
        />
      </View>
    );
  };

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="search" size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Nenhuma assinatura disponível
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Volte mais tarde para ver novas oportunidades
      </Text>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={subscriptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.list,
          subscriptions?.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={EmptyComponent}
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
    paddingBottom: 20,
  },
  emptyList: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  retryButton: {
    marginTop: 16,
  },
  cardContainer: {
    marginBottom: 8,
  },
  joinButton: {
    marginHorizontal: 16,
    marginTop: -4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
