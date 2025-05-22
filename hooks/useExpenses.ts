import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import env from "../config/env";

// Type definition for expenses
export type Expense = {
  id: string;
  title: string;
  amount: number;
  date: string;
  participants: string[];
  paid: boolean;
};

// Fallback data in case API fails
export const FALLBACK_EXPENSES: Expense[] = [
  {
    id: "1",
    title: "Dinner",
    amount: 45.00,
    date: "2025-05-15",
    participants: ["John", "Sarah"],
    paid: true,
  },
  {
    id: "2",
    title: "Groceries",
    amount: 32.50,
    date: "2025-05-14",
    participants: ["Roommates"],
    paid: false,
  },
];

// Log for debugging
const logApiCall = (url: string, method: string) => {
  if (env.isDevelopment) {
    console.log(`🌐 API ${method} ${url}`);
  }
};

// Fetch all expenses
export const fetchExpenses = async (): Promise<Expense[]> => {
  const baseUrl = env.apiConfig.baseUrl;
  const url = `${baseUrl}/api/expenses`;
  
  logApiCall(url, "GET");
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("API Error:", response.status, response.statusText);
      throw new Error(`Failed to fetch expenses: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.expenses) {
      console.error("API Error: Invalid response format", data);
      throw new Error("Invalid response format from API");
    }
    
    return data.expenses;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

// Fetch a single expense by ID
export const fetchExpenseById = async (id: string): Promise<Expense> => {
  const baseUrl = env.apiConfig.baseUrl;
  const url = `${baseUrl}/api/expenses/${id}`;
  
  logApiCall(url, "GET");
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("API Error:", response.status, response.statusText);
      throw new Error(`Failed to fetch expense: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.expense) {
      console.error("API Error: Invalid response format", data);
      throw new Error("Invalid response format from API");
    }
    
    return data.expense;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

// Create a new expense
export const createExpense = async (expense: Omit<Expense, "id">): Promise<Expense> => {
  const baseUrl = env.apiConfig.baseUrl;
  const url = `${baseUrl}/api/expenses`;
  
  logApiCall(url, "POST");
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expense),
    });
    
    if (!response.ok) {
      console.error("API Error:", response.status, response.statusText);
      throw new Error(`Failed to create expense: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.expense) {
      console.error("API Error: Invalid response format", data);
      throw new Error("Invalid response format from API");
    }
    
    return data.expense;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

// Update an existing expense
export const updateExpense = async (expense: Expense): Promise<Expense> => {
  const baseUrl = env.apiConfig.baseUrl;
  const url = `${baseUrl}/api/expenses/${expense.id}`;
  
  logApiCall(url, "PUT");
  
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expense),
    });
    
    if (!response.ok) {
      console.error("API Error:", response.status, response.statusText);
      throw new Error(`Failed to update expense: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.expense) {
      console.error("API Error: Invalid response format", data);
      throw new Error("Invalid response format from API");
    }
    
    return data.expense;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

// Delete an expense
export const deleteExpense = async (id: string): Promise<Expense> => {
  const baseUrl = env.apiConfig.baseUrl;
  const url = `${baseUrl}/api/expenses/${id}`;
  
  logApiCall(url, "DELETE");
  
  try {
    const response = await fetch(url, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      console.error("API Error:", response.status, response.statusText);
      throw new Error(`Failed to delete expense: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.expense) {
      console.error("API Error: Invalid response format", data);
      throw new Error("Invalid response format from API");
    }
    
    return data.expense;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

// Hook for fetching all expenses
export const useExpenses = () => {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
    retry: 2, // Retry up to 2 times on failure
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: FALLBACK_EXPENSES, // Use fallback data while loading
  });
};

// Hook for fetching a single expense
export const useExpense = (id: string) => {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () => fetchExpenseById(id),
    retry: 2,
    staleTime: 30000,
    enabled: !!id, // Only run if an ID is provided
  });
};

// Hook for creating a new expense
export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      // Invalidate and refetch expenses list after creating a new expense
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

// Hook for updating an expense
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateExpense,
    onSuccess: (updatedExpense) => {
      // Update both the list and the individual expense cache
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", updatedExpense.id] });
    },
  });
};

// Hook for deleting an expense
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: (_, variables) => {
      // variables is the id that was passed to deleteExpense
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.removeQueries({ queryKey: ["expense", variables] });
    },
  });
}; 