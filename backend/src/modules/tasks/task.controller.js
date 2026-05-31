const taskService = require('./task.service');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response.utils');

class TaskController {
  /**
   * Get all tasks
   * GET /api/tasks
   */
  async getAll(req, res) {
    try {
      const { page, limit, projectId, stageId, assigneeId, priority, search, sortBy, sortOrder } = req.query;
      const { tasks, total } = await taskService.getAllTasks({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        projectId,
        stageId,
        assigneeId,
        priority,
        search,
        sortBy,
        sortOrder,
      });

      return paginatedResponse(res, tasks, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        total,
      });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get tasks by project (grouped by stage - for Kanban)
   * GET /api/tasks/project/:projectId
   */
  async getByProject(req, res) {
    try {
      const stages = await taskService.getTasksByProject(req.params.projectId);
      return successResponse(res, stages);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get task by ID
   * GET /api/tasks/:id
   */
  async getById(req, res) {
    try {
      const task = await taskService.getTaskById(req.params.id);
      return successResponse(res, task);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Create new task
   * POST /api/tasks
   */
  async create(req, res) {
    try {
      const task = await taskService.createTask(req.body, req.user.id);
      return successResponse(res, task, 'Task created successfully', 201);
    } catch (error) {
      console.error('Create task error:', error);
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Update task
   * PUT /api/tasks/:id
   */
  async update(req, res) {
    try {
      const task = await taskService.updateTask(req.params.id, req.body);
      return successResponse(res, task, 'Task updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Delete task
   * DELETE /api/tasks/:id
   */
  async delete(req, res) {
    try {
      await taskService.deleteTask(req.params.id);
      return successResponse(res, null, 'Task deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Move task (change stage and/or order)
   * PATCH /api/tasks/:id/move
   */
  async move(req, res) {
    try {
      const task = await taskService.moveTask(
        req.params.id,
        req.body.stage_id,
        req.body.order_index
      );
      return successResponse(res, task, 'Task moved successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Reorder tasks in a stage
   * PUT /api/tasks/reorder
   */
  async reorder(req, res) {
    try {
      await taskService.reorderTasks(req.body.stage_id, req.body.tasks);
      return successResponse(res, null, 'Tasks reordered successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get task comments
   * GET /api/tasks/:id/comments
   */
  async getComments(req, res) {
    try {
      const comments = await taskService.getComments(req.params.id);
      return successResponse(res, comments);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Add comment to task
   * POST /api/tasks/:id/comments
   */
  async addComment(req, res) {
    try {
      const comment = await taskService.addComment(
        req.params.id,
        req.user.id,
        req.body.content
      );
      return successResponse(res, comment, 'Comment added successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Update comment
   * PUT /api/tasks/:id/comments/:commentId
   */
  async updateComment(req, res) {
    try {
      const comment = await taskService.updateComment(
        req.params.commentId,
        req.user.id,
        req.body.content
      );
      return successResponse(res, comment, 'Comment updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Delete comment
   * DELETE /api/tasks/:id/comments/:commentId
   */
  async deleteComment(req, res) {
    try {
      await taskService.deleteComment(req.params.commentId, req.user.id);
      return successResponse(res, null, 'Comment deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new TaskController();