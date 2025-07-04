import { FontAwesome } from '@expo/vector-icons';
import { Subscription } from '@monorepo/types';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  useSubscriptions,
} from '@/hooks/useSubscriptions';

export default function TabExploreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    data: subscriptions,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = usePublicSubscriptions();

  const { data: mySubscriptions } = useSubscriptions();

  const joinMutation = useJoinSubscription();

  const handleJoinSubscription = (subscriptionId: number) => {
    const subscription = subscriptions?.find((s) => s.id === subscriptionId);
    if (!subscription) return;

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
    const isMember = mySubscriptions?.some((s) => s.id === item.id) ?? false;

    return (
      <SubscriptionCard
        subscription={item}
        onJoin={handleJoinSubscription}
        isJoining={joinMutation.isPending && joinMutation.variables === item.id}
        isMember={isMember}
        showActions={true}
      />
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
      <Button
        title="Ver Meus Grupos"
        onPress={() => router.push('/groups')}
        variant="primary"
        style={styles.groupsButton}
        icon="users"
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Explorar Assinaturas
        </Text>
        <TouchableOpacity
          style={[styles.groupsButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/groups')}
        >
          <FontAwesome name="users" size={16} color="white" />
          <Text style={styles.groupsButtonText}>Meus Grupos</Text>
        </TouchableOpacity>
      </View>
      
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  groupsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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
  groupsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
});
