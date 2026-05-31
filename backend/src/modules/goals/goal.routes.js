const express = require('express');
const router = express.Router();
const GoalController = require('./goal.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validateRequest, Joi } = require('../../utils/validation.utils');

// Validation schemas
const createGoalSchema = Joi.object({
  title: Joi.string().required().max(255),
  description: Joi.string().allow('', null).max(1000),
  targetValue: Joi.number().integer().min(0).default(10),
  type: Joi.string().valid('tasks', 'completion', 'overdue', 'custom').default('tasks'),
});

const updateGoalSchema = Joi.object({
  title: Joi.string().max(255),
  description: Joi.string().allow('', null).max(1000),
  targetValue: Joi.number().integer().min(0),
  type: Joi.string().valid('tasks', 'completion', 'overdue', 'custom'),
});

// Routes
router.get('/', authenticate, GoalController.getGoals);
router.post('/', authenticate, validateRequest(createGoalSchema), GoalController.createGoal);
router.put('/:id', authenticate, validateRequest(updateGoalSchema), GoalController.updateGoal);
router.delete('/:id', authenticate, GoalController.deleteGoal);
router.get('/achievements', authenticate, GoalController.getAchievements);

module.exports = router;
