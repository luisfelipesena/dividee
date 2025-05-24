import { NextResponse } from 'next/server'

export async function POST() {
  // Since we're using stateless JWT tokens, logout is handled client-side
  // by removing the token from storage. This endpoint exists for consistency
  // and future use (e.g., token blacklisting)
  
  return NextResponse.json({
    message: 'Logged out successfully',
  })
} 