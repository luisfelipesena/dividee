import axios from 'axios';
import { env } from '../config/env';

// Use the API_URL from environment variables
const API_URL = env.apiUrl;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensures cookies are sent with requests (important for auth)
  withCredentials: true,
});

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  signup: async (email: string, password: string, name?: string) => {
    const response = await apiClient.post('/api/auth/signup', { email, password, name });
    return response.data;
  },
  
  logout: async () => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },
};

export default apiClient; 