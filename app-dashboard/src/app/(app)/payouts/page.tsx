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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import {
  getPayouts,
  getPayoutById,
  approvePayout,
  rejectPayout,
  getPayoutStats,
} from '@/lib/services';
import type { Payout, PayoutDetail, PayoutStatus, PayoutStats } from '@/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  const variant =
    status === 'completed' ? 'default'
    : status === 'pending' || status === 'processing' ? 'secondary'
    : 'destructive';
  const label =
    status === 'completed' ? 'Approved'
    : status === 'pending' ? 'Pending'
    : status === 'processing' ? 'Processing'
    : 'Rejected';
  return <Badge variant={variant}>{label}</Badge>;
}

function PayoutDetailDialog({
  payout,
  open,
  onClose,
}: {
  payout: Payout | null;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [detail, setDetail] = useState<PayoutDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (open && payout) {
      setLoadingDetail(true);
      getPayoutById(payout.id || (payout as any)._id)
        .then(setDetail)
        .catch(() => toast({ title: 'Failed to load payout details', variant: 'destructive' }))
        .finally(() => setLoadingDetail(false));
    }
  }, [open, payout]);

  const p = detail || payout;
  if (!p) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payout Details</DialogTitle>
          <DialogDescription>Details for this payout request.</DialogDescription>
        </DialogHeader>
        {loadingDetail ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : p ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={p.creator?.avatar || ''} />
                <AvatarFallback>
                  {(p.creator?.name || 'C').charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{p.creator?.name || 'Unknown'}</p>
                {p.creator?.username && (
                  <p className="text-sm text-muted-foreground">@{p.creator.username}</p>
                )}
              </div>
              <PayoutStatusBadge status={p.status} />
            </div>

            <div className="text-center py-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold">{formatCurrency(p.amount)}</p>
              <p className="text-sm text-muted-foreground">Payout Amount</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Requested</p>
                <p className="font-medium text-sm">
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '-'}
                </p>
              </div>
              {p.completedAt && (
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Processed</p>
                  <p className="font-medium text-sm">
                    {new Date(p.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}
              {p.stripeTransferId && (
                <div className="rounded-md border p-3 col-span-2">
                  <p className="text-xs text-muted-foreground">Stripe Transfer ID</p>
                  <p className="text-xs font-mono">{p.stripeTransferId}</p>
                </div>
              )}
              {p.failureReason && (
                <div className="rounded-md border p-3 col-span-2 border-destructive/50">
                  <p className="text-xs text-muted-foreground">Failure Reason</p>
                  <p className="text-sm text-destructive">{p.failureReason}</p>
                </div>
              )}
              {detail?.creator && (
                <>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Available Balance</p>
                    <p className="font-medium text-sm">{formatCurrency(detail.creator.availableBalance || 0)}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Lifetime Earnings</p>
                    <p className="font-medium text-sm">{formatCurrency(detail.creator.lifetimeEarnings || 0)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

const STATUS_TABS = [
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'completed', label: 'Approved', icon: CheckCircle },
  { value: 'failed', label: 'Rejected', icon: XCircle },
];

export default function PayoutsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const page = Number(searchParams.get('page') || '1');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [payoutResult, statsResult] = await Promise.all([
        getPayouts({
          page,
          limit: 20,
          status: activeTab as any,
        }),
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
      <PageHeader title="Payout Manager" description="Process, track, and manage creator payouts." />

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
          <StatCard
            title="Pending Payouts"
            value={formatCurrency(stats.pendingAmount)}
            icon={Clock}
            description={`${stats.pendingCount} open requests`}
          />
          <StatCard
            title="Paid This Month"
            value={formatCurrency(stats.paidThisMonthAmount)}
            icon={CheckCircle}
            description={`${stats.paidThisMonth} payouts`}
          />
          <StatCard
            title="Total Paid"
            value={formatCurrency(stats.totalPaid)}
            icon={Wallet}
            description="All-time payouts"
          />
          <StatCard
            title="Rejected"
            value={stats.rejectedCount.toString()}
            icon={XCircle}
            description="Rejected payouts"
          />
        </div>
      ) : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
          <CardDescription>Review and process creator payout requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); updateParams({ status: v, page: '1' }); }}>
            <TabsList>
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {STATUS_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
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
                  <div className="text-center py-8">
                    <p className="text-destructive mb-3">{error}</p>
                    <Button variant="outline" onClick={load}>Retry</Button>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Creator</TableHead>
                          <TableHead>Request Date</TableHead>
                          {tab.value !== 'pending' && <TableHead>Processed Date</TableHead>}
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payouts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={tab.value === 'pending' ? 5 : 6} className="text-center py-8 text-muted-foreground">
                              No {tab.label.toLowerCase()} payouts.
                            </TableCell>
                          </TableRow>
                        ) : (
                          payouts.map((payout) => (
                            <TableRow key={payout.id || (payout as any)._id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={payout.creator?.avatar || ''} />
                                    <AvatarFallback>
                                      {(payout.creator?.name || 'C').charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div>{payout.creator?.name || 'Unknown'}</div>
                                    {payout.creator?.username && (
                                      <div className="text-sm text-muted-foreground">
                                        @{payout.creator.username}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{formatDate(payout.createdAt)}</TableCell>
                              {tab.value !== 'pending' && (
                                <TableCell>{formatDate(payout.completedAt || '')}</TableCell>
                              )}
                              <TableCell><PayoutStatusBadge status={payout.status} /></TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(payout.amount)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => { setSelectedPayout(payout); setDialogOpen(true); }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {tab.value === 'pending' && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAction(payout.id || (payout as any)._id, 'approve')}
                                        disabled={actionLoading === (payout.id || (payout as any)._id)}
                                      >
                                        {actionLoading === (payout.id || (payout as any)._id) ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Check className="h-4 w-4" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleAction(payout.id || (payout as any)._id, 'reject')}
                                        disabled={actionLoading === (payout.id || (payout as any)._id)}
                                      >
                                        {actionLoading === (payout.id || (payout as any)._id) ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <XCircle className="h-4 w-4" />
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

                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <PayoutDetailDialog
        payout={selectedPayout}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
