const ProjectModel = require('./project.model');

class ProjectService {
  async getAllProjects(options) {
    return ProjectModel.findAll(options);
  }

  async getProjectById(id) {
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw { statusCode: 404, message: 'Project not found' };
    }

    const members = await ProjectModel.getMembers(id);
    const stages = await ProjectModel.getWorkflowStages(id);

    return {
      ...project,
      members,
      stages,
    };
  }

  async createProject(projectData, ownerId) {
    const project = await ProjectModel.create({
      name: projectData.name,
      description: projectData.description,
      color: projectData.color || '#6366f1',
      owner_id: ownerId,
    });

    // Create default workflow stages
    await ProjectModel.createDefaultWorkflowStages(project.id);

    return this.getProjectById(project.id);
  }

  async updateProject(id, projectData) {
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw { statusCode: 404, message: 'Project not found' };
    }

    await ProjectModel.update(id, {
      name: projectData.name,
      description: projectData.description,
      color: projectData.color,
      status: projectData.status,
    });

    return this.getProjectById(id);
  }

  async deleteProject(id) {
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw { statusCode: 404, message: 'Project not found' };
    }

    await ProjectModel.delete(id);
    return true;
  }

  // Members
  async getProjectMembers(projectId) {
    return ProjectModel.getMembers(projectId);
  }

  async addProjectMember(projectId, userId, roleId = null) {
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw { statusCode: 404, message: 'Project not found' };
    }

    return ProjectModel.addMember(projectId, userId, roleId);
  }

  async removeProjectMember(projectId, userId) {
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw { statusCode: 404, message: 'Project not found' };
    }

    // Cannot remove owner
    if (project.owner_id === userId) {
      throw { statusCode: 400, message: 'Cannot remove project owner' };
    }

    await ProjectModel.removeMember(projectId, userId);
    return this.getProjectMembers(projectId);
  }

  async updateMemberRole(projectId, userId, roleId) {
    return ProjectModel.updateMemberRole(projectId, userId, roleId);
  }

  // Workflow Stages
  async getWorkflowStages(projectId) {
    return ProjectModel.getWorkflowStages(projectId);
  }

  async createWorkflowStage(projectId, stageData) {
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw { statusCode: 404, message: 'Project not found' };
    }

    // Get max order_index
    const stages = await ProjectModel.getWorkflowStages(projectId);
    const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order_index)) : -1;

    return ProjectModel.createWorkflowStage({
      project_id: projectId,
      name: stageData.name,
      color: stageData.color || '#6b7280',
      order_index: maxOrder + 1,
      is_default: stageData.is_default || false,
      is_completed: stageData.is_completed || false,
    });
  }

  async updateWorkflowStage(stageId, stageData) {
    return ProjectModel.updateWorkflowStage(stageId, {
      name: stageData.name,
      color: stageData.color,
      is_default: stageData.is_default,
      is_completed: stageData.is_completed,
    });
  }

  async deleteWorkflowStage(stageId) {
    // Check if stage has tasks
    const { db } = require('../../config/database');
    const tasksCount = await db('tasks').where('stage_id', stageId).count('* as count').first();
    
    if (tasksCount.count > 0) {
      throw { statusCode: 400, message: 'Cannot delete stage with tasks. Move or delete tasks first.' };
    }

    await ProjectModel.deleteWorkflowStage(stageId);
    return true;
  }

  async reorderWorkflowStages(projectId, stageOrders) {
    return ProjectModel.reorderWorkflowStages(projectId, stageOrders);
  }
}

module.exports = new ProjectService();
