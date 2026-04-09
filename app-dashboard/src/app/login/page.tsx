'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, LayoutTemplate, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await login(data);
      if (!response.user?.isAdmin) {
        setError('Access denied. Admin privileges required.');
        return;
      }
      sessionStorage.setItem('admin_user', JSON.stringify(response.user));
      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
      window.location.href = redirect;
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-animated-gradient overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="orb orb-lg bg-primary/10 -top-48 -left-48 animate-slow" style={{ animation: 'float-orb 18s ease-in-out infinite' }} />
      <div className="orb orb-md bg-accent/10 bottom-20 -right-20 animate-slow" style={{ animation: 'float-orb 14s ease-in-out infinite -5s' }} />
      <div className="orb orb-sm bg-emerald-500/10 top-1/3 left-1/4 animate-slow" style={{ animation: 'float-orb 20s ease-in-out infinite -10s' }} />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.05) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground) / 0.05) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glass Login Card */}
      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Gradient top bar */}
          <div className="h-1.5 bg-gradient-primary" />

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="space-y-1 text-center pb-2 pt-8 px-8">
              {/* Logo with glow effect */}
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-primary blur-2xl opacity-30" />
                  <div className="relative bg-gradient-primary p-4 rounded-2xl">
                    <LayoutTemplate className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-gradient">
                  Patreon Clone Admin
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Sign in to access the admin dashboard
                </CardDescription>
              </div>

              {/* Security badge */}
              <div className="flex justify-center pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-card text-xs text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  Secure admin access
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-8 pb-8 pt-4 space-y-5">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Error alert */}
                {error && (
                  <div className="flex items-center gap-2.5 rounded-xl glass-card p-3.5 text-sm text-destructive border border-destructive/20">
                    <div className="shrink-0 p-1 rounded-full bg-destructive/10">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    autoComplete="email"
                    {...register('email')}
                    className={[
                      'glass-input h-11 text-sm',
                      errors.email && 'border-destructive/50 focus:border-destructive focus:ring-destructive/10',
                    ].join(' ')}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      {...register('password')}
                      className={[
                        'glass-input h-11 text-sm pr-10',
                        errors.password && 'border-destructive/50 focus:border-destructive focus:ring-destructive/10',
                      ].join(' ')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 text-sm font-semibold btn-gradient rounded-xl shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In to Dashboard</span>
                  )}
                </Button>
              </form>

              {/* Footer note */}
              <div className="text-center text-xs text-muted-foreground">
                Protected by Patreon Clone admin authentication
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
