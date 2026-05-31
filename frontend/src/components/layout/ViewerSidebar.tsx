'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Settings,
  User,
  Eye,
  LogOut,
  Info,
} from 'lucide-react';

export function ViewerSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projeler', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Raporlar', href: '/dashboard/statistics', icon: BarChart3 },
  ];

  const accountNavigation = [
    { name: 'Profil', href: '/dashboard/profile', icon: User },
    { name: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-slate-800 to-gray-900">
      {/* Header */}
      <div className="flex h-20 items-center px-6 border-b border-slate-700/50">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <Eye className="h-7 w-7 text-slate-300" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">Necmettin Erbakan GYS</span>
            <p className="text-xs text-slate-400">Görüntüleyici</p>
          </div>
        </Link>
      </div>

      {/* Info Banner */}
      <div className="px-4 py-4">
        <div className="bg-blue-500/20 rounded-xl p-3 border border-blue-500/30">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-200">
              Salt okunur erişim. Projeleri ve raporları görüntüleyebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Görüntüleme
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
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
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
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
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
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
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
      <div className="border-t border-slate-700/50 p-4">
        <div className="flex items-center p-3 bg-white/5 rounded-xl">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <Badge className="mt-1 bg-slate-600/50 text-slate-300 border-0 text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Görüntüleyici
            </Badge>
          </div>
          <button 
            onClick={() => logout()}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Çıkış Yap"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
