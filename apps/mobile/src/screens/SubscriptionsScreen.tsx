import React, { useEffect, useState } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity, 
  RefreshControl,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

interface Subscription {
  id: string;
  name: string;
  serviceName: string;
  description: string;
  totalPrice: number;
  currency: string;
  maxMembers: number;
  currentMembers: number;
  renewalDate: string;
  isPublic: boolean;
  isOwner: boolean;
  role?: string;
  group: {
    id: string;
    name: string;
  };
}

export default function SubscriptionsScreen() {
  const navigation = useNavigation<any>();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      
      if (response.data) {
        setSubscriptions(response.data.subscriptions);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas assinaturas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions();
  };

  const handleViewCredentials = async (subscriptionId: string) => {
    try {
      const response = await api.get(`/credentials/${subscriptionId}`);
      
      if (response.data) {
        const { credential } = response.data;
        Alert.alert(
          'Credenciais',
          `Usuário: ${credential.username}\nSenha: ${credential.password}${
            credential.uri ? `\nURL: ${credential.uri}` : ''
          }`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Error fetching credentials:', error);
      Alert.alert(
        'Erro', 
        error?.response?.data?.error || 'Não foi possível acessar as credenciais'
      );
    }
  };

  const getDaysUntilRenewal = (renewalDate: string) => {
    const renewal = new Date(renewalDate);
    const now = new Date();
    const diffTime = renewal.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRenewalColor = (days: number) => {
    if (days <= 1) return 'text-red-500';
    if (days <= 7) return 'text-yellow-500';
    return 'text-slate-400';
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="flex-1 items-center justify-center">
          <Text className="text-sky-400 text-lg">Carregando assinaturas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 border-b border-slate-700">
        <View>
          <Text className="text-xl font-bold text-white">Minhas Assinaturas</Text>
          <Text className="text-slate-400 text-sm">
            {subscriptions.length} assinatura{subscriptions.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity className="bg-sky-600 px-4 py-2 rounded-lg">
          <Text className="text-white font-medium">+ Nova</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {subscriptions.length > 0 ? (
          <View className="p-4 space-y-4">
            {subscriptions.map((subscription) => {
              const daysUntilRenewal = getDaysUntilRenewal(subscription.renewalDate);
              const pricePerMember = subscription.totalPrice / subscription.maxMembers;
              
              return (
                <TouchableOpacity 
                  key={subscription.id} 
                  onPress={() => navigation.navigate("SubscriptionDetails", { subscriptionId: subscription.id })}
                  activeOpacity={0.8}
                >
                  <View className="bg-slate-800 rounded-lg p-4">
                    {/* Header */}
                    <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-white">
                        {subscription.name}
                      </Text>
                      <Text className="text-sky-400 text-sm">
                        {subscription.serviceName}
                      </Text>
                    </View>
                    <View className="items-end">
                      <View className={`px-2 py-1 rounded-full ${
                        subscription.isOwner
                          ? 'bg-sky-100'
                          : subscription.role === 'admin'
                          ? 'bg-purple-100'
                          : 'bg-slate-100'
                      }`}>
                        <Text className={`text-xs font-medium ${
                          subscription.isOwner
                            ? 'text-sky-800'
                            : subscription.role === 'admin'
                            ? 'text-purple-800'
                            : 'text-slate-800'
                        }`}>
                          {subscription.isOwner ? 'Dono' : subscription.role === 'admin' ? 'Admin' : 'Membro'}
                        </Text>
                      </View>
                      {subscription.isPublic && (
                        <Text className="text-xs text-green-500 mt-1">Público</Text>
                      )}
                    </View>
                  </View>

                  {/* Description */}
                  <Text className="text-slate-300 text-sm mb-4">
                    {subscription.description}
                  </Text>

                  {/* Details */}
                  <View className="space-y-2 mb-4">
                    <View className="flex-row justify-between">
                      <Text className="text-slate-400 text-sm">Seu valor mensal:</Text>
                      <Text className="text-white font-medium">
                        {subscription.currency} {pricePerMember.toFixed(2)}
                      </Text>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <Text className="text-slate-400 text-sm">Membros:</Text>
                      <Text className="text-slate-400 text-sm">
                        {subscription.currentMembers}/{subscription.maxMembers}
                      </Text>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <Text className="text-slate-400 text-sm">Renovação:</Text>
                      <Text className={`text-sm ${getRenewalColor(daysUntilRenewal)}`}>
                        {daysUntilRenewal > 0 
                          ? `${daysUntilRenewal} dia${daysUntilRenewal !== 1 ? 's' : ''}`
                          : 'Vencida'
                        }
                      </Text>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <Text className="text-slate-400 text-sm">Grupo:</Text>
                      <Text className="text-slate-400 text-sm">
                        {subscription.group.name}
                      </Text>
                    </View>
                  </View>

                  {/* Renewal Alert */}
                  {daysUntilRenewal <= 7 && (
                    <View className={`p-3 rounded-lg mb-4 ${
                      daysUntilRenewal <= 1 ? 'bg-red-900' : 'bg-yellow-900'
                    }`}>
                      <Text className={`text-sm font-medium ${
                        daysUntilRenewal <= 1 ? 'text-red-300' : 'text-yellow-300'
                      }`}>
                        {daysUntilRenewal <= 1 
                          ? '🚨 Renovação urgente!' 
                          : '⚠️ Renovação próxima'
                        }
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View className="flex-row space-x-3">
                    <TouchableOpacity 
                      onPress={() => handleViewCredentials(subscription.id)}
                      className="flex-1 bg-sky-600 py-3 rounded-lg"
                    >
                      <Text className="text-white font-medium text-center">
                        Ver Credenciais
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => navigation.navigate("SubscriptionDetails", { subscriptionId: subscription.id })}
                      className="flex-1 bg-slate-700 py-3 rounded-lg border border-sky-600"
                    >
                      <Text className="text-sky-400 font-medium text-center">
                        Detalhes
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Owner Actions */}
                  {subscription.isOwner && (
                    <View className="flex-row space-x-3 mt-3">
                      <TouchableOpacity className="flex-1 bg-slate-700 py-2 rounded-lg">
                        <Text className="text-slate-400 text-sm text-center">
                          Gerenciar Membros
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity className="flex-1 bg-slate-700 py-2 rounded-lg">
                        <Text className="text-slate-400 text-sm text-center">
                          Atualizar Senha
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-6xl mb-4">📺</Text>
            <Text className="text-xl font-bold text-white text-center mb-2">
              Nenhuma assinatura ainda
            </Text>
            <Text className="text-slate-400 text-center mb-6">
              Comece criando uma nova assinatura ou explorando as assinaturas públicas disponíveis
            </Text>
            <View className="space-y-3 w-full max-w-xs">
              <TouchableOpacity className="bg-sky-600 py-3 px-6 rounded-lg">
                <Text className="text-white font-semibold text-center">
                  Criar Nova Assinatura
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="bg-slate-700 py-3 px-6 rounded-lg border border-sky-600">
                <Text className="text-sky-400 font-semibold text-center">
                  Explorar Assinaturas
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}