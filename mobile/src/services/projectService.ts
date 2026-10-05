import { fetchApi } from './api';

export interface Project {
  ProjectID: number;
  Name: string;
  Description?: string | null;
  OrganizationID: number;
  OwnerID: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export const projectService = {
  async getProjects(): Promise<{ success: boolean; data: Project[] }> {
    return await fetchApi('/projects', { method: 'GET' });
  },

  async getProject(id: number): Promise<{ success: boolean; data: Project }> {
    return await fetchApi(`/projects/${id}`, { method: 'GET' });
  },

  async createProject(data: Partial<Project>): Promise<{ success: boolean; data: Project }> {
    return await fetchApi('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProject(id: number, data: Partial<Project>): Promise<{ success: boolean; data: Project }> {
    return await fetchApi(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProject(id: number): Promise<{ success: boolean }> {
    return await fetchApi(`/projects/${id}`, {
      method: 'DELETE',
    });
  }
};