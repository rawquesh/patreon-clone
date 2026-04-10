import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum AdminRole {
  SUPERADMIN = 'superadmin',
  MODERATOR = 'moderator',
  ANALYST = 'analyst',
  VIEWER = 'viewer',
}

export enum AdminPermission {
  VIEW_DASHBOARD = 'view_dashboard',
  MANAGE_CREATORS = 'manage_creators',
  MANAGE_MEMBERS = 'manage_members',
  MANAGE_CONTENT = 'manage_content',
  MANAGE_SUBSCRIPTIONS = 'manage_subscriptions',
  MANAGE_PAYOUTS = 'manage_payouts',
  MANAGE_REPORTS = 'manage_reports',
  MANAGE_BANS = 'manage_bans',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_AUDIT_LOG = 'view_audit_log',
  MANAGE_ADMINS = 'manage_admins',
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_DATA = 'export_data',
  BULK_OPERATIONS = 'bulk_operations',
}

export const ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  [AdminRole.SUPERADMIN]: Object.values(AdminPermission),
  [AdminRole.MODERATOR]: [
    AdminPermission.VIEW_DASHBOARD,
    AdminPermission.MANAGE_CREATORS,
    AdminPermission.MANAGE_MEMBERS,
    AdminPermission.MANAGE_CONTENT,
    AdminPermission.MANAGE_REPORTS,
    AdminPermission.MANAGE_BANS,
    AdminPermission.BULK_OPERATIONS,
  ],
  [AdminRole.ANALYST]: [
    AdminPermission.VIEW_DASHBOARD,
    AdminPermission.VIEW_ANALYTICS,
    AdminPermission.VIEW_AUDIT_LOG,
    AdminPermission.EXPORT_DATA,
  ],
  [AdminRole.VIEWER]: [AdminPermission.VIEW_DASHBOARD],
};

@Schema({ timestamps: true })
export class AdminUser extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ type: String, enum: AdminRole, default: AdminRole.VIEWER })
  role: AdminRole;

  @Prop({ type: [String], enum: AdminPermission, default: [] })
  permissions: AdminPermission[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt?: Date;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
AdminUserSchema.index({ email: 1 }, { unique: true });
AdminUserSchema.index({ userId: 1 }, { unique: true });
