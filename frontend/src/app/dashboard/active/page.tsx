'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';
import { formatDate, getPriorityColor, getPriorityLabel, isOverdue } from '@/lib/utils';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  ListTodo,
  Target,
} from 'lucide-react';

export default function ActiveTasksPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getTasks({ assigneeId: user?.id, limit: 50 });
        const tasksData = response.data || response || [];
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (error) {
        console.error('Active tasks error:', error);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const activeTasks = tasks.filter((t: any) =>
    t.stage_name === 'In Progress' || t.stage_name === 'Devam Ediyor'
  );

  const todoTasks = tasks.filter((t: any) =>
    t.stage_name === 'To Do' || t.stage_name === 'Backlog' || t.stage_name === 'Yapılacak'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aktif Görevler</h1>
        <p className="text-gray-500">Üzerinde çalıştığın görevler</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Devam eden</p>
                <p className="text-2xl font-bold">{activeTasks.length}</p>
              </div>
              <ListTodo className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bekleyen</p>
                <p className="text-2xl font-bold">{todoTasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Devam eden görevler</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTasks.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Şu an devam eden görev yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTasks.map((task: any) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg border bg-gray-50 hover:bg-gray-100/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <Badge className={getPriorityColor(task.priority)} variant="secondary">
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{task.project_name}</p>
                      {task.due_date && (
                        <div className={`flex items-center text-sm mt-1 ${
                          isOverdue(task.due_date) ? 'text-red-600 font-medium' : 'text-gray-500'
                        }`}>
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {formatDate(task.due_date)}
                          {isOverdue(task.due_date) && (
                            <AlertTriangle className="h-3.5 w-3.5 ml-1 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    <Link href={`/dashboard/projects/${task.project_id}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Başlamaya hazır</CardTitle>
        </CardHeader>
        <CardContent>
          {todoTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Bekleyen görev yok</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todoTasks.slice(0, 8).map((task: any) => (
                <Link key={task.id} href={`/dashboard/projects/${task.project_id}`}>
                  <div className="p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.project_name}</p>
                    </div>
                    <Badge className={getPriorityColor(task.priority)} variant="secondary">
                      {getPriorityLabel(task.priority)}
                    </Badge>
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
