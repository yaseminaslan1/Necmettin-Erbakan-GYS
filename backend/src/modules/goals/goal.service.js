const GoalModel = require('./goal.model');
const { db } = require('../../config/database');

class GoalService {
  static async getUserGoals(userId) {
    const goals = await GoalModel.findByUserId(userId);
    
    // Get current stats to update goal progress
    const stats = await this.getUserStats(userId);
    
    // Update current values based on goal type
    const updatedGoals = goals.map(goal => {
      let currentValue = goal.current_value;
      
      switch (goal.type) {
        case 'tasks':
          currentValue = stats.completedThisMonth || 0;
          break;
        case 'completion':
          currentValue = stats.completionRate || 0;
          break;
        case 'overdue':
          currentValue = stats.overdueTasks || 0;
          break;
        default:
          // Keep manual current_value for custom type
          break;
      }
      
      // Determine status
      let status = goal.status;
      if (goal.type === 'overdue') {
        status = currentValue <= goal.target_value ? 'completed' : 'in_progress';
      } else {
        status = currentValue >= goal.target_value ? 'completed' : 'in_progress';
      }
      
      return {
        ...goal,
        current_value: currentValue,
        status,
      };
    });
    
    return updatedGoals;
  }

  static async getUserStats(userId) {
    // Get completed tasks this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const completedThisMonthResult = await db('tasks')
      .where('assignee_id', userId)
      .whereNotNull('completed_at')
      .where('completed_at', '>=', startOfMonth)
      .count('id as count')
      .first();
    
    // Get total and completed tasks for completion rate
    const totalTasksResult = await db('tasks')
      .where('assignee_id', userId)
      .count('id as count')
      .first();
    
    const completedTasksResult = await db('tasks')
      .where('assignee_id', userId)
      .whereNotNull('completed_at')
      .count('id as count')
      .first();
    
    // Get overdue tasks (not completed, due date passed)
    const overdueResult = await db('tasks')
      .where('assignee_id', userId)
      .whereNull('completed_at')
      .where('due_date', '<', new Date())
      .count('id as count')
      .first();
    
    const totalTasks = parseInt(totalTasksResult?.count || 0);
    const completedTasks = parseInt(completedTasksResult?.count || 0);
    
    return {
      completedThisMonth: parseInt(completedThisMonthResult?.count || 0),
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      overdueTasks: parseInt(overdueResult?.count || 0),
      totalTasks,
      completedTasks,
    };
  }

  static async createGoal(userId, goalData) {
    const goal = await GoalModel.create({
      user_id: userId,
      title: goalData.title,
      description: goalData.description || null,
      target_value: goalData.targetValue || goalData.target_value || 10,
      current_value: 0,
      type: goalData.type || 'tasks',
      status: 'in_progress',
    });
    
    return goal;
  }

  static async updateGoal(goalId, userId, goalData) {
    const goal = await GoalModel.findById(goalId);
    
    if (!goal) {
      throw new Error('Goal not found');
    }
    
    if (goal.user_id !== userId) {
      throw new Error('Unauthorized');
    }
    
    const updated = await GoalModel.update(goalId, {
      title: goalData.title,
      description: goalData.description,
      target_value: goalData.targetValue || goalData.target_value,
      type: goalData.type,
    });
    
    return updated;
  }

  static async deleteGoal(goalId, userId) {
    const goal = await GoalModel.findById(goalId);
    
    if (!goal) {
      throw new Error('Goal not found');
    }
    
    if (goal.user_id !== userId) {
      throw new Error('Unauthorized');
    }
    
    await GoalModel.delete(goalId);
    return { success: true };
  }

  static async getAchievements(userId) {
    const stats = await this.getUserStats(userId);
    
    // Get additional stats for achievements
    const projectsResult = await db('project_members')
      .where('user_id', userId)
      .count('project_id as count')
      .first();
    
    const teamMembersResult = await db('project_members as pm1')
      .join('project_members as pm2', 'pm1.project_id', 'pm2.project_id')
      .where('pm1.user_id', userId)
      .whereNot('pm2.user_id', userId)
      .countDistinct('pm2.user_id as count')
      .first();
    
    const totalProjects = parseInt(projectsResult?.count || 0);
    const teamMembers = parseInt(teamMembersResult?.count || 0);
    
    const achievements = [
      { 
        id: 1,
        title: 'İlk Adım', 
        description: 'İlk görevi tamamla', 
        earned: stats.completedTasks >= 1, 
        progress: Math.min(100, stats.completedTasks > 0 ? 100 : 0),
      },
      { 
        id: 2,
        title: 'Görev Avcısı', 
        description: '10 görev tamamla', 
        earned: stats.completedTasks >= 10, 
        progress: Math.min(100, (stats.completedTasks / 10) * 100),
      },
      { 
        id: 3,
        title: 'Proje Başlatıcı', 
        description: 'İlk projeye katıl', 
        earned: totalProjects >= 1, 
        progress: totalProjects >= 1 ? 100 : 0,
      },
      { 
        id: 4,
        title: 'Takım Oyuncusu', 
        description: '3+ kişiyle çalış', 
        earned: teamMembers >= 3, 
        progress: Math.min(100, (teamMembers / 3) * 100),
      },
      { 
        id: 5,
        title: 'Verimli Çalışan', 
        description: '%50+ tamamlama oranı', 
        earned: stats.completionRate >= 50, 
        progress: Math.min(100, (stats.completionRate / 50) * 100),
      },
      { 
        id: 6,
        title: 'Mükemmeliyetçi', 
        description: '%80+ tamamlama oranı', 
        earned: stats.completionRate >= 80, 
        progress: Math.min(100, (stats.completionRate / 80) * 100),
      },
      { 
        id: 7,
        title: 'Görev Ustası', 
        description: '50 görev tamamla', 
        earned: stats.completedTasks >= 50, 
        progress: Math.min(100, (stats.completedTasks / 50) * 100),
      },
      { 
        id: 8,
        title: 'Süper Yıldız', 
        description: 'Bu ay 20+ görev tamamla', 
        earned: stats.completedThisMonth >= 20, 
        progress: Math.min(100, (stats.completedThisMonth / 20) * 100),
      },
    ];
    
    return achievements;
  }
}

module.exports = GoalService;
