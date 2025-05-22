/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only generate the API routes, ignore the pages
  output: 'standalone',
  // Disable the experimental appDir feature to avoid server-only import errors
  experimental: {
    appDir: false,
  },
  // Transpile modules from the Expo ecosystem
  transpilePackages: [
    'expo',
    'react-native',
    'react-native-web',
    '@expo/vector-icons',
    'react-native-gesture-handler',
    'react-native-reanimated',
    '@react-navigation',
    'nativewind',
  ],
  // Resolve the .expo extension
  webpack: (config) => {
    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
    ];
    return config;
  },
  // Disable image optimization since we're using expo-image
  images: {
    disableStaticImages: true,
  },
  // Only include API routes, not pages
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 5,
  },
  // Skip TypeScript type checking in development for faster builds
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  // Disable the Next.js default ESLint in favor of our custom setup
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 