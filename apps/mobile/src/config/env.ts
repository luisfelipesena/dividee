// Environment variables configuration for the mobile app

// API configuration
export const env = {
  // API base URL (in development, this should be your local IP, not localhost)
  // Example: 'http://192.168.1.100:3000' for local development
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000', // 10.0.2.2 points to host's localhost in Android emulator
  
  // App configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Build information
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  buildNumber: process.env.EXPO_PUBLIC_BUILD_NUMBER || '1',
  
  // Feature flags
  enableAuth: process.env.EXPO_PUBLIC_ENABLE_AUTH !== 'false',
  
  // Validate required environment variables
  validate(): void {
    const requiredVars = ['apiUrl'];
    
    for (const key of requiredVars) {
      if (!env[key as keyof typeof env]) {
        console.warn(`Missing required environment variable: ${key}`);
      }
    }
  }
};

// Validate environment variables in non-production environments
if (process.env.NODE_ENV !== 'production') {
  env.validate();
} 