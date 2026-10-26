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

  async unregisterDeviceToken(token, userId) {
    return notificationRepository.removeDeviceToken(token, userId);
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

    if (tokens.length === 0) {
      console.warn(
        `No push token for user ${data.userId}; notification ${notification.NotificationID} stays in the app list only`
      );
      return notification;
    }

    const messages = [];
    for (const tokenRecord of tokens) {
      if (!Expo.isExpoPushToken(tokenRecord.Token)) {
        console.warn(`Skipping invalid push token for user ${data.userId}`);
        continue;
      }

      messages.push({
        to: tokenRecord.Token,
        sound: 'default',
        channelId: 'task-updates',
        priority: 'high',
        ttl: 60 * 60 * 24,
        title: data.title,
        body: data.body,
        data: {
          notificationId: notification.NotificationID,
          type: data.type,
          entityType: data.entityType || null,
          entityId: data.entityId ?? null,
          ticketId: data.entityType === 'TICKET' ? data.entityId : null,
          projectId: data.entityType === 'PROJECT' ? data.entityId : null,
          organizationId: data.entityType === 'ORGANIZATION' ? data.entityId : null
        },
      });
    }

    if (messages.length === 0) return notification;

    const receiptIds = [];
    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        await Promise.all(tickets.map((ticket, index) => {
          if (ticket.status === 'ok' && ticket.id) {
            receiptIds.push(ticket.id);
            return undefined;
          }
          if (ticket.status === 'error') {
            console.error('Push ticket error:', ticket.message, ticket.details || '');
            if (ticket.details?.error === 'DeviceNotRegistered') {
              return notificationRepository.deactivateDeviceToken(chunk[index].to);
            }
          }
          return undefined;
        }));
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }

    if (receiptIds.length > 0) {
      const timer = setTimeout(() => {
        this.expo.getPushNotificationReceiptsAsync(receiptIds)
          .then((receipts) => {
            Object.entries(receipts).forEach(([id, receipt]) => {
              if (receipt.status === 'error') {
                console.error('Push receipt error:', id, receipt.message, receipt.details || '');
              }
            });
          })
          .catch((error) => console.error('Failed to fetch push receipts:', error));
      }, 15000);
      timer.unref?.();
    }

    return notification;
  }

  // --- Specific Business Events ---

  async ticketAssigned(ticket, assignedToUserId, actorId) {
    if (!assignedToUserId || Number(assignedToUserId) === Number(actorId)) return;
    
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

  async ticketReassigned(ticket, previousAssigneeId, updaterId) {
    if (ticket.AssignedTo && ticket.AssignedTo !== updaterId) {
      await this.sendNotification({
        userId: ticket.AssignedTo,
        type: 'TICKET_REASSIGNED',
        title: 'Task Reassigned',
        body: `You were assigned "${ticket.Title}"`,
        entityType: 'TICKET',
        entityId: ticket.TaskID
      });
    }

    if (previousAssigneeId && previousAssigneeId !== updaterId && previousAssigneeId !== ticket.AssignedTo) {
      await this.sendNotification({
        userId: previousAssigneeId,
        type: 'TICKET_REASSIGNED',
        title: 'Task Reassigned',
        body: `"${ticket.Title}" was reassigned to another user`,
        entityType: 'TICKET',
        entityId: ticket.TaskID
      });
    }
  }

  async ticketPriorityChanged(ticket, updaterId) {
    return this.notifyTicketAssignee(ticket, updaterId, 'TICKET_PRIORITY_CHANGED', 'Task Priority Updated', `"${ticket.Title}" priority is now ${ticket.Priority}`);
  }

  async ticketUpdated(ticket, updaterId) {
    return this.notifyTicketAssignee(ticket, updaterId, 'TICKET_UPDATED', 'Task Updated', `"${ticket.Title}" was updated`);
  }

  async ticketCompleted(ticket, updaterId) {
    return this.notifyTicketAssignee(ticket, updaterId, 'TICKET_COMPLETED', 'Task Completed', `"${ticket.Title}" was marked Done`);
  }

  async ticketReopened(ticket, updaterId) {
    return this.notifyTicketAssignee(ticket, updaterId, 'TICKET_REOPENED', 'Task Reopened', `"${ticket.Title}" was reopened`);
  }

  async attachmentAdded(ticket, attachment, uploaderId) {
    return this.notifyTicketAssignee(ticket, uploaderId, 'ATTACHMENT_ADDED', 'New Attachment Added', `A file was added to "${ticket.Title}"`);
  }

  async notifyTicketAssignee(ticket, updaterId, type, title, body) {
    if (!ticket.AssignedTo || Number(ticket.AssignedTo) === Number(updaterId)) return;

    return this.sendNotification({
      userId: ticket.AssignedTo,
      type,
      title,
      body,
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

  async roleChanged(userId, roleName, wasAssigned) {
    await this.sendNotification({
      userId,
      type: 'USER_ROLE_CHANGED',
      title: 'Role Changed',
      body: wasAssigned
        ? `You were assigned the ${roleName} role`
        : `The ${roleName} role was removed from your account`,
      entityType: 'USER',
      entityId: userId
    });
  }

  async permissionsChanged(userId, roleName) {
    await this.sendNotification({
      userId,
      type: 'PERMISSIONS_CHANGED',
      title: 'Permissions Changed',
      body: `Permissions for your ${roleName} role were updated`,
      entityType: 'USER',
      entityId: userId
    });
  }

  async projectUpdated(project, updaterId) {
    if (!project.OwnerID || Number(project.OwnerID) === Number(updaterId)) return;
    await this.sendNotification({
      userId: project.OwnerID,
      type: 'PROJECT_UPDATED',
      title: 'Project Updated',
      body: `"${project.Name}" was updated`,
      entityType: 'PROJECT',
      entityId: project.ProjectID
    });
  }

  async organizationUpdated(organization, updaterId) {
    if (!organization.OwnerID || Number(organization.OwnerID) === Number(updaterId)) return;
    await this.sendNotification({
      userId: organization.OwnerID,
      type: 'ORGANIZATION_UPDATED',
      title: 'Organization Updated',
      body: `"${organization.Name}" was updated`,
      entityType: 'ORGANIZATION',
      entityId: organization.OrganizationID
    });
  }
}

module.exports = new NotificationService();
