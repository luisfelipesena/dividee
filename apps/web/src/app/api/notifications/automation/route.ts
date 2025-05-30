import { NextRequest, NextResponse } from 'next/server';
import { notificationAutomation } from '@/lib/notifications/automations';

// This endpoint can be called by a cron job or scheduler
export async function POST(request: NextRequest) {
  try {
    // Verify the request has the correct authorization
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.AUTOMATION_SECRET || 'development-secret';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Run all automation checks
    await notificationAutomation.runAllChecks();

    return NextResponse.json({
      message: 'Notification automation completed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error running notification automation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow GET for health check
export async function GET() {
  return NextResponse.json({
    status: 'Notification automation service is running',
    timestamp: new Date().toISOString(),
  });
}