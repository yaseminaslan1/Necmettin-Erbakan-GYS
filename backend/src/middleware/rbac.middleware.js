const { db } = require('../config/database');
const { errorResponse } = require('../utils/response.utils');

/**
 * Check if user has specific permission
 */
const hasPermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }

      // Get user's roles and permissions
      const userPermissions = await db('user_roles')
        .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
        .join('permissions', 'role_permissions.permission_id', 'permissions.id')
        .where('user_roles.user_id', req.user.id)
        .select('permissions.name');

      const permissionNames = userPermissions.map(p => p.name);

      // Check if user has any of the required permissions
      const hasRequired = requiredPermissions.some(perm => permissionNames.includes(perm));

      if (!hasRequired) {
        return errorResponse(res, 'Insufficient permissions', 403);
      }

      // Attach permissions to request for later use
      req.userPermissions = permissionNames;
      next();
    } catch (error) {
      console.error('RBAC Error:', error);
      return errorResponse(res, 'Authorization error', 500);
    }
  };
};

/**
 * Check if user has specific role
 */
const hasRole = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }

      // Get user's roles
      const userRoles = await db('user_roles')
        .join('roles', 'user_roles.role_id', 'roles.id')
        .where('user_roles.user_id', req.user.id)
        .select('roles.name');

      const roleNames = userRoles.map(r => r.name);

      // Check if user has any of the required roles
      const hasRequired = requiredRoles.some(role => roleNames.includes(role));

      if (!hasRequired) {
        return errorResponse(res, 'Insufficient role', 403);
      }

      // Attach roles to request for later use
      req.userRoles = roleNames;
      next();
    } catch (error) {
      console.error('RBAC Error:', error);
      return errorResponse(res, 'Authorization error', 500);
    }
  };
};

/**
 * Check if user is project member
 */
const isProjectMember = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    const projectId = req.params.projectId || req.params.id || req.body.project_id;

    if (!projectId) {
      return errorResponse(res, 'Project ID required', 400);
    }

    // Check if user is project owner or member
    const project = await db('projects')
      .where('id', projectId)
      .first();

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    // Check if user is owner
    if (project.owner_id === req.user.id) {
      req.isProjectOwner = true;
      return next();
    }

    // Check if user is member
    const membership = await db('project_members')
      .where('project_id', projectId)
      .andWhere('user_id', req.user.id)
      .first();

    if (!membership) {
      // Check if user is admin
      const isAdmin = await db('user_roles')
        .join('roles', 'user_roles.role_id', 'roles.id')
        .where('user_roles.user_id', req.user.id)
        .andWhere('roles.name', 'admin')
        .first();

      if (!isAdmin) {
        return errorResponse(res, 'Not a project member', 403);
      }
    }

    req.projectMembership = membership;
    next();
  } catch (error) {
    console.error('Project Member Check Error:', error);
    return errorResponse(res, 'Authorization error', 500);
  }
};

/**
 * Check if user is project owner
 */
const isProjectOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    const projectId = req.params.projectId || req.params.id;

    if (!projectId) {
      return errorResponse(res, 'Project ID required', 400);
    }

    const project = await db('projects')
      .where('id', projectId)
      .first();

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    if (project.owner_id !== req.user.id) {
      // Check if user is admin
      const isAdmin = await db('user_roles')
        .join('roles', 'user_roles.role_id', 'roles.id')
        .where('user_roles.user_id', req.user.id)
        .andWhere('roles.name', 'admin')
        .first();

      if (!isAdmin) {
        return errorResponse(res, 'Only project owner can perform this action', 403);
      }
    }

    req.project = project;
    next();
  } catch (error) {
    console.error('Project Owner Check Error:', error);
    return errorResponse(res, 'Authorization error', 500);
  }
};

/**
 * Allow project member management: project owner OR user with projects.manage_members permission.
 * Must be used after isProjectMember so that req.isProjectOwner is set when applicable.
 */
const canManageProjectMembers = async (req, res, next) => {
  try {
    if (req.isProjectOwner) {
      return next();
    }
    const userPermissions = await db('user_roles')
      .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('user_roles.user_id', req.user.id)
      .select('permissions.name');
    const permissionNames = userPermissions.map(p => p.name);
    if (permissionNames.includes('projects.manage_members')) {
      return next();
    }
    return errorResponse(res, 'Insufficient permissions to manage project members', 403);
  } catch (error) {
    console.error('RBAC Error:', error);
    return errorResponse(res, 'Authorization error', 500);
  }
};

/**
 * Allow if user is updating themselves (req.params.id === req.user.id) OR has the given permission
 */
const allowSelfOrPermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      const targetUserId = parseInt(req.params.id, 10);
      if (req.user.id === targetUserId) {
        return next();
      }
      // Not self - check permission
      const userPermissions = await db('user_roles')
        .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
        .join('permissions', 'role_permissions.permission_id', 'permissions.id')
        .where('user_roles.user_id', req.user.id)
        .select('permissions.name');
      const permissionNames = userPermissions.map(p => p.name);
      const hasRequired = requiredPermissions.some(perm => permissionNames.includes(perm));
      if (!hasRequired) {
        return errorResponse(res, 'Insufficient permissions', 403);
      }
      req.userPermissions = permissionNames;
      next();
    } catch (error) {
      console.error('RBAC Error:', error);
      return errorResponse(res, 'Authorization error', 500);
    }
  };
};

module.exports = {
  hasPermission,
  hasRole,
  isProjectMember,
  isProjectOwner,
  canManageProjectMembers,
  allowSelfOrPermission,
};
