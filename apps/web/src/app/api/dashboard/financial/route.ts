import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { db, subscriptions, subscriptionMembers, payments, financialSummary } from '@/lib/db';
import { eq, and, sum, desc } from 'drizzle-orm';

// GET /api/dashboard/financial - Get user's financial metrics
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get current subscriptions user is member of
    const userSubscriptions = await db
      .select({
        id: subscriptions.id,
        name: subscriptions.name,
        serviceName: subscriptions.serviceName,
        totalPrice: subscriptions.totalPrice,
        currentMembers: subscriptions.currentMembers,
        role: subscriptionMembers.role,
      })
      .from(subscriptions)
      .innerJoin(subscriptionMembers, eq(subscriptions.id, subscriptionMembers.subscriptionId))
      .where(eq(subscriptionMembers.userId, req.user.userId));

    // Calculate current monthly costs and savings
    let totalMonthlyPaid = 0;
    let totalMonthlySaved = 0;
    const subscriptionBreakdown = [];

    for (const sub of userSubscriptions) {
      const costPerMember = parseFloat(sub.totalPrice) / sub.currentMembers;
      const fullCost = parseFloat(sub.totalPrice);
      const savings = fullCost - costPerMember;

      totalMonthlyPaid += costPerMember;
      totalMonthlySaved += savings;

      subscriptionBreakdown.push({
        id: sub.id,
        name: sub.name,
        serviceName: sub.serviceName,
        fullPrice: fullCost,
        yourShare: costPerMember,
        savings: savings,
        members: sub.currentMembers,
        role: sub.role,
      });
    }

    // Get payment history (last 6 months)
    const recentPayments = await db
      .select({
        id: payments.id,
        subscriptionId: payments.subscriptionId,
        amount: payments.amount,
        status: payments.status,
        type: payments.type,
        createdAt: payments.createdAt,
        paidAt: payments.paidAt,
        subscriptionName: subscriptions.name,
        serviceName: subscriptions.serviceName,
      })
      .from(payments)
      .innerJoin(subscriptions, eq(payments.subscriptionId, subscriptions.id))
      .where(eq(payments.userId, req.user.userId))
      .orderBy(desc(payments.createdAt))
      .limit(20);

    // Get monthly summaries (last 12 months)
    const monthlySummaries = await db
      .select()
      .from(financialSummary)
      .where(eq(financialSummary.userId, req.user.userId))
      .orderBy(desc(financialSummary.year), desc(financialSummary.month))
      .limit(12);

    // Calculate lifetime totals
    const lifetimeTotals = monthlySummaries.reduce(
      (acc, summary) => ({
        totalPaid: acc.totalPaid + parseFloat(summary.totalPaid || '0'),
        totalSaved: acc.totalSaved + parseFloat(summary.totalSaved || '0'),
      }),
      { totalPaid: 0, totalSaved: 0 }
    );

    // Calculate savings percentage
    const potentialMonthlyTotal = totalMonthlyPaid + totalMonthlySaved;
    const savingsPercentage = potentialMonthlyTotal > 0 
      ? (totalMonthlySaved / potentialMonthlyTotal) * 100 
      : 0;

    return NextResponse.json({
      currentMonth: {
        totalPaid: totalMonthlyPaid,
        totalSaved: totalMonthlySaved,
        savingsPercentage,
        subscriptionCount: userSubscriptions.length,
      },
      lifetime: {
        totalPaid: lifetimeTotals.totalPaid,
        totalSaved: lifetimeTotals.totalSaved,
      },
      subscriptionBreakdown,
      recentPayments,
      monthlySummaries,
    });
  } catch (error) {
    console.error('Get financial dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 