'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials, formatDate } from '@/lib/utils';
import { User, Mail, Calendar, Shield, Save, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.updateUser(user.id, {
        name: formData.name,
      });
      
      setUser({ ...user, name: formData.name });
      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi' });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Güncelleme başarısız' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profil</h2>
        <p className="text-gray-600">Hesap bilgilerinizi görüntüleyin ve düzenleyin</p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-4 text-xl font-semibold">{user.name}</h3>
              <p className="text-gray-500">{user.email}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {user.roles?.map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {role.name}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <p>Katılım: {formatDate(user.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Kişisel Bilgiler</CardTitle>
                <CardDescription>
                  Temel hesap bilgileriniz
                </CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Düzenle
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Ad Soyad
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Label>
                <p className="text-gray-900 py-2">{user.email}</p>
                <p className="text-xs text-gray-500">
                  Email değiştirilemez
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Giriş Yöntemi
                </Label>
                <p className="text-gray-900 py-2 capitalize">{user.provider}</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Hesap Durumu
                </Label>
                <Badge variant={user.is_active ? 'default' : 'destructive'}>
                  {user.is_active ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCancel}>
                  İptal
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>İzinler</CardTitle>
            <CardDescription>
              Hesabınıza tanımlı izinler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.permissions?.map((permission) => (
                <Badge key={permission} variant="outline">
                  {permission}
                </Badge>
              ))}
              {(!user.permissions || user.permissions.length === 0) && (
                <p className="text-gray-500">Henüz izin tanımlanmamış</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
