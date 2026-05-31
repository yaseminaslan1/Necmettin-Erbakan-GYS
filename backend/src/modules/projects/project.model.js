const { db } = require('../../config/database');

class ProjectModel {
  static tableName = 'projects';

  static async findAll(options = {}) {
    const { page = 1, limit = 10, search = '', status = '', userId = null, sortBy = 'created_at', sortOrder = 'desc' } = options;
    const offset = (page - 1) * limit;

    let baseQuery = db(this.tableName)
      .join('users', 'projects.owner_id', 'users.id');

    // Filter by user (either owner or member)
    if (userId) {
      baseQuery = baseQuery.where(function() {
        this.where('projects.owner_id', userId)
          .orWhereExists(function() {
            this.select('*')
              .from('project_members')
              .whereRaw('project_members.project_id = projects.id')
              .andWhere('project_members.user_id', userId);
          });
      });
    }

    if (search) {
      baseQuery = baseQuery.where(function() {
        this.where('projects.name', 'like', `%${search}%`)
          .orWhere('projects.description', 'like', `%${search}%`);
      });
    }

    if (status) {
      baseQuery = baseQuery.where('projects.status', status);
    }

    // Get projects with pagination
    const projects = await baseQuery.clone()
      .select(
        'projects.*',
        'users.name as owner_name',
        'users.avatar as owner_avatar'
      )
      .orderBy(`projects.${sortBy}`, sortOrder)
      .limit(limit)
      .offset(offset);

    // Get total count separately
    const countResult = await baseQuery.clone()
      .count('projects.id as total')
      .first();

    const total = countResult?.total || 0;

    return { projects, total };
  }

  static async findById(id) {
    return db(this.tableName)
      .select(
        'projects.*',
        'users.name as owner_name',
        'users.avatar as owner_avatar',
        'users.email as owner_email'
      )
      .join('users', 'projects.owner_id', 'users.id')
      .where('projects.id', id)
      .first();
  }

  static async create(projectData) {
    const [id] = await db(this.tableName).insert(projectData);
    return this.findById(id);
  }

  static async update(id, projectData) {
    await db(this.tableName).where('id', id).update({
      ...projectData,
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  static async delete(id) {
    return db(this.tableName).where('id', id).del();
  }

  // Project Members
  static async getMembers(projectId) {
    return db('project_members')
      .join('users', 'project_members.user_id', 'users.id')
      .leftJoin('roles', 'project_members.role_id', 'roles.id')
      .where('project_members.project_id', projectId)
      .select(
        'users.id',
        'users.name',
        'users.email',
        'users.avatar',
        'roles.id as role_id',
        'roles.name as role_name',
        'project_members.joined_at'
      );
  }

  static async addMember(projectId, userId, roleId = null) {
    const existing = await db('project_members')
      .where('project_id', projectId)
      .andWhere('user_id', userId)
      .first();

    if (existing) {
      throw { statusCode: 409, message: 'User is already a member' };
    }

    await db('project_members').insert({
      project_id: projectId,
      user_id: userId,
      role_id: roleId,
    });

    return this.getMembers(projectId);
  }

  static async removeMember(projectId, userId) {
    return db('project_members')
      .where('project_id', projectId)
      .andWhere('user_id', userId)
      .del();
  }

  static async updateMemberRole(projectId, userId, roleId) {
    await db('project_members')
      .where('project_id', projectId)
      .andWhere('user_id', userId)
      .update({ role_id: roleId });

    return this.getMembers(projectId);
  }

  // Workflow Stages
  static async getWorkflowStages(projectId) {
    return db('workflow_stages')
      .where('project_id', projectId)
      .orderBy('order_index');
  }

  static async createWorkflowStage(stageData) {
    const [id] = await db('workflow_stages').insert(stageData);
    return db('workflow_stages').where('id', id).first();
  }

  static async updateWorkflowStage(id, stageData) {
    await db('workflow_stages').where('id', id).update({
      ...stageData,
      updated_at: new Date(),
    });
    return db('workflow_stages').where('id', id).first();
  }

  static async deleteWorkflowStage(id) {
    return db('workflow_stages').where('id', id).del();
  }

  static async reorderWorkflowStages(projectId, stageOrders) {
    const updates = stageOrders.map(({ id, order_index }) =>
      db('workflow_stages')
        .where('id', id)
        .andWhere('project_id', projectId)
        .update({ order_index })
    );
    await Promise.all(updates);
    return this.getWorkflowStages(projectId);
  }

  // Create default workflow stages for new project
  static async createDefaultWorkflowStages(projectId) {
    const defaultStages = [
      { name: 'Backlog', color: '#6b7280', order_index: 0, is_default: true },
      { name: 'To Do', color: '#3b82f6', order_index: 1 },
      { name: 'In Progress', color: '#f59e0b', order_index: 2 },
      { name: 'Review', color: '#8b5cf6', order_index: 3 },
      { name: 'Done', color: '#10b981', order_index: 4, is_completed: true },
    ];

    const stages = defaultStages.map(stage => ({
      ...stage,
      project_id: projectId,
    }));

    await db('workflow_stages').insert(stages);
    return this.getWorkflowStages(projectId);
  }
}

module.exports = ProjectModel;
