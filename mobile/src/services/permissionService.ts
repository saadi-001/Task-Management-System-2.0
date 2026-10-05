import { fetchApi } from './api';

export interface Permission {
  PermissionID: number;
  PermissionName: string;
}

export const permissionService = {
  async getPermissions(): Promise<{ success: boolean; data: Permission[] }> {
    return await fetchApi('/permissions', { method: 'GET' });
  }
};