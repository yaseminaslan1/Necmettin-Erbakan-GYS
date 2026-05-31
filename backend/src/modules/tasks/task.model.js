const { db } = require('../../config/database');

class TaskModel {
  static tableName = 'tasks';

  static async findAll(options = {}) {
    const { 
      page = 1, 
      limit = 50, 
      projectId = null, 
      stageId = null,
      assigneeId = null,
      priority = null,
      search = '',
      sortBy = 'order_index', 
      sortOrder = 'asc' 
    } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName)
      .select(
        'tasks.*',
        'assignee.name as assignee_name',
        'assignee.avatar as assignee_avatar',
        'creator.name as creator_name',
        'workflow_stages.name as stage_name',
        'workflow_stages.color as stage_color'
      )
      .leftJoin('users as assignee', 'tasks.assignee_id', 'assignee.id')
      .join('users as creator', 'tasks.creator_id', 'creator.id')
      .join('workflow_stages', 'tasks.stage_id', 'workflow_stages.id');

    if (projectId) {
      query = query.where('tasks.project_id', projectId);
    }

    if (stageId) {
      query = query.where('tasks.stage_id', stageId);
    }

    if (assigneeId) {
      query = query.where('tasks.assignee_id', assigneeId);
    }

    if (priority) {
      query = query.where('tasks.priority', priority);
    }

    if (search) {
      query = query.where(function() {
        this.where('tasks.title', 'like', `%${search}%`)
          .orWhere('tasks.description', 'like', `%${search}%`);
      });
    }

    // Get tasks with pagination
    const tasks = await query.clone()
      .orderBy(`tasks.${sortBy}`, sortOrder)
      .limit(limit)
      .offset(offset);

    // Get total count separately
    const countResult = await db(this.tableName)
      .modify((qb) => {
        if (projectId) qb.where('tasks.project_id', projectId);
        if (stageId) qb.where('tasks.stage_id', stageId);
        if (assigneeId) qb.where('tasks.assignee_id', assigneeId);
        if (priority) qb.where('tasks.priority', priority);
        if (search) {
          qb.where(function() {
            this.where('tasks.title', 'like', `%${search}%`)
              .orWhere('tasks.description', 'like', `%${search}%`);
          });
        }
      })
      .count('tasks.id as total')
      .first();

    const total = countResult?.total || 0;

    return { tasks, total };
  }

  static async findById(id) {
    return db(this.tableName)
      .select(
        'tasks.*',
        'assignee.name as assignee_name',
        'assignee.email as assignee_email',
        'assignee.avatar as assignee_avatar',
        'creator.name as creator_name',
        'creator.email as creator_email',
        'workflow_stages.name as stage_name',
        'workflow_stages.color as stage_color',
        'projects.name as project_name'
      )
      .leftJoin('users as assignee', 'tasks.assignee_id', 'assignee.id')
      .join('users as creator', 'tasks.creator_id', 'creator.id')
      .join('workflow_stages', 'tasks.stage_id', 'workflow_stages.id')
      .join('projects', 'tasks.project_id', 'projects.id')
      .where('tasks.id', id)
      .first();
  }

  static async create(taskData) {
    const [id] = await db(this.tableName).insert(taskData);
    return this.findById(id);
  }

  static async update(id, taskData) {
    await db(this.tableName).where('id', id).update({
      ...taskData,
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  static async delete(id) {
    return db(this.tableName).where('id', id).del();
  }

  static async getMaxOrderIndex(stageId) {
    const result = await db(this.tableName)
      .where('stage_id', stageId)
      .max('order_index as max')
      .first();
    return result?.max ?? -1;
  }

  static async reorderTasks(stageId, taskOrders) {
    const updates = taskOrders.map(({ id, order_index }) =>
      db(this.tableName)
        .where('id', id)
        .update({ order_index, updated_at: new Date() })
    );
    await Promise.all(updates);
  }

  static async moveTask(taskId, newStageId, newOrderIndex) {
    await db(this.tableName)
      .where('id', taskId)
      .update({
        stage_id: newStageId,
        order_index: newOrderIndex,
        updated_at: new Date(),
      });
    return this.findById(taskId);
  }

  // Comments
  static async getComments(taskId) {
    return db('task_comments')
      .join('users', 'task_comments.user_id', 'users.id')
      .where('task_comments.task_id', taskId)
      .select(
        'task_comments.*',
        'users.name as user_name',
        'users.avatar as user_avatar'
      )
      .orderBy('task_comments.created_at', 'asc');
  }

  static async addComment(taskId, userId, content) {
    const [id] = await db('task_comments').insert({
      task_id: taskId,
      user_id: userId,
      content,
    });
    return db('task_comments')
      .join('users', 'task_comments.user_id', 'users.id')
      .where('task_comments.id', id)
      .select(
        'task_comments.*',
        'users.name as user_name',
        'users.avatar as user_avatar'
      )
      .first();
  }

  static async updateComment(commentId, content) {
    await db('task_comments')
      .where('id', commentId)
      .update({ content, updated_at: new Date() });
    return db('task_comments').where('id', commentId).first();
  }

  static async deleteComment(commentId) {
    return db('task_comments').where('id', commentId).del();
  }

  // Attachments
  static async getAttachments(taskId) {
    return db('task_attachments')
      .join('users', 'task_attachments.user_id', 'users.id')
      .where('task_attachments.task_id', taskId)
      .select(
        'task_attachments.*',
        'users.name as user_name'
      )
      .orderBy('task_attachments.created_at', 'desc');
  }

  static async addAttachment(attachmentData) {
    const [id] = await db('task_attachments').insert(attachmentData);
    return db('task_attachments').where('id', id).first();
  }

  static async deleteAttachment(attachmentId) {
    return db('task_attachments').where('id', attachmentId).del();
  }

  // Get tasks by project grouped by stage
  static async getTasksByProjectGrouped(projectId) {
    const stages = await db('workflow_stages')
      .where('project_id', projectId)
      .orderBy('order_index');

    const tasks = await db(this.tableName)
      .select(
        'tasks.*',
        'assignee.name as assignee_name',
        'assignee.avatar as assignee_avatar'
      )
      .leftJoin('users as assignee', 'tasks.assignee_id', 'assignee.id')
      .where('tasks.project_id', projectId)
      .orderBy('tasks.order_index');

    // Group tasks by stage
    const grouped = stages.map(stage => ({
      ...stage,
      tasks: tasks.filter(task => task.stage_id === stage.id),
    }));

    return grouped;
  }
}

module.exports = TaskModel;
