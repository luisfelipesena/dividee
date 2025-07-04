import { FlatList, StyleSheet, Text, View as DefaultView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import SubscriptionCard from '@/components/SubscriptionCard';
import { View } from '@/components/Themed';
import { Subscription } from '@monorepo/types';
import { api } from '@/lib/api';

const fetchSubscriptions = async (): Promise<Subscription[]> => {
  const { data } = await api.get('/subscriptions');
  return data;
};

export default function TabHomeScreen() {
  const {
    data: subscriptions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: fetchSubscriptions,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text>Ocorreu um erro ao buscar as assinaturas.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={subscriptions}
        renderItem={({ item }) => <SubscriptionCard subscription={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
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
