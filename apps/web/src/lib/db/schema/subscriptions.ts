import { pgTable, uuid, varchar, text, timestamp, integer, decimal, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';
import { groups } from './groups';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  serviceName: varchar('service_name', { length: 255 }).notNull(), // Netflix, Spotify, etc.
  description: text('description'),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').references(() => groups.id, { onDelete: 'cascade' }),
  
  // Financial data
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('BRL'),
  
  // Membership limits
  maxMembers: integer('max_members').notNull(),
  currentMembers: integer('current_members').default(1),
  
  // Access type
  isPublic: boolean('is_public').default(false), // public or private subscription
  
  // Subscription details
  renewalDate: timestamp('renewal_date').notNull(),
  isActive: boolean('is_active').default(true),
  
  // Credentials management
  credentialsId: varchar('credentials_id', { length: 255 }), // Bitwarden item ID or encrypted creds
  lastPasswordChange: timestamp('last_password_change'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert; 