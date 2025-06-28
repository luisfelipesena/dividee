import React, { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native"
import { api } from "../services/api"

interface Subscription {
  id: string
  name: string
  service: string
  price: number
  maxMembers: number
  currentMembers: number
  renewalDate: string
  isPublic: boolean
  description?: string
  role: "owner" | "admin" | "member"
  group?: {
    id: string
    name: string
  }
}

interface Member {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  joinedAt: string
}

interface Credentials {
  id: string
  username: string
  password: string
  website?: string
  notes?: string
  lastUpdated: string
}

export default function SubscriptionDetailsScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { subscriptionId } = route.params as { subscriptionId: string }

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [showCredentials, setShowCredentials] = useState(false)
  const [loadingCredentials, setLoadingCredentials] = useState(false)
  const [activeTab, setActiveTab] = useState<"info" | "members" | "credentials">("info")

  useFocusEffect(
    useCallback(() => {
      loadSubscriptionDetails()
    }, [subscriptionId])
  )

  const loadSubscriptionDetails = async () => {
    try {
      const [subscriptionRes, membersRes] = await Promise.all([
        api.get(`/subscriptions/${subscriptionId}`),
        api.get(`/subscriptions/${subscriptionId}/members`),
      ])

      setSubscription(subscriptionRes.data)
      setMembers(membersRes.data || [])
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error)
      Alert.alert("Erro", "Não foi possível carregar os detalhes da assinatura")
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadSubscriptionDetails()
    setRefreshing(false)
  }

  const loadCredentials = async () => {
    if (credentials) {
      setShowCredentials(!showCredentials)
      return
    }

    setLoadingCredentials(true)
    try {
      const response = await api.get(`/credentials/${subscriptionId}`)
      setCredentials(response.data)
      setShowCredentials(true)
    } catch (error: any) {
      console.error("Erro ao carregar credenciais:", error)
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível carregar as credenciais"
      )
    } finally {
      setLoadingCredentials(false)
    }
  }

  const updateCredentials = async () => {
    Alert.alert(
      "Atualizar Credenciais",
      "Deseja gerar uma nova senha para esta assinatura? Todos os membros serão notificados.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Atualizar",
          style: "default",
          onPress: async () => {
            try {
              await api.put(`/credentials/${subscriptionId}`, {
                generateNewPassword: true,
              })
              Alert.alert("Sucesso!", "Credenciais atualizadas com sucesso!")
              setCredentials(null) // Force reload
              loadCredentials()
            } catch (error) {
              Alert.alert("Erro", "Não foi possível atualizar as credenciais")
            }
          },
        },
      ]
    )
  }

  const removeMember = async (memberId: string, memberName: string) => {
    if (subscription?.role !== "owner" && subscription?.role !== "admin") {
      Alert.alert("Erro", "Apenas administradores podem remover membros")
      return
    }

    Alert.alert(
      "Remover Membro",
      `Deseja remover ${memberName} desta assinatura?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/subscriptions/${subscriptionId}/members/${memberId}`)
              Alert.alert("Sucesso!", "Membro removido com sucesso!")
              loadSubscriptionDetails()
            } catch (error) {
              Alert.alert("Erro", "Não foi possível remover o membro")
            }
          },
        },
      ]
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const openWebsite = (url: string) => {
    if (url && url.startsWith("http")) {
      Linking.openURL(url)
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text className="text-slate-400 mt-4">Carregando detalhes...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!subscription) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Assinatura não encontrada</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-4 px-6 py-2 bg-sky-500 rounded-lg"
          >
            <Text className="text-white font-semibold">Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const pricePerMember = subscription.price / subscription.currentMembers

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-slate-800">
          <Text className="text-2xl font-bold text-white">{subscription.name}</Text>
          <Text className="text-slate-400">{subscription.service}</Text>
        </View>

        {/* Tabs */}
        <View className="flex-row px-6 py-3 border-b border-slate-800">
          {[
            { key: "info", label: "Informações" },
            { key: "members", label: "Membros" },
            { key: "credentials", label: "Credenciais" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              className={`mr-6 pb-2 ${
                activeTab === tab.key ? "border-b-2 border-sky-500" : ""
              }`}
            >
              <Text
                className={`font-medium ${
                  activeTab === tab.key ? "text-sky-500" : "text-slate-400"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0ea5e9"]}
              tintColor="#0ea5e9"
            />
          }
        >
          <View className="px-6 py-4">
            {/* Info Tab */}
            {activeTab === "info" && (
              <View className="space-y-4">
                {/* Status e Preços */}
                <View className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <Text className="text-white font-semibold text-lg mb-3">Resumo Financeiro</Text>
                  
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-slate-400">Valor Total</Text>
                    <Text className="text-white font-semibold">{formatPrice(subscription.price)}</Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-slate-400">Valor por Pessoa</Text>
                    <Text className="text-sky-400 font-semibold">{formatPrice(pricePerMember)}</Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-400">Próxima Renovação</Text>
                    <Text className="text-white font-semibold">{formatDate(subscription.renewalDate)}</Text>
                  </View>
                </View>

                {/* Informações Gerais */}
                <View className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <Text className="text-white font-semibold text-lg mb-3">Informações</Text>
                  
                  <View className="space-y-3">
                    <View className="flex-row justify-between">
                      <Text className="text-slate-400">Tipo</Text>
                      <View className={`px-2 py-1 rounded ${subscription.isPublic ? "bg-green-500/20" : "bg-blue-500/20"}`}>
                        <Text className={`text-xs font-medium ${subscription.isPublic ? "text-green-400" : "text-blue-400"}`}>
                          {subscription.isPublic ? "Pública" : "Privada"}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <Text className="text-slate-400">Seu Papel</Text>
                      <Text className="text-white font-medium capitalize">{subscription.role}</Text>
                    </View>
                    
                    {subscription.group && (
                      <View className="flex-row justify-between">
                        <Text className="text-slate-400">Grupo</Text>
                        <Text className="text-white font-medium">{subscription.group.name}</Text>
                      </View>
                    )}
                    
                    <View className="flex-row justify-between">
                      <Text className="text-slate-400">Membros</Text>
                      <Text className="text-white font-medium">
                        {subscription.currentMembers}/{subscription.maxMembers}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Descrição */}
                {subscription.description && (
                  <View className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <Text className="text-white font-semibold text-lg mb-2">Descrição</Text>
                    <Text className="text-slate-300">{subscription.description}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Members Tab */}
            {activeTab === "members" && (
              <View className="space-y-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-white font-semibold text-lg">
                    Membros ({members.length})
                  </Text>
                  {(subscription.role === "owner" || subscription.role === "admin") && (
                    <TouchableOpacity
                      onPress={() => {
                        // TODO: Navigate to invite members screen
                        Alert.alert("Info", "Funcionalidade de convite em desenvolvimento")
                      }}
                      className="bg-sky-500 px-3 py-2 rounded-lg"
                    >
                      <Text className="text-white font-medium">Convidar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {members.map((member) => (
                  <View
                    key={member.id}
                    className="bg-slate-800 p-4 rounded-lg border border-slate-700"
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-white font-semibold">{member.name}</Text>
                        <Text className="text-slate-400 text-sm">{member.email}</Text>
                        <Text className="text-slate-500 text-xs mt-1">
                          Entrou em {formatDate(member.joinedAt)}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center space-x-2">
                        <View className={`px-2 py-1 rounded ${
                          member.role === "owner" ? "bg-yellow-500/20" :
                          member.role === "admin" ? "bg-purple-500/20" : "bg-slate-500/20"
                        }`}>
                          <Text className={`text-xs font-medium ${
                            member.role === "owner" ? "text-yellow-400" :
                            member.role === "admin" ? "text-purple-400" : "text-slate-400"
                          }`}>
                            {member.role === "owner" ? "Dono" : member.role === "admin" ? "Admin" : "Membro"}
                          </Text>
                        </View>
                        
                        {(subscription.role === "owner" || subscription.role === "admin") &&
                         member.role !== "owner" && (
                          <TouchableOpacity
                            onPress={() => removeMember(member.id, member.name)}
                            className="bg-red-500/20 p-2 rounded"
                          >
                            <Text className="text-red-400 text-xs">Remover</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Credentials Tab */}
            {activeTab === "credentials" && (
              <View className="space-y-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-white font-semibold text-lg">Credenciais</Text>
                  {(subscription.role === "owner" || subscription.role === "admin") && (
                    <TouchableOpacity
                      onPress={updateCredentials}
                      className="bg-blue-500 px-3 py-2 rounded-lg"
                    >
                      <Text className="text-white font-medium">Atualizar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  onPress={loadCredentials}
                  disabled={loadingCredentials}
                  className="bg-slate-800 p-4 rounded-lg border border-slate-700"
                >
                  {loadingCredentials ? (
                    <ActivityIndicator color="#0ea5e9" />
                  ) : (
                    <Text className="text-sky-400 text-center font-medium">
                      {showCredentials ? "Ocultar Credenciais" : "Mostrar Credenciais"}
                    </Text>
                  )}
                </TouchableOpacity>

                {showCredentials && credentials && (
                  <View className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <View className="space-y-3">
                      <View>
                        <Text className="text-slate-400 mb-1">Usuário/Email</Text>
                        <Text className="text-white font-mono">{credentials.username}</Text>
                      </View>
                      
                      <View>
                        <Text className="text-slate-400 mb-1">Senha</Text>
                        <Text className="text-white font-mono">{credentials.password}</Text>
                      </View>
                      
                      {credentials.website && (
                        <TouchableOpacity onPress={() => openWebsite(credentials.website!)}>
                          <Text className="text-slate-400 mb-1">Website</Text>
                          <Text className="text-sky-400 underline">{credentials.website}</Text>
                        </TouchableOpacity>
                      )}
                      
                      {credentials.notes && (
                        <View>
                          <Text className="text-slate-400 mb-1">Observações</Text>
                          <Text className="text-white">{credentials.notes}</Text>
                        </View>
                      )}
                      
                      <Text className="text-slate-500 text-xs">
                        Última atualização: {formatDate(credentials.lastUpdated)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}