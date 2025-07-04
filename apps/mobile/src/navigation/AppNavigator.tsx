import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native"

// Import screens
import { useAuth } from "../hooks/useAuth"
import AccessRequestsScreen from "../screens/AccessRequestsScreen"
import AuthScreen from "../screens/AuthScreen"
import CreateGroupScreen from "../screens/CreateGroupScreen"
import CreateSubscriptionScreen from "../screens/CreateSubscriptionScreen"
import DashboardScreen from "../screens/DashboardScreen"
import EditProfileScreen from "../screens/EditProfileScreen"
import ExploreScreen from "../screens/ExploreScreen"
import GroupsScreen from "../screens/GroupsScreen"
import LandingScreen from "../screens/LandingScreen"
import NotificationsScreen from "../screens/NotificationsScreen"
import ProfileScreen from "../screens/ProfileScreen"
import SubscriptionDetailsScreen from "../screens/SubscriptionDetailsScreen"
import SubscriptionsScreen from "../screens/SubscriptionsScreen"

import { colors, spacing, typography } from "../styles/theme"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

// Modern tab icon component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const getIconInfo = () => {
    switch (name) {
      case "Dashboard":
        return { icon: "📊", label: "Início" }
      case "Subscriptions":
        return { icon: "📺", label: "Minhas" }
      case "Explore":
        return { icon: "🔍", label: "Explorar" }
      case "Groups":
        return { icon: "👥", label: "Grupos" }
      case "Profile":
        return { icon: "👤", label: "Perfil" }
      default:
        return { icon: "•", label: name }
    }
  }

  const { icon, label } = getIconInfo()

  return (
    <View style={styles.tabIconContainer}>
      <View style={[
        styles.iconWrapper,
        focused && styles.iconWrapperFocused
      ]}>
        <Text style={[
          styles.iconText,
          focused && styles.iconTextFocused
        ]}>
          {icon}
        </Text>
      </View>
      <Text style={[
        styles.labelText,
        focused && styles.labelTextFocused
      ]}>
        {label}
      </Text>
      {focused && <View style={styles.focusIndicator} />}
    </View>
  )
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.muted,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        headerStyle: styles.header,
        headerTintColor: colors.text.primary,
        headerTitleStyle: styles.headerTitle,
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ 
          title: "Dashboard",
          headerTitle: "Meu Painel"
        }} 
      />
      <Tab.Screen 
        name="Subscriptions" 
        component={SubscriptionsScreen} 
        options={{ 
          title: "Minhas Assinaturas",
          headerTitle: "Minhas Assinaturas"
        }} 
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen} 
        options={{ 
          title: "Explorar",
          headerTitle: "Explorar Assinaturas"
        }} 
      />
      <Tab.Screen 
        name="Groups" 
        component={GroupsScreen} 
        options={{ 
          title: "Meus Grupos",
          headerTitle: "Meus Grupos"
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: "Perfil",
          headerTitle: "Meu Perfil"
        }} 
      />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Text style={styles.loadingIconText}>💳</Text>
        </View>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: styles.header,
          headerTintColor: colors.text.primary,
          headerTitleStyle: styles.headerTitle,
          headerTitleAlign: 'center',
        }}
      >
        {user ? (
          <>
            <Stack.Screen 
              name="Main" 
              component={TabNavigator} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="CreateGroup" 
              component={CreateGroupScreen} 
              options={{ 
                title: "Criar Grupo",
                presentation: 'modal'
              }} 
            />
            <Stack.Screen 
              name="CreateSubscription" 
              component={CreateSubscriptionScreen} 
              options={{ 
                title: "Nova Assinatura",
                presentation: 'modal'
              }} 
            />
            <Stack.Screen 
              name="AccessRequests" 
              component={AccessRequestsScreen} 
              options={{ title: "Solicitações de Acesso" }} 
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen} 
              options={{ title: "Notificações" }} 
            />
            <Stack.Screen 
              name="SubscriptionDetails" 
              component={SubscriptionDetailsScreen} 
              options={{ title: "Detalhes da Assinatura" }} 
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen} 
              options={{ title: "Editar Perfil" }} 
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Landing" 
              component={LandingScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen} 
              options={{ 
                title: "Entrar",
                headerShown: false
              }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  // Tab Bar Styles
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.slate[600],
    borderTopWidth: 1,
    height: 90,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  } as ViewStyle,

  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  } as ViewStyle,

  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    backgroundColor: 'transparent',
  } as ViewStyle,

  iconWrapperFocused: {
    backgroundColor: colors.primary[500] + '20',
  } as ViewStyle,

  iconText: {
    fontSize: 20,
    color: colors.text.muted,
  } as TextStyle,

  iconTextFocused: {
    color: colors.primary[500],
  } as TextStyle,

  labelText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
    fontWeight: '500',
    textAlign: 'center',
  } as TextStyle,

  labelTextFocused: {
    color: colors.primary[500],
    fontWeight: '600',
  } as TextStyle,

  focusIndicator: {
    position: 'absolute',
    bottom: -spacing.sm,
    width: 20,
    height: 2,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
  } as ViewStyle,

  // Header Styles
  header: {
    backgroundColor: colors.surface,
    shadowColor: colors.slate[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  headerTitle: {
    fontWeight: '700',
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  } as ViewStyle,

  loadingIconText: {
    fontSize: 40,
  } as TextStyle,

  loadingText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    fontWeight: '500',
  } as TextStyle,
})
