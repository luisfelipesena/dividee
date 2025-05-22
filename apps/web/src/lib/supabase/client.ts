import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/config/env'

export function createClient() {
  const supabaseUrl = env.supabaseUrl
  const supabaseAnonKey = env.supabaseAnonKey

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or anon key.')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
} 