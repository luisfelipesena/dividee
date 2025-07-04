import { FontAwesome } from '@expo/vector-icons';
import { Expense as ExpenseType, Subscription } from '@monorepo/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { Card } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useGroupExpenses } from '@/hooks/useExpenses';
import { useGroupDetails } from '@/hooks/useGroups';

export default function GroupExpensesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const groupId = parseInt(id as string, 10);
  const { data: group } = useGroupDetails(groupId);

  const {
    data: allExpenses = [],
    isLoading,
    isError,
    refetch,
  } = useGroupExpenses(groupId);

  const renderExpense = ({ item }: { item: ExpenseType }) => {
    const subscription = group?.subscriptions?.find(
      (sub: Subscription) => sub.id === item.subscriptionId
    );
    const splitAmount =
      item.participants && item.participants.length > 0
        ? item.amount / item.participants.length
        : item.amount;

    return (
      <Card style={styles.expenseCard}>
        <View style={styles.expenseHeader}>
          <View style={styles.expenseInfo}>
            <Text style={[styles.expenseDescription, { color: colors.text }]}>
              {item.description}
            </Text>
            <Text style={[styles.expenseSubscription, { color: colors.tint }]}>
              {subscription?.name || 'Assinatura desconhecida'}
            </Text>
            <Text style={[styles.expenseUser, { color: colors.tint }]}>
              Por: {item.user?.fullName || 'Usuário desconhecido'}
            </Text>
          </View>
          <View style={styles.expenseAmount}>
            <Text style={[styles.amountValue, { color: colors.error }]}>
              R$ {item.amount.toFixed(2)}
            </Text>
            {item.participants && item.participants.length > 1 && (
              <Text
                style={[styles.splitAmount, { color: colors.textSecondary }]}
              >
                (R$ {splitAmount.toFixed(2)} / pessoa)
              </Text>
            )}
            {item.category && (
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {item.category}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.expenseFooter}>
          <Text style={[styles.expenseDate, { color: colors.tint }]}>
            {new Date(item.date).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        {item.participants && item.participants.length > 0 && (
          <View style={styles.participantsContainer}>
            <Text
              style={[
                styles.participantsTitle,
                { color: colors.textSecondary },
              ]}
            >
              Participantes:
            </Text>
            <View style={styles.participantsList}>
              {item.participants.map((p, index) => (
                <Text
                  key={p.id}
                  style={[styles.participantName, { color: colors.text }]}
                >
                  {p.fullName}
                  {item.participants && index < item.participants.length - 1
                    ? ', '
                    : ''}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Card>
    );
  };

  const calculateSummary = () => {
    const totalAmount = allExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const expensesByCategory = allExpenses.reduce(
      (acc, expense) => {
        const category = expense.category || 'Outros';
        acc[category] = (acc[category] || 0) + expense.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    const expensesByUser = allExpenses.reduce(
      (acc, expense) => {
        const userName = expense.user?.fullName || 'Usuário desconhecido';
        acc[userName] = (acc[userName] || 0) + expense.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalAmount,
      totalCount: allExpenses.length,
      byCategory: Object.entries(expensesByCategory).map(
        ([category, amount]) => ({
          category,
          amount,
        })
      ),
      byUser: Object.entries(expensesByUser).map(([user, amount]) => ({
        user,
        amount,
      })),
    };
  };

  const summary = calculateSummary();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.tint }]}>
          Carregando despesas...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <FontAwesome name="exclamation-circle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Erro ao carregar despesas
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Despesas do Grupo
        </Text>
        <Text style={[styles.subtitle, { color: colors.tint }]}>
          {group?.name}
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: colors.tint }]}>
            Total Gasto
          </Text>
          <Text style={[styles.summaryValue, { color: colors.error }]}>
            R$ {summary.totalAmount.toFixed(2)}
          </Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: colors.tint }]}>
            Despesas
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {summary.totalCount}
          </Text>
        </Card>
      </View>

      {/* Expenses by Category */}
      {summary.byCategory.length > 0 && (
        <Card style={styles.breakdownCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Por Categoria
          </Text>
          {summary.byCategory.map((item) => (
            <View key={item.category} style={styles.breakdownItem}>
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>
                {item.category}
              </Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                R$ {item.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Expenses by User */}
      {summary.byUser.length > 0 && (
        <Card style={styles.breakdownCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Por Membro
          </Text>
          {summary.byUser.map((item) => (
            <View key={item.user} style={styles.breakdownItem}>
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>
                {item.user}
              </Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                R$ {item.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Expenses List */}
      <Card style={styles.expensesCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Histórico de Despesas
        </Text>
        {allExpenses.length > 0 ? (
          <FlatList
            data={allExpenses as ExpenseType[]}
            renderItem={renderExpense}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="folder-open" size={48} color={colors.tint} />
            <Text style={[styles.emptyText, { color: colors.tint }]}>
              Nenhuma despesa registrada ainda
            </Text>
          </View>
        )}
      </Card>

      {/* FAB for adding expense */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.secondary }]}
        onPress={() =>
          router.push({
            pathname: '/add-expense',
            params: { groupId: groupId.toString() },
          })
        }
        activeOpacity={0.8}
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>
    </ScrollView>
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
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  breakdownCard: {
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  breakdownLabel: {
    fontSize: 14,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  expensesCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  expenseCard: {
    padding: 12,
    marginBottom: 8,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseSubscription: {
    fontSize: 14,
    marginBottom: 2,
  },
  expenseUser: {
    fontSize: 12,
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  splitAmount: {
    fontSize: 12,
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  expenseFooter: {
    alignItems: 'flex-end',
  },
  expenseDate: {
    fontSize: 12,
  },
  participantsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  participantsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  participantName: {
    fontSize: 12,
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
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
