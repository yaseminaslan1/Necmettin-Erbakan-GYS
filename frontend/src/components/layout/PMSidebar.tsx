'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  User,
  Briefcase,
  Calendar,
  Target,
  LogOut,
  Plus,
} from 'lucide-react';

export function PMSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projelerim', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Görevler', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Takvim', href: '/dashboard/calendar', icon: Calendar },
  ];

  const teamNavigation = [
    { name: 'Takım', href: '/dashboard/team', icon: Users },
    { name: 'Hedefler', href: '/dashboard/goals', icon: Target },
    { name: 'Raporlar', href: '/dashboard/statistics', icon: BarChart3 },
  ];

  const accountNavigation = [
    { name: 'Profil', href: '/dashboard/profile', icon: User },
    { name: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-full w-72 flex-col bg-gradient-to-b from-blue-900 to-cyan-900">
      {/* Header */}
      <div className="flex h-20 items-center px-6 border-b border-blue-700/50">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <Briefcase className="h-7 w-7 text-blue-300" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">Necmettin Erbakan GYS</span>
            <p className="text-xs text-blue-300">Proje Yönetimi</p>
          </div>
        </Link>
      </div>

      {/* Quick Action */}
      <div className="px-4 py-4">
        <Link href="/dashboard/projects">
          <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl">
            <Plus className="mr-2 h-5 w-5" />
            Yeni Proje
          </button>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
            Proje Yönetimi
          </p>
          <div className="space-y-1">
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all',
                    isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
            Takım & Raporlar
          </p>
          <div className="space-y-1">
            {teamNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all',
                    isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
            Hesap
          </p>
          <div className="space-y-1">
            {accountNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all',
                    isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-blue-700/50 p-4">
        <div className="flex items-center p-3 bg-white/10 rounded-xl">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <Badge className="mt-1 bg-blue-500/50 text-blue-100 border-0 text-xs">
              <Briefcase className="w-3 h-3 mr-1" />
              Proje Yöneticisi
            </Badge>
          </div>
          <button 
            onClick={() => logout()}
            className="p-2 text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Çıkış Yap"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
