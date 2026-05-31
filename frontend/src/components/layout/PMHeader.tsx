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
import { LogOut, Settings, User, Briefcase } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { getInitials } from '@/lib/utils';

export function PMHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Proje Özeti';
    if (pathname.includes('/projects/') && !pathname.endsWith('/projects')) return 'Proje Detayı';
    if (pathname.includes('/projects')) return 'Projelerim';
    if (pathname.includes('/tasks')) return 'Görevler';
    if (pathname.includes('/team')) return 'Takım';
    if (pathname.includes('/statistics')) return 'Raporlar';
    if (pathname.includes('/calendar')) return 'Takvim';
    if (pathname.includes('/goals')) return 'Hedefler';
    if (pathname.includes('/profile')) return 'Profil';
    if (pathname.includes('/settings')) return 'Ayarlar';
    return 'Proje Yönetimi';
  };

  return (
    <header className="h-16 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
          <p className="text-xs text-gray-500">Proje ve ekip yönetimi</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <NotificationDropdown />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 px-2 rounded-xl hover:bg-blue-100">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 border-2 border-blue-300">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                  <AvatarFallback className="bg-blue-600 text-white">{getInitials(user?.name || 'PM')}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">PM</Badge>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                <Badge className="mt-2 w-fit bg-blue-100 text-blue-700">
                  <Briefcase className="w-3 h-3 mr-1" />
                  Proje Yöneticisi
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
