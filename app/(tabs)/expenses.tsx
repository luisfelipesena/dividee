import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useExpenses, type Expense } from "../../hooks/useExpenses";

export default function ExpensesPage() {
  // Use the React Query hook to fetch expenses
  const { data: expenses, isLoading, isError, error } = useExpenses();

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <Pressable className="bg-white p-4 rounded-lg shadow-sm mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-text">{item.title}</Text>
        <Text className="text-primary font-bold">${item.amount.toFixed(2)}</Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-gray-500">{item.date}</Text>
        <View className="flex-row items-center">
          <Text className="text-gray-600 mr-2">
            With {item.participants.join(", ")}
          </Text>
          {item.paid ? (
            <FontAwesome name="check-circle" size={18} color="green" />
          ) : (
            <FontAwesome name="clock-o" size={18} color="orange" />
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-primary">Your Expenses</Text>
        <Link href="/expenses" asChild>
          <Pressable className="bg-primary py-2 px-4 rounded-full">
            <FontAwesome name="plus" size={16} color="white" />
          </Pressable>
        </Link>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0891b2" />
          <Text className="mt-2 text-gray-600">Loading expenses...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center items-center">
          <FontAwesome name="exclamation-circle" size={50} color="#ef4444" />
          <Text className="mt-2 text-red-500">Error loading expenses</Text>
          <Text className="text-gray-500">{(error as Error).message}</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-gray-500">No expenses found</Text>
              <Link href="/expenses" className="mt-2">
                <Text className="text-primary font-semibold">Add your first expense</Text>
              </Link>
            </View>
          }
        />
      )}
    </View>
  );
} 