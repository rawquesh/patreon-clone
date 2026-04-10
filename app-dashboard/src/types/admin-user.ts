export type AdminRole = 'superadmin' | 'moderator' | 'analyst' | 'viewer';

export type AdminPermission =
  | 'view_dashboard'
  | 'manage_creators'
  | 'manage_members'
  | 'manage_content'
  | 'manage_subscriptions'
  | 'manage_payouts'
  | 'manage_reports'
  | 'manage_bans'
  | 'manage_settings'
  | 'view_audit_log'
  | 'manage_admins'
  | 'view_analytics'
  | 'export_data'
  | 'bulk_operations';

export type AdminUser = {
  id: string;
  email: string;
  userId: string;
  role: AdminRole;
  permissions: AdminPermission[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    displayName?: string;
    email?: string;
    profilePicture?: string;
    firstName?: string;
    lastName?: string;
  };
};
