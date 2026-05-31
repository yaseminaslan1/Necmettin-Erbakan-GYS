'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Github, Mail } from 'lucide-react'; // Google/GitHub OAuth devre dışı

const registerSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir email adresi girin'),
  role: z.enum(['developer', 'project_manager', 'viewer'], {
    message: 'Lutfen bir rol secin',
  }),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermeli')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermeli'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    setIsLoading(true);

    try {
      await registerUser(data.email, data.password, data.name, data.role);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  /* Google/GitHub OAuth - devre dışı (yorum satırında)
  const handleOAuthLogin = (provider: 'google' | 'github') => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/${provider}`;
  };
  */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Kayıt Ol</CardTitle>
          <CardDescription className="text-center">
            Yeni bir hesap oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {/* Google/GitHub OAuth - devre dışı (yorum satırında)
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => handleOAuthLogin('google')} disabled={isLoading}>
              <Mail className="mr-2 h-4 w-4" /> Google
            </Button>
            <Button variant="outline" onClick={() => handleOAuthLogin('github')} disabled={isLoading}>
              <Github className="mr-2 h-4 w-4" /> GitHub
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">veya email ile</span>
            </div>
          </div>
          */}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">İsim</Label>
              <Input
                id="name"
                type="text"
                placeholder="Adınız Soyadınız"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Kayit Tipi</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue=""
                {...register('role')}
              >
                <option value="" disabled>Rol secin</option>
                <option value="developer">Gelistirici</option>
                <option value="project_manager">Proje Yoneticisi</option>
                <option value="viewer">Goruntuleyici</option>
              </select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Giriş Yap
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}