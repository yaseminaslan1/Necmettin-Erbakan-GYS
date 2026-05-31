const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { hasPermission, allowSelfOrPermission } = require('../../middleware/rbac.middleware');
const { validateRequest, Joi } = require('../../utils/validation.utils');

// Validation schemas
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  password: Joi.string().min(8),
  avatar: Joi.string().uri().allow(null, ''),
});

const assignRoleSchema = Joi.object({
  role_id: Joi.number().integer().positive().required(),
});

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', hasPermission('users.view'), userController.getAll);
router.get('/:id', hasPermission('users.view'), userController.getById);
router.put('/:id', allowSelfOrPermission('users.edit'), validateRequest(updateUserSchema), userController.update);
router.delete('/:id', hasPermission('users.delete'), userController.delete);
router.get('/:id/roles', hasPermission('users.view'), userController.getRoles);
// Allow project managers to manage team roles
router.post('/:id/roles', validateRequest(assignRoleSchema), userController.assignRole);
router.delete('/:id/roles/:roleId', userController.removeRole);
router.patch('/:id/toggle-status', userController.toggleStatus);

module.exports = router;
