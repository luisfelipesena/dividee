import { Link } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useExpenses } from "../../hooks/useExpenses";

export default function HomePage() {
  const { data: expenses, isLoading, isError } = useExpenses();
  
  // Get the two most recent expenses
  const recentExpenses = expenses?.slice(0, 2) || [];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6">
        <Text className="text-3xl font-bold text-primary mb-2">Welcome to Dividee</Text>
        <Text className="text-lg text-text mb-6">Your expense sharing app</Text>
        
        <View className="bg-white p-4 rounded-lg shadow-md mb-4">
          <Text className="text-xl font-semibold text-primary mb-2">Recent Expenses</Text>
          
          {isLoading ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#0891b2" />
            </View>
          ) : isError ? (
            <Text className="text-red-500 py-2">Failed to load expenses</Text>
          ) : recentExpenses.length === 0 ? (
            <Text className="text-gray-500 py-2">No expenses yet</Text>
          ) : (
            recentExpenses.map((expense) => (
              <View key={expense.id} className="border-b border-gray-200 py-2">
                <Text className="text-text">{expense.title} - ${expense.amount.toFixed(2)}</Text>
                <Text className="text-sm text-gray-500">
                  With {expense.participants.join(", ")}
                </Text>
              </View>
            ))
          )}
          
          <Link href="/expenses" className="mt-2">
            <Text className="text-primary font-semibold">View all expenses →</Text>
          </Link>
        </View>
        
        <View className="bg-white p-4 rounded-lg shadow-md">
          <Text className="text-xl font-semibold text-primary mb-2">Quick Actions</Text>
          <Link href="/expenses" className="bg-primary py-2 px-4 rounded-md mb-2">
            <Text className="text-white text-center font-semibold">Add New Expense</Text>
          </Link>
          <Link href="/profile" className="bg-secondary py-2 px-4 rounded-md">
            <Text className="text-white text-center font-semibold">View Profile</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
