'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Role } from '@/types';
import { getInitials, formatDate } from '@/lib/utils';
import { 
  Search, 
  MoreVertical, 
  Trash2, 
  Ban, 
  Check, 
  AlertTriangle,
  Shield,
  UserCog,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      const usersRes = await api.getUsers({ limit: 100 });
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          api.getUsers({ limit: 100 }),
          api.getRoles(),
        ]);
        setUsers(usersRes.data || []);
        setRoles(rolesRes.data || []);
      } catch (error) {
        console.error('Fetch data error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = async (userId: number) => {
    try {
      await api.toggleUserStatus(userId);
      await fetchUsers();
    } catch (error) {
      console.error('Toggle status error:', error);
    }
  };

  const handleAssignRole = async (userId: number, roleId: number) => {
    try {
      await api.assignRole(userId, roleId);
      await fetchUsers();
    } catch (error) {
      console.error('Assign role error:', error);
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      await api.deleteUser(selectedUser.id);
      await fetchUsers();
      setIsDeleteOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Delete user error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'project_manager':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'developer':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'viewer':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'Admin';
      case 'project_manager':
        return 'Proje Yöneticisi';
      case 'developer':
        return 'Developer';
      case 'viewer':
        return 'Görüntüleyici';
      default:
        return roleName;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h2>
        <p className="text-gray-600">Tüm kullanıcıları yönetin</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Kullanıcı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="text-gray-600">
          {filteredUsers.length} kullanıcı
        </Badge>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Kullanıcıyı Sil
            </DialogTitle>
            <DialogDescription className="pt-2">
              <span className="font-semibold">{selectedUser?.name}</span> ({selectedUser?.email}) kullanıcısını silmek istediğinizden emin misiniz?
              <br /><br />
              <span className="text-red-600 font-medium">Bu işlem geri alınamaz!</span> Kullanıcının tüm verileri kalıcı olarak silinecektir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giriş Yöntemi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Katılım
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                const userRole = user.roles?.[0]?.name || 'viewer';
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback className={`${
                            userRole === 'admin' ? 'bg-purple-500' :
                            userRole === 'project_manager' ? 'bg-blue-500' :
                            userRole === 'developer' ? 'bg-green-500' : 'bg-gray-500'
                          } text-white`}>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {user.name}
                            {isCurrentUser && (
                              <Badge className="ml-2 bg-purple-100 text-purple-700 text-xs">Sen</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userRole === 'admin' ? (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Select
                          value={user.roles?.[0]?.id?.toString() || ''}
                          onValueChange={(value) => handleAssignRole(user.id, parseInt(value))}
                          disabled={isCurrentUser}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue>
                              {user.roles?.[0] ? (
                                <div className="flex items-center">
                                  <Shield className="h-3 w-3 mr-1" />
                                  {getRoleDisplayName(user.roles[0].name)}
                                </div>
                              ) : 'Rol Seç'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {roles
                              .filter(role => role.name !== 'admin')
                              .map((role) => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                {getRoleDisplayName(role.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="capitalize">
                        {user.provider || 'local'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={user.is_active ? 'default' : 'destructive'}
                        className={user.is_active ? 'bg-green-100 text-green-700' : ''}
                      >
                        {user.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {userRole === 'admin' ? (
                        <Badge variant="outline" className="text-purple-600 border-purple-300">
                          Korumalı
                        </Badge>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(user.id)}
                              disabled={isCurrentUser}
                            >
                              {user.is_active ? (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Pasif Yap
                                </>
                              ) : (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Aktif Yap
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(user)}
                              disabled={isCurrentUser}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserCog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Kullanıcı bulunamadı</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
