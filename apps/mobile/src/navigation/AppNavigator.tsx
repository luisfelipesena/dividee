import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { Text, View } from "react-native"

// Import screens
import { useAuth } from "../hooks/useAuth"
import AuthScreen from "../screens/AuthScreen"
import DashboardScreen from "../screens/DashboardScreen"
import ExploreScreen from "../screens/ExploreScreen"
import GroupsScreen from "../screens/GroupsScreen"
import LandingScreen from "../screens/LandingScreen"
import ProfileScreen from "../screens/ProfileScreen"
import SubscriptionsScreen from "../screens/SubscriptionsScreen"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

// Simple icon component for tabs
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const getIcon = () => {
    switch (name) {
      case "Dashboard":
        return "📊"
      case "Subscriptions":
        return "📺"
      case "Groups":
        return "👥"
      case "Explore":
        return "🔍"
      case "Profile":
        return "👤"
      default:
        return "•"
    }
  }

  return (
    <View className="items-center">
      <Text className={`text-lg ${focused ? "text-sky-500" : "text-slate-400"}`}>{getIcon()}</Text>
      <Text className={`text-xs ${focused ? "text-sky-500" : "text-slate-400"}`}>{name}</Text>
    </View>
  )
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarStyle: {
          backgroundColor: "#1e293b",
          borderTopColor: "#374151",
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#0ea5e9",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: "#1e293b",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Dashboard" }} />
      <Tab.Screen name="Subscriptions" component={SubscriptionsScreen} options={{ title: "Minhas Assinaturas" }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: "Explorar" }} />
      <Tab.Screen name="Groups" component={GroupsScreen} options={{ title: "Meus Grupos" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-slate-900">
        <Text className="text-lg text-sky-400">Carregando...</Text>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#1e293b",
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        {user ? (
          <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Auth" component={AuthScreen} options={{ title: "Login / Cadastro" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
