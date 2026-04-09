'use client';

import { useEffect, useState } from 'react';
import { DetailDialog } from './DetailDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getSubscriptionById, cancelSubscription } from '@/lib/services';
import type { Subscription } from '@/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    active: { label: 'Active', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    cancelled: { label: 'Cancelled', class: 'bg-muted text-muted-foreground border-border' },
    expired: { label: 'Expired', class: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  };
  const c = config[status as keyof typeof config] || config.cancelled;
  return <Badge className={cn('text-xs font-medium border', c.class)}>{c.label}</Badge>;
}

interface SubscriptionDetailDialogProps {
  subscription: Subscription | null;
  onClose: () => void;
  onRefresh: () => void;
}

export function SubscriptionDetailDialog({ subscription, onClose, onRefresh }: SubscriptionDetailDialogProps) {
  const { toast } = useToast();
  const [detail, setDetail] = useState<Subscription | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const open = !!subscription;

  useEffect(() => {
    if (open && subscription) {
      setLoadingDetail(true);
      getSubscriptionById(subscription.id || (subscription as any)._id)
        .then(setDetail)
        .catch(() => toast({ title: 'Failed to load subscription', variant: 'destructive' }))
        .finally(() => setLoadingDetail(false));
    } else if (!open) {
      setDetail(null);
    }
  }, [open, subscription]);

  const handleCancel = async () => {
    if (!detail) return;
    const id = detail.id || (detail as any)._id;
    setLoading(true);
    try {
      await cancelSubscription(id);
      toast({ title: 'Subscription cancelled' });
      onRefresh();
      onClose();
    } catch {
      toast({ title: 'Cancel failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const s = detail || subscription;

  return (
    <DetailDialog
      open={open}
      onOpenChange={(o) => { if (!o) onClose(); }}
      title="Subscription Details"
      description="Full details for this subscription."
    >
      {loadingDetail ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : s ? (
        <div className="space-y-5">
          <div className="text-center py-2">
            <StatusBadge status={s.status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Member</p>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={s.member.avatar || ''} />
                  <AvatarFallback className="text-xs bg-gradient-primary text-slate-900 dark:text-white">{s.member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{s.member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.member.email}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Creator</p>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-gradient-accent text-slate-900 dark:text-white">{s.creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-medium text-sm truncate">{s.creator.name}</p>
              </div>
            </div>
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Plan</p>
              <p className="font-semibold text-sm">{s.plan || s.membership?.name || '-'}</p>
            </div>
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Monthly Rate</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(s.amount || s.monthlyRate)}</p>
            </div>
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Current Period</p>
              <p className="text-sm">
                {s.currentPeriodStart ? new Date(s.currentPeriodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
              </p>
            </div>
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Next Billing</p>
              <p className="text-sm">
                {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
              </p>
            </div>
            {s.stripeSubscriptionId && (
              <div className="rounded-xl border p-3.5 col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Stripe Subscription ID</p>
                <p className="text-xs font-mono break-all">{s.stripeSubscriptionId}</p>
              </div>
            )}
            {s.isTrial && (
              <div className="rounded-xl border p-3.5 col-span-2">
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">Trial Subscription</Badge>
              </div>
            )}
            {s.hasDiscount && s.discountData && (
              <div className="rounded-xl border p-3.5 col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Discount Applied</p>
                <p className="text-sm">
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{s.discountData.discountCode}</span>
                  <span className="mx-2 text-muted-foreground">from</span>
                  <span className="line-through text-muted-foreground">{formatCurrency(s.discountData.originalPrice || 0)}</span>
                  <span className="mx-1">to</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(s.discountData.discountedPrice || 0)}</span>
                </p>
              </div>
            )}
          </div>

          {s.status === 'active' && (
            <div className="pt-2 border-t border-border/50">
              <Button size="sm" variant="destructive" onClick={handleCancel} disabled={loading} className="rounded-lg w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Cancel Subscription
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </DetailDialog>
  );
}
