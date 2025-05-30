import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  subscriptions, 
  subscriptionMembers, 
  accessRequests,
  notifications 
} from '@/lib/db/schema';
import { eq, and, lt, count, gte } from 'drizzle-orm';
import { withAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  return withAuth(async (user) => {
    try {
      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      // Get user's subscriptions that are expiring soon
      const expiringSubscriptions = await db
        .select({
          id: subscriptions.id,
          name: subscriptions.name,
          serviceName: subscriptions.serviceName,
          renewalDate: subscriptions.renewalDate,
          totalPrice: subscriptions.totalPrice,
          currency: subscriptions.currency,
          ownerId: subscriptions.ownerId,
        })
        .from(subscriptions)
        .leftJoin(subscriptionMembers, eq(subscriptions.id, subscriptionMembers.subscriptionId))
        .where(
          and(
            eq(subscriptions.isActive, true),
            gte(subscriptions.renewalDate, now),
            lt(subscriptions.renewalDate, sevenDaysFromNow),
            eq(subscriptionMembers.userId, user.id)
          )
        );

      // Get overdue payments for user
      const overduePayments = await db
        .select({
          subscriptionId: subscriptionMembers.subscriptionId,
          nextPaymentDue: subscriptionMembers.nextPaymentDue,
          subscription: {
            name: subscriptions.name,
            serviceName: subscriptions.serviceName,
          }
        })
        .from(subscriptionMembers)
        .leftJoin(subscriptions, eq(subscriptionMembers.subscriptionId, subscriptions.id))
        .where(
          and(
            eq(subscriptionMembers.userId, user.id),
            lt(subscriptionMembers.nextPaymentDue, now),
            eq(subscriptions.isActive, true)
          )
        );

      // Get pending access requests for user's subscriptions
      const pendingRequests = await db
        .select({
          count: count(accessRequests.id)
        })
        .from(accessRequests)
        .leftJoin(subscriptions, eq(accessRequests.subscriptionId, subscriptions.id))
        .where(
          and(
            eq(subscriptions.ownerId, user.id),
            eq(accessRequests.status, 'pending')
          )
        );

      // Get subscriptions needing password rotation (owner only)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const passwordRotationNeeded = await db
        .select({
          id: subscriptions.id,
          name: subscriptions.name,
          serviceName: subscriptions.serviceName,
          lastPasswordChange: subscriptions.lastPasswordChange,
        })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.ownerId, user.id),
            eq(subscriptions.isActive, true),
            subscriptions.lastPasswordChange ? lt(subscriptions.lastPasswordChange, threeMonthsAgo) : undefined
          )
        );

      // Get unread notification count
      const unreadNotifications = await db
        .select({
          count: count(notifications.id)
        })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, user.id),
            eq(notifications.isRead, false)
          )
        );

      // Calculate urgency levels
      const criticalAlerts: any[] = [];
      const warningAlerts: any[] = [];
      const infoAlerts: any[] = [];

      // Process expiring subscriptions
      expiringSubscriptions.forEach(sub => {
        const daysUntilExpiry = Math.ceil(
          (sub.renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        const isOwner = sub.ownerId === user.id;
        const alert = {
          type: 'subscription_expiring',
          severity: daysUntilExpiry <= 1 ? 'critical' : daysUntilExpiry <= 3 ? 'warning' : 'info',
          title: `${sub.name} expira em ${daysUntilExpiry} dia(s)`,
          description: `A assinatura do ${sub.serviceName} precisa ser renovada.`,
          actionUrl: `/subscriptions/${sub.id}`,
          actionText: isOwner ? 'Renovar' : 'Ver Detalhes',
          data: sub,
        };

        if (alert.severity === 'critical') criticalAlerts.push(alert);
        else if (alert.severity === 'warning') warningAlerts.push(alert);
        else infoAlerts.push(alert);
      });

      // Process overdue payments
      overduePayments.forEach(payment => {
        const daysOverdue = Math.ceil(
          (now.getTime() - payment.nextPaymentDue.getTime()) / (1000 * 60 * 60 * 24)
        );

        criticalAlerts.push({
          type: 'payment_overdue',
          severity: 'critical',
          title: `Pagamento em atraso - ${payment.subscription.name}`,
          description: `Pagamento está ${daysOverdue} dia(s) em atraso.`,
          actionUrl: `/subscriptions/${payment.subscriptionId}/payment`,
          actionText: 'Pagar Agora',
          data: payment,
        });
      });

      // Process pending requests
      if (pendingRequests[0]?.count > 0) {
        infoAlerts.push({
          type: 'pending_requests',
          severity: 'info',
          title: `${pendingRequests[0].count} solicitação(ões) pendente(s)`,
          description: 'Você tem solicitações de acesso aguardando aprovação.',
          actionUrl: '/dashboard/requests',
          actionText: 'Revisar',
          data: { count: pendingRequests[0].count },
        });
      }

      // Process password rotation
      passwordRotationNeeded.forEach(sub => {
        const monthsSinceChange = sub.lastPasswordChange ? Math.floor(
          (now.getTime() - sub.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24 * 30)
        ) : 0;

        warningAlerts.push({
          type: 'password_rotation',
          severity: 'warning',
          title: `Senha antiga - ${sub.name}`,
          description: `Senha não é alterada há ${monthsSinceChange} meses.`,
          actionUrl: `/subscriptions/${sub.id}/credentials`,
          actionText: 'Atualizar Senha',
          data: sub,
        });
      });

      return NextResponse.json({
        summary: {
          critical: criticalAlerts.length,
          warning: warningAlerts.length,
          info: infoAlerts.length,
          unreadNotifications: unreadNotifications[0]?.count || 0,
        },
        alerts: {
          critical: criticalAlerts,
          warning: warningAlerts,
          info: infoAlerts,
        },
        lastUpdated: now.toISOString(),
      });
    } catch (error) {
      console.error('Error fetching dashboard alerts:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}