import { FontAwesome } from '@expo/vector-icons';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import { View } from '@/components/Themed';
import { Card } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSubscriptions } from '@/hooks/useSubscriptions';

export default function TabFinancialsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    data: subscriptions,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useSubscriptions();

  const calculateFinancials = () => {
    if (!subscriptions || subscriptions.length === 0) {
      return {
        totalMonthly: 0,
        totalSavings: 0,
        averageSaving: 0,
        subscriptionCount: 0,
      };
    }

    let totalMonthly = 0;
    let totalSavings = 0;

    subscriptions.forEach((sub) => {
      const yourCost = sub.cost / sub.members;
      const fullCost = sub.cost;
      totalMonthly += yourCost;
      totalSavings += fullCost - yourCost;
    });

    return {
      totalMonthly,
      totalSavings,
      averageSaving: totalSavings / subscriptions.length,
      subscriptionCount: subscriptions.length,
    };
  };

  const financials = calculateFinancials();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Carregando dados financeiros...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <FontAwesome name="exclamation-circle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Erro ao carregar dados
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Dashboard Financeiro
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Acompanhe seus gastos e economias
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.cardsRow}>
        <Card variant="elevated" style={styles.summaryCard}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.primary + '20' },
            ]}
          >
            <FontAwesome name="money" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            Gasto Mensal
          </Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>
            R$ {financials.totalMonthly.toFixed(2)}
          </Text>
        </Card>

        <Card variant="elevated" style={styles.summaryCard}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.secondary + '20' },
            ]}
          >
            <FontAwesome name="bank" size={24} color={colors.secondary} />
          </View>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            Economia Mensal
          </Text>
          <Text style={[styles.cardValue, { color: colors.secondary }]}>
            R$ {financials.totalSavings.toFixed(2)}
          </Text>
        </Card>
      </View>

      {/* Statistics */}
      <Card variant="filled" style={styles.statsCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Estatísticas
        </Text>

        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Assinaturas Ativas
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {financials.subscriptionCount}
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Economia Média
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              R$ {financials.averageSaving.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={[styles.progressContainer, { marginTop: 20 }]}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            Porcentagem de Economia
          </Text>
          <View
            style={[styles.progressBar, { backgroundColor: colors.surface }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.secondary,
                  width: `${financials.totalMonthly > 0 ? (financials.totalSavings / (financials.totalMonthly + financials.totalSavings)) * 100 : 0}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.secondary }]}>
            {financials.totalMonthly > 0
              ? `${Math.round((financials.totalSavings / (financials.totalMonthly + financials.totalSavings)) * 100)}% economizado`
              : '0% economizado'}
          </Text>
        </View>
      </Card>

      {/* Subscriptions Breakdown */}
      <Card variant="elevated" style={styles.breakdownCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Detalhamento por Assinatura
        </Text>

        {subscriptions &&
          subscriptions.map((sub) => {
            const yourCost = sub.cost / sub.members;
            const saving = sub.cost - yourCost;

            return (
              <View key={sub.id} style={styles.breakdownItem}>
                <View style={styles.breakdownInfo}>
                  <Text style={[styles.breakdownName, { color: colors.text }]}>
                    {sub.name}
                  </Text>
                  <Text
                    style={[
                      styles.breakdownMembers,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {sub.members}/{sub.maxMembers} membros
                  </Text>
                </View>
                <View style={styles.breakdownValues}>
                  <Text style={[styles.breakdownCost, { color: colors.text }]}>
                    R$ {yourCost.toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.breakdownSaving,
                      { color: colors.secondary },
                    ]}
                  >
                    ↓ R$ {saving.toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })}
      </Card>

      {/* Annual Projection */}
      <Card
        variant="filled"
        style={[styles.projectionCard, { marginBottom: 100 }]}
      >
        <FontAwesome name="line-chart" size={24} color={colors.info} />
        <Text style={[styles.projectionTitle, { color: colors.text }]}>
          Projeção Anual
        </Text>
        <Text style={[styles.projectionValue, { color: colors.info }]}>
          R$ {(financials.totalSavings * 12).toFixed(2)}
        </Text>
        <Text style={[styles.projectionLabel, { color: colors.textSecondary }]}>
          de economia em 12 meses
        </Text>
      </Card>
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
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statsCard: {
    margin: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  breakdownCard: {
    margin: 16,
    marginTop: 0,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownName: {
    fontSize: 16,
    fontWeight: '500',
  },
  breakdownMembers: {
    fontSize: 12,
    marginTop: 2,
  },
  breakdownValues: {
    alignItems: 'flex-end',
  },
  breakdownCost: {
    fontSize: 16,
    fontWeight: '600',
  },
  breakdownSaving: {
    fontSize: 12,
    marginTop: 2,
  },
  projectionCard: {
    margin: 16,
    alignItems: 'center',
    paddingVertical: 24,
  },
  projectionTitle: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  projectionValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  projectionLabel: {
    fontSize: 14,
    marginTop: 4,
  },
});
