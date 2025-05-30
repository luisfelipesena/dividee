import { pgTable, uuid, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  // Action details
  action: varchar('action', { length: 100 }).notNull(), // e.g., 'credential_accessed', 'member_added', 'password_changed'
  entityType: varchar('entity_type', { length: 50 }).notNull(), // e.g., 'subscription', 'group', 'user'
  entityId: uuid('entity_id'), // ID of the affected entity
  
  // Request details
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
  userAgent: text('user_agent'),
  
  // Additional context
  details: jsonb('details'), // Additional structured data about the action
  severity: varchar('severity', { length: 20 }).default('info'), // 'low', 'medium', 'high', 'critical'
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});