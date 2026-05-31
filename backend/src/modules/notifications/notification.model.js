const { db } = require('../../config/database');

class NotificationModel {
  static tableName = 'notifications';

  static async create(data) {
    const [id] = await db(this.tableName).insert(data);
    return db(this.tableName).where('id', id).first();
  }

  static async findByUserId(userId, options = {}) {
    let query = db(this.tableName)
      .where('user_id', userId)
      .orderBy('created_at', 'desc');
    if (options.limit) query = query.limit(options.limit);
    if (options.unreadOnly) query = query.whereNull('read_at');
    return query;
  }

  static async getUnreadCount(userId) {
    const row = await db(this.tableName)
      .where('user_id', userId)
      .whereNull('read_at')
      .count('id as count')
      .first();
    return parseInt(row?.count || 0, 10);
  }

  static async markAsRead(id, userId) {
    return db(this.tableName)
      .where('id', id)
      .andWhere('user_id', userId)
      .update({ read_at: db.fn.now() });
  }

  static async markAllAsRead(userId) {
    return db(this.tableName)
      .where('user_id', userId)
      .whereNull('read_at')
      .update({ read_at: db.fn.now() });
  }
}

module.exports = NotificationModel;
