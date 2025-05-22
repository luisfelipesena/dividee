# Dividee - Expense Sharing App

Dividee is a mobile-first expense sharing application built with Expo, React Native, Tailwind CSS, and supports web deployment with backend functionality through Next.js API routes.

## Features

- Universal app - runs on iOS, Android, and Web from the same codebase
- File-based routing with Expo Router
- Backend API with Next.js API Routes
- Styled with Tailwind CSS (via NativeWind)
- Adaptive UI - bottom tabs on mobile, navbar on web
- Data fetching with React Query

## Tech Stack

- Expo / React Native
- Next.js (for API routes)
- Tailwind CSS (NativeWind)
- TypeScript
- Expo Router
- React Query

## Setup Instructions

1. **Clone the repository**

```
git clone <repository-url>
cd dividee
```

2. **Install dependencies**

```
npm install
```

3. **Run the development server**

For combined development (API + Web):
```
npm run dev
```

This runs both the Next.js API server on port 4000 and the Expo web app on port 8081.

For mobile development:
```
npm run ios
# or
npm run android
```

Note: When running on mobile, make sure the Next.js API server is running:
```
npm run api
```

## Project Structure

- `app/` - Contains all screens (using Expo Router)
  - `app/(tabs)/` - Tab-based navigation screens
  - `app/api/` - API routes using Next.js App Router
    - `app/api/expenses/` - Expenses API endpoints
    - `app/api/expenses/[id]/` - Single expense API endpoints
- `components/` - Reusable UI components
  - `components/ui/WebNavbar.tsx` - Navigation bar for web version
- `config/` - Configuration files
  - `config/env.ts` - Environment configuration
- `hooks/` - Custom React hooks, including React Query hooks
- `assets/` - Static assets like images and fonts
- `constants/` - Global constants and configurations

## API Routes

The app includes backend functionality through Next.js API routes:

- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses/:id` - Get a specific expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

These routes are available when running the Next.js API server (either with `npm run api` or `npm run dev`).

## Architecture Overview

### Dual Server Architecture

Dividee uses a dual-server architecture in development:

1. **Next.js API Server (port 4000)**: Handles all API requests and backend logic
2. **Expo Server (port 8081)**: Serves the frontend application

In production, these are combined into a single server deployment with EAS Hosting.

### Data Flow

1. React components use custom hooks from `hooks/` directory
2. Hooks use React Query to manage data fetching and caching
3. API requests are made to Next.js API routes
4. API routes handle CRUD operations on the data

## Complete Deployment Guide

This guide covers the entire process of deploying the Dividee application, including both the frontend (Expo/React Native) and backend (Next.js API routes) components.

## Prerequisites

1. **Expo Account**
   - Sign up at [expo.dev](https://expo.dev/signup)
   - Install EAS CLI: `npm install -g eas-cli`
   - Log in: `eas login`

2. **Prepare Your Project**
   - Ensure your project is committed to Git
   - Run `eas build:configure` to generate initial configuration

## Deployment Options

Dividee supports several deployment approaches:

### Option 1: Unified Deployment with EAS Hosting (Recommended)

This approach deploys both frontend and API routes together on EAS Hosting:

1. **Configure app.json for Server Output**

   Add the following to your `app.json`:
   ```json
   {
     "expo": {
       "web": {
         "bundler": "metro",
         "output": "server"
       }
     }
   }
   ```

2. **Configure Environment Variables**

   Create an `.env` file for local development (add to `.gitignore`):
   ```
   # Development environment variables
   API_URL=http://localhost:4000
   ```

   Set production environment variables using EAS:
   ```bash
   eas secret:create --scope project --name API_URL --value https://your-app.expo.app
   ```

3. **Build and Deploy**

   ```bash
   # Build the project for web
   npx expo export --platform web

   # Deploy to EAS Hosting
   eas deploy
   ```

   The first time you run this, you'll be prompted to:
   - Connect to an EAS project (or create a new one)
   - Choose a subdomain for your app (e.g., dividee.expo.app)

4. **Verify Deployment**

   After deployment completes, your app will be available at:
   - Frontend: `https://your-app.expo.app`
   - API: `https://your-app.expo.app/api/expenses`

### Option 2: Separate Frontend and Backend Deployments

For more control, you can deploy the frontend and backend separately:

1. **Deploy the API with Vercel**

   Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

   Initialize and deploy:
   ```bash
   vercel login
   vercel
   ```

   When prompted, select:
   - Set up and deploy: `Y`
   - Directory: `.` (current directory)
   - Override settings: `N`

   Your API will be deployed to a URL like: `https://dividee-api.vercel.app`

2. **Update Environment Configuration**

   Edit `config/env.ts` to point to your deployed API:
   ```typescript
   // For production with separate API deployment
   if (process.env.NODE_ENV === 'production') {
     return {
       protocol: 'https',
       host: 'dividee-api.vercel.app',
       port: null,
       baseUrl: 'https://dividee-api.vercel.app'
     };
   }
   ```

