import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { groupMembers, groups } from '@/lib/db/schema';
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
      const { id: groupId, userId: targetUserId } = params;
      const body = await request.json();
      const data = updateMemberSchema.parse(body);

      // Check if user is owner of group
      const group = await db
        .select({
          id: groups.id,
          ownerId: groups.ownerId,
        })
        .from(groups)
        .where(eq(groups.id, groupId))
        .limit(1);

      if (!group.length) {
        return NextResponse.json(
          { error: 'Group not found' },
          { status: 404 }
        );
      }

      if (group[0].ownerId !== user?.user?.userId) {
        return NextResponse.json(
          { error: 'Only group owner can update member roles' },
          { status: 403 }
        );
      }

      // Check if target user is a member
      const member = await db
        .select({ id: groupMembers.id })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, targetUserId)
          )
        )
        .limit(1);

      if (!member.length) {
        return NextResponse.json(
          { error: 'User is not a member of this group' },
          { status: 404 }
        );
      }

      // Update member role
      await db
        .update(groupMembers)
        .set({
          role: data.role,
        })
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, targetUserId)
          )
        );

      return NextResponse.json({
        message: 'Member role updated successfully',
      });
    } catch (error) {
      console.error('Error updating group member:', error);

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
      const { id: groupId, userId: targetUserId } = params;

      // Check if user is owner or removing themselves
      const group = await db
        .select({
          id: groups.id,
          ownerId: groups.ownerId,
        })
        .from(groups)
        .where(eq(groups.id, groupId))
        .limit(1);

      if (!group.length) {
        return NextResponse.json(
          { error: 'Group not found' },
          { status: 404 }
        );
      }

      const isOwner = group[0].ownerId === user?.user?.userId;
      const isRemovingSelf = targetUserId === user?.user?.userId;

      if (!isOwner && !isRemovingSelf) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Check if target user is a member
      const member = await db
        .select({ id: groupMembers.id })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, targetUserId)
          )
        )
        .limit(1);

      if (!member.length) {
        return NextResponse.json(
          { error: 'User is not a member of this group' },
          { status: 404 }
        );
      }

      // Remove member
      await db
        .delete(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, targetUserId)
          )
        );

      return NextResponse.json({
        message: 'Member removed successfully',
      });
    } catch (error) {
      console.error('Error removing group member:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}