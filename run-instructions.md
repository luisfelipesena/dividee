# Running the Dividee Applications

## Prerequisites

1. Make sure you have a Supabase account and project set up
2. Get your Supabase URL and anon key from your Supabase project dashboard
3. Update the `.env.local` files with your Supabase credentials

## Quick Start

### Option 1: Run everything at once

```bash
./run-dev.sh
```

### Option 2: Run web and mobile separately (recommended)

In terminal 1 (Web App):
```bash
./run-web.sh
```

In terminal 2 (Mobile App):
```bash
./run-mobile.sh
```

## Testing the Web App

1. Open your browser to [http://localhost:3000](http://localhost:3000)
2. You should see the home page with links to Login and Sign Up
3. You can navigate to the auth pages and test the authentication flow

## Testing the Mobile App

### Using Expo Go (recommended)

1. Install the Expo Go app on your mobile device
2. Make sure your mobile device is on the same network as your development machine
3. Scan the QR code that appears in the terminal
4. The app should load on your device

### Using an emulator

1. Make sure you have Android Studio or Xcode installed
2. Run an emulator device
3. Press 'a' in the terminal to open in Android emulator, or 'i' for iOS simulator

## Troubleshooting

If you encounter any issues, please refer to the DEVELOPMENT.md file for detailed troubleshooting guidance. 