import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePortalUser } from '../auth/AuthContext';
import { portalRequest, saveResource, workspaceChanged, type WorkspaceData } from '../../api/workspace';
// One shared response per mounted library, rather than a request for every file.
const savedByUser = new Map<string, { urls: Set<string>; pending: Promise<void> | null }>();
window.addEventListener(workspaceChanged, () => savedByUser.forEach(cache => { cache.pending = null; }));
function cacheFor(email: string) {
  if (!savedByUser.has(email)) savedByUser.set(email, { urls: new Set(), pending: null });
  return savedByUser.get(email)!;
}
function loadSaved(email: string) {
  const cache = cacheFor(email);
  if (!cache.pending) cache.pending = portalRequest<WorkspaceData>('/api/workspace/').then(data => { cache.urls = new Set(data.saved.map(item => item.url)); }).catch(() => { cache.pending = null; });
  return cache.pending;
}
export default function SaveResourceButton({ title, href }: { title: string; href: string }) {
  const email = usePortalUser()?.email || '';
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    const sync = () => { void loadSaved(email).then(() => { if (alive) setSaved(cacheFor(email).urls.has(href)); }); };
    void loadSaved(email).then(() => { if (alive) setSaved(cacheFor(email).urls.has(href)); });
    window.addEventListener(workspaceChanged, sync);
    return () => { alive = false; window.removeEventListener(workspaceChanged, sync); };
  }, [href, email]);
  return <span className="relative"><button type="button" disabled={busy} aria-label={`${saved ? 'Unsave' : 'Save'} ${title}`} aria-pressed={saved} title={saved ? 'Remove from My Atlas' : 'Save to My Atlas'} onClick={async () => { setBusy(true); setError(''); try { await saveResource(title, href, 'file', !saved); setSaved(!saved); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }} className="grid h-9 w-9 place-items-center rounded-lg text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-slate-800"><Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} /></button>{error && <span role="alert" className="absolute right-0 z-30 w-48 rounded-lg border bg-white p-2 text-xs text-slate-800 shadow-lg dark:bg-slate-900 dark:text-white">{error}</span>}</span>;
}
