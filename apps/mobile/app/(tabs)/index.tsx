import { FontAwesome } from '@expo/vector-icons';
import { Group, Subscription } from '@monorepo/types';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import SubscriptionCard from '@/components/SubscriptionCard';
import { Button, Card } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useGroups } from '@/hooks/useGroups';
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

  const {
    data: groups,
    isLoading: groupsLoading,
    refetch: refetchGroups,
  } = useGroups();

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
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
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
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push('/(tabs)/explore')}
      >
        <Text style={styles.exploreButtonText}>Explorar Assinaturas</Text>
      </TouchableOpacity>
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

  const renderGroupCard = ({ item }: { item: Group }) => (
    <Card
      style={styles.groupCard}
      onPress={() =>
        router.push({ pathname: '/group/[id]', params: { id: item.id } })
      }
    >
      <View style={styles.groupCardContent}>
        <View style={styles.groupInfo}>
          <FontAwesome name="users" size={20} color={colors.primary} />
          <View style={styles.groupDetails}>
            <Text style={[styles.groupName, { color: colors.text }]}>
              {item.name}
            </Text>
            {item.description && (
              <Text
                style={[
                  styles.groupDescription,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.groupActions}>
          <TouchableOpacity
            style={[
              styles.quickActionButton,
              { backgroundColor: colors.secondary },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              router.push({
                pathname: '/add-expense',
                params: { groupId: item.id.toString() },
              });
            }}
          >
            <FontAwesome name="plus" size={12} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching || groupsLoading}
            onRefresh={() => {
              refetch();
              refetchGroups();
            }}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Savings Card */}
        {subscriptions && subscriptions.length > 0 && (
          <View style={[styles.savingsCard]}>
            <View>
              <Text style={[styles.savingsLabel, { color: colors.text }]}>
                Economia Total Mensal
              </Text>
              <Text style={[styles.savingsAmount, { color: colors.text }]}>
                R$ {totalSavings.toFixed(2)}
              </Text>
            </View>
            <FontAwesome name="bank" size={32} color={colors.text} />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ações Rápidas
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/create-item')}
            >
              <FontAwesome name="plus-circle" size={24} color="white" />
              <Text style={styles.actionText}>Nova Assinatura</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.info }]}
              onPress={() => router.push('/add-expense')}
            >
              <FontAwesome name="credit-card" size={24} color="white" />
              <Text style={styles.actionText}>Adicionar Despesa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.success }]}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <FontAwesome name="search" size={24} color="white" />
              <Text style={styles.actionText}>Explorar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Meus Grupos ({groups?.length || 0})
            </Text>
            <TouchableOpacity
              style={[styles.seeAllButton, { borderColor: colors.border }]}
              onPress={() => router.push('/groups')}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                Ver Todos
              </Text>
            </TouchableOpacity>
          </View>

          {groups && groups.length > 0 ? (
            <FlatList
              data={groups.slice(0, 3)} // Show only first 3 groups
              renderItem={renderGroupCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Card style={styles.emptyGroupsCard}>
              <View style={styles.emptyGroupsContent}>
                <FontAwesome
                  name="users"
                  size={32}
                  color={colors.textTertiary}
                />
                <Text style={[styles.emptyGroupsText, { color: colors.text }]}>
                  Você ainda não participa de nenhum grupo
                </Text>
                <Button
                  title="Criar Grupo"
                  onPress={() => router.push('/create-group')}
                  variant="outline"
                  style={styles.createGroupButton}
                  icon="plus"
                />
              </View>
            </Card>
          )}
        </View>

        {/* Subscriptions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Minhas Assinaturas ({subscriptions?.length || 0})
          </Text>
          {subscriptions && subscriptions.length > 0 ? (
            subscriptions
              .slice(0, 3)
              .map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onPress={() => handleSubscriptionPress(subscription)}
                />
              ))
          ) : (
            <EmptyComponent />
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.secondary }]}
        onPress={() => router.push('/add-expense')}
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
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
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
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  savingsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
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
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  groupCard: {
    padding: 16,
    marginBottom: 8,
  },
  groupCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupDetails: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  groupDescription: {
    fontSize: 14,
  },
  groupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyGroupsCard: {
    padding: 24,
  },
  emptyGroupsContent: {
    alignItems: 'center',
  },
  emptyGroupsText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  createGroupButton: {
    marginTop: 8,
  },
  bottomPadding: {
    height: 24,
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
