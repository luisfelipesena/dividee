export interface User {
  id: number;
  fullName: string | null;
  email: string;
  createdAt: Date;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: Date;
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