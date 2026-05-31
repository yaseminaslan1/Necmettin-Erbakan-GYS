const express = require('express');
const router = express.Router();
const projectController = require('./project.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { hasPermission, isProjectMember, isProjectOwner, canManageProjectMembers } = require('../../middleware/rbac.middleware');
const { validateRequest, Joi } = require('../../utils/validation.utils');

// Validation schemas
const createProjectSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().max(2000).allow(null, ''),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow(null),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  description: Joi.string().max(2000).allow(null, ''),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
  status: Joi.string().valid('active', 'archived', 'completed'),
});

const addMemberSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  role_id: Joi.number().integer().positive().allow(null),
});

const updateMemberRoleSchema = Joi.object({
  role_id: Joi.number().integer().positive().allow(null),
});

const createStageSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow(null),
  is_default: Joi.boolean(),
  is_completed: Joi.boolean(),
});

const updateStageSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
  is_default: Joi.boolean(),
  is_completed: Joi.boolean(),
});

const reorderStagesSchema = Joi.object({
  stages: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().positive().required(),
      order_index: Joi.number().integer().min(0).required(),
    })
  ).required(),
});

// All routes require authentication
router.use(authenticate);

// Project routes
router.get('/', hasPermission('projects.view'), projectController.getAll);
router.post('/', hasPermission('projects.create'), validateRequest(createProjectSchema), projectController.create);
router.get('/:id', isProjectMember, projectController.getById);
router.put('/:id', isProjectOwner, validateRequest(updateProjectSchema), projectController.update);
router.delete('/:id', isProjectOwner, projectController.delete);

// Member routes (owner or PM with projects.manage_members)
router.get('/:id/members', isProjectMember, projectController.getMembers);
router.post('/:id/members', isProjectMember, canManageProjectMembers, validateRequest(addMemberSchema), projectController.addMember);
router.delete('/:id/members/:userId', isProjectMember, canManageProjectMembers, projectController.removeMember);
router.patch('/:id/members/:userId', isProjectMember, canManageProjectMembers, validateRequest(updateMemberRoleSchema), projectController.updateMemberRole);

// Workflow stage routes
router.get('/:id/stages', isProjectMember, projectController.getStages);
router.post('/:id/stages', isProjectOwner, validateRequest(createStageSchema), projectController.createStage);
router.put('/:id/stages/reorder', isProjectOwner, validateRequest(reorderStagesSchema), projectController.reorderStages);
router.put('/:id/stages/:stageId', isProjectOwner, validateRequest(updateStageSchema), projectController.updateStage);
router.delete('/:id/stages/:stageId', isProjectOwner, projectController.deleteStage);

module.exports = router;
