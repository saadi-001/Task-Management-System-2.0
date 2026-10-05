import { fetchApi } from './api';

export interface Organization {
  OrganizationID: number;
  Name: string;
  Logo?: string;
  Theme?: string;
  OwnerID: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export const organizationService = {
  async getOrganizations(): Promise<{ success: boolean; data: Organization[] }> {
    return await fetchApi('/organizations', { method: 'GET' });
  },

  async getOrganization(id: number): Promise<{ success: boolean; data: Organization }> {
    return await fetchApi(`/organizations/${id}`, { method: 'GET' });
  },

  async createOrganization(data: { name: string; logo?: string; theme?: string; ownerID: number }): Promise<{ success: boolean; data: Organization }> {
    return await fetchApi('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateOrganization(id: number, data: { name?: string; logo?: string; theme?: string }): Promise<{ success: boolean; data: Organization }> {
    return await fetchApi(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteOrganization(id: number): Promise<{ success: boolean; message: string }> {
    return await fetchApi(`/organizations/${id}`, { method: 'DELETE' });
  }
};