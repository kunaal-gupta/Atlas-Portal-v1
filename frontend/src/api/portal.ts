import { csrfToken } from './auth';
export async function portalRequest<T>(url: string, data?: unknown): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin', ...(data === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken() }, body: JSON.stringify(data) }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || Object.values(body).flat().join(' ') || 'Unable to save. Try again.');
  return body as T;
}
