import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import { db, accessRequests, subscriptions, subscriptionMembers } from '@/lib/db';
import { eq, and, or } from 'drizzle-orm';

const createAccessRequestSchema = z.object({
  subscriptionId: z.string().uuid('Invalid subscription ID'),
  message: z.string().max(500).optional(),
});

// GET /api/access-requests - List user's access requests (sent and received)
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get('type'); // 'sent' or 'received'

    let whereCondition;
    
    if (type === 'sent') {
      // Requests sent by the user
      whereCondition = eq(accessRequests.userId, req.user.userId);
    } else if (type === 'received') {
      // Requests received by the user (for their subscriptions)
      const userSubscriptions = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(eq(subscriptions.ownerId, req.user.userId));
      
      const subscriptionIds = userSubscriptions.map(sub => sub.id);
      if (subscriptionIds.length === 0) {
        return NextResponse.json({ accessRequests: [] });
      }
      
      whereCondition = or(...subscriptionIds.map(id => eq(accessRequests.subscriptionId, id)));
    } else {
      // All requests related to the user
      const userSubscriptions = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(eq(subscriptions.ownerId, req.user.userId));
      
      const subscriptionIds = userSubscriptions.map(sub => sub.id);
      
      whereCondition = or(
        eq(accessRequests.userId, req.user.userId),
        ...(subscriptionIds.length > 0 ? subscriptionIds.map(id => eq(accessRequests.subscriptionId, id)) : [])
      );
    }

    const requests = await db
      .select({
        id: accessRequests.id,
        userId: accessRequests.userId,
        subscriptionId: accessRequests.subscriptionId,
        status: accessRequests.status,
        message: accessRequests.message,
        adminResponse: accessRequests.adminResponse,
        requestedAt: accessRequests.requestedAt,
        respondedAt: accessRequests.respondedAt,
        respondedBy: accessRequests.respondedBy,
        subscriptionName: subscriptions.name,
        subscriptionService: subscriptions.serviceName,
      })
      .from(accessRequests)
      .innerJoin(subscriptions, eq(accessRequests.subscriptionId, subscriptions.id))
      .where(whereCondition)
      .orderBy(accessRequests.requestedAt);

    return NextResponse.json({
      accessRequests: requests,
    });
  } catch (error) {
    console.error('Get access requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/access-requests - Create new access request
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId, message } = createAccessRequestSchema.parse(body);

    // Check if subscription exists and is public
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, subscriptionId),
          eq(subscriptions.isPublic, true),
          eq(subscriptions.isActive, true)
        )
      );

    if (subscription.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found or not public' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(subscriptionMembers)
      .where(
        and(
          eq(subscriptionMembers.subscriptionId, subscriptionId),
          eq(subscriptionMembers.userId, req.user.userId)
        )
      );

    if (existingMember.length > 0) {
      return NextResponse.json(
        { error: 'You are already a member of this subscription' },
        { status: 400 }
      );
    }

    // Check if user already has a pending request
    const existingRequest = await db
      .select()
      .from(accessRequests)
      .where(
        and(
          eq(accessRequests.subscriptionId, subscriptionId),
          eq(accessRequests.userId, req.user.userId),
          eq(accessRequests.status, 'pending')
        )
      );

    if (existingRequest.length > 0) {
      return NextResponse.json(
        { error: 'You already have a pending request for this subscription' },
        { status: 400 }
      );
    }

    // Check if subscription has available spots
    const sub = subscription[0];
    if (sub.currentMembers >= sub.maxMembers) {
      return NextResponse.json(
        { error: 'Subscription is full' },
        { status: 400 }
      );
    }

    // Create access request
    const [newRequest] = await db
      .insert(accessRequests)
      .values({
        userId: req.user.userId,
        subscriptionId,
        message,
      })
      .returning();

    return NextResponse.json({
      message: 'Access request created successfully',
      accessRequest: newRequest,
    });
  } catch (error) {
    console.error('Create access request error:', error);

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