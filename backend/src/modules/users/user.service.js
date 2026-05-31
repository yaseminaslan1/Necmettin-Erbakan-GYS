const bcrypt = require('bcryptjs');
const UserModel = require('./user.model');
const { createNotification } = require('../notifications/notification.service');

class UserService {
  async getAllUsers(options) {
    const result = await UserModel.findAll(options);
    
    // Fetch roles for each user
    const usersWithRoles = await Promise.all(
      result.users.map(async (user) => {
        const roles = await UserModel.getUserRoles(user.id);
        return { ...user, roles };
      })
    );
    
    return { users: usersWithRoles, total: result.total };
  }

  async getUserById(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const roles = await UserModel.getUserRoles(id);
    const permissions = await UserModel.getUserPermissions(id);

    return {
      ...user,
      roles,
      permissions: permissions.map(p => p.name),
    };
  }

  async updateUser(id, userData) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    // If updating email, check for duplicates
    if (userData.email && userData.email !== user.email) {
      const existing = await UserModel.findByEmail(userData.email);
      if (existing) {
        throw { statusCode: 409, message: 'Email already in use' };
      }
    }

    // If updating password, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
      createNotification(id, 'password_changed', 'Şifre değiştirildi', 'Hesabınızın şifresi başarıyla güncellendi.');
    }

    return UserModel.update(id, userData);
  }

  async deleteUser(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    await UserModel.delete(id);
    return true;
  }

  async getUserRoles(userId) {
    return UserModel.getUserRoles(userId);
  }

  async assignRole(userId, roleId, currentUser = null) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    // Get the role being assigned
    const { db } = require('../../config/database');
    const targetRole = await db('roles').where('id', roleId).first();
    
    if (!targetRole) {
      throw { statusCode: 404, message: 'Role not found' };
    }

    // Check permissions - only admins can assign admin role
    if (currentUser) {
      const currentUserRoles = await UserModel.getUserRoles(currentUser.id);
      const isCurrentUserAdmin = currentUserRoles.some(r => r.name === 'admin');
      
      if (targetRole.name === 'admin' && !isCurrentUserAdmin) {
        throw { statusCode: 403, message: 'Only admins can assign admin role' };
      }
    }

    // Remove all existing roles first (replace instead of add)
    const existingRoles = await UserModel.getUserRoles(userId);
    for (const role of existingRoles) {
      await UserModel.removeRole(userId, role.id);
    }

    // Assign the new role
    return UserModel.assignRole(userId, roleId);
  }

  async removeRole(userId, roleId) {
    return UserModel.removeRole(userId, roleId);
  }

  async toggleUserStatus(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return UserModel.update(id, { is_active: !user.is_active });
  }
}

module.exports = new UserService();
