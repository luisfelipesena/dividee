// Simple script to test our API endpoints
// Try different ports since Expo and Next.js might use different ones
const PORTS = [8081, 3000, 4000, 19000, 19006];

async function testPort(port) {
  const baseUrl = `http://localhost:${port}`;
  console.log(`\n🔍 Testing API on ${baseUrl}`);
  
  try {
    const response = await fetch(`${baseUrl}/api/expenses`);
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`✅ Found JSON API on port ${port}!`);
      console.log('Response:', data);
      return { success: true, baseUrl };
    } else {
      console.log(`❌ Port ${port} is responding but not with JSON (got ${contentType})`);
      return { success: false };
    }
  } catch (error) {
    console.log(`❌ Port ${port} is not responding: ${error.message}`);
    return { success: false };
  }
}

async function logRequest(baseUrl, method, endpoint, body = null) {
  const url = `${baseUrl}${endpoint}`;
  console.log(`\n🚀 ${method} ${url}`);
  if (body) console.log('Request Body:', body);
  
  const options = { 
    method, 
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (body) options.body = JSON.stringify(body);
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
}

async function testAPI() {
  console.log('=== API PORT DISCOVERY ===');
  
  // Test each port to find our API
  let workingPort = null;
  for (const port of PORTS) {
    const result = await testPort(port);
    if (result.success) {
      workingPort = result.baseUrl;
      break;
    }
  }
  
  if (!workingPort) {
    console.log('\n❌ Could not find a working API endpoint on any tested port.');
    console.log('Make sure your API server is running.');
    return;
  }
  
  console.log(`\n=== RUNNING API TESTS ON ${workingPort} ===`);
  
  // 1. Get all expenses
  const allExpenses = await logRequest(workingPort, 'GET', '/api/expenses');
  
  // 2. Create a new expense
  const newExpense = await logRequest(workingPort, 'POST', '/api/expenses', {
    title: 'Test Expense from API Script',
    amount: 99.99,
    date: new Date().toISOString().split('T')[0],
    participants: ['API Tester'],
    paid: false
  });
  
  // 3. Get a specific expense by ID
  if (newExpense && newExpense.expense) {
    await logRequest(workingPort, 'GET', `/api/expenses/${newExpense.expense.id}`);
    
    // 4. Update the expense
    await logRequest(workingPort, 'PUT', `/api/expenses/${newExpense.expense.id}`, {
      title: 'Updated Test Expense',
      paid: true
    });
    
    // 5. Delete the expense
    await logRequest(workingPort, 'DELETE', `/api/expenses/${newExpense.expense.id}`);
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

// Run the test
testAPI(); 