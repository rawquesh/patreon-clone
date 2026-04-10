import { apiClient } from '@/lib/api-client';

export type ExportParams = {
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  deactivated?: string;
};

function buildQuery(params: ExportParams): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
  return entries.length > 0 ? '?' + entries.join('&') : '';
}

async function downloadExport(endpoint: string, params: ExportParams): Promise<void> {
  const query = buildQuery(params);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const token = await getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = 'Bearer ' + token;
  headers['Content-Type'] = 'application/json';

  const res = await fetch(`${baseUrl}${endpoint}${query}`, { headers, credentials: 'include' });
  if (!res.ok) throw new Error(`Export failed: HTTP ${res.status}`);
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] || 'export.csv';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function getToken(): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === 'auth_token') return decodeURIComponent(value || '');
  }
  return null;
}

export async function exportUsers(params: ExportParams = {}): Promise<void> {
  return downloadExport('/admin/export/users', params);
}

export async function exportSubscriptions(params: ExportParams = {}): Promise<void> {
  return downloadExport('/admin/export/subscriptions', params);
}

export async function exportPayouts(params: ExportParams = {}): Promise<void> {
  return downloadExport('/admin/export/payouts', params);
}

export async function exportReports(params: ExportParams = {}): Promise<void> {
  return downloadExport('/admin/export/reports', params);
}
