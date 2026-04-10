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
import { BulkActionToolbar } from '@/components/bulk-action-toolbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MoreHorizontal,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  User as UserIcon,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { ReportDetailDialog } from '@/components/dialogs';

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
  post?: { title?: string; type: string; creator?: { displayName?: string; email?: string } };
  reportedUser?: { displayName?: string; email?: string; isCreator?: boolean };
  reportedBy?: { displayName?: string; email?: string };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  under_review: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  resolved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  dismissed: 'bg-muted text-muted-foreground border-border',
};

function ReportsPageSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<ReportsPageSkeleton />}>
      <ReportsPageInner />
    </Suspense>
  );
}

function ReportsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>(
    (searchParams.get('status') as ReportStatus) || 'all'
  );
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const page = Number(searchParams.get('page') || '1');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number | undefined> = {
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchValue || undefined,
      };

      const [postRes, userRes] = await Promise.all([
        apiClient.get<{ reports: ReportItem[]; pagination: PaginationInfo }>('/reports/posts', params as any),
        apiClient.get<{ reports: ReportItem[]; pagination: PaginationInfo }>('/reports/users', params as any),
      ]);

      const postReports: ReportItem[] = (postRes.reports || []).map((r: any) => ({
        ...r,
        _id: r._id?.toString() || r.id,
        id: r.id || r._id?.toString(),
        type: 'post' as ReportType,
        post: r.post,
        reportedUser: undefined,
      }));

      const userReports: ReportItem[] = (userRes.reports || []).map((r: any) => ({
        ...r,
        _id: r._id?.toString() || r.id,
        id: r.id || r._id?.toString(),
        type: 'user' as ReportType,
        reportedUser: r.reportedUser,
        post: undefined,
      }));

      const combined = [...postReports, ...userReports].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const total = (postRes.pagination?.total || 0) + (userRes.pagination?.total || 0);
      setReports(combined);
      setPagination({
        total,
        page,
        limit: 20,
        totalPages: Math.ceil(total / 20),
      });
    } catch (e: any) {
      toast({ title: `Failed to load reports: ${e?.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, searchValue, toast]);

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

  const handleSearchSubmit = () => {
    updateParams({ search: searchValue, page: '1' });
  };

  const handleStatusChange = (status: ReportStatus | 'all') => {
    setStatusFilter(status);
    updateParams({ status: status, page: '1' });
  };

  const handleSingleAction = async (id: string, action: string) => {
    const report = reports.find((r) => r.id === id || r._id === id);
    if (!report) return;
    try {
      if (report.type === 'post') {
        await apiClient.put(`/reports/posts/${id}/status`, { status: action, adminNotes: '' });
      } else {
        await apiClient.put(`/reports/users/${id}/status`, { status: action, adminNotes: '' });
      }
      toast({ title: `Report ${action === 'resolved' ? 'resolved' : 'dismissed'}` });
      setSelectedIds(new Set());
      load();
    } catch (e: any) {
      toast({ title: `Action failed: ${e?.message}`, variant: 'destructive' });
    }
  };

  const handleBulkAction = async (action: string) => {
    setBulkLoading(true);
    try {
      const postIds = reports
        .filter((r) => selectedIds.has(r.id || r._id) && r.type === 'post')
        .map((r) => r.id || r._id);
      const userIds = reports
        .filter((r) => selectedIds.has(r.id || r._id) && r.type === 'user')
        .map((r) => r.id || r._id);

      await Promise.all([
        ...postIds.map((id) => apiClient.put(`/reports/posts/${id}/status`, { status: action, adminNotes: '' })),
        ...userIds.map((id) => apiClient.put(`/reports/users/${id}/status`, { status: action, adminNotes: '' })),
      ]);
      toast({ title: `${selectedIds.size} reports ${action === 'resolved' ? 'resolved' : 'dismissed'}` });
      setSelectedIds(new Set());
      load();
    } catch (e: any) {
      toast({ title: `Bulk action failed: ${e?.message}`, variant: 'destructive' });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleViewReport = (report: ReportItem) => {
    setSelectedReport(report);
  };

  return (
    <>
      <PageHeader
        title="Reports & Moderation"
        description="Review and manage content and user reports."
        gradientTitle
      />

      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <Tabs value={statusFilter} onValueChange={(v) => handleStatusChange(v as ReportStatus | 'all')}>
          <TabsList className="rounded-xl">
            {(['all', 'pending', 'under_review', 'resolved', 'dismissed'] as const).map((s) => (
              <TabsTrigger key={s} value={s} className="rounded-lg text-xs font-medium capitalize">
                {s === 'under_review' ? 'Under Review' : s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
              className="pl-10 h-9 w-64 rounded-xl text-sm"
            />
          </div>
          {searchValue && (
            <Button size="sm" variant="ghost" onClick={() => { setSearchValue(''); updateParams({ search: null, page: '1' }); }} className="h-9 px-3 rounded-xl text-xs">
              Clear
            </Button>
          )}
        </div>
      </div>

      <BulkActionToolbar
        selectedCount={selectedIds.size}
        availableActions={[
          { label: 'Resolve', value: 'resolved' },
          { label: 'Dismiss', value: 'dismissed', variant: 'destructive' },
        ]}
        onBulkAction={handleBulkAction}
        onClearSelection={() => setSelectedIds(new Set())}
        isLoading={bulkLoading}
      />

      {/* Table */}
      <div className="glass-card-static rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="pl-6 w-10">
                  <Checkbox
                    checked={selectedIds.size === reports.length && reports.length > 0}
                    onCheckedChange={(v) => {
                      if (v) setSelectedIds(new Set(reports.map((r) => r.id || r._id)));
                      else setSelectedIds(new Set());
                    }}
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-4">Type</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reported Item</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reporter</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</TableHead>
                <TableHead className="pr-6 w-10"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/30">
                    <TableCell className="pl-6"><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <ShieldAlert className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No reports found</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your filters or search</p>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => {
                  const rid = report.id || report._id;
                  return (
                    <TableRow key={rid} className="border-b border-border/30 last:border-0 group">
                      <TableCell className="pl-6">
                        <Checkbox
                          checked={selectedIds.has(rid)}
                          onCheckedChange={(v) => {
                            const next = new Set(selectedIds);
                            if (v) next.add(rid);
                            else next.delete(rid);
                            setSelectedIds(next);
                          }}
                        />
                      </TableCell>
                      <TableCell className="pl-4">
                        <Badge variant="outline" className={cn('text-xs font-medium border', report.type === 'post' ? 'border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400' : 'border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400')}>
                          {report.type === 'post' ? 'Post' : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          {report.type === 'post' ? (
                            <button
                              onClick={() => handleViewReport(report)}
                              className="text-sm text-left hover:underline truncate block text-primary"
                            >
                              {report.post?.title || 'Untitled Post'}
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">{(report.reportedUser?.displayName || 'U').charAt(0)}</AvatarFallback>
                              </Avatar>
                              <button
                                onClick={() => handleViewReport(report)}
                                className="text-sm hover:underline text-primary"
                              >
                                {report.reportedUser?.displayName || report.reportedUser?.email || 'Unknown User'}
                              </button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-normal border-border">{report.reason}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{report.reportedBy?.displayName || report.reportedBy?.email || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-xs font-medium border', STATUS_COLORS[report.status])}>
                          {report.status === 'under_review' ? 'Under Review' : report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-menu rounded-xl shadow-xl">
                            <DropdownMenuItem onClick={() => handleViewReport(report)} className="rounded-lg cursor-pointer hover:bg-primary/5">
                              <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {report.status === 'pending' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleSingleAction(rid, 'resolved')}
                                  className="rounded-lg cursor-pointer text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" /> Resolve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleSingleAction(rid, 'dismissed')}
                                  className="rounded-lg cursor-pointer text-muted-foreground hover:bg-muted/50"
                                >
                                  <XCircle className="mr-2 h-4 w-4" /> Dismiss
                                </DropdownMenuItem>
                              </>
                            )}
                            {report.status === 'under_review' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleSingleAction(rid, 'resolved')}
                                  className="rounded-lg cursor-pointer text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" /> Mark Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleSingleAction(rid, 'dismissed')}
                                  className="rounded-lg cursor-pointer text-muted-foreground hover:bg-muted/50"
                                >
                                  <XCircle className="mr-2 h-4 w-4" /> Dismiss
                                </DropdownMenuItem>
                              </>
                            )}
                            {(report.status === 'resolved' || report.status === 'dismissed') && (
                              <DropdownMenuItem
                                onClick={() => handleSingleAction(rid, 'under_review')}
                                className="rounded-lg cursor-pointer text-blue-600 dark:text-blue-400 hover:bg-blue-500/5"
                              >
                                <AlertTriangle className="mr-2 h-4 w-4" /> Reopen
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reports
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
      </div>

      <ReportDetailDialog
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onRefresh={load}
      />
    </>
  );
}
