import { fetchApi } from './api';

export interface Notification {
  NotificationID: number;
  UserID: number;
  Type: string;
  Title: string;
  Body: string;
  EntityType?: string;
  EntityID?: number;
  IsRead: boolean;
  CreatedAt: string;
}

export const notificationService = {
  async registerToken(token: string, platform: string, deviceId: string = 'unknown') {
    return await fetchApi('/notifications/device', {
      method: 'POST',
      body: JSON.stringify({ token, platform, deviceId }),
    });
  },

  async unregisterToken(token: string) {
    return await fetchApi('/notifications/device', {
      method: 'DELETE',
      body: JSON.stringify({ token }),
    });
  },

  async getNotifications(): Promise<{ success: boolean; data: Notification[] }> {
    return await fetchApi('/notifications', { method: 'GET' });
  },

  async markAsRead(id: number) {
    return await fetchApi(`/notifications/${id}/read`, { method: 'PUT' });
  },

  async markAllAsRead() {
    return await fetchApi('/notifications/read-all', { method: 'PUT' });
  }
};
