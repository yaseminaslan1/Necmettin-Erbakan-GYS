const { db } = require('../../config/database');

class StatsService {
  /**
   * Get dashboard overview statistics
   */
  async getDashboardStats(userId) {
    // Get user's projects
    const projectsQuery = db('projects')
      .where('owner_id', userId)
      .orWhereExists(function() {
        this.select('*')
          .from('project_members')
          .whereRaw('project_members.project_id = projects.id')
          .andWhere('project_members.user_id', userId);
      });

    const projectIds = await projectsQuery.clone().pluck('id');

    // Total counts
    const [projectCount] = await projectsQuery.clone().count('* as count');
    
    const [taskCount] = await db('tasks')
      .whereIn('project_id', projectIds)
      .count('* as count');

    const [completedTaskCount] = await db('tasks')
      .whereIn('project_id', projectIds)
      .whereNotNull('completed_at')
      .count('* as count');

    const [myTaskCount] = await db('tasks')
      .where('assignee_id', userId)
      .whereIn('project_id', projectIds)
      .count('* as count');

    const [overdueTaskCount] = await db('tasks')
      .whereIn('project_id', projectIds)
      .whereNull('completed_at')
      .where('due_date', '<', new Date())
      .count('* as count');

    return {
      totalProjects: projectCount.count,
      totalTasks: taskCount.count,
      completedTasks: completedTaskCount.count,
      myTasks: myTaskCount.count,
      overdueTasks: overdueTaskCount.count,
      completionRate: taskCount.count > 0 
        ? Math.round((completedTaskCount.count / taskCount.count) * 100) 
        : 0,
    };
  }

  /**
   * Get task statistics by status
   */
  async getTasksByStatus(userId, projectId = null) {
    let query = db('tasks')
      .join('workflow_stages', 'tasks.stage_id', 'workflow_stages.id')
      .select('workflow_stages.name as stage', 'workflow_stages.color')
      .count('tasks.id as count')
      .groupBy('workflow_stages.id', 'workflow_stages.name', 'workflow_stages.color')
      .orderBy('workflow_stages.order_index');

    if (projectId) {
      query = query.where('tasks.project_id', projectId);
    } else {
      // Get user's projects
      const projectIds = await this.getUserProjectIds(userId);
      query = query.whereIn('tasks.project_id', projectIds);
    }

    return query;
  }

  /**
   * Get task statistics by priority
   */
  async getTasksByPriority(userId, projectId = null) {
    let query = db('tasks')
      .select('priority')
      .count('* as count')
      .whereNull('completed_at')
      .groupBy('priority');

    if (projectId) {
      query = query.where('project_id', projectId);
    } else {
      const projectIds = await this.getUserProjectIds(userId);
      query = query.whereIn('project_id', projectIds);
    }

    const results = await query;

    // Map to include all priorities
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const colors = {
      low: '#10b981',
      medium: '#3b82f6',
      high: '#f59e0b',
      urgent: '#ef4444',
    };

    return priorities.map(priority => ({
      priority,
      color: colors[priority],
      count: results.find(r => r.priority === priority)?.count || 0,
    }));
  }

  /**
   * Get task completion trend (last 30 days)
   */
  async getCompletionTrend(userId, projectId = null) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let query = db('tasks')
      .select(db.raw('DATE(completed_at) as date'))
      .count('* as count')
      .whereNotNull('completed_at')
      .where('completed_at', '>=', thirtyDaysAgo)
      .groupBy(db.raw('DATE(completed_at)'))
      .orderBy('date');

    if (projectId) {
      query = query.where('project_id', projectId);
    } else {
      const projectIds = await this.getUserProjectIds(userId);
      query = query.whereIn('project_id', projectIds);
    }

    const results = await query;

    // Fill in missing dates
    const trend = [];
    const currentDate = new Date(thirtyDaysAgo);
    const today = new Date();

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const found = results.find(r => {
        const rDate = new Date(r.date).toISOString().split('T')[0];
        return rDate === dateStr;
      });
      
