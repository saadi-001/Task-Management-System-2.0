import * as SecureStore from 'expo-secure-store';
import { fetchApi } from './api';

const TOKEN_KEY = 'auth_token';

export interface User {
  UserID: number;
  Name: string;
  Email: string;
  [key: string]: any;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
  roles: string[];
  permissions: string[];
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async signup(name: string, email: string, password: string): Promise<any> {
    return await fetchApi('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async forgotPassword(email: string): Promise<any> {
    return await fetchApi('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async getSession(): Promise<{ success: boolean; data: { user: User; roles: string[]; permissions: string[] }; roles?: string[]; permissions?: string[] }> {
    return await fetchApi('/auth/me', {
      method: 'GET',
    });
  },

  async saveToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getToken() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async removeToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

