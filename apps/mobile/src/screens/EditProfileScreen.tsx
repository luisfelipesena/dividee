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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../hooks/useAuth"
import { api } from "../services/api"

export default function EditProfileScreen() {
  const navigation = useNavigation()
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }))
    }
  }, [user])

  const handleUpdateProfile = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Erro", "Por favor, insira seu nome")
      return
    }

    if (!formData.email.trim()) {
      Alert.alert("Erro", "Por favor, insira seu email")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Erro", "Por favor, insira um email válido")
      return
    }

    setLoading(true)
    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      }

      // If user wants to change password
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          Alert.alert("Erro", "Digite sua senha atual para alterar a senha")
          return
        }

        if (formData.newPassword.length < 6) {
          Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres")
          return
        }

        if (formData.newPassword !== formData.confirmPassword) {
          Alert.alert("Erro", "As senhas não coincidem")
          return
        }

        payload.currentPassword = formData.currentPassword
        payload.newPassword = formData.newPassword
      }

      await api.put("/profile", payload)

      Alert.alert("Sucesso!", "Perfil atualizado com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            refreshUser()
            navigation.goBack()
          },
        },
      ])
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error)
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível atualizar o perfil"
      )
    } finally {
      setLoading(false)
    }
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
              <Text className="text-3xl font-bold text-white mb-2">Editar Perfil</Text>
              <Text className="text-slate-400">
                Atualize suas informações pessoais e senha
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-6">
              {/* Informações Pessoais */}
              <View>
                <Text className="text-slate-300 font-semibold text-lg mb-4">
                  Informações Pessoais
                </Text>

                {/* Nome */}
                <View className="mb-4">
                  <Text className="text-slate-300 font-medium mb-2">Nome Completo *</Text>
                  <TextInput
                    className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-sky-500"
                    placeholder="Seu nome completo"
                    placeholderTextColor="#64748b"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    autoCapitalize="words"
                    maxLength={100}
                  />
                </View>

                {/* Email */}
                <View>
                  <Text className="text-slate-300 font-medium mb-2">Email *</Text>
                  <TextInput
                    className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-sky-500"
                    placeholder="seu@email.com"
                    placeholderTextColor="#64748b"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    maxLength={100}
                  />
                </View>
              </View>

              {/* Alterar Senha */}
              <View>
                <Text className="text-slate-300 font-semibold text-lg mb-4">
                  Alterar Senha (opcional)
                </Text>

                {/* Senha Atual */}
                <View className="mb-4">
                  <Text className="text-slate-300 font-medium mb-2">Senha Atual</Text>
                  <TextInput
                    className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-sky-500"
                    placeholder="Digite sua senha atual"
                    placeholderTextColor="#64748b"
                    value={formData.currentPassword}
                    onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
                    secureTextEntry
                    maxLength={100}
                  />
                </View>

                {/* Nova Senha */}
                <View className="mb-4">
                  <Text className="text-slate-300 font-medium mb-2">Nova Senha</Text>
                  <TextInput
                    className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-sky-500"
                    placeholder="Digite uma nova senha"
                    placeholderTextColor="#64748b"
                    value={formData.newPassword}
                    onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                    secureTextEntry
                    maxLength={100}
                  />
                  <Text className="text-slate-500 text-xs mt-1">
                    Mínimo de 6 caracteres
                  </Text>
                </View>

                {/* Confirmar Nova Senha */}
                <View>
                  <Text className="text-slate-300 font-medium mb-2">Confirmar Nova Senha</Text>
                  <TextInput
                    className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-sky-500"
                    placeholder="Confirme a nova senha"
                    placeholderTextColor="#64748b"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    secureTextEntry
                    maxLength={100}
                  />
                </View>
              </View>

              {/* Info Box */}
              <View className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <Text className="text-yellow-400 font-semibold mb-2">⚠️ Importante</Text>
                <Text className="text-slate-300 text-sm leading-5">
                  Se você alterar sua senha, precisará fazer login novamente em todos os dispositivos.
                </Text>
              </View>
            </View>

            {/* Spacer */}
            <View className="flex-1" />

            {/* Actions */}
            <View className="space-y-3 pb-6">
              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={loading}
                className={`py-4 px-6 rounded-lg ${
                  loading ? "bg-slate-700" : "bg-sky-500"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-lg">
                    Salvar Alterações
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