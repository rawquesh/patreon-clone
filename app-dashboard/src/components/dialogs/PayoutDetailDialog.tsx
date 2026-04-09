'use client';

import { useEffect, useState } from 'react';
import { DetailDialog } from './DetailDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getPayoutById } from '@/lib/services';
import type { Payout, PayoutDetail, PayoutStatus } from '@/types';

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

interface PayoutDetailDialogProps {
  payout: Payout | null;
  onClose: () => void;
}

export function PayoutDetailDialog({ payout, onClose }: PayoutDetailDialogProps) {
  const { toast } = useToast();
  const [detail, setDetail] = useState<PayoutDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const open = !!payout;

  useEffect(() => {
    if (open && payout) {
      setLoadingDetail(true);
      getPayoutById(payout.id || (payout as any)._id)
        .then(setDetail)
        .catch(() => toast({ title: 'Failed to load payout details', variant: 'destructive' }))
        .finally(() => setLoadingDetail(false));
    } else if (!open) {
      setDetail(null);
    }
  }, [open, payout]);

  const p = detail || payout;

  return (
    <DetailDialog
      open={open}
      onOpenChange={(o) => { if (!o) onClose(); }}
      title="Payout Details"
      description="Details for this payout request."
      maxWidth="max-w-md"
    >
      {loadingDetail ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : p ? (
        <div className="space-y-5">
          {/* Creator header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-accent rounded-full opacity-20 blur-md" />
              <Avatar className="h-12 w-12">
                <AvatarImage src={p.creator?.avatar || ''} />
                <AvatarFallback className="bg-gradient-accent text-slate-900 dark:text-white font-bold text-lg">
                  {(p.creator?.name || 'C').charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg truncate">{p.creator?.name || 'Unknown'}</p>
              {p.creator?.username && (
                <p className="text-sm text-muted-foreground">@{p.creator.username}</p>
              )}
            </div>
            <PayoutStatusBadge status={p.status} />
          </div>

          {/* Amount highlight */}
          <div className="relative overflow-hidden rounded-2xl border border-border/50 py-5 text-center">
            <div className="absolute inset-0 bg-gradient-primary/5" />
            <p className="relative text-3xl font-black tracking-tight text-gradient">
              {formatCurrency(p.amount)}
            </p>
            <p className="relative text-xs text-muted-foreground mt-1">Payout Amount</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Requested</p>
              <p className="font-medium text-sm">
                {p.createdAt
                  ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '-'}
              </p>
            </div>
            {p.completedAt && (
              <div className="rounded-xl border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">Processed</p>
                <p className="font-medium text-sm">
                  {new Date(p.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}
            {p.stripeTransferId && (
              <div className="rounded-xl border p-3.5 col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Stripe Transfer ID</p>
                <p className="text-xs font-mono break-all">{p.stripeTransferId}</p>
              </div>
            )}
            {p.failureReason && (
              <div className="rounded-xl border p-3.5 col-span-2 border-rose-200 dark:border-rose-800">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-3 w-3 text-rose-500" />
                  <p className="text-xs text-muted-foreground">Failure Reason</p>
                </div>
                <p className="text-sm text-rose-600 dark:text-rose-400">{p.failureReason}</p>
              </div>
            )}
            {detail?.creator && (
              <>
                <div className="rounded-xl border p-3.5">
                  <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(detail.creator.availableBalance || 0)}
                  </p>
                </div>
                <div className="rounded-xl border p-3.5">
                  <p className="text-xs text-muted-foreground mb-1">Lifetime Earnings</p>
                  <p className="font-bold">
                    {formatCurrency(detail.creator.lifetimeEarnings || 0)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </DetailDialog>
  );
}
