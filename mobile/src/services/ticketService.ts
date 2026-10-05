import { fetchApi } from './api';

export interface Ticket {
  TaskID: number;
  Title: string;
  Description?: string;
  Status: string;
  Priority: string;
  ProjectID: number;
  AssignedTo?: number;
  CreatedBy: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  Attachments?: any[];
}

export const ticketService = {
  async getTickets(): Promise<{ success: boolean; data: Ticket[] }> {
    return await fetchApi('/tickets', { method: 'GET' });
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

  async assignTicket(id: number, userId: number): Promise<{ success: boolean; data: Ticket }> {
    return await fetchApi(`/tickets/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ AssignedTo: userId }),
    });
  },

  async uploadAttachment(ticketId: number, fileUri: string, fileName: string, mimeType: string): Promise<any> {
    const formData = new FormData();
    formData.append('image', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);

    return await fetchApi(`/tickets/${ticketId}/attachments`, {
      method: 'POST',
      body: formData,
    }, true); 
  },

  async deleteTicket(id: number): Promise<{ success: boolean }> {
    return await fetchApi(`/tickets/${id}`, { method: 'DELETE' });
  },

  async deleteAttachment(ticketId: number, attachmentId: number): Promise<{ success: boolean }> {
    return await fetchApi(`/tickets/${ticketId}/attachments/${attachmentId}`, { method: 'DELETE' });
  },

  async getAttachments(ticketId: number): Promise<{ success: boolean; data: any[] }> {
    return await fetchApi(`/tickets/${ticketId}/attachments`, { method: 'GET' });
  }
};