const TaskModel = require('./task.model');
const { db } = require('../../config/database');
const { createNotification } = require('../notifications/notification.service');

class TaskService {
  async getAllTasks(options) {
    return TaskModel.findAll(options);
  }

  async getTaskById(id) {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw { statusCode: 404, message: 'Task not found' };
    }

    const comments = await TaskModel.getComments(id);
    const attachments = await TaskModel.getAttachments(id);

    return {
      ...task,
      comments,
      attachments,
    };
  }

  async getTasksByProject(projectId) {
    return TaskModel.getTasksByProjectGrouped(projectId);
  }

  async createTask(taskData, creatorId) {
    // Verify project exists
    const project = await db('projects').where('id', taskData.project_id).first();
    if (!project) {
      throw { statusCode: 404, message: 'Project not found' };
    }

    // Get default stage if not provided
    let stageId = taskData.stage_id;
    if (!stageId) {
      const defaultStage = await db('workflow_stages')
        .where('project_id', taskData.project_id)
        .andWhere('is_default', true)
        .first();
      
      if (!defaultStage) {
        const firstStage = await db('workflow_stages')
          .where('project_id', taskData.project_id)
          .orderBy('order_index')
          .first();
        stageId = firstStage?.id;
      } else {
        stageId = defaultStage.id;
      }
    }

    if (!stageId) {
      throw { statusCode: 400, message: 'No workflow stage available' };
    }

    // Get max order index for the stage
    const maxOrder = await TaskModel.getMaxOrderIndex(stageId);

    const task = await TaskModel.create({
      title: taskData.title,
      description: taskData.description || null,
      project_id: taskData.project_id,
      stage_id: stageId,
      assignee_id: taskData.assignee_id || null,
      creator_id: creatorId,
      priority: taskData.priority || 'medium',
      order_index: maxOrder + 1,
      due_date: taskData.due_date && taskData.due_date !== '' ? taskData.due_date : null,
      estimated_hours: taskData.estimated_hours || null,
    });

    if (task.assignee_id) {
      createNotification(
        task.assignee_id,
        'task_assigned',
        'Yeni görev atandı',
        `"${task.title}" size atandı.`,
        'task',
        task.id
      );
    }
    return task;
  }

  async updateTask(id, taskData) {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw { statusCode: 404, message: 'Task not found' };
    }

    const updateData = {};
    
    if (taskData.title !== undefined) updateData.title = taskData.title;
    if (taskData.description !== undefined) updateData.description = taskData.description || null;
    if (taskData.assignee_id !== undefined) updateData.assignee_id = taskData.assignee_id || null;
    if (taskData.priority !== undefined) updateData.priority = taskData.priority;
    if (taskData.due_date !== undefined) updateData.due_date = taskData.due_date && taskData.due_date !== '' ? taskData.due_date : null;
    if (taskData.estimated_hours !== undefined) updateData.estimated_hours = taskData.estimated_hours;

    // Handle stage change
    if (taskData.stage_id !== undefined && taskData.stage_id !== task.stage_id) {
      // Check if new stage is completed
      const newStage = await db('workflow_stages').where('id', taskData.stage_id).first();
      if (newStage?.is_completed) {
        updateData.completed_at = new Date();
      } else if (task.completed_at) {
        updateData.completed_at = null;
      }

      // Set started_at if moving from backlog
      const currentStage = await db('workflow_stages').where('id', task.stage_id).first();
      if (currentStage?.order_index === 0 && !task.started_at) {
        updateData.started_at = new Date();
      }

      updateData.stage_id = taskData.stage_id;
      
      // Get max order for new stage
      const maxOrder = await TaskModel.getMaxOrderIndex(taskData.stage_id);
      updateData.order_index = maxOrder + 1;

      if (task.assignee_id && newStage?.is_completed) {
        createNotification(
          task.assignee_id,
          'task_completed',
          'Görev tamamlandı',
          `"${task.title}" tamamlandı olarak işaretlendi.`,
          'task',
          id
        );
      }
    }

    if (taskData.assignee_id !== undefined && taskData.assignee_id !== task.assignee_id && taskData.assignee_id) {
      createNotification(
        taskData.assignee_id,
        'task_assigned',
        'Görev size atandı',
        `"${task.title}" size atandı.`,
        'task',
        id
      );
    }

    return TaskModel.update(id, updateData);
  }

  async deleteTask(id) {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw { statusCode: 404, message: 'Task not found' };
    }

    await TaskModel.delete(id);
    return true;
  }

  async moveTask(taskId, stageId, orderIndex) {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw { statusCode: 404, message: 'Task not found' };
    }

    // Check if stage is completed
    const stage = await db('workflow_stages').where('id', stageId).first();
    
    const updateData = {
      stage_id: stageId,
      order_index: orderIndex,
    };

    if (stage?.is_completed && !task.completed_at) {
      updateData.completed_at = new Date();
      if (task.assignee_id) {
        createNotification(
          task.assignee_id,
          'task_completed',
          'Görev tamamlandı',
          `"${task.title}" tamamlandı olarak işaretlendi.`,
          'task',
          taskId
        );
      }
    } else if (!stage?.is_completed && task.completed_at) {
      updateData.completed_at = null;
    }

    // Set started_at if first time moving from backlog
    if (!task.started_at && task.stage_id !== stageId) {
      const currentStage = await db('workflow_stages').where('id', task.stage_id).first();
      if (currentStage?.order_index === 0) {
        updateData.started_at = new Date();
      }
    }

    await TaskModel.update(taskId, updateData);
    return TaskModel.findById(taskId);
  }

  async reorderTasks(stageId, taskOrders) {
    await TaskModel.reorderTasks(stageId, taskOrders);
    return true;
  }

  // Comments
  async getComments(taskId) {
    return TaskModel.getComments(taskId);
  }

  async addComment(taskId, userId, content) {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw { statusCode: 404, message: 'Task not found' };
    }

    return TaskModel.addComment(taskId, userId, content);
  }

  async updateComment(commentId, userId, content) {
    const comment = await db('task_comments').where('id', commentId).first();
    if (!comment) {
      throw { statusCode: 404, message: 'Comment not found' };
    }

    if (comment.user_id !== userId) {
      throw { statusCode: 403, message: 'Cannot edit other user\'s comment' };
    }

    return TaskModel.updateComment(commentId, content);
  }

  async deleteComment(commentId, userId) {
    const comment = await db('task_comments').where('id', commentId).first();
    if (!comment) {
      throw { statusCode: 404, message: 'Comment not found' };
    }

    // Allow deletion by comment owner or admin
    if (comment.user_id !== userId) {
      throw { statusCode: 403, message: 'Cannot delete other user\'s comment' };
    }

    await TaskModel.deleteComment(commentId);
    return true;
  }

  // Attachments
  async getAttachments(taskId) {
    return TaskModel.getAttachments(taskId);
  }

  async deleteAttachment(attachmentId, userId) {
    const attachment = await db('task_attachments').where('id', attachmentId).first();
    if (!attachment) {
      throw { statusCode: 404, message: 'Attachment not found' };
    }

    await TaskModel.deleteAttachment(attachmentId);
    return true;
  }
}

module.exports = new TaskService();
