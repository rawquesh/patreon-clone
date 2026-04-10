'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  UserCog,
  Plus,
  Shield,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateAdminRole,
} from '@/lib/services';
import type { AdminUser, AdminRole, AdminPermission } from '@/types/admin-user';

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

const ALL_PERMISSIONS: AdminPermission[] = [
  'view_dashboard', 'manage_creators', 'manage_members', 'manage_content',
  'manage_subscriptions', 'manage_payouts', 'manage_reports', 'manage_bans',
  'manage_settings', 'view_audit_log', 'manage_admins', 'view_analytics',
  'export_data', 'bulk_operations',
];

const PERMISSION_LABELS: Record<AdminPermission, string> = {
  view_dashboard: 'View Dashboard',
  manage_creators: 'Manage Creators',
  manage_members: 'Manage Members',
  manage_content: 'Manage Content',
  manage_subscriptions: 'Manage Subscriptions',
  manage_payouts: 'Manage Payouts',
  manage_reports: 'Manage Reports',
  manage_bans: 'Manage Bans',
  manage_settings: 'Manage Settings',
  view_audit_log: 'View Audit Log',
  manage_admins: 'Manage Admins',
  view_analytics: 'View Analytics',
  export_data: 'Export Data',
  bulk_operations: 'Bulk Operations',
};

const ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  superadmin: ALL_PERMISSIONS,
  moderator: ['view_dashboard', 'manage_creators', 'manage_members', 'manage_content', 'manage_subscriptions', 'manage_payouts', 'manage_reports', 'bulk_operations'],
  analyst: ['view_dashboard', 'view_analytics', 'view_audit_log', 'export_data'],
  viewer: ['view_dashboard'],
};

interface AdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editAdmin?: AdminUser | null;
}

function AdminDialog({ open, onOpenChange, onSuccess, editAdmin }: AdminDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<AdminRole>('moderator');
  const [permissions, setPermissions] = useState<AdminPermission[]>(ROLE_DEFAULT_PERMISSIONS.moderator);

  useEffect(() => {
    if (editAdmin) {
      setEmail(editAdmin.email || editAdmin.user?.email || '');
      setUserId(editAdmin.userId || '');
      setRole(editAdmin.role);
      setPermissions(editAdmin.permissions || []);
    } else {
      setEmail('');
      setUserId('');
      setRole('moderator');
      setPermissions(ROLE_DEFAULT_PERMISSIONS.moderator);
    }
  }, [editAdmin, open]);

  const handleRoleChange = (r: AdminRole) => {
    setRole(r);
    setPermissions(ROLE_DEFAULT_PERMISSIONS[r]);
  };

  const handlePermissionToggle = (perm: AdminPermission) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async () => {
    if (!email && !editAdmin) {
      toast({ title: 'Email is required', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      if (editAdmin) {
        await updateAdmin(editAdmin.id, { role, permissions });
        toast({ title: 'Admin updated successfully' });
      } else {
        await createAdmin({ email, userId, role, permissions });
        toast({ title: 'Admin created successfully' });
      }
      onSuccess();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: `Failed: ${e?.message}`, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editAdmin ? 'Edit Admin User' : 'Add Admin User'}</DialogTitle>
          <DialogDescription>
            {editAdmin
              ? 'Update this admin\'s role and permissions.'
              : 'Create a new admin user with specific permissions.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!editAdmin && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-userid">User ID (optional)</Label>
                <Input
                  id="admin-userid"
                  placeholder="MongoDB user ObjectId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => handleRoleChange(v as AdminRole)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['superadmin', 'moderator', 'analyst', 'viewer'] as AdminRole[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    <span className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5" />
                      {ROLE_LABELS[r]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {ALL_PERMISSIONS.map((perm) => (
                <div key={perm} className="flex items-center gap-2">
                  <Checkbox
                    id={`perm-${perm}`}
                    checked={permissions.includes(perm)}
                    onCheckedChange={() => handlePermissionToggle(perm)}
                  />
                  <Label htmlFor={`perm-${perm}`} className="text-xs font-normal cursor-pointer leading-tight">
                    {PERMISSION_LABELS[perm]}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl">
            {isSubmitting ? 'Saving...' : editAdmin ? 'Save Changes' : 'Create Admin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleEdit = (admin: AdminUser) => {
    setEditAdmin(admin);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Admin Users"
        description="Manage admin accounts and their role-based permissions."
        gradientTitle
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div />
        <Button onClick={() => { setEditAdmin(null); setDialogOpen(true); }} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Add Admin User
        </Button>
      </div>

      <Card className="glass-card-static overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-6">Admin</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Permissions</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="h-8 w-16" /></TableCell>
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
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {admin.permissions.slice(0, 3).map((p) => (
                          <span key={p} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                            {PERMISSION_LABELS[p] || p}
                          </span>
                        ))}
                        {admin.permissions.length > 3 && (
                          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                            +{admin.permissions.length - 3}
                          </span>
                        )}
                      </div>
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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => handleEdit(admin)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                          onClick={() => handleDelete(admin)}
                          disabled={deletingId === admin.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      <AdminDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditAdmin(null); }}
        onSuccess={load}
        editAdmin={editAdmin}
      />
    </>
  );
}
