import React, { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { api } from "../services/api"

interface AccessRequest {
  id: string
  subscriptionName: string
  subscriptionService: string
  requesterName: string
  requesterEmail: string
  reason?: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  subscription: {
    id: string
    name: string
    service: string
    price: number
    currentMembers: number
    maxMembers: number
  }
}

export default function AccessRequestsScreen() {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set())

  useFocusEffect(
    useCallback(() => {
      loadRequests()
    }, [])
  )

  const loadRequests = async () => {
    try {
      const response = await api.get("/access-requests?type=received")
      setRequests(response.data || [])
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error)
      Alert.alert("Erro", "Não foi possível carregar as solicitações")
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadRequests()
    setRefreshing(false)
  }

  const handleApprove = async (requestId: string, requesterName: string) => {
    Alert.alert(
      "Aprovar Solicitação",
      `Deseja aprovar a solicitação de ${requesterName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aprovar",
          style: "default",
          onPress: () => processRequest(requestId, "approve"),
        },
      ]
    )
  }

  const handleReject = async (requestId: string, requesterName: string) => {
    Alert.alert(
      "Rejeitar Solicitação",
      `Deseja rejeitar a solicitação de ${requesterName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Rejeitar",
          style: "destructive",
          onPress: () => processRequest(requestId, "reject"),
        },
      ]
    )
  }

  const processRequest = async (requestId: string, action: "approve" | "reject") => {
    setProcessingRequests((prev) => new Set(prev).add(requestId))

    try {
      await api.put(`/access-requests/${requestId}/${action}`)
      
      Alert.alert(
        "Sucesso!",
        `Solicitação ${action === "approve" ? "aprovada" : "rejeitada"} com sucesso!`
      )
      
      // Remove the request from the list
      setRequests((prev) => prev.filter((req) => req.id !== requestId))
    } catch (error: any) {
      console.error(`Erro ao ${action} solicitação:`, error)
      Alert.alert(
        "Erro",
        error.response?.data?.error || 
        `Não foi possível ${action === "approve" ? "aprovar" : "rejeitar"} a solicitação`
      )
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text className="text-slate-400 mt-4">Carregando solicitações...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-slate-800">
          <Text className="text-2xl font-bold text-white">Solicitações de Acesso</Text>
          <Text className="text-slate-400 mt-1">
            Aprove ou rejeite solicitações para suas assinaturas
          </Text>
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
          {requests.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-6xl mb-4">📋</Text>
              <Text className="text-xl font-semibold text-white mb-2">
                Nenhuma solicitação pendente
              </Text>
              <Text className="text-slate-400 text-center px-6">
                Quando alguém solicitar acesso às suas assinaturas, aparecerão aqui
              </Text>
            </View>
          ) : (
            <View className="px-6 py-4 space-y-4">
              {requests.map((request) => {
                const isProcessing = processingRequests.has(request.id)
                
                return (
                  <View
                    key={request.id}
                    className="bg-slate-800 p-4 rounded-lg border border-slate-700"
                  >
                    {/* Header da Solicitação */}
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-white font-semibold text-lg">
                          {request.subscription.name}
                        </Text>
                        <Text className="text-slate-400">
                          {request.subscription.service}
                        </Text>
                      </View>
                      <View className="bg-yellow-500/20 px-2 py-1 rounded">
                        <Text className="text-yellow-400 text-xs font-medium">PENDENTE</Text>
                      </View>
                    </View>

                    {/* Informações do Solicitante */}
                    <View className="bg-slate-900/50 p-3 rounded-lg mb-3">
                      <Text className="text-slate-300 font-medium mb-1">Solicitante:</Text>
                      <Text className="text-white">{request.requesterName}</Text>
                      <Text className="text-slate-400 text-sm">{request.requesterEmail}</Text>
                      
                      {request.reason && (
                        <View className="mt-2">
                          <Text className="text-slate-300 text-sm mb-1">Motivo:</Text>
                          <Text className="text-slate-400 text-sm italic">"{request.reason}"</Text>
                        </View>
                      )}
                    </View>

                    {/* Informações da Assinatura */}
                    <View className="flex-row justify-between items-center mb-3">
                      <View>
                        <Text className="text-slate-400 text-sm">Valor Total</Text>
                        <Text className="text-white font-semibold">
                          {formatPrice(request.subscription.price)}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-slate-400 text-sm">Membros</Text>
                        <Text className="text-white font-semibold">
                          {request.subscription.currentMembers}/{request.subscription.maxMembers}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-slate-400 text-sm">Valor por pessoa</Text>
                        <Text className="text-sky-400 font-semibold">
                          {formatPrice(request.subscription.price / (request.subscription.currentMembers + 1))}
                        </Text>
                      </View>
                    </View>

                    {/* Data da Solicitação */}
                    <Text className="text-slate-500 text-xs mb-3">
                      Solicitado em {formatDate(request.createdAt)}
                    </Text>

                    {/* Ações */}
                    <View className="flex-row space-x-3">
                      <TouchableOpacity
                        onPress={() => handleApprove(request.id, request.requesterName)}
                        disabled={isProcessing}
                        className={`flex-1 py-3 px-4 rounded-lg ${
                          isProcessing ? "bg-slate-700" : "bg-green-600"
                        }`}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text className="text-white text-center font-semibold">✓ Aprovar</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleReject(request.id, request.requesterName)}
                        disabled={isProcessing}
                        className={`flex-1 py-3 px-4 rounded-lg ${
                          isProcessing ? "bg-slate-700" : "bg-red-600"
                        }`}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text className="text-white text-center font-semibold">✗ Rejeitar</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}