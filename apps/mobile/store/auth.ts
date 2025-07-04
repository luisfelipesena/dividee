import { create } from 'zustand';

import { api } from '@/lib/api';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  login: (token) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ token, isAuthenticated: true });
  },
  logout: () => {
    delete api.defaults.headers.common['Authorization'];
    set({ token: null, isAuthenticated: false });
  },
}));
