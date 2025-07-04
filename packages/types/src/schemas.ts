import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// Group schemas
export const createGroupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
});

// Subscription schemas
export const createSubscriptionSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  iconUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  isPublic: z.boolean(),
  totalCost: z.number().positive('Valor deve ser positivo'),
  maxMembers: z.number().int().positive('Número de membros deve ser positivo'),
  groupId: z.number().int().positive().optional(),
  expiresAt: z.date().optional(),
  renewalDate: z.date().optional(),
  billingCycle: z.enum(['monthly', 'yearly', 'weekly', 'once']).default('monthly'),
  notes: z.string().optional(),
  participants: z.array(z.number().int().positive()).optional(),
});

// Expense schemas
export const createExpenseSchema = z.object({
  subscriptionId: z
    .number()
    .int()
    .positive('ID da assinatura é obrigatório')
    .optional(),
  description: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres'),
  amount: z.number().positive('Valor deve ser positivo'),
  category: z.string().optional(),
  date: z.string().optional(),
  participants: z.array(z.number().int().positive()).optional(),
});

// Type inference from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateGroupFormData = z.infer<typeof createGroupSchema>;
export type CreateSubscriptionFormData = z.infer<typeof createSubscriptionSchema>;
export type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;