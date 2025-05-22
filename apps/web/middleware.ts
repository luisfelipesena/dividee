import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/config/env'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = env.supabaseUrl
  const supabaseAnonKey = env.supabaseAnonKey
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or anon key.')
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getSession()

  return response
}

// Only apply this middleware to auth-related paths and API routes
export const config = {
  matcher: [
    '/api/:path*',
    '/login',
    '/signup',
    '/account/:path*',
    '/dashboard/:path*'
  ],
} 