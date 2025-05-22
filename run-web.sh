#!/bin/bash

# Set up environment variables
echo "Setting up environment variables..."
if [ ! -f apps/web/.env.local ]; then
  echo "Creating apps/web/.env.local"
  cat > apps/web/.env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000
EOL
  echo "Please update apps/web/.env.local with your actual Supabase credentials"
fi

# Start the web server
echo "Starting web server on http://localhost:3000..."
echo "Press Ctrl+C to stop the server"

pnpm run dev:web 