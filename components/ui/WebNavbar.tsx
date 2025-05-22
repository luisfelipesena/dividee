import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";

export function WebNavbar() {
  // Só renderizar em ambiente web
  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View className="flex-row justify-between items-center bg-primary p-4 shadow-md">
      <Link href="/" className="flex-row items-center">
        <FontAwesome name="home" size={20} color="white" />
        <Text className="text-white font-bold ml-2 text-lg">Dividee</Text>
      </Link>
      
      <View className="flex-row items-center">
        <Link href="/" className="mx-3">
          <View className="flex-row items-center">
            <FontAwesome name="home" size={16} color="white" />
            <Text className="text-white ml-2">Home</Text>
          </View>
        </Link>
        
        <Link href="/expenses" className="mx-3">
          <View className="flex-row items-center">
            <FontAwesome name="dollar" size={16} color="white" />
            <Text className="text-white ml-2">Expenses</Text>
          </View>
        </Link>
        
        <Link href="/profile" className="mx-3">
          <View className="flex-row items-center">
            <FontAwesome name="user" size={16} color="white" />
            <Text className="text-white ml-2">Profile</Text>
          </View>
        </Link>
        
        <Link href="/expenses" asChild>
          <Pressable className="ml-4 bg-white px-3 py-1 rounded-md flex-row items-center">
            <FontAwesome name="plus" size={14} color="#0891b2" />
            <Text className="text-primary font-semibold ml-1">Add Expense</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
} 