      trend.push({
        date: dateStr,
        count: found?.count || 0,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trend;
  }

  /**
   * Get user productivity stats (for developers - their own tasks)
   */
  async getUserProductivity(userId, projectId = null) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get user's accessible project IDs
    const projectIds = projectId ? [projectId] : await this.getUserProjectIds(userId);

    if (projectIds.length === 0) {
      return {
        totalAssigned: 0,
        completedThisMonth: 0,
        inProgress: 0,
        avgCompletionDays: 0,
      };
    }

    // Total tasks assigned to user in accessible projects
    const [totalAssigned] = await db('tasks')
      .whereIn('project_id', projectIds)
      .where('assignee_id', userId)
      .count('* as count');
    
    // Completed this month
    const [completedThisMonth] = await db('tasks')
      .whereIn('project_id', projectIds)
      .where('assignee_id', userId)
      .whereNotNull('completed_at')
      .where('completed_at', '>=', thirtyDaysAgo)
      .count('* as count');

    // In progress (not completed)
    const [inProgress] = await db('tasks')
      .whereIn('project_id', projectIds)
      .where('assignee_id', userId)
      .whereNull('completed_at')
      .count('* as count');

    // Average completion time (in days)
    const avgCompletionTime = await db('tasks')
      .whereIn('project_id', projectIds)
      .where('assignee_id', userId)
      .whereNotNull('completed_at')
      .whereNotNull('started_at')
      .select(db.raw('AVG(DATEDIFF(completed_at, started_at)) as avg_days'))
      .first();

    return {
      totalAssigned: parseInt(totalAssigned.count) || 0,
      completedThisMonth: parseInt(completedThisMonth.count) || 0,
      inProgress: parseInt(inProgress.count) || 0,
      avgCompletionDays: Math.round(avgCompletionTime?.avg_days || 0),
    };
  }

  /**
   * Get project manager productivity stats (all tasks in their projects)
   */
  async getPMProductivity(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get PM's project IDs (projects they own or are member of)
    const projectIds = await this.getUserProjectIds(userId);

    if (projectIds.length === 0) {
      return {
        totalAssigned: 0,
        completedThisMonth: 0,
        inProgress: 0,
        avgCompletionDays: 0,
      };
    }

    // Total tasks in PM's projects (with assignee)
    const [totalAssigned] = await db('tasks')
      .whereIn('project_id', projectIds)
      .whereNotNull('assignee_id')
      .count('* as count');
    
    // Completed this month in PM's projects
    const [completedThisMonth] = await db('tasks')
      .whereIn('project_id', projectIds)
      .whereNotNull('completed_at')
      .where('completed_at', '>=', thirtyDaysAgo)
      .count('* as count');

    // In progress in PM's projects (not completed)
    const [inProgress] = await db('tasks')
      .whereIn('project_id', projectIds)
      .whereNull('completed_at')
      .count('* as count');

    // Average completion time (in days)
    const avgCompletionTime = await db('tasks')
      .whereIn('project_id', projectIds)
      .whereNotNull('completed_at')
      .whereNotNull('started_at')
      .select(db.raw('AVG(DATEDIFF(completed_at, started_at)) as avg_days'))
      .first();

    return {
      totalAssigned: parseInt(totalAssigned.count) || 0,
      completedThisMonth: parseInt(completedThisMonth.count) || 0,
      inProgress: parseInt(inProgress.count) || 0,
      avgCompletionDays: Math.round(avgCompletionTime?.avg_days || 0),
    };
  }

  /**
   * Get overall system productivity (for admin)
   */
  async getSystemProductivity() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total tasks with assignee
    const [totalAssigned] = await db('tasks')
      .whereNotNull('assignee_id')
      .count('* as count');
    
    // Completed this month
    const [completedThisMonth] = await db('tasks')
      .whereNotNull('completed_at')
      .where('completed_at', '>=', thirtyDaysAgo)
      .count('* as count');

