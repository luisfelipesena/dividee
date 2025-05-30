import React, { useEffect, useState } from "react"
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../hooks/useAuth"
import api from "../services/api"

interface FinancialData {
  monthlyCosts: number
  monthlyEconomics: number
  totalSaved: number
  subscriptionsCount: number
  groupsCount: number
  currency: string
  economicsPercentage: number
  subscriptionBreakdown: Array<{
    id: string
    name: string
    serviceName: string
    monthlyAmount: number
    savings: number
    currency: string
  }>
  recentPayments: Array<{
    id: string
    subscriptionName: string
    amount: number
    currency: string
    paidAt: string
    status: string
  }>
}

interface AlertType {
  type: string
  severity: "critical" | "warning" | "info"
  title: string
  description: string
  actionUrl: string
  actionText: string
}

export default function DashboardScreen() {
  const { user } = useAuth()
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [alerts, setAlerts] = useState<AlertType[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [financialResponse, alertsResponse] = await Promise.all([
        api.get("/dashboard/financial"),
        api.get("/dashboard/alerts"),
      ])

      if (financialResponse.data) {
        setFinancialData(financialResponse.data)
      }

      if (alertsResponse.data) {
        const allAlerts = [...alertsResponse.data.alerts.critical, ...alertsResponse.data.alerts.warning]
        setAlerts(allAlerts)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      Alert.alert("Erro", "Não foi possível carregar os dados do dashboard")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-500 bg-red-50"
      case "warning":
        return "border-yellow-500 bg-yellow-50"
      case "info":
        return "border-blue-500 bg-blue-50"
      default:
        return "border-slate-500 bg-slate-50"
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="items-center justify-center flex-1">
          <Text className="text-lg text-sky-400">Carregando dashboard...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Welcome Section */}
        <View className="p-6 border-b border-slate-700">
          <Text className="text-2xl font-bold text-white">Olá, {user?.name}! 👋</Text>
          <Text className="mt-1 text-slate-400">Resumo das suas assinaturas compartilhadas</Text>
        </View>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <View className="p-6 border-b border-slate-700">
            <Text className="mb-4 text-lg font-semibold text-white">⚠️ Alertas Importantes</Text>
            <View className="space-y-3">
              {alerts.slice(0, 3).map((alert, index) => (
                <View key={index} className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}>
                  <Text className="mb-1 font-medium text-slate-900">{alert.title}</Text>
                  <Text className="text-sm text-slate-600">{alert.description}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Financial Overview */}
        {financialData && (
          <View className="p-6">
            <Text className="mb-4 text-lg font-semibold text-white">📊 Resumo Financeiro</Text>
            <View className="grid grid-cols-2 gap-4">
              <View className="p-4 rounded-lg bg-slate-800">
                <Text className="text-sm text-slate-400">Gastos Mensais</Text>
                <Text className="mt-1 text-xl font-bold text-white">
                  {financialData.currency} {financialData.monthlyCosts.toFixed(2)}
                </Text>
              </View>

              <View className="p-4 rounded-lg bg-slate-800">
                <Text className="text-sm text-slate-400">Economia Mensal</Text>
                <Text className="mt-1 text-xl font-bold text-green-500">
                  {financialData.currency} {financialData.monthlyEconomics.toFixed(2)}
                </Text>
                <Text className="mt-1 text-xs text-slate-500">
                  {financialData.economicsPercentage.toFixed(1)}% economia
                </Text>
              </View>

              <View className="p-4 rounded-lg bg-slate-800">
                <Text className="text-sm text-slate-400">Total Economizado</Text>
                <Text className="mt-1 text-xl font-bold text-green-500">
                  {financialData.currency} {financialData.totalSaved.toFixed(2)}
                </Text>
              </View>

              <View className="p-4 rounded-lg bg-slate-800">
                <Text className="text-sm text-slate-400">Assinaturas Ativas</Text>
                <Text className="mt-1 text-xl font-bold text-white">{financialData.subscriptionsCount}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Subscriptions */}
        {financialData?.subscriptionBreakdown && financialData.subscriptionBreakdown.length > 0 && (
          <View className="p-6 border-t border-slate-700">
            <Text className="mb-4 text-lg font-semibold text-white">📺 Suas Assinaturas</Text>
            <View className="space-y-3">
              {financialData.subscriptionBreakdown.slice(0, 5).map((sub) => (
                <View key={sub.id} className="p-4 rounded-lg bg-slate-800">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="font-medium text-white">{sub.name}</Text>
                      <Text className="text-sm text-slate-400">{sub.serviceName}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-medium text-white">
                        {sub.currency} {sub.monthlyAmount.toFixed(2)}/mês
                      </Text>
                      <Text className="text-sm text-green-500">
                        Economia: {sub.currency} {sub.savings.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Payments */}
        {financialData?.recentPayments && financialData.recentPayments.length > 0 && (
          <View className="p-6 border-t border-slate-700">
            <Text className="mb-4 text-lg font-semibold text-white">💳 Pagamentos Recentes</Text>
            <View className="space-y-3">
              {financialData.recentPayments.slice(0, 5).map((payment) => (
                <View key={payment.id} className="p-4 rounded-lg bg-slate-800">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-medium text-white">{payment.subscriptionName}</Text>
                      <Text className="text-sm text-slate-400">
                        {new Date(payment.paidAt).toLocaleDateString("pt-BR")}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-medium text-white">
                        {payment.currency} {payment.amount.toFixed(2)}
                      </Text>
                      <View
                        className={`px-2 py-1 rounded-full ${
                          payment.status === "paid" ? "bg-green-100" : "bg-yellow-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            payment.status === "paid" ? "text-green-800" : "text-yellow-800"
                          }`}
                        >
                          {payment.status === "paid" ? "Pago" : "Pendente"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="p-6 border-t border-slate-700">
          <Text className="mb-4 text-lg font-semibold text-white">⚡ Ações Rápidas</Text>
          <View className="space-y-3">
            <TouchableOpacity className="p-4 rounded-lg bg-sky-600">
              <Text className="font-medium text-center text-white">+ Nova Assinatura</Text>
            </TouchableOpacity>

            <TouchableOpacity className="p-4 border rounded-lg bg-slate-700 border-sky-600">
              <Text className="font-medium text-center text-sky-400">🔍 Explorar Assinaturas</Text>
            </TouchableOpacity>

            <TouchableOpacity className="p-4 border rounded-lg bg-slate-700 border-sky-600">
              <Text className="font-medium text-center text-sky-400">+ Novo Grupo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Empty State */}
        {!financialData?.subscriptionsCount && (
          <View className="items-center p-6">
            <Text className="mb-4 text-6xl">📱</Text>
            <Text className="mb-2 text-xl font-bold text-center text-white">Bem-vindo ao Carteira!</Text>
            <Text className="mb-6 text-center text-slate-400">
              Comece explorando assinaturas ou criando seu primeiro grupo
            </Text>
            <TouchableOpacity className="px-6 py-3 rounded-lg bg-sky-600">
              <Text className="font-semibold text-white">Explorar Agora</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
