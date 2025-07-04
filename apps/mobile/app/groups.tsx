import { FontAwesome } from '@expo/vector-icons';
import { Group } from '@monorepo/types';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { View } from '@/components/Themed';
import { Card } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useGroups } from '@/hooks/useGroups';

export default function GroupsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { data: groups, isLoading, isError, refetch } = useGroups();

  const renderGroupCard = ({ item }: { item: Group }) => (
    <Card
      style={styles.groupCard}
      onPress={() =>
        router.push({ pathname: '/group/[id]', params: { id: item.id } })
      }
    >
      <View style={styles.cardContent}>
        <FontAwesome name="users" size={24} color={colors.primary} />
        <Text style={[styles.groupName, { color: colors.text }]}>
          {item.name}
        </Text>
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

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        renderItem={renderGroupCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListHeaderComponent={() => (
          <Text style={[styles.title, { color: colors.text }]}>
            Meus Grupos
          </Text>
        )}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text>Você ainda não participa de nenhum grupo.</Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/create-group')}
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
  },
  list: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  groupCard: {
    padding: 20,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 18,
    marginLeft: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});
