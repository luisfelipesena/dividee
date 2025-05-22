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
fi

# Start the development server
echo "Starting development server..."
echo "You can run the apps individually with:"
echo "  - Web: pnpm run dev:web"
echo "  - Mobile: pnpm run dev:mobile"
echo "Or both with: pnpm run dev"
echo ""
echo "Press Ctrl+C to stop the server"

# Run the dev command
pnpm run dev 