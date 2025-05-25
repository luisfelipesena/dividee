import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import { db, notifications, subscriptions } from '@/lib/db';
import { eq, and, desc, or } from 'drizzle-orm';

const createNotificationSchema = z.object({
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  type: z.enum(['access_request', 'payment_reminder', 'renewal_alert', 'password_change', 'general']),
  subscriptionId: z.string().uuid().optional(),
  relatedEntityId: z.string().uuid().optional(),
  relatedEntityType: z.string().max(50).optional(),
  actionUrl: z.string().max(500).optional(),
  actionText: z.string().max(100).optional(),
  scheduledFor: z.string().transform((val) => new Date(val)).optional(),
});

// GET /api/notifications - List user's notifications
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
    const type = url.searchParams.get('type');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let whereConditions = [eq(notifications.userId, req.user.userId)];

    if (unreadOnly) {
      whereConditions.push(eq(notifications.isRead, false));
    }

    if (type) {
      whereConditions.push(eq(notifications.type, type));
    }

    const userNotifications = await db
      .select({
        id: notifications.id,
        title: notifications.title,
        message: notifications.message,
        type: notifications.type,
        subscriptionId: notifications.subscriptionId,
        relatedEntityId: notifications.relatedEntityId,
        relatedEntityType: notifications.relatedEntityType,
        isRead: notifications.isRead,
        isArchived: notifications.isArchived,
        actionUrl: notifications.actionUrl,
        actionText: notifications.actionText,
        scheduledFor: notifications.scheduledFor,
        sentAt: notifications.sentAt,
        readAt: notifications.readAt,
        createdAt: notifications.createdAt,
        subscriptionName: subscriptions.name,
        serviceName: subscriptions.serviceName,
      })
      .from(notifications)
      .leftJoin(subscriptions, eq(notifications.subscriptionId, subscriptions.id))
      .where(and(...whereConditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    // Count unread notifications
    const unreadCount = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, req.user.userId),
          eq(notifications.isRead, false)
        )
      );

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount: unreadCount.length,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/notifications - Create notification (admin only)
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createNotificationSchema.parse(body);

    // For now, anyone can create notifications
    // In production, you might want to restrict this to admins or system

    const [newNotification] = await db
      .insert(notifications)
      .values({
        userId: req.user.userId,
        title: validatedData.title,
        message: validatedData.message,
        type: validatedData.type,
        subscriptionId: validatedData.subscriptionId,
        relatedEntityId: validatedData.relatedEntityId,
        relatedEntityType: validatedData.relatedEntityType,
        actionUrl: validatedData.actionUrl,
        actionText: validatedData.actionText,
        scheduledFor: validatedData.scheduledFor,
        sentAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      message: 'Notification created successfully',
      notification: newNotification,
    });
  } catch (error) {
    console.error('Create notification error:', error);

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