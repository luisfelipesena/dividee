import React, { useEffect, useState } from "react"
import { Alert, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import api from "../services/api"

interface PublicSubscription {
  id: string
  name: string
  serviceName: string
  description: string
  totalPrice: number
  currency: string
  maxMembers: number
  currentMembers: number
  renewalDate: string
  pricePerMember: number
  availableSpots: number
  percentageFilled: number
  group: {
    id: string
    name: string
  }
}

export default function ExploreScreen() {
  const [subscriptions, setSubscriptions] = useState<PublicSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [serviceFilter, setServiceFilter] = useState("")
  const [maxPriceFilter, setMaxPriceFilter] = useState("")
  const [availableSpotsOnly, setAvailableSpotsOnly] = useState(false)

  useEffect(() => {
    fetchSubscriptions()
  }, [searchTerm, serviceFilter, maxPriceFilter, availableSpotsOnly])

  const fetchSubscriptions = async () => {
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "20",
      })

      if (searchTerm) params.append("search", searchTerm)
      if (serviceFilter) params.append("service", serviceFilter)
      if (maxPriceFilter) params.append("maxPrice", maxPriceFilter)
      if (availableSpotsOnly) params.append("availableSpots", "true")

      const response = await api.get(`/subscriptions/public?${params}`)

      if (response.data) {
        setSubscriptions(response.data.subscriptions)
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
      Alert.alert("Erro", "Não foi possível carregar as assinaturas")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRequestAccess = async (subscriptionId: string) => {
    try {
      const response = await api.post("/access-requests", {
        subscriptionId,
        message: "Gostaria de participar desta assinatura.",
      })

      if (response.data) {
        Alert.alert("Sucesso!", "Solicitação enviada com sucesso!")
      }
    } catch (error: any) {
      console.error("Error requesting access:", error)
      Alert.alert("Erro", error?.response?.data?.error || "Erro ao enviar solicitação")
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchSubscriptions()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setServiceFilter("")
    setMaxPriceFilter("")
    setAvailableSpotsOnly(false)
    setShowFilters(false)
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="items-center justify-center flex-1">
          <Text className="text-lg text-sky-400">Carregando assinaturas...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Search Header */}
      <View className="p-4 border-b border-slate-700">
        <View className="flex-row items-center space-x-3">
          <View className="flex-1">
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Buscar assinaturas..."
              placeholderTextColor="#94a3b8"
              className="px-4 py-3 text-white rounded-lg bg-slate-800"
            />
          </View>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)} className="p-3 rounded-lg bg-slate-800">
            <Text className="text-sky-400">🔧</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View className="mt-4 space-y-3">
            <TextInput
              value={serviceFilter}
              onChangeText={setServiceFilter}
              placeholder="Filtrar por serviço (ex: Netflix)"
              placeholderTextColor="#94a3b8"
              className="px-4 py-3 text-white rounded-lg bg-slate-800"
            />

            <TextInput
              value={maxPriceFilter}
              onChangeText={setMaxPriceFilter}
              placeholder="Preço máximo (R$)"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              className="px-4 py-3 text-white rounded-lg bg-slate-800"
            />

            <TouchableOpacity
              onPress={() => setAvailableSpotsOnly(!availableSpotsOnly)}
              className={`p-3 rounded-lg flex-row items-center ${availableSpotsOnly ? "bg-sky-600" : "bg-slate-800"}`}
            >
              <Text className={`mr-2 ${availableSpotsOnly ? "text-white" : "text-slate-400"}`}>
                {availableSpotsOnly ? "✓" : "○"}
              </Text>
              <Text className={availableSpotsOnly ? "text-white" : "text-slate-400"}>Apenas com vagas disponíveis</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={clearFilters} className="p-3 rounded-lg bg-slate-700">
              <Text className="text-center text-sky-400">Limpar Filtros</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {subscriptions.length > 0 ? (
          <View className="p-4 space-y-4">
            {subscriptions.map((subscription) => (
              <View key={subscription.id} className="p-4 rounded-lg bg-slate-800">
                {/* Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-white">{subscription.name}</Text>
                    <Text className="text-sm text-sky-400">{subscription.serviceName}</Text>
                  </View>
                  <View
                    className={`px-2 py-1 rounded-full ${
                      subscription.availableSpots > 0 ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        subscription.availableSpots > 0 ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {subscription.availableSpots > 0
                        ? `${subscription.availableSpots} vaga${subscription.availableSpots !== 1 ? "s" : ""}`
                        : "Lotado"}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text className="mb-4 text-sm text-slate-300">{subscription.description}</Text>

                {/* Details */}
                <View className="mb-4 space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-slate-400">Preço por pessoa:</Text>
                    <Text className="font-medium text-white">
                      {subscription.currency} {subscription.pricePerMember.toFixed(2)}/mês
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-sm text-slate-400">Membros:</Text>
                    <Text className="text-sm text-slate-400">
                      {subscription.currentMembers}/{subscription.maxMembers}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-sm text-slate-400">Renovação:</Text>
                    <Text className="text-sm text-slate-400">
                      {new Date(subscription.renewalDate).toLocaleDateString("pt-BR")}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-sm text-slate-400">Grupo:</Text>
                    <Text className="text-sm text-slate-400">{subscription.group.name}</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="mb-4">
                  <View className="h-2 rounded-full bg-slate-700">
                    <View
                      className="h-2 rounded-full bg-sky-500"
                      style={{ width: `${subscription.percentageFilled}%` }}
                    />
                  </View>
                  <Text className="mt-1 text-xs text-slate-500">
                    {subscription.percentageFilled.toFixed(0)}% preenchido
                  </Text>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  onPress={() => handleRequestAccess(subscription.id)}
                  disabled={subscription.availableSpots === 0}
                  className={`py-3 px-4 rounded-lg ${subscription.availableSpots > 0 ? "bg-sky-600" : "bg-slate-600"}`}
                >
                  <Text
                    className={`text-center font-medium ${
                      subscription.availableSpots > 0 ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {subscription.availableSpots > 0 ? "Solicitar Acesso" : "Sem Vagas"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center flex-1 p-8">
            <Text className="mb-4 text-6xl">🔍</Text>
            <Text className="mb-2 text-xl font-bold text-center text-white">Nenhuma assinatura encontrada</Text>
            <Text className="mb-6 text-center text-slate-400">
              Tente ajustar os filtros ou seja o primeiro a criar uma assinatura!
            </Text>
            <TouchableOpacity className="px-6 py-3 rounded-lg bg-sky-600">
              <Text className="font-semibold text-white">Criar Nova Assinatura</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
