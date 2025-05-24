import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';
import { subscriptions } from './subscriptions';

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Notification content
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'payment_reminder', 'renewal_alert', 'access_request', 'password_change', etc.
  
  // Related entities
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'cascade' }),
  relatedEntityId: uuid('related_entity_id'), // Generic ID for any related entity
  relatedEntityType: varchar('related_entity_type', { length: 50 }), // 'group', 'subscription', 'payment', etc.
  
  // Status
  isRead: boolean('is_read').default(false),
  isArchived: boolean('is_archived').default(false),
  
  // Action data
  actionUrl: varchar('action_url', { length: 500 }), // URL for action button
  actionText: varchar('action_text', { length: 100 }), // Text for action button
  
  // Timing
  scheduledFor: timestamp('scheduled_for'), // For scheduled notifications
  sentAt: timestamp('sent_at'),
  readAt: timestamp('read_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert; 