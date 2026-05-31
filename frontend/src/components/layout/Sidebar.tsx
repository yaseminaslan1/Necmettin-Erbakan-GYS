'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { usePermissions } from '@/hooks/usePermissions';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  Shield,
  UserCog,
  User,
  Lock,
  Code,
  Briefcase,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { 
    isAdmin, 
    isProjectManager,
    isDeveloper,
    canViewProjects, 
    canViewTasks, 
    canViewUsers, 
    canViewStatistics,
    canViewRoles 
  } = usePermissions();

  // Admin navigation - sadece istatistikler ve yönetim
  const adminNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, enabled: true },
    { name: 'İstatistikler', href: '/dashboard/statistics', icon: BarChart3, enabled: true },
  ];

  // Project Manager navigation - proje ve görev yönetimi
  const pmNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, enabled: true },
    { name: 'Projeler', href: '/dashboard/projects', icon: FolderKanban, enabled: canViewProjects },
    { name: 'Görevlerim', href: '/dashboard/tasks', icon: CheckSquare, enabled: canViewTasks },
    { name: 'Takım', href: '/dashboard/team', icon: Users, enabled: canViewUsers },
    { name: 'İstatistikler', href: '/dashboard/statistics', icon: BarChart3, enabled: canViewStatistics },
  ];

  // Developer navigation - görev odaklı
  const devNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, enabled: true },
    { name: 'Görevlerim', href: '/dashboard/tasks', icon: CheckSquare, enabled: canViewTasks },
    { name: 'Projeler', href: '/dashboard/projects', icon: FolderKanban, enabled: canViewProjects },
    { name: 'Takım', href: '/dashboard/team', icon: Users, enabled: canViewUsers },
  ];

  // Select navigation based on role
  let navigation = devNavItems; // Default
  if (isAdmin) {
    navigation = adminNavItems;
  } else if (isProjectManager) {
    navigation = pmNavItems;
  } else if (isDeveloper) {
    navigation = devNavItems;
  }

  const accountNavigation = [
    { name: 'Profil', href: '/dashboard/profile', icon: User, enabled: true },
    { name: 'Ayarlar', href: '/dashboard/settings', icon: Settings, enabled: true },
  ];

  const adminManagementNav = [
    { name: 'Kullanıcılar', href: '/dashboard/admin/users', icon: UserCog, enabled: canViewUsers },
    { name: 'Roller', href: '/dashboard/admin/roles', icon: Shield, enabled: canViewRoles },
  ];

  // Get role badge info
  const getRoleBadge = () => {
    if (isAdmin) return { label: 'Admin', icon: Shield, color: 'bg-purple-600' };
    if (isProjectManager) return { label: 'Project Manager', icon: Briefcase, color: 'bg-blue-600' };
    if (isDeveloper) return { label: 'Developer', icon: Code, color: 'bg-green-600' };
    return { label: 'Viewer', icon: User, color: 'bg-gray-600' };
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <FolderKanban className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-white">Necmettin Erbakan GYS</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          if (!item.enabled) {
            return (
              <div
                key={item.name}
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 cursor-not-allowed"
                title="Bu özellik için yetkiniz yok"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
                <Lock className="ml-auto h-4 w-4" />
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {/* Account Section */}
        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Hesap
          </p>
        </div>
        {accountNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Yönetim
              </p>
            </div>
            {adminManagementNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`h-10 w-10 rounded-full ${roleBadge.color} flex items-center justify-center`}>
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <div className="flex items-center gap-1 mt-1">
              <Badge 
                variant="secondary" 
                className={`text-xs ${roleBadge.color} text-white border-0`}
              >
                <roleBadge.icon className="w-3 h-3 mr-1" />
                {roleBadge.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
