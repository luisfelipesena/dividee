import { FontAwesome } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

export default function ProfilePage() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="items-center pt-8 pb-4 bg-primary">
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
          className="w-24 h-24 rounded-full border-4 border-white mb-2"
        />
        <Text className="text-xl font-bold text-white">Emma Wilson</Text>
        <Text className="text-white opacity-80">emma.wilson@example.com</Text>
      </View>

      <View className="p-4">
        <View className="bg-white p-4 rounded-lg shadow-md mb-4">
          <Text className="text-xl font-semibold text-primary mb-4">Account Summary</Text>
          
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <FontAwesome name="money" size={20} color="#0891b2" className="mr-2" />
              <Text className="text-text ml-2">Total spent</Text>
            </View>
            <Text className="font-semibold">$325.85</Text>
          </View>
          
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <FontAwesome name="users" size={20} color="#0891b2" className="mr-2" />
              <Text className="text-text ml-2">Active groups</Text>
            </View>
            <Text className="font-semibold">3</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <FontAwesome name="credit-card" size={20} color="#0891b2" className="mr-2" />
              <Text className="text-text ml-2">Pending payments</Text>
            </View>
            <Text className="font-semibold">$48.25</Text>
          </View>
        </View>

        <View className="bg-white p-4 rounded-lg shadow-md">
          <Text className="text-xl font-semibold text-primary mb-4">Settings</Text>
          
          <Pressable className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <FontAwesome name="bell" size={20} color="#64748b" />
              <Text className="text-text ml-4">Notifications</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#64748b" />
          </Pressable>
          
          <Pressable className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <FontAwesome name="lock" size={20} color="#64748b" />
              <Text className="text-text ml-4">Privacy</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#64748b" />
          </Pressable>
          
          <Pressable className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <FontAwesome name="question-circle" size={20} color="#64748b" />
              <Text className="text-text ml-4">Help Center</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#64748b" />
          </Pressable>
          
          <Pressable className="flex-row justify-between items-center py-3">
            <View className="flex-row items-center">
              <FontAwesome name="sign-out" size={20} color="#ef4444" />
              <Text className="text-red-500 ml-4">Logout</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
} 