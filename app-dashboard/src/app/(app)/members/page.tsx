'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
  MoreHorizontal,
  Search,
  Eye,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getMembers, deactivateMember, activateMember } from '@/lib/services';
import { MemberDetailDialog } from '@/components/dialogs';
import type { Member } from '@/types';

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn(
      'text-xs font-medium border',
      status === 'active'
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
        : 'bg-muted text-muted-foreground border-border'
    )}>
      {status === 'active' ? 'Active' : 'Inactive'}
    </Badge>
  );
}

function SubscriptionBadge({ status }: { status: string }) {
  const config = {
    active: { label: 'Active', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    cancelled: { label: 'Cancelled', class: 'bg-muted text-muted-foreground border-border' },
    expired: { label: 'Expired', class: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  };
  const c = config[status as keyof typeof config] || config.cancelled;
  return <Badge className={cn('text-xs font-medium border', c.class)}>{c.label}</Badge>;
}

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

function MembersPageSkeleton() {
  return (
    <div className="space-y-4">
      <PageHeader title="Members" description="View and manage all platform members." />
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-16 rounded-full" />
        ))}
      </div>
      <div className="glass-card-static rounded-xl overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-border/30 last:border-0">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={<MembersPageSkeleton />}>
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
      <PageHeader title="Members" description="Manage all members on the platform." gradientTitle />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="glass-input pl-10 h-11 rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateParams({ status: tab.value, page: '1' })}
            className={cn(
              'rounded-full text-xs font-medium h-8 transition-all duration-200',
              statusFilter === tab.value ? 'btn-gradient shadow-md' : 'btn-gradient-ghost rounded-full'
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="glass-card-static rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="pl-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Member</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subscription</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</TableHead>
                <TableHead className="pr-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/30 last:border-0">
                    <TableCell className="pl-6"><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-14 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-destructive">
                    <p className="font-medium mb-3">{error}</p>
                    <Button variant="outline" onClick={load} size="sm" className="btn-gradient-ghost">Retry</Button>
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">No members found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id || (member as any)._id} className="table-row-hover border-b border-border/30 last:border-0 group">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200">
                          <AvatarImage src={member.profilePicture || ''} />
                          <AvatarFallback className="bg-gradient-accent text-slate-900 dark:text-white text-sm font-bold">
                            {(member.displayName || member.firstName || 'M').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {member.displayName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown'}
                          </div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
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
                      <span className="text-sm text-muted-foreground">
                        {member.createdAt
                          ? new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors duration-200">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-menu rounded-xl shadow-xl">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSelectedMember(member)} className="rounded-lg cursor-pointer hover:bg-primary/5">
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {member.isDeactivated ? (
                            <DropdownMenuItem onClick={() => handleAction(member.id || (member as any)._id, 'activate')} className="rounded-lg cursor-pointer text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5">
                              <UserCheck className="mr-2 h-4 w-4" /> Activate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="rounded-lg cursor-pointer text-destructive hover:bg-destructive/5" onClick={() => handleAction(member.id || (member as any)._id, 'deactivate')}>
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
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} members
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => updateParams({ page: String(page - 1) })} disabled={page <= 1} className="h-8 w-8 p-0 rounded-lg btn-gradient-ghost">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => updateParams({ page: String(page + 1) })} disabled={page >= pagination.totalPages} className="h-8 w-8 p-0 rounded-lg btn-gradient-ghost">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <MemberDetailDialog
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onRefresh={load}
      />
    </>
  );
}
