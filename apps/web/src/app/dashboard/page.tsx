"use client"

import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { useEffect, useState } from "react"

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

interface Alert {
  type: string
  severity: "critical" | "warning" | "info"
  title: string
  description: string
  actionUrl: string
  actionText: string
}

interface AlertsData {
  summary: {
    critical: number
    warning: number
    info: number
    unreadNotifications: number
  }
  alerts: {
    critical: Alert[]
    warning: Alert[]
    info: Alert[]
  }
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [alertsData, setAlertsData] = useState<AlertsData | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const [financialRes, alertsRes] = await Promise.all([
        fetch("/api/dashboard/financial", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch("/api/dashboard/alerts", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ])

      if (financialRes.ok) {
        const financial = await financialRes.json()
        setFinancialData(financial)
      }

      if (alertsRes.ok) {
        const alerts = await alertsRes.json()
        setAlertsData(alerts)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  if (isLoading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-32 h-32 border-b-2 rounded-full animate-spin border-sky-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-slate-800">Acesso Negado</h1>
          <Link href="/auth/login" className="text-sky-500 hover:text-sky-600">
            Faça login para continuar
          </Link>
        </div>
      </div>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      case "info":
        return "bg-blue-500"
      default:
        return "bg-slate-500"
    }
  }

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "info":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-slate-200 bg-slate-50"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm border-slate-200">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-sky-500">
                Carteira
              </Link>
            </div>
            <nav className="flex space-x-8">
              <Link href="/dashboard" className="font-medium text-sky-600">
                Dashboard
              </Link>
              <Link href="/subscriptions" className="text-slate-600 hover:text-slate-900">
                Assinaturas
              </Link>
              <Link href="/groups" className="text-slate-600 hover:text-slate-900">
                Grupos
              </Link>
              <Link href="/subscriptions/public" className="text-slate-600 hover:text-slate-900">
                Explorar
              </Link>
              <Link href="/profile" className="text-slate-600 hover:text-slate-900">
                Perfil
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Olá, {user.name}! 👋</h1>
          <p className="mt-2 text-slate-600">Aqui está um resumo das suas assinaturas compartilhadas</p>
        </div>

        {/* Alerts Section */}
        {alertsData && (alertsData.summary.critical > 0 || alertsData.summary.warning > 0) && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Alertas Importantes</h2>
            <div className="space-y-3">
              {alertsData.alerts.critical.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${getSeverityBorder(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)} mt-2 mr-3`}></div>
                      <div>
                        <h3 className="font-medium text-slate-900">{alert.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{alert.description}</p>
                      </div>
                    </div>
                    <Link
                      href={alert.actionUrl}
                      className="px-3 py-1 text-sm font-medium text-sky-600 hover:text-sky-800"
                    >
                      {alert.actionText}
                    </Link>
                  </div>
                </div>
              ))}
              {alertsData.alerts.warning.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getSeverityBorder(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)} mt-2 mr-3`}></div>
                      <div>
                        <h3 className="font-medium text-slate-900">{alert.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{alert.description}</p>
                      </div>
                    </div>
                    <Link
                      href={alert.actionUrl}
                      className="px-3 py-1 text-sm font-medium text-sky-600 hover:text-sky-800"
                    >
                      {alert.actionText}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Overview */}
        {financialData && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
              <h3 className="text-sm font-medium text-slate-600">Gastos Mensais</h3>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {financialData.currency} {financialData.monthlyCosts.toFixed(2)}
              </p>
            </div>

            <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
              <h3 className="text-sm font-medium text-slate-600">Economia Mensal</h3>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {financialData.currency} {financialData.monthlyEconomics.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-slate-500">{financialData.economicsPercentage.toFixed(1)}% de economia</p>
            </div>

            <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
              <h3 className="text-sm font-medium text-slate-600">Total Economizado</h3>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {financialData.currency} {financialData.totalSaved.toFixed(2)}
              </p>
            </div>

            <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
              <h3 className="text-sm font-medium text-slate-600">Assinaturas Ativas</h3>
              <p className="mt-2 text-2xl font-bold text-slate-900">{financialData.subscriptionsCount}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Activity */}
          {financialData?.recentPayments && (
            <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
              <h3 className="mb-4 text-lg font-medium text-slate-900">Pagamentos Recentes</h3>
              {financialData.recentPayments.length > 0 ? (
                <div className="space-y-3">
                  {financialData.recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">{payment.subscriptionName}</p>
                        <p className="text-sm text-slate-600">{new Date(payment.paidAt).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">
                          {payment.currency} {payment.amount.toFixed(2)}
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.status === "paid" ? "Pago" : "Pendente"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-slate-500">Nenhum pagamento recente</p>
              )}
            </div>
          )}

          {/* Subscription Breakdown */}
          {financialData?.subscriptionBreakdown && (
            <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
              <h3 className="mb-4 text-lg font-medium text-slate-900">Suas Assinaturas</h3>
              {financialData.subscriptionBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {financialData.subscriptionBreakdown.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">{sub.name}</p>
                        <p className="text-sm text-slate-600">{sub.serviceName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">
                          {sub.currency} {sub.monthlyAmount.toFixed(2)}/mês
                        </p>
                        <p className="text-sm text-green-600">
                          Economia: {sub.currency} {sub.savings.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="mb-4 text-slate-500">Você ainda não possui assinaturas</p>
                  <Link
                    href="/subscriptions/public"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-sky-500 hover:bg-sky-600"
                  >
                    Explorar Assinaturas
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-6 mt-8 bg-white border rounded-lg shadow-sm border-slate-200">
          <h3 className="mb-4 text-lg font-medium text-slate-900">Ações Rápidas</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/subscriptions/new"
              className="flex items-center justify-center px-4 py-3 border rounded-lg border-sky-300 text-sky-600 hover:bg-sky-50"
            >
              + Nova Assinatura
            </Link>
            <Link
              href="/groups/new"
              className="flex items-center justify-center px-4 py-3 border rounded-lg border-sky-300 text-sky-600 hover:bg-sky-50"
            >
              + Novo Grupo
            </Link>
            <Link
              href="/subscriptions/public"
              className="flex items-center justify-center px-4 py-3 border rounded-lg border-sky-300 text-sky-600 hover:bg-sky-50"
            >
              Explorar Assinaturas
            </Link>
            <Link
              href="/dashboard/financial"
              className="flex items-center justify-center px-4 py-3 border rounded-lg border-sky-300 text-sky-600 hover:bg-sky-50"
            >
              Ver Relatório Completo
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
