import { API_URL } from '@monorepo/env';
import axios from 'axios';
import { Platform } from 'react-native';

import { useAuthStore } from '@/store/auth';

const baseURL =
  Platform.OS === 'android'
    ? API_URL.replace('localhost', '10.0.2.2')
    : API_URL;

export const api = axios.create({
  baseURL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
