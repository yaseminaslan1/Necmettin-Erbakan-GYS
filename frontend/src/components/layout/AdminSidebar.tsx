'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Shield,
  UserCog,
  User,
  Activity,
  LogOut,
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'İstatistikler', href: '/dashboard/statistics', icon: BarChart3 },
    { name: 'Sistem Durumu', href: '/dashboard/admin/system', icon: Activity },
  ];

  const managementNavigation = [
    { name: 'Kullanıcılar', href: '/dashboard/admin/users', icon: UserCog },
  ];

  const accountNavigation = [
    { name: 'Profil', href: '/dashboard/profile', icon: User },
    { name: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-full w-72 flex-col bg-gradient-to-b from-purple-900 to-indigo-900">
      {/* Header */}
      <div className="flex h-20 items-center px-6 border-b border-purple-700/50">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <Shield className="h-7 w-7 text-purple-300" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">Necmettin Erbakan GYS</span>
            <p className="text-xs text-purple-300">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
            Genel Bakış
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
                      : 'text-purple-200 hover:bg-white/10 hover:text-white'
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
          <p className="px-3 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
            Yönetim
          </p>
          <div className="space-y-1">
            {managementNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all',
                    isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-purple-200 hover:bg-white/10 hover:text-white'
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
          <p className="px-3 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
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
                      : 'text-purple-200 hover:bg-white/10 hover:text-white'
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
      <div className="border-t border-purple-700/50 p-4">
        <div className="flex items-center p-3 bg-white/10 rounded-xl">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <Badge className="mt-1 bg-purple-500/50 text-purple-100 border-0 text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          </div>
          <button 
            onClick={() => logout()}
            className="p-2 text-purple-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Çıkış Yap"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
