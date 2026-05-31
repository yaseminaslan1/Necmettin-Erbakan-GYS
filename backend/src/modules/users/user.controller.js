const userService = require('./user.service');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response.utils');

class UserController {
  /**
   * Get all users
   * GET /api/users
   */
  async getAll(req, res) {
    try {
      const { page, limit, search, sortBy, sortOrder } = req.query;
      const { users, total } = await userService.getAllUsers({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
        sortBy,
        sortOrder,
      });

      return paginatedResponse(res, users, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        total,
      });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      return successResponse(res, user);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Update user
   * PUT /api/users/:id
   */
  async update(req, res) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      return successResponse(res, user, 'User updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  async delete(req, res) {
    try {
      await userService.deleteUser(req.params.id);
      return successResponse(res, null, 'User deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get user roles
   * GET /api/users/:id/roles
   */
  async getRoles(req, res) {
    try {
      const roles = await userService.getUserRoles(req.params.id);
      return successResponse(res, roles);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Assign role to user (replaces existing roles)
   * POST /api/users/:id/roles
   */
  async assignRole(req, res) {
    try {
      await userService.assignRole(req.params.id, req.body.role_id, req.user);
      return successResponse(res, null, 'Role assigned successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Remove role from user
   * DELETE /api/users/:id/roles/:roleId
   */
  async removeRole(req, res) {
    try {
      await userService.removeRole(req.params.id, req.params.roleId);
      return successResponse(res, null, 'Role removed successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Toggle user active status
   * PATCH /api/users/:id/toggle-status
   */
  async toggleStatus(req, res) {
    try {
      const user = await userService.toggleUserStatus(req.params.id);
      return successResponse(res, user, 'User status updated');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new UserController();
