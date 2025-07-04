import { FontAwesome } from '@expo/vector-icons';
import { GroupMember, Subscription } from '@monorepo/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
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
import { useGroupDetails, useInviteMember } from '@/hooks/useGroups';

interface GroupSubscription extends Subscription {
  members: number;
}

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const groupId = parseInt(id as string, 10);
  const { data: group, isLoading, isError, refetch } = useGroupDetails(groupId);

  const inviteMemberMutation = useInviteMember();

  const handleInviteMember = () => {
    Alert.prompt(
      'Convidar Membro',
      'Digite o email do membro que você deseja convidar:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Convidar',
          onPress: (email) => {
            if (email && email.trim()) {
              inviteMemberMutation.mutate({ groupId, email: email.trim() });
            }
          },
        },
      ],
      'plain-text',
      '',
      'email-address'
    );
  };

  const renderMember = ({ item }: { item: GroupMember }) => (
    <Card style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <FontAwesome
          name={item.role === 'admin' ? 'star' : 'user'}
          size={20}
          color={item.role === 'admin' ? colors.primary : colors.text}
        />
        <View style={styles.memberDetails}>
          <Text style={[styles.memberName, { color: colors.text }]}>
            {item.fullName}
          </Text>
          <Text style={[styles.memberEmail, { color: colors.tint }]}>
            {item.email}
          </Text>
        </View>
        {item.role === 'admin' && (
          <View
            style={[styles.adminBadge, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.adminText}>Admin</Text>
          </View>
        )}
      </View>
    </Card>
  );

  const renderSubscription = ({ item }: { item: GroupSubscription }) => (
    <Card style={styles.subscriptionCard}>
      <View style={styles.subscriptionInfo}>
        <FontAwesome name="play-circle" size={24} color={colors.primary} />
        <View style={styles.subscriptionDetails}>
          <Text style={[styles.subscriptionName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.subscriptionCost, { color: colors.tint }]}>
            R$ {item.cost.toFixed(2)}/mês
          </Text>
          <Text style={[styles.subscriptionMembers, { color: colors.tint }]}>
            {item.members}/{item.maxMembers} membros
          </Text>
        </View>
        <View style={styles.subscriptionActions}>
          {item.isPublic && (
            <View
              style={[styles.publicBadge, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.publicText}>Público</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !group) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Erro ao carregar detalhes do grupo
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
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.groupName, { color: colors.text }]}>
          {group.name}
        </Text>
        {group.description && (
          <Text style={[styles.groupDescription, { color: colors.tint }]}>
            {group.description}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Membros ({group.members?.length || 0})
          </Text>
          <TouchableOpacity
            style={[styles.inviteButton, { backgroundColor: colors.primary }]}
            onPress={handleInviteMember}
          >
            <FontAwesome name="plus" size={16} color="white" />
            <Text style={styles.inviteButtonText}>Convidar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={group.members || []}
          renderItem={renderMember}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Assinaturas ({group.subscriptions?.length || 0})
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.smallButton, { backgroundColor: colors.info }]}
              onPress={() =>
                router.push({
                  pathname: '/group-expenses/[id]',
                  params: { id: groupId.toString() },
                })
              }
            >
              <FontAwesome name="bar-chart" size={14} color="white" />
              <Text style={styles.smallButtonText}>Despesas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.smallButton,
                { backgroundColor: colors.secondary },
              ]}
              onPress={() =>
                router.push({
                  pathname: '/add-expense',
                  params: { groupId: groupId.toString() },
                })
              }
            >
              <FontAwesome name="plus" size={14} color="white" />
              <Text style={styles.smallButtonText}>Gasto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton, { backgroundColor: colors.primary }]}
              onPress={() =>
                router.push({
                  pathname: '/create-subscription',
                  params: { groupId: groupId.toString() },
                })
              }
            >
              <FontAwesome name="plus" size={14} color="white" />
              <Text style={styles.smallButtonText}>Assinatura</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={(group.subscriptions as GroupSubscription[]) || []}
          renderItem={renderSubscription}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.tint }]}>
                Nenhuma assinatura encontrada
              </Text>
            </View>
          )}
        />
      </View>
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
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  inviteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  smallButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  memberCard: {
    padding: 16,
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberDetails: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adminText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  subscriptionCard: {
    padding: 16,
    marginBottom: 8,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subscriptionCost: {
    fontSize: 14,
    marginBottom: 2,
  },
  subscriptionMembers: {
    fontSize: 12,
  },
  subscriptionActions: {
    alignItems: 'flex-end',
  },
  publicBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  publicText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
