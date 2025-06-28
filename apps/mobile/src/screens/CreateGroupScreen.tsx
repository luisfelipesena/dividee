import React, { useState } from "react"
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
import { api } from "../services/api"

export default function CreateGroupScreen() {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Erro", "Por favor, insira um nome para o grupo")
      return
    }

    if (formData.name.length < 3) {
      Alert.alert("Erro", "O nome do grupo deve ter pelo menos 3 caracteres")
      return
    }

    setLoading(true)
    try {
      const response = await api.post("/groups", {
        name: formData.name.trim(),
        description: formData.description.trim(),
      })

      if (response.data) {
        Alert.alert(
          "Sucesso!",
          `Grupo "${formData.name}" criado com sucesso!`,
          [
            {
              text: "OK",
              onPress: () => {
                navigation.goBack()
                // Force refresh of groups list
                navigation.navigate("Groups" as never)
              },
            },
          ]
        )
      }
    } catch (error: any) {
      console.error("Erro ao criar grupo:", error)
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível criar o grupo. Tente novamente."
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
              <Text className="text-3xl font-bold text-white mb-2">Criar Novo Grupo</Text>
              <Text className="text-slate-400">
                Grupos são usados para organizar suas assinaturas compartilhadas
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-6">
              {/* Nome do Grupo */}
              <View>
                <Text className="text-slate-300 font-medium mb-2">Nome do Grupo *</Text>
                <TextInput
                  className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-sky-500"
                  placeholder="Ex: Família, Amigos, Trabalho..."
                  placeholderTextColor="#64748b"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  autoCapitalize="words"
                  maxLength={50}
                />
                <Text className="text-xs text-slate-500 mt-1">
                  {formData.name.length}/50 caracteres
                </Text>
              </View>

              {/* Descrição */}
              <View>
                <Text className="text-slate-300 font-medium mb-2">Descrição (opcional)</Text>
                <TextInput
                  className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-sky-500 min-h-[100px]"
                  placeholder="Descreva o propósito deste grupo..."
                  placeholderTextColor="#64748b"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={200}
                />
                <Text className="text-xs text-slate-500 mt-1">
                  {formData.description.length}/200 caracteres
                </Text>
              </View>

              {/* Info Box */}
              <View className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <Text className="text-sky-400 font-semibold mb-2">💡 Dica</Text>
                <Text className="text-slate-300 text-sm leading-5">
                  Após criar o grupo, você poderá adicionar assinaturas e convidar membros para
                  compartilhar os custos.
                </Text>
              </View>
            </View>

            {/* Spacer */}
            <View className="flex-1" />

            {/* Actions */}
            <View className="space-y-3 pb-6">
              <TouchableOpacity
                onPress={handleCreateGroup}
                disabled={loading || !formData.name.trim()}
                className={`py-4 px-6 rounded-lg ${
                  loading || !formData.name.trim()
                    ? "bg-slate-700"
                    : "bg-sky-500"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-lg">
                    Criar Grupo
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