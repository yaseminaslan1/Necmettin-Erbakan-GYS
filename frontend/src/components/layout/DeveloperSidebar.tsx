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
  Settings,
  User,
  Code,
  Zap,
  LogOut,
  ListTodo,
} from 'lucide-react';

export function DeveloperSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Görevlerim', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Aktif Görevler', href: '/dashboard/active', icon: ListTodo },
  ];

  const projectNavigation = [
    { name: 'Projeler', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Takım', href: '/dashboard/team', icon: Users },
  ];

  const accountNavigation = [
    { name: 'Profil', href: '/dashboard/profile', icon: User },
    { name: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-emerald-900 to-teal-900">
      {/* Header */}
      <div className="flex h-20 items-center px-6 border-b border-emerald-700/50">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <Code className="h-7 w-7 text-emerald-300" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">Necmettin Erbakan GYS</span>
            <p className="text-xs text-emerald-300">Developer</p>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <Zap className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-xs text-emerald-200">Aktif</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <CheckSquare className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xs text-emerald-200">Görevler</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
            Görevler
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
                      : 'text-emerald-200 hover:bg-white/10 hover:text-white'
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
          <p className="px-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
            Projeler & Takım
          </p>
          <div className="space-y-1">
            {projectNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all',
                    isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-emerald-200 hover:bg-white/10 hover:text-white'
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
          <p className="px-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
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
                      : 'text-emerald-200 hover:bg-white/10 hover:text-white'
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
      <div className="border-t border-emerald-700/50 p-4">
        <div className="flex items-center p-3 bg-white/10 rounded-xl">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <Badge className="mt-1 bg-emerald-500/50 text-emerald-100 border-0 text-xs">
              <Code className="w-3 h-3 mr-1" />
              Developer
            </Badge>
          </div>
          <button 
            onClick={() => logout()}
            className="p-2 text-emerald-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Çıkış Yap"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
