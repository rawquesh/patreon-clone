'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  getPayouts,
  approvePayout,
  rejectPayout,
  getPayoutStats,
} from '@/lib/services';
import { PayoutDetailDialog } from '@/components/dialogs';
import type { Payout, PayoutStatus, PayoutStats } from '@/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
}

function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  const config = {
    completed: { label: 'Approved', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    pending: { label: 'Pending', class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    processing: { label: 'Processing', class: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    failed: { label: 'Rejected', class: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  };
  const c = config[status] || config.pending;
  return <Badge className={cn('text-xs font-medium border', c.class)}>{c.label}</Badge>;
}


const STATUS_TABS = [
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'completed', label: 'Approved', icon: CheckCircle },
  { value: 'failed', label: 'Rejected', icon: XCircle },
];

function PayoutsPageSkeleton() {
  return (
    <div className="space-y-4">
      <PageHeader title="Payout Manager" description="Process, track, and manage creator payouts." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card-static">
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="glass-card-static rounded-xl overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
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

export default function PayoutsPage() {
  return (
    <Suspense fallback={<PayoutsPageSkeleton />}>
      <PayoutsPageInner />
    </Suspense>
  );
}

function PayoutsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const page = Number(searchParams.get('page') || '1');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [payoutResult, statsResult] = await Promise.all([
        getPayouts({ page, limit: 20, status: activeTab as any }),
        getPayoutStats(),
      ]);
      setPayouts(payoutResult.payouts);
      setPagination(payoutResult.pagination);
      setStats(statsResult);
    } catch (e: any) {
      setError(e?.message || 'Failed to load payouts');
    } finally {
      setIsLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      if (action === 'approve') {
        await approvePayout(id);
        toast({ title: 'Payout approved successfully' });
      } else {
        await rejectPayout(id);
        toast({ title: 'Payout rejected' });
      }
      load();
    } catch (e: any) {
      toast({ title: `Action failed: ${e?.message}`, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== null) params.set(key, value);
    }
    router.push(`?${params.toString()}`);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <PageHeader title="Payout Manager" description="Process, track, and manage creator payouts." gradientTitle />

      {/* Stat Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass-card-static">
              <CardHeader className="pb-2">
                <Skeleton className="h-3 w-24 mb-3" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children mb-6">
          <StatCard
            title="Pending Payouts"
            value={formatCurrency(stats.pendingAmount)}
            icon={Clock}
            description={`${stats.pendingCount} open requests`}
            accentColor="amber"
          />
          <StatCard
            title="Paid This Month"
            value={formatCurrency(stats.paidThisMonthAmount)}
            icon={CheckCircle}
            description={`${stats.paidThisMonth} payouts`}
            accentColor="emerald"
          />
          <StatCard
            title="Total Paid"
            value={formatCurrency(stats.totalPaid)}
            icon={Wallet}
            description="All-time payouts"
            accentColor="primary"
          />
          <StatCard
            title="Rejected"
            value={stats.rejectedCount.toString()}
            icon={XCircle}
            description="Rejected payouts"
            accentColor="rose"
          />
        </div>
      ) : null}

      {/* Tabs + Table */}
      <Card className="glass-card-static overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base font-semibold">Payout Requests</CardTitle>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); updateParams({ status: v, page: '1' }); }} className="flex-1">
              <TabsList className="h-9 bg-muted/50 rounded-xl">
                {STATUS_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      'h-8 rounded-lg text-xs font-medium transition-all duration-200',
                      'data-[state=active]:bg-gradient-primary data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-md'
                    )}
                  >
                    <tab.icon className="h-3.5 w-3.5 mr-1.5" />
                    {tab.label}
                    {!isLoading && stats && (
                      <span className={cn(
                        'ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full',
                        'bg-white/20 dark:bg-white/10'
                      )}>
                        {tab.value === 'pending' ? stats.pendingCount :
                         tab.value === 'completed' ? stats.paidThisMonth :
                         stats.rejectedCount}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <CardDescription className="text-xs mt-1">Review and process creator payout requests.</CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="pl-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Creator</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Request Date</TableHead>
                {activeTab !== 'pending' && <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Processed</TableHead>}
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right pr-6">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pr-6"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/30 last:border-0">
                    <TableCell className="pl-6"><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    {activeTab !== 'pending' && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={activeTab === 'pending' ? 5 : 6} className="text-center py-12 text-destructive">
                    <p className="font-medium mb-3">{error}</p>
                    <Button variant="outline" onClick={load} size="sm" className="btn-gradient-ghost rounded-xl">Retry</Button>
                  </TableCell>
                </TableRow>
              ) : payouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={activeTab === 'pending' ? 5 : 6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        No {activeTab} payouts
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                payouts.map((payout) => (
                  <TableRow
                    key={payout.id || (payout as any)._id}
                    className="table-row-hover border-b border-border/30 last:border-0 group"
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                          <AvatarImage src={payout.creator?.avatar || ''} />
                          <AvatarFallback className="bg-gradient-accent text-slate-900 dark:text-white text-sm font-bold">
                            {(payout.creator?.name || 'C').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{payout.creator?.name || 'Unknown'}</div>
                          {payout.creator?.username && (
                            <div className="text-xs text-muted-foreground truncate">@{payout.creator.username}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{formatDate(payout.createdAt)}</span>
                    </TableCell>
                    {activeTab !== 'pending' && (
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{formatDate(payout.completedAt || '')}</span>
                      </TableCell>
                    )}
                    <TableCell>
                      <PayoutStatusBadge status={payout.status} />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <span className={cn(
                        'text-sm font-bold tabular-nums',
                        payout.status === 'failed' ? 'text-rose-600 dark:text-rose-400' :
                        payout.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                        'text-amber-600 dark:text-amber-400'
                      )}>
                        {formatCurrency(payout.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedPayout(payout)}
                          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {activeTab === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAction(payout.id || (payout as any)._id, 'approve')}
                              disabled={actionLoading === (payout.id || (payout as any)._id)}
                              className="h-8 px-3 rounded-lg btn-gradient text-xs font-semibold shadow-md"
                            >
                              {actionLoading === (payout.id || (payout as any)._id) ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleAction(payout.id || (payout as any)._id, 'reject')}
                              disabled={actionLoading === (payout.id || (payout as any)._id)}
                              className="h-8 px-3 rounded-lg text-xs font-semibold"
                            >
                              {actionLoading === (payout.id || (payout as any)._id) ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
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
      </Card>

      <PayoutDetailDialog
        payout={selectedPayout}
        onClose={() => setSelectedPayout(null)}
      />
    </>
  );
}
