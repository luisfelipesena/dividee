import { Subscription } from '@monorepo/types';
import React from 'react';
import { View as DefaultView, Image, StyleSheet, Text } from 'react-native';

import { View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SubscriptionCardProps {
  subscription: Subscription;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
}) => {
  const colorScheme = useColorScheme();
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: subscription.icon || 'https://placehold.co/40' }}
        style={styles.icon}
      />
      <DefaultView style={styles.infoContainer}>
        <Text style={styles.name}>{subscription.name}</Text>
        <Text
          style={[
            styles.details,
            { color: Colors[colorScheme ?? 'light'].gray },
          ]}
        >
          {subscription.members} / {subscription.maxMembers} membros
        </Text>
      </DefaultView>
      <Text style={styles.cost}>R${subscription.cost.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 14,
  },
  cost: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SubscriptionCard;
