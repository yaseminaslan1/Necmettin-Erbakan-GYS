const { db } = require('../../config/database');

class UserModel {
  static tableName = 'users';

  static async findAll(options = {}) {
    const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc' } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName)
      .select('id', 'email', 'name', 'avatar', 'provider', 'is_active', 'created_at', 'updated_at');

    if (search) {
      query = query.where(function() {
        this.where('name', 'like', `%${search}%`)
          .orWhere('email', 'like', `%${search}%`);
      });
    }

    // Get users with pagination
    const users = await query.clone()
      .orderBy(sortBy, sortOrder)
      .limit(limit)
      .offset(offset);

    // Get total count separately
    let countQuery = db(this.tableName);
    if (search) {
      countQuery = countQuery.where(function() {
        this.where('name', 'like', `%${search}%`)
          .orWhere('email', 'like', `%${search}%`);
      });
    }
    const countResult = await countQuery.count('id as total').first();
    const total = countResult?.total || 0;

    return { users, total };
  }

  static async findById(id) {
    return db(this.tableName)
      .where('id', id)
      .select('id', 'email', 'name', 'avatar', 'provider', 'is_active', 'created_at', 'updated_at')
      .first();
  }

  static async findByEmail(email) {
    return db(this.tableName).where('email', email).first();
  }

  static async create(userData) {
    const [id] = await db(this.tableName).insert(userData);
    return this.findById(id);
  }

  static async update(id, userData) {
    await db(this.tableName).where('id', id).update({
      ...userData,
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  static async delete(id) {
    return db(this.tableName).where('id', id).del();
  }

  static async getUserRoles(userId) {
    return db('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', userId)
      .select('roles.id', 'roles.name', 'roles.description');
  }

  static async assignRole(userId, roleId) {
    const existing = await db('user_roles')
      .where('user_id', userId)
      .andWhere('role_id', roleId)
      .first();

    if (existing) return existing;

    await db('user_roles').insert({ user_id: userId, role_id: roleId });
    return { user_id: userId, role_id: roleId };
  }

  static async removeRole(userId, roleId) {
    return db('user_roles')
      .where('user_id', userId)
      .andWhere('role_id', roleId)
      .del();
  }

  static async getUserPermissions(userId) {
    return db('user_roles')
      .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('user_roles.user_id', userId)
      .select('permissions.name', 'permissions.module')
      .distinct();
  }
}

module.exports = UserModel;
