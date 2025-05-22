import { NextRequest } from "next/server";
import { expenses, logExpenses, type Expense } from "../_data";

// GET handler to retrieve a specific expense by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  console.log(`GET /api/expenses/${id} - Finding expense by ID`);
  logExpenses();
  
  const expense = expenses.find((e: Expense) => e.id === id);
  
  if (!expense) {
    console.log(`Expense with ID ${id} not found`);
    return new Response(
      JSON.stringify({ error: "Expense not found" }),
      { 
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
  
  console.log(`Found expense with ID ${id}:`, expense);
  return new Response(
    JSON.stringify({ expense }),
    { 
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}

// PUT handler to update an expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    console.log(`PUT /api/expenses/${id} - Updating expense`);
    logExpenses();
    
    const body = await request.json();
    
    // Process participants if provided
    if (body.participants !== undefined) {
      body.participants = Array.isArray(body.participants) 
        ? body.participants 
        : body.participants.split(',').map((p: string) => p.trim());
    }
    
    // Convert amount to a number if it's provided
    if (body.amount !== undefined) {
      body.amount = parseFloat(body.amount);
    }
    
    // Update the expense
    const index = expenses.findIndex((e: Expense) => e.id === id);
    
    if (index === -1) {
      console.log(`Expense with ID ${id} not found for update`);
      return new Response(
        JSON.stringify({ error: "Expense not found" }),
        { 
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
    
    // Create updated expense
    const updatedExpense: Expense = {
      ...expenses[index],
      ...body,
      id, // Ensure ID doesn't change
    };
    
    // Update in our database
    expenses[index] = updatedExpense;
    
    console.log(`Updated expense with ID ${id}:`, updatedExpense);
    logExpenses();
    
    return new Response(
      JSON.stringify({ expense: updatedExpense }),
      { 
        status: 200,
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

// DELETE handler to remove an expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  console.log(`DELETE /api/expenses/${id} - Removing expense`);
  logExpenses();
  
  const index = expenses.findIndex((e: Expense) => e.id === id);
  
  if (index === -1) {
    console.log(`Expense with ID ${id} not found for deletion`);
    return new Response(
      JSON.stringify({ error: "Expense not found" }),
      { 
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
  
  // Remove from our in-memory database
  const deletedExpense = expenses.splice(index, 1)[0];
  
  console.log(`Removed expense with ID ${id}:`, deletedExpense);
  logExpenses();
  
  return new Response(
    JSON.stringify({ expense: deletedExpense }),
    { 
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
} 