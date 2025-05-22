import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { WebNavbar } from "../components/ui/WebNavbar";
import "./globals.css";

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <View style={{ flex: 1 }}>
        <WebNavbar />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#0891b2",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            // Ocultar o header na versão web
            headerShown: false,
          }}
        />
      </View>
    </QueryClientProvider>
  );
}
