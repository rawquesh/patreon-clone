'use client';

import { useState, useEffect } from 'react';
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

const STATUS_COLORS: Record<StatusCheck['status'], {
  icon: string;
  bg: string;
  border: string;
  text: string;
  badge: string;
  glow?: string;
}> = {
  success: {
    icon: 'text-emerald-500',
    bg: 'bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    text: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
    glow: 'rgba(16, 185, 129, 0.15)',
  },
  error: {
    icon: 'text-red-500',
    bg: 'bg-red-500',
    border: 'border-red-200 dark:border-red-800/50',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50',
    glow: 'rgba(239, 68, 68, 0.15)',
  },
  warning: {
    icon: 'text-yellow-500',
    bg: 'bg-yellow-500',
    border: 'border-yellow-200 dark:border-yellow-800/50',
    text: 'text-yellow-700 dark:text-yellow-400',
    badge: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50',
    glow: 'rgba(245, 158, 11, 0.15)',
  },
  checking: {
    icon: 'text-blue-500',
    bg: 'bg-blue-500',
    border: 'border-blue-200 dark:border-blue-800/50',
    text: 'text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50',
  },
  pending: {
    icon: 'text-gray-400',
    bg: 'bg-gray-300',
    border: 'border-gray-200 dark:border-gray-700',
    text: 'text-gray-500 dark:text-gray-400',
    badge: 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
  },
};

type CheckGroup = {
  title: string;
  description: string;
  keys: string[];
};

const CHECK_GROUPS: CheckGroup[] = [
  { title: 'Core Infrastructure', description: 'Essential server configuration — these must all pass for the app to function', keys: ['PORT', 'MONGODB_URI', 'JWT_SECRET'] },
  { title: 'S3 Storage', description: 'File storage for media uploads. Credentials must be valid and buckets must exist.', keys: ['AWS_ACCESS_KEY', 'AWS_SECRET_KEY', 'AWS_ENDPOINT_URL', 'S3_BUCKET_NAME', 'S3_COLLECTIONS_BUCKET', 'S3_TEST_BUCKET'] },
  { title: 'Stripe Payments', description: 'Payment processing for subscriptions, memberships, and payouts', keys: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_WEBHOOK_CONNECT_SECRET'] },
  { title: 'Google OAuth', description: '"Sign in with Google" for creators and members.', keys: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'BACKEND_URL'] },
  { title: 'URLs & CORS', description: 'Frontend and cross-origin configuration', keys: ['FRONTEND_URL', 'ALLOWED_ORIGINS'] },
  { title: 'Branding', description: 'Optional custom branding. Leave blank to use defaults.', keys: ['BRAND_LOGO_URL', 'BRAND_EMAIL_HEADER_URL', 'BRAND_EMAIL_FOOTER_URL', 'BRAND_FAVICON_URL'] },
];

function StatusBadge({ status, isOptional }: { status: StatusCheck['status']; isOptional?: boolean }) {
  const labels: Record<StatusCheck['status'], string> = {
    success: 'Ready',
    error: 'Error',
    warning: isOptional ? 'Optional' : 'Warning',
    checking: 'Checking...',
    pending: 'Pending',
  };
  const c = STATUS_COLORS[status];
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full', c.badge)}>
      {status === 'success' && <CheckCircle2 className="h-3 w-3" />}
      {status === 'error' && <XCircle className="h-3 w-3" />}
      {status === 'warning' && <AlertTriangle className="h-3 w-3" />}
      {status === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === 'pending' && <span className="h-2.5 w-2.5 rounded-full border-2 border-current animate-pulse" />}
      {labels[status]}
    </span>
  );
}

