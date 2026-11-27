import { Bookmark, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getWorkspaceResources, recordResourceVisit, saveResource, type WorkspaceResource } from '../../api/workspace';
import { validWorkspaceUrl } from '../../lib/workspace';
import PageHeader from '../../components/shared/PageHeader';

export default function MyResourcesPage() {
  const [data, setData] = useState<{ saved: WorkspaceResource[]; recent: WorkspaceResource[] }>();
  const [error, setError] = useState('');
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getWorkspaceResources().then(result => { if (active) setData(result); })
      .catch(() => { if (active) setError('Your resources could not be loaded.'); });
    return () => { active = false; };
  }, []);

  const remove = async (item: WorkspaceResource) => {
    setError('');
    setPending(item.id);
    try {
      await saveResource(item.url, item.title, false, item.kind);
      setData(current => current && { ...current, saved: current.saved.filter(resource => resource.id !== item.id) });
    } catch {
      setError('The resource could not be removed. Try again.');
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-4 lg:px-10">
      <PageHeader category="Workspace" title="My resources" description="Your saved and recently opened portal resources." icon={Bookmark} accent="" />
      {error && <p role="alert" className="mt-3 text-sm text-amber-800 dark:text-amber-300">{error}</p>}
      {!data && !error && <p role="status" className="mt-3 text-sm">Loading your resources…</p>}
      {data && <div className="mt-4 grid gap-3 md:grid-cols-2">{(['saved', 'recent'] as const).map(group => {
        const items = data[group].filter(item => Boolean(item.url) && validWorkspaceUrl(item.url));
        return (
          <section key={group} className="home-panel min-w-0">
            <h2 className="home-section-title">{group === 'saved' ? 'Saved resources' : 'Recently opened'}</h2>
            {items.length ? <ul className="mt-2 divide-y divide-slate-200 dark:divide-slate-700">
              {items.map(item => (
                <li key={item.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <a href={item.url} target={item.kind === 'file' ? '_blank' : undefined} rel="noreferrer"
                    onClick={() => { if (item.kind === 'file') recordResourceVisit(item.url, item.title); }}
                    className="inline-flex min-w-0 items-start gap-1.5 break-words font-semibold text-indigo-700 hover:underline dark:text-indigo-300">
                    <span className="min-w-0">{item.title}</span><ExternalLink aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  </a>
                  {group === 'saved' && <button type="button" disabled={pending !== null} onClick={() => void remove(item)} className="shrink-0 rounded px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={`Remove ${item.title} from saved resources`}>Remove</button>}
                </li>
              ))}
            </ul> : <p className="mt-2 text-sm text-slate-500">{group === 'saved' ? 'Use the bookmark button in a resource library to save a file here.' : 'Files you open from a resource library will appear here.'}</p>}
          </section>
        );
      })}</div>}
    </div>
  );
}
