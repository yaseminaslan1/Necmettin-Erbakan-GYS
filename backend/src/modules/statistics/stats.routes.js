const express = require('express');
const router = express.Router();
const statsController = require('./stats.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { hasPermission, isProjectMember } = require('../../middleware/rbac.middleware');

// All routes require authentication
router.use(authenticate);

// Dashboard and general stats
router.get('/dashboard', hasPermission('statistics.view'), statsController.getDashboard);
router.get('/tasks-by-status', hasPermission('statistics.view'), statsController.getTasksByStatus);
router.get('/tasks-by-priority', hasPermission('statistics.view'), statsController.getTasksByPriority);
router.get('/completion-trend', hasPermission('statistics.view'), statsController.getCompletionTrend);
router.get('/productivity', hasPermission('statistics.view'), statsController.getProductivity);
router.get('/deadlines', hasPermission('statistics.view'), statsController.getUpcomingDeadlines);

// Project-specific stats
router.get('/project/:projectId/progress', hasPermission('statistics.view'), statsController.getProjectProgress);
router.get('/project/:projectId/team', hasPermission('statistics.view'), statsController.getTeamPerformance);

module.exports = router;
