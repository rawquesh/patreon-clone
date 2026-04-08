import { apiClient } from './api-client';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    isAdmin: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

  // Store token in cookie (7 day expiry)
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `auth_token=${encodeURIComponent(response.token)}; expires=${expires}; path=/; SameSite=Lax`;

  return response;
}

export async function logout(): Promise<void> {
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
}

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === 'auth_token') return decodeURIComponent(value || '');
  }
  return null;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
