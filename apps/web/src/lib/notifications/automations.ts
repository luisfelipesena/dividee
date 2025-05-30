import { db } from '@/lib/db';
import {
  accessRequests,
  notifications,
  subscriptionMembers,
  subscriptions,
  users
} from '@/lib/db/schema';
import { and, eq, gte, lt } from 'drizzle-orm';

export interface NotificationPayload {
  userId: string;
  subscriptionId?: string;
  title: string;
  message: string;
  type: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  actionUrl?: string;
  actionText?: string;
  scheduledFor?: Date;
}

export class NotificationAutomation {

  async createNotification(payload: NotificationPayload): Promise<void> {
    await db.insert(notifications).values({
      ...payload,
      isRead: false,
      createdAt: new Date(),
    });
  }

  async createBulkNotifications(payloads: NotificationPayload[]): Promise<void> {
    if (payloads.length === 0) return;

    const notificationData = payloads.map(payload => ({
      ...payload,
      isRead: false,
      createdAt: new Date(),
    }));

    await db.insert(notifications).values(notificationData);
  }

  // Notify when access request is created
  async notifyNewAccessRequest(requestId: string): Promise<void> {
    const request = await db
      .select({
        id: accessRequests.id,
        userId: accessRequests.userId,
        subscriptionId: accessRequests.subscriptionId,
        user: {
          name: users.name,
          email: users.email,
        },
        subscription: {
          name: subscriptions.name,
          ownerId: subscriptions.ownerId,
        }
      })
      .from(accessRequests)
      .leftJoin(users, eq(accessRequests.userId, users.id))
      .leftJoin(subscriptions, eq(accessRequests.subscriptionId, subscriptions.id))
      .where(eq(accessRequests.id, requestId))
      .limit(1);

    if (!request.length) return;

    const req = request[0];

    // Notify subscription owner
    await this.createNotification({
      userId: req.subscription?.ownerId as string,
      subscriptionId: req.subscriptionId,
      title: 'Nova solicitação de acesso',
      message: `${req.user?.name} solicitou acesso à assinatura "${req.subscription?.name}".`,
      type: 'access_request_created',
      relatedEntityId: requestId,
      relatedEntityType: 'access_request',
      actionUrl: `/subscriptions/${req.subscriptionId}/requests`,
      actionText: 'Revisar Solicitação',
    });

    // Notify subscription admins
    const admins = await db
      .select({ userId: subscriptionMembers.userId })
      .from(subscriptionMembers)
      .where(
        and(
          eq(subscriptionMembers.subscriptionId, req.subscriptionId),
          eq(subscriptionMembers.role, 'admin')
        )
      );

    const adminNotifications = admins.map(admin => ({
      userId: admin.userId,
      subscriptionId: req.subscriptionId,
      title: 'Nova solicitação de acesso',
      message: `${req.user?.name} solicitou acesso à assinatura "${req.subscription?.name}".`,
      type: 'access_request_created',
      relatedEntityId: requestId,
      relatedEntityType: 'access_request',
      actionUrl: `/subscriptions/${req.subscriptionId}/requests`,
      actionText: 'Revisar Solicitação',
    }));

    if (adminNotifications.length > 0) {
      await this.createBulkNotifications(adminNotifications);
    }
  }

  // Notify when access request is approved/rejected
  async notifyAccessRequestResponse(requestId: string, approved: boolean): Promise<void> {
    const request = await db
      .select({
        id: accessRequests.id,
        userId: accessRequests.userId,
        subscriptionId: accessRequests.subscriptionId,
        subscription: {
          name: subscriptions.name,
        }
      })
      .from(accessRequests)
      .leftJoin(subscriptions, eq(accessRequests.subscriptionId, subscriptions.id))
      .where(eq(accessRequests.id, requestId))
      .limit(1);

    if (!request.length) return;

    const req = request[0];
    const status = approved ? 'aprovada' : 'rejeitada';
    const actionUrl = approved ? `/subscriptions/${req.subscriptionId}` : '/subscriptions/public';

    await this.createNotification({
      userId: req.userId,
      subscriptionId: req.subscriptionId,
      title: `Solicitação ${status}`,
      message: `Sua solicitação para a assinatura "${req.subscription?.name}" foi ${status}.`,
      type: approved ? 'access_request_approved' : 'access_request_rejected',
      relatedEntityId: requestId,
      relatedEntityType: 'access_request',
      actionUrl,
      actionText: approved ? 'Ver Assinatura' : 'Buscar Outras',
    });
  }

  // Check for subscriptions expiring soon
  async checkExpiringSubscriptions(): Promise<void> {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    // Get subscriptions expiring in 7, 3, and 1 days
    const expiringSubscriptions = await db
      .select({
        id: subscriptions.id,
        name: subscriptions.name,
        renewalDate: subscriptions.renewalDate,
        ownerId: subscriptions.ownerId,
        currentMembers: subscriptions.currentMembers,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.isActive, true),
          gte(subscriptions.renewalDate, new Date()),
          lt(subscriptions.renewalDate, sevenDaysFromNow)
        )
      );

