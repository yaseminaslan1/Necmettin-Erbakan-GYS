/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Clear existing data
  await knex('role_permissions').del();
  await knex('user_roles').del();
  await knex('permissions').del();
  await knex('roles').del();

  // Insert system roles
  const roles = await knex('roles').insert([
    { name: 'admin', description: 'System administrator with full access', is_system: true },
    { name: 'project_manager', description: 'Can manage projects and team members', is_system: true },
    { name: 'developer', description: 'Can work on tasks and view projects', is_system: true },
    { name: 'viewer', description: 'Read-only access to projects', is_system: true },
  ]).then(() => knex('roles').select('*'));

  // Insert permissions
  const permissions = [
    // User permissions
    { name: 'users.view', description: 'View users list', module: 'users' },
    { name: 'users.create', description: 'Create new users', module: 'users' },
    { name: 'users.edit', description: 'Edit user details', module: 'users' },
    { name: 'users.delete', description: 'Delete users', module: 'users' },
    
    // Role permissions
    { name: 'roles.view', description: 'View roles', module: 'roles' },
    { name: 'roles.create', description: 'Create new roles', module: 'roles' },
    { name: 'roles.edit', description: 'Edit roles', module: 'roles' },
    { name: 'roles.delete', description: 'Delete roles', module: 'roles' },
    
    // Project permissions
    { name: 'projects.view', description: 'View projects', module: 'projects' },
    { name: 'projects.create', description: 'Create new projects', module: 'projects' },
    { name: 'projects.edit', description: 'Edit project details', module: 'projects' },
    { name: 'projects.delete', description: 'Delete projects', module: 'projects' },
    { name: 'projects.manage_members', description: 'Add/remove project members', module: 'projects' },
    
    // Task permissions
    { name: 'tasks.view', description: 'View tasks', module: 'tasks' },
    { name: 'tasks.create', description: 'Create new tasks', module: 'tasks' },
    { name: 'tasks.edit', description: 'Edit task details', module: 'tasks' },
    { name: 'tasks.delete', description: 'Delete tasks', module: 'tasks' },
    { name: 'tasks.assign', description: 'Assign tasks to users', module: 'tasks' },
    { name: 'tasks.change_status', description: 'Change task status', module: 'tasks' },
    
    // Statistics permissions
    { name: 'statistics.view', description: 'View statistics and reports', module: 'statistics' },
    { name: 'statistics.export', description: 'Export statistics data', module: 'statistics' },
  ];

  await knex('permissions').insert(permissions);
  const insertedPermissions = await knex('permissions').select('*');

  // Create permission map
  const permMap = {};
  insertedPermissions.forEach(p => { permMap[p.name] = p.id; });

  // Create role map
  const roleMap = {};
  const insertedRoles = await knex('roles').select('*');
  insertedRoles.forEach(r => { roleMap[r.name] = r.id; });

  // Assign permissions to roles
  const rolePermissions = [];

  // Admin gets all permissions
  insertedPermissions.forEach(p => {
    rolePermissions.push({ role_id: roleMap['admin'], permission_id: p.id });
  });

  // Project Manager permissions
  const pmPermissions = [
    'users.view', 'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
    'projects.manage_members', 'tasks.view', 'tasks.create', 'tasks.edit',
    'tasks.delete', 'tasks.assign', 'tasks.change_status', 'statistics.view'
  ];
  pmPermissions.forEach(p => {
    rolePermissions.push({ role_id: roleMap['project_manager'], permission_id: permMap[p] });
  });

  // Developer permissions
  const devPermissions = [
    'users.view', 'projects.view', 'tasks.view', 'tasks.create', 'tasks.edit',
    'tasks.change_status', 'statistics.view'
  ];
  devPermissions.forEach(p => {
    rolePermissions.push({ role_id: roleMap['developer'], permission_id: permMap[p] });
  });

  // Viewer permissions
  const viewerPermissions = ['projects.view', 'tasks.view', 'statistics.view'];
  viewerPermissions.forEach(p => {
    rolePermissions.push({ role_id: roleMap['viewer'], permission_id: permMap[p] });
  });

  await knex('role_permissions').insert(rolePermissions);
};
