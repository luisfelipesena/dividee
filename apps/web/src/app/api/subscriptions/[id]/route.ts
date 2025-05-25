import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import { db, subscriptions, subscriptionMembers } from '@/lib/db';
import { eq, and, or } from 'drizzle-orm';

const updateSubscriptionSchema = z.object({
  name: z.string().min(1, 'Subscription name is required').max(255).optional(),
  serviceName: z.string().min(1, 'Service name is required').max(255).optional(),
  description: z.string().max(1000).optional(),
  totalPrice: z.number().positive('Price must be positive').optional(),
  currency: z.string().length(3).optional(),
  maxMembers: z.number().min(1).max(50).optional(),
  isPublic: z.boolean().optional(),
  renewalDate: z.string().transform((val) => new Date(val)).optional(),
});

// GET /api/subscriptions/[id] - Get specific subscription
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const subscriptionId = url.pathname.split('/').pop();

    // Get subscription where user is owner or member
    const subscription = await db
      .select({
        id: subscriptions.id,
        name: subscriptions.name,
        serviceName: subscriptions.serviceName,
        description: subscriptions.description,
        ownerId: subscriptions.ownerId,
        totalPrice: subscriptions.totalPrice,
        currency: subscriptions.currency,
        maxMembers: subscriptions.maxMembers,
        currentMembers: subscriptions.currentMembers,
        isPublic: subscriptions.isPublic,
        renewalDate: subscriptions.renewalDate,
        isActive: subscriptions.isActive,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
      })
      .from(subscriptions)
      .leftJoin(subscriptionMembers, eq(subscriptions.id, subscriptionMembers.subscriptionId))
      .where(
        and(
          eq(subscriptions.id, subscriptionId),
          or(
            eq(subscriptions.ownerId, req.user.userId),
            eq(subscriptionMembers.userId, req.user.userId)
          )
        )
      )
      .limit(1);

    if (subscription.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscription: subscription[0],
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/subscriptions/[id] - Update subscription
export const PUT = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const subscriptionId = url.pathname.split('/').pop();
    const body = await req.json();
    const validatedData = updateSubscriptionSchema.parse(body);

    // Check if user is owner of the subscription
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, subscriptionId),
          eq(subscriptions.ownerId, req.user.userId)
        )
      );

    if (existingSubscription.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found or you are not authorized to update it' },
        { status: 404 }
      );
    }

    // Update subscription
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscriptionId))
      .returning();

    return NextResponse.json({
      message: 'Subscription updated successfully',
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('Update subscription error:', error);

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

// DELETE /api/subscriptions/[id] - Delete subscription
export const DELETE = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const subscriptionId = url.pathname.split('/').pop();

    // Check if user is owner of the subscription
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, subscriptionId),
          eq(subscriptions.ownerId, req.user.userId)
        )
      );

    if (existingSubscription.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found or you are not authorized to delete it' },
        { status: 404 }
      );
    }

    // Delete subscription (cascade will handle related records)
    await db
      .delete(subscriptions)
      .where(eq(subscriptions.id, subscriptionId));

    return NextResponse.json({
      message: 'Subscription deleted successfully',
    });
  } catch (error) {
    console.error('Delete subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 