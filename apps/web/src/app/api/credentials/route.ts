import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { subscriptions, subscriptionMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { withAuth } from '@/lib/auth/middleware';
import { bitwardenClient } from '@/lib/bitwarden/client';

const createCredentialSchema = z.object({
  subscriptionId: z.string().uuid(),
  name: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  uri: z.string().url().optional(),
  notes: z.string().optional(),
});

const generatePasswordSchema = z.object({
  length: z.number().min(8).max(128).default(16),
});

export async function POST(request: NextRequest) {
  return withAuth(async (user) => {
    try {
      const body = await request.json();
      
      // Check if this is a password generation request
      if (body.action === 'generate-password') {
        const data = generatePasswordSchema.parse(body);
        const password = await bitwardenClient.generatePassword(data.length);
        return NextResponse.json({ password });
      }

      // Otherwise, create credential
      const data = createCredentialSchema.parse(body);

      // Check if user owns the subscription or is an admin member
      const subscription = await db
        .select({
          id: subscriptions.id,
          name: subscriptions.name,
          serviceName: subscriptions.serviceName,
          ownerId: subscriptions.ownerId,
        })
        .from(subscriptions)
        .where(eq(subscriptions.id, data.subscriptionId))
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
              eq(subscriptionMembers.subscriptionId, data.subscriptionId),
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

      // Create credential in Bitwarden
      const credentialId = await bitwardenClient.createCredential({
        name: `${subscription[0].serviceName} - ${subscription[0].name}`,
        username: data.username,
        password: data.password,
        uri: data.uri,
        notes: data.notes,
      });

      // Update subscription with credential ID
      await db
        .update(subscriptions)
        .set({
          credentialsId: credentialId,
          lastPasswordChange: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, data.subscriptionId));

      return NextResponse.json(
        { 
          message: 'Credential stored securely',
          credentialId 
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating credential:', error);
      
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