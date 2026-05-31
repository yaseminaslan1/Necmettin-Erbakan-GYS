import axios, { AxiosError, AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  public client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        const isAuthRequest = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register');

        // Login/register 401: do not refresh, let the page show the error
        if (isAuthRequest && error.response?.status === 401) {
          return Promise.reject(error);
        }

        // If 401 and not already retrying, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await this.client.post('/auth/refresh');
            const { accessToken } = response.data.data;
            this.setAccessToken(accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear token and redirect to login
            this.clearAccessToken();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  clearAccessToken() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  loadAccessToken() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        this.accessToken = token;
      }
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(email: string, password: string, name: string, role: 'developer' | 'project_manager' | 'viewer') {
    const response = await this.client.post('/auth/register', { email, password, name, role });
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/auth/logout');
    this.clearAccessToken();
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async refreshToken() {
    const response = await this.client.post('/auth/refresh');
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.client.post('/auth/reset-password', { token, newPassword });
    return response.data;
  }

  // Notification endpoints
  async getNotifications(params?: { limit?: number; unreadOnly?: boolean }) {
    const response = await this.client.get('/notifications', { params });
    return response.data;
  }

  async getNotificationUnreadCount() {
    const response = await this.client.get('/notifications/unread-count');
    return response.data;
  }

  async markNotificationRead(id: number) {
    const response = await this.client.patch(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsRead() {
    const response = await this.client.patch('/notifications/read-all');
    return response.data;
  }

  // User endpoints
  async getUsers(params?: { page?: number; limit?: number; search?: string }) {
    const response = await this.client.get('/users', { params });
    return response.data;
  }

  async getUser(id: number) {
    const response = await this.client.get(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: number, data: any) {
    const response = await this.client.put(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number) {
    const response = await this.client.delete(`/users/${id}`);
    return response.data;
  }

  async toggleUserStatus(id: number) {
    const response = await this.client.patch(`/users/${id}/toggle-status`);
    return response.data;
  }

  async assignRole(userId: number, roleId: number) {
    const response = await this.client.post(`/users/${userId}/roles`, { role_id: roleId });
    return response.data;
  }

  async assignUserRole(userId: number, roleId: number) {
    const response = await this.client.post(`/users/${userId}/roles`, { role_id: roleId });
    return response.data;
  }

  async removeUserRole(userId: number, roleId: number) {
    const response = await this.client.delete(`/users/${userId}/roles/${roleId}`);
    return response.data;
  }

  // Role endpoints
  async getRoles() {
    const response = await this.client.get('/roles');
    return response.data;
  }

  async getRole(id: number) {
    const response = await this.client.get(`/roles/${id}`);
    return response.data;
  }

  async createRole(data: any) {
    const response = await this.client.post('/roles', data);
    return response.data;
  }

  async updateRole(id: number, data: any) {
    const response = await this.client.put(`/roles/${id}`, data);
    return response.data;
  }

  async deleteRole(id: number) {
    const response = await this.client.delete(`/roles/${id}`);
    return response.data;
  }

  async getPermissions() {
    const response = await this.client.get('/roles/permissions');
    return response.data;
  }

  // Project endpoints
  async getProjects(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const response = await this.client.get('/projects', { params });
    return response.data;
  }

  async getProject(id: number) {
    const response = await this.client.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(data: any) {
    const response = await this.client.post('/projects', data);
    return response.data;
  }

  async updateProject(id: number, data: any) {
    const response = await this.client.put(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: number) {
    const response = await this.client.delete(`/projects/${id}`);
    return response.data;
  }

  async getProjectMembers(projectId: number) {
    const response = await this.client.get(`/projects/${projectId}/members`);
    return response.data;
  }

  async addProjectMember(projectId: number, userId: number, roleId?: number) {
    const response = await this.client.post(`/projects/${projectId}/members`, {
      user_id: userId,
      role_id: roleId,
    });
    return response.data;
  }

  async removeProjectMember(projectId: number, userId: number) {
    const response = await this.client.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
  }

  async updateProjectMemberRole(projectId: number, userId: number, roleId: number | null) {
    const response = await this.client.patch(`/projects/${projectId}/members/${userId}`, {
      role_id: roleId,
    });
    return response.data;
  }

  async getProjectStages(projectId: number) {
    const response = await this.client.get(`/projects/${projectId}/stages`);
    return response.data;
  }

  async createProjectStage(projectId: number, data: any) {
    const response = await this.client.post(`/projects/${projectId}/stages`, data);
    return response.data;
  }

  async updateProjectStage(projectId: number, stageId: number, data: any) {
    const response = await this.client.put(`/projects/${projectId}/stages/${stageId}`, data);
    return response.data;
  }

  async deleteProjectStage(projectId: number, stageId: number) {
    const response = await this.client.delete(`/projects/${projectId}/stages/${stageId}`);
    return response.data;
  }

  async reorderProjectStages(projectId: number, stages: { id: number; order_index: number }[]) {
    const response = await this.client.put(`/projects/${projectId}/stages/reorder`, { stages });
    return response.data;
  }

  // Task endpoints
  async getTasks(params?: { page?: number; limit?: number; projectId?: number; stageId?: number; assigneeId?: number; priority?: string; search?: string }) {
    const response = await this.client.get('/tasks', { params });
    return response.data;
  }

  async getTasksByProject(projectId: number) {
    const response = await this.client.get(`/tasks/project/${projectId}`);
    return response.data;
  }

  async getTask(id: number) {
    const response = await this.client.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(data: any) {
    const response = await this.client.post('/tasks', data);
    return response.data;
  }

  async updateTask(id: number, data: any) {
    const response = await this.client.put(`/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: number) {
    const response = await this.client.delete(`/tasks/${id}`);
    return response.data;
  }

  async moveTask(id: number, stageId: number, orderIndex: number) {
    const response = await this.client.patch(`/tasks/${id}/move`, {
      stage_id: stageId,
      order_index: orderIndex,
    });
    return response.data;
  }

  async reorderTasks(stageId: number, tasks: { id: number; order_index: number }[]) {
    const response = await this.client.put('/tasks/reorder', { stage_id: stageId, tasks });
    return response.data;
  }

  async getTaskComments(taskId: number) {
    const response = await this.client.get(`/tasks/${taskId}/comments`);
    return response.data;
  }

  async addTaskComment(taskId: number, content: string) {
    const response = await this.client.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  }

  async updateTaskComment(taskId: number, commentId: number, content: string) {
    const response = await this.client.put(`/tasks/${taskId}/comments/${commentId}`, { content });
    return response.data;
  }

  async deleteTaskComment(taskId: number, commentId: number) {
    const response = await this.client.delete(`/tasks/${taskId}/comments/${commentId}`);
    return response.data;
  }

  // Statistics endpoints
  async getDashboardStats() {
    const response = await this.client.get('/statistics/dashboard');
    return response.data;
  }

  async getTasksByStatus(projectId?: number) {
    const response = await this.client.get('/statistics/tasks-by-status', {
      params: { projectId },
    });
    return response.data;
  }

  async getTasksByPriority(projectId?: number) {
    const response = await this.client.get('/statistics/tasks-by-priority', {
      params: { projectId },
    });
    return response.data;
  }

  async getCompletionTrend(projectId?: number) {
    const response = await this.client.get('/statistics/completion-trend', {
      params: { projectId },
    });
    return response.data;
  }

  async getProductivity(userId?: number, projectId?: number) {
    const response = await this.client.get('/statistics/productivity', {
      params: { userId, projectId },
    });
    return response.data;
  }

  async getProjectProgress(projectId: number) {
    const response = await this.client.get(`/statistics/project/${projectId}/progress`);
    return response.data;
  }

  async getTeamPerformance(projectId: number) {
    const response = await this.client.get(`/statistics/project/${projectId}/team`);
    return response.data;
  }

  async getUpcomingDeadlines(limit?: number) {
    const response = await this.client.get('/statistics/deadlines', {
      params: { limit },
    });
    return response.data;
  }

  // Goal endpoints
  async getGoals() {
    const response = await this.client.get('/goals');
    return response.data;
  }

  async createGoal(data: { title: string; description?: string; targetValue: number; type: string }) {
    const response = await this.client.post('/goals', data);
    return response.data;
  }

  async updateGoal(id: number, data: { title?: string; description?: string; targetValue?: number; type?: string }) {
    const response = await this.client.put(`/goals/${id}`, data);
    return response.data;
  }

  async deleteGoal(id: number) {
    const response = await this.client.delete(`/goals/${id}`);
    return response.data;
  }

  async getAchievements() {
    const response = await this.client.get('/goals/achievements');
    return response.data;
  }
}

export const api = new ApiClient();