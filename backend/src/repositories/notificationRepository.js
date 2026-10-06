const prisma = require('../config/prisma');

class NotificationRepository {
  async saveDeviceToken(userId, token, platform, deviceId) {
    const existingToken = await prisma.devicetoken.findUnique({
      where: { Token: token },
    });

    if (existingToken) {
      if (existingToken.UserID !== userId) {
        return prisma.devicetoken.update({
          where: { Token: token },
          data: { UserID: userId, IsActive: true },
        });
      }
      if (!existingToken.IsActive) {
        return prisma.devicetoken.update({
          where: { Token: token },
          data: { IsActive: true },
        });
      }
      return existingToken;
    }

    return prisma.devicetoken.create({
      data: {
        UserID: userId,
        Token: token,
        Platform: platform,
        DeviceId: deviceId,
      },
    });
  }

  async removeDeviceToken(token) {
    return prisma.devicetoken.update({
      where: { Token: token },
      data: { IsActive: false },
    });
  }

  async getActiveTokensForUser(userId) {
    return prisma.devicetoken.findMany({
      where: { UserID: userId, IsActive: true },
    });
  }

  async createNotification(data) {
    return prisma.notification.create({
      data: {
        UserID: data.userId,
        Type: data.type,
        Title: data.title,
        Body: data.body,
        EntityType: data.entityType,
        EntityID: data.entityId,
      },
    });
  }

  async getUserNotifications(userId) {
    return prisma.notification.findMany({
      where: { UserID: userId },
      orderBy: { CreatedAt: 'desc' },
    });
  }

  async markAsRead(notificationId, userId) {
    return prisma.notification.updateMany({
      where: { NotificationID: notificationId, UserID: userId },
      data: { IsRead: true },
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { UserID: userId, IsRead: false },
      data: { IsRead: true },
    });
  }
}

module.exports = new NotificationRepository();
