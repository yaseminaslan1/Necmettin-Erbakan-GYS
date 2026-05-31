const statsService = require('./stats.service');
const { successResponse, errorResponse } = require('../../utils/response.utils');

class StatsController {
  /**
   * Get dashboard overview
   * GET /api/statistics/dashboard
   */
  async getDashboard(req, res) {
    try {
      const stats = await statsService.getDashboardStats(req.user.id);
      return successResponse(res, stats);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get tasks by status
   * GET /api/statistics/tasks-by-status
   */
  async getTasksByStatus(req, res) {
    try {
      const { projectId } = req.query;
      const stats = await statsService.getTasksByStatus(req.user.id, projectId);
      return successResponse(res, stats);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get tasks by priority
   * GET /api/statistics/tasks-by-priority
   */
  async getTasksByPriority(req, res) {
    try {
      const { projectId } = req.query;
      const stats = await statsService.getTasksByPriority(req.user.id, projectId);
      return successResponse(res, stats);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get completion trend
   * GET /api/statistics/completion-trend
   */
  async getCompletionTrend(req, res) {
    try {
      const { projectId } = req.query;
      const trend = await statsService.getCompletionTrend(req.user.id, projectId);
      return successResponse(res, trend);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get user productivity
   * GET /api/statistics/productivity
   */
  async getProductivity(req, res) {
    try {
      const { projectId, system, role } = req.query;
      
      // If system=true, return system-wide stats (for admin)
      if (system === 'true') {
        const stats = await statsService.getSystemProductivity();
        return successResponse(res, stats);
      }
      
      // If role=pm, return PM stats (all tasks in their projects)
      if (role === 'pm') {
        const stats = await statsService.getPMProductivity(req.user.id);
        return successResponse(res, stats);
      }
      
      // Default: user's own assigned tasks
      const userId = req.query.userId || req.user.id;
      const stats = await statsService.getUserProductivity(userId, projectId);
      return successResponse(res, stats);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get project progress
   * GET /api/statistics/project/:projectId/progress
   */
  async getProjectProgress(req, res) {
    try {
      const progress = await statsService.getProjectProgress(req.params.projectId);
      return successResponse(res, progress);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get team performance
   * GET /api/statistics/project/:projectId/team
   */
  async getTeamPerformance(req, res) {
    try {
      const performance = await statsService.getTeamPerformance(req.params.projectId);
      return successResponse(res, performance);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get upcoming deadlines
   * GET /api/statistics/deadlines
   */
  async getUpcomingDeadlines(req, res) {
    try {
      const { limit } = req.query;
      const deadlines = await statsService.getUpcomingDeadlines(
        req.user.id,
        parseInt(limit) || 10
      );
      return successResponse(res, deadlines);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new StatsController();
