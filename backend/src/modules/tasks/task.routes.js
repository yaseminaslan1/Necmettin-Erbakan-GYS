const express = require('express');
const router = express.Router();
const taskController = require('./task.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { hasPermission } = require('../../middleware/rbac.middleware');
const { validateRequest, Joi } = require('../../utils/validation.utils');

// Validation schemas
const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(5000).allow(null, ''),
  project_id: Joi.number().integer().positive().required(),
  stage_id: Joi.number().integer().positive(),
  assignee_id: Joi.number().integer().positive().allow(null),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  due_date: Joi.alternatives().try(Joi.date(), Joi.string().allow(null, '')),
  estimated_hours: Joi.number().integer().min(0).allow(null),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(255),
  description: Joi.string().max(5000).allow(null, ''),
  stage_id: Joi.number().integer().positive(),
  assignee_id: Joi.number().integer().positive().allow(null),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  due_date: Joi.alternatives().try(Joi.date(), Joi.string().allow(null, '')),
  estimated_hours: Joi.number().integer().min(0).allow(null),
});

const moveTaskSchema = Joi.object({
  stage_id: Joi.number().integer().positive().required(),
  order_index: Joi.number().integer().min(0).required(),
});

const reorderTasksSchema = Joi.object({
  stage_id: Joi.number().integer().positive().required(),
  tasks: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().positive().required(),
      order_index: Joi.number().integer().min(0).required(),
    })
  ).required(),
});

const commentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});

// All routes require authentication
router.use(authenticate);

// Task routes
router.get('/', hasPermission('tasks.view'), taskController.getAll);
router.get('/project/:projectId', hasPermission('tasks.view'), taskController.getByProject);
router.post('/', hasPermission('tasks.create'), validateRequest(createTaskSchema), taskController.create);
router.put('/reorder', hasPermission('tasks.edit'), validateRequest(reorderTasksSchema), taskController.reorder);
router.get('/:id', hasPermission('tasks.view'), taskController.getById);
router.put('/:id', hasPermission('tasks.edit'), validateRequest(updateTaskSchema), taskController.update);
router.delete('/:id', hasPermission('tasks.delete'), taskController.delete);
router.patch('/:id/move', hasPermission('tasks.change_status'), validateRequest(moveTaskSchema), taskController.move);

// Comment routes
router.get('/:id/comments', hasPermission('tasks.view'), taskController.getComments);
router.post('/:id/comments', hasPermission('tasks.edit'), validateRequest(commentSchema), taskController.addComment);
router.put('/:id/comments/:commentId', hasPermission('tasks.edit'), validateRequest(commentSchema), taskController.updateComment);
router.delete('/:id/comments/:commentId', hasPermission('tasks.edit'), taskController.deleteComment);

module.exports = router;
