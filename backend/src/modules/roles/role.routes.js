const express = require('express');
const router = express.Router();
const roleController = require('./role.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { hasPermission } = require('../../middleware/rbac.middleware');
const { validateRequest, Joi } = require('../../utils/validation.utils');

// Validation schemas
const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).allow(null, ''),
  permissions: Joi.array().items(Joi.number().integer().positive()),
});

const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(500).allow(null, ''),
  permissions: Joi.array().items(Joi.number().integer().positive()),
});

const updatePermissionsSchema = Joi.object({
  permissions: Joi.array().items(Joi.number().integer().positive()).required(),
});

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/permissions', hasPermission('roles.view'), roleController.getPermissions);
router.get('/', roleController.getAll); // Allow all authenticated users to view roles list
router.get('/:id', hasPermission('roles.view'), roleController.getById);
router.post('/', hasPermission('roles.create'), validateRequest(createRoleSchema), roleController.create);
router.put('/:id', hasPermission('roles.edit'), validateRequest(updateRoleSchema), roleController.update);
router.delete('/:id', hasPermission('roles.delete'), roleController.delete);
router.put('/:id/permissions', hasPermission('roles.edit'), validateRequest(updatePermissionsSchema), roleController.updatePermissions);

module.exports = router;
