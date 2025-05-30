import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { groupMembers, groups, users } from '@/lib/db/schema';
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
      const groupId = params.id;

      // Check if user has access to view members (owner or member)
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

      // Check if user is member
      const isMember = await db
        .select({ id: groupMembers.id })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, user?.user?.userId as string)
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
          id: groupMembers.id,
          role: groupMembers.role,
          joinedAt: groupMembers.joinedAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(groupMembers)
        .leftJoin(users, eq(groupMembers.userId, users.id))
        .where(eq(groupMembers.groupId, groupId));

      return NextResponse.json({ members });
    } catch (error) {
      console.error('Error fetching group members:', error);
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
      const groupId = params.id;
      const body = await request.json();
      const data = addMemberSchema.parse(body);

      // Check if user is owner or admin of group
      const group = await db
        .select({
          id: groups.id,
          ownerId: groups.ownerId,
          maxMembers: groups.maxMembers,
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

      // Check if user is already a member
      const existingMember = await db
        .select({ id: groupMembers.id })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, data.userId)
          )
        )
        .limit(1);

      if (existingMember.length) {
        return NextResponse.json(
          { error: 'User is already a member' },
          { status: 400 }
        );
      }

      // Add member
      await db.insert(groupMembers).values({
        groupId,
        userId: data.userId,
        role: data.role,
        joinedAt: new Date(),
      });

      return NextResponse.json(
        { message: 'Member added successfully' },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error adding group member:', error);

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