'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';
import { formatDate, getPriorityColor, getPriorityLabel, isOverdue } from '@/lib/utils';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckSquare,
} from 'lucide-react';

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getTasks({ limit: 100 });
        const tasksData = response.data || response || [];
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (error) {
        console.error('Calendar error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const getTasksForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = new Date(year, month, day).toDateString();
    
    return tasks.filter(task => {
      if (!task.due_date) return false;
      return new Date(task.due_date).toDateString() === dateStr;
    });
  };

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get upcoming tasks for sidebar
  const upcomingTasks = tasks
    .filter(t => t.due_date && new Date(t.due_date) >= today && !t.completed_at)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Takvim</h1>
          <p className="text-gray-500">Görev tarihlerini takip edin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Bugün
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before the first day of month */}
              {Array.from({ length: startingDay }, (_, i) => (
                <div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-lg" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayTasks = getTasksForDay(day);
                const hasOverdue = dayTasks.some(t => isOverdue(t.due_date!));

                return (
                  <div
                    key={day}
                    className={`h-24 p-1 rounded-lg border transition-colors ${
                      isToday(day)
                        ? 'bg-blue-50 border-blue-300'
                        : hasOverdue
                        ? 'bg-red-50 border-red-200'
                        : dayTasks.length > 0
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday(day) ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      {dayTasks.slice(0, 2).map((task: any) => (
                        <div
                          key={task.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${
                            isOverdue(task.due_date)
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-gray-500 px-1">
                          +{dayTasks.length - 2} daha
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks Sidebar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Clock className="mr-2 h-5 w-5 text-blue-600" />
              Yaklaşan Görevler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Yaklaşan görev yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border ${
                      isOverdue(task.due_date)
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <p className="font-medium text-gray-900 text-sm truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{task.project_name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {getPriorityLabel(task.priority)}
                      </Badge>
                      <span className={`text-xs ${
                        isOverdue(task.due_date) ? 'text-red-600 font-medium' : 'text-gray-500'
                      }`}>
                        {formatDate(task.due_date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
