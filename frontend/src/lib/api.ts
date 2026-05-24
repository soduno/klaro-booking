const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const getCookie = (name: string) => typeof document === 'undefined' ? undefined : document.cookie.split('; ').find((item) => item.startsWith(`${name}=`))?.split('=').slice(1).join('=');

export class ApiError extends Error { constructor(message: string, public readonly status: number) { super(message); } }
export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const method = init.method?.toUpperCase() ?? 'GET';
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) { const csrf = getCookie('csrf_token'); if (csrf) headers.set('x-csrf-token', decodeURIComponent(csrf)); }
  const response = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: 'include' });
  if (response.status === 401 && retry && path !== '/auth/refresh') {
    try { await api('/auth/refresh', { method: 'POST' }, false); return api<T>(path, init, false); } catch { /* surface original error */ }
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const raw = data?.error?.message ?? data?.message ?? 'Something went wrong';
    throw new ApiError(Array.isArray(raw) ? raw.join('. ') : raw, response.status);
  }
  return data as T;
}
