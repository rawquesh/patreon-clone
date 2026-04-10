'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/stat-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ShieldAlert,
  Ban,
  Plus,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  getBans,
  getBanStats,
  createBan,
  liftBan,
} from '@/lib/services';
import type { Ban as BanType, BanType as BanTypeEnum, BanStatus, BanStats } from '@/types/ban';

const BAN_TYPE_COLORS: Record<BanTypeEnum, string> = {
  account: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  ip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  email: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
};

const BAN_STATUS_COLORS: Record<BanStatus, string> = {
  active: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  expired: 'bg-muted text-muted-foreground border-border',
  lifted: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
};

interface CreateBanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function CreateBanDialog({ open, onOpenChange, onSuccess }: CreateBanDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<BanTypeEnum>('account');
  const [targetIdentifier, setTargetIdentifier] = useState('');
  const [reason, setReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [expiresIn, setExpiresIn] = useState('30');

  const handleSubmit = async () => {
    if (!targetIdentifier && type === 'account') {
      toast({ title: 'User ID or identifier is required', variant: 'destructive' });
      return;
    }
    if (!reason) {
      toast({ title: 'Reason is required', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const expiresAt = expiresIn && expiresIn !== 'permanent'
        ? new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      await createBan({
        userId: type === 'account' ? targetIdentifier : undefined,
        targetIdentifier: type !== 'account' ? targetIdentifier : undefined,
        type,
        reason,
        adminNotes: adminNotes || undefined,
        expiresAt,
      });
      toast({ title: 'Ban created successfully' });
      onSuccess();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: `Failed to create ban: ${e?.message}`, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Ban</DialogTitle>
          <DialogDescription>Ban a user, IP address, or email from the platform.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Ban Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as BanTypeEnum)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="ip">IP Address</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ban-target">
              {type === 'account' ? 'User ID' : type === 'ip' ? 'IP Address' : 'Email Address'}
            </Label>
            <Input
              id="ban-target"
              placeholder={
                type === 'account' ? 'MongoDB ObjectId of the user' :
                type === 'ip' ? 'e.g. 192.168.1.1' :
                'e.g. user@example.com'
              }
              value={targetIdentifier}
              onChange={(e) => setTargetIdentifier(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ban-reason">Reason</Label>
            <Textarea
              id="ban-reason"
              placeholder="Brief description of why this user is being banned..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl resize-none h-20"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ban-notes">Admin Notes (optional)</Label>
            <Textarea
              id="ban-notes"
              placeholder="Internal notes about this ban..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="rounded-xl resize-none h-16"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ban-expires">Expires In</Label>
            <Select value={expiresIn} onValueChange={setExpiresIn}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl bg-red-600 hover:bg-red-700">
            {isSubmitting ? 'Banning...' : 'Create Ban'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BansPage() {
  const { toast } = useToast();
  const [bans, setBans] = useState<BanType[]>([]);
  const [stats, setStats] = useState<BanStats | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BanStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<BanTypeEnum | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [liftingId, setLiftingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bansData, statsData] = await Promise.all([
        getBans({
          page,
          limit: 20,
          status: statusFilter === 'all' ? undefined : statusFilter,
          type: typeFilter === 'all' ? undefined : typeFilter,
        }),
        getBanStats(),
      ]);
      setBans(bansData.bans || []);
      setPagination(bansData.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 });
      setStats(statsData);
    } catch (e: any) {
      toast({ title: `Failed to load bans: ${e?.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, typeFilter, toast]);

  useEffect(() => { load(); }, [load]);

  const handleLift = async (ban: BanType) => {
    if (!confirm(`Lift the ban on ${ban.type === 'account' ? ban.userId?.slice(-8) : 'this target'}?`)) return;
    setLiftingId(ban.id);
    try {
      await liftBan(ban.id);
      toast({ title: 'Ban lifted successfully' });
      load();
    } catch (e: any) {
      toast({ title: `Failed to lift ban: ${e?.message}`, variant: 'destructive' });
    } finally {
      setLiftingId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Ban Management"
        description="Manage bans for accounts, IP addresses, and email addresses."
        gradientTitle
      />

      {/* Stats */}
      {!isLoading && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            title="Active Bans"
            value={stats.activeBans.toString()}
            icon={Ban}
            description="Currently active bans"
            accentColor="rose"
          />
          <StatCard
            title="Expired Bans"
            value={stats.expiredBans.toString()}
            icon={Clock}
            description="Past bans"
            accentColor="amber"
          />
          <StatCard
            title="Account Bans"
            value={stats.byType.account.toString()}
            icon={Users}
            description="Account-level bans"
            accentColor="rose"
          />
          <StatCard
            title="IP / Email Bans"
            value={(stats.byType.ip + stats.byType.email).toString()}
            icon={AlertTriangle}
            description="IP and email bans"
            accentColor="amber"
          />
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as BanStatus | 'all'); setPage(1); }}>
            <SelectTrigger className="h-9 w-36 rounded-xl text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="lifted">Lifted</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as BanTypeEnum | 'all'); setPage(1); }}>
            <SelectTrigger className="h-9 w-32 rounded-xl text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="account">Account</SelectItem>
              <SelectItem value="ip">IP</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="rounded-xl gap-2 bg-red-600 hover:bg-red-700">
          <ShieldAlert className="h-4 w-4" /> Create Ban
        </Button>
      </div>

      {/* Table */}
      <Card className="glass-card-static overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-6">Type</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expires</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Banned By</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/30">
                    <TableCell className="pl-6"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : bans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <ShieldAlert className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No bans found</p>
                  </TableCell>
                </TableRow>
              ) : (
                bans.map((ban) => (
                  <TableRow key={ban.id} className="border-b border-border/30 last:border-0">
                    <TableCell className="pl-6">
                      <Badge variant="outline" className={`text-xs font-medium border ${BAN_TYPE_COLORS[ban.type]}`}>
                        {ban.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {ban.type === 'account' && (
                          <>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px]">
                                {(ban.userId || 'U').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-mono text-muted-foreground">
                              {ban.userId?.slice(-8)}
                            </span>
                          </>
                        )}
                        {ban.type !== 'account' && (
                          <span className="text-xs font-mono text-muted-foreground">
                            {ban.userId}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm max-w-[200px] truncate block" title={ban.reason}>
                        {ban.reason}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs font-medium border ${BAN_STATUS_COLORS[ban.status]}`}>
                        {ban.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {ban.expiresAt
                          ? new Date(ban.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Permanent'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {ban.bannedBy?.displayName || ban.bannedBy?.email || 'System'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ban.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6">
                      {ban.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 rounded-lg"
                          onClick={() => handleLift(ban)}
                          disabled={liftingId === ban.id}
                        >
                          <Unlock className="h-3 w-3" />
                          Lift
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bans
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="h-8 w-8 p-0 rounded-lg btn-gradient-ghost"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">{page} / {pagination.totalPages}</span>
              <Button
                variant="outline" size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pagination.totalPages}
                className="h-8 w-8 p-0 rounded-lg btn-gradient-ghost"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <CreateBanDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={load} />
    </>
  );
}
