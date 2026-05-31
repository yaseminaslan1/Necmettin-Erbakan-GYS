import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Project, Task, WorkflowStage } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'developer' | 'project_manager' | 'viewer') => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),

      login: async (email, password) => {
        const response = await api.login(email, password);
        api.setAccessToken(response.data.accessToken);
        set({ user: response.data.user, isAuthenticated: true });
      },

      register: async (email, password, name, role) => {
        const response = await api.register(email, password, name, role);
        api.setAccessToken(response.data.accessToken);
        set({ user: response.data.user, isAuthenticated: true });
      },

      logout: async () => {
        try {
          await api.logout();
        } catch (error) {
          // Ignore errors on logout
        }
        api.clearAccessToken();
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        try {
          api.loadAccessToken();
          const response = await api.getMe();
          set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: number) => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: number, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (currentProject) => set({ currentProject }),

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const response = await api.getProjects({ limit: 100 });
      set({ projects: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchProject: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.getProject(id);
      set({ currentProject: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createProject: async (data) => {
    const response = await api.createProject(data);
    const newProject = response.data;
    set((state) => ({ projects: [...state.projects, newProject] }));
    return newProject;
  },

  updateProject: async (id, data) => {
    const response = await api.updateProject(id, data);
    const updatedProject = response.data;
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
      currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
    }));
  },

  deleteProject: async (id) => {
    await api.deleteProject(id);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
  },
}));

interface TaskState {
  stages: WorkflowStage[];
  currentTask: Task | null;
  isLoading: boolean;
  setStages: (stages: WorkflowStage[]) => void;
  setCurrentTask: (task: Task | null) => void;
  fetchTasksByProject: (projectId: number) => Promise<void>;
  fetchTask: (id: number) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: number, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  moveTask: (taskId: number, stageId: number, orderIndex: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  stages: [],
  currentTask: null,
  isLoading: false,

  setStages: (stages) => set({ stages }),
  setCurrentTask: (currentTask) => set({ currentTask }),

  fetchTasksByProject: async (projectId) => {
    set({ isLoading: true });
    try {
      const response = await api.getTasksByProject(projectId);
      set({ stages: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchTask: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.getTask(id);
      set({ currentTask: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createTask: async (data) => {
    const response = await api.createTask(data);
    const newTask = response.data;
    
    // Add task to appropriate stage
    set((state) => ({
      stages: state.stages.map((stage) =>
        stage.id === newTask.stage_id
          ? { ...stage, tasks: [...(stage.tasks || []), newTask] }
          : stage
      ),
    }));
    
    return newTask;
  },

  updateTask: async (id, data) => {
    const response = await api.updateTask(id, data);
    const updatedTask = response.data;
    
    set((state) => ({
      stages: state.stages.map((stage) => ({
        ...stage,
        tasks: stage.tasks?.map((task) =>
          task.id === id ? updatedTask : task
        ),
      })),
      currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
    }));
  },

  deleteTask: async (id) => {
    await api.deleteTask(id);
    
    set((state) => ({
      stages: state.stages.map((stage) => ({
        ...stage,
        tasks: stage.tasks?.filter((task) => task.id !== id),
      })),
      currentTask: state.currentTask?.id === id ? null : state.currentTask,
    }));
  },

  moveTask: async (taskId, stageId, orderIndex) => {
    const response = await api.moveTask(taskId, stageId, orderIndex);
    const movedTask = response.data;
    
    set((state) => {
      // Remove task from old stage and add to new stage
      const newStages = state.stages.map((stage) => {
        // Remove from old stage
        const filteredTasks = stage.tasks?.filter((task) => task.id !== taskId) || [];
        
        // Add to new stage
        if (stage.id === stageId) {
          const tasks = [...filteredTasks, movedTask].sort((a, b) => a.order_index - b.order_index);
          return { ...stage, tasks };
        }
        
        return { ...stage, tasks: filteredTasks };
      });
      
      return { stages: newStages };
    });
  },
}));