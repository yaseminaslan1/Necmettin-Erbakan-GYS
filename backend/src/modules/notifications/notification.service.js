const NotificationModel = require('./notification.model');

class NotificationService {
  async create(userId, { type, title, message, relatedType, relatedId }) {
    return NotificationModel.create({
      user_id: userId,
      type: type || 'info',
      title: title || 'Bildirim',
      message: message || null,
      related_type: relatedType || null,
      related_id: relatedId || null,
    });
  }

  async getForUser(userId, options = { limit: 50, unreadOnly: false }) {
    return NotificationModel.findByUserId(userId, options);
  }

  async getUnreadCount(userId) {
    return NotificationModel.getUnreadCount(userId);
  }

  async markAsRead(notificationId, userId) {
    await NotificationModel.markAsRead(notificationId, userId);
    return { success: true };
  }

  async markAllAsRead(userId) {
    await NotificationModel.markAllAsRead(userId);
    return { success: true };
  }
}

const notificationService = new NotificationService();

/**
 * Helper: Create notification (use from other services)
 */
function createNotification(userId, type, title, message, relatedType = null, relatedId = null) {
  return notificationService.create(userId, { type, title, message, relatedType, relatedId }).catch(err => {
    console.error('Notification create error:', err);
  });
}

module.exports = notificationService;
module.exports.createNotification = createNotification;
