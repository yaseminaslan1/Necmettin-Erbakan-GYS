const roleService = require('./role.service');
const { successResponse, errorResponse } = require('../../utils/response.utils');

class RoleController {
  /**
   * Get all roles
   * GET /api/roles
   */
  async getAll(req, res) {
    try {
      const roles = await roleService.getAllRoles();
      return successResponse(res, roles);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get role by ID
   * GET /api/roles/:id
   */
  async getById(req, res) {
    try {
      const role = await roleService.getRoleById(req.params.id);
      return successResponse(res, role);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Create new role
   * POST /api/roles
   */
  async create(req, res) {
    try {
      const role = await roleService.createRole(req.body);
      return successResponse(res, role, 'Role created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Update role
   * PUT /api/roles/:id
   */
  async update(req, res) {
    try {
      const role = await roleService.updateRole(req.params.id, req.body);
      return successResponse(res, role, 'Role updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Delete role
   * DELETE /api/roles/:id
   */
  async delete(req, res) {
    try {
      await roleService.deleteRole(req.params.id);
      return successResponse(res, null, 'Role deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get all permissions
   * GET /api/roles/permissions
   */
  async getPermissions(req, res) {
    try {
      const permissions = await roleService.getAllPermissions();
      return successResponse(res, permissions);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Update role permissions
   * PUT /api/roles/:id/permissions
   */
  async updatePermissions(req, res) {
    try {
      const permissions = await roleService.updateRolePermissions(
        req.params.id,
        req.body.permissions
      );
      return successResponse(res, permissions, 'Permissions updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new RoleController();
