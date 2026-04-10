import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum AuditAction {
  // Users
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DEACTIVATED = 'user.deactivated',
  USER_REACTIVATED = 'user.reactivated',
  USER_DELETED = 'user.deleted',
  // Creators
  CREATOR_APPROVED = 'creator.approved',
  CREATOR_REJECTED = 'creator.rejected',
  CREATOR_SUSPENDED = 'creator.suspended',
  CREATOR_ACTIVATED = 'creator.activated',
  // Content
  POST_WITHHELD = 'post.withheld',
  POST_RESTORED = 'post.restored',
  POST_DELETED = 'post.deleted',
  POST_NOTIFIED = 'post.notified',
  // Subscriptions
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
  // Payouts
  PAYOUT_APPROVED = 'payout.approved',
  PAYOUT_REJECTED = 'payout.rejected',
  // Reports
  REPORT_RESOLVED = 'report.resolved',
  REPORT_DISMISSED = 'report.dismissed',
  // Settings
  SETTING_UPDATED = 'setting.updated',
  SETTING_BULK_UPDATED = 'setting.bulk_updated',
  // Admins
  ADMIN_CREATED = 'admin.created',
  ADMIN_UPDATED = 'admin.updated',
  ADMIN_DELETED = 'admin.deleted',
  ADMIN_ROLE_CHANGED = 'admin.role_changed',
  // Bulk
  BULK_ACTION = 'bulk.action',
}

export enum AuditTargetType {
  USER = 'User',
  POST = 'Post',
  SUBSCRIPTION = 'Subscription',
  PAYOUT = 'Payout',
  REPORT = 'Report',
  SETTING = 'Setting',
  ADMIN_USER = 'AdminUser',
}

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true, type: String, enum: AuditAction })
  action: AuditAction;

  @Prop({ required: true, type: String, enum: AuditTargetType })
  targetType: AuditTargetType;

  @Prop({ required: true })
  targetId: string;

  @Prop({ type: String })
  performedBy: string;

  @Prop({ type: Object })
  details: Record<string, any>;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });
AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ createdAt: -1 });
