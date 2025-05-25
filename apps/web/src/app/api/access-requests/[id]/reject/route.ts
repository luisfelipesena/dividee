import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import { db, accessRequests, subscriptions } from '@/lib/db';
import { eq } from 'drizzle-orm';

const rejectRequestSchema = z.object({
  adminResponse: z.string().max(500).optional(),
});

// PUT /api/access-requests/[id]/reject - Reject access request
export const PUT = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const requestId = url.pathname.split('/')[3]; // Extract ID from path
    
    const body = await req.json();
    const { adminResponse } = rejectRequestSchema.parse(body);

    // Get the access request and verify ownership
    const accessRequest = await db
      .select({
        id: accessRequests.id,
        status: accessRequests.status,
        ownerId: subscriptions.ownerId,
      })
      .from(accessRequests)
      .innerJoin(subscriptions, eq(accessRequests.subscriptionId, subscriptions.id))
      .where(eq(accessRequests.id, requestId))
      .limit(1);

    if (accessRequest.length === 0) {
      return NextResponse.json(
        { error: 'Access request not found' },
        { status: 404 }
      );
    }

    const request = accessRequest[0];

    // Check if user is owner of the subscription
    if (request.ownerId !== req.user.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to reject this request' },
        { status: 403 }
      );
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      );
    }

    // Update access request status
    await db
      .update(accessRequests)
      .set({
        status: 'rejected',
        adminResponse,
        respondedAt: new Date(),
        respondedBy: req.user.userId,
      })
      .where(eq(accessRequests.id, requestId));

    return NextResponse.json({
      message: 'Access request rejected successfully',
    });
  } catch (error) {
    console.error('Reject access request error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 