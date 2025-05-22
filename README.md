# Dividee

A modern, full-stack application built with Next.js and Expo in a Turborepo monorepo structure.

## Architecture Overview

Dividee is organized as a monorepo using Turborepo and pnpm, containing two main applications:

### Web Application (Next.js)

- **Technology Stack**: Next.js, Tailwind CSS, Supabase
- **Features**:
  - Server-side rendering with Next.js App Router
  - Authentication via Supabase Auth
  - API routes that serve as the backend for both web and mobile apps
  - React Query for client-side data fetching and state management

**Key Directories**:
- `/apps/web/src/app` - Next.js App Router pages and API routes
- `/apps/web/src/hooks` - React Query hooks for data fetching
- `/apps/web/src/lib/supabase` - Supabase client utilities

### Mobile Application (Expo)

- **Technology Stack**: React Native with Expo, NativeWind, React Query
- **Features**:
  - Native mobile experience for iOS and Android
  - Same authentication flow as the web app
  - Consumes the Next.js API endpoints
  - Offline support and optimistic updates

**Key Directories**:
- `/apps/mobile/src/screens` - UI screens for the mobile app
- `/apps/mobile/src/hooks` - React Query hooks for data fetching
- `/apps/mobile/src/services` - API services for communicating with the backend

## Data Flow Architecture

1. **Backend**: Supabase (PostgreSQL database) serves as the primary data store
2. **API Layer**: Next.js API routes in the web app provide a unified API for both applications
3. **Client Data Management**: React Query is used in both apps to handle:
   - Data fetching and caching
   - Background refetching
   - Mutations and optimistic updates
   - Error handling

## Getting Started

For detailed setup instructions, please refer to the [Development Guide](./DEVELOPMENT.md).

Quick start:
```bash
# Install dependencies
pnpm install

# Run both apps
pnpm dev
```

## Deployment

For production deployment instructions, please refer to the [Deployment Guide](./DEPLOY.md).

## Project Structure

```
dividee/
├── apps/
│   ├── web/             # Next.js web application
│   │   ├── src/
│   │   │   ├── app/     # Next.js App Router
│   │   │   ├── config/  # Environment configuration
│   │   │   ├── hooks/   # React Query hooks
│   │   │   └── lib/     # Utility libraries (Supabase, etc.)
│   │   └── ...
│   └── mobile/          # Expo mobile application
│       ├── src/
│       │   ├── config/  # Environment configuration
│       │   ├── hooks/   # React Query hooks
│       │   ├── screens/ # UI screens
│       │   └── services/# API services
│       └── ...
├── packages/            # Shared packages (if needed)
└── ...
```

## TODO

- [ ] Add product description and purpose
- [ ] Detail user flows and key features
- [ ] Add screenshots of the app in action
- [ ] List planned features and roadmap
- [ ] Add contribution guidelines
- [ ] Include license information

---

For local development setup, see [DEVELOPMENT.md](./DEVELOPMENT.md)  
For deployment instructions, see [DEPLOY.md](./DEPLOY.md) 