// Este arquivo foi substituído por app/api/[...path].ts
// Mantendo por compatibilidade

import { NextRequest } from "next/server";
import { expenses, logExpenses, type Expense } from "./_data";

// GET handler to retrieve all expenses
export async function GET() {
  console.log('GET /api/expenses - Returning all expenses');
  logExpenses();
  
  return new Response(
    JSON.stringify({ expenses }),
    { 
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}

// POST handler to create a new expense
export async function POST(request: NextRequest) {
  console.log('POST /api/expenses - Creating new expense');
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.amount || !body.participants) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
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
    
    return new Response(
      JSON.stringify({ expense: newExpense }),
      { 
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: "Invalid request data" }),
      { 
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
