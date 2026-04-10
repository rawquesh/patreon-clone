'use client';

import { useEffect, useState } from 'react';
import { DetailDialog } from './DetailDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, UserX, UserCheck, User, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getMemberById, deactivateMember, activateMember, promoteToAdmin } from '@/lib/services';
import type { Member, MemberDetail } from '@/types';

interface MemberDetailDialogProps {
  member: Member | null;
  onClose: () => void;
  onRefresh: () => void;
}

export function MemberDetailDialog({ member, onClose, onRefresh }: MemberDetailDialogProps) {
  const { toast } = useToast();
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const open = !!member;

  useEffect(() => {
    if (open && member) {
      setLoadingDetail(true);
      getMemberById(member.id || (member as any)._id)
        .then(setDetail)
        .catch(() => toast({ title: 'Failed to load member details', variant: 'destructive' }))
        .finally(() => setLoadingDetail(false));
    } else if (!open) {
      setDetail(null);
    }
  }, [open, member]);

  const handleAction = async (action: string) => {
    if (!detail) return;
    const id = detail.id || (detail as any)._id;
    setLoading(true);
    try {
      if (action === 'deactivate') {
        await deactivateMember(id);
        toast({ title: 'Member deactivated' });
      } else if (action === 'promote-to-admin') {
        await promoteToAdmin(id);
        toast({ title: 'Member promoted to admin' });
      } else {
        await activateMember(id);
        toast({ title: 'Member activated' });
      }
      onRefresh();
      onClose();
    } catch {
      toast({ title: `${action} failed`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const d = detail;

  return (
    <DetailDialog
      open={open}
      onOpenChange={(o) => { if (!o) onClose(); }}
      title="Member Details"
      description="Full profile information for this member."
    >
      {loadingDetail ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : d ? (
        <div className="space-y-5">
          {/* Profile header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-20 blur-md" />
              <Avatar className="h-16 w-16 ring-2 ring-white dark:ring-gray-800">
                <AvatarImage src={d.profilePicture || ''} />
                <AvatarFallback className="bg-gradient-primary text-slate-900 dark:text-white font-bold text-lg">
                  {(d.displayName || d.firstName || 'M').charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate">
                {d.displayName || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Unknown'}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{d.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge className={cn(
                  'text-xs font-medium border',
                  d.isDeactivated
                    ? 'bg-muted text-muted-foreground border-border'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                )}>
                  {d.isDeactivated ? 'Inactive' : 'Active'}
                </Badge>
                {d.isAdmin && (
                  <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800 text-xs font-medium">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {d.countryOfResidence && (
              <div className="rounded-xl border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">Country</p>
                <p className="font-medium text-sm">{d.countryOfResidence}</p>
              </div>
            )}
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Member Since</p>
              <p className="font-medium text-sm">
                {d.createdAt
                  ? new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '-'}
              </p>
            </div>
          </div>

          {/* Subscriptions */}
          {d.subscriptions && d.subscriptions.length > 0 ? (
            <div className="rounded-xl border">
              <div className="px-3.5 py-2.5 border-b border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subscriptions</p>
              </div>
              <div className="divide-y divide-border/30">
                {d.subscriptions.slice(0, 5).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={sub.creator?.profilePicture || ''} />
                        <AvatarFallback className="bg-gradient-accent text-slate-900 dark:text-white text-xs">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {sub.creator?.displayName || sub.creator?.creatorUsername || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">{sub.membership?.name || '-'}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-bold">${(sub.monthlyRate || 0).toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                      <Badge className={cn('text-xs font-medium border',
                        sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                        sub.status === 'expired' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' :
                        'bg-muted text-muted-foreground border-border'
                      )}>
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border p-6 text-center">
              <p className="text-sm text-muted-foreground">No active subscriptions.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/50">
            {!d.isAdmin && (
              <Button size="sm" onClick={() => handleAction('promote-to-admin')} disabled={loading} className="btn-gradient">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                Promote to Admin
              </Button>
            )}
            {d.isDeactivated ? (
              <Button size="sm" onClick={() => handleAction('activate')} disabled={loading} className="btn-gradient">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                Activate Member
              </Button>
            ) : (
              <Button size="sm" onClick={() => handleAction('deactivate')} disabled={loading} className="btn-gradient">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
                Deactivate Member
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
