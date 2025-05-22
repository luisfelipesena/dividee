// Define the Expense type
export type Expense = {
  id: string;
  title: string;
  amount: number;
  date: string;
  participants: string[];
  paid: boolean;
};

// In-memory database for demo purposes
// In a real app, this would be a database connection
// Using a file-scoped variable to maintain state across API requests
const initialExpenses: Expense[] = [
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
  {
    id: "3",
    title: "Movie tickets",
    amount: 24.00,
    date: "2025-05-10",
    participants: ["Alex", "Chris"],
    paid: true,
  },
  {
    id: "4",
    title: "Utility bill",
    amount: 78.35,
    date: "2025-05-05",
    participants: ["Roommates"],
    paid: false,
  },
];

// This global object will persist data between API requests
// In a real app, you would use a database instead
declare global {
  // Using var is necessary here for global declaration
  // eslint-disable-next-line no-var
  var expenses: Expense[];
}

// Initialize the global expenses array if it doesn't exist
if (!global.expenses) {
  global.expenses = [...initialExpenses];
}

// Export the global expenses reference
export const expenses = global.expenses;

// Reset the data to initial state (useful for testing)
export function resetExpenses() {
  global.expenses = [...initialExpenses];
  return global.expenses;
}

// Helper to log the current state of the expenses array during development
export function logExpenses() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Current expenses state:', JSON.stringify(global.expenses, null, 2));
  }
} 