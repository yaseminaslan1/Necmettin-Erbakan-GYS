const projectService = require('./project.service');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response.utils');

class ProjectController {
  /**
   * Get all projects
   * GET /api/projects
   */
  async getAll(req, res) {
    try {
      const { page, limit, search, status, sortBy, sortOrder } = req.query;
      const { projects, total } = await projectService.getAllProjects({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
        status,
        userId: req.query.all ? null : req.user?.id, // If 'all' query param, show all (for admins)
        sortBy,
        sortOrder,
      });

      return paginatedResponse(res, projects, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        total,
      });
    } catch (error) {
      console.error('Get projects error:', error);
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get project by ID
   * GET /api/projects/:id
   */
  async getById(req, res) {
    try {
      const project = await projectService.getProjectById(req.params.id);
      return successResponse(res, project);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Create new project
   * POST /api/projects
   */
  async create(req, res) {
    try {
      const project = await projectService.createProject(req.body, req.user.id);
      return successResponse(res, project, 'Project created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Update project
   * PUT /api/projects/:id
   */
  async update(req, res) {
    try {
      const project = await projectService.updateProject(req.params.id, req.body);
      return successResponse(res, project, 'Project updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Delete project
   * DELETE /api/projects/:id
   */
  async delete(req, res) {
    try {
      await projectService.deleteProject(req.params.id);
      return successResponse(res, null, 'Project deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get project members
   * GET /api/projects/:id/members
   */
  async getMembers(req, res) {
    try {
      const members = await projectService.getProjectMembers(req.params.id);
      return successResponse(res, members);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Add project member
   * POST /api/projects/:id/members
   */
  async addMember(req, res) {
    try {
      const members = await projectService.addProjectMember(
        req.params.id,
        req.body.user_id,
        req.body.role_id
      );
      return successResponse(res, members, 'Member added successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Remove project member
   * DELETE /api/projects/:id/members/:userId
   */
  async removeMember(req, res) {
    try {
      const members = await projectService.removeProjectMember(
        req.params.id,
        req.params.userId
      );
      return successResponse(res, members, 'Member removed successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Update member role
   * PATCH /api/projects/:id/members/:userId
   */
  async updateMemberRole(req, res) {
    try {
      const members = await projectService.updateMemberRole(
        req.params.id,
        req.params.userId,
        req.body.role_id
      );
      return successResponse(res, members, 'Member role updated');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get workflow stages
   * GET /api/projects/:id/stages
   */
  async getStages(req, res) {
    try {
      const stages = await projectService.getWorkflowStages(req.params.id);
      return successResponse(res, stages);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Create workflow stage
   * POST /api/projects/:id/stages
   */
  async createStage(req, res) {
    try {
      const stage = await projectService.createWorkflowStage(req.params.id, req.body);
      return successResponse(res, stage, 'Stage created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Update workflow stage
   * PUT /api/projects/:id/stages/:stageId
   */
  async updateStage(req, res) {
    try {
      const stage = await projectService.updateWorkflowStage(req.params.stageId, req.body);
      return successResponse(res, stage, 'Stage updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Delete workflow stage
   * DELETE /api/projects/:id/stages/:stageId
   */
  async deleteStage(req, res) {
    try {
      await projectService.deleteWorkflowStage(req.params.stageId);
      return successResponse(res, null, 'Stage deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Reorder workflow stages
   * PUT /api/projects/:id/stages/reorder
   */
  async reorderStages(req, res) {
    try {
      const stages = await projectService.reorderWorkflowStages(
        req.params.id,
        req.body.stages
      );
      return successResponse(res, stages, 'Stages reordered successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new ProjectController();
