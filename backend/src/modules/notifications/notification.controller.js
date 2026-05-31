const notificationService = require('./notification.service');
const { successResponse, errorResponse } = require('../../utils/response.utils');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit, 10) || 50;
      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await notificationService.getForUser(userId, { limit, unreadOnly });
      return successResponse(res, notifications);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  async getUnreadCount(req, res) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);
      return successResponse(res, { count });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  async markAsRead(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      await notificationService.markAsRead(id, req.user.id);
      return successResponse(res, null, 'Okundu olarak işaretlendi');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  async markAllAsRead(req, res) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      return successResponse(res, null, 'Tümü okundu');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new NotificationController();
