import { useEffect, useState } from 'react';

export type ToolkitLink = { id: string; name: string; href: string; favorite: boolean };
// Retain legacy stored entries when saving tool preferences; new resource history is no longer collected.
export type RecentResource = { href: string; title: string; accessedAt: string };
export type WorkspacePreferences = { tools: ToolkitLink[]; recent: RecentResource[]; pinned: RecentResource[] };
export const defaultTools: ToolkitLink[] = [
  { id: 'paragon', name: 'Paragon MLS', href: 'https://rae.paragonrels.com/ParagonLS', favorite: true },
  { id: 'skyslope', name: 'SkySlope', href: 'https://www.google.com/search?q=skyslope', favorite: true },
  { id: 'radar', name: 'Radar', href: 'https://radarre.tech/', favorite: true },
  { id: 'webforms', name: 'WebForms', href: '', favorite: true },
  { id: 'outlook', name: 'Outlook', href: 'https://outlook.office.com/mail/', favorite: true },
  { id: 'forms', name: 'Brokerage forms', href: '/resources/general/', favorite: true },
];
const eventName = 'atlas-workspace-change';
const memory = new Map<string, WorkspacePreferences>();
const sessionOnly = new Set<string>();
const keyFor = (email: string) => `atlas-workspace:v1:${encodeURIComponent(email.toLowerCase())}`;
export function validWorkspaceUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
}
function validResource(value: unknown): value is RecentResource {
  if (!value || typeof value !== 'object') return false;
  const item = value as RecentResource;
  return typeof item.href === 'string' && !!item.href && validWorkspaceUrl(item.href) && typeof item.title === 'string' && typeof item.accessedAt === 'string';
}
function read(email: string): WorkspacePreferences {
  const key = keyFor(email);
  if (sessionOnly.has(key) && memory.has(key)) return memory.get(key)!;
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    if (value && typeof value === 'object') return {
      tools: defaultTools.map(tool => {
        const saved = Array.isArray(value.tools) && value.tools.find((item: ToolkitLink) => item?.id === tool.id);
        return saved && typeof saved.href === 'string' && validWorkspaceUrl(saved.href) ? { ...tool, href: saved.href, favorite: saved.favorite !== false } : { ...tool };
      }),
      recent: Array.isArray(value.recent) ? value.recent.filter(validResource).slice(0, 30) : [],
      pinned: Array.isArray(value.pinned) ? value.pinned.filter(validResource).slice(0, 5) : [],
    };
  } catch { /* Browser storage may be unavailable. Keep this session usable. */ }
  return memory.get(key) || { tools: defaultTools.map(tool => ({ ...tool })), recent: [], pinned: [] };
}
export function updateWorkspace(email: string, update: (current: WorkspacePreferences) => WorkspacePreferences) {
  const value = update(read(email));
  const key = keyFor(email);
  memory.set(key, value);
  try { localStorage.setItem(key, JSON.stringify(value)); sessionOnly.delete(key); } catch { sessionOnly.add(key); }
  window.dispatchEvent(new CustomEvent(eventName, { detail: key }));
}
export function useWorkspacePreferences(email: string) {
  const [preferences, setPreferences] = useState(() => read(email));
  useEffect(() => {
    const refresh = () => setPreferences(read(email));
    refresh();
    window.addEventListener(eventName, refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener(eventName, refresh); window.removeEventListener('storage', refresh); };
  }, [email]);
  return { preferences, update: (update: (current: WorkspacePreferences) => WorkspacePreferences) => updateWorkspace(email, update) };
}
