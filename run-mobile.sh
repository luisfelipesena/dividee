#!/bin/bash

# Check if your IP address
echo "Finding your IP address..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  IP_ADDRESS=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  IP_ADDRESS=$(hostname -I | awk '{print $1}')
else
  # Windows or other
  IP_ADDRESS="localhost"
fi

echo "Your IP address appears to be: $IP_ADDRESS"
echo "This will be used for the API URL in the mobile app."

# Update .env file for mobile
echo "Setting up mobile environment variables..."
cat > apps/mobile/.env.local << EOL
EXPO_PUBLIC_API_URL=http://$IP_ADDRESS:3000
EXPO_PUBLIC_ENABLE_AUTH=true
EOL

echo "Created apps/mobile/.env.local with your local IP address"

# Run the mobile app
echo "Starting mobile app..."
echo "Note: Make sure your web app is also running on port 3000"
echo ""
echo "Press Ctrl+C to stop the server"

cd apps/mobile && pnpm run dev 