'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Role, Permission } from '@/types';
import { Plus, Shield, Edit, Trash2 } from 'lucide-react';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as number[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, permsRes] = await Promise.all([
          api.getRoles(),
          api.getPermissions(),
        ]);
        setRoles(rolesRes.data);
        setPermissions(permsRes.data);
      } catch (error) {
        console.error('Fetch data error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) return;

    try {
      await api.createRole(newRole);
      const rolesRes = await api.getRoles();
      setRoles(rolesRes.data);
      setNewRole({ name: '', description: '', permissions: [] });
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Create role error:', error);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('Bu rolü silmek istediğinizden emin misiniz?')) return;

    try {
      await api.deleteRole(roleId);
      setRoles(roles.filter((r) => r.id !== roleId));
    } catch (error) {
      console.error('Delete role error:', error);
    }
  };

  const togglePermission = (permId: number) => {
    setNewRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((id) => id !== permId)
        : [...prev.permissions, permId],
    }));
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rol Yönetimi</h2>
          <p className="text-gray-600">Rolleri ve izinleri yönetin</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Rol
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Rol Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Rol Adı</Label>
                <Input
                  id="role-name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="Rol adı"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">Açıklama</Label>
                <Textarea
                  id="role-description"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  placeholder="Rol açıklaması"
                />
              </div>
              <div className="space-y-2">
                <Label>İzinler</Label>
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([module, perms]) => (
                    <div key={module} className="border rounded-lg p-4">
                      <h4 className="font-medium capitalize mb-2">{module}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={newRole.permissions.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              className="rounded"
                            />
                            <span className="text-sm">{perm.description}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleCreateRole}
                disabled={!newRole.name.trim()}
              >
                Rol Oluştur
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg capitalize">{role.name}</CardTitle>
                </div>
                {role.is_system ? (
                  <Badge variant="secondary">Sistem</Badge>
                ) : (
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {role.description || 'Açıklama yok'}
              </p>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">İzinler:</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions?.slice(0, 5).map((perm) => (
                    <Badge key={perm.id} variant="outline" className="text-xs">
                      {perm.name}
                    </Badge>
                  ))}
                  {role.permissions && role.permissions.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 5} daha
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
