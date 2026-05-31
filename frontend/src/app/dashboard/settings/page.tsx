'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Lock, Bell, Trash2, LogOut, Shield, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Şifre en az 8 karakter olmalı');
      return;
    }

    setIsChangingPassword(true);

    try {
      await api.updateUser(user!.id, {
        password: passwordData.newPassword,
      });
      
      setPasswordSuccess('Şifre başarıyla değiştirildi');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || 'Şifre değiştirme başarısız');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await api.logout();
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.deleteUser(user!.id);
      await logout();
      router.push('/login');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Hesap silme başarısız');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ayarlar</h2>
        <p className="text-gray-600">Hesap ve güvenlik ayarlarınızı yönetin</p>
      </div>

      {/* Password Change - Only for local users */}
      {user.provider === 'local' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Şifre Değiştir
            </CardTitle>
            <CardDescription>
              Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-green-50 text-green-800 rounded-lg text-sm">
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    placeholder="Mevcut şifrenizi girin"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="Yeni şifrenizi girin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="confirmPassword"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="Yeni şifrenizi tekrar girin"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                >
                  {showPasswords ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Şifreleri Gizle
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Şifreleri Göster
                    </>
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={handlePasswordChange}
              disabled={isChangingPassword || !passwordData.newPassword}
            >
              {isChangingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* OAuth Info */}
      {user.provider !== 'local' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Giriş Yöntemi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Hesabınız <span className="font-semibold capitalize">{user.provider}</span> ile 
              bağlantılı. Şifre değişikliği için {user.provider} hesabınızı kullanın.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Bildirimler
          </CardTitle>
          <CardDescription>
            Bildirim tercihlerinizi yönetin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Bildirimleri</p>
              <p className="text-sm text-gray-500">Görev atamaları ve güncellemeler için</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tarayıcı Bildirimleri</p>
              <p className="text-sm text-gray-500">Anlık bildirimler için</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LogOut className="h-5 w-5 mr-2" />
            Oturum Yönetimi
          </CardTitle>
          <CardDescription>
            Aktif oturumlarınızı yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleLogoutAll}>
            <LogOut className="h-4 w-4 mr-2" />
            Tüm Cihazlardan Çıkış Yap
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <Trash2 className="h-5 w-5 mr-2" />
            Tehlikeli Bölge
          </CardTitle>
          <CardDescription>
            Bu işlemler geri alınamaz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Hesabı Sil
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hesabı Silmek İstediğinize Emin Misiniz?</DialogTitle>
                <DialogDescription>
                  Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">İptal</Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Siliniyor...' : 'Evet, Hesabı Sil'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
