const RoleModel = require('./role.model');

class RoleService {
  async getAllRoles() {
    const roles = await RoleModel.findAll();
    
    // Get permissions for each role
    const rolesWithPermissions = await Promise.all(
      roles.map(async (role) => {
        const permissions = await RoleModel.getRolePermissions(role.id);
        return { ...role, permissions };
      })
    );

    return rolesWithPermissions;
  }

  async getRoleById(id) {
    const role = await RoleModel.getRoleWithPermissions(id);
    if (!role) {
      throw { statusCode: 404, message: 'Role not found' };
    }
    return role;
  }

  async createRole(roleData) {
    // Check if role name already exists
    const existing = await RoleModel.findByName(roleData.name);
    if (existing) {
      throw { statusCode: 409, message: 'Role name already exists' };
    }

    const role = await RoleModel.create({
      name: roleData.name,
      description: roleData.description,
      is_system: false,
    });

    // Set permissions if provided
    if (roleData.permissions && roleData.permissions.length > 0) {
      await RoleModel.setRolePermissions(role.id, roleData.permissions);
    }

    return this.getRoleById(role.id);
  }

  async updateRole(id, roleData) {
    const role = await RoleModel.findById(id);
    if (!role) {
      throw { statusCode: 404, message: 'Role not found' };
    }

    if (role.is_system) {
      throw { statusCode: 403, message: 'System roles cannot be modified' };
    }

    // Check for duplicate name
    if (roleData.name && roleData.name !== role.name) {
      const existing = await RoleModel.findByName(roleData.name);
      if (existing) {
        throw { statusCode: 409, message: 'Role name already exists' };
      }
    }

    await RoleModel.update(id, {
      name: roleData.name,
      description: roleData.description,
    });

    // Update permissions if provided
    if (roleData.permissions) {
      await RoleModel.setRolePermissions(id, roleData.permissions);
    }

    return this.getRoleById(id);
  }

  async deleteRole(id) {
    const role = await RoleModel.findById(id);
    if (!role) {
      throw { statusCode: 404, message: 'Role not found' };
    }

    if (role.is_system) {
      throw { statusCode: 403, message: 'System roles cannot be deleted' };
    }

    await RoleModel.delete(id);
    return true;
  }

  async getAllPermissions() {
    return RoleModel.getAllPermissions();
  }

  async updateRolePermissions(roleId, permissionIds) {
    const role = await RoleModel.findById(roleId);
    if (!role) {
      throw { statusCode: 404, message: 'Role not found' };
    }

    return RoleModel.setRolePermissions(roleId, permissionIds);
  }
}

module.exports = new RoleService();
