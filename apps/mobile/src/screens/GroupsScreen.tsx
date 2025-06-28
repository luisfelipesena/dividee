import React, { useEffect, useState } from "react"
import { Alert, Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import api from "../services/api"

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

export default function GroupsScreen() {
  const navigation = useNavigation()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await api.get("/groups")

      if (response.data) {
        setGroups(response.data.groups)
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
      Alert.alert("Erro", "Não foi possível carregar seus grupos")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleInviteMember = async () => {
    if (!selectedGroupId || !inviteEmail.trim()) {
      Alert.alert("Erro", "Email é obrigatório")
      return
    }

    try {
      const response = await api.post(`/groups/${selectedGroupId}/invite`, {
        email: inviteEmail,
        message: inviteMessage,
      })

      if (response.data) {
        Alert.alert("Sucesso!", "Convite enviado com sucesso!")
        setShowInviteModal(false)
        setInviteEmail("")
        setInviteMessage("")
        setSelectedGroupId(null)
      }
    } catch (error: any) {
      console.error("Error sending invite:", error)
      Alert.alert("Erro", error?.response?.data?.error || "Erro ao enviar convite")
    }
  }

  const openInviteModal = (groupId: string) => {
    setSelectedGroupId(groupId)
    setShowInviteModal(true)
  }

  const closeInviteModal = () => {
    setShowInviteModal(false)
    setInviteEmail("")
    setInviteMessage("")
    setSelectedGroupId(null)
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchGroups()
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="items-center justify-center flex-1">
          <Text className="text-lg text-sky-400">Carregando grupos...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-slate-700">
        <View>
          <Text className="text-xl font-bold text-white">Meus Grupos</Text>
          <Text className="text-sm text-slate-400">
            {groups.length} grupo{groups.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('CreateGroup' as never)}
          className="px-4 py-2 rounded-lg bg-sky-600"
        >
          <Text className="font-medium text-white">+ Novo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {groups.length > 0 ? (
          <View className="p-4 space-y-4">
            {groups.map((group) => (
              <View key={group.id} className="p-4 rounded-lg bg-slate-800">
                {/* Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-white">{group.name}</Text>
                    <Text className="mt-1 text-sm text-slate-300">{group.description}</Text>
                  </View>
                  <View
                    className={`px-2 py-1 rounded-full ${
                      group.isOwner ? "bg-sky-100" : group.role === "admin" ? "bg-purple-100" : "bg-slate-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        group.isOwner ? "text-sky-800" : group.role === "admin" ? "text-purple-800" : "text-slate-800"
                      }`}
                    >
                      {group.isOwner ? "Dono" : group.role === "admin" ? "Admin" : "Membro"}
                    </Text>
                  </View>
                </View>

                {/* Stats */}
                <View className="flex-row justify-between mb-4">
                  <View>
                    <Text className="text-xs text-slate-400">Membros</Text>
                    <Text className="font-medium text-white">
                      {group.memberCount}
                      {group.maxMembers ? `/${group.maxMembers}` : ""}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-xs text-slate-400">Assinaturas</Text>
                    <Text className="font-medium text-white">{group.subscriptionsCount}</Text>
                  </View>

                  <View>
                    <Text className="text-xs text-slate-400">Criado em</Text>
                    <Text className="font-medium text-white">
                      {new Date(group.createdAt).toLocaleDateString("pt-BR")}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="space-y-3">
                  <TouchableOpacity 
                    onPress={() => {
                      // TODO: Navegar para tela de detalhes do grupo quando implementada
                      // Na tela de detalhes, adicionar botão para navegar para CreateSubscriptionScreen
                      // navigation.navigate('GroupDetails', { groupId: group.id } as never)
                    }}
                    className="py-3 border rounded-lg bg-slate-700 border-sky-600"
                  >
                    <Text className="font-medium text-center text-sky-400">Ver Detalhes</Text>
                  </TouchableOpacity>

                  {(group.isOwner || group.role === "admin") && (
                    <TouchableOpacity onPress={() => openInviteModal(group.id)} className="py-3 rounded-lg bg-sky-600">
                      <Text className="font-medium text-center text-white">Convidar Membro</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center flex-1 p-8">
            <Text className="mb-4 text-6xl">👥</Text>
            <Text className="mb-2 text-xl font-bold text-center text-white">Nenhum grupo ainda</Text>
            <Text className="mb-6 text-center text-slate-400">
              Crie seu primeiro grupo para começar a compartilhar assinaturas com outras pessoas
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('CreateGroup' as never)}
              className="px-6 py-3 rounded-lg bg-sky-600"
            >
              <Text className="font-semibold text-white">Criar Primeiro Grupo</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Invite Modal */}
      <Modal visible={showInviteModal} transparent={true} animationType="slide" onRequestClose={closeInviteModal}>
        <View className="justify-end flex-1 bg-black bg-opacity-50">
          <View className="p-6 rounded-t-lg bg-slate-800">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-white">Convidar Membro</Text>
              <TouchableOpacity onPress={closeInviteModal}>
                <Text className="text-xl text-slate-400">✕</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="mb-2 text-sm text-slate-300">Email do convidado *</Text>
                <TextInput
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  placeholder="Digite o email..."
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="px-4 py-3 text-white rounded-lg bg-slate-700"
                />
              </View>

              <View>
                <Text className="mb-2 text-sm text-slate-300">Mensagem (opcional)</Text>
                <TextInput
                  value={inviteMessage}
                  onChangeText={setInviteMessage}
                  placeholder="Adicione uma mensagem personalizada..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                  className="px-4 py-3 text-white rounded-lg bg-slate-700"
                />
              </View>
            </View>

            <View className="flex-row mt-6 space-x-3">
              <TouchableOpacity
                onPress={closeInviteModal}
                className="flex-1 py-3 border rounded-lg bg-slate-700 border-slate-600"
              >
                <Text className="font-medium text-center text-slate-300">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleInviteMember}
                className={`flex-1 py-3 rounded-lg ${inviteEmail.trim() ? "bg-sky-600" : "bg-slate-600"}`}
                disabled={!inviteEmail.trim()}
              >
                <Text className={`font-medium text-center ${inviteEmail.trim() ? "text-white" : "text-slate-400"}`}>
                  Enviar Convite
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