function CheckCard({ check, index, visible }: { check: StatusCheck; index: number; visible: boolean }) {
  const Icon = CHECK_ICONS[check.name] || Server;
  const colors = STATUS_COLORS[check.status];

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all duration-500 hover-lift',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
        colors.border
      )}
      style={{
        transitionDelay: `${index * 40}ms`,
        background: colors.glow ? `rgba(${check.status === 'success' ? '16,185,129' : check.status === 'error' ? '239,68,68' : '245,158,11'}, 0.03)` : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <div className={cn('shrink-0 mt-0.5', colors.icon)}>
          {check.status === 'checking' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm">{check.name}</h3>
            <StatusBadge status={check.status} isOptional={check.isOptional} />
          </div>
          {check.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{check.description}</p>
          )}
          {check.error && (
            <div className={cn(
              'text-xs p-2.5 rounded-lg leading-relaxed font-medium',
              check.status === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
              check.status === 'warning' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' :
              'bg-muted text-muted-foreground'
            )}>
              {check.error}
            </div>
          )}
          {check.status === 'success' && check.message && (
            <p className="text-xs text-muted-foreground">{check.message}</p>
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
  });

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
      toast({ title: 'Admin Created', description: `Redirecting you to the login page...` });
      setTimeout(() => { window.location.href = '/login'; }, 1500);
    } catch (err: any) {
      toast({ title: 'Creation Failed', description: err?.message || 'Failed to create admin user.', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const totalChecks = status?.checks.length || 0;
  const passedCount = status?.checks.filter((c) => c.status === 'success').length || 0;
  const errorCount = status?.checks.filter((c) => c.status === 'error').length || 0;
  const warningCount = status?.checks.filter((c) => c.status === 'warning').length || 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-mesh">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground) / 0.1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-3xl space-y-8">

        {/* Header */}
        <div className="text-center space-y-3 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-card relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-2xl opacity-20 blur-lg" />
            <div className="relative">
              <Server className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">
            Server Status
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
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
            className="gap-2 px-8 text-sm font-semibold btn-gradient rounded-xl shadow-lg shadow-primary/20 h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Check Server Status
              </>
            )}
          </Button>
        </div>

        {/* Summary Bar */}
        {status && visibleCards >= totalChecks && (
          <div className="flex items-center justify-center gap-6 text-sm animate-fade-in">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>{passedCount} passed</span>
            </div>
            {errorCount > 0 && (
              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold">
                <XCircle className="h-4 w-4" />
                <span>{errorCount} error{errorCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                <span>{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}

        {/* Check Groups */}
        {status && CHECK_GROUPS.map((group) => {
          const groupChecks = status.checks.filter((c) => group.keys.includes(c.name));
          if (groupChecks.length === 0) return null;
          const allSuccess = groupChecks.every((c) => c.status === 'success');
          const hasErrors = groupChecks.some((c) => c.status === 'error');
          const hasWarnings = groupChecks.some((c) => c.status === 'warning');

          return (
            <div key={group.title} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  {group.title}
                </h2>
                {allSuccess && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                {hasErrors && !allSuccess && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                {hasWarnings && !hasErrors && <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />}
              </div>
              {group.description && (
                <p className="text-xs text-muted-foreground px-1 pl-3 border-l-2 border-border">
                  {group.description}
                </p>
              )}
              <div className="space-y-2">
                {groupChecks.map((check) => {
                  const runningIndex = status.checks.indexOf(check);
                  return (
                    <CheckCard
                      key={check.name}
                      check={check}
                      index={runningIndex}
                      visible={visibleCards > runningIndex}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Admin User Check */}
        {status && visibleCards >= totalChecks && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                Admin Account
              </h2>
              {status.adminExists
                ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                : <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              }
            </div>
            {status.checks.filter((c) => c.name === 'Admin User').map((check) => (
              <CheckCard key={check.name} check={check} index={totalChecks + 1} visible={true} />
            ))}
          </div>
        )}

        {/* Admin Creation Gate */}
        {status && visibleCards >= totalChecks && !status.adminExists && status.adminCreationReady && (
          <div className="rounded-2xl border glass-card-static p-6 space-y-4 animate-slide-down">
            <div className="flex items-start gap-4">
              <div className="shrink-0 relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-2xl opacity-20 blur-md" />
                <div className="relative bg-gradient-primary p-3 rounded-2xl shadow-lg">
                  <Lock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Ready to Create Admin Account</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Core infrastructure is configured. Create your admin account to access the dashboard.
                </p>
              </div>
            </div>
            {errorCount > 0 && (
              <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  {errorCount} configuration {errorCount === 1 ? 'issue' : 'issues'} remain. Some features may not work. Fix them for full functionality.
                </span>
              </div>
            )}
            <Button
              onClick={() => setShowAdminDialog(true)}
              className="w-full gap-2 btn-gradient rounded-xl font-semibold shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              Create Admin Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Admin Exists */}
        {status && visibleCards >= totalChecks && status.adminExists && (
          <div className="rounded-2xl border glass-card-static p-6 text-center space-y-4 animate-slide-down">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-20 blur-xl" />
                <div className="relative bg-gradient-primary p-4 rounded-full">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gradient">Admin Account Exists</h3>
              <p className="text-sm text-muted-foreground mt-1">
                An admin user is already configured. Go to the login page to sign in.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="gap-2 btn-gradient-ghost rounded-xl font-semibold"
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
        <DialogContent className="glass-dialog-content animate-fade-in-scale sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-xl opacity-20 blur-md" />
                <div className="relative bg-gradient-primary p-2 rounded-xl">
                  <Shield className="h-5 w-5 text-white" />
                </div>
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
                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                <Input id="firstName" placeholder="John" {...register('firstName')} className={errors.firstName ? 'border-destructive/50' : ''} />
                {errors.firstName && <p className="text-xs text-destructive font-medium">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                <Input id="lastName" placeholder="Doe" {...register('lastName')} className={errors.lastName ? 'border-destructive/50' : ''} />
                {errors.lastName && <p className="text-xs text-destructive font-medium">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input id="email" type="email" placeholder="admin@example.com" {...register('email')} className={errors.email ? 'border-destructive/50' : ''} />
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Minimum 8 characters" {...register('password')} className={errors.password ? 'border-destructive/50 pr-10' : 'pr-10'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 btn-gradient-ghost rounded-xl" onClick={() => setShowAdminDialog(false)} disabled={isCreating}>Cancel</Button>
              <Button type="submit" className="flex-1 gap-2 btn-gradient rounded-xl font-semibold" disabled={isCreating}>
                {isCreating ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : <><Sparkles className="h-4 w-4" /> Create Admin</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
