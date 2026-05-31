'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User, Code } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { getInitials } from '@/lib/utils';

export function DeveloperHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Görev Özeti';
    if (pathname.includes('/tasks')) return 'Görevlerim';
    if (pathname.includes('/active')) return 'Aktif Görevler';
    if (pathname.includes('/projects/') && !pathname.endsWith('/projects')) return 'Proje Detayı';
    if (pathname.includes('/projects')) return 'Projeler';
    if (pathname.includes('/team')) return 'Takım';
    if (pathname.includes('/timetrack')) return 'Zaman Takibi';
    if (pathname.includes('/profile')) return 'Profil';
    if (pathname.includes('/settings')) return 'Ayarlar';
    return 'Developer Panel';
  };

  return (
    <header className="h-16 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
          <p className="text-xs text-gray-500">Görev takibi ve geliştirme</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <NotificationDropdown />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 px-2 rounded-xl hover:bg-emerald-100">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 border-2 border-emerald-300">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                  <AvatarFallback className="bg-emerald-600 text-white">{getInitials(user?.name || 'D')}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">Dev</Badge>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                <Badge className="mt-2 w-fit bg-emerald-100 text-emerald-700">
                  <Code className="w-3 h-3 mr-1" />
                  Developer
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Ayarlar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Çıkış Yap</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
