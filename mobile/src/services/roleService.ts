import { fetchApi } from './api';

export interface Role {
  RoleID: number;
  Name: string;
}

export const roleService = {
  async getRoles(): Promise<{ success: boolean; data: Role[] }> {
    return await fetchApi('/roles', { method: 'GET' });
  },

  async getRole(id: number): Promise<{ success: boolean; data: Role }> {
    return await fetchApi(`/roles/${id}`, { method: 'GET' });
  },

  async createRole(data: { name: string }): Promise<{ success: boolean; data: Role }> {
    return await fetchApi('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteRole(id: number): Promise<{ success: boolean }> {
    return await fetchApi(`/roles/${id}`, { method: 'DELETE' });
  },
  
  async getRolePermissions(roleId: number): Promise<{ success: boolean; data: any[] }> {
    return await fetchApi(`/roles/${roleId}/permissions`, { method: 'GET' });
  },

  async assignPermission(roleId: number, permissionId: number): Promise<{ success: boolean }> {
    return await fetchApi(`/roles/${roleId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ permissionId }),
    });
  },

  async removePermission(roleId: number, permissionId: number): Promise<{ success: boolean }> {
    return await fetchApi(`/roles/${roleId}/permissions`, {
      method: 'DELETE',
      body: JSON.stringify({ permissionId }),
    });
  }
};
