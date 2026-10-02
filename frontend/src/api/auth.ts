export type PortalUser = {
  name: string;
  email: string;
  role: 'read' | 'write';
  can_write: boolean;
  is_superuser: boolean;
};

export type Session = { authenticated: boolean; user: PortalUser | null };

function csrfToken() {
  return document.cookie.split('; ').find(value => value.startsWith('csrftoken='))?.split('=')[1] || '';
}

async function authRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken(),
      ...options?.headers,
    },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.detail || 'Something went wrong. Please try again.');
  return body as T;
}

export function getSession() { return authRequest<Session>('/api/auth/session/'); }
export function requestLoginCode(email: string) {
  return authRequest<{ detail: string }>('/api/auth/request-code/', { method: 'POST', body: JSON.stringify({ email }) });
}
export function verifyLoginCode(email: string, code: string) {
  return authRequest<Session>('/api/auth/verify-code/', { method: 'POST', body: JSON.stringify({ email, code }) });
}
export function logout() { return authRequest<void>('/api/auth/session/', { method: 'DELETE' }); }
export { csrfToken };
