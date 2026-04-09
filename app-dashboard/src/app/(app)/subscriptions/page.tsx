'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  getSubscriptions,
  getSubscriptionStats,
} from '@/lib/services';
import { SubscriptionDetailDialog } from '@/components/dialogs';
import type { Subscription, SubscriptionStats, SubscriptionStatus } from '@/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const config = {
    active: { label: 'Active', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    cancelled: { label: 'Cancelled', class: 'bg-muted text-muted-foreground border-border' },
    expired: { label: 'Expired', class: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  };
  const c = config[status] || config.cancelled;
  return <Badge className={cn('text-xs font-medium border', c.class)}>{c.label}</Badge>;
}


function SubscriptionsPageSkeleton() {
  return (
    <div className="space-y-4">
      <PageHeader title="Subscriptions" description="Monitor all subscriptions and revenue." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card-static">
            <CardContent className="pt-6">
              <Skeleton className="h-3 w-24 mb-3" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="glass-card-static rounded-xl overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-border/30 last:border-0">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<SubscriptionsPageSkeleton />}>
      <SubscriptionsPageInner />
    </Suspense>
  );
}

function SubscriptionsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  const page = Number(searchParams.get('page') || '1');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [subResult, statsResult] = await Promise.all([
        getSubscriptions({
          page,
          limit: 20,
          search: searchParams.get('search') || undefined,
          status: statusFilter !== 'all' ? statusFilter as any : undefined,
        }),
        getSubscriptionStats(),
      ]);
      setSubscriptions(subResult.subscriptions);
      setPagination(subResult.pagination);
      setStats(statsResult);
    } catch (e: any) {
      setError(e?.message || 'Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchParams, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateParams({ search: value, page: '1' });
  };

  return (
    <>
      <PageHeader title="Subscriptions" description="Monitor all subscriptions and revenue." gradientTitle />

      {/* Stat Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass-card-static">
              <CardContent className="pt-6">
                <Skeleton className="h-3 w-24 mb-3" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children mb-6">
          <StatCard title="MRR" value={formatCurrency(stats.mrr)} icon={DollarSign} description={`${stats.totalActive} active subscriptions`} accentColor="emerald" />
          <StatCard title="Active Subscriptions" value={stats.totalActive.toLocaleString()} icon={Users} description={`${stats.totalTrial} on trial`} accentColor="primary" />
          <StatCard title="Avg. Revenue/User" value={formatCurrency(stats.arpu)} icon={TrendingUp} description={`${stats.totalSubscriptions} total`} accentColor="accent" />
          <StatCard
            title="Churn Rate"
            value={`${stats.churnRate}%`}
            icon={TrendingDown}
            description={`${stats.totalCancelled} cancelled`}
            accentColor={stats.churnRate > 5 ? 'rose' : 'amber'}
          />
        </div>
      ) : null}

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="glass-input pl-10 h-11 rounded-xl text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); updateParams({ status: v, page: '1' }); }}>
          <SelectTrigger className="h-11 rounded-xl text-sm w-[180px] btn-gradient-ghost">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="glass-menu rounded-xl">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card-static rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="pl-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Member</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Creator</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Billing</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right pr-6">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pr-6"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/30 last:border-0">
                    <TableCell className="pl-6"><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-14 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-destructive">
                    <p className="font-medium mb-3">{error}</p>
                    <Button variant="outline" onClick={load} size="sm" className="btn-gradient-ghost">Retry</Button>
                  </TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">No subscriptions found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => (
                  <TableRow key={sub.id || (sub as any)._id} className="table-row-hover border-b border-border/30 last:border-0 group">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                          <AvatarImage src={sub.member.avatar || ''} />
                          <AvatarFallback className="text-xs bg-gradient-primary text-slate-900 dark:text-white font-bold">
                            {sub.member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{sub.member.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{sub.member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground truncate block max-w-[120px]">{sub.creator.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{sub.plan || sub.membership?.name || '-'}</span>
                    </TableCell>
                    <TableCell><StatusBadge status={sub.status} /></TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {sub.nextBilling || sub.currentPeriodEnd
                          ? new Date(sub.nextBilling || sub.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ${(sub.amount || sub.monthlyRate || 0).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedSub(sub)}
                        className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => updateParams({ page: String(page - 1) })} disabled={page <= 1} className="h-8 w-8 p-0 rounded-lg btn-gradient-ghost">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => updateParams({ page: String(page + 1) })} disabled={page >= pagination.totalPages} className="h-8 w-8 p-0 rounded-lg btn-gradient-ghost">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <SubscriptionDetailDialog
        subscription={selectedSub}
        onClose={() => setSelectedSub(null)}
        onRefresh={load}
      />
    </>
  );
}
