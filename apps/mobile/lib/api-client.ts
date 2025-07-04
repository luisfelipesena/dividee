import {
  AuthResponse,
  CreateExpenseRequest,
  CreateGroupRequest,
  CreateSubscriptionRequest,
  CreateSubscriptionFormData,
  Expense,
  Group,
  LoginRequest,
  RegisterRequest,
  Subscription,
  User
} from '@monorepo/types';

import { api } from './api';

// Type-safe API client class
class ApiClient {
  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', userData);
    return data;
  }

  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  }

  async getUserProfile(): Promise<User> {
    const { data } = await api.get<User>('/auth/profile');
    return data;
  }

  async getUserStats(): Promise<{
    subscriptionCount: number;
    totalSavings: number;
  }> {
    const { data: subscriptions } = await api.get<Subscription[]>('/subscriptions');
    
    const subscriptionCount = subscriptions.length;
    let totalSavings = 0;

    subscriptions.forEach((sub) => {
      const yourCost = sub.cost / sub.members;
      const fullCost = sub.cost;
      totalSavings += fullCost - yourCost;
    });

    return {
      subscriptionCount,
      totalSavings,
    };
  }

  // Group endpoints
  async getGroups(): Promise<Group[]> {
    const { data } = await api.get<Group[]>('/groups');
    return data;
  }

  async getGroup(groupId: number): Promise<Group> {
    const { data } = await api.get<Group>(`/groups/${groupId}`);
    return data;
  }

  async createGroup(groupData: CreateGroupRequest): Promise<Group> {
    const { data } = await api.post<Group>('/groups', groupData);
    return data;
  }

  async updateGroup(
    groupId: number,
    groupData: Partial<CreateGroupRequest>
  ): Promise<Group> {
    const { data } = await api.put<Group>(`/groups/${groupId}`, groupData);
    return data;
  }

  async deleteGroup(groupId: number): Promise<void> {
    await api.delete(`/groups/${groupId}`);
  }

  async inviteMember(groupId: number, email: string): Promise<void> {
    const { data } = await api.post(`/groups/${groupId}/invite`, { email });
    return data;
  }

  // Subscription endpoints
  async getSubscriptions(): Promise<Subscription[]> {
    const { data } = await api.get<Subscription[]>('/subscriptions');
    return data;
  }

  async getSubscription(subscriptionId: number): Promise<Subscription> {
    const { data } = await api.get<Subscription>(
      `/subscriptions/${subscriptionId}`
    );
    return data;
  }

  async getGroupSubscriptions(groupId: number): Promise<Subscription[]> {
    const { data } = await api.get<Subscription[]>(
      `/subscriptions/group/${groupId}`
    );
    return data;
  }

  async createSubscription(
    subscriptionData: CreateSubscriptionRequest
  ): Promise<Subscription> {
    const { data } = await api.post<Subscription>(
      '/subscriptions',
      subscriptionData
    );
    return data;
  }

  async createSubscriptionFromForm(
    subscriptionData: CreateSubscriptionFormData
  ): Promise<Subscription> {
    const { data } = await api.post<Subscription>(
      '/subscriptions',
      subscriptionData
    );
    return data;
  }

  async updateSubscription(
    subscriptionId: number,
    subscriptionData: Partial<CreateSubscriptionRequest>
  ): Promise<Subscription> {
    const { data } = await api.put<Subscription>(
      `/subscriptions/${subscriptionId}`,
      subscriptionData
    );
    return data;
  }

  async deleteSubscription(subscriptionId: number): Promise<void> {
    await api.delete(`/subscriptions/${subscriptionId}`);
  }

  async getPublicSubscriptions(): Promise<Subscription[]> {
    const { data } = await api.get<Subscription[]>('/subscriptions/public');
    return data;
  }

  async joinSubscription(subscriptionId: number): Promise<void> {
    await api.post(`/subscriptions/${subscriptionId}/join`);
  }

  // Expense endpoints
  async getExpenses(): Promise<Expense[]> {
    const { data } = await api.get<Expense[]>('/expenses');
    return data;
  }

  async getSubscriptionExpenses(subscriptionId: number): Promise<Expense[]> {
    const { data } = await api.get<Expense[]>(
      `/expenses/subscription/${subscriptionId}`
    );
    return data;
  }

  async getGroupExpenses(groupId: number): Promise<Expense[]> {
    const { data } = await api.get<Expense[]>(`/expenses/group/${groupId}`);
    return data;
  }

  async createExpense(expenseData: CreateExpenseRequest): Promise<Expense> {
    const { data } = await api.post<Expense>('/expenses', expenseData);
    return data;
  }

  async updateExpense(
    expenseId: number,
    expenseData: Partial<CreateExpenseRequest>
  ): Promise<Expense> {
    const { data } = await api.put<Expense>(
      `/expenses/${expenseId}`,
      expenseData
    );
    return data;
  }

  async deleteExpense(expenseId: number): Promise<void> {
    await api.delete(`/expenses/${expenseId}`);
  }

  async getExpenseSummary(): Promise<{
    totalAmount: number;
    totalCount: number;
    bySubscription: {
      subscriptionId: number;
      subscriptionName: string;
      totalAmount: number;
      count: number;
    }[];
    byCategory: {
      category: string;
      totalAmount: number;
      count: number;
    }[];
  }> {
    const { data } = await api.get('/expenses/summary');
    return data;
  }
}

export const apiClient = new ApiClient();
