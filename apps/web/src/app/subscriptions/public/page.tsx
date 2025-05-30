"use client"

import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { useEffect, useState } from "react"

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

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function PublicSubscriptionsPage() {
  const { user, isLoading } = useAuth()
  const [subscriptions, setSubscriptions] = useState<PublicSubscription[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")
  const [maxPriceFilter, setMaxPriceFilter] = useState("")
  const [availableSpotsOnly, setAvailableSpotsOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (user) {
      fetchSubscriptions()
    }
  }, [user, currentPage, searchTerm, serviceFilter, maxPriceFilter, availableSpotsOnly])

  const fetchSubscriptions = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
      })

      if (searchTerm) params.append("search", searchTerm)
      if (serviceFilter) params.append("service", serviceFilter)
      if (maxPriceFilter) params.append("maxPrice", maxPriceFilter)
      if (availableSpotsOnly) params.append("availableSpots", "true")

      const response = await fetch(`/api/subscriptions/public?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching public subscriptions:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleRequestAccess = async (subscriptionId: string) => {
    try {
      const response = await fetch("/api/access-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          subscriptionId,
          message: "Gostaria de participar desta assinatura.",
        }),
      })

      if (response.ok) {
        alert("Solicitação enviada com sucesso!")
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao enviar solicitação")
      }
    } catch (error) {
      console.error("Error requesting access:", error)
      alert("Erro ao enviar solicitação")
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setServiceFilter("")
    setMaxPriceFilter("")
    setAvailableSpotsOnly(false)
    setCurrentPage(1)
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
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/subscriptions" className="text-slate-600 hover:text-slate-900">
                Assinaturas
              </Link>
              <Link href="/groups" className="text-slate-600 hover:text-slate-900">
                Grupos
              </Link>
              <Link href="/subscriptions/public" className="font-medium text-sky-600">
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
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Explorar Assinaturas</h1>
          <p className="mt-2 text-slate-600">Encontre assinaturas para compartilhar e economizar dinheiro</p>
        </div>

        {/* Filters */}
        <div className="p-6 mb-8 bg-white border rounded-lg shadow-sm border-slate-200">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome ou serviço..."
                className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">Serviço</label>
              <input
                type="text"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                placeholder="Ex: Netflix, Spotify..."
                className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">Preço máximo (R$)</label>
              <input
                type="number"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(e.target.value)}
                placeholder="Ex: 50"
                className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={availableSpotsOnly}
                  onChange={(e) => setAvailableSpotsOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                />
                <span className="ml-2 text-sm text-slate-700">Apenas com vagas</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Subscriptions Grid */}
        {subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-slate-900">{subscription.name}</h3>
                      <p className="text-sm text-slate-600">{subscription.serviceName}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscription.availableSpots > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {subscription.availableSpots > 0
                        ? `${subscription.availableSpots} vaga${subscription.availableSpots !== 1 ? "s" : ""}`
                        : "Lotado"}
                    </span>
                  </div>

                  <p className="mb-4 text-sm text-slate-600">{subscription.description}</p>

                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Preço por pessoa:</span>
                      <span className="font-medium text-slate-900">
                        {subscription.currency} {subscription.pricePerMember.toFixed(2)}/mês
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Membros:</span>
                      <span className="text-slate-600">
                        {subscription.currentMembers}/{subscription.maxMembers}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Renovação:</span>
                      <span className="text-slate-600">
                        {new Date(subscription.renewalDate).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Grupo:</span>
                      <span className="text-slate-600">{subscription.group.name}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-sky-500"
                        style={{ width: `${subscription.percentageFilled}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {subscription.percentageFilled.toFixed(0)}% preenchido
                    </p>
                  </div>

                  <button
                    onClick={() => handleRequestAccess(subscription.id)}
                    disabled={subscription.availableSpots === 0}
                    className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                      subscription.availableSpots > 0
                        ? "bg-sky-500 text-white hover:bg-sky-600"
                        : "bg-slate-300 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {subscription.availableSpots > 0 ? "Solicitar Acesso" : "Sem Vagas"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <h3 className="mb-2 text-lg font-medium text-slate-900">Nenhuma assinatura encontrada</h3>
            <p className="mb-4 text-slate-600">Tente ajustar os filtros ou criar uma nova assinatura.</p>
            <Link
              href="/subscriptions/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-sky-500 hover:bg-sky-600"
            >
              Criar Nova Assinatura
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700">
              Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium bg-white border rounded-md text-slate-500 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === currentPage
                      ? "bg-sky-500 text-white"
                      : "text-slate-500 bg-white border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium bg-white border rounded-md text-slate-500 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
