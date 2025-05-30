"use client"

import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Group {
  id: string
  name: string
  description: string
  maxMembers: number
  memberCount: number
  isOwner: boolean
  role: string
  createdAt: string
  subscriptionsCount: number
}

export default function GroupsPage() {
  const { user, isLoading } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")

  useEffect(() => {
    if (user) {
      fetchGroups()
    }
  }, [user])

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups)
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleInviteMember = async () => {
    if (!selectedGroupId || !inviteEmail.trim()) return

    try {
      const response = await fetch(`/api/groups/${selectedGroupId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          message: inviteMessage,
        }),
      })

      if (response.ok) {
        alert("Convite enviado com sucesso!")
        setShowInviteModal(false)
        setInviteEmail("")
        setInviteMessage("")
        setSelectedGroupId(null)
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao enviar convite")
      }
    } catch (error) {
      console.error("Error sending invite:", error)
      alert("Erro ao enviar convite")
    }
  }

  const openInviteModal = (groupId: string) => {
    setSelectedGroupId(groupId)
    setShowInviteModal(true)
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
              <Link href="/groups" className="font-medium text-sky-600">
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
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Meus Grupos</h1>
            <p className="mt-2 text-slate-600">Gerencie seus grupos e organize suas assinaturas compartilhadas</p>
          </div>
          <Link
            href="/groups/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-sky-500 hover:bg-sky-600"
          >
            + Novo Grupo
          </Link>
        </div>

        {/* Groups Grid */}
        {groups.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div key={group.id} className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-slate-900">{group.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{group.description}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        group.isOwner
                          ? "bg-sky-100 text-sky-800"
                          : group.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {group.isOwner ? "Dono" : group.role === "admin" ? "Admin" : "Membro"}
                    </span>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Membros:</span>
                      <span className="text-slate-900">
                        {group.memberCount}
                        {group.maxMembers ? `/${group.maxMembers}` : ""}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Assinaturas:</span>
                      <span className="text-slate-900">{group.subscriptionsCount}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Criado em:</span>
                      <span className="text-slate-600">{new Date(group.createdAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={`/groups/${group.id}`}
                      className="block w-full px-4 py-2 text-sm font-medium text-center border rounded-md border-sky-300 text-sky-600 hover:bg-sky-50"
                    >
                      Ver Detalhes
                    </Link>

                    {(group.isOwner || group.role === "admin") && (
                      <button
                        onClick={() => openInviteModal(group.id)}
                        className="w-full px-4 py-2 text-sm font-medium text-white rounded-md bg-sky-500 hover:bg-sky-600"
                      >
                        Convidar Membro
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-slate-900">Você ainda não faz parte de nenhum grupo</h3>
            <p className="mb-6 text-slate-600">
              Crie seu primeiro grupo para começar a compartilhar assinaturas com outras pessoas.
            </p>
            <Link
              href="/groups/new"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white border border-transparent rounded-md bg-sky-500 hover:bg-sky-600"
            >
              Criar Primeiro Grupo
            </Link>
          </div>
        )}
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
            <h3 className="mb-4 text-lg font-medium text-slate-900">Convidar Membro</h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Email do convidado</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Digite o email..."
                  className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Mensagem (opcional)</label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Adicione uma mensagem personalizada..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setInviteEmail("")
                  setInviteMessage("")
                  setSelectedGroupId(null)
                }}
                className="px-4 py-2 text-sm font-medium bg-white border rounded-md text-slate-700 border-slate-300 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleInviteMember}
                disabled={!inviteEmail.trim()}
                className="px-4 py-2 text-sm font-medium text-white rounded-md bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
