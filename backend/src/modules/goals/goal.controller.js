const GoalService = require('./goal.service');
const { successResponse, errorResponse } = require('../../utils/response.utils');

class GoalController {
  static async getGoals(req, res) {
    try {
      const userId = req.user.id;
      const goals = await GoalService.getUserGoals(userId);
      return successResponse(res, goals, 'Goals fetched successfully');
    } catch (error) {
      console.error('Get goals error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async createGoal(req, res) {
    try {
      const userId = req.user.id;
      const goal = await GoalService.createGoal(userId, req.body);
      return successResponse(res, goal, 'Goal created successfully', 201);
    } catch (error) {
      console.error('Create goal error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async updateGoal(req, res) {
    try {
      const userId = req.user.id;
      const goalId = parseInt(req.params.id);
      const goal = await GoalService.updateGoal(goalId, userId, req.body);
      return successResponse(res, goal, 'Goal updated successfully');
    } catch (error) {
      console.error('Update goal error:', error);
      if (error.message === 'Goal not found') {
        return errorResponse(res, error.message, 404);
      }
      if (error.message === 'Unauthorized') {
        return errorResponse(res, error.message, 403);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  static async deleteGoal(req, res) {
    try {
      const userId = req.user.id;
      const goalId = parseInt(req.params.id);
      await GoalService.deleteGoal(goalId, userId);
      return successResponse(res, null, 'Goal deleted successfully');
    } catch (error) {
      console.error('Delete goal error:', error);
      if (error.message === 'Goal not found') {
        return errorResponse(res, error.message, 404);
      }
      if (error.message === 'Unauthorized') {
        return errorResponse(res, error.message, 403);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  static async getAchievements(req, res) {
    try {
      const userId = req.user.id;
      const achievements = await GoalService.getAchievements(userId);
      return successResponse(res, achievements, 'Achievements fetched successfully');
    } catch (error) {
      console.error('Get achievements error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = GoalController;
