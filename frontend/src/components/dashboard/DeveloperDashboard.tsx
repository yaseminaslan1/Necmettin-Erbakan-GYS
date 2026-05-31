'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Task, DashboardStats } from '@/types';
import { formatDate, getPriorityColor, getPriorityLabel, isOverdue } from '@/lib/utils';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Code,
  Play,
  CheckCircle,
  Circle,
  ArrowRight,
  Zap,
  Target,
  Calendar,
  Flame,
} from 'lucide-react';

export function DeveloperDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [productivity, setProductivity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes, prodRes] = await Promise.all([
          api.getDashboardStats(),
          api.getTasks({ assigneeId: user?.id, limit: 50 }),
          api.client.get('/statistics/productivity'),
        ]);

        setStats(statsRes.data);
        const tasks = tasksRes.data || tasksRes || [];
        setMyTasks(Array.isArray(tasks) ? tasks : []);
        setProductivity(prodRes.data?.data);
      } catch (error) {
        console.error('Developer dashboard error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Group tasks by status
  const inProgressTasks = myTasks.filter((t: any) => 
    t.stage_name === 'In Progress' || t.stage_name === 'Devam Ediyor'
  );
  const todoTasks = myTasks.filter((t: any) => 
    t.stage_name === 'To Do' || t.stage_name === 'Backlog' || t.stage_name === 'Yapılacak'
  );
  const completedTasks = myTasks.filter((t: any) => 
    t.stage_name === 'Done' || t.stage_name === 'Tamamlandı' || t.completed_at
  );
  const overdueTasks = myTasks.filter((t) => 
    t.due_date && isOverdue(t.due_date) && !t.completed_at
  );

  const completionRate = myTasks.length > 0 
    ? Math.round((completedTasks.length / myTasks.length) * 100) 
    : 0;

  // Get today's tasks
  const today = new Date().toDateString();
  const todayTasks = myTasks.filter(t => 
    t.due_date && new Date(t.due_date).toDateString() === today && !t.completed_at
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Code className="h-6 w-6" />
              <span className="text-emerald-200 text-sm font-medium">Developer</span>
            </div>
            <h1 className="text-2xl font-bold">Merhaba, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-emerald-200 mt-1">Bugün {todayTasks.length} görevin var</p>
          </div>
          <Link href="/dashboard/tasks">
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
              <CheckSquare className="mr-2 h-4 w-4" />
              Tüm Görevler
            </Button>
          </Link>
        </div>

        {/* Progress Ring */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="white"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${completionRate * 2.2} 220`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{completionRate}%</span>
              </div>
            </div>
            <div>
              <p className="text-emerald-200 text-sm">Tamamlanma</p>
              <p className="text-lg font-semibold">{completedTasks.length} / {myTasks.length} görev</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Play className="h-5 w-5 mx-auto mb-1" />
              <p className="text-xl font-bold">{inProgressTasks.length}</p>
              <p className="text-xs text-emerald-200">Devam Eden</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Circle className="h-5 w-5 mx-auto mb-1" />
              <p className="text-xl font-bold">{todoTasks.length}</p>
              <p className="text-xs text-emerald-200">Bekleyen</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto mb-1" />
              <p className="text-xl font-bold">{overdueTasks.length}</p>
              <p className="text-xs text-emerald-200">Geciken</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Warning */}
      {overdueTasks.length > 0 && (
        <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">{overdueTasks.length} Geciken Görev!</p>
                  <p className="text-red-100 text-sm">Bu görevlere öncelik ver</p>
                </div>
              </div>
              <Link href="/dashboard/tasks">
                <Button variant="secondary" size="sm" className="bg-white text-red-600 hover:bg-red-50">
                  Görüntüle
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* In Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-orange-600">
              <Play className="mr-2 h-5 w-5" />
              Üzerinde Çalıştıklarım
              <Badge className="ml-2 bg-orange-100 text-orange-600">{inProgressTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inProgressTasks.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Şu an üzerinde çalıştığın görev yok</p>
                <p className="text-sm text-gray-400 mt-1">Yapılacaklar listesinden bir görev başlat</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inProgressTasks.slice(0, 4).map((task: any) => (
                  <Link key={task.id} href={`/dashboard/projects/${task.project_id}`}>
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 hover:border-orange-300 transition-all hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{task.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{task.project_name}</p>
                        </div>
                        <Badge className={getPriorityColor(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                      {task.due_date && (
                        <div className={`flex items-center mt-3 text-sm ${
                          isOverdue(task.due_date) ? 'text-red-600 font-medium' : 'text-gray-500'
                        }`}>
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(task.due_date)}
                          {isOverdue(task.due_date) && ' ⚠️'}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
                {inProgressTasks.length > 4 && (
                  <Link href="/dashboard/tasks">
                    <Button variant="ghost" className="w-full text-orange-600">
                      +{inProgressTasks.length - 4} daha fazla
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* To Do */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-blue-600">
              <Circle className="mr-2 h-5 w-5" />
              Yapılacaklar
              <Badge className="ml-2 bg-blue-100 text-blue-600">{todoTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todoTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-3" />
                <p className="text-gray-500">Harika! Tüm görevler başlatıldı</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todoTasks.slice(0, 4).map((task: any) => (
                  <Link key={task.id} href={`/dashboard/projects/${task.project_id}`}>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-all hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{task.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{task.project_name}</p>
                        </div>
                        <Badge className={getPriorityColor(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                      {task.due_date && (
                        <div className={`flex items-center mt-3 text-sm ${
                          isOverdue(task.due_date) ? 'text-red-600 font-medium' : 'text-gray-500'
                        }`}>
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(task.due_date)}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
                {todoTasks.length > 4 && (
                  <Link href="/dashboard/tasks">
                    <Button variant="ghost" className="w-full text-blue-600">
                      +{todoTasks.length - 4} daha fazla
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Productivity Stats */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Verimlilik Özeti</p>
                <p className="text-sm text-gray-500">Son 30 günlük performansın</p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{productivity?.completedThisMonth || 0}</p>
                <p className="text-xs text-gray-500">Bu Ay Tamamlanan</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{productivity?.totalAssigned || myTasks.length}</p>
                <p className="text-xs text-gray-500">Toplam Atanan</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{productivity?.avgCompletionDays || 0}</p>
                <p className="text-xs text-gray-500">Ort. Gün</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Completed */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle className="mr-2 h-5 w-5" />
              Son Tamamlananlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {completedTasks.slice(0, 6).map((task: any) => (
                <Badge key={task.id} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {task.title}
                </Badge>
              ))}
              {completedTasks.length > 6 && (
                <Badge variant="outline" className="bg-gray-50">
                  +{completedTasks.length - 6} daha
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
