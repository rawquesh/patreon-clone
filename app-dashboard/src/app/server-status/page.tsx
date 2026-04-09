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
} from '@/lib/services/server-status.service';
import { getAuthToken } from '@/lib/auth';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Database,
  Cloud,
  CreditCard,
  KeyRound,
  Shield,
  Server,
  Globe,
  LayoutTemplate,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  PORT: Server,
  MONGODB_URI: Database,
  JWT_SECRET: KeyRound,
  STRIPE_SECRET_KEY: CreditCard,
  STRIPE_WEBHOOK_SECRET: CreditCard,
  STRIPE_WEBHOOK_CONNECT_SECRET: CreditCard,
  AWS_ACCESS_KEY: Cloud,
  AWS_SECRET_KEY: Cloud,
  AWS_ENDPOINT_URL: Cloud,
  S3_BUCKET_NAME: Cloud,
  S3_COLLECTIONS_BUCKET: Cloud,
  S3_TEST_BUCKET: Cloud,
  GOOGLE_CLIENT_ID: Globe,
  GOOGLE_CLIENT_SECRET: Globe,
  BACKEND_URL: Globe,
  FRONTEND_URL: Globe,
  ALLOWED_ORIGINS: Globe,
  BRAND_LOGO_URL: LayoutTemplate,
  BRAND_EMAIL_HEADER_URL: LayoutTemplate,
  BRAND_EMAIL_FOOTER_URL: LayoutTemplate,
  BRAND_FAVICON_URL: LayoutTemplate,
  'Admin User': Shield,
};

const STATUS_COLORS: Record<StatusCheck['status'], { icon: string; bg: string; border: string; text: string; badge: string }> = {
  success: { icon: 'text-green-500', bg: 'bg-green-500', border: 'border-green-200', text: 'text-green-700 dark:text-green-400', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  error: { icon: 'text-red-500', bg: 'bg-red-500', border: 'border-red-200', text: 'text-red-700 dark:text-red-400', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  warning: { icon: 'text-yellow-500', bg: 'bg-yellow-500', border: 'border-yellow-200', text: 'text-yellow-700 dark:text-yellow-400', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  checking: { icon: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-700 dark:text-blue-400', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  pending: { icon: 'text-gray-400', bg: 'bg-gray-300', border: 'border-gray-200', text: 'text-gray-500', badge: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
};

type CheckGroup = {
  title: string;
  description: string;
  keys: string[];
};

const CHECK_GROUPS: CheckGroup[] = [
  {
    title: 'Core Infrastructure',
    description: 'Essential server configuration — these must all pass for the app to function',
    keys: ['PORT', 'MONGODB_URI', 'JWT_SECRET'],
  },
  {
    title: 'S3 Storage',
    description: 'File storage for media uploads (profile photos, posts, videos). Credentials must be valid and the bucket must exist.',
    keys: ['AWS_ACCESS_KEY', 'AWS_SECRET_KEY', 'AWS_ENDPOINT_URL', 'S3_BUCKET_NAME', 'S3_COLLECTIONS_BUCKET', 'S3_TEST_BUCKET'],
  },
  {
    title: 'Stripe Payments',
    description: 'Payment processing for subscriptions, memberships, and payouts',
    keys: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_WEBHOOK_CONNECT_SECRET'],
  },
  {
    title: 'Google OAuth',
    description: '"Sign in with Google" for creators and members. All three variables must be set for Google OAuth to work.',
    keys: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'BACKEND_URL'],
  },
  {
    title: 'URLs & CORS',
    description: 'Frontend and cross-origin configuration',
    keys: ['FRONTEND_URL', 'ALLOWED_ORIGINS'],
  },
  {
    title: 'Branding',
    description: 'Optional custom branding. Leave blank to use defaults.',
    keys: ['BRAND_LOGO_URL', 'BRAND_EMAIL_HEADER_URL', 'BRAND_EMAIL_FOOTER_URL', 'BRAND_FAVICON_URL'],
  },
];

function StatusBadge({ status, isOptional }: { status: StatusCheck['status']; isOptional?: boolean }) {
  const labels: Record<StatusCheck['status'], string> = {
    success: 'Ready',
    error: 'Error',
    warning: isOptional ? 'Optional' : 'Warning',
    checking: 'Checking...',
    pending: 'Pending',
  };
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
      STATUS_COLORS[status].badge
    )}>
      {status === 'success' && <CheckCircle2 className="h-3 w-3" />}
      {status === 'error' && <XCircle className="h-3 w-3" />}
      {status === 'warning' && <AlertTriangle className="h-3 w-3" />}
      {status === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === 'pending' && <span className="h-3 w-3 rounded-full border-2 border-current animate-pulse" />}
      {labels[status]}
    </span>
  );
}

