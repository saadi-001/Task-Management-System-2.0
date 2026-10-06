const notificationService = require('../services/notificationService');

exports.registerToken = async (req, res) => {
  try {
    const { token, platform, deviceId } = req.body;
    const userId = req.user.UserID;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const result = await notificationService.registerDeviceToken(userId, token, platform, deviceId);
    res.status(200).json({ message: 'Device registered successfully', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Error registering device token', error: error.message });
  }
};

exports.unregisterToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    await notificationService.unregisterDeviceToken(token);
    res.status(200).json({ message: 'Device unregistered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error unregistering device token', error: error.message });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.UserID;
    const notifications = await notificationService.getUserNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.UserID;
    await notificationService.markAsRead(parseInt(id), userId);
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.UserID;
    await notificationService.markAllAsRead(userId);
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
};
