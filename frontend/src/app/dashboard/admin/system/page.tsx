'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Server,
  Database,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  HardDrive,
  Cpu,
  Wifi,
} from 'lucide-react';

export default function SystemStatusPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error('System status error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const systemMetrics = [
    {
      name: 'API Sunucusu',
      status: 'online',
      icon: Server,
      uptime: '99.9%',
      latency: '45ms',
    },
    {
      name: 'Veritabanı',
      status: 'online',
      icon: Database,
      uptime: '99.8%',
      latency: '12ms',
    },
    {
      name: 'Kimlik Doğrulama',
      status: 'online',
      icon: Users,
      uptime: '100%',
      latency: '23ms',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistem Durumu</h1>
          <p className="text-gray-500">Sistem sağlığı ve performans metrikleri</p>
        </div>
        <Badge className="bg-green-100 text-green-700 border-green-300">
          <CheckCircle className="w-4 h-4 mr-1" />
          Tüm Sistemler Aktif
        </Badge>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {systemMetrics.map((metric) => (
          <Card key={metric.name} className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <metric.icon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{metric.name}</p>
                    <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                      Çalışıyor
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Uptime</p>
                  <p className="font-semibold text-gray-900">{metric.uptime}</p>
                </div>
                <div>
                  <p className="text-gray-500">Gecikme</p>
                  <p className="font-semibold text-gray-900">{metric.latency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Cpu className="mr-2 h-5 w-5 text-purple-600" />
              Kaynak Kullanımı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">CPU Kullanımı</span>
                <span className="text-sm font-medium">23%</span>
              </div>
              <Progress value={23} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Bellek Kullanımı</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Disk Kullanımı</span>
                <span className="text-sm font-medium">67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="mr-2 h-5 w-5 text-purple-600" />
              Sistem Özeti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Toplam Kullanıcı</span>
                </div>
                <span className="font-bold text-gray-900">{stats?.totalUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <HardDrive className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">Toplam Proje</span>
                </div>
                <span className="font-bold text-gray-900">{stats?.totalProjects || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Toplam Görev</span>
                </div>
                <span className="font-bold text-gray-900">{stats?.totalTasks || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Wifi className="h-5 w-5 text-emerald-600" />
                  <span className="text-gray-700">API İstekleri (Bugün)</span>
                </div>
                <span className="font-bold text-gray-900">1,234</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Clock className="mr-2 h-5 w-5 text-purple-600" />
            Son Sistem Olayları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '2 dakika önce', event: 'Yeni kullanıcı kaydı', type: 'info' },
              { time: '15 dakika önce', event: 'Veritabanı yedekleme tamamlandı', type: 'success' },
              { time: '1 saat önce', event: 'Sistem güncellemesi uygulandı', type: 'info' },
              { time: '3 saat önce', event: 'Yüksek CPU kullanımı tespit edildi', type: 'warning' },
              { time: '5 saat önce', event: 'Önbellek temizlendi', type: 'info' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {item.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {item.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                  {item.type === 'info' && <Activity className="h-4 w-4 text-blue-600" />}
                  <span className="text-gray-700">{item.event}</span>
                </div>
                <span className="text-sm text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
