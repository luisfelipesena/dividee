export interface PartialUser {
  id: number;
  fullName: string | null;
}

export interface User extends PartialUser {
  email: string;
  createdAt: Date;
}

export interface GroupMember extends User {
  role: 'admin' | 'member';
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: Date;
  members?: GroupMember[];
  subscriptions?: Subscription[];
}

export interface Subscription {
  id: number;
  name: string;
  icon?: string;
  iconUrl?: string;
  cost: number;
  totalCost?: number;
  members: number;
  maxMembers: number;
  isPublic: boolean;
  ownerId: number;
  groupId?: number | null;
  status: 'active' | 'paused' | 'expired';
  expiresAt?: Date | null;
  renewalDate?: Date | null;
  billingCycle?: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: number;
  subscriptionId: number;
  userId: number;
  description: string;
  amount: number;
  category?: string;
  date: string;
  createdAt: string;
  participants?: PartialUser[];
  user?: PartialUser;
  subscription?: {
    id: number;
    name: string;
  };
}

export interface Payment {
  id: number;
  userId: number;
  subscriptionId: number;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: Date;
  paidAt?: Date | null;
  createdAt: Date;
}

export interface Invitation {
  id: number;
  email: string;
  groupId?: number | null;
  subscriptionId?: number | null;
  invitedBy: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
}

// Form validation types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateGroupFormData {
  name: string;
  description?: string;
}

export interface CreateSubscriptionFormData {
  name: string;
  iconUrl?: string;
  isPublic: boolean;
  totalCost: number;
  maxMembers: number;
  groupId?: number;
  expiresAt?: Date;
  renewalDate?: Date;
  billingCycle?: 'monthly' | 'yearly' | 'weekly' | 'once';
  notes?: string;
  participants?: number[];
}

export interface CreateExpenseFormData {
  subscriptionId: number;
  description: string;
  amount: number;
  category?: string;
  date?: string;
  participants?: number[];
}

// API request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface CreateSubscriptionRequest {
  name: string;
  iconUrl?: string;
  isPublic: boolean;
  totalCost: number;
  maxMembers: number;
  groupId?: number;
  expiresAt?: string;
  renewalDate?: string;
  billingCycle?: string;
  notes?: string;
}

export interface CreateExpenseRequest {
  subscriptionId: number;
  description: string;
  amount: number;
  category?: string;
  date?: string;
  participants?: number[];
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Enums
export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired'
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue'
}

export enum GroupRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  WEEKLY = 'weekly'
}

// Re-export schemas and form types
export * from './schemas';
