'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Task, Project } from '@/types';
import { formatDate, getPriorityColor, getPriorityLabel, isOverdue } from '@/lib/utils';
import { 
  Search, 
  Calendar, 
  CheckSquare, 
  FolderKanban,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface TasksByProject {
  project: Project;
  tasks: Task[];
}

export default function TasksPage() {
  const { user } = useAuthStore();
  const { isProjectManager, isAdmin } = usePermissions();
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [tasksByProject, setTasksByProject] = useState<TasksByProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch tasks assigned to current user
        const myTasksRes = await api.getTasks({ assigneeId: user.id, limit: 100 });
        const myTasksData = myTasksRes.data?.data || myTasksRes.data || [];
        setMyTasks(myTasksData);

        // For PM/Admin, also fetch tasks grouped by project
        if (isProjectManager || isAdmin) {
          const projectsRes = await api.getProjects({ limit: 100 });
          const projects = projectsRes.data?.data || projectsRes.data || [];
          
          const projectTasks: TasksByProject[] = [];
          
          for (const project of projects) {
            const tasksRes = await api.getTasksByProject(project.id);
            const stages = tasksRes.data || [];
            const allTasks = stages.flatMap((stage: any) => stage.tasks || []);
            
            if (allTasks.length > 0) {
              projectTasks.push({
                project,
                tasks: allTasks,
              });
            }
          }
          
          setTasksByProject(projectTasks);
        }
      } catch (error) {
        console.error('Fetch tasks error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user?.id, isProjectManager, isAdmin]);

  // Filter my tasks
  const filteredMyTasks = myTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !task.completed_at) ||
      (statusFilter === 'completed' && task.completed_at);
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const activeTasks = filteredMyTasks.filter((task) => !task.completed_at);
  const completedTasks = filteredMyTasks.filter((task) => task.completed_at);
  const overdueTasks = activeTasks.filter((task) => task.due_date && isOverdue(task.due_date));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <Link href={`/dashboard/projects/${task.project_id}`}>
      <div className={`p-3 rounded-lg hover:shadow-md transition-all cursor-pointer ${
        task.completed_at ? 'bg-green-50' : 
        (task.due_date && isOverdue(task.due_date)) ? 'bg-red-50' : 'bg-gray-50 hover:bg-gray-100'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium text-gray-900 truncate ${task.completed_at ? 'line-through' : ''}`}>
              {task.title}
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              {task.project_name} • {task.stage_name}
            </p>
          </div>
          <Badge className={getPriorityColor(task.priority)}>
            {getPriorityLabel(task.priority)}
          </Badge>
        </div>
        {task.due_date && (
          <div className={`flex items-center mt-2 text-sm ${
            isOverdue(task.due_date) && !task.completed_at ? 'text-red-600 font-medium' : 'text-gray-500'
          }`}>
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(task.due_date)}
            {isOverdue(task.due_date) && !task.completed_at && ' (Gecikmiş)'}
          </div>
        )}
      </div>
    </Link>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Görevlerim</h2>
        <p className="text-gray-600">Size atanan görevleri görüntüleyin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Toplam</p>
                <p className="text-2xl font-bold">{myTasks.length}</p>
              </div>
              <CheckSquare className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Aktif</p>
                <p className="text-2xl font-bold">{activeTasks.length}</p>
              </div>
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Geciken</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Tamamlanan</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Görev ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Öncelik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Öncelik</SelectItem>
            <SelectItem value="low">Düşük</SelectItem>
            <SelectItem value="medium">Orta</SelectItem>
            <SelectItem value="high">Yüksek</SelectItem>
            <SelectItem value="urgent">Acil</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durum</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="completed">Tamamlanan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* PM/Admin: Tabs for My Tasks and Project Tasks */}
      {(isProjectManager || isAdmin) ? (
        <Tabs defaultValue="my-tasks" className="w-full">
          <TabsList>
            <TabsTrigger value="my-tasks">
              <CheckSquare className="h-4 w-4 mr-2" />
              Bana Atanan ({myTasks.length})
            </TabsTrigger>
            <TabsTrigger value="project-tasks">
              <FolderKanban className="h-4 w-4 mr-2" />
              Projelere Göre
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-tasks" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-600">
                    <Clock className="mr-2 h-5 w-5" />
                    Aktif Görevler ({activeTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[500px] overflow-y-auto">
                  {activeTasks.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aktif görev yok</p>
                  ) : (
                    <div className="space-y-3">
                      {activeTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Completed Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Tamamlanan ({completedTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[500px] overflow-y-auto">
                  {completedTasks.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Tamamlanan görev yok</p>
                  ) : (
                    <div className="space-y-3">
                      {completedTasks.slice(0, 20).map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="project-tasks" className="mt-4">
            {tasksByProject.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz proje yok</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {tasksByProject.map(({ project, tasks }) => {
                  const projectActiveTasks = tasks.filter(t => !t.completed_at);
                  const projectCompletedTasks = tasks.filter(t => t.completed_at);
                  const projectOverdue = projectActiveTasks.filter(t => t.due_date && isOverdue(t.due_date));
                  
                  return (
                    <Card key={project.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            <CardTitle>{project.name}</CardTitle>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm">
                              <Badge variant="outline">{projectActiveTasks.length} aktif</Badge>
                              <Badge variant="outline" className="text-green-600">{projectCompletedTasks.length} tamamlandı</Badge>
                              {projectOverdue.length > 0 && (
                                <Badge variant="destructive">{projectOverdue.length} gecikmiş</Badge>
                              )}
                            </div>
                            <Link href={`/dashboard/projects/${project.id}`}>
                              <Button variant="outline" size="sm">
                                Kanban
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {projectActiveTasks.slice(0, 6).map((task) => (
                            <TaskCard key={task.id} task={task} />
                          ))}
                        </div>
                        {projectActiveTasks.length > 6 && (
                          <Link href={`/dashboard/projects/${project.id}`}>
                            <Button variant="ghost" className="w-full mt-4">
                              +{projectActiveTasks.length - 6} daha fazla görev
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        // Developer/Viewer: Simple task list
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-orange-600">
                <Clock className="mr-2 h-5 w-5" />
                Aktif Görevler ({activeTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              {activeTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aktif görev yok</p>
              ) : (
                <div className="space-y-3">
                  {activeTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle className="mr-2 h-5 w-5" />
                Tamamlanan ({completedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              {completedTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Tamamlanan görev yok</p>
              ) : (
                <div className="space-y-3">
                  {completedTasks.slice(0, 20).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
