// User types
export interface User {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
  provider: 'local' | 'google' | 'github';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles?: Role[];
  permissions?: string[];
}

// Role types
export interface Role {
  id: number;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  module: string;
}

// Project types
export interface Project {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  owner_name: string;
  owner_avatar: string | null;
  owner_email?: string;
  color: string;
  status: 'active' | 'archived' | 'completed';
  created_at: string;
  updated_at: string;
  members?: ProjectMember[];
  stages?: WorkflowStage[];
}

export interface ProjectMember {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role_id: number | null;
  role_name: string | null;
  joined_at: string;
}

export interface WorkflowStage {
  id: number;
  project_id: number;
  name: string;
  color: string;
  order_index: number;
  is_default: boolean;
  is_completed: boolean;
  tasks?: Task[];
}

// Task types
export interface Task {
  id: number;
  title: string;
  description: string | null;
  project_id: number;
  project_name?: string;
  stage_id: number;
  stage_name?: string;
  stage_color?: string;
  assignee_id: number | null;
  assignee_name?: string | null;
  assignee_email?: string | null;
  assignee_avatar?: string | null;
  creator_id: number;
  creator_name?: string;
  creator_email?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  order_index: number;
  due_date: string | null;
  estimated_hours: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  user_name: string;
  user_avatar: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: number;
  task_id: number;
  user_id: number;
  user_name: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  created_at: string;
}

// Statistics types
export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  myTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface TasksByStatus {
  stage: string;
  color: string;
  count: number;
}

export interface TasksByPriority {
  priority: string;
  color: string;
  count: number;
}

export interface CompletionTrend {
  date: string;
  count: number;
}

export interface UserProductivity {
  totalAssigned: number;
  completedThisMonth: number;
  inProgress: number;
  avgCompletionDays: number;
}

export interface ProjectProgress {
  totalTasks: number;
  completedTasks: number;
  progress: number;
  stages: (WorkflowStage & { taskCount: number })[];
}

export interface TeamPerformance {
  id: number;
  name: string;
  avatar: string | null;
  assignedTasks: number;
  completedTasks: number;
  completionRate: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'developer' | 'project_manager' | 'viewer';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}