function CheckCard({
  check,
  index,
  visible,
}: {
  check: StatusCheck;
  index: number;
  visible: boolean;
}) {
  const Icon = CHECK_ICONS[check.name] || Server;
  const colors = STATUS_COLORS[check.status];

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-4 transition-all duration-500',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
        colors.border
      )}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('shrink-0 mt-0.5', colors.icon)}>
          {check.status === 'checking' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm">{check.name}</h3>
            <StatusBadge status={check.status} isOptional={check.isOptional} />
          </div>

          {check.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {check.description}
            </p>
          )}

          {check.error && (
            <div className={cn(
              'text-xs p-2.5 rounded-lg leading-relaxed',
              check.status === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
              check.status === 'warning' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' :
              'bg-muted text-muted-foreground'
            )}>
              {check.error}
            </div>
          )}

          {check.status === 'success' && check.message && (
            <p className="text-xs text-muted-foreground">
              {check.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ServerStatusPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [visibleCards, setVisibleCards] = useState(0);
  const hasCheckedAuth = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
  });

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    const token = getAuthToken();
    if (token) {
      router.push('/');
    }
  }, [router]);

  // Staggered reveal
  useEffect(() => {
    if (!status) return;
    const total = status.checks.length + (status.adminCreationReady && !status.adminExists ? 1 : 0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i <= total; i++) {
      timers.push(setTimeout(() => setVisibleCards(i), i * 40));
    }
    return () => timers.forEach(clearTimeout);
  }, [status]);

  const runChecks = async () => {
    setIsLoading(true);
    setStatus(null);
    setVisibleCards(0);

    try {
      const result = await getServerStatus();
      setStatus(result);

      if (result.adminCreationReady && !result.adminExists) {
        setTimeout(() => setShowAdminDialog(true), result.checks.length * 40 + 400);
      }
    } catch (err: any) {
      toast({
        title: 'Connection Failed',
        description: err?.message || 'Could not connect to the server. Make sure the backend is running.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateAdmin = async (data: CreateAdminFormData) => {
    setIsCreating(true);
    try {
      await createAdmin(data);
      setShowAdminDialog(false);
      toast({
        title: 'Admin Created',
        description: `Redirecting you to the login page...`,
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
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

  const totalChecks = status?.checks.length || 0;
  const passedCount = status?.checks.filter((c) => c.status === 'success').length || 0;
  const errorCount = status?.checks.filter((c) => c.status === 'error').length || 0;
  const warningCount = status?.checks.filter((c) => c.status === 'warning').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-slate-50 dark:from-slate-950 dark:via-background dark:to-slate-950 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl space-y-8">

        {/* Header */}
        <div className="text-center space-y-3 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <Server className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Server Status</h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Verify that your server is properly configured and ready for deployment.
            All critical checks must pass before creating an admin account.
          </p>
        </div>

        {/* Run Button */}
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
                Running Diagnostics...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                Check Server Status
              </>
            )}
          </Button>
        </div>

        {/* Summary Bar */}
        {status && visibleCards >= totalChecks && (
          <div className="flex items-center justify-center gap-6 text-sm animate-fade-in">
            <div className="flex items-center gap-1.5 text-green-600 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>{passedCount} passed</span>
            </div>
            {errorCount > 0 && (
              <div className="flex items-center gap-1.5 text-red-600 font-medium">
                <XCircle className="h-4 w-4" />
                <span>{errorCount} error{errorCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-1.5 text-yellow-600 font-medium">
                <AlertTriangle className="h-4 w-4" />
                <span>{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}

        {/* Check Groups */}
        {status && CHECK_GROUPS.map((group, gi) => {
          const groupChecks = status.checks.filter((c) => group.keys.includes(c.name));
          if (groupChecks.length === 0) return null;

          const hasErrors = groupChecks.some((c) => c.status === 'error');
          const hasWarnings = groupChecks.some((c) => c.status === 'warning');
          const allSuccess = groupChecks.every((c) => c.status === 'success');

          return (
            <div key={group.title} className="space-y-2">
              {/* Group Header */}
              <div className="flex items-center gap-2 px-1">
                <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                  {group.title}
                </h2>
                {allSuccess && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                )}
                {hasErrors && !allSuccess && (
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                )}
                {hasWarnings && !hasErrors && (
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                )}
              </div>

              {/* Group Description */}
              {group.description && (
                <p className="text-xs text-muted-foreground px-1 pl-3 border-l-2 border-muted">
                  {group.description}
                </p>
              )}

              {/* Cards */}
              <div className="space-y-2">
                {groupChecks.map((check, ci) => (
                  <CheckCard
                    key={check.name}
                    check={check}
                    index={gi * 20 + ci}
                    visible={visibleCards > gi * 20 + ci}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Admin User Check */}
        {status && visibleCards >= totalChecks && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                Admin Account
              </h2>
              {status.adminExists ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>

            {status.checks
              .filter((c) => c.name === 'Admin User')
              .map((check) => (
                <CheckCard
                  key={check.name}
                  check={check}
                  index={totalChecks + 1}
                  visible={true}
                />
              ))}
          </div>
        )}

        {/* Admin Creation Gate: show when MongoDB+S3+JWT are ready, regardless of other failures */}
        {status &&
          visibleCards >= totalChecks &&
          !status.adminExists &&
          status.adminCreationReady && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-5 shadow-blue-100/50 shadow-md space-y-3 animate-slide-down">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-500 p-2.5 shadow-lg shrink-0">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                  Ready to Create Admin Account
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">
                  Core infrastructure is configured. Create your admin account to access the dashboard.
                </p>
              </div>
            </div>

            {errorCount > 0 && (
              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2.5">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  {errorCount} configuration {errorCount === 1 ? 'issue' : 'issues'} remain. Some features may not work (e.g. Google OAuth, Stripe webhooks). Fix them for full functionality.
                </span>
              </div>
            )}

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

        {/* Admin Exists */}
        {status &&
          visibleCards >= totalChecks &&
          status.adminExists && (
          <div className="rounded-xl border border-gray-200 bg-muted/30 p-5 text-center space-y-3 animate-slide-down">
            <div className="flex justify-center">
              <div className="rounded-full bg-muted p-3">
                <Shield className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Admin Account Exists</h3>
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

        {/* Footer */}
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              <Button type="submit" className="flex-1 gap-2" disabled={isCreating}>
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
