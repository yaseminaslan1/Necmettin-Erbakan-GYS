'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjectStore, useTaskStore, useAuthStore } from '@/store';
import { usePermissions } from '@/hooks/usePermissions';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KanbanBoard } from '@/components/projects/KanbanBoard';
import { Task, ProjectMember, User, Role } from '@/types';
import { Settings, Users, Plus, UserPlus, Trash2, Edit, X, Save, Pencil, AlertTriangle } from 'lucide-react';
import { getInitials } from '@/lib/utils';

const colorOptions = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6', '#6b7280', '#000000',
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);
  
  const { user } = useAuthStore();
  const { currentProject, fetchProject } = useProjectStore();
  const { stages, fetchTasksByProject, createTask, updateTask } = useTaskStore();
  const { canEditTasks, canAssignTasks, canManageProjectMembers, isAdmin, isProjectManager, canEditProjects, canDeleteProjects } = usePermissions();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [createStageId, setCreateStageId] = useState<number | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedMemberRoleId, setSelectedMemberRoleId] = useState<number | null>(null);
  const [memberSearch, setMemberSearch] = useState<string>('');
  const [updatingMemberRole, setUpdatingMemberRole] = useState<number | null>(null);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee_id: '',
    due_date: '',
  });

  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee_id: '',
    due_date: '',
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editProject, setEditProject] = useState({ name: '', description: '', color: '#6366f1', status: 'active' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isProjectOwner = currentProject?.owner_id === user?.id;
  const canManageMembers = isAdmin || isProjectManager || isProjectOwner;
  const canManageProject = isAdmin || isProjectManager || canEditProjects;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [_, __, membersRes, rolesRes] = await Promise.all([
          fetchProject(projectId),
          fetchTasksByProject(projectId),
          api.getProjectMembers(projectId),
          api.getRoles(),
        ]);
        setMembers(membersRes.data);
        setRoles(rolesRes?.data || []);
      } catch (error) {
        console.error('Load project error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectId, fetchProject, fetchTasksByProject]);

  const handleTaskClick = async (task: Task) => {
    try {
      const response = await api.getTask(task.id);
      setSelectedTask(response.data);
      setIsTaskDialogOpen(true);
    } catch (error) {
      console.error('Load task error:', error);
    }
  };

  const handleAddTask = (stageId: number) => {
    setCreateStageId(stageId);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assignee_id: '',
      due_date: '',
    });
    setIsCreateTaskOpen(true);
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !createStageId) return;

    try {
      await createTask({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority as any,
        assignee_id: newTask.assignee_id ? Number(newTask.assignee_id) : null,
        due_date: newTask.due_date || null,
        project_id: projectId,
        stage_id: createStageId,
      });
      setIsCreateTaskOpen(false);
    } catch (error) {
      console.error('Create task error:', error);
    }
  };

  const handleEditTask = () => {
    if (selectedTask) {
      setEditTask({
        title: selectedTask.title,
        description: selectedTask.description || '',
        priority: selectedTask.priority,
        assignee_id: selectedTask.assignee_id ? String(selectedTask.assignee_id) : '',
        due_date: selectedTask.due_date ? selectedTask.due_date.split('T')[0] : '',
      });
      setIsEditingTask(true);
    }
  };

  const handleSaveTask = async () => {
    if (!selectedTask || !editTask.title.trim()) return;

    try {
      await updateTask(selectedTask.id, {
        title: editTask.title,
        description: editTask.description,
        priority: editTask.priority as any,
        assignee_id: editTask.assignee_id ? Number(editTask.assignee_id) : null,
        due_date: editTask.due_date || null,
      });
      
      // Refresh task data
      const response = await api.getTask(selectedTask.id);
      setSelectedTask(response.data);
      setIsEditingTask(false);
      
      // Refresh kanban
      await fetchTasksByProject(projectId);
    } catch (error) {
      console.error('Update task error:', error);
    }
  };

  const projectRoles = roles.filter((r) => r.name !== 'admin');

  const handleOpenMembersDialog = async () => {
    try {
      // Don't fetch users automatically - wait for search
      setAllUsers([]);
      setMemberSearch('');
      setIsMembersDialogOpen(true);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  // Search users when memberSearch changes - only search if there's a search term
  const handleSearchUsers = async (searchTerm: string) => {
    setMemberSearch(searchTerm);
    if (!canManageMembers) return;
    
    // Only search if user typed at least 2 characters
    if (searchTerm.length < 2) {
      setAllUsers([]);
      return;
    }
    
    try {
      const usersRes = await api.getUsers({ limit: 50, search: searchTerm });
      const users = usersRes.data || usersRes || [];
      setAllUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error('Search users error:', err);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    try {
      await api.addProjectMember(projectId, Number(selectedUserId), selectedMemberRoleId ?? undefined);
      const membersRes = await api.getProjectMembers(projectId);
      setMembers(membersRes.data);
      setSelectedUserId('');
      setSelectedMemberRoleId(roles.find(r => r.name === 'developer')?.id ?? null);
      setIsAddMemberOpen(false);
    } catch (error) {
      console.error('Add member error:', error);
    }
  };

  const handleUpdateMemberRole = async (userId: number, roleId: number | null) => {
    setUpdatingMemberRole(userId);
    try {
      const membersRes = await api.updateProjectMemberRole(projectId, userId, roleId);
      setMembers(membersRes.data);
    } catch (error) {
      console.error('Update member role error:', error);
    } finally {
      setUpdatingMemberRole(null);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm('Bu üyeyi projeden çıkarmak istediğinize emin misiniz?')) return;

    try {
      await api.removeProjectMember(projectId, userId);
      const membersRes = await api.getProjectMembers(projectId);
      setMembers(membersRes.data);
    } catch (error) {
      console.error('Remove member error:', error);
    }
  };

  const handleOpenEdit = () => {
    if (!currentProject) return;
    setEditProject({
      name: currentProject.name,
      description: currentProject.description || '',
      color: currentProject.color || '#6366f1',
      status: currentProject.status || 'active',
    });
    setIsEditOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!currentProject || !editProject.name.trim()) return;

    setIsUpdating(true);
    try {
      await api.updateProject(currentProject.id, editProject);
      await fetchProject(projectId);
      setIsEditOpen(false);
    } catch (error) {
      console.error('Update project error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;

    setIsDeleting(true);
    try {
      await api.deleteProject(currentProject.id);
      setIsDeleteOpen(false);
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Delete project error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get users not already in project (search is done on backend)
  const availableUsers = allUsers.filter(
    u => u.id !== currentProject?.owner_id && !members.some(m => m.id === u.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Proje bulunamadı</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: currentProject.color }}
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentProject.name}</h2>
            <p className="text-gray-600">{currentProject.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleOpenMembersDialog}>
            <Users className="mr-2 h-4 w-4" />
            Üyeler ({members.length + 1})
          </Button>
          {canManageProject && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Ayarlar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpenEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Pencil className="mr-2 h-5 w-5" />
              Projeyi Düzenle
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Proje Adı</Label>
              <Input
                id="edit-name"
                value={editProject.name}
                onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                placeholder="Proje adını girin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Açıklama</Label>
              <Textarea
                id="edit-description"
                value={editProject.description}
                onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                placeholder="Proje açıklaması (opsiyonel)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Durum</Label>
              <Select
                value={editProject.status}
                onValueChange={(value) => setEditProject({ ...editProject, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="on_hold">Beklemede</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="archived">Arşivlendi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Renk</Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      editProject.color === color ? 'border-gray-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditProject({ ...editProject, color })}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditOpen(false)}>
                İptal
              </Button>
              <Button
                className="flex-1"
                onClick={handleUpdateProject}
                disabled={isUpdating || !editProject.name.trim()}
              >
                {isUpdating ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Projeyi Sil
            </DialogTitle>
            <DialogDescription>
              <span className="font-semibold">{currentProject?.name}</span> projesini silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz ve projeye ait tüm görevler de silinecektir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={isDeleting}>
              {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <KanbanBoard
        projectId={projectId}
        onTaskClick={handleTaskClick}
        onAddTask={handleAddTask}
      />

      {/* Task Detail Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={(open) => {
        setIsTaskDialogOpen(open);
        if (!open) setIsEditingTask(false);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{isEditingTask ? 'Görevi Düzenle' : selectedTask?.title}</DialogTitle>
              {!isEditingTask && (canEditTasks || canAssignTasks) && (
                <Button variant="outline" size="sm" onClick={handleEditTask}>
                  <Edit className="h-4 w-4 mr-1" />
                  Düzenle
                </Button>
              )}
            </div>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              {isEditingTask ? (
                // Edit Mode
                <>
                  <div className="space-y-2">
                    <Label>Başlık</Label>
                    <Input
                      value={editTask.title}
                      onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Açıklama</Label>
                    <Textarea
                      value={editTask.description}
                      onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Öncelik</Label>
                      <Select
                        value={editTask.priority}
                        onValueChange={(value) => setEditTask({ ...editTask, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Düşük</SelectItem>
                          <SelectItem value="medium">Orta</SelectItem>
                          <SelectItem value="high">Yüksek</SelectItem>
                          <SelectItem value="urgent">Acil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Atanan Kişi</Label>
                      <Select
                        value={editTask.assignee_id || 'unassigned'}
                        onValueChange={(value) => setEditTask({ ...editTask, assignee_id: value === 'unassigned' ? '' : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Atanmamış</SelectItem>
                          {/* Project owner */}
                          {currentProject && (
                            <SelectItem value={String(currentProject.owner_id)}>
                              {currentProject.owner_name} (Sahip)
                            </SelectItem>
                          )}
                          {members.map((member) => (
                            <SelectItem key={member.id} value={String(member.id)}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bitiş Tarihi</Label>
                    <Input
                      type="date"
                      value={editTask.due_date}
                      onChange={(e) => setEditTask({ ...editTask, due_date: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditingTask(false)}>
                      <X className="h-4 w-4 mr-1" />
                      İptal
                    </Button>
                    <Button onClick={handleSaveTask}>
                      <Save className="h-4 w-4 mr-1" />
                      Kaydet
                    </Button>
                  </div>
                </>
              ) : (
                // View Mode
                <>
                  <div>
                    <Label className="text-gray-500">Açıklama</Label>
                    <p className="mt-1">{selectedTask.description || 'Açıklama yok'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Öncelik</Label>
                      <p className="mt-1 capitalize">{selectedTask.priority}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Atanan</Label>
                      <p className="mt-1">{selectedTask.assignee_name || 'Atanmamış'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Bitiş Tarihi</Label>
                      <p className="mt-1">
                        {selectedTask.due_date
                          ? new Date(selectedTask.due_date).toLocaleDateString('tr-TR')
                          : 'Belirlenmemiş'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Durum</Label>
                      <p className="mt-1">{selectedTask.stage_name}</p>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div>
                    <Label className="text-gray-500">Yorumlar</Label>
                    <div className="mt-2 space-y-2">
                      {selectedTask.comments?.length === 0 ? (
                        <p className="text-gray-400 text-sm">Henüz yorum yok</p>
                      ) : (
                        selectedTask.comments?.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{comment.user_name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Görev Oluştur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Başlık</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Görev başlığı"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Açıklama</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Görev açıklaması (opsiyonel)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Öncelik</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Atanan Kişi</Label>
                <Select
                  value={newTask.assignee_id || 'unassigned'}
                  onValueChange={(value) => setNewTask({ ...newTask, assignee_id: value === 'unassigned' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Atanmamış</SelectItem>
                    {/* Project owner */}
                    {currentProject && (
                      <SelectItem value={String(currentProject.owner_id)}>
                        {currentProject.owner_name} (Sahip)
                      </SelectItem>
                    )}
                    {members.map((member) => (
                      <SelectItem key={member.id} value={String(member.id)}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due-date">Bitiş Tarihi</Label>
              <Input
                id="task-due-date"
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCreateTask}
              disabled={!newTask.title.trim()}
            >
              Görev Oluştur
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Members Dialog */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Proje Üyeleri</DialogTitle>
              {canManageMembers && (
                <Button size="sm" onClick={() => {
                  setSelectedMemberRoleId(projectRoles.find(r => r.name === 'developer')?.id ?? null);
                  setIsAddMemberOpen(true);
                }}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Üye Ekle
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {/* Project Owner */}
            {currentProject && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(currentProject.owner_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{currentProject.owner_name}</p>
                    <p className="text-sm text-gray-500">{currentProject.owner_email}</p>
                  </div>
                </div>
                <Badge className="bg-blue-600">Proje Sahibi</Badge>
              </div>
            )}

            {/* Members */}
            {members.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Henüz üye eklenmemiş</p>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {canManageMembers ? (
                      <Select
                        value={member.role_id != null ? String(member.role_id) : 'none'}
                        onValueChange={(v) => handleUpdateMemberRole(member.id, v === 'none' ? null : Number(v))}
                        disabled={updatingMemberRole === member.id}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue placeholder="Rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Rol yok</SelectItem>
                          {projectRoles.map((role) => (
                            <SelectItem key={role.id} value={String(role.id)}>
                              {role.name === 'project_manager' ? 'PM' : role.name === 'developer' ? 'Geliştirici' : role.name === 'viewer' ? 'Görüntüleyici' : role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      member.role_name && <Badge variant="secondary">{member.role_name}</Badge>
                    )}
                    {canManageMembers && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={(open) => {
        setIsAddMemberOpen(open);
        if (!open) {
          setMemberSearch('');
          setSelectedUserId('');
          setSelectedMemberRoleId(roles.find(r => r.name === 'developer')?.id ?? null);
          setAllUsers([]);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Üye Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kullanıcı Ara (isim veya email)</Label>
              <Input
                placeholder="En az 2 karakter yazın..."
                value={memberSearch}
                onChange={(e) => handleSearchUsers(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label>Proje rolü (opsiyonel)</Label>
              <Select
                value={selectedMemberRoleId != null ? String(selectedMemberRoleId) : 'none'}
                onValueChange={(v) => setSelectedMemberRoleId(v === 'none' ? null : Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rol seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Rol yok</SelectItem>
                  {projectRoles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name === 'project_manager' ? 'Proje Yöneticisi' : role.name === 'developer' ? 'Geliştirici' : role.name === 'viewer' ? 'Görüntüleyici' : role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {memberSearch.length < 2 
                  ? 'Sonuçlar' 
                  : `Sonuçlar (${availableUsers.length})`
                }
              </Label>
              {memberSearch.length < 2 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  Kullanıcı aramak için en az 2 karakter yazın
                </p>
              ) : availableUsers.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  Kullanıcı bulunamadı
                </p>
              ) : (
                <div className="max-h-[250px] overflow-y-auto space-y-2 border rounded-md p-2">
                  {availableUsers.slice(0, 15).map((u) => (
                    <div
                      key={u.id}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                        selectedUserId === String(u.id) 
                          ? 'bg-primary text-white' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedUserId(String(u.id))}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={selectedUserId === String(u.id) ? 'bg-white text-primary' : ''}>
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className={`text-xs ${selectedUserId === String(u.id) ? 'text-white/80' : 'text-gray-500'}`}>
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {availableUsers.length > 15 && (
                    <p className="text-xs text-gray-500 text-center py-2">
                      +{availableUsers.length - 15} daha fazla sonuç için aramayı daraltın
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button
              className="w-full"
              onClick={handleAddMember}
              disabled={!selectedUserId}
            >
              Üye Ekle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
