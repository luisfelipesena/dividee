export interface Subscription {
  id: string;
  name: string;
  icon: string | null;
  members: number;
  maxMembers: number;
  cost: number;
}

export interface User {
  id: number;
  fullName: string | null;
  email: string;
} 