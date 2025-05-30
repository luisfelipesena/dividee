import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { subscriptionMembers, subscriptions } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateMemberSchema = z.object({
  role: z.enum(['member', 'admin']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  return withAuth(async (user) => {
    try {
      const { id: subscriptionId, userId: targetUserId } = params;
      const body = await request.json();
      const data = updateMemberSchema.parse(body);

      // Check if user is owner of subscription
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

      if (subscription[0].ownerId !== user?.user?.userId) {
        return NextResponse.json(
          { error: 'Only subscription owner can update member roles' },
          { status: 403 }
        );
      }

      // Check if target user is a member
      const member = await db
        .select({ id: subscriptionMembers.id })
        .from(subscriptionMembers)
        .where(
          and(
            eq(subscriptionMembers.subscriptionId, subscriptionId),
            eq(subscriptionMembers.userId, targetUserId)
          )
        )
        .limit(1);

      if (!member.length) {
        return NextResponse.json(
          { error: 'User is not a member of this subscription' },
          { status: 404 }
        );
      }

      // Update member role
      await db
        .update(subscriptionMembers)
        .set({
          role: data.role,
        })
        .where(
          and(
            eq(subscriptionMembers.subscriptionId, subscriptionId),
            eq(subscriptionMembers.userId, targetUserId)
          )
        );

      return NextResponse.json({
        message: 'Member role updated successfully',
      });
    } catch (error) {
      console.error('Error updating subscription member:', error);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  return withAuth(async (user) => {
    try {
      const { id: subscriptionId, userId: targetUserId } = params;

      // Check if user is owner or removing themselves
      const subscription = await db
        .select({
          id: subscriptions.id,
          ownerId: subscriptions.ownerId,
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
      const isRemovingSelf = targetUserId === user?.user?.userId;

      if (!isOwner && !isRemovingSelf) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Check if target user is a member
      const member = await db
        .select({ id: subscriptionMembers.id })
        .from(subscriptionMembers)
        .where(
          and(
            eq(subscriptionMembers.subscriptionId, subscriptionId),
            eq(subscriptionMembers.userId, targetUserId)
          )
        )
        .limit(1);

      if (!member.length) {
        return NextResponse.json(
          { error: 'User is not a member of this subscription' },
          { status: 404 }
        );
      }

      // Remove member in transaction
      await db.transaction(async (tx) => {
        // Remove member
        await tx
          .delete(subscriptionMembers)
          .where(
            and(
              eq(subscriptionMembers.subscriptionId, subscriptionId),
              eq(subscriptionMembers.userId, targetUserId)
            )
          );

        // Update current members count
        await tx
          .update(subscriptions)
          .set({
            currentMembers: (subscription[0].currentMembers || 0) - 1,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, subscriptionId));
      });

      return NextResponse.json({
        message: 'Member removed successfully',
      });
    } catch (error) {
      console.error('Error removing subscription member:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}