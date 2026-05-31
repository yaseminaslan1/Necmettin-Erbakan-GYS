const { db } = require('../../config/database');

class GoalModel {
  static tableName = 'goals';

  static async findAll(userId) {
    return db(this.tableName)
      .where('user_id', userId)
      .orderBy('created_at', 'desc');
  }

  static async findById(id) {
    return db(this.tableName).where('id', id).first();
  }

  static async create(goalData) {
    const [id] = await db(this.tableName).insert(goalData);
    return this.findById(id);
  }

  static async update(id, goalData) {
    await db(this.tableName).where('id', id).update({
      ...goalData,
      updated_at: db.fn.now(),
    });
    return this.findById(id);
  }

  static async delete(id) {
    return db(this.tableName).where('id', id).del();
  }

  static async findByUserId(userId) {
    return db(this.tableName)
      .where('user_id', userId)
      .orderBy('created_at', 'desc');
  }
}

module.exports = GoalModel;
