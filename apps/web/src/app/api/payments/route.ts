import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import { db, payments, subscriptions, subscriptionMembers } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';

const createPaymentSchema = z.object({
  subscriptionId: z.string().uuid(),
  amount: z.number().positive(),
  type: z.enum(['monthly', 'initial', 'proportional']),
  billingPeriodStart: z.string().transform((val) => new Date(val)),
  billingPeriodEnd: z.string().transform((val) => new Date(val)),
  paymentMethod: z.string().max(100).optional(),
  externalPaymentId: z.string().max(255).optional(),
  description: z.string().max(1000).optional(),
});

// GET /api/payments - List user's payment history
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const subscriptionId = url.searchParams.get('subscriptionId');
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let whereConditions = [eq(payments.userId, req.user.userId)];

    if (subscriptionId) {
      whereConditions.push(eq(payments.subscriptionId, subscriptionId));
    }

    if (status) {
      whereConditions.push(eq(payments.status, status));
    }

    const userPayments = await db
      .select({
        id: payments.id,
        subscriptionId: payments.subscriptionId,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        type: payments.type,
        billingPeriodStart: payments.billingPeriodStart,
        billingPeriodEnd: payments.billingPeriodEnd,
        paymentMethod: payments.paymentMethod,
        description: payments.description,
        createdAt: payments.createdAt,
        paidAt: payments.paidAt,
        subscriptionName: subscriptions.name,
        serviceName: subscriptions.serviceName,
      })
      .from(payments)
      .innerJoin(subscriptions, eq(payments.subscriptionId, subscriptions.id))
      .where(and(...whereConditions))
      .orderBy(desc(payments.createdAt))
      .limit(limit);

    // Calculate summary statistics
    const totalPaid = userPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const pendingAmount = userPayments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return NextResponse.json({
      payments: userPayments,
      summary: {
        totalPaid,
        pendingAmount,
        totalPayments: userPayments.length,
      },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/payments - Create payment record
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createPaymentSchema.parse(body);

    // Verify user is member of the subscription
    const membership = await db
      .select()
      .from(subscriptionMembers)
      .where(
        and(
          eq(subscriptionMembers.subscriptionId, validatedData.subscriptionId),
          eq(subscriptionMembers.userId, req.user.userId)
        )
      );

    if (membership.length === 0) {
      return NextResponse.json(
        { error: 'You are not a member of this subscription' },
        { status: 403 }
      );
    }

    // Create payment record
    const [newPayment] = await db
      .insert(payments)
      .values({
        userId: req.user.userId,
        subscriptionId: validatedData.subscriptionId,
        amount: validatedData.amount.toString(),
        type: validatedData.type,
        billingPeriodStart: validatedData.billingPeriodStart,
        billingPeriodEnd: validatedData.billingPeriodEnd,
        paymentMethod: validatedData.paymentMethod,
        externalPaymentId: validatedData.externalPaymentId,
        description: validatedData.description,
      })
      .returning();

    return NextResponse.json({
      message: 'Payment record created successfully',
      payment: newPayment,
    });
  } catch (error) {
    console.error('Create payment error:', error);

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