export type AuditAction =
  | 'user.created'
  | 'user.updated'
  | 'user.deactivated'
  | 'user.reactivated'
  | 'user.deleted'
  | 'user.banned'
  | 'user.unbanned'
  | 'creator.approved'
  | 'creator.rejected'
  | 'creator.suspended'
  | 'creator.activated'
  | 'post.withheld'
  | 'post.restored'
  | 'post.deleted'
  | 'subscription.cancelled'
  | 'payout.approved'
  | 'payout.rejected'
  | 'report.resolved'
  | 'report.dismissed'
  | 'setting.updated'
  | 'setting.bulk_updated'
  | 'admin.created'
  | 'admin.updated'
  | 'admin.deleted'
  | 'admin.role_changed'
  | 'ban.created'
  | 'ban.lifted'
  | 'bulk.action';

export type AuditTargetType =
  | 'User'
  | 'Post'
  | 'Subscription'
  | 'Payout'
  | 'Report'
  | 'Setting'
  | 'AdminUser'
  | 'Ban';

export type AuditLog = {
  id: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  performedBy: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};