3. **Deploy the Expo App**

   ```bash
   # For web
   eas build --platform web

   # For native platforms (see Mobile Deployment below)
   ```

## Mobile App Deployment

To deploy to iOS and Android app stores:

1. **Development Builds for Testing**

   ```bash
   # For iOS
   eas build --profile development --platform ios

   # For Android
   eas build --profile development --platform android
   ```

   Install these development builds on your devices for testing.

2. **Production Builds**

   ```bash
   # For iOS App Store
   eas build --platform ios

   # For Google Play Store
   eas build --platform android
   ```

3. **Submit to App Stores**

   ```bash
   # Submit to Apple App Store
   eas submit --platform ios

   # Submit to Google Play Store
   eas submit --platform android
   ```

4. **Configure eas.json**

   Make sure your `eas.json` is properly configured:

   ```json
   {
     "cli": {
       "version": ">= 5.4.0"
     },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal"
       },
       "production": {
         "autoIncrement": true
       }
     },
     "submit": {
       "production": {}
     },
     "hosting": {
       "production": {
         "distribution": "store"
       },
       "preview": {
         "distribution": "internal"
       }
     }
   }
   ```

## Setting Up Custom Domain (Optional)

1. **Register a Domain**
   
   Purchase a domain from a provider like Namecheap, GoDaddy, or Google Domains.

2. **Configure DNS Settings**
   
   For EAS Hosting:
   - Go to your EAS project dashboard
   - Navigate to "Domains" section
   - Add your custom domain
   - Follow the instructions to set up DNS records

   For Vercel:
   - Go to your Vercel project
   - Navigate to "Settings" > "Domains"
   - Add your domain and configure DNS as instructed

3. **Update Environment Configuration**
   
   Update `config/env.ts` with your custom domain.

## CI/CD Setup (Optional)

For automated deployments:

1. **GitHub Actions**
   
   Create `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy
   on:
     push:
       branches:
         - main
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout code
           uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
         
         - name: Install dependencies
           run: npm install
         
         - name: Install EAS CLI
           run: npm install -g eas-cli
         
         - name: Login to Expo
           run: npx eas-cli login -u ${{ secrets.EXPO_USERNAME }} -p ${{ secrets.EXPO_PASSWORD }}
         
         - name: Deploy to EAS
           run: npx eas deploy --auto
   ```

2. **Set Up GitHub Secrets**
   
   In your GitHub repository:
   - Go to "Settings" > "Secrets and variables" > "Actions"
   - Add `EXPO_USERNAME` and `EXPO_PASSWORD` with your Expo credentials

## Monitoring and Maintenance

1. **Monitor Performance**
   
   - EAS Dashboard: Monitor builds, crashes, and performance
   - Vercel Dashboard: Monitor API usage and performance

2. **Update Dependencies**
   
   Regularly update dependencies to ensure security and compatibility:
   ```bash
   npx expo-doctor
   npx npm-check-updates -u
   npm install
   ```

3. **Database Backup (For Production)**
   
   If you implement a real database later, ensure you have regular backups configured.

## Troubleshooting Deployment Issues

### Common Issues and Solutions

1. **Build Failures**
   
   - Check EAS build logs: `eas build:view`
   - Verify your dependencies are compatible
   - Check if you have the correct SDK version in app.json

2. **API Connection Issues**
   
   - Verify environment variables are correctly set
   - Check CORS settings in API routes
   - Test API endpoints independently with tools like Postman

3. **Mobile App Rejection**
   
   - Ensure your app meets App Store/Google Play guidelines
   - Provide proper privacy policy and terms of service
   - Include appropriate app descriptions and screenshots

4. **Web Deployment Issues**
   
   - Check your bundler configuration
   - Verify your web output settings in app.json
   - Test locally with `npx expo export --platform web` and `npx serve web-build`

## Best Practices for Production

1. **Implement a Real Database**
   
   Replace the in-memory storage with a real database like:
   - MongoDB Atlas (NoSQL)
   - Supabase or PostgreSQL (SQL)
   - Firebase Firestore (Managed NoSQL)

2. **Add Authentication**
   
   Implement user authentication using:
   - Firebase Authentication
   - Auth0
   - Supabase Auth
   - Custom JWT solution

3. **Implement Error Tracking**
   
   Add error tracking with:
   - Sentry
   - LogRocket
   - Firebase Crashlytics

4. **Optimize for Performance**
   
   - Implement proper caching strategies
   - Optimize images and assets
   - Use lazy loading for components
   - Implement server-side rendering for web

## License

[MIT](LICENSE)

### Data Storage Implementation

The API uses Next.js's global object to ensure consistent data storage across different API routes:

- The app uses `global.expenses` to store data between requests
- This approach ensures that all API routes access the same data instance
- In a production application, this would be replaced with a real database connection

The current implementation is for demonstration purposes only. In a real application, you would use a proper database like PostgreSQL, MongoDB, or a cloud-based solution.
