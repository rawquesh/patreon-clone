'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Search,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  getSubscriptions,
  getSubscriptionById,
  cancelSubscription,
  getSubscriptionStats,
} from '@/lib/services';
import type { Subscription, SubscriptionStats, SubscriptionStatus } from '@/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const variant =
    status === 'active' ? 'default'
    : status === 'cancelled' ? 'secondary'
    : 'destructive';
  return <Badge variant={variant}>{status}</Badge>;
}

function SubscriptionDetailDialog({
  subscription,
  open,
  onClose,
  onAction,
}: {
  subscription: Subscription | null;
  open: boolean;
  onClose: () => void;
  onAction: (id: string, action: string) => Promise<void>;
}) {
  const { toast } = useToast();
  const [detail, setDetail] = useState<Subscription | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && subscription) {
      setLoadingDetail(true);
      getSubscriptionById(subscription.id || (subscription as any)._id)
        .then(setDetail)
        .catch(() => toast({ title: 'Failed to load subscription', variant: 'destructive' }))
        .finally(() => setLoadingDetail(false));
    }
  }, [open, subscription]);

  const handleAction = async () => {
    if (!detail) return;
    const id = detail.id || (detail as any)._id;
    setLoading(true);
    try {
      await onAction(id, 'cancel');
      onClose();
    } catch {
      toast({ title: 'Cancel failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const s = detail || subscription;
  if (!s) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Subscription Details</DialogTitle>
          <DialogDescription>Full details for this subscription.</DialogDescription>
        </DialogHeader>
        {loadingDetail ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : s ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div>
                <StatusBadge status={s.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Member</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={s.member.avatar || ''} />
                    <AvatarFallback>{s.member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{s.member.name}</p>
                    <p className="text-xs text-muted-foreground">{s.member.email}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Creator</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{s.creator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-sm">{s.creator.name}</p>
                </div>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="font-semibold">{s.plan || s.membership?.name || '-'}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Monthly Rate</p>
                <p className="font-semibold">{formatCurrency(s.amount || s.monthlyRate)}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Current Period</p>
                <p className="text-sm">
                  {s.currentPeriodStart
                    ? new Date(s.currentPeriodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '-'}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Next Billing</p>
                <p className="text-sm">
                  {s.currentPeriodEnd
                    ? new Date(s.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '-'}
                </p>
              </div>
              {s.stripeSubscriptionId && (
                <div className="rounded-md border p-3 col-span-2">
                  <p className="text-xs text-muted-foreground">Stripe Subscription ID</p>
                  <p className="text-xs font-mono">{s.stripeSubscriptionId}</p>
                </div>
              )}
              {s.isTrial && (
                <div className="rounded-md border p-3 col-span-2">
                  <Badge variant="secondary">Trial Subscription</Badge>
                </div>
              )}
              {s.hasDiscount && s.discountData && (
                <div className="rounded-md border p-3 col-span-2">
                  <p className="text-xs text-muted-foreground">Discount Applied</p>
                  <p className="text-sm">
                    {s.discountData.discountCode} — from {formatCurrency(s.discountData.originalPrice || 0)} to {formatCurrency(s.discountData.discountedPrice || 0)}
                  </p>
                </div>
              )}
            </div>

            {s.status === 'active' && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleAction}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Cancel Subscription
              </Button>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const handleAction = async (id: string, action: string) => {
    if (action === 'cancel') {
      await cancelSubscription(id);
      toast({ title: 'Subscription cancelled' });
    }
    load();
  };

  return (
    <>
      <PageHeader title="Subscriptions" description="Monitor all subscriptions and revenue." />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
          <StatCard title="MRR" value={formatCurrency(stats.mrr)} icon={DollarSign} description={`${stats.totalActive} active subscriptions`} />
          <StatCard title="Active Subscriptions" value={stats.totalActive.toLocaleString()} icon={Users} description={`${stats.totalTrial} on trial`} />
          <StatCard title="Avg. Revenue/User" value={formatCurrency(stats.arpu)} icon={TrendingUp} description={`${stats.totalSubscriptions} total`} />
          <StatCard title="Churn Rate" value={`${stats.churnRate}%`} icon={TrendingDown} description={`${stats.totalCancelled} cancelled`} />
        </div>
      ) : null}

      <div className="mt-6">
        <Card>
          <CardContent className="p-0">
            <div className="p-4 flex flex-col gap-3 border-b">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscriptions..."
                    value={searchValue}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); updateParams({ status: v, page: '1' }); }}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-destructive mb-3">{error}</p>
                <Button variant="outline" onClick={load}>Retry</Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Billing</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No subscriptions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscriptions.map((sub) => (
                        <TableRow key={sub.id || (sub as any)._id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={sub.member.avatar || ''} />
                                <AvatarFallback>{sub.member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div>{sub.member.name}</div>
                                <div className="text-sm text-muted-foreground">{sub.member.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{sub.creator.name}</TableCell>
                          <TableCell>{sub.plan || sub.membership?.name || '-'}</TableCell>
                          <TableCell><StatusBadge status={sub.status} /></TableCell>
                          <TableCell>
                            {sub.nextBilling || sub.currentPeriodEnd
                              ? new Date(sub.nextBilling || sub.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            ${(sub.amount || sub.monthlyRate || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedSub(sub); setDialogOpen(true); }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateParams({ page: String(page - 1) })} disabled={page <= 1}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="flex items-center text-sm">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => updateParams({ page: String(page + 1) })} disabled={page >= pagination.totalPages}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <SubscriptionDetailDialog
        subscription={selectedSub}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAction={handleAction}
      />
    </>
  );
}
