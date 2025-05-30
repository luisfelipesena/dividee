import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { subscriptionMembers, subscriptions, users } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['member', 'admin']).default('member'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (user) => {
    try {
      const subscriptionId = params.id;

      // Check if user has access to view members (owner or member)
      const subscription = await db
        .select({
          id: subscriptions.id,
          ownerId: subscriptions.ownerId,
        })
        .from(subscriptions)
        .where(eq(subscriptions.id, subscriptionId))
        .limit(1);

      if (!subscription.length) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        );
      }

      const isOwner = subscription[0].ownerId === user?.user?.userId;

      // Check if user is member
      const isMember = await db
        .select({ id: subscriptionMembers.id })
        .from(subscriptionMembers)
        .where(
          and(
            eq(subscriptionMembers.subscriptionId, subscriptionId),
            eq(subscriptionMembers.userId, user?.user?.userId as string)
          )
        )
        .limit(1);

      if (!isOwner && !isMember.length) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Get all members
      const members = await db
        .select({
          id: subscriptionMembers.id,
          role: subscriptionMembers.role,
          joinedAt: subscriptionMembers.joinedAt,
          lastPayment: subscriptionMembers.lastPayment,
          nextPaymentDue: subscriptionMembers.nextPaymentDue,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(subscriptionMembers)
        .leftJoin(users, eq(subscriptionMembers.userId, users.id))
        .where(eq(subscriptionMembers.subscriptionId, subscriptionId));

      return NextResponse.json({ members });
    } catch (error) {
      console.error('Error fetching subscription members:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (user) => {
    try {
      const subscriptionId = params.id;
      const body = await request.json();
      const data = addMemberSchema.parse(body);

      // Check if user is owner or admin of subscription
      const subscription = await db
        .select({
          id: subscriptions.id,
          ownerId: subscriptions.ownerId,
          maxMembers: subscriptions.maxMembers,
          currentMembers: subscriptions.currentMembers,
        })
        .from(subscriptions)
        .where(eq(subscriptions.id, subscriptionId))
        .limit(1);

      if (!subscription.length) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        );
      }

      const isOwner = subscription[0].ownerId === user?.user?.userId;

      if (!isOwner) {
        // Check if user is admin member
        const adminMember = await db
          .select({ id: subscriptionMembers.id })
          .from(subscriptionMembers)
          .where(
            and(
              eq(subscriptionMembers.subscriptionId, subscriptionId),
              eq(subscriptionMembers.userId, user?.user?.userId as string),
              eq(subscriptionMembers.role, 'admin')
            )
          )
          .limit(1);

        if (!adminMember.length) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
          );
        }
      }

      // Check if subscription has available spots
      if (subscription[0].currentMembers && subscription[0].maxMembers && subscription[0].currentMembers >= subscription[0].maxMembers) {
        return NextResponse.json(
          { error: 'Subscription is full' },
          { status: 400 }
        );
      }

      // Check if user is already a member
      const existingMember = await db
        .select({ id: subscriptionMembers.id })
        .from(subscriptionMembers)
        .where(
          and(
            eq(subscriptionMembers.subscriptionId, subscriptionId),
            eq(subscriptionMembers.userId, data.userId)
          )
        )
        .limit(1);

      if (existingMember.length) {
        return NextResponse.json(
          { error: 'User is already a member' },
          { status: 400 }
        );
      }

      // Add member in transaction
      await db.transaction(async (tx) => {
        // Add member
        await tx.insert(subscriptionMembers).values({
          subscriptionId,
          userId: data.userId,
          role: data.role,
          joinedAt: new Date(),
        });

        // Update current members count
        await tx
          .update(subscriptions)
          .set({
            currentMembers: (subscription[0].currentMembers || 0) + 1,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, subscriptionId));
      });

      return NextResponse.json(
        { message: 'Member added successfully' },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error adding subscription member:', error);

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
  })(request);
}