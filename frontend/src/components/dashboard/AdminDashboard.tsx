'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User } from '@/types';
import {
  Users,
  FolderKanban,
  CheckSquare,
  Shield,
  TrendingUp,
  Activity,
  UserCheck,
  AlertTriangle,
  Settings,
  BarChart3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [tasksByStatus, setTasksByStatus] = useState<any[]>([]);
  const [tasksByPriority, setTasksByPriority] = useState<any[]>([]);
  const [completionTrend, setCompletionTrend] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, statusRes, priorityRes, trendRes, usersRes] = await Promise.all([
          api.getDashboardStats(),
          api.getTasksByStatus(),
          api.getTasksByPriority(),
          api.getCompletionTrend(),
          api.getUsers({ limit: 5 }),
        ]);

        setStats(dashboardRes.data);
        setTasksByStatus(statusRes.data || []);
        setTasksByPriority(priorityRes.data || []);
        setCompletionTrend(trendRes.data || []);
        
        const users = usersRes.data || usersRes || [];
        setRecentUsers(Array.isArray(users) ? users : []);
      } catch (error) {
        console.error('Admin dashboard error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-6 w-6" />
              <span className="text-purple-200 text-sm font-medium">Admin Paneli</span>
            </div>
            <h1 className="text-2xl font-bold">Sistem Yönetimi</h1>
            <p className="text-purple-200 mt-1">Tüm sistem istatistikleri ve yönetim araçları</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/dashboard/admin/users">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                <Users className="mr-2 h-4 w-4" />
                Kullanıcılar
              </Button>
            </Link>
            <Link href="/dashboard/statistics">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                <BarChart3 className="mr-2 h-4 w-4" />
                Detaylı İstatistik
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-blue-600" />
              <ArrowUpRight className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-2">{stats?.totalUsers || 0}</p>
            <p className="text-xs text-blue-600">Toplam Kullanıcı</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <UserCheck className="h-8 w-8 text-green-600" />
              <Badge className="bg-green-600 text-xs">Aktif</Badge>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-2">{stats?.activeUsers || stats?.totalUsers || 0}</p>
            <p className="text-xs text-green-600">Aktif Kullanıcı</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <FolderKanban className="h-8 w-8 text-purple-600" />
              <ArrowUpRight className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-2">{stats?.totalProjects || 0}</p>
            <p className="text-xs text-purple-600">Toplam Proje</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CheckSquare className="h-8 w-8 text-orange-600" />
              <span className="text-xs text-orange-600">{stats?.completionRate || 0}%</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-2">{stats?.totalTasks || 0}</p>
            <p className="text-xs text-orange-600">Toplam Görev</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-emerald-600" />
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-900 mt-2">{stats?.completedTasks || 0}</p>
            <p className="text-xs text-emerald-600">Tamamlanan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              {(stats?.overdueTasks || 0) > 0 && (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className="text-2xl font-bold text-red-900 mt-2">{stats?.overdueTasks || 0}</p>
            <p className="text-xs text-red-600">Geciken</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="mr-2 h-4 w-4 text-indigo-600" />
              Görev Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="stage"
                  >
                    {tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {tasksByStatus.slice(0, 4).map((item, index) => (
                <div key={index} className="flex items-center text-xs">
                  <div 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-600">{item.stage}: {item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completion Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
              Tamamlanma Trendi (Son 14 Gün)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={completionTrend.slice(-14)}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { day: 'numeric' })}
                    fontSize={10}
                    stroke="#9ca3af"
                  />
                  <YAxis fontSize={10} stroke="#9ca3af" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('tr-TR')}
                    formatter={(value: number) => [value, 'Tamamlanan']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Öncelik Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksByPriority} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" fontSize={10} stroke="#9ca3af" />
                  <YAxis 
                    dataKey="priority" 
                    type="category" 
                    fontSize={10} 
                    stroke="#9ca3af"
                    allowDecimals={false}
                    tickFormatter={(value) => 
                      value === 'urgent' ? 'Acil' :
                      value === 'high' ? 'Yüksek' :
                      value === 'medium' ? 'Orta' : 'Düşük'
                    }
                  />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {tasksByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Son Kullanıcılar</CardTitle>
            <Link href="/dashboard/admin/users">
              <Button variant="ghost" size="sm" className="text-xs">
                Tümünü Gör
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">Kullanıcı bulunamadı</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.roles?.map((role) => (
                        <Badge 
                          key={role.id} 
                          variant="outline" 
                          className={`text-xs ${
                            role.name === 'admin' ? 'border-purple-300 text-purple-600' :
                            role.name === 'project_manager' ? 'border-blue-300 text-blue-600' :
                            'border-green-300 text-green-600'
                          }`}
                        >
                          {role.name === 'admin' ? 'Admin' :
                           role.name === 'project_manager' ? 'PM' : 'Dev'}
                        </Badge>
                      ))}
                      <Badge variant={user.is_active ? 'default' : 'secondary'} className="text-xs">
                        {user.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Sistem Durumu</p>
                <p className="text-sm text-gray-500">Tüm sistemler normal çalışıyor</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <p className="font-bold text-gray-900">{stats?.completionRate || 0}%</p>
                <p className="text-gray-500">Verimlilik</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">{stats?.totalProjects || 0}</p>
                <p className="text-gray-500">Aktif Proje</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">{(stats?.totalTasks || 0) - (stats?.completedTasks || 0)}</p>
                <p className="text-gray-500">Bekleyen</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}