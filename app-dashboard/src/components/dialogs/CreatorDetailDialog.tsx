'use client';

import { useEffect, useState } from 'react';
import { DetailDialog } from './DetailDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Ban, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  getCreatorById,
  approveCreator,
  rejectCreator,
  suspendCreator,
  activateCreator,
} from '@/lib/services';
import type { Creator, CreatorDetail, CreatorStatus } from '@/types';

function CreatorStatusBadge({ status }: { status: CreatorStatus }) {
  const config = {
    PUBLISHED: { label: 'Active', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    ONBOARDING: { label: 'Onboarding', class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    DRAFT: { label: 'Draft', class: 'bg-muted text-muted-foreground border-border' },
    ARCHIVED: { label: 'Archived', class: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  };
  const c = config[status] || config.DRAFT;
  return <Badge className={cn('text-xs font-medium border', c.class)}>{c.label}</Badge>;
}

interface CreatorDetailDialogProps {
  creator: Creator | CreatorDetail | null;
  onClose: () => void;
  onRefresh: () => void;
}

export function CreatorDetailDialog({ creator, onClose, onRefresh }: CreatorDetailDialogProps) {
  const { toast } = useToast();
  const [detail, setDetail] = useState<CreatorDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const open = !!creator;

  useEffect(() => {
    if (open && creator) {
      setLoadingDetail(true);
      getCreatorById(creator.id || (creator as any)._id)
        .then(setDetail)
        .catch(() => toast({ title: 'Failed to load creator details', variant: 'destructive' }))
        .finally(() => setLoadingDetail(false));
    } else if (!open) {
      setDetail(null);
    }
  }, [open, creator]);

  const handleAction = async (action: string) => {
    if (!detail) return;
    const id = detail.id || (detail as any)._id;
    setLoading(true);
    try {
      if (action === 'approve') {
        await approveCreator(id);
        toast({ title: 'Creator approved successfully' });
      } else if (action === 'reject') {
        await rejectCreator(id);
        toast({ title: 'Creator rejected' });
      } else if (action === 'suspend') {
        await suspendCreator(id);
        toast({ title: 'Creator suspended' });
      } else if (action === 'activate') {
        await activateCreator(id);
        toast({ title: 'Creator activated' });
      }
      onRefresh();
      onClose();
    } catch {
      toast({ title: 'Action failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const c = detail;

  return (
    <DetailDialog
      open={open}
      onOpenChange={(o) => { if (!o) onClose(); }}
      title="Creator Details"
      description="Full profile information for this creator."
    >
      {loadingDetail ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : c ? (
        <div className="space-y-5">
          {/* Profile header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-20 blur-md" />
              <Avatar className="h-16 w-16 ring-2 ring-white dark:ring-gray-800">
                <AvatarImage src={c.profilePicture || ''} />
                <AvatarFallback className="bg-gradient-primary text-slate-900 dark:text-white font-bold text-lg">
                  {(c.displayName || c.creatorUsername || 'C').charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate">
                {c.displayName || c.creatorUsername || 'Unknown'}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{c.email}</p>
              {c.creatorUsername && (
                <p className="text-xs text-muted-foreground">@{c.creatorUsername}</p>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <CreatorStatusBadge status={c.creatorStatus} />
            </div>
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Stripe</p>
              <Badge className={cn(
                'text-xs font-medium',
                c.hasCompletedStripeOnboarding
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-muted text-muted-foreground border border-border'
              )}>
                {c.hasCompletedStripeOnboarding ? 'Onboarded' : 'Not Onboarded'}
              </Badge>
            </div>
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Subscribers</p>
              <p className="font-bold text-lg">{c.subscriberCount ?? '-'}</p>
            </div>
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Posts</p>
              <p className="font-bold text-lg">{c.postCount ?? '-'}</p>
            </div>
            <div className="rounded-xl border p-3.5 col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                ${(c.availableBalance || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {c.bio && (
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-1.5">Bio</p>
              <p className="text-sm leading-relaxed">{c.bio}</p>
            </div>
          )}

          {c.creatorCategory && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Category:</span>
              <Badge variant="outline" className="text-xs">{c.creatorCategory}</Badge>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
            {c.creatorStatus !== 'PUBLISHED' && (
              <Button size="sm" onClick={() => handleAction('approve')} disabled={loading} className="btn-gradient">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Approve
              </Button>
            )}
            {c.creatorStatus === 'PUBLISHED' && (
              <Button size="sm" variant="destructive" onClick={() => handleAction('suspend')} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                Suspend
              </Button>
            )}
            {c.creatorStatus === 'ARCHIVED' && (
              <Button size="sm" onClick={() => handleAction('activate')} disabled={loading} className="btn-gradient">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Reactivate
              </Button>
            )}
            {(c.creatorStatus === 'DRAFT' || c.creatorStatus === 'ONBOARDING') && (
              <Button size="sm" variant="destructive" onClick={() => handleAction('reject')} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Reject
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">No data available.</p>
      )}
    </DetailDialog>
  );
}
