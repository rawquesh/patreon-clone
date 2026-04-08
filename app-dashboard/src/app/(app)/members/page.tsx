'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
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
  Eye,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  getMembers,
  getMemberById,
  deactivateMember,
  activateMember,
} from '@/lib/services';
import type { Member, MemberDetail } from '@/types';

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === 'active' ? 'default' : 'secondary'}>
      {status === 'active' ? 'Active' : 'Inactive'}
    </Badge>
  );
}

function SubscriptionBadge({ status }: { status: string }) {
  const variant =
    status === 'active' ? 'default'
    : status === 'cancelled' ? 'secondary'
    : 'destructive';
  return <Badge variant={variant}>{status}</Badge>;
}

function MemberDetailDialog({
  member,
  open,
  onClose,
  onAction,
}: {
  member: Member | null;
  open: boolean;
  onClose: () => void;
  onAction: (id: string, action: string) => Promise<void>;
}) {
  const { toast } = useToast();
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && member) {
      setLoadingDetail(true);
      getMemberById(member.id || (member as any)._id)
        .then(setDetail)
        .catch(() => toast({ title: 'Failed to load member details', variant: 'destructive' }))
        .finally(() => setLoadingDetail(false));
    }
  }, [open, member]);

  const handleAction = async (action: string) => {
    if (!detail) return;
    const id = detail.id || (detail as any)._id;
    setLoading(true);
    try {
      await onAction(id, action);
      onClose();
    } catch {
      toast({ title: `${action} failed`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
          <DialogDescription>Full profile information for this member.</DialogDescription>
        </DialogHeader>
        {loadingDetail ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : detail ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={detail.profilePicture || ''} />
                <AvatarFallback>
                  {(detail.displayName || detail.firstName || 'M').charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {detail.displayName || `${detail.firstName || ''} ${detail.lastName || ''}`.trim() || 'Unknown'}
                </h3>
                <p className="text-sm text-muted-foreground">{detail.email}</p>
                <StatusBadge status={detail.isDeactivated ? 'inactive' : 'active'} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {detail.countryOfResidence && (
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Country</p>
                  <p className="font-medium text-sm">{detail.countryOfResidence}</p>
                </div>
              )}
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="font-medium text-sm">
                  {detail.createdAt
                    ? new Date(detail.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '-'}
                </p>
              </div>
            </div>

            {detail.subscriptions && detail.subscriptions.length > 0 ? (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Subscriptions</p>
                <div className="space-y-2">
                  {detail.subscriptions.slice(0, 5).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={sub.creator?.profilePicture || ''} />
                          <AvatarFallback>
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
                      <div className="text-right">
                        <p className="text-sm font-medium">${(sub.monthlyRate || 0).toFixed(2)}/mo</p>
                        <SubscriptionBadge status={sub.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active subscriptions.</p>
            )}

            <div className="flex gap-2 pt-2">
              {detail.isDeactivated ? (
                <Button
                  size="sm"
                  onClick={() => handleAction('activate')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                  Activate
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleAction('deactivate')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
                  Deactivate
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
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function MembersPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <PageHeader title="Members" description="View and manage all platform members." />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <MembersPageInner />
    </Suspense>
  );
}

function MembersPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  const page = Number(searchParams.get('page') || '1');
  const statusFilter = searchParams.get('status') || 'all';

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getMembers({
        page,
        limit: 20,
        search: searchParams.get('search') || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter as 'active' | 'inactive',
      });
      setMembers(result.members);
      setPagination(result.pagination);
    } catch (e: any) {
      setError(e?.message || 'Failed to load members');
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
      if (action === 'deactivate') {
        await deactivateMember(id);
        toast({ title: 'Member deactivated' });
      } else if (action === 'activate') {
        await activateMember(id);
        toast({ title: 'Member activated' });
      }
      load();
    } catch (e: any) {
      toast({ title: `Action failed: ${e?.message}`, variant: 'destructive' });
      throw e;
    }
  };

  return (
    <>
      <PageHeader title="Members" description="Manage all members on the platform." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
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
                    <TableHead>Member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id || (member as any)._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.profilePicture || ''} />
                              <AvatarFallback>
                                {(member.displayName || member.firstName || 'M').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{member.displayName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={member.isDeactivated ? 'inactive' : 'active'} /></TableCell>
                        <TableCell>
                          {member.subscription ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{member.subscription.plan}</span>
                              <SubscriptionBadge status={member.subscription.status} />
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {member.createdAt
                            ? new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
                              <DropdownMenuItem onClick={() => { setSelectedMember(member); setDialogOpen(true); }}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {member.isDeactivated ? (
                                <DropdownMenuItem onClick={() => handleAction(member.id || (member as any)._id, 'activate')}>
                                  <UserCheck className="mr-2 h-4 w-4 text-emerald-500" /> Activate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleAction(member.id || (member as any)._id, 'deactivate')}
                                >
                                  <UserX className="mr-2 h-4 w-4" /> Deactivate
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
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} members
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
        </CardContent>
      </Card>

      <MemberDetailDialog
        member={selectedMember}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAction={handleAction}
      />
    </>
  );
}
