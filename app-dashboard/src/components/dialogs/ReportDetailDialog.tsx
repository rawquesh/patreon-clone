'use client';

import { useState } from 'react';
import { DetailDialog } from './DetailDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Flag,
  User,
  FileText,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';
type ReportType = 'post' | 'user';

interface ReportItem {
  id: string;
  _id: string;
  type: ReportType;
  reason: string;
  description: string;
  status: ReportStatus;
  adminNotes?: string;
  reviewedBy?: { displayName?: string; email?: string };
  reviewedAt?: string;
  createdAt: string;
  post?: { title?: string; type: string; content?: string; creator?: { displayName?: string; email?: string } };
  reportedUser?: { displayName?: string; email?: string; isCreator?: boolean; profilePicture?: string };
  reportedBy?: { displayName?: string; email?: string; profilePicture?: string };
}

interface ReportDetailDialogProps {
  report: ReportItem | null;
  onClose: () => void;
  onRefresh: () => void;
}

const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  under_review: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  resolved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  dismissed: 'bg-muted text-muted-foreground border-border',
};

export function ReportDetailDialog({ report, onClose, onRefresh }: ReportDetailDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const open = !!report;

  const handleAction = async (action: string) => {
    if (!report) return;
    const rid = report.id || report._id;
    setLoading(true);
    try {
      if (report.type === 'post') {
        await apiClient.put(`/reports/posts/${rid}/status`, { status: action, adminNotes: notes });
      } else {
        await apiClient.put(`/reports/users/${rid}/status`, { status: action, adminNotes: notes });
      }
      toast({ title: `Report ${action === 'resolved' ? 'resolved' : action === 'dismissed' ? 'dismissed' : 'reopened'}` });
      onRefresh();
      onClose();
    } catch (e: any) {
      toast({ title: `Action failed: ${e?.message}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const r = report;
  const rid = r ? (r.id || r._id) : '';

  return (
    <DetailDialog
      open={open}
      onOpenChange={(o) => { if (!o) onClose(); }}
      title="Report Details"
      description="Full report information and moderation actions."
      maxWidth="max-w-xl"
    >
      {!r ? (
        <p className="text-muted-foreground text-center py-8">No report selected.</p>
      ) : (
        <div className="space-y-5">
          {/* Status + Type */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={cn('text-xs font-medium border', r.type === 'post' ? 'border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400' : 'border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400')}>
              <Flag className="h-3 w-3 mr-1" />
              {r.type === 'post' ? 'Post Report' : 'User Report'}
            </Badge>
            <Badge variant="outline" className={cn('text-xs font-medium border', STATUS_COLORS[r.status])}>
              {r.status === 'under_review' ? 'Under Review' : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
            </Badge>
          </div>

          {/* Reporter */}
          <div className="rounded-xl border p-3.5">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Reported By
            </p>
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={r.reportedBy?.profilePicture || ''} />
                <AvatarFallback className="text-xs">{(r.reportedBy?.displayName || 'R').charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{r.reportedBy?.displayName || r.reportedBy?.email || 'Unknown'}</span>
            </div>
          </div>

          {/* Reported Item */}
          {r.type === 'post' && r.post ? (
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Reported Post
              </p>
              <p className="text-sm font-medium mb-1">{r.post.title || 'Untitled Post'}</p>
              {r.post.creator && (
                <p className="text-xs text-muted-foreground">
                  by {r.post.creator.displayName || r.post.creator.email || 'Unknown Creator'}
                </p>
              )}
            </div>
          ) : r.type === 'user' && r.reportedUser ? (
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Reported User
              </p>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={r.reportedUser.profilePicture || ''} />
                  <AvatarFallback className="text-xs">{(r.reportedUser.displayName || 'U').charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{r.reportedUser.displayName || r.reportedUser.email || 'Unknown'}</p>
                  {r.reportedUser.isCreator && (
                    <Badge className="mt-0.5 text-xs bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800">
                      Creator
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Reason + Description */}
          <div className="rounded-xl border p-3.5 space-y-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Reason</p>
              <Badge variant="outline" className="text-xs font-normal border-border">{r.reason}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm leading-relaxed">{r.description}</p>
            </div>
          </div>

          {/* Reviewed Info */}
          {(r.reviewedBy || r.adminNotes) && (
            <div className="rounded-xl border p-3.5 space-y-2">
              {r.reviewedBy && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reviewed By</p>
                  <p className="text-sm font-medium">{r.reviewedBy.displayName || r.reviewedBy.email}</p>
                  {r.reviewedAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(r.reviewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )}
              {r.adminNotes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Admin Notes</p>
                  <p className="text-sm leading-relaxed">{r.adminNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Date */}
          <div className="rounded-xl border p-3.5">
            <p className="text-xs text-muted-foreground mb-1">Reported On</p>
            <p className="text-sm font-medium">
              {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>

          {/* Admin Notes Input + Actions */}
          <div className="border-t border-border/50 pt-4 space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Admin Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this report..."
                className="mt-1.5 rounded-xl text-sm"
                rows={2}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(r.status === 'pending' || r.status === 'under_review') && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleAction('resolved')}
                    disabled={loading}
                    className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction('dismissed')}
                    disabled={loading}
                    className="rounded-lg"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Dismiss
                  </Button>
                </>
              )}
              {(r.status === 'resolved' || r.status === 'dismissed') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('under_review')}
                  disabled={loading}
                  className="rounded-lg"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                  Reopen Report
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </DetailDialog>
  );
}
