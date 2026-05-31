'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DashboardStats,
  TasksByStatus,
  TasksByPriority,
  CompletionTrend,
  UserProductivity,
} from '@/types';
import { formatDate } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
  Shield,
  Briefcase,
  Code,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function StatisticsPage() {
  const { isAdmin, isProjectManager } = usePermissions();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasksByStatus, setTasksByStatus] = useState<any[]>([]); // Tipi any[] yaptık birleştirme için
  const [tasksByPriority, setTasksByPriority] = useState<TasksByPriority[]>([]);
  const [trend, setTrend] = useState<CompletionTrend[]>([]);
  const [productivity, setProductivity] = useState<UserProductivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let productivityParams = {};
        if (isAdmin) {
          productivityParams = { system: 'true' };
        } else if (isProjectManager) {
          productivityParams = { role: 'pm' };
        }
        
        const [statsRes, statusRes, priorityRes, trendRes, prodRes] = await Promise.all([
          api.getDashboardStats(),
          api.getTasksByStatus(),
          api.getTasksByPriority(),
          api.getCompletionTrend(),
          api.client.get('/statistics/productivity', { params: productivityParams }),
        ]);

        setStats(statsRes.data);

        // --- ÇİFT SÜTUNU BİRLEŞTİREN SİHİRLİ ALGORİTMA BAŞLANGICI ---
        const rawTasks = statusRes.data || [];
        const groupedMap: { [key: string]: any } = {};

        rawTasks.forEach((task: any) => {
          const stageName = task.stage || 'Belirsiz';
          
          if (groupedMap[stageName]) {
            // Eğer "To Do" zaten varsa, gelen count değerini üzerine ekle (1 + 1 = 2 yapar)
            groupedMap[stageName].count += Number(task.count || 1);
          } else {
            // İlk defa karşılaşıyorsa listeye ekle
            groupedMap[stageName] = {
              stage: stageName,
              count: Number(task.count || 1),
              color: task.color || '#3b82f6'
            };
          }
        });

        // Gruplanmış nesneyi grafiğin okuyacağı temiz diziye çeviriyoruz
        setTasksByStatus(Object.values(groupedMap));
        // --- ÇİFT SÜTUNU BİRLEŞTİREN SİHİRLİ ALGORİTMA BİTİŞİ ---

        setTasksByPriority(priorityRes.data || []);
        setTrend(trendRes.data || []);
        setProductivity(prodRes.data?.data);
      } catch (error) {
        console.error('Fetch statistics error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, isProjectManager]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getRoleBadge = () => {
    if (isAdmin) return { label: 'Sistem Geneli', icon: Shield, color: 'text-purple-600 border-purple-600' };
    if (isProjectManager) return { label: 'Proje Yöneticisi', icon: Briefcase, color: 'text-blue-600 border-blue-600' };
    return { label: 'Kişisel', icon: Code, color: 'text-green-600 border-green-600' };
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">İstatistikler</h2>
          <p className="text-gray-600">
            {isAdmin ? 'Sistem genelinde performance analizi' : 'Detaylı performans analizi'}
          </p>
        </div>
        <Badge variant="outline" className={roleBadge.color}>
          <roleBadge.icon className="w-4 h-4 mr-1" />
          {roleBadge.label}
        </Badge>
      </div>

      {/* Productivity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isAdmin ? 'Sistemdeki Atanan' : isProjectManager ? 'Projelerdeki Görevler' : 'Bana Atanan'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {productivity?.totalAssigned || 0}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bu Ay Tamamlanan</p>
                <p className="text-3xl font-bold text-gray-900">
                  {productivity?.completedThisMonth || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isAdmin ? 'Sistemde Devam Eden' : isProjectManager ? 'Projelerde Devam Eden' : 'Devam Eden'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {productivity?.inProgress || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ort. Tamamlama</p>
                <p className="text-3xl font-bold text-gray-900">
                  {productivity?.avgCompletionDays || 0} gün
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Duruma Göre Görevler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" name="Görev Sayısı">
                    {tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Önceliğe Göre Görevler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksByPriority}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ priority, count }) => `${priority}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {tasksByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Tamamlama Trendi (Son 30 Gün)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                    })
                  }
                  fontSize={12}
                />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value: number) => [value, 'Tamamlanan']}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Genel İlerleme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tamamlanma Oranı</span>
                <span className="text-sm font-bold">{stats?.completionRate || 0}%</span>
              </div>
              <Progress value={stats?.completionRate || 0} className="h-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats?.totalProjects || 0}</p>
                <p className="text-sm text-gray-600">Toplam Proje</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats?.completedTasks || 0}</p>
                <p className="text-sm text-gray-600">Tamamlanan</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{stats?.myTasks || 0}</p>
                <p className="text-sm text-gray-600">Benim Görevlerim</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{stats?.overdueTasks || 0}</p>
                <p className="text-sm text-gray-600">Geciken</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}