    // In progress (not completed)
    const [inProgress] = await db('tasks')
      .whereNull('completed_at')
      .count('* as count');

    // Average completion time (in days)
    const avgCompletionTime = await db('tasks')
      .whereNotNull('completed_at')
      .whereNotNull('started_at')
      .select(db.raw('AVG(DATEDIFF(completed_at, started_at)) as avg_days'))
      .first();

    return {
      totalAssigned: parseInt(totalAssigned.count) || 0,
      completedThisMonth: parseInt(completedThisMonth.count) || 0,
      inProgress: parseInt(inProgress.count) || 0,
      avgCompletionDays: Math.round(avgCompletionTime?.avg_days || 0),
    };
  }

  /**
   * Get project progress
   */
  async getProjectProgress(projectId) {
    const [total] = await db('tasks')
      .where('project_id', projectId)
      .count('* as count');

    const [completed] = await db('tasks')
      .where('project_id', projectId)
      .whereNotNull('completed_at')
      .count('* as count');

    const stages = await db('workflow_stages')
      .where('project_id', projectId)
      .orderBy('order_index');

    const tasksByStage = await db('tasks')
      .where('project_id', projectId)
      .select('stage_id')
      .count('* as count')
      .groupBy('stage_id');

    const stageProgress = stages.map(stage => ({
      ...stage,
      taskCount: tasksByStage.find(t => t.stage_id === stage.id)?.count || 0,
    }));

    return {
      totalTasks: total.count,
      completedTasks: completed.count,
      progress: total.count > 0 ? Math.round((completed.count / total.count) * 100) : 0,
      stages: stageProgress,
    };
  }

  /**
   * Get team performance (for project owners/admins)
   */
  async getTeamPerformance(projectId) {
    const members = await db('project_members')
      .join('users', 'project_members.user_id', 'users.id')
      .where('project_members.project_id', projectId)
      .select('users.id', 'users.name', 'users.avatar');

    // Add project owner
    const project = await db('projects')
      .join('users', 'projects.owner_id', 'users.id')
      .where('projects.id', projectId)
      .select('users.id', 'users.name', 'users.avatar')
      .first();

    const allMembers = [project, ...members.filter(m => m.id !== project.id)];

    const performance = await Promise.all(
      allMembers.map(async (member) => {
        const [assigned] = await db('tasks')
          .where('project_id', projectId)
          .where('assignee_id', member.id)
          .count('* as count');

        const [completed] = await db('tasks')
          .where('project_id', projectId)
          .where('assignee_id', member.id)
          .whereNotNull('completed_at')
          .count('* as count');

        return {
          ...member,
          assignedTasks: assigned.count,
          completedTasks: completed.count,
          completionRate: assigned.count > 0 
            ? Math.round((completed.count / assigned.count) * 100) 
            : 0,
        };
      })
    );

    return performance;
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(userId, limit = 10) {
    const projectIds = await this.getUserProjectIds(userId);

    return db('tasks')
      .join('projects', 'tasks.project_id', 'projects.id')
      .whereIn('tasks.project_id', projectIds)
      .whereNull('tasks.completed_at')
      .whereNotNull('tasks.due_date')
      .where('tasks.due_date', '>=', new Date())
      .select(
        'tasks.id',
        'tasks.title',
        'tasks.due_date',
        'tasks.priority',
        'projects.name as project_name',
        'projects.color as project_color'
      )
      .orderBy('tasks.due_date')
      .limit(limit);
  }

  /**
   * Helper: Get user's project IDs
   */
  async getUserProjectIds(userId) {
    const projects = await db('projects')
      .where('owner_id', userId)
      .orWhereExists(function() {
        this.select('*')
          .from('project_members')
          .whereRaw('project_members.project_id = projects.id')
          .andWhere('project_members.user_id', userId);
      })
      .pluck('id');

    return projects;
  }
}

module.exports = new StatsService();
