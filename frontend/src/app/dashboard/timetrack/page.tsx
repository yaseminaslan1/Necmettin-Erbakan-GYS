'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Task } from '@/types';
import {
  Clock,
  Play,
  Pause,
  Calendar,
  TrendingUp,
  Timer,
  BarChart3,
  Coffee,
} from 'lucide-react';

export default function TimeTrackPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getTasks({ assigneeId: user?.id, limit: 50 });
        const tasksData = response.data || response || [];
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (error) {
        console.error('Time track error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  const resetTimer = () => {
    setIsTracking(false);
    setCurrentTime(0);
    setSelectedTask(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Sample time entries - in a real app, these would come from the backend
  const todayEntries = [
    { task: 'API Entegrasyonu', project: 'E-Ticaret', duration: 7200, startTime: '09:00' },
    { task: 'Bug Fix #123', project: 'CRM Sistemi', duration: 3600, startTime: '11:30' },
    { task: 'Code Review', project: 'E-Ticaret', duration: 1800, startTime: '14:00' },
  ];

  const weeklyStats = [
    { day: 'Pzt', hours: 8 },
    { day: 'Sal', hours: 7.5 },
    { day: 'Çar', hours: 8.5 },
    { day: 'Per', hours: 6 },
    { day: 'Cum', hours: 4 },
    { day: 'Cmt', hours: 0 },
    { day: 'Paz', hours: 0 },
  ];

  const totalToday = todayEntries.reduce((acc, entry) => acc + entry.duration, 0);
  const totalWeek = weeklyStats.reduce((acc, day) => acc + day.hours, 0);

  const activeTasks = tasks.filter((t: any) => 
    !t.completed_at && (t.stage_name === 'In Progress' || t.stage_name === 'To Do' || t.stage_name === 'Backlog')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zaman Takibi</h1>
          <p className="text-gray-500">Çalışma sürelerini takip et</p>
        </div>
      </div>

      {/* Timer Card */}
      <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-emerald-200 text-sm mb-2">Geçen Süre</p>
                <p className="text-5xl font-mono font-bold">{formatTime(currentTime)}</p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <select
                  value={selectedTask || ''}
                  onChange={(e) => setSelectedTask(Number(e.target.value) || null)}
                  className="bg-white/20 text-white border-0 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-white/50"
                  disabled={isTracking}
                >
                  <option value="">Görev seçin...</option>
                  {activeTasks.map((task: any) => (
                    <option key={task.id} value={task.id} className="text-gray-900">
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                size="lg"
                onClick={toggleTracking}
                disabled={!selectedTask && !isTracking}
                className={`${
                  isTracking 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-white text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {isTracking ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Durdur
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Başlat
                  </>
                )}
              </Button>
              {currentTime > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={resetTimer}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  Sıfırla
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bugün</p>
                <p className="text-xl font-bold">{formatTime(totalToday)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bu Hafta</p>
                <p className="text-xl font-bold">{totalWeek}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ortalama</p>
                <p className="text-xl font-bold">7.2s/gün</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Coffee className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mola</p>
                <p className="text-xl font-bold">45dk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="mr-2 h-5 w-5 text-emerald-600" />
              Bugünkü Kayıtlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayEntries.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Henüz kayıt yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEntries.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{entry.task}</p>
                      <p className="text-sm text-gray-500">{entry.project}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-medium text-gray-900">{formatTime(entry.duration)}</p>
                      <p className="text-xs text-gray-500">{entry.startTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
              Haftalık Özet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyStats.map((day, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="w-8 text-sm text-gray-500">{day.day}</span>
                  <div className="flex-1">
                    <Progress value={(day.hours / 10) * 100} className="h-6" />
                  </div>
                  <span className="w-12 text-right text-sm font-medium">{day.hours}s</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
              <span className="text-gray-500">Toplam</span>
              <span className="font-bold">{totalWeek} saat</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
