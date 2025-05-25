import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import { db, subscriptions, subscriptionMembers, groups } from '@/lib/db';
import { eq, or, and } from 'drizzle-orm';

const createSubscriptionSchema = z.object({
  name: z.string().min(1, 'Subscription name is required').max(255),
  serviceName: z.string().min(1, 'Service name is required').max(255),
  description: z.string().max(1000).optional(),
  groupId: z.string().uuid().optional(),
  totalPrice: z.number().positive('Price must be positive'),
  currency: z.string().length(3).default('BRL'),
  maxMembers: z.number().min(1).max(50),
  isPublic: z.boolean().default(false),
  renewalDate: z.string().transform((val) => new Date(val)),
});

// GET /api/subscriptions - List user's subscriptions
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get subscriptions where user is owner or member
    const userSubscriptions = await db
      .select({
        id: subscriptions.id,
        name: subscriptions.name,
        serviceName: subscriptions.serviceName,
        description: subscriptions.description,
        totalPrice: subscriptions.totalPrice,
        currency: subscriptions.currency,
        maxMembers: subscriptions.maxMembers,
        currentMembers: subscriptions.currentMembers,
        isPublic: subscriptions.isPublic,
        renewalDate: subscriptions.renewalDate,
        isActive: subscriptions.isActive,
        createdAt: subscriptions.createdAt,
        role: subscriptionMembers.role,
        groupName: groups.name,
      })
      .from(subscriptions)
      .leftJoin(subscriptionMembers, eq(subscriptions.id, subscriptionMembers.subscriptionId))
      .leftJoin(groups, eq(subscriptions.groupId, groups.id))
      .where(
        or(
          eq(subscriptions.ownerId, req.user.userId),
          eq(subscriptionMembers.userId, req.user.userId)
        )
      );

    return NextResponse.json({
      subscriptions: userSubscriptions,
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/subscriptions - Create new subscription
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createSubscriptionSchema.parse(body);

    // If groupId is provided, verify user is admin of the group
    if (validatedData.groupId) {
      const groupMember = await db
        .select()
        .from(groups)
        .where(
          and(
            eq(groups.id, validatedData.groupId),
            eq(groups.ownerId, req.user.userId)
          )
        );

      if (groupMember.length === 0) {
        return NextResponse.json(
          { error: 'You are not authorized to create subscriptions in this group' },
          { status: 403 }
        );
      }
    }

    // Create subscription
    const [newSubscription] = await db
      .insert(subscriptions)
      .values({
        ...validatedData,
        ownerId: req.user.userId,
      })
      .returning();

    // Add creator as admin member
    await db.insert(subscriptionMembers).values({
      userId: req.user.userId,
      subscriptionId: newSubscription.id,
      role: 'admin',
    });

    return NextResponse.json({
      message: 'Subscription created successfully',
      subscription: newSubscription,
    });
  } catch (error) {
    console.error('Create subscription error:', error);

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