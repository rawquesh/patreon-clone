import { apiClient } from '@/lib/api-client';
import type { AuditLog, AuditAction, AuditTargetType } from '@/types/audit-log';

export type AuditLogParams = {
  page?: number;
  limit?: number;
  action?: AuditAction;
  targetType?: AuditTargetType;
  targetId?: string;
  performedBy?: string;
  startDate?: string;
  endDate?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function getAuditLogs(params: AuditLogParams = {}): Promise<{
  logs: AuditLog[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> {
  return apiClient.get('/admin/audit-logs', params as Record<string, string | number | undefined>);
}
