import React, { useState } from "react"
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../hooks/useAuth"

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const navigation = useNavigation()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [biometricEnabled, setBiometricEnabled] = useState(false)

  const handleLogout = () => {
    Alert.alert("Logout", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => logout(),
      },
    ])
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      "Excluir Conta",
      "Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            // Implement account deletion
            Alert.alert("Info", "Funcionalidade em desenvolvimento")
          },
        },
      ]
    )
  }

  const menuItems = [
    {
      title: "Conta",
      items: [
        {
          icon: "👤",
          label: "Editar Perfil",
          type: "action" as const,
          onPress: () => navigation.navigate("EditProfile" as never),
        },
        {
          icon: "🔒",
          label: "Alterar Senha",
          type: "action" as const,
          onPress: () => Alert.alert("Info", "Funcionalidade em desenvolvimento"),
        },
        {
          icon: "🔐",
          label: "Autenticação de Dois Fatores",
          type: "action" as const,
          onPress: () => Alert.alert("Info", "Funcionalidade em desenvolvimento"),
        },
      ],
    },
    {
      title: "Configurações",
      items: [
        {
          icon: "🔔",
          label: "Notificações",
          type: "action" as const,
          onPress: () => navigation.navigate("Notifications" as never),
        },
        {
          icon: "🔔",
          label: "Ativar Notificações",
          type: "toggle" as const,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: "📱",
          label: "Biometria",
          type: "toggle" as const,
          value: biometricEnabled,
          onToggle: setBiometricEnabled,
        },
        {
          icon: "🌙",
          label: "Tema Escuro",
          type: "toggle" as const,
          value: true,
          disabled: true,
        },
      ],
    },
    {
      title: "Informações",
      items: [
        {
          icon: "💰",
          label: "Relatório Financeiro",
          type: "action" as const,
          onPress: () => Alert.alert("Info", "Funcionalidade em desenvolvimento"),
        },
        {
          icon: "📊",
          label: "Estatísticas de Uso",
          type: "action" as const,
          onPress: () => Alert.alert("Info", "Funcionalidade em desenvolvimento"),
        },
        {
          icon: "📄",
          label: "Termos de Uso",
          type: "action" as const,
          onPress: () => Alert.alert("Info", "Funcionalidade em desenvolvimento"),
        },
        {
          icon: "🔒",
          label: "Política de Privacidade",
          type: "action" as const,
          onPress: () => Alert.alert("Info", "Funcionalidade em desenvolvimento"),
        },
      ],
    },
    {
      title: "Suporte",
      items: [
        {
          icon: "❓",
          label: "Central de Ajuda",
          type: "action" as const,
          onPress: () => Alert.alert("Info", "Funcionalidade em desenvolvimento"),
        },
        {
          icon: "📧",
          label: "Contatar Suporte",
          type: "action" as const,
          onPress: () => Alert.alert("Info", "Funcionalidade em desenvolvimento"),
        },
        {
          icon: "⭐",
          label: "Avaliar App",
          type: "action" as const,
          onPress: () => Alert.alert("Info", "Funcionalidade em desenvolvimento"),
        },
      ],
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="p-6 border-b border-slate-700">
          <View className="items-center">
            <View className="items-center justify-center w-20 h-20 mb-4 rounded-full bg-sky-600">
              <Text className="text-2xl font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</Text>
            </View>
            <Text className="text-xl font-bold text-white">{user?.name}</Text>
            <Text className="text-sm text-slate-400">{user?.email}</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} className="py-4">
            <Text className="px-6 mb-3 text-sm font-medium text-slate-400">{section.title}</Text>

            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                onPress={item.type === "action" ? item.onPress : undefined}
                disabled={item.type === "toggle" && item.disabled}
                className={`flex-row items-center justify-between px-6 py-4 ${
                  item.type === "toggle" && item.disabled ? "opacity-50" : ""
                }`}
              >
                <View className="flex-row items-center flex-1">
                  <Text className="mr-3 text-lg">{item.icon}</Text>
                  <Text className="font-medium text-white">{item.label}</Text>
                </View>

                {item.type === "toggle" ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.disabled ? undefined : item.onToggle}
                    disabled={item.disabled}
                    trackColor={{ false: "#374151", true: "#0ea5e9" }}
                    thumbColor={item.value ? "#ffffff" : "#d1d5db"}
                  />
                ) : (
                  <Text className="text-slate-400">›</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout Section */}
        <View className="p-6 space-y-3">
          <TouchableOpacity onPress={handleLogout} className="py-3 bg-red-600 rounded-lg">
            <Text className="font-medium text-center text-white">Sair da Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="py-3 border border-red-500 rounded-lg bg-slate-800"
          >
            <Text className="font-medium text-center text-red-400">Excluir Conta</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="items-center p-6 border-t border-slate-700">
          <Text className="text-sm text-slate-500">Carteira v1.0.0</Text>
          <Text className="mt-1 text-xs text-slate-500">© 2024 Carteira. Todos os direitos reservados.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
