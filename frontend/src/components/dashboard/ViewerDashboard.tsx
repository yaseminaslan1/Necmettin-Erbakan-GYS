'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore, useProjectStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Project, Task, DashboardStats } from '@/types';
import { formatDate, getPriorityColor, getPriorityLabel, isOverdue } from '@/lib/utils';
import {
  Eye,
  FolderKanban,
  CheckSquare,
  Clock,
  TrendingUp,
  BarChart3,
  Calendar,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';

export function ViewerDashboard() {
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes] = await Promise.all([
          api.getDashboardStats(),
          fetchProjects(),
        ]);

        setStats(statsRes.data);
      } catch (error) {
        console.error('Viewer dashboard error:', error);
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

  const completionRate = stats?.completionRate || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 to-gray-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="h-6 w-6" />
              <span className="text-slate-300 text-sm font-medium">Görüntüleyici</span>
            </div>
            <h1 className="text-2xl font-bold">Hoş Geldin, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-slate-300 mt-1">Projeleri ve görevleri görüntüleyebilirsiniz</p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            <Eye className="w-4 h-4 mr-1" />
            Salt Okunur
          </Badge>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Görüntüleyici Hesabı</p>
              <p className="text-sm text-blue-700 mt-1">
                Bu hesap ile projeleri ve görevleri görüntüleyebilirsiniz. 
                Düzenleme yapmak için yöneticinizle iletişime geçin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Projeler</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalProjects || 0}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Görevler</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalTasks || 0}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Tamamlanan</p>
                <p className="text-2xl font-bold text-green-600">{stats?.completedTasks || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Tamamlanma</p>
                <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-900">Genel İlerleme</p>
              <p className="text-sm text-gray-500">Tüm projelerin tamamlanma durumu</p>
            </div>
            <span className="text-2xl font-bold text-primary">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-4" />
          <div className="flex justify-between mt-3 text-sm text-gray-500">
            <span>{stats?.completedTasks || 0} tamamlandı</span>
            <span>{(stats?.totalTasks || 0) - (stats?.completedTasks || 0)} devam ediyor</span>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Layers className="mr-2 h-5 w-5 text-blue-600" />
            Projeler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Görüntülenecek proje bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: project.color }}
                      >
                        {project.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </p>
                        <p className="text-sm text-gray-500">{project.owner_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status === 'active' ? 'Aktif' : 
                         project.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/projects">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FolderKanban className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Projeleri Görüntüle</p>
                  <p className="text-sm text-gray-500">Tüm projelere göz atın</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/statistics">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">İstatistikler</p>
                  <p className="text-sm text-gray-500">Detaylı raporları görüntüleyin</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
