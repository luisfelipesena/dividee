import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auditLogs, users } from '@/lib/db/schema';
import { eq, and, desc, gte, lte, ilike, or } from 'drizzle-orm';
import { withAuth } from '@/lib/auth/middleware';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  action: z.string().optional(),
  entityType: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  return withAuth(async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = querySchema.parse(Object.fromEntries(searchParams));

      const offset = (query.page - 1) * query.limit;

      // Build where conditions
      let whereConditions = [
        eq(auditLogs.userId, user.id), // Only show logs for the current user
      ];

      if (query.action) {
        whereConditions.push(eq(auditLogs.action, query.action));
      }

      if (query.entityType) {
        whereConditions.push(eq(auditLogs.entityType, query.entityType));
      }

      if (query.severity) {
        whereConditions.push(eq(auditLogs.severity, query.severity));
      }

      if (query.startDate) {
        whereConditions.push(gte(auditLogs.createdAt, new Date(query.startDate)));
      }

      if (query.endDate) {
        whereConditions.push(lte(auditLogs.createdAt, new Date(query.endDate)));
      }

      if (query.search) {
        whereConditions.push(
          or(
            ilike(auditLogs.action, `%${query.search}%`),
            ilike(auditLogs.entityType, `%${query.search}%`)
          )!
        );
      }

      // Get logs with pagination
      const logs = await db
        .select({
          id: auditLogs.id,
          action: auditLogs.action,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          details: auditLogs.details,
          severity: auditLogs.severity,
          ipAddress: auditLogs.ipAddress,
          userAgent: auditLogs.userAgent,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .where(and(...whereConditions))
        .orderBy(desc(auditLogs.createdAt))
        .limit(query.limit)
        .offset(offset);

      // Get total count for pagination
      const totalCount = await db
        .select({ count: auditLogs.id })
        .from(auditLogs)
        .where(and(...whereConditions));

      // Format logs for response
      const formattedLogs = logs.map(log => ({
        ...log,
        actionDescription: getActionDescription(log.action),
        severityLabel: getSeverityLabel(log.severity || 'low'),
        userAgent: log.userAgent ? parseUserAgent(log.userAgent) : null,
      }));

      return NextResponse.json({
        logs: formattedLogs,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: totalCount.length,
          totalPages: Math.ceil(totalCount.length / query.limit),
        },
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid query parameters', details: error.errors },
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

function getActionDescription(action: string): string {
  const descriptions: Record<string, string> = {
    user_login: 'Login realizado',
    user_logout: 'Logout realizado',
    user_signup: 'Conta criada',
    password_changed: 'Senha alterada',
    credential_accessed: 'Credenciais acessadas',
    credential_created: 'Credenciais criadas',
    credential_updated: 'Credenciais atualizadas',
    credential_deleted: 'Credenciais excluídas',
    group_created: 'Grupo criado',
    group_updated: 'Grupo atualizado',
    group_deleted: 'Grupo excluído',
    group_member_added: 'Membro adicionado ao grupo',
    group_member_removed: 'Membro removido do grupo',
    group_invite_sent: 'Convite de grupo enviado',
    subscription_created: 'Assinatura criada',
    subscription_updated: 'Assinatura atualizada',
    subscription_deleted: 'Assinatura excluída',
    subscription_member_added: 'Membro adicionado à assinatura',
    subscription_member_removed: 'Membro removido da assinatura',
    access_request_created: 'Solicitação de acesso criada',
    access_request_approved: 'Solicitação de acesso aprovada',
    access_request_rejected: 'Solicitação de acesso rejeitada',
    payment_created: 'Pagamento registrado',
    payment_updated: 'Pagamento atualizado',
  };

  return descriptions[action] || action;
}

function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica',
  };

  return labels[severity] || severity;
}

function parseUserAgent(userAgent: string): { browser?: string; os?: string; device?: string } {
  // Simple user agent parsing - in production, consider using a library like ua-parser-js
  const result: { browser?: string; os?: string; device?: string } = {};

  // Browser detection
  if (userAgent.includes('Chrome')) result.browser = 'Chrome';
  else if (userAgent.includes('Firefox')) result.browser = 'Firefox';
  else if (userAgent.includes('Safari')) result.browser = 'Safari';
  else if (userAgent.includes('Edge')) result.browser = 'Edge';

  // OS detection
  if (userAgent.includes('Windows')) result.os = 'Windows';
  else if (userAgent.includes('Mac')) result.os = 'macOS';
  else if (userAgent.includes('Linux')) result.os = 'Linux';
  else if (userAgent.includes('Android')) result.os = 'Android';
  else if (userAgent.includes('iOS')) result.os = 'iOS';

  // Device detection
  if (userAgent.includes('Mobile')) result.device = 'Mobile';
  else if (userAgent.includes('Tablet')) result.device = 'Tablet';
  else result.device = 'Desktop';

  return result;
}