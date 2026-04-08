const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isAuthError() {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  get isNotFound() {
    return this.statusCode === 404;
  }

  get isServerError() {
    return this.statusCode >= 500;
  }
}

async function getAuthToken(): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === 'auth_token') return decodeURIComponent(value || '');
  }
  return null;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const url = API_BASE_URL + path;
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (data as any)?.message || ('HTTP ' + res.status);
    throw new ApiError(res.status, msg, data);
  }

  return data as T;
}

export const apiClient = {
  get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    let url = path;
    if (params) {
      const entries: [string, string][] = Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]);
      if (entries.length > 0) {
        const search = new URLSearchParams(entries);
        url = path + '?' + search.toString();
      }
    }
    return request<T>(url, { method: 'GET' });
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' });
  },
};
