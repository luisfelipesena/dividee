import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { View } from '@/components/Themed';
import { Button, Card } from '@/components/ui';
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
      subtitle: 'Gerencie seus grupos',
      onPress: () => console.log('Navigate to groups'),
    },
    {
      icon: 'bell',
      title: 'Notificações',
      subtitle: 'Configure suas preferências',
      onPress: () => console.log('Navigate to notifications'),
    },
    {
      icon: 'lock',
      title: 'Segurança',
      subtitle: 'Senha e autenticação',
      onPress: () => console.log('Navigate to security'),
    },
    {
      icon: 'question-circle',
      title: 'Ajuda e Suporte',
      subtitle: 'FAQ e contato',
      onPress: () => console.log('Navigate to help'),
    },
    {
      icon: 'info-circle',
      title: 'Sobre',
      subtitle: 'Versão e informações',
      onPress: () => console.log('Navigate to about'),
    },
  ];

  if (profileLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Carregando perfil...
        </Text>
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={styles.centered}>
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
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <FontAwesome name="user" size={48} color={colors.textInverse} />
        </View>
        <Text style={[styles.name, { color: colors.text }]}>
          {userProfile?.fullName || 'Carregando...'}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {userProfile?.email || ''}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card variant="filled" style={styles.statCard}>
          {statsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {userStats?.subscriptionCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Assinaturas
              </Text>
            </>
          )}
        </Card>
        <Card variant="filled" style={styles.statCard}>
          {statsLoading ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : (
            <>
              <Text style={[styles.statValue, { color: colors.secondary }]}>
                R$ {userStats?.totalSavings?.toFixed(2) || '0.00'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Economia Total
              </Text>
            </>
          )}
        </Card>
      </View>

      {/* Member Since */}
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

      {/* Menu Items */}
      <Card style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              { borderBottomColor: colors.border },
              index === menuItems.length - 1 && { borderBottomWidth: 0 },
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <FontAwesome
                name={item.icon as any}
                size={18}
                color={colors.primary}
              />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>
                {item.title}
              </Text>
            </View>
            <FontAwesome
              name="chevron-right"
              size={16}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        ))}
      </Card>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          title="Sair da Conta"
          onPress={handleLogout}
          variant="danger"
          fullWidth
          icon="sign-out"
        />
      </View>

      {/* Version Info */}
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
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -32, // Overlap header
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
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
    marginHorizontal: 16,
    padding: 0, // Remove card padding
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutContainer: {
    margin: 16,
    marginTop: 24,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginVertical: 16,
    marginBottom: 32,
  },
});
