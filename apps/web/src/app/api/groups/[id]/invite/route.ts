import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { groupMembers, groups, notifications, users } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['member', 'admin']).default('member'),
  message: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (user) => {
    try {
      const groupId = params.id;
      const body = await request.json();
      const data = inviteSchema.parse(body);

      // Check if user is owner or admin of group
      const group = await db
        .select({
          id: groups.id,
          name: groups.name,
          ownerId: groups.ownerId,
          maxMembers: groups.maxMembers,
          inviteCode: groups.inviteCode,
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

      if (!isOwner) {
        // Check if user is admin member
        const adminMember = await db
          .select({ id: groupMembers.id })
          .from(groupMembers)
          .where(
            and(
              eq(groupMembers.groupId, groupId),
              eq(groupMembers.userId, user?.user?.userId as string),
              eq(groupMembers.role, 'admin')
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

      // Check if user exists
      const invitedUser = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
        })
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (!invitedUser.length) {
        return NextResponse.json(
          { error: 'User with this email does not exist' },
          { status: 404 }
        );
      }

      // Check if user is already a member
      const existingMember = await db
        .select({ id: groupMembers.id })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, invitedUser[0].id)
          )
        )
        .limit(1);

      if (existingMember.length) {
        return NextResponse.json(
          { error: 'User is already a member' },
          { status: 400 }
        );
      }

      // Create invitation notification
      await db.insert(notifications).values({
        userId: invitedUser[0].id,
        title: `Convite para o grupo "${group[0].name}"`,
        message: data.message || `Você foi convidado(a) para participar do grupo "${group[0].name}".`,
        type: 'group_invite',
        relatedEntityId: groupId,
        relatedEntityType: 'group',
        actionUrl: `/groups/${groupId}/join?code=${group[0].inviteCode}`,
        actionText: 'Aceitar Convite',
        isRead: false,
        createdAt: new Date(),
      });

      // Here you would typically also send an email
      // For now, we'll just create the in-app notification

      return NextResponse.json({
        message: 'Invitation sent successfully',
        invitedUser: {
          id: invitedUser[0].id,
          email: invitedUser[0].email,
          name: invitedUser[0].name,
        },
      });
    } catch (error) {
      console.error('Error sending group invitation:', error);

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