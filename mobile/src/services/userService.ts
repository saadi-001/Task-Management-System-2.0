import { fetchApi } from './api';

export interface User {
  UserID: number;
  Name: string;
  Email: string;
}

export const userService = {
  async getUsers(): Promise<{ success: boolean; data: User[] }> {
    return await fetchApi('/users', { method: 'GET' });
  },

  async getUser(id: number): Promise<{ success: boolean; data: User }> {
    return await fetchApi(`/users/${id}`, { method: 'GET' });
  },

  async updateUser(id: number, data: { Name?: string; Email?: string }): Promise<{ success: boolean; data: User }> {
    return await fetchApi(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
};
