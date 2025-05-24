import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import { db, groups, groupMembers } from '@/lib/db';
import { eq } from 'drizzle-orm';

const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(255),
  description: z.string().max(1000).optional(),
  maxMembers: z.number().min(2).max(50).default(10),
});

// GET /api/groups - List user's groups
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get groups where user is a member
    const userGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        maxMembers: groups.maxMembers,
        isActive: groups.isActive,
        createdAt: groups.createdAt,
        role: groupMembers.role,
      })
      .from(groups)
      .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .where(eq(groupMembers.userId, req.user.userId));

    return NextResponse.json({
      groups: userGroups,
    });
  } catch (error) {
    console.error('Get groups error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/groups - Create new group
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, maxMembers } = createGroupSchema.parse(body);

    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 12).toUpperCase();

    // Create group
    const [newGroup] = await db
      .insert(groups)
      .values({
        name,
        description,
        ownerId: req.user.userId,
        maxMembers,
        inviteCode,
      })
      .returning();

    // Add creator as admin member
    await db.insert(groupMembers).values({
      userId: req.user.userId,
      groupId: newGroup.id,
      role: 'admin',
    });

    return NextResponse.json({
      message: 'Group created successfully',
      group: newGroup,
    });
  } catch (error) {
    console.error('Create group error:', error);

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