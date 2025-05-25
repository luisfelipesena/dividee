import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import { db, accessRequests, subscriptions, subscriptionMembers } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

const approveRequestSchema = z.object({
  adminResponse: z.string().max(500).optional(),
});

// PUT /api/access-requests/[id]/approve - Approve access request
export const PUT = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const requestId = url.pathname.split('/')[3]; // Extract ID from path
    
    const body = await req.json();
    const { adminResponse } = approveRequestSchema.parse(body);

    // Get the access request and verify ownership
    const accessRequest = await db
      .select({
        id: accessRequests.id,
        userId: accessRequests.userId,
        subscriptionId: accessRequests.subscriptionId,
        status: accessRequests.status,
        ownerId: subscriptions.ownerId,
        currentMembers: subscriptions.currentMembers,
        maxMembers: subscriptions.maxMembers,
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
        { error: 'You are not authorized to approve this request' },
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

    // Check if subscription has available spots
    if (request.currentMembers >= request.maxMembers) {
      return NextResponse.json(
        { error: 'Subscription is full' },
        { status: 400 }
      );
    }

    // Start transaction
    await db.transaction(async (tx) => {
      // Update access request status
      await tx
        .update(accessRequests)
        .set({
          status: 'approved',
          adminResponse,
          respondedAt: new Date(),
          respondedBy: req.user.userId,
        })
        .where(eq(accessRequests.id, requestId));

      // Add user as member of subscription
      await tx.insert(subscriptionMembers).values({
        userId: request.userId,
        subscriptionId: request.subscriptionId,
        role: 'member',
      });

      // Update subscription member count
      await tx
        .update(subscriptions)
        .set({
          currentMembers: request.currentMembers + 1,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, request.subscriptionId));
    });

    return NextResponse.json({
      message: 'Access request approved successfully',
    });
  } catch (error) {
    console.error('Approve access request error:', error);

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