'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Role, Project, ProjectMember } from '@/types';
import { getInitials, formatDate } from '@/lib/utils';
import { Search, Users, Mail, UserPlus, Edit } from 'lucide-react';

export default function TeamPage() {
  const { isAdmin, isProjectManager, canEditUsers } = usePermissions();
  const canManageTeam = isAdmin || isProjectManager || canEditUsers;

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<ProjectMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamSearch, setTeamSearch] = useState('');

  // Add member
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedMemberRoleId, setSelectedMemberRoleId] = useState<string>('none');
  const [isSearching, setIsSearching] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Edit user
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProjectMember | null>(null);

  const fetchTeamMembers = async (projectId: number) => {
    try {
      const membersRes = await api.getProjectMembers(projectId);
      let membersData: ProjectMember[] = [];
      if (Array.isArray(membersRes)) {
        membersData = membersRes;
      } else if (Array.isArray(membersRes?.data)) {
        membersData = membersRes.data;
      }
      setTeamMembers(membersData);
    } catch (error) {
      console.error('Fetch project members error:', error);
      setTeamMembers([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsRes = await api.getProjects({ limit: 100 });
        const projectData: Project[] = Array.isArray(projectsRes?.data) ? projectsRes.data : [];
        setProjects(projectData);

        const rolesRes = await api.getRoles();
        setRoles(rolesRes?.data || []);

        if (projectData.length > 0) {
          const firstProjectId = String(projectData[0].id);
          setSelectedProjectId(firstProjectId);
          await fetchTeamMembers(Number(firstProjectId));
        } else {
          setTeamMembers([]);
        }
      } catch (error) {
        console.error('Fetch data error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTeamMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
      member.email.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const handleSearchUsers = async (searchTerm: string) => {
    setAddMemberSearch(searchTerm);
    if (!selectedProjectId) {
      setSearchResults([]);
      return;
    }

    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const usersRes = await api.getUsers({ limit: 50, search: searchTerm });
      let users: User[] = [];
      if (Array.isArray(usersRes)) users = usersRes;
      else if (Array.isArray(usersRes?.data)) users = usersRes.data;
      const teamIds = teamMembers.map((m) => Number(m.id));
      setSearchResults(users.filter((u: User) => !teamIds.includes(u.id)));
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToTeam = async () => {
    if (!selectedUserId || !selectedProjectId) return;

    try {
      await api.addProjectMember(
        Number(selectedProjectId),
        Number(selectedUserId),
        selectedMemberRoleId === 'none' ? undefined : Number(selectedMemberRoleId)
      );
      await fetchTeamMembers(Number(selectedProjectId));
      setSelectedUserId('');
      setSelectedMemberRoleId('none');
      setAddMemberSearch('');
      setSearchResults([]);
      setIsAddMemberOpen(false);
    } catch (error) {
      console.error('Add to team error:', error);
    }
  };

  const handleEditUser = (user: ProjectMember) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const handleAssignRole = async (userId: number, roleId: number | null) => {
    if (!selectedProjectId) return;

    try {
      await api.updateProjectMemberRole(Number(selectedProjectId), userId, roleId);
      await fetchTeamMembers(Number(selectedProjectId));
      const newRole = roleId ? roles.find((r) => r.id === roleId) : null;
      if (selectedUser) {
        setSelectedUser({
          ...selectedUser,
          role_id: newRole?.id || null,
          role_name: newRole?.name || null,
        });
      }
    } catch (error) {
      console.error('Assign role error:', error);
    }
  };

  const handleProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setTeamSearch('');
    setSearchResults([]);
    setSelectedUserId('');
    if (projectId) {
      await fetchTeamMembers(Number(projectId));
    } else {
      setTeamMembers([]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasProjects = projects.length > 0;

  const UserCard = ({ user }: { user: ProjectMember }) => (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="text-lg bg-primary text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex flex-wrap items-center mt-2 gap-1">
              <Badge
                variant="secondary"
                className={`text-xs ${
                  user.role_name === 'project_manager' ? 'bg-blue-100 text-blue-700' :
                  user.role_name === 'developer' ? 'bg-green-100 text-green-700' :
                  user.role_name === 'viewer' ? 'bg-gray-100 text-gray-700' :
                  'bg-amber-100 text-amber-700'
                }`}
              >
                {user.role_name === 'project_manager' ? 'PM' :
                 user.role_name === 'developer' ? 'Developer' :
                 user.role_name === 'viewer' ? 'Viewer' :
                 'Rol atanmamis'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <span>Takima katilim: {formatDate(user.joined_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            {canManageTeam && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditUser(user)}
                title="Rol düzenle"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 space-y-2">
          <Label>Proje Secimi</Label>
          <Select value={selectedProjectId} onValueChange={handleProjectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Takimini gormek istediginiz projeyi secin" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={String(project.id)}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {!hasProjects && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-amber-800">
            Uye ekleyebilmek icin proje olusturmalisiniz.
          </CardContent>
        </Card>
      )}

      {canManageTeam && (
      <div className="flex justify-end">
          <Button onClick={() => setIsAddMemberOpen(true)} disabled={!selectedProjectId}>
            <UserPlus className="mr-2 h-4 w-4" />
            Üye Ekle
          </Button>
      </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Takım üyelerinde ara (isim veya email)..."
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="whitespace-nowrap">
              {filteredTeamMembers.length} / {teamMembers.length} üye
            </Badge>
          </div>
        </CardContent>
      </Card>

      {filteredTeamMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {!selectedProjectId ? 'Lutfen bir proje secin' : teamSearch ? 'Kullanici bulunamadi' : 'Henuz takim uyesi yok'}
            </h3>
            <p className="text-gray-500">
              {!selectedProjectId
                ? 'Takim listesi proje bazli gosterilir'
                : teamSearch
                ? 'Farkli bir arama terimi deneyin'
                : ''}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeamMembers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={(open) => {
        setIsAddMemberOpen(open);
        if (!open) {
          setAddMemberSearch('');
          setSearchResults([]);
          setSelectedUserId('');
          setSelectedMemberRoleId('none');
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Takıma Üye Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kullanıcı Ara (isim veya email)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="En az 2 karakter yazın..."
                  value={addMemberSearch}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Uyelik Rolu</Label>
              <Select value={selectedMemberRoleId} onValueChange={setSelectedMemberRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Rol secin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Rolsuz</SelectItem>
                  {roles
                    .filter((r) => r.name !== 'admin')
                    .map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.name === 'project_manager' ? 'Proje Yoneticisi' :
                         role.name === 'developer' ? 'Gelistirici' :
                         role.name === 'viewer' ? 'Goruntuleyici' : role.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {addMemberSearch.length < 2 ? 'Sonuçlar' : `Sonuçlar (${searchResults.length})`}
              </Label>
              {addMemberSearch.length < 2 ? (
                <div className="text-sm text-gray-500 py-8 text-center border rounded-md bg-gray-50">
                  Kullanıcı aramak için en az 2 karakter yazın
                </div>
              ) : isSearching ? (
                <div className="py-8 text-center border rounded-md">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Aranıyor...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-sm text-gray-500 py-8 text-center border rounded-md bg-gray-50">
                  Kullanıcı bulunamadı veya tüm eşleşen kullanıcılar zaten takımda
                </div>
              ) : (
                <div className="max-h-[250px] overflow-y-auto space-y-2 border rounded-md p-2">
                  {searchResults.slice(0, 15).map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                        selectedUserId === String(user.id) ? 'bg-primary text-white' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedUserId(String(user.id))}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={selectedUserId === String(user.id) ? 'bg-white text-primary' : 'bg-gray-200'}>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className={`text-sm ${selectedUserId === String(user.id) ? 'text-white/80' : 'text-gray-500'}`}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 15 && (
                    <p className="text-xs text-gray-500 text-center py-2">
                      +{searchResults.length - 15} daha fazla sonuç için aramayı daraltın
                    </p>
                  )}
                </div>
              )}
            </div>
            <Button className="w-full" onClick={handleAddToTeam} disabled={!selectedUserId}>
              <UserPlus className="mr-2 h-4 w-4" />
              Takıma Ekle
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User (Role) Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Üye Rolü Düzenle</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-lg bg-primary text-white">
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <div className="flex items-center mt-1 space-x-2 flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {selectedUser.role_name === 'project_manager' ? 'PM' :
                       selectedUser.role_name === 'developer' ? 'Developer' :
                       selectedUser.role_name === 'viewer' ? 'Viewer' :
                       'Rol yok'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={selectedUser.role_id?.toString() || 'none'}
                  onValueChange={(value) => {
                    handleAssignRole(selectedUser.id, value === 'none' ? null : Number(value));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rol secin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Rolsuz</SelectItem>
                    {roles
                      .filter((r) => r.name !== 'admin')
                      .map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name === 'project_manager' ? 'Proje Yoneticisi' :
                           role.name === 'developer' ? 'Gelistirici' :
                           role.name === 'viewer' ? 'Goruntuleyici' : role.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}