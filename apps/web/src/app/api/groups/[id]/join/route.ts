import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { groupMembers, groups, notifications } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const joinSchema = z.object({
  inviteCode: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (user) => {
    try {
      const groupId = params.id;
      const body = await request.json();
      const data = joinSchema.parse(body);

      // Get group details
      const group = await db
        .select({
          id: groups.id,
          name: groups.name,
          inviteCode: groups.inviteCode,
          maxMembers: groups.maxMembers,
          isActive: groups.isActive,
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

      if (!group[0].isActive) {
        return NextResponse.json(
          { error: 'Group is not active' },
          { status: 400 }
        );
      }

      // Verify invite code
      if (group[0].inviteCode !== data.inviteCode) {
        return NextResponse.json(
          { error: 'Invalid invite code' },
          { status: 400 }
        );
      }

      // Check if user is already a member
      const existingMember = await db
        .select({ id: groupMembers.id })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, user?.user?.userId as string)
          )
        )
        .limit(1);

      if (existingMember.length) {
        return NextResponse.json(
          { error: 'You are already a member of this group' },
          { status: 400 }
        );
      }

      // Check if group has available spots
      const currentMembersCount = await db
        .select({ count: groupMembers.id })
        .from(groupMembers)
        .where(eq(groupMembers.groupId, groupId));

      if (group[0].maxMembers && currentMembersCount.length >= group[0].maxMembers) {
        return NextResponse.json(
          { error: 'Group is full' },
          { status: 400 }
        );
      }

      // Add user to group
      await db.insert(groupMembers).values({
        groupId,
        userId: user?.user?.userId as string,
        role: 'member',
        joinedAt: new Date(),
      });

      // Mark any related invitation notifications as read
      await db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(notifications.userId, user?.user?.userId as string),
            eq(notifications.type, 'group_invite'),
            eq(notifications.relatedEntityId, groupId)
          )
        );

      return NextResponse.json({
        message: 'Successfully joined the group',
        group: {
          id: group[0].id,
          name: group[0].name,
        },
      });
    } catch (error) {
      console.error('Error joining group:', error);

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