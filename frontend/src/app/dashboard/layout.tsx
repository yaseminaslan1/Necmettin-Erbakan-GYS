'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { usePermissions } from '@/hooks/usePermissions';
import { Menu, X } from 'lucide-react';

// Role-specific layouts
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { PMSidebar } from '@/components/layout/PMSidebar';
import { DeveloperSidebar } from '@/components/layout/DeveloperSidebar';
import { ViewerSidebar } from '@/components/layout/ViewerSidebar';

import { AdminHeader } from '@/components/layout/AdminHeader';
import { PMHeader } from '@/components/layout/PMHeader';
import { DeveloperHeader } from '@/components/layout/DeveloperHeader';
import { ViewerHeader } from '@/components/layout/ViewerHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { isAdmin, isProjectManager, isDeveloper } = usePermissions();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Select layout based on role
  const getSidebar = () => {
    if (isAdmin) return <AdminSidebar />;
    if (isProjectManager) return <PMSidebar />;
    if (isDeveloper) return <DeveloperSidebar />;
    return <ViewerSidebar />;
  };

  const getHeader = () => {
    if (isAdmin) return <AdminHeader />;
    if (isProjectManager) return <PMHeader />;
    if (isDeveloper) return <DeveloperHeader />;
    return <ViewerHeader />;
  };

  const getBackgroundColor = () => {
    if (isAdmin) return 'bg-purple-50/30';
    if (isProjectManager) return 'bg-blue-50/30';
    if (isDeveloper) return 'bg-emerald-50/30';
    return 'bg-slate-50/30';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex">{getSidebar()}</aside>

      {/* Mobile Sidebar Trigger */}
      <button
        type="button"
        onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
        className="md:hidden fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 shadow-lg"
        aria-label="Menüyü aç"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Menüyü kapat"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`md:hidden fixed left-0 top-0 z-50 h-full transform transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md bg-black/20 text-white"
          aria-label="Drawer kapat"
        >
          <X className="h-4 w-4" />
        </button>
        {getSidebar()}
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {getHeader()}
        <main className={`flex-1 overflow-y-auto p-6 ${getBackgroundColor()}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
