const { Expo } = require('expo-server-sdk');
const notificationRepository = require('../repositories/notificationRepository');

class NotificationService {
  constructor() {
    this.expo = new Expo();
  }

  async registerDeviceToken(userId, token, platform, deviceId) {
    if (!Expo.isExpoPushToken(token)) {
      throw new Error(`Push token ${token} is not a valid Expo push token`);
    }
    return notificationRepository.saveDeviceToken(userId, token, platform, deviceId);
  }

  async unregisterDeviceToken(token) {
    return notificationRepository.removeDeviceToken(token);
  }

  async getUserNotifications(userId) {
    return notificationRepository.getUserNotifications(userId);
  }

  async markAsRead(notificationId, userId) {
    return notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId) {
    return notificationRepository.markAllAsRead(userId);
  }

  /**
   * Internal method to send a notification to a specific user
   * @param {Object} data - { userId, type, title, body, entityType, entityId }
   */
  async sendNotification(data) {
    const notification = await notificationRepository.createNotification(data);
    const tokens = await notificationRepository.getActiveTokensForUser(data.userId);

    if (tokens.length === 0) return notification;

    const messages = [];
    for (const tokenRecord of tokens) {
      if (!Expo.isExpoPushToken(tokenRecord.Token)) {
        continue;
      }

      messages.push({
        to: tokenRecord.Token,
        sound: 'default',
        title: data.title,
        body: data.body,
        data: { 
          notificationId: notification.NotificationID,
          type: data.type, 
          entityType: data.entityType, 
          entityId: data.entityId 
        },
      });
    }

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }

    return notification;
  }

  // --- Specific Business Events ---

  async ticketAssigned(ticket, assignedToUserId, assignerName) {
    if (!assignedToUserId) return;
    
    await this.sendNotification({
      userId: assignedToUserId,
      type: 'TICKET_ASSIGNED',
      title: 'Ticket Assigned',
      body: `You have been assigned "${ticket.Title}"`,
      entityType: 'TICKET',
      entityId: ticket.TaskID
    });
  }

  async ticketStatusChanged(ticket, creatorId, updaterName) {
    if (!ticket.AssignedTo) return;
    
    await this.sendNotification({
      userId: ticket.AssignedTo,
      type: 'TICKET_STATUS_CHANGED',
      title: 'Ticket Status Updated',
      body: `"${ticket.Title}" is now ${ticket.Status}`,
      entityType: 'TICKET',
      entityId: ticket.TaskID
    });
  }

  async userAddedToOrganization(organization, userId, role) {
    await this.sendNotification({
      userId,
      type: 'ORGANIZATION_INVITE',
      title: 'Added to Organization',
      body: `You were added to "${organization.Name}" as ${role}`,
      entityType: 'ORGANIZATION',
      entityId: organization.OrganizationID
    });
  }

  async userRemovedFromOrganization(organization, userId) {
    await this.sendNotification({
      userId,
      type: 'ORGANIZATION_REMOVED',
      title: 'Removed from Organization',
      body: `You were removed from "${organization.Name}"`,
      entityType: 'ORGANIZATION',
      entityId: organization.OrganizationID
    });
  }
}

module.exports = new NotificationService();
