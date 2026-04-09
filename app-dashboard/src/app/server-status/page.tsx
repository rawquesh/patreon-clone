'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getServerStatus,
  createAdmin,
  type StatusCheck,
  type ServerStatus,
  type AdminUser,
} from '@/lib/services/server-status.service';
import { getAuthToken } from '@/lib/auth';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
  Database,
  Cloud,
  CreditCard,
  FileText,
  KeyRound,
  Shield,
  Server,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const createAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

const CHECK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'MongoDB Database': Database,
  'S3 Storage': Cloud,
  'Stripe API': CreditCard,
  'Environment Variables': FileText,
  'JWT Secret': KeyRound,
  'Admin User': Shield,
};

const CHECK_COLORS: Record<string, { border: string; glow: string; dot: string }> = {
  success: {
    border: 'border-green-200',
    glow: 'shadow-green-100',
    dot: 'bg-green-500',
  },
  error: {
    border: 'border-red-200',
    glow: 'shadow-red-100',
    dot: 'bg-red-500',
  },
  checking: {
    border: 'border-blue-200',
    glow: 'shadow-blue-100',
    dot: 'bg-blue-500',
  },
  pending: {
    border: 'border-gray-200',
    glow: '',
    dot: 'bg-gray-300',
  },
};

function StatusCard({
  check,
  index,
  visible,
}: {
  check: StatusCheck;
  index: number;
  visible: boolean;
}) {
  const Icon = CHECK_ICONS[check.name] || Server;
  const colors = CHECK_COLORS[check.status];

  return (
    <div
      className={cn(
        'relative rounded-xl border bg-card p-5 transition-all duration-500',
        colors.border,
        colors.glow && 'shadow-md ' + colors.glow,
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Status indicator */}
        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-muted shrink-0">
          {check.status === 'success' && (
            <div className="absolute inset-0 rounded-full bg-green-500 animate-check-pop" />
          )}
          {check.status === 'checking' && (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin-slow" />
          )}
          {check.status === 'error' && (
            <div className="absolute inset-0 rounded-full bg-red-500 animate-check-pop" />
          )}
          {check.status === 'pending' && (
            <div className="absolute inset-0 rounded-full bg-gray-300 animate-pulse-ring-pending" />
          )}
          {check.status !== 'checking' && check.status !== 'error' && (
            <Icon className={cn('h-5 w-5 relative z-10', check.status === 'success' ? 'text-green-600' : 'text-gray-400')} />
          )}
          {check.status === 'error' && (
            <Icon className="h-5 w-5 text-red-600 relative z-10" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{check.name}</h3>
            {check.status === 'success' && (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            )}
            {check.status === 'error' && (
              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
            )}
          </div>
          <p className={cn(
            'text-xs mt-0.5 transition-all',
            check.status === 'checking' ? 'text-blue-600 font-medium' :
            check.status === 'error' ? 'text-red-600' :
            check.status === 'success' ? 'text-green-600' : 'text-muted-foreground'
          )}>
            {check.message}
          </p>
          {check.error && (
            <p className="text-xs text-red-500 mt-1 font-medium bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-md">
              {check.error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfettiPiece({ className }: { className: string }) {
  return <div className={cn('w-2 h-2 rounded-full absolute animate-confetti', className)} />;
}

export default function ServerStatusPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number>(0);
  const [createdAdmin, setCreatedAdmin] = useState<AdminUser | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasCheckedAuth = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
  });

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    const token = getAuthToken();
    if (token) {
      router.push('/');
    }
  }, [router]);

  // Stagger card reveal
  useEffect(() => {
    if (!status) return;
    const total = status.checks.length + (status.allPassed && !status.adminExists ? 1 : 0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i <= total; i++) {
      timers.push(setTimeout(() => setVisibleCards(i), i * 80));
    }
    return () => timers.forEach(clearTimeout);
  }, [status]);

  const runChecks = async () => {
    setIsLoading(true);
    setStatus(null);
    setVisibleCards(0);
    setShowConfetti(false);
    setCreatedAdmin(null);

    try {
      const result = await getServerStatus();
      setStatus(result);

      if (result.allPassed && !result.adminExists) {
        setTimeout(() => setShowAdminDialog(true), result.checks.length * 80 + 300);
      }
    } catch (err: any) {
      toast({
        title: 'Connection Failed',
        description: err?.message || 'Could not connect to the server. Make sure the backend is running.',
        variant: 'destructive',
      });
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateAdmin = async (data: CreateAdminFormData) => {
    setIsCreating(true);
    try {
      const result = await createAdmin(data);
      setCreatedAdmin(result.user);
      setShowAdminDialog(false);
      setShowConfetti(true);
      toast({
        title: 'Admin Created',
        description: `Admin account ${result.user.email} has been created successfully.`,
      });
      // Re-run checks to update admin status
      setTimeout(() => runChecks(), 2000);
    } catch (err: any) {
      toast({
        title: 'Creation Failed',
        description: err?.message || 'Failed to create admin user.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const confettiColors = ['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-orange-400'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-blue-50 dark:from-slate-950 dark:via-background dark:to-blue-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiColors.map((color, i) => (
            <ConfettiPiece
              key={i}
              className={`${color} left-[${10 + i * 15}%] top-0`}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Server className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Server Status</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Verify that your server is properly configured and ready for deployment.
            Checks include database, storage, payments, and security credentials.
          </p>
        </div>

        {/* Run Checks Button */}
        <div className="flex justify-center animate-fade-in-up stagger-1">
          <Button
            size="lg"
            onClick={runChecks}
            disabled={isLoading}
            className="gap-2 px-8 text-base font-semibold shadow-md hover:shadow-lg transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Running Checks...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                Check Server Status
              </>
            )}
          </Button>
        </div>

        {/* Status Cards */}
        {status && (
          <div className="space-y-3">
            {status.checks.map((check, index) => (
              <StatusCard
                key={check.name}
                check={check}
                index={index}
                visible={visibleCards > index}
              />
            ))}

            {/* Overall Result */}
            {visibleCards >= status.checks.length && (
              <div
                className={cn(
                  'rounded-xl border p-5 text-center animate-bounce-in',
                  status.allPassed
                    ? 'border-green-200 bg-green-50 dark:bg-green-950/20 shadow-green-100 shadow-md'
                    : 'border-red-200 bg-red-50 dark:bg-red-950/20 shadow-red-100 shadow-md',
                )}
              >
                {status.allPassed ? (
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-green-500 p-3 shadow-lg animate-pulse-ring">
                        <CheckCircle2 className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-700 dark:text-green-400">
                        All Systems Operational
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-500">
                        Your server is properly configured and ready to use.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-red-500 p-3 shadow-lg">
                        <AlertTriangle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
                        Configuration Issues Found
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-500">
                        Please fix the errors above before continuing.
                      </p>
                    </div>
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={runChecks}
                        disabled={isLoading}
                        className="gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin Creation Section */}
            {status.allPassed && !status.adminExists && visibleCards >= status.checks.length && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-6 shadow-blue-100 shadow-md space-y-3 animate-slide-down">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-500 p-2 shadow-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                      No Admin Account Found
                    </h3>
                    <p className="text-xs text-blue-600 dark:text-blue-500">
                      Create your first admin account to access the dashboard.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowAdminDialog(true)}
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Sparkles className="h-4 w-4" />
                  Create Admin Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Admin exists message */}
            {status.adminExists && visibleCards >= status.checks.length && (
              <div className="rounded-xl border border-gray-200 bg-muted/30 p-6 text-center space-y-3 animate-slide-down">
                <div className="flex justify-center">
                  <div className="rounded-full bg-muted p-3">
                    <Shield className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Admin Account Exists
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    An admin user is already configured. Go to the login page to sign in.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="gap-2"
                >
                  Go to Login
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Success - created admin */}
            {createdAdmin && (
              <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 p-6 text-center space-y-3 animate-bounce-in">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-500 p-3 shadow-lg animate-pulse-ring">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-green-700 dark:text-green-400">
                    Admin Created Successfully
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-500 font-medium">
                    {createdAdmin.email}
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-1">
                  <Button
                    onClick={() => router.push('/login')}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={runChecks}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Re-check
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        {!status && !isLoading && (
          <div className="text-center text-xs text-muted-foreground animate-fade-in space-y-1">
            <p>Click the button above to run a full server configuration check.</p>
            <p>All checks run locally — no data is sent externally.</p>
          </div>
        )}
      </div>

      {/* Create Admin Dialog */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-primary/10 p-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle>Create Admin Account</DialogTitle>
            </div>
            <DialogDescription>
              This will be the primary admin account for your platform. Choose credentials carefully.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onCreateAdmin)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register('firstName')}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register('lastName')}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowAdminDialog(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Create Admin
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
