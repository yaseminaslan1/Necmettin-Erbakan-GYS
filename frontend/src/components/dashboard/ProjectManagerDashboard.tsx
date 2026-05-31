'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useProjectStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Project, Task, DashboardStats } from '@/types';
import { formatDate, getPriorityColor, getPriorityLabel, isOverdue, getInitials } from '@/lib/utils';
import {
  FolderKanban,
  CheckSquare,
  Users,
  Clock,
  Plus,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Briefcase,
  Calendar,
  Target,
  Layers,
  MoreHorizontal,
} from 'lucide-react';

export function ProjectManagerDashboard() {
  const { projects, fetchProjects } = useProjectStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deadlines, setDeadlines] = useState<Task[]>([]);
  const [productivity, setProductivity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, deadlinesRes, prodRes] = await Promise.all([
          api.getDashboardStats(),
          api.getUpcomingDeadlines(10),
          api.client.get('/statistics/productivity', { params: { role: 'pm' } }),
          fetchProjects(),
        ]);

        setStats(statsRes.data);
        setDeadlines(deadlinesRes.data || []);
        setProductivity(prodRes.data?.data);
      } catch (error) {
        console.error('PM dashboard error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchProjects]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeProjects = projects.filter(p => p.status === 'active');
  const completionRate = stats?.completionRate || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Briefcase className="h-6 w-6" />
              <span className="text-blue-200 text-sm font-medium">Proje Yöneticisi</span>
            </div>
            <h1 className="text-2xl font-bold">Proje Yönetimi</h1>
            <p className="text-blue-200 mt-1">Projelerinizi ve ekibinizi yönetin</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/dashboard/projects">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Proje
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats in Header */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-blue-200 text-xs">Aktif Projeler</p>
            <p className="text-2xl font-bold">{activeProjects.length}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-blue-200 text-xs">Toplam Görev</p>
            <p className="text-2xl font-bold">{productivity?.totalAssigned || stats?.totalTasks || 0}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-blue-200 text-xs">Bu Ay Tamamlanan</p>
            <p className="text-2xl font-bold">{productivity?.completedThisMonth || 0}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-blue-200 text-xs">Tamamlanma</p>
            <p className="text-2xl font-bold">{completionRate}%</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center text-lg">
              <Layers className="mr-2 h-5 w-5 text-blue-600" />
              Projelerim
            </CardTitle>
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="sm">Tümü</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderKanban className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Henüz proje oluşturmadınız</p>
                <Link href="/dashboard/projects">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    İlk Projeyi Oluştur
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:shadow-md group">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {project.name}
                          </p>
                          <p className="text-sm text-gray-500">{project.description?.slice(0, 50) || 'Açıklama yok'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                          {project.status === 'active' ? 'Aktif' : 
                           project.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                        </Badge>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="h-8 w-8 text-blue-600" />
                <span className="text-3xl font-bold text-blue-600">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-3 mb-3" />
              <p className="text-sm text-gray-600">Genel Tamamlanma Oranı</p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/60 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-green-600">{stats?.completedTasks || 0}</p>
                  <p className="text-xs text-gray-500">Tamamlandı</p>
                </div>
                <div className="bg-white/60 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-orange-600">{productivity?.inProgress || 0}</p>
                  <p className="text-xs text-gray-500">Devam Ediyor</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overdue Alert */}
          {(stats?.overdueTasks || 0) > 0 && (
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-900">{stats?.overdueTasks} Geciken Görev</p>
                    <p className="text-sm text-red-600">Acil ilgi gerektirir</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Quick View */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="mr-2 h-4 w-4 text-blue-600" />
                Ekip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/team">
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Takımı Yönet
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <Calendar className="mr-2 h-5 w-5 text-orange-600" />
            Yaklaşan Tarihler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deadlines.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Yaklaşan tarih bulunmuyor</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {deadlines.slice(0, 6).map((task: any) => (
                <Link key={task.id} href={`/dashboard/projects/${task.project_id}`}>
                  <div className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                    isOverdue(task.due_date) 
                      ? 'bg-red-50 border-red-200 hover:border-red-300' 
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className="w-2 h-2 rounded-full mt-2"
                        style={{ backgroundColor: task.project_color }}
                      />
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </div>
                    <p className="font-medium text-gray-900 mb-1 line-clamp-1">{task.title}</p>
                    <p className="text-xs text-gray-500 mb-2">{task.project_name}</p>
                    <div className={`flex items-center text-sm ${
                      isOverdue(task.due_date) ? 'text-red-600 font-medium' : 'text-gray-600'
                    }`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(task.due_date)}
                      {isOverdue(task.due_date) && ' (Gecikmiş)'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
