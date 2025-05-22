import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
  
  return NextResponse.json({
    user: session?.user || null
  })
} 