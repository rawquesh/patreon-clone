'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  UserCog,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  getAdmins,
  updateAdmin,
  deleteAdmin,
} from '@/lib/services';
import type { AdminUser, AdminRole } from '@/types/admin-user';

const ROLE_COLORS: Record<AdminRole, string> = {
  superadmin: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  moderator: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  analyst: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  viewer: 'bg-muted text-muted-foreground border-border',
};

const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: 'Super Admin',
  moderator: 'Moderator',
  analyst: 'Analyst',
  viewer: 'Viewer',
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

  // Get current admin user ID from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('admin_user');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentAdminId(user?.id || user?.user?.id || null);
      }
    } catch {
      // ignore
    }
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdmins({ page, limit: 20 });
      setAdmins(data.admins || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 });
    } catch (e: any) {
      toast({ title: `Failed to load admins: ${e?.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [page, toast]);

  useEffect(() => { load(); }, [load]);

  const handleToggleAdmin = async (admin: AdminUser, isAdmin: boolean) => {
    if (admin.id === currentAdminId) return;
    setTogglingId(admin.id);
    try {
      await updateAdmin(admin.id, { isAdmin });
      toast({ title: isAdmin ? 'Admin access granted' : 'Admin access revoked' });
      load();
    } catch (e: any) {
      toast({ title: `Failed: ${e?.message}`, variant: 'destructive' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (admin: AdminUser) => {
    if (!confirm(`Remove ${admin.email || admin.user?.email || 'this admin'}? This cannot be undone.`)) return;
    setDeletingId(admin.id);
    try {
      await deleteAdmin(admin.id);
      toast({ title: 'Admin removed successfully' });
      load();
    } catch (e: any) {
      toast({ title: `Failed to delete admin: ${e?.message}`, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Admin Users"
        description="Manage admin accounts and their access levels."
        gradientTitle
      />

      <Card className="glass-card-static overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-6">Admin</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin Access</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Login</TableHead>
                <TableHead className="pr-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/30">
                    <TableCell className="pl-6"><Skeleton className="h-8 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <UserCog className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No admin users yet</p>
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id} className="border-b border-border/30 last:border-0">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-gradient-primary text-slate-900 dark:text-white">
                            {(admin.user?.displayName || admin.email || admin.user?.email || 'A').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{admin.user?.displayName || admin.email || admin.user?.email || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{admin.email || admin.user?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs font-medium border ${ROLE_COLORS[admin.role]}`}>
                        {ROLE_LABELS[admin.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.id === currentAdminId ? (
                        <span className="text-xs text-muted-foreground italic">You</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={true}
                            onCheckedChange={(v) => handleToggleAdmin(admin, v)}
                            disabled={togglingId === admin.id}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                          <span className="text-xs text-muted-foreground">Admin</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium border ${admin.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-muted text-muted-foreground border-border'}`}
                      >
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {admin.lastLoginAt
                          ? new Date(admin.lastLoginAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Never'}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6">
                      {admin.id !== currentAdminId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                          onClick={() => handleDelete(admin)}
                          disabled={deletingId === admin.id}
                        >
                          <Shield className="h-4 w-4" />
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
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} admins
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
    </>
  );
}
