import { FontAwesome } from '@expo/vector-icons';
import { Subscription } from '@monorepo/types';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import SubscriptionCard from '@/components/SubscriptionCard';
import { View } from '@/components/Themed';
import { Button } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSubscriptions } from '@/hooks/useSubscriptions';

export default function TabHomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    data: subscriptions,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useSubscriptions();

  const handleSubscriptionPress = (subscription: Subscription) => {
    // Navigate to subscription details (to be implemented)
    console.log('Navigate to subscription:', subscription.id);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Carregando suas assinaturas...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
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
      </View>
    );
  }

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="folder-open" size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Nenhuma assinatura ainda
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Comece criando ou participando de uma assinatura compartilhada
      </Text>
      <Button
        title="Explorar Assinaturas"
        onPress={() => router.push('/(tabs)/explore')}
        variant="primary"
        style={styles.exploreButton}
        icon="compass"
      />
    </View>
  );

  const calculateTotalSavings = () => {
    if (!subscriptions || subscriptions.length === 0) return 0;

    return subscriptions.reduce((total, sub) => {
      const fullCost = (sub.cost * sub.maxMembers) / sub.members;
      const yourCost = sub.cost / sub.members;
      return total + (fullCost - yourCost);
    }, 0);
  };

  const totalSavings = calculateTotalSavings();

  return (
    <View style={styles.container}>
      {subscriptions && subscriptions.length > 0 && (
        <View
          style={[styles.savingsCard, { backgroundColor: colors.secondary }]}
        >
          <View>
            <Text style={[styles.savingsLabel, { color: colors.textInverse }]}>
              Economia Total Mensal
            </Text>
            <Text style={[styles.savingsAmount, { color: colors.textInverse }]}>
              R$ {totalSavings.toFixed(2)}
            </Text>
          </View>
          <FontAwesome name="bank" size={32} color={colors.textInverse} />
        </View>
      )}

      <FlatList
        data={subscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            subscription={item}
            onPress={() => handleSubscriptionPress(item)}
          />
        )}
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

      {/* FAB for creating subscriptions */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/create-item')}
        activeOpacity={0.8}
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingTop: 10,
    paddingBottom: 80,
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
    marginBottom: 24,
  },
  exploreButton: {
    marginTop: 16,
  },
  savingsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
  },
  savingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  savingsAmount: {
    fontSize: 28,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
