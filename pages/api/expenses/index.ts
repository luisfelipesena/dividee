import type { NextApiRequest, NextApiResponse } from 'next';

const logExpenses = () => {
  console.log('GET /api/expenses - Returning all expenses');
}

type Expense = {
  id: string;
  title: string;
  amount: number;
  date: string;
  participants: string[];
  paid: boolean;
}


const expenses: Expense[] = [
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


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Handle GET request
  if (req.method === 'GET') {
    console.log('GET /api/expenses - Returning all expenses');
    logExpenses();
    
    return res.status(200).json({ expenses });
  }

  // Handle POST request
  if (req.method === 'POST') {
    console.log('POST /api/expenses - Creating new expense');
    
    try {
      const body = req.body;
      
      // Validate required fields
      if (!body.title || !body.amount || !body.participants) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Process participants array
      const participants = Array.isArray(body.participants) 
        ? body.participants 
        : body.participants.split(',').map((p: string) => p.trim());
      
      // Create a new expense
      const newExpense: Expense = {
        id: `${expenses.length + 1}`,
        title: body.title,
        amount: parseFloat(body.amount),
        date: body.date || new Date().toISOString().split('T')[0],
        participants,
        paid: body.paid || false,
      };
      
      // Add to our in-memory database
      expenses.push(newExpense);
      
      console.log(`Created new expense with ID: ${newExpense.id}`);
      logExpenses();
      
      return res.status(201).json({ expense: newExpense });
    } catch (error) {
      console.error("API error:", error);
      return res.status(400).json({ error: "Invalid request data" });
    }
  }

  // Handle unsupported methods
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
} 