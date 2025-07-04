import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
  email: varchar('email', { length: 256 }).unique().notNull(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  iconUrl: text('icon_url'),
  isPublic: boolean('is_public').default(false).notNull(),
  totalCost: integer('total_cost').notNull(),
  maxMembers: integer('max_members').notNull(),
  ownerId: integer('owner_id')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersToSubscriptions = pgTable('users_to_subscriptions', {
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  subscriptionId: integer('subscription_id')
    .notNull()
    .references(() => subscriptions.id),
});

export const usersRelations = relations(users, ({ many }) => ({
  usersToSubscriptions: many(usersToSubscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  owner: one(users, {
    fields: [subscriptions.ownerId],
    references: [users.id],
  }),
  usersToSubscriptions: many(usersToSubscriptions),
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