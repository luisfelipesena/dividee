// Environment variables configuration for the web app

// Supabase configuration
export const env = {
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // App configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  
  // Deployment
  vercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL || '',
  
  // Feature flags
  enableAuth: process.env.NEXT_PUBLIC_ENABLE_AUTH !== 'false',
  
  // Validate required environment variables
  validate(): void {
    const requiredVars = ['supabaseUrl', 'supabaseAnonKey'];
    
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