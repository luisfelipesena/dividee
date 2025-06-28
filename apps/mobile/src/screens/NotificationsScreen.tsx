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

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: any
}

const NOTIFICATION_ICONS: Record<string, string> = {
  payment_reminder: "💳",
  renewal_warning: "⏰",
  password_change: "🔑",
  access_request: "📩",
  member_joined: "👥",
  member_left: "👋",
  subscription_expired: "❌",
  default: "🔔",
}

const NOTIFICATION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  payment_reminder: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  renewal_warning: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  password_change: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  access_request: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  member_joined: { bg: "bg-sky-500/20", text: "text-sky-400", border: "border-sky-500/30" },
  member_left: { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30" },
  subscription_expired: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  default: { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30" },
}

export default function NotificationsScreen() {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useFocusEffect(
    useCallback(() => {
      loadNotifications()
    }, [])
  )

  const loadNotifications = async () => {
    try {
      const response = await api.get("/notifications")
      setNotifications(response.data || [])
    } catch (error) {
      console.error("Erro ao carregar notificações:", error)
      Alert.alert("Erro", "Não foi possível carregar as notificações")
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadNotifications()
    setRefreshing(false)
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      
      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      )
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead)
    
    if (unreadNotifications.length === 0) {
      Alert.alert("Info", "Todas as notificações já foram lidas")
      return
    }

    try {
      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map((notification) =>
          api.put(`/notifications/${notification.id}/read`)
        )
      )

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      )

      Alert.alert("Sucesso!", "Todas as notificações foram marcadas como lidas")
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error)
      Alert.alert("Erro", "Não foi possível marcar todas as notificações como lidas")
    }
  }

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case "access_request":
        navigation.navigate("AccessRequests" as never)
        break
      case "payment_reminder":
      case "renewal_warning":
        navigation.navigate("Subscriptions" as never)
        break
      case "member_joined":
      case "member_left":
        navigation.navigate("Groups" as never)
        break
      default:
        // For other types, just mark as read
        break
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    const diffInDays = diffInHours / 24

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return `${diffInMinutes}m atrás`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d atrás`
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") {
      return !notification.isRead
    }
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text className="text-slate-400 mt-4">Carregando notificações...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-slate-800">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xl font-bold text-white">Notificações</Text>
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={markAllAsRead}
                className="bg-sky-500 px-3 py-1 rounded-full"
              >
                <Text className="text-white text-sm font-medium">Marcar todas como lidas</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Tabs */}
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={() => setFilter("all")}
              className={`px-4 py-2 rounded-full ${
                filter === "all" ? "bg-sky-500" : "bg-slate-800"
              }`}
            >
              <Text
                className={`font-medium ${
                  filter === "all" ? "text-white" : "text-slate-400"
                }`}
              >
                Todas ({notifications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter("unread")}
              className={`px-4 py-2 rounded-full ${
                filter === "unread" ? "bg-sky-500" : "bg-slate-800"
              }`}
            >
              <Text
                className={`font-medium ${
                  filter === "unread" ? "text-white" : "text-slate-400"
                }`}
              >
                Não lidas ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>
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
          {filteredNotifications.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-6xl mb-4">🔔</Text>
              <Text className="text-xl font-semibold text-white mb-2">
                {filter === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
              </Text>
              <Text className="text-slate-400 text-center px-6">
                {filter === "unread"
                  ? "Todas as suas notificações foram lidas"
                  : "Você receberá notificações sobre seus grupos e assinaturas aqui"}
              </Text>
            </View>
          ) : (
            <View className="px-6 py-4 space-y-3">
              {filteredNotifications.map((notification) => {
                const colors = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.default
                const icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default

                return (
                  <TouchableOpacity
                    key={notification.id}
                    onPress={() => handleNotificationPress(notification)}
                    className={`p-4 rounded-lg border ${
                      notification.isRead
                        ? "bg-slate-800 border-slate-700"
                        : `${colors.bg} ${colors.border}`
                    }`}
                  >
                    <View className="flex-row items-start space-x-3">
                      {/* Icon */}
                      <Text className="text-2xl">{icon}</Text>

                      {/* Content */}
                      <View className="flex-1">
                        <View className="flex-row items-start justify-between mb-1">
                          <Text
                            className={`font-semibold ${
                              notification.isRead ? "text-slate-300" : "text-white"
                            }`}
                          >
                            {notification.title}
                          </Text>
                          <Text className="text-slate-500 text-xs">
                            {formatDate(notification.createdAt)}
                          </Text>
                        </View>

                        <Text
                          className={`text-sm ${
                            notification.isRead ? "text-slate-400" : "text-slate-200"
                          }`}
                        >
                          {notification.message}
                        </Text>

                        {/* Unread Indicator */}
                        {!notification.isRead && (
                          <View className="flex-row items-center mt-2">
                            <View className="w-2 h-2 bg-sky-500 rounded-full mr-2" />
                            <Text className="text-xs text-sky-400 font-medium">Não lida</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}