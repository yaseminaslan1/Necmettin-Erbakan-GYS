'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await api.forgotPassword(data.email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">E-posta gönderildi</CardTitle>
            <CardDescription className="text-center">
              Kayıtlı e-posta adresinize şifre sıfırlama bağlantısı gönderdik. Lütfen gelen kutunuzu (ve gerekiyorsa spam klasörünü) kontrol edin. E-postadaki bağlantıya tıklayarak yeni şifrenizi belirleyebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Giriş sayfasına dön
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Şifremi unuttum</CardTitle>
          <CardDescription className="text-center">
            Kayıtlı e-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                {...register('email')}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Gönderiliyor...' : 'Sıfırlama bağlantısı gönder'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Giriş sayfasına dön
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
