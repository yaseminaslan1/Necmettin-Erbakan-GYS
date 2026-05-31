'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  Plus,
  Flag,
  Award,
  Zap,
  Edit,
  Trash2,
  Star,
  Trophy,
  Medal,
  Rocket,
} from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  type: 'tasks' | 'completion' | 'overdue' | 'custom';
  status: 'in_progress' | 'completed';
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  earned: boolean;
  progress: number;
}

export default function GoalsPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newGoal, setNewGoal] = useState<{
    title: string;
    description: string;
    targetValue: number;
    type: Goal['type'];
  }>({
    title: '',
    description: '',
    targetValue: 10,
    type: 'tasks',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, goalsRes, achievementsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getGoals(),
        api.getAchievements(),
      ]);

      setStats(statsRes.data);
      setGoals(goalsRes.data || []);
      setAchievements(achievementsRes.data || []);
    } catch (error) {
      console.error('Goals error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getGoalProgress = (goal: Goal) => {
    if (goal.type === 'overdue') {
      if (goal.current_value === 0) return 100;
      return Math.max(0, 100 - (goal.current_value * 20));
    }
    if (goal.target_value === 0) return 0;
    return Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
  };

  const handleAddGoal = async () => {
    if (!newGoal.title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await api.createGoal({
        title: newGoal.title,
        description: newGoal.description,
        targetValue: newGoal.targetValue,
        type: newGoal.type,
      });

      setNewGoal({ title: '', description: '', targetValue: 10, type: 'tasks' });
      setIsAddOpen(false);
      await fetchData();
    } catch (error) {
      console.error('Create goal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGoal = async () => {
    if (!selectedGoal || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await api.updateGoal(selectedGoal.id, {
        title: selectedGoal.title,
        description: selectedGoal.description,
        targetValue: selectedGoal.target_value,
        type: selectedGoal.type,
      });

      setIsEditOpen(false);
      setSelectedGoal(null);
      await fetchData();
    } catch (error) {
      console.error('Update goal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await api.deleteGoal(goalId);
      await fetchData();
    } catch (error) {
      console.error('Delete goal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (goal: Goal) => {
    setSelectedGoal({ ...goal });
    setIsEditOpen(true);
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'tasks': return CheckCircle;
      case 'completion': return TrendingUp;
      case 'overdue': return Clock;
      default: return Target;
    }
  };

  const getGoalColor = (type: string) => {
    switch (type) {
      case 'tasks': return 'blue';
      case 'completion': return 'green';
      case 'overdue': return 'orange';
      default: return 'purple';
    }
  };

  const getAchievementIcon = (id: number) => {
    const icons: { [key: number]: any } = {
      1: Flag,
      2: Target,
      3: Rocket,
      4: Star,
      5: TrendingUp,
      6: Trophy,
      7: Medal,
      8: Zap,
    };
    return icons[id] || Award;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completionRate = stats?.completionRate || 0;
  const earnedCount = achievements.filter(a => a.earned).length;
  const activeGoals = goals.filter(g => g.status === 'in_progress').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hedefler</h1>
          <p className="text-gray-500">Performans hedeflerinizi takip edin</p>
        </div>
      </div>

      {/* OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <Target className="h-8 w-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{activeGoals}</p>
            <p className="text-blue-100 text-sm">Aktif Hedef</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <CheckCircle className="h-8 w-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{completedGoals}</p>
            <p className="text-green-100 text-sm">Tamamlanan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <TrendingUp className="h-8 w-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{completionRate}%</p>
            <p className="text-purple-100 text-sm">Genel İlerleme</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <Award className="h-8 w-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{earnedCount}/{achievements.length}</p>
            <p className="text-orange-100 text-sm">Başarı Rozeti</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5 text-blue-600" />
            Hedeflerim
          </CardTitle>
          <Button onClick={() => setIsAddOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Hedef Ekle
          </Button>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Henüz hedef eklenmemiş</p>
              <Button onClick={() => setIsAddOpen(true)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                İlk Hedefinizi Ekleyin
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const GoalIcon = getGoalIcon(goal.type);
                const color = getGoalColor(goal.type);
                const progress = getGoalProgress(goal);

                return (
                  <div key={goal.id} className={`p-4 rounded-xl border-2 ${
                    goal.status === 'completed' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          color === 'blue' ? 'bg-blue-100' :
                          color === 'green' ? 'bg-green-100' :
                          color === 'orange' ? 'bg-orange-100' : 'bg-purple-100'
                        }`}>
                          <GoalIcon className={`h-5 w-5 ${
                            color === 'blue' ? 'text-blue-600' :
                            color === 'green' ? 'text-green-600' :
                            color === 'orange' ? 'text-orange-600' : 'text-purple-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{goal.title}</p>
                          <p className="text-sm text-gray-500">{goal.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                          {goal.status === 'completed' ? '✓ Tamamlandı' : 'Devam Ediyor'}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(goal)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">İlerleme</span>
                        <span className="font-medium">
                          {goal.type === 'overdue' 
                            ? `${goal.current_value} geciken (hedef: ${goal.target_value})`
                            : `${goal.current_value} / ${goal.target_value}`
                          }
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5 text-yellow-600" />
            Başarı Rozetleri ({earnedCount}/{achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement) => {
              const AchievementIcon = getAchievementIcon(achievement.id);
              
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl text-center transition-all ${
                    achievement.earned
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-md'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                    achievement.earned
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg'
                      : 'bg-gray-200'
                  }`}>
                    <AchievementIcon className={`h-7 w-7 ${achievement.earned ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <p className={`font-semibold text-sm ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                    {achievement.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                  
                  {!achievement.earned && (
                    <div className="mt-2">
                      <Progress value={achievement.progress} className="h-1" />
                      <p className="text-xs text-gray-400 mt-1">{Math.round(achievement.progress)}%</p>
                    </div>
                  )}
                  
                  {achievement.earned && (
                    <Badge className="mt-2 bg-yellow-100 text-yellow-700 border-0">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Kazanıldı
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Goal Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Yeni Hedef Ekle
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Hedef Başlığı</Label>
              <Input
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="Örn: Aylık 30 görev tamamla"
              />
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Hedefin açıklaması..."
              />
            </div>
            <div className="space-y-2">
              <Label>Hedef Türü</Label>
              <Select
                value={newGoal.type}
                onValueChange={(value) => setNewGoal({ ...newGoal, type: value as Goal['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tasks">Görev Tamamlama (Bu Ay)</SelectItem>
                  <SelectItem value="completion">Tamamlama Oranı (%)</SelectItem>
                  <SelectItem value="overdue">Geciken Görev Sayısı</SelectItem>
                  <SelectItem value="custom">Özel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hedef Değer</Label>
              <Input
                type="number"
                value={newGoal.targetValue}
                onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) || 0 })}
                min={0}
              />
              <p className="text-xs text-gray-500">
                {(newGoal.type as any) === 'tasks' && 'Bu ay tamamlanması gereken görev sayısı'}
                {(newGoal.type as any) === 'completion' && 'Hedeflenen tamamlama yüzdesi'}
                {(newGoal.type as any) === 'overdue' && 'Maksimum geciken görev sayısı (0 = hiç gecikme olmamalı)'}
                {(newGoal.type as any) === 'custom' && 'Özel hedef değeri'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>İptal</Button>
            <Button onClick={handleAddGoal} disabled={!newGoal.title.trim() || isSubmitting}>
              {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="mr-2 h-5 w-5" />
              Hedefi Düzenle
            </DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Hedef Başlığı</Label>
                <Input
                  value={selectedGoal.title}
                  onChange={(e) => setSelectedGoal({ ...selectedGoal, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Textarea
                  value={selectedGoal.description || ''}
                  onChange={(e) => setSelectedGoal({ ...selectedGoal, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hedef Türü</Label>
                <Select
                  value={selectedGoal.type}
                  onValueChange={(value) => setSelectedGoal({ ...selectedGoal, type: value as Goal['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tasks">Görev Tamamlama (Bu Ay)</SelectItem>
                    <SelectItem value="completion">Tamamlama Oranı (%)</SelectItem>
                    <SelectItem value="overdue">Geciken Görev Sayısı</SelectItem>
                    <SelectItem value="custom">Özel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hedef Değer</Label>
                <Input
                  type="number"
                  value={selectedGoal.target_value}
                  onChange={(e) => setSelectedGoal({ ...selectedGoal, target_value: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Mevcut Değer: <span className="font-semibold">{selectedGoal.current_value}</span>
                </p>
                <p className="text-sm text-gray-600">
                  İlerleme: <span className="font-semibold">{getGoalProgress(selectedGoal)}%</span>
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>İptal</Button>
            <Button onClick={handleEditGoal} disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}