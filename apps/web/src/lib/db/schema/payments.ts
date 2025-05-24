import { pgTable, uuid, varchar, text, timestamp, decimal, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { subscriptions } from './subscriptions';

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  
  // Payment details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('BRL'),
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'completed', 'failed', 'refunded'
  
  // Payment type
  type: varchar('type', { length: 50 }).notNull(), // 'subscription', 'prorated', 'renewal'
  
  // Billing period
  billingPeriodStart: timestamp('billing_period_start').notNull(),
  billingPeriodEnd: timestamp('billing_period_end').notNull(),
  
  // Payment method and external references
  paymentMethod: varchar('payment_method', { length: 100 }), // 'pix', 'credit_card', etc.
  externalPaymentId: varchar('external_payment_id', { length: 255 }), // Gateway transaction ID
  
  // Metadata
  description: text('description'),
  receiptUrl: varchar('receipt_url', { length: 500 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  paidAt: timestamp('paid_at'),
});

// Financial summary table for analytics
export const financialSummary = pgTable('financial_summary', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Monthly totals
  month: integer('month').notNull(), // 1-12
  year: integer('year').notNull(),
  totalPaid: decimal('total_paid', { precision: 10, scale: 2 }).default('0'),
  totalSaved: decimal('total_saved', { precision: 10, scale: 2 }).default('0'), // Compared to individual subscriptions
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type FinancialSummary = typeof financialSummary.$inferSelect;
export type NewFinancialSummary = typeof financialSummary.$inferInsert; 