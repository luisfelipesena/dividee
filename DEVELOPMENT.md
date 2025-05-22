# Dividee Local Development Guide

This guide will help you set up and run the Dividee monorepo locally.

## Prerequisites

- Node.js (v18.x or higher recommended)
- pnpm (v9.x or higher)
- A Supabase account and project

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

## Environment Setup

### Web App

1. Create a `.env.local` file in `apps/web/` with the following content:
   ```
   # Supabase configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # API URL (for local development)
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

2. Replace `your-supabase-url` and `your-supabase-anon-key` with your actual Supabase project URL and anonymous key.

### Mobile App

1. Create a `.env` file in `apps/mobile/` with the following content:
   ```
   # API URL - use your computer's local network IP instead of localhost
   # For example: EXPO_PUBLIC_API_URL=http://192.168.1.xxx:3000
   EXPO_PUBLIC_API_URL=http://your-local-ip:3000
   ```

2. Replace `your-local-ip` with your computer's local network IP address.

## Running the Applications

We provide several convenient scripts to run the applications:

### Using the Scripts

1. **Run both apps simultaneously:**
   ```bash
   ./run-dev.sh
   ```

2. **Run only the web app:**
   ```bash
   ./run-web.sh
   ```

3. **Run only the mobile app:**
   ```bash
   ./run-mobile.sh
   ```
   Note: When running the mobile app, make sure your web app is also running since the mobile app depends on the API endpoints provided by the web app.

### Running Manually

You can also run the apps manually using the following commands:

#### Web App
```bash
pnpm run dev:web
```

#### Mobile App
```bash
# First, find your local IP address
# On macOS: ipconfig getifaddr en0
# On Linux: hostname -I | awk '{print $1}'

# Then create a .env.local file in apps/mobile with:
# EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000
# EXPO_PUBLIC_ENABLE_AUTH=true

cd apps/mobile && pnpm run dev
```

## Accessing the Applications

- **Web App**: Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Mobile App**: 
  - Scan the QR code displayed in the terminal using the Expo Go app on your device.
  - Or use an emulator/simulator that will open automatically if installed.

## Auth Testing

For testing authentication functionality:

1. Create a user in your Supabase project, or sign up through the app.
2. Use those credentials to log in.
3. Ensure the mobile app can communicate with the web app by:
   - Making sure both devices are on the same network
   - Using the correct IP address in the mobile app's environment file

## Troubleshooting

### Mobile App Issues

1. **MIME Type Error**: If you see a MIME type error in the browser when running the mobile app, make sure you're using the Expo Go app on your physical device instead of trying to run it in the browser.

2. **Network Error**: If the mobile app can't connect to your API, check the following:
   - Make sure your web app is running
   - Verify you're using the correct IP address (not localhost)
   - Check that your device is on the same network as your development machine
   - Make sure no firewall is blocking the connection

3. **Expo Build Issues**: If you have problems with the Expo build:
   ```bash
   cd apps/mobile
   pnpm cache clean
   rm -rf node_modules
   pnpm install
   pnpm run dev
   ```

### Web App Issues

1. **Supabase Connection Error**: If you see errors connecting to Supabase, check your environment variables in `apps/web/.env.local`.

2. **API Route Errors**: Make sure all the API routes are properly set up and functioning. You can test them using tools like Postman or curl.

## Development Workflow

1. Web app hooks are in `apps/web/src/hooks/`
2. Mobile app hooks are in `apps/mobile/src/hooks/`
3. API endpoints are in `apps/web/src/app/api/`
4. Auth flows are set up in both apps for login, signup, and logout 