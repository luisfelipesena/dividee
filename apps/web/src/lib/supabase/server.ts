import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/config/env'

export function createClient() {
  // In Next.js, cookies() returns a synchronous object despite what TypeScript thinks
  const cookieStore = cookies()

  const supabaseUrl = env.supabaseUrl
  const supabaseAnonKey = env.supabaseAnonKey

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or anon key.')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        // Use type assertion to tell TypeScript this is available
        // @ts-ignore - Next.js cookies() is not properly typed but works synchronously
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        // This is a no-op function in server components
        // Actual cookie setting happens in middleware or route handlers
      },
      remove(name: string, options: CookieOptions) {
        // This is a no-op function in server components
        // Actual cookie removal happens in middleware or route handlers
      },
    },
  })
} 