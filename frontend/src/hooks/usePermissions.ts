'use client';

import { useAuthStore } from '@/store';

export function usePermissions() {
  const { user } = useAuthStore();

  const permissions = user?.permissions || [];
  const roles = user?.roles?.map(r => r.name) || [];

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (...requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(perm => permissions.includes(perm));
  };

  const hasAllPermissions = (...requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(perm => permissions.includes(perm));
  };

  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (...requiredRoles: string[]): boolean => {
    return requiredRoles.some(role => roles.includes(role));
  };

  const isAdmin = roles.includes('admin');
  const isProjectManager = roles.includes('project_manager');
  const isDeveloper = roles.includes('developer');
  const isViewer = roles.includes('viewer');

  // Permission checks
  const canViewProjects = hasPermission('projects.view');
  const canCreateProjects = hasPermission('projects.create');
  const canEditProjects = hasPermission('projects.edit');
  const canDeleteProjects = hasPermission('projects.delete');
  const canManageProjectMembers = hasPermission('projects.manage_members');

  const canViewTasks = hasPermission('tasks.view');
  const canCreateTasks = hasPermission('tasks.create');
  const canEditTasks = hasPermission('tasks.edit');
  const canDeleteTasks = hasPermission('tasks.delete');
  const canAssignTasks = hasPermission('tasks.assign');
  const canChangeTaskStatus = hasPermission('tasks.change_status');

  const canViewUsers = hasPermission('users.view');
  const canCreateUsers = hasPermission('users.create');
  const canEditUsers = hasPermission('users.edit');
  const canDeleteUsers = hasPermission('users.delete');

  const canViewRoles = hasPermission('roles.view');
  const canCreateRoles = hasPermission('roles.create');
  const canEditRoles = hasPermission('roles.edit');
  const canDeleteRoles = hasPermission('roles.delete');

  const canViewStatistics = hasPermission('statistics.view');

  return {
    permissions,
    roles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isAdmin,
    isProjectManager,
    isDeveloper,
    isViewer,
    // Project permissions
    canViewProjects,
    canCreateProjects,
    canEditProjects,
    canDeleteProjects,
    canManageProjectMembers,
    // Task permissions
    canViewTasks,
    canCreateTasks,
    canEditTasks,
    canDeleteTasks,
    canAssignTasks,
    canChangeTaskStatus,
    // User permissions
    canViewUsers,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    // Role permissions
    canViewRoles,
    canCreateRoles,
    canEditRoles,
    canDeleteRoles,
    // Statistics
    canViewStatistics,
  };
}
