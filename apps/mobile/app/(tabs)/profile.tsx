import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserProfile, useUserStats } from '@/hooks/useUser';
import { useAuthStore } from '@/store/auth';

export default function TabProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { logout } = useAuthStore();
  const router = useRouter();

  const {
    data: userProfile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useUserProfile();
  const { data: userStats, isLoading: statsLoading } = useUserStats();

  const handleLogout = () => {
    Alert.alert('Sair da Conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: 'users',
      title: 'Meus Grupos',
      onPress: () => router.push('/groups'),
    },
    {
      icon: 'bell',
      title: 'Notificações',
      onPress: () => console.log('Navigate to notifications'),
    },
    {
      icon: 'lock',
      title: 'Segurança',
      onPress: () => console.log('Navigate to security'),
    },
    {
      icon: 'question-circle',
      title: 'Ajuda e Suporte',
      onPress: () => console.log('Navigate to help'),
    },
    {
      icon: 'info-circle',
      title: 'Sobre',
      onPress: () => console.log('Navigate to about'),
    },
  ];

  const iconColors = ['#4f46e5', '#10b981', '#3b82f6', '#f59e0b', '#6b7280'];

  if (profileLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <FontAwesome name="exclamation-circle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Erro ao carregar perfil
        </Text>
        <Button
          title="Tentar Novamente"
          onPress={() => refetchProfile()}
          variant="outline"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <FontAwesome name="user" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.name, { color: colors.text }]}>
          {userProfile?.fullName || 'Carregando...'}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {userProfile?.email || ''}
        </Text>
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {userStats?.subscriptionCount || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Assinaturas
          </Text>
        </View>
        <View style={styles.statSeparator} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            R$ {userStats?.totalSavings?.toFixed(2) || '0.00'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Economia Total
          </Text>
        </View>
      </View>

      <View style={styles.memberInfo}>
        <FontAwesome name="calendar" size={16} color={colors.textSecondary} />
        <Text style={[styles.memberText, { color: colors.textSecondary }]}>
          Membro desde{' '}
          {userProfile?.createdAt
            ? new Date(userProfile.createdAt).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
              })
            : '...'}
        </Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${iconColors[index]}20` },
              ]}
            >
              <FontAwesome
                name={item.icon as any}
                size={18}
                color={iconColors[index]}
              />
            </View>
            <Text style={[styles.menuTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <FontAwesome
              name="chevron-right"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logoutContainer}>
        <Button
          title="Sair da Conta"
          onPress={handleLogout}
          variant="danger"
          icon="sign-out"
        />
      </View>

      <Text style={[styles.version, { color: colors.textTertiary }]}>
        Versão 1.0.0
      </Text>
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
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9ca3af20',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 24,
    borderRadius: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#ffffff1a',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
  },
  statSeparator: {
    width: 1,
    height: '100%',
    backgroundColor: '#ffffff1a',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    gap: 8,
  },
  memberText: {
    fontSize: 14,
  },
  menuContainer: {
    marginHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#ffffff08',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  logoutContainer: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 32,
  },
});
