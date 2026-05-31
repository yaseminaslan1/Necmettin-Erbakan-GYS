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

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(1, 'Şifre gerekli'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      const raw = err.response?.data?.message || err.message || '';
      const messages: Record<string, string> = {
        'Invalid email or password': 'E-posta veya şifre hatalı.',
        'Invalid credentials': 'E-posta veya şifre hatalı.',
        'Account is deactivated': 'Hesabınız devre dışı. Yöneticiyle iletişime geçin.',
      };
      const msg = messages[raw] || raw || 'E-posta veya şifre hatalı. Tekrar deneyin.';
      setError(msg);
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
          <CardTitle className="text-2xl font-bold text-center">Giriş Yap</CardTitle>
          <CardDescription className="text-center">
            Hesabınıza giriş yapın
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
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              <Link href="/forgot-password" className="text-xs text-primary hover:underline block text-right">
                Şifremi unuttum
              </Link>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
