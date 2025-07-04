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