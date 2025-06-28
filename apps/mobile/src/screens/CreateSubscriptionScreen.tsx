import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { Picker } from "@react-native-picker/picker"
import { api } from "../services/api"

interface Group {
  id: string
  name: string
  description?: string
}

export default function CreateSubscriptionScreen() {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false)
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [groups, setGroups] = useState<Group[]>([])
  
  const [formData, setFormData] = useState({
    name: "",
    service: "",
    price: "",
    maxMembers: "",
    renewalDate: "",
    isPublic: false,
    groupId: "",
    description: "",
  })

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      const response = await api.get("/groups")
      setGroups(response.data || [])
    } catch (error) {
      console.error("Erro ao carregar grupos:", error)
      Alert.alert("Erro", "Não foi possível carregar seus grupos")
    } finally {
      setLoadingGroups(false)
    }
  }

  const handleCreateSubscription = async () => {
    // Validações
    if (!formData.name.trim()) {
      Alert.alert("Erro", "Por favor, insira um nome para a assinatura")
      return
    }

    if (!formData.service.trim()) {
      Alert.alert("Erro", "Por favor, insira o nome do serviço")
      return
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      Alert.alert("Erro", "Por favor, insira um preço válido")
      return
    }

    if (!formData.maxMembers || isNaN(Number(formData.maxMembers)) || Number(formData.maxMembers) < 1) {
      Alert.alert("Erro", "Por favor, insira um número válido de membros máximos")
      return
    }

    if (!formData.groupId && !formData.isPublic) {
      Alert.alert("Erro", "Por favor, selecione um grupo ou torne a assinatura pública")
      return
    }

    if (!formData.renewalDate) {
      Alert.alert("Erro", "Por favor, insira a data de renovação (formato: DD/MM/AAAA)")
      return
    }

    // Validar formato da data
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
    if (!dateRegex.test(formData.renewalDate)) {
      Alert.alert("Erro", "Formato de data inválido. Use DD/MM/AAAA")
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: formData.name.trim(),
        service: formData.service.trim(),
        price: Number(formData.price),
        maxMembers: Number(formData.maxMembers),
        renewalDate: formData.renewalDate,
        isPublic: formData.isPublic,
        groupId: formData.isPublic ? null : formData.groupId,
        description: formData.description.trim() || null,
      }

      const response = await api.post("/subscriptions", payload)

      if (response.data) {
        Alert.alert(
          "Sucesso!",
          `Assinatura "${formData.name}" criada com sucesso!`,
          [
            {
              text: "OK",
              onPress: () => {
                navigation.goBack()
                // Force refresh of subscriptions list
                navigation.navigate("Subscriptions" as never)
              },
            },
          ]
        )
      }
    } catch (error: any) {
      console.error("Erro ao criar assinatura:", error)
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível criar a assinatura. Tente novamente."
      )
    } finally {
      setLoading(false)
    }
  }

  if (loadingGroups) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text className="text-slate-400 mt-4">Carregando grupos...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1"
        >
          <View className="flex-1 px-6 py-4">
            {/* Header */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-white mb-2">Nova Assinatura</Text>
              <Text className="text-slate-400">
                Adicione uma nova assinatura para compartilhar com seu grupo
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-6">
              {/* Nome da Assinatura */}
              <View>
                <Text className="text-slate-300 font-medium mb-2">Nome da Assinatura *</Text>
                <TextInput
                  className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-sky-500"
                  placeholder="Ex: Netflix Família, Spotify Premium..."
                  placeholderTextColor="#64748b"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  autoCapitalize="words"
                  maxLength={60}
                />
              </View>

              {/* Serviço */}
              <View>
                <Text className="text-slate-300 font-medium mb-2">Serviço *</Text>
                <TextInput
                  className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-sky-500"
                  placeholder="Ex: Netflix, Spotify, Disney+, Adobe..."
                  placeholderTextColor="#64748b"
                  value={formData.service}
                  onChangeText={(text) => setFormData({ ...formData, service: text })}
                  autoCapitalize="words"
                  maxLength={50}
                />
              </View>

              {/* Preço e Membros */}
              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className="text-slate-300 font-medium mb-2">Preço (R$) *</Text>
                  <TextInput
                    className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-sky-500"
                    placeholder="29.90"
                    placeholderTextColor="#64748b"
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-300 font-medium mb-2">Máx. Membros *</Text>
                  <TextInput
                    className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-sky-500"
                    placeholder="4"
                    placeholderTextColor="#64748b"
                    value={formData.maxMembers}
                    onChangeText={(text) => setFormData({ ...formData, maxMembers: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Data de Renovação */}
              <View>
                <Text className="text-slate-300 font-medium mb-2">Data de Renovação *</Text>
                <TextInput
                  className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-sky-500"
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#64748b"
                  value={formData.renewalDate}
                  onChangeText={(text) => setFormData({ ...formData, renewalDate: text })}
                  maxLength={10}
                />
              </View>

              {/* Assinatura Pública */}
              <View className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-slate-300 font-medium">Assinatura Pública</Text>
                  <Switch
                    value={formData.isPublic}
                    onValueChange={(value) => {
                      setFormData({ ...formData, isPublic: value, groupId: value ? "" : formData.groupId })
                    }}
                    trackColor={{ false: "#374151", true: "#0ea5e9" }}
                    thumbColor={formData.isPublic ? "#ffffff" : "#9ca3af"}
                  />
                </View>
                <Text className="text-slate-400 text-sm">
                  {formData.isPublic
                    ? "Outros usuários poderão encontrar e solicitar acesso"
                    : "Apenas membros convidados poderão participar"}
                </Text>
              </View>

              {/* Seleção de Grupo (apenas se não for pública) */}
              {!formData.isPublic && (
                <View>
                  <Text className="text-slate-300 font-medium mb-2">Grupo *</Text>
                  {groups.length === 0 ? (
                    <View className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                      <Text className="text-slate-400 text-center">
                        Nenhum grupo encontrado. Crie um grupo primeiro.
                      </Text>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("CreateGroup" as never)}
                        className="mt-3 py-2 px-4 bg-sky-500 rounded-lg"
                      >
                        <Text className="text-white text-center font-medium">Criar Grupo</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="bg-slate-800 rounded-lg border border-slate-700">
                      <Picker
                        selectedValue={formData.groupId}
                        onValueChange={(value) => setFormData({ ...formData, groupId: value })}
                        style={{ color: "white" }}
                        dropdownIconColor="white"
                      >
                        <Picker.Item label="Selecione um grupo..." value="" />
                        {groups.map((group) => (
                          <Picker.Item
                            key={group.id}
                            label={group.name}
                            value={group.id}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                </View>
              )}

              {/* Descrição */}
              <View>
                <Text className="text-slate-300 font-medium mb-2">Descrição (opcional)</Text>
                <TextInput
                  className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-sky-500 min-h-[80px]"
                  placeholder="Informações adicionais sobre a assinatura..."
                  placeholderTextColor="#64748b"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={200}
                />
              </View>
            </View>

            {/* Spacer */}
            <View className="flex-1" />

            {/* Actions */}
            <View className="space-y-3 pb-6">
              <TouchableOpacity
                onPress={handleCreateSubscription}
                disabled={loading}
                className={`py-4 px-6 rounded-lg ${
                  loading ? "bg-slate-700" : "bg-sky-500"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-lg">
                    Criar Assinatura
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.goBack()}
                disabled={loading}
                className="py-4 px-6 rounded-lg border border-slate-700"
              >
                <Text className="text-slate-300 text-center font-medium">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}