    for (const subscription of expiringSubscriptions) {
      const daysUntilExpiry = Math.ceil(
        (subscription.renewalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      let shouldNotify = false;
      let urgency = '';

      if (daysUntilExpiry <= 1) {
        shouldNotify = true;
        urgency = 'URGENTE';
      } else if (daysUntilExpiry <= 3) {
        shouldNotify = true;
        urgency = 'IMPORTANTE';
      } else if (daysUntilExpiry <= 7) {
        shouldNotify = true;
        urgency = '';
      }

      if (shouldNotify) {
        // Get all members
        const members = await db
          .select({ userId: subscriptionMembers.userId })
          .from(subscriptionMembers)
          .where(eq(subscriptionMembers.subscriptionId, subscription.id));

        const notifications_data = [
          // Owner notification
          {
            userId: subscription.ownerId,
            subscriptionId: subscription.id,
            title: `${urgency ? urgency + ': ' : ''}Renovação próxima`,
            message: `A assinatura "${subscription.name}" expira em ${daysUntilExpiry} dia(s). Renove para manter o acesso.`,
            type: 'subscription_expiring',
            relatedEntityId: subscription.id,
            relatedEntityType: 'subscription',
            actionUrl: `/subscriptions/${subscription.id}/renew`,
            actionText: 'Renovar Agora',
          },
          // Member notifications
          ...members.map(member => ({
            userId: member.userId,
            subscriptionId: subscription.id,
            title: `${urgency ? urgency + ': ' : ''}Renovação próxima`,
            message: `A assinatura "${subscription.name}" expira em ${daysUntilExpiry} dia(s).`,
            type: 'subscription_expiring_member',
            relatedEntityId: subscription.id,
            relatedEntityType: 'subscription',
            actionUrl: `/subscriptions/${subscription.id}`,
            actionText: 'Ver Detalhes',
          }))
        ];

        await this.createBulkNotifications(notifications_data);
      }
    }
  }

  // Check for overdue payments
  async checkOverduePayments(): Promise<void> {
    const overduePayments = await db
      .select({
        userId: subscriptionMembers.userId,
        subscriptionId: subscriptionMembers.subscriptionId,
        nextPaymentDue: subscriptionMembers.nextPaymentDue,
        subscription: {
          name: subscriptions.name,
        }
      })
      .from(subscriptionMembers)
      .leftJoin(subscriptions, eq(subscriptionMembers.subscriptionId, subscriptions.id))
      .where(
        and(
          lt(subscriptionMembers.nextPaymentDue, new Date()),
          eq(subscriptions.isActive, true)
        )
      );

    const notifications_data = overduePayments.map(payment => ({
      userId: payment.userId,
      subscriptionId: payment.subscriptionId,
      title: 'Pagamento em atraso',
      message: `Seu pagamento para a assinatura "${payment.subscription?.name}" está em atraso.`,
      type: 'payment_overdue',
      relatedEntityId: payment.subscriptionId,
      relatedEntityType: 'subscription',
      actionUrl: `/subscriptions/${payment.subscriptionId}/payment`,
      actionText: 'Pagar Agora',
    }));

    if (notifications_data.length > 0) {
      await this.createBulkNotifications(notifications_data);
    }
  }

  // Check for password rotation needs
  async checkPasswordRotation(): Promise<void> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const subscriptionsNeedingRotation = await db
      .select({
        id: subscriptions.id,
        name: subscriptions.name,
        ownerId: subscriptions.ownerId,
        lastPasswordChange: subscriptions.lastPasswordChange,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.isActive, true),
          lt(subscriptions.lastPasswordChange, threeMonthsAgo)
        )
      );

    const notifications_data = subscriptionsNeedingRotation.map(subscription => ({
      userId: subscription.ownerId,
      subscriptionId: subscription.id,
      title: 'Troca de senha recomendada',
      message: `É recomendado trocar a senha da assinatura "${subscription.name}" por questões de segurança.`,
      type: 'password_rotation_needed',
      relatedEntityId: subscription.id,
      relatedEntityType: 'subscription',
      actionUrl: `/subscriptions/${subscription.id}/credentials`,
      actionText: 'Atualizar Senha',
    }));

    if (notifications_data.length > 0) {
      await this.createBulkNotifications(notifications_data);
    }
  }

  // Run all automation checks
  async runAllChecks(): Promise<void> {
    try {
      await Promise.all([
        this.checkExpiringSubscriptions(),
        this.checkOverduePayments(),
        this.checkPasswordRotation(),
      ]);
    } catch (error) {
      console.error('Error running notification automation checks:', error);
    }
  }
}

export const notificationAutomation = new NotificationAutomation()