import { fetchApi } from './api';
import * as SecureStore from 'expo-secure-store';

export interface Ticket {
  TaskID: number;
  Title: string;
  Description?: string;
  Status: string;
  Priority: string;
  ProjectID: number;
  AssignedTo?: number;
  Attachments?: any[];
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://20.6.104.150.sslip.io/api";

export const ticketService = {
  async getTickets(): Promise<{ success: boolean; data: Ticket[] }> {
    return await fetchApi('/tickets', { method: 'GET' });
  },

  async getTicketsByProject(projectId: number): Promise<{ success: boolean; data: Ticket[] }> {
    return await fetchApi(`/tickets/project/${projectId}`, { method: 'GET' });
  },

  async getTicket(id: number): Promise<{ success: boolean; data: Ticket }> {
    return await fetchApi(`/tickets/${id}`, { method: 'GET' });
  },

  async createTicket(data: Partial<Ticket>): Promise<{ success: boolean; data: Ticket }> {
    return await fetchApi('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTicket(id: number, data: Partial<Ticket>): Promise<{ success: boolean; data: Ticket }> {
    return await fetchApi(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async uploadAttachment(ticketId: number, fileUri: string, fileName: string, mimeType: string): Promise<any> {
    const token = await SecureStore.getItemAsync('auth_token');
    const url = `${API_URL}/tickets/${ticketId}/attachments`;

    // Read file as base64 and convert to Blob — the only way guaranteed to work 
    // in React Native without native modules, matching what the web frontend does.
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('image', blob, fileName || 'attachment.bin');

    const uploadResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        // Do NOT set Content-Type — fetch will set it automatically with boundary for FormData
      },
      body: formData,
    });

    let result;
    try { result = await uploadResponse.json(); } catch (e) { result = null; }

    if (!uploadResponse.ok) {
      throw new Error(result?.message || `Upload failed: ${uploadResponse.status}`);
    }

    return result;
  },

async getAttachments(ticketId: number): Promise<{ success: boolean; data: any[] }> {
    return await fetchApi(`/tickets/${ticketId}/attachments`, { method: 'GET' });
  },

  async deleteAttachment(ticketId: number, attachmentId: number): Promise<{ success: boolean }> {
    return await fetchApi(`/tickets/${ticketId}/attachments/${attachmentId}`, { method: 'DELETE' });
  },


  async deleteTicket(id: number): Promise<{ success: boolean }> {
    return await fetchApi(`/tickets/${id}`, { method: 'DELETE' });
  },

  async assignTicket(ticketId: number, userId: number): Promise<{ success: boolean; data: Ticket }> {
    return await fetchApi(`/tickets/${ticketId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    });
  }
};


