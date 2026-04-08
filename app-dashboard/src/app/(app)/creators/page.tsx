'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  MoreHorizontal,
  Search,
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  getCreators,
  getCreatorById,
  approveCreator,
  rejectCreator,
  suspendCreator,
  activateCreator,
} from '@/lib/services';
import type { Creator, CreatorDetail, CreatorStatus } from '@/types';

function CreatorStatusBadge({ status }: { status: CreatorStatus }) {
  const variant =
    status === 'PUBLISHED' ? 'default'
    : status === 'ONBOARDING' ? 'secondary'
    : 'destructive';
  const label =
    status === 'PUBLISHED' ? 'Active'
    : status === 'ONBOARDING' ? 'Onboarding'
    : status === 'DRAFT' ? 'Draft'
    : 'Archived';
  return <Badge variant={variant}>{label}</Badge>;
}

function CreatorDetailDialog({
  creator,
  open,
  onClose,
  onAction,
}: {
  creator: CreatorDetail | null;
  open: boolean;
  onClose: () => void;
  onAction: (id: string, action: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<CreatorDetail | null>(creator);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && creator) {
      setDetail(creator);
      setLoadingDetail(true);
      getCreatorById(creator.id || (creator as any)._id)
        .then(setDetail)
        .catch(() => toast({ title: 'Failed to load creator details', variant: 'destructive' }))
        .finally(() => setLoadingDetail(false));
    }
  }, [open, creator]);

  const handleAction = async (action: string) => {
    if (!detail) return;
    const id = detail.id || (detail as any)._id;
    setLoading(true);
    try {
      await onAction(id, action);
      onClose();
    } catch {
      toast({ title: `Action failed`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const c = detail;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Creator Details</DialogTitle>
          <DialogDescription>Full profile information for this creator.</DialogDescription>
        </DialogHeader>
        {loadingDetail ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : c ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={c.profilePicture || ''} />
                <AvatarFallback>
                  {(c.displayName || c.creatorUsername || 'C').charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {c.displayName || c.creatorUsername || 'Unknown'}
                </h3>
                <p className="text-sm text-muted-foreground">{c.email}</p>
                {c.creatorUsername && (
                  <p className="text-sm text-muted-foreground">@{c.creatorUsername}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <CreatorStatusBadge status={c.creatorStatus} />
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Stripe</p>
                <Badge variant={c.hasCompletedStripeOnboarding ? 'default' : 'secondary'}>
                  {c.hasCompletedStripeOnboarding ? 'Onboarded' : 'Not Onboarded'}
                </Badge>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Subscribers</p>
                <p className="font-semibold">{c.subscriberCount ?? '-'}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Posts</p>
                <p className="font-semibold">{c.postCount ?? '-'}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Available Balance</p>
                <p className="font-semibold">${(c.availableBalance || 0).toFixed(2)}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Lifetime Earnings</p>
                <p className="font-semibold">${(c.lifetimeEarnings || 0).toFixed(2)}</p>
              </div>
            </div>

            {c.bio && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Bio</p>
                <p className="text-sm">{c.bio}</p>
              </div>
            )}

            {c.creatorCategory && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Category</p>
                <p className="text-sm">{c.creatorCategory}</p>
              </div>
            )}

            {c.countryOfResidence && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Country</p>
                <p className="text-sm">{c.countryOfResidence}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {c.creatorStatus !== 'PUBLISHED' && (
                <Button
                  size="sm"
                  onClick={() => handleAction('approve')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Approve
                </Button>
              )}
              {c.creatorStatus === 'PUBLISHED' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleAction('suspend')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                  Suspend
                </Button>
              )}
              {c.creatorStatus === 'ARCHIVED' && (
                <Button
                  size="sm"
                  onClick={() => handleAction('activate')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                  Reactivate
                </Button>
              )}
              {(c.creatorStatus === 'DRAFT' || c.creatorStatus === 'ONBOARDING') && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleAction('reject')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Reject
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No data available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'DRAFT', label: 'Pending' },
  { value: 'PUBLISHED', label: 'Active' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export default function CreatorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [creators, setCreators] = useState<Creator[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<CreatorDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  const page = Number(searchParams.get('page') || '1');
  const statusFilter = searchParams.get('status') || 'all';

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCreators({
        page,
        limit: 20,
        search: searchParams.get('search') || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setCreators(result.creators);
      setPagination(result.pagination);
    } catch (e: any) {
      setError(e?.message || 'Failed to load creators');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchParams]);

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

  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateParams({ search: value, page: '1' });
  };

  const handleAction = async (id: string, action: string) => {
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
      load();
    } catch (e: any) {
      toast({ title: `Action failed: ${e?.message}`, variant: 'destructive' });
      throw e;
    }
  };

  const openDetail = (creator: Creator) => {
    setSelectedCreator(creator as unknown as CreatorDetail);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Creators"
        description="Manage all creators on the platform."
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or username..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateParams({ status: tab.value, page: '1' })}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-destructive mb-3">{error}</p>
              <Button variant="outline" onClick={load}>Retry</Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stripe</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creators.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No creators found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    creators.map((creator) => (
                      <TableRow key={creator.id || (creator as any)._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={creator.profilePicture || ''} />
                              <AvatarFallback>
                                {(creator.displayName || creator.creatorUsername || 'C').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{creator.displayName || creator.creatorUsername || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{creator.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <CreatorStatusBadge status={creator.creatorStatus} />
                        </TableCell>
                        <TableCell>
                          <Badge variant={creator.hasCompletedStripeOnboarding ? 'default' : 'secondary'}>
                            {creator.hasCompletedStripeOnboarding ? 'Onboarded' : 'Not Onboarded'}
                          </Badge>
                        </TableCell>
                        <TableCell>{creator.subscriberCount ?? '-'}</TableCell>
                        <TableCell>
                          {creator.createdAt
                            ? new Date(creator.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openDetail(creator)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {creator.creatorStatus !== 'PUBLISHED' && (
                                <DropdownMenuItem onClick={() => handleAction(creator.id || (creator as any)._id, 'approve')}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" /> Approve
                                </DropdownMenuItem>
                              )}
                              {(creator.creatorStatus === 'DRAFT' || creator.creatorStatus === 'ONBOARDING') && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleAction(creator.id || (creator as any)._id, 'reject')}
                                >
                                  <XCircle className="mr-2 h-4 w-4" /> Reject
                                </DropdownMenuItem>
                              )}
                              {creator.creatorStatus === 'PUBLISHED' && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleAction(creator.id || (creator as any)._id, 'suspend')}
                                >
                                  <Ban className="mr-2 h-4 w-4" /> Suspend
                                </DropdownMenuItem>
                              )}
                              {creator.creatorStatus === 'ARCHIVED' && (
                                <DropdownMenuItem onClick={() => handleAction(creator.id || (creator as any)._id, 'activate')}>
                                  <RotateCcw className="mr-2 h-4 w-4" /> Reactivate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} creators
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateParams({ page: String(page - 1) })}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="flex items-center text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateParams({ page: String(page + 1) })}
                      disabled={page >= pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CreatorDetailDialog
        creator={selectedCreator}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAction={handleAction}
      />
    </>
  );
}
