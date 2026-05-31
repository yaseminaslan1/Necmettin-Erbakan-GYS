'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProjectStore } from '@/store';
import { usePermissions } from '@/hooks/usePermissions';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Project } from '@/types';
import { formatDate, getStatusLabel } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  FolderKanban, 
  Users, 
  Calendar, 
  MoreVertical,
  Pencil,
  Trash2,
  Settings,
  AlertTriangle,
} from 'lucide-react';

export default function ProjectsPage() {
  const { projects, isLoading, fetchProjects, createProject } = useProjectStore();
  const { canCreateProjects, canEditProjects, canDeleteProjects, canViewProjects, isProjectManager, isAdmin } = usePermissions();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: '#6366f1' });
  const [editProject, setEditProject] = useState({ name: '', description: '', color: '#6366f1', status: 'active' });
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (canViewProjects) {
      fetchProjects();
    }
  }, [fetchProjects, canViewProjects]);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;

    setIsCreating(true);
    try {
      await createProject(newProject);
      setNewProject({ name: '', description: '', color: '#6366f1' });
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Create project error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProject(project);
    setEditProject({
      name: project.name,
      description: project.description || '',
      color: project.color || '#6366f1',
      status: project.status || 'active',
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject || !editProject.name.trim()) return;

    setIsUpdating(true);
    try {
      await api.updateProject(selectedProject.id, editProject);
      await fetchProjects();
      setIsEditOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Update project error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    setIsDeleting(true);
    try {
      await api.deleteProject(selectedProject.id);
      await fetchProjects();
      setIsDeleteOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Delete project error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const colorOptions = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
    '#10b981', '#06b6d4', '#3b82f6', '#6b7280', '#000000',
  ];

  const canManageProject = isAdmin || isProjectManager || canEditProjects;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projeler</h2>
          <p className="text-gray-600">Tüm projelerinizi yönetin</p>
        </div>

        {canCreateProjects && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Proje
          </Button>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Proje Oluştur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Proje Adı</Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Proje adını girin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Proje açıklaması (opsiyonel)"
              />
            </div>
            <div className="space-y-2">
              <Label>Renk</Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newProject.color === color ? 'border-gray-900' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewProject({ ...newProject, color })}
                  />
                ))}
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleCreateProject}
              disabled={isCreating || !newProject.name.trim()}
            >
              {isCreating ? 'Oluşturuluyor...' : 'Proje Oluştur'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditOpen(false)}
              >
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Projeyi Sil
            </DialogTitle>
            <DialogDescription>
              <span className="font-semibold">{selectedProject?.name}</span> projesini silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz ve projeye ait tüm görevler de silinecektir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isDeleting}
            >
              {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Proje ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? 'Proje bulunamadı' : 'Henüz proje yok'}
            </h3>
            <p className="text-gray-500 mb-4">
              {search ? 'Farklı bir arama terimi deneyin' : 'İlk projenizi oluşturun'}
            </p>
            {!search && canCreateProjects && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Proje
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="relative group">
              <Link href={`/dashboard/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                          {getStatusLabel(project.status)}
                        </Badge>
                        {canManageProject && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => handleEditClick(project, e as any)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.preventDefault();
                                window.location.href = `/dashboard/projects/${project.id}`;
                              }}>
                                <Settings className="mr-2 h-4 w-4" />
                                Ayarlar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => handleDeleteClick(project, e as any)}
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
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description || 'Açıklama yok'}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{project.owner_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(project.created_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
