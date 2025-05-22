/**
 * Environment configuration for Dividee
 * 
 * This file centralizes all environment-specific configuration.
 * In a production environment, these values would come from environment variables.
 */

import Constants from "expo-constants";

// API configuration
interface ApiConfig {
  protocol: string;
  host: string;
  port: number | null;
  baseUrl: string;
}

// Environment configuration
interface EnvironmentConfig {
  apiConfig: ApiConfig;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Helper function to get the base URL for API calls
function getApiBaseUrl(): ApiConfig {
  const isDev = process.env.NODE_ENV !== 'production';
  
  // In development, we're running a separate Next.js server on port 4000
  if (isDev) {
    // For web development
    if (typeof window !== 'undefined') {
      return {
        protocol: 'http',
        host: 'localhost',
        port: 4000,
        baseUrl: 'http://localhost:4000'
      };
    }
    
    // For Expo development on mobile
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(":")[0] || "localhost";
    return {
      protocol: 'http',
      host: localhost,
      port: 4000,
      baseUrl: `http://${localhost}:4000`
    };
  }
  
  // In production with EAS Hosting
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.origin);
    return {
      protocol: url.protocol.replace(':', ''),
      host: url.hostname,
      port: url.port ? parseInt(url.port) : null,
      baseUrl: window.location.origin
    };
  }
  
  // Fallback for SSR or other contexts
  return {
    protocol: 'https',
    host: 'dividee.expo.app',
    port: null,
    baseUrl: 'https://dividee.expo.app'
  };
}

// Main environment configuration
const env: EnvironmentConfig = {
  apiConfig: getApiBaseUrl(),
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production'
};

export default env; 