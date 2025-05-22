# Deployment Guide for Dividee

This guide covers how to deploy both the Next.js web application and the Expo mobile application from this monorepo.

## Prerequisites

- A [Supabase](https://supabase.com) account and project
- A [Vercel](https://vercel.com) account (for web app deployment)
- An [Expo](https://expo.dev) account (for mobile app deployment)
- Node.js and pnpm installed locally

## 1. Setting Up Supabase

1. **Create a Supabase Project**:
   - Go to [Supabase Dashboard](https://app.supabase.com) and create a new project.
   - Note your project's URL and anon key (found under Project Settings > API).

2. **Set Up Authentication**:
   - Navigate to Authentication > Providers in your Supabase dashboard.
   - Enable Email/Password sign-in and configure other providers as needed.
   - Set up redirect URLs for your production domains.

## 2. Deploying the Web Application to Vercel

1. **Connect to GitHub**:
   - Push your monorepo to GitHub.
   - Log in to [Vercel](https://vercel.com) and create a new project by importing your GitHub repository.

2. **Configure the Build**:
   - When importing, select "Next.js" as the framework preset.
   - Set the root directory to `apps/web`.
   - Set the build command to `cd ../.. && pnpm turbo run build --filter=web`.
   - Set the output directory to `.next`.

3. **Configure Environment Variables**:
   - Add the following environment variables to your Vercel project:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Deploy**:
   - Click "Deploy" to start the deployment process.
   - Once complete, Vercel will provide you with a production URL.

5. **Add the Production Domain to Supabase**:
   - Go to your Supabase project's Authentication settings.
   - Add your Vercel production URL to the list of allowed redirect URLs.

## 3. Deploying the Mobile Application

### Option 1: Expo Go (for testing)

For testing with the Expo Go app:

1. **Set up Environment Variables**:
   - Create a file at `apps/mobile/.env` with:
     ```
     EXPO_PUBLIC_API_URL=https://your-vercel-deployment-url.vercel.app
     ```

2. **Preview with Expo Go**:
   - Run `pnpm run dev:mobile` from the root of the monorepo.
   - Scan the QR code with your phone using the Expo Go app.

### Option 2: Building Standalone Apps with EAS Build

For production-ready apps:

1. **Install EAS CLI and Log In**:
   ```
   pnpm add -g eas-cli
   eas login
   ```

2. **Initialize EAS in Your Project**:
   ```
   cd apps/mobile
   eas build:configure
   ```

3. **Configure Environment Variables on Expo's Dashboard**:
   - Go to your project on [Expo Dashboard](https://expo.dev)
   - Add the `EXPO_PUBLIC_API_URL` environment variable with your production API URL.

4. **Create an EAS Build Profile**:
   - Edit the `eas.json` file generated in your mobile app directory:
   ```json
   {
     "build": {
       "production": {
         "node": "20.9.0",
         "env": {
           "EXPO_PUBLIC_API_URL": "https://your-vercel-deployment-url.vercel.app"
         }
       }
     }
   }
   ```

5. **Build for Different Platforms**:
   - For iOS:
     ```
     eas build --platform ios --profile production
     ```
   - For Android:
     ```
     eas build --platform android --profile production
     ```

6. **Submit to App Stores**:
   - For iOS:
     ```
     eas submit --platform ios
     ```
   - For Android:
     ```
     eas submit --platform android
     ```

## 4. Continuous Deployment

For automated deployments:

1. **Vercel Auto-Deployment**:
   - Vercel automatically deploys when you push to your GitHub repository.
   - You can configure branch deployments in Vercel project settings.

2. **EAS Update for Mobile App Updates**:
   - For over-the-air updates without store resubmission:
     ```
     eas update --channel production
     ```

## Troubleshooting

- **Supabase Connection Issues**: Ensure your environment variables are correct and that your IP is not restricted in Supabase settings.
- **Mobile App Can't Connect to Backend**: Make sure you're using the correct API URL and that CORS is properly configured on your Next.js backend.
- **Deployment Failures on Vercel**: Check build logs and ensure the monorepo build command is working correctly.

## Local Development

Remember that you can run the entire stack locally:

```bash
# Run both web and mobile apps
pnpm run dev

# Run just the web app
pnpm run dev:web

# Run just the mobile app
pnpm run dev:mobile
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/) 