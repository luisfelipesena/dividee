import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { subscriptions, subscriptionMembers, notifications } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { withAuth } from '@/lib/auth/middleware';
import { bitwardenClient } from '@/lib/bitwarden/client';

const updateCredentialSchema = z.object({
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  uri: z.string().url().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { subscriptionId: string } }
) {
  return withAuth(async (user) => {
    try {
      const subscriptionId = params.subscriptionId;

      // Check if user has access to the subscription
      const subscription = await db
        .select({
          id: subscriptions.id,
          name: subscriptions.name,
          serviceName: subscriptions.serviceName,
          ownerId: subscriptions.ownerId,
          credentialsId: subscriptions.credentialsId,
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

      const isOwner = subscription[0].ownerId === user.id;

      if (!isOwner) {
        // Check if user is a member
        const member = await db
          .select({ id: subscriptionMembers.id, role: subscriptionMembers.role })
          .from(subscriptionMembers)
          .where(
            and(
              eq(subscriptionMembers.subscriptionId, subscriptionId),
              eq(subscriptionMembers.userId, user.id)
            )
          )
          .limit(1);

        if (!member.length) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
          );
        }
      }

      if (!subscription[0].credentialsId) {
        return NextResponse.json(
          { error: 'No credentials stored for this subscription' },
          { status: 404 }
        );
      }

      // Get credential from Bitwarden
      const credential = await bitwardenClient.getCredential(subscription[0].credentialsId);

      if (!credential) {
        return NextResponse.json(
          { error: 'Credential not found in secure storage' },
          { status: 404 }
        );
      }

      // Log credential access
      const auditLogger = await import('@/lib/audit/logger');
      await auditLogger.auditLog.credentialAccessed(user.id, subscriptionId, request);

      return NextResponse.json({
        subscription: {
          id: subscription[0].id,
          name: subscription[0].name,
          serviceName: subscription[0].serviceName,
        },
        credential: {
          username: credential.username,
          password: credential.password,
          uri: credential.uri,
          notes: credential.notes,
        },
      });
    } catch (error) {
      console.error('Error retrieving credential:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { subscriptionId: string } }
) {
  return withAuth(async (user) => {
    try {
      const subscriptionId = params.subscriptionId;
      const body = await request.json();
      const data = updateCredentialSchema.parse(body);

      // Check if user owns the subscription or is an admin member
      const subscription = await db
        .select({
          id: subscriptions.id,
          name: subscriptions.name,
          ownerId: subscriptions.ownerId,
          credentialsId: subscriptions.credentialsId,
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

      const isOwner = subscription[0].ownerId === user.id;

      if (!isOwner) {
        // Check if user is admin member
        const adminMember = await db
          .select({ id: subscriptionMembers.id })
          .from(subscriptionMembers)
          .where(
            and(
              eq(subscriptionMembers.subscriptionId, subscriptionId),
              eq(subscriptionMembers.userId, user.id),
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

      if (!subscription[0].credentialsId) {
        return NextResponse.json(
          { error: 'No credentials stored for this subscription' },
          { status: 404 }
        );
      }

      // Update credential in Bitwarden
      await bitwardenClient.updateCredential(subscription[0].credentialsId, data);

      // Update last password change timestamp if password was changed
      if (data.password) {
        await db
          .update(subscriptions)
          .set({
            lastPasswordChange: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, subscriptionId));

        // Log password change
        const auditLogger = await import('@/lib/audit/logger');
        await auditLogger.auditLog.passwordChanged(user.id, subscriptionId, request);

        // Notify all members about password change
        const members = await db
          .select({ userId: subscriptionMembers.userId })
          .from(subscriptionMembers)
          .where(eq(subscriptionMembers.subscriptionId, subscriptionId));

        const notifications_data = members.map(member => ({
          userId: member.userId,
          subscriptionId: subscriptionId,
          title: `Senha atualizada - ${subscription[0].name}`,
          message: 'A senha da assinatura foi atualizada. Acesse suas credenciais para obter a nova senha.',
          type: 'password_updated' as const,
          relatedEntityId: subscriptionId,
          relatedEntityType: 'subscription' as const,
          isRead: false,
          createdAt: new Date(),
        }));

        if (notifications_data.length > 0) {
          await db.insert(notifications).values(notifications_data);
        }
      }

      return NextResponse.json({
        message: 'Credential updated successfully',
      });
    } catch (error) {
      console.error('Error updating credential:', error);
      
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
  { params }: { params: { subscriptionId: string } }
) {
  return withAuth(async (user) => {
    try {
      const subscriptionId = params.subscriptionId;

      // Check if user owns the subscription
      const subscription = await db
        .select({
          id: subscriptions.id,
          ownerId: subscriptions.ownerId,
          credentialsId: subscriptions.credentialsId,
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

      if (subscription[0].ownerId !== user.id) {
        return NextResponse.json(
          { error: 'Only subscription owner can delete credentials' },
          { status: 403 }
        );
      }

      if (!subscription[0].credentialsId) {
        return NextResponse.json(
          { error: 'No credentials stored for this subscription' },
          { status: 404 }
        );
      }

      // Delete credential from Bitwarden
      await bitwardenClient.deleteCredential(subscription[0].credentialsId);

      // Remove credential ID from subscription
      await db
        .update(subscriptions)
        .set({
          credentialsId: null,
          lastPasswordChange: null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId));

      return NextResponse.json({
        message: 'Credential deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting credential:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}