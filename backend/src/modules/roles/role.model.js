const { db } = require('../../config/database');

class RoleModel {
  static tableName = 'roles';

  static async findAll() {
    return db(this.tableName).select('*').orderBy('name');
  }

  static async findById(id) {
    return db(this.tableName).where('id', id).first();
  }

  static async findByName(name) {
    return db(this.tableName).where('name', name).first();
  }

  static async create(roleData) {
    const [id] = await db(this.tableName).insert(roleData);
    return this.findById(id);
  }

  static async update(id, roleData) {
    await db(this.tableName).where('id', id).update({
      ...roleData,
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  static async delete(id) {
    return db(this.tableName).where('id', id).del();
  }

  static async getRolePermissions(roleId) {
    return db('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.role_id', roleId)
      .select('permissions.*');
  }

  static async setRolePermissions(roleId, permissionIds) {
    // Remove existing permissions
    await db('role_permissions').where('role_id', roleId).del();

    // Add new permissions
    if (permissionIds.length > 0) {
      const inserts = permissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId,
      }));
      await db('role_permissions').insert(inserts);
    }

    return this.getRolePermissions(roleId);
  }

  static async getAllPermissions() {
    return db('permissions').select('*').orderBy('module', 'name');
  }

  static async getRoleWithPermissions(id) {
    const role = await this.findById(id);
    if (!role) return null;

    const permissions = await this.getRolePermissions(id);
    return { ...role, permissions };
  }
}

module.exports = RoleModel;
