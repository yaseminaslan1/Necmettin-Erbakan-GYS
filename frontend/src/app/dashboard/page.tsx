'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { 
  AdminDashboard, 
  ProjectManagerDashboard, 
  DeveloperDashboard,
  ViewerDashboard 
} from '@/components/dashboard';

export default function DashboardPage() {
  const { isAdmin, isProjectManager, isDeveloper, isViewer } = usePermissions();

  // Admin paneli - sistem yönetimi ve istatistikler
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Project Manager paneli - proje ve ekip yönetimi
  if (isProjectManager) {
    return <ProjectManagerDashboard />;
  }

  // Developer paneli - görev odaklı
  if (isDeveloper) {
    return <DeveloperDashboard />;
  }

  // Viewer paneli - salt okunur görünüm
  return <ViewerDashboard />;
}
