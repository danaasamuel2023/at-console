// AT ISHARE DATA Auth Service
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('at_ishare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('at_ishare_token');
        localStorage.removeItem('at_ishare_user');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.token) {
        localStorage.setItem('at_ishare_token', response.data.token);
        localStorage.setItem('at_ishare_user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('at_ishare_token', response.data.token);
        localStorage.setItem('at_ishare_user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  // Logout user
  logout() {
    localStorage.removeItem('at_ishare_token');
    localStorage.removeItem('at_ishare_user');
    window.location.href = '/auth';
  },

  // Get current user from localStorage
  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('at_ishare_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('at_ishare_token');
      return !!token;
    }
    return false;
  },

  // Get user profile
  async getProfile() {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get profile');
    }
  },

  // Get user balance
  async getBalance() {
    try {
      const response = await api.get('/user/balance');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get balance');
    }
  },

  // Use AT ISHARE data
  async useData(amount) {
    try {
      const response = await api.post('/use-data', { amount });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to use AT ISHARE data');
    }
  },

  // Get usage history
  async getUsageHistory() {
    try {
      const response = await api.get('/usage-history');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get usage history');
    }
  },

  // Get load history
  async getLoadHistory() {
    try {
      const response = await api.get('/loads');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get load history');
    }
  }
};

export default api;