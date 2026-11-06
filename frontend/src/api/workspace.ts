import { csrfToken } from './auth';
export async function portalRequest<T>(url: string, data?: unknown): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin', ...(data === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken() }, body: JSON.stringify(data) }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || Object.values(body).flat().join(' ') || 'Unable to save. Try again.');
  return body as T;
}
export type WorkspaceEntry = { id: number; url: string; title: string; kind: 'page' | 'file'; saved: boolean; accessed_at: string | null };
export type WorkspaceData = { saved: WorkspaceEntry[]; recent: WorkspaceEntry[]; training: { course: string; completed: boolean; updated_at: string }[] };
export const workspaceChanged = 'atlas-saved-resources-change';
export async function saveResource(title: string, url: string, kind: 'page' | 'file', saved: boolean) {
  await portalRequest('/api/workspace/', { title, url, kind, saved });
  window.dispatchEvent(new Event(workspaceChanged));
}
export const recordVisit = (title: string, url: string, kind: 'page' | 'file') => portalRequest('/api/workspace/', { title, url, kind }).catch(() => undefined);
