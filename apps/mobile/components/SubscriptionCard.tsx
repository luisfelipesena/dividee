import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Subscription } from '@monorepo/types';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress?: () => void;
  showActions?: boolean;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onPress,
  showActions = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const membersPercentage =
    (subscription.members / subscription.maxMembers) * 100;
  const costPerMember = subscription.cost / subscription.maxMembers;
  const yourCost = subscription.cost / subscription.members;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          shadowColor: colors.shadowColor,
          borderColor: colors.borderLight,
        },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.surfaceLight },
          ]}
        >
          {subscription.icon ? (
            <Image source={{ uri: subscription.icon }} style={styles.icon} />
          ) : (
            <FontAwesome name="cube" size={24} color={colors.primary} />
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: colors.text }]}>
            {subscription.name}
          </Text>
          <View style={styles.membersContainer}>
            <FontAwesome name="users" size={12} color={colors.textSecondary} />
            <Text style={[styles.membersText, { color: colors.textSecondary }]}>
              {subscription.members} de {subscription.maxMembers} membros
            </Text>
          </View>
        </View>
        {showActions && (
          <TouchableOpacity style={styles.moreButton}>
            <FontAwesome
              name="ellipsis-v"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.costContainer}>
        <View style={styles.costItem}>
          <Text style={[styles.costLabel, { color: colors.textTertiary }]}>
            Valor Total
          </Text>
          <Text style={[styles.costValue, { color: colors.text }]}>
            R$ {subscription.cost.toFixed(2)}
          </Text>
        </View>
        <View
          style={[styles.costDivider, { backgroundColor: colors.border }]}
        />
        <View style={styles.costItem}>
          <Text style={[styles.costLabel, { color: colors.textTertiary }]}>
            Por Pessoa
          </Text>
          <Text style={[styles.costValue, { color: colors.primary }]}>
            R$ {yourCost.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View
          style={[styles.progressBar, { backgroundColor: colors.surfaceLight }]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${membersPercentage}%`,
                backgroundColor:
                  membersPercentage > 80 ? colors.warning : colors.secondary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {Math.round(membersPercentage)}% ocupado
        </Text>
      </View>

      {costPerMember < yourCost && (
        <View
          style={[
            styles.savingsBadge,
            { backgroundColor: colors.secondary + '20' },
          ]}
        >
          <FontAwesome name="tag" size={12} color={colors.secondary} />
          <Text style={[styles.savingsText, { color: colors.secondary }]}>
            Economia de R$ {(yourCost - costPerMember).toFixed(2)} com mais
            membros
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersText: {
    fontSize: 12,
    marginLeft: 6,
  },
  moreButton: {
    padding: 8,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  costItem: {
    flex: 1,
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  costValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  costDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default SubscriptionCard;
