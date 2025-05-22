import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useCreateExpense } from "../../hooks/useExpenses";

export default function AddExpensePage() {
  const router = useRouter();
  const { mutate, isPending, isError, error } = useCreateExpense();
  
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [participants, setParticipants] = useState("");
  
  const handleSubmit = () => {
    if (!title || !amount || !participants) {
      return;
    }
    
    mutate(
      {
        title,
        amount: parseFloat(amount),
        date,
        participants: participants.split(",").map(p => p.trim()),
        paid: false,
      },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };
  
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6">
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="mr-4">
            <FontAwesome name="arrow-left" size={24} color="#0891b2" />
          </Pressable>
          <Text className="text-2xl font-bold text-primary">Add New Expense</Text>
        </View>
        
        {isError && (
          <View className="bg-red-100 p-3 rounded-md mb-4">
            <Text className="text-red-700">{(error as Error).message || "Failed to create expense"}</Text>
          </View>
        )}
        
        <View className="bg-white p-4 rounded-lg shadow-md mb-6">
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Title</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-3"
              value={title}
              onChangeText={setTitle}
              placeholder="What was this expense for?"
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Amount ($)</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-3"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Date</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-3"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          
          <View className="mb-6">
            <Text className="text-gray-700 mb-2">Participants (comma separated)</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-3"
              value={participants}
              onChangeText={setParticipants}
              placeholder="John, Sarah, etc."
            />
          </View>
          
          <Pressable
            className={`py-3 rounded-md ${
              !title || !amount || !participants
                ? "bg-gray-400"
                : isPending
                ? "bg-blue-300"
                : "bg-primary"
            }`}
            onPress={handleSubmit}
            disabled={!title || !amount || !participants || isPending}
          >
            <View className="flex-row justify-center items-center">
              {isPending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <FontAwesome name="plus" size={16} color="white" className="mr-2" />
              )}
              <Text className="text-white font-semibold ml-2">
                {isPending ? "Saving..." : "Save Expense"}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
} 