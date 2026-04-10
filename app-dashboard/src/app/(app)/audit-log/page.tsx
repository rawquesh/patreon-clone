'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ScrollText,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { DateRangePicker } from '@/components/date-range-picker';
import { useToast } from '@/hooks/use-toast';
import { getAuditLogs } from '@/lib/services';
import type { AuditLog, AuditAction, AuditTargetType } from '@/types/audit-log';

const ALL_ACTIONS: AuditAction[] = [
  'user.created', 'user.updated', 'user.deactivated', 'user.reactivated', 'user.deleted',
  'creator.approved', 'creator.rejected', 'creator.suspended', 'creator.activated',
  'post.withheld', 'post.restored', 'post.deleted',
  'subscription.cancelled',
  'payout.approved', 'payout.rejected',
  'report.resolved', 'report.dismissed',
  'setting.updated', 'setting.bulk_updated',
  'admin.created', 'admin.updated', 'admin.deleted', 'admin.role_changed',
  'bulk.action',
];

const TARGET_TYPES: AuditTargetType[] = ['User', 'Post', 'Subscription', 'Payout', 'Report', 'Setting', 'AdminUser'];

const ACTION_CATEGORIES: Record<string, AuditAction[]> = {
  'user': ['user.created', 'user.updated', 'user.deactivated', 'user.reactivated', 'user.deleted'],
  'creator': ['creator.approved', 'creator.rejected', 'creator.suspended', 'creator.activated'],
  'post': ['post.withheld', 'post.restored', 'post.deleted'],
  'subscription': ['subscription.cancelled'],
  'payout': ['payout.approved', 'payout.rejected'],
  'report': ['report.resolved', 'report.dismissed'],
  'setting': ['setting.updated', 'setting.bulk_updated'],
  'admin': ['admin.created', 'admin.updated', 'admin.deleted', 'admin.role_changed'],
  'bulk': ['bulk.action'],
};

const ACTION_COLORS: Record<string, string> = {
  'user.created': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  'user.updated': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'user.deactivated': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  'user.reactivated': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  'user.deleted': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  'creator.approved': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  'creator.rejected': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  'creator.suspended': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  'creator.activated': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  'post.withheld': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  'post.restored': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'post.deleted': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  'subscription.cancelled': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  'payout.approved': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  'payout.rejected': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  'report.resolved': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  'report.dismissed': 'bg-muted text-muted-foreground border-border',
  'setting.updated': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'setting.bulk_updated': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'admin.created': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  'admin.updated': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  'admin.deleted': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  'admin.role_changed': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  'bulk.action': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
};

function formatAction(action: AuditAction): string {
  return action.replace('.', ' ').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function AuditLogPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 flex-1" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function AuditLogPage() {
  return (
    <Suspense fallback={<AuditLogPageSkeleton />}>
      <AuditLogPageInner />
    </Suspense>
  );
}

function AuditLogPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [actionCategory, setActionCategory] = useState<string>(searchParams.get('category') || 'all');
  const [targetType, setTargetType] = useState<AuditTargetType | 'all'>(
    (searchParams.get('targetType') as AuditTargetType) || 'all'
  );
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>();

  const page = Number(searchParams.get('page') || '1');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const actions = actionCategory !== 'all' ? ACTION_CATEGORIES[actionCategory] : undefined;
      const params: any = {
        page,
        limit: 20,
        targetType: targetType === 'all' ? undefined : targetType,
        performedBy: searchValue || undefined,
        startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
        endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
        sortOrder: 'desc',
      };
      if (actions?.length) {
        // Only pass one action filter at a time for simplicity
        params.action = actions[0];
      }

      const data = await getAuditLogs(params);
      setLogs(data.logs || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 });
    } catch (e: any) {
      toast({ title: `Failed to load audit logs: ${e?.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [page, actionCategory, targetType, searchValue, dateRange, toast]);

  useEffect(() => { load(); }, [load]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`?${params.toString()}`);
  };

  const handleCategoryChange = (cat: string) => {
    setActionCategory(cat);
    updateParams({ category: cat, page: '1' });
  };

  const handleTargetChange = (t: string) => {
    setTargetType(t as AuditTargetType | 'all');
    updateParams({ targetType: t, page: '1' });
  };

  const handleSearch = () => {
    updateParams({ search: searchValue, page: '1' });
  };

  return (
    <>
      <PageHeader
        title="Audit Log"
        description="Track all administrative actions performed on the platform."
        gradientTitle
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Tabs value={actionCategory} onValueChange={handleCategoryChange}>
          <TabsList className="rounded-xl h-9">
            {['all', 'user', 'creator', 'post', 'subscription', 'payout', 'report', 'setting', 'admin', 'bulk'].map((cat) => (
              <TabsTrigger key={cat} value={cat} className="rounded-lg text-xs font-medium capitalize h-7 px-2">
                {cat === 'all' ? 'All' : cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select value={targetType} onValueChange={handleTargetChange}>
          <SelectTrigger className="h-9 w-36 rounded-xl text-xs">
            <SelectValue placeholder="Target type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All targets</SelectItem>
            {TARGET_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangePicker
          value={dateRange}
          onChange={(range) => { setDateRange(range); updateParams({ page: '1' }); }}
        />

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by performer..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 h-9 rounded-xl text-sm"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={load}
          className="h-9 rounded-xl btn-gradient-ghost"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <Card className="glass-card-static overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-6 w-12">#</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performed By</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/30">
                    <TableCell className="pl-6"><Skeleton className="h-4 w-6" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <ScrollText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No audit logs found</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Actions will appear here as admins interact with the platform</p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, i) => (
                  <TableRow key={log.id} className="border-b border-border/30 last:border-0 group">
                    <TableCell className="pl-6">
                      <span className="text-xs text-muted-foreground">{(page - 1) * 20 + i + 1}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs font-medium border ${ACTION_COLORS[log.action] || 'bg-muted text-muted-foreground border-border'}`}>
                        {formatAction(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
                          {log.targetType}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono max-w-[80px] truncate block">
                          {log.targetId.slice(-8)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.details ? (
                        <span className="text-xs text-muted-foreground max-w-[200px] truncate block" title={JSON.stringify(log.details)}>
                          {log.details.reason ? log.details.reason :
                           log.details.action ? log.details.action :
                           log.details.role ? `Role: ${log.details.role}` :
                           log.details.count ? `${log.details.count} items` :
                           JSON.stringify(log.details).slice(0, 50)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{log.performedBy || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        <div>{new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-muted-foreground/60">{new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
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
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm"
                onClick={() => updateParams({ page: String(page - 1) })}
                disabled={page <= 1}
                className="h-8 w-8 p-0 rounded-lg btn-gradient-ghost"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">{page} / {pagination.totalPages}</span>
              <Button
                variant="outline" size="sm"
                onClick={() => updateParams({ page: String(page + 1) })}
                disabled={page >= pagination.totalPages}
                className="h-8 w-8 p-0 rounded-lg btn-gradient-ghost"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
