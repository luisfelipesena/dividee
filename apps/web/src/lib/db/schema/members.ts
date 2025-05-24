import { pgTable, uuid, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';
import { groups } from './groups';
import { subscriptions } from './subscriptions';

// Group members relationship
export const groupMembers = pgTable('group_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).default('member'), // 'admin', 'member'
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Subscription members relationship
export const subscriptionMembers = pgTable('subscription_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).default('member'), // 'admin', 'member'
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  lastPayment: timestamp('last_payment'),
  nextPaymentDue: timestamp('next_payment_due'),
});

export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;
export type SubscriptionMember = typeof subscriptionMembers.$inferSelect;
export type NewSubscriptionMember = typeof subscriptionMembers.$inferInsert; 