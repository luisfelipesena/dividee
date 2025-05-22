export default function ApiIndex() {
  // This file is needed for Expo Router to recognize the /api directory as a valid route
  return null;
}

// GET handler for the API index page
export async function GET() {
  const apiInfo = {
    api: "Dividee API",
    version: "1.0.0",
    endpoints: [
      {
        path: "/api/expenses",
        methods: ["GET", "POST"],
        description: "List all expenses or create a new expense"
      },
      {
        path: "/api/expenses/:id",
        methods: ["GET", "PUT", "DELETE"],
        description: "Get, update, or delete a specific expense"
      }
    ],
    documentation: "See README.md for more information"
  };
  
  return new Response(
    JSON.stringify(apiInfo, null, 2),
    { 
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
} 