import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

// Enums
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'paused', 'expired']);
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'rejected', 'expired']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'overdue']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
  email: varchar('email', { length: 256 }).unique().notNull(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Groups table
export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description'),
  ownerId: integer('owner_id')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Subscriptions table with extended fields
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  iconUrl: text('icon_url'),
  isPublic: boolean('is_public').default(false).notNull(),
  totalCost: integer('total_cost').notNull(), // in cents
  maxMembers: integer('max_members').notNull(),
  ownerId: integer('owner_id')
    .references(() => users.id)
    .notNull(),
  groupId: integer('group_id')
    .references(() => groups.id),
  status: subscriptionStatusEnum('status').default('active').notNull(),
  expiresAt: timestamp('expires_at'),
  renewalDate: timestamp('renewal_date'),
  billingCycle: varchar('billing_cycle', { length: 50 }).default('monthly'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users to Subscriptions relationship
export const usersToSubscriptions = pgTable('users_to_subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  subscriptionId: integer('subscription_id')
    .notNull()
    .references(() => subscriptions.id),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// Users to Groups relationship
export const usersToGroups = pgTable('users_to_groups', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  groupId: integer('group_id')
    .notNull()
    .references(() => groups.id),
  role: varchar('role', { length: 50 }).default('member').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Invitations table
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 256 }).notNull(),
  groupId: integer('group_id')
    .references(() => groups.id),
  subscriptionId: integer('subscription_id')
    .references(() => subscriptions.id),
  invitedBy: integer('invited_by')
    .references(() => users.id)
    .notNull(),
  status: invitationStatusEnum('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Payments table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  subscriptionId: integer('subscription_id')
    .references(() => subscriptions.id)
    .notNull(),
  amount: integer('amount').notNull(), // in cents
  status: paymentStatusEnum('status').default('pending').notNull(),
  dueDate: timestamp('due_date').notNull(),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  usersToSubscriptions: many(usersToSubscriptions),
  usersToGroups: many(usersToGroups),
  ownedGroups: many(groups),
  ownedSubscriptions: many(subscriptions),
  invitations: many(invitations),
  payments: many(payments),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  owner: one(users, {
    fields: [groups.ownerId],
    references: [users.id],
  }),
  usersToGroups: many(usersToGroups),
  subscriptions: many(subscriptions),
  invitations: many(invitations),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  owner: one(users, {
    fields: [subscriptions.ownerId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [subscriptions.groupId],
    references: [groups.id],
  }),
  usersToSubscriptions: many(usersToSubscriptions),
  invitations: many(invitations),
  payments: many(payments),
}));

export const usersToSubscriptionsRelations = relations(
  usersToSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [usersToSubscriptions.userId],
      references: [users.id],
    }),
    subscription: one(subscriptions, {
      fields: [usersToSubscriptions.subscriptionId],
      references: [subscriptions.id],
    }),
  })
);

export const usersToGroupsRelations = relations(
  usersToGroups,
  ({ one }) => ({
    user: one(users, {
      fields: [usersToGroups.userId],
      references: [users.id],
    }),
    group: one(groups, {
      fields: [usersToGroups.groupId],
      references: [groups.id],
    }),
  })
);

export const invitationsRelations = relations(invitations, ({ one }) => ({
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [invitations.groupId],
    references: [groups.id],
  }),
  subscription: one(subscriptions, {
    fields: [invitations.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id],
  }),
})); 