import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';
import { NextRequest } from 'next/server';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        details: entry.details,
        severity: entry.severity || 'info',
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  static async logWithRequest(
    entry: Omit<AuditLogEntry, 'ipAddress' | 'userAgent'>,
    request: NextRequest
  ): Promise<void> {
    const ipAddress = this.getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    await this.log({
      ...entry,
      ipAddress,
      userAgent,
    });
  }

  private static getClientIp(request: NextRequest): string | undefined {
    // Try various headers to get the real client IP
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const xRealIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    if (xForwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      return xForwardedFor.split(',')[0].trim();
    }

    if (xRealIp) {
      return xRealIp;
    }

    if (cfConnectingIp) {
      return cfConnectingIp;
    }

    return undefined;
  }

  // Predefined audit actions for consistency
  static readonly Actions = {
    // Authentication
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    USER_SIGNUP: 'user_signup',
    PASSWORD_CHANGED: 'password_changed',

    // Credentials
    CREDENTIAL_ACCESSED: 'credential_accessed',
    CREDENTIAL_CREATED: 'credential_created',
    CREDENTIAL_UPDATED: 'credential_updated',
    CREDENTIAL_DELETED: 'credential_deleted',

    // Groups
    GROUP_CREATED: 'group_created',
    GROUP_UPDATED: 'group_updated',
    GROUP_DELETED: 'group_deleted',
    GROUP_MEMBER_ADDED: 'group_member_added',
    GROUP_MEMBER_REMOVED: 'group_member_removed',
    GROUP_INVITE_SENT: 'group_invite_sent',

    // Subscriptions
    SUBSCRIPTION_CREATED: 'subscription_created',
    SUBSCRIPTION_UPDATED: 'subscription_updated',
    SUBSCRIPTION_DELETED: 'subscription_deleted',
    SUBSCRIPTION_MEMBER_ADDED: 'subscription_member_added',
    SUBSCRIPTION_MEMBER_REMOVED: 'subscription_member_removed',

    // Access Requests
    ACCESS_REQUEST_CREATED: 'access_request_created',
    ACCESS_REQUEST_APPROVED: 'access_request_approved',
    ACCESS_REQUEST_REJECTED: 'access_request_rejected',

    // Payments
    PAYMENT_CREATED: 'payment_created',
    PAYMENT_UPDATED: 'payment_updated',
  } as const;

  static readonly EntityTypes = {
    USER: 'user',
    GROUP: 'group',
    SUBSCRIPTION: 'subscription',
    ACCESS_REQUEST: 'access_request',
    PAYMENT: 'payment',
    CREDENTIAL: 'credential',
  } as const;

  static readonly Severity = {
    LOW: 'low' as const,
    MEDIUM: 'medium' as const,
    HIGH: 'high' as const,
    CRITICAL: 'critical' as const,
  };
}

// Convenience functions for common audit events
export const auditLog = {
  userLogin: (userId: string, request: NextRequest) =>
    AuditLogger.logWithRequest({
      userId,
      action: AuditLogger.Actions.USER_LOGIN,
      entityType: AuditLogger.EntityTypes.USER,
      entityId: userId,
      severity: AuditLogger.Severity.LOW,
    }, request),

  credentialAccessed: (userId: string, subscriptionId: string, request: NextRequest) =>
    AuditLogger.logWithRequest({
      userId,
      action: AuditLogger.Actions.CREDENTIAL_ACCESSED,
      entityType: AuditLogger.EntityTypes.SUBSCRIPTION,
      entityId: subscriptionId,
      severity: AuditLogger.Severity.MEDIUM,
      details: { accessedAt: new Date().toISOString() },
    }, request),

  passwordChanged: (userId: string, subscriptionId: string, request: NextRequest) =>
    AuditLogger.logWithRequest({
      userId,
      action: AuditLogger.Actions.CREDENTIAL_UPDATED,
      entityType: AuditLogger.EntityTypes.SUBSCRIPTION,
      entityId: subscriptionId,
      severity: AuditLogger.Severity.HIGH,
      details: { passwordChanged: true },
    }, request),

  memberAdded: (
    userId: string,
    targetUserId: string,
    entityType: 'group' | 'subscription',
    entityId: string,
    request: NextRequest
  ) =>
    AuditLogger.logWithRequest({
      userId,
      action: entityType === 'group'
        ? AuditLogger.Actions.GROUP_MEMBER_ADDED
        : AuditLogger.Actions.SUBSCRIPTION_MEMBER_ADDED,
      entityType: entityType === 'group'
        ? AuditLogger.EntityTypes.GROUP
        : AuditLogger.EntityTypes.SUBSCRIPTION,
      entityId,
      severity: AuditLogger.Severity.MEDIUM,
      details: { targetUserId, addedAt: new Date().toISOString() },
    }, request),

  accessRequestProcessed: (
    userId: string,
    requestId: string,
    approved: boolean,
    request: NextRequest
  ) =>
    AuditLogger.logWithRequest({
      userId,
      action: approved
        ? AuditLogger.Actions.ACCESS_REQUEST_APPROVED
        : AuditLogger.Actions.ACCESS_REQUEST_REJECTED,
      entityType: AuditLogger.EntityTypes.ACCESS_REQUEST,
      entityId: requestId,
      severity: AuditLogger.Severity.MEDIUM,
      details: { approved, processedAt: new Date().toISOString() },
    }, request),
};