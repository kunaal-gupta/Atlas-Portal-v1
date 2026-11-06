import { BarChart3, FileCheck2, FileText, FolderOpen, Home, Mail, Settings2 } from 'lucide-react';
import { useRef, useState } from 'react';
import MiniCalculators from './MiniCalculators';
import { usePortalUser } from './auth/AuthContext';
import { useWorkspacePreferences, validWorkspaceUrl, type ToolkitLink } from '../lib/workspace';

const icons = { paragon: Home, skyslope: FileCheck2, radar: BarChart3, webforms: FileText, outlook: Mail, forms: FolderOpen };
const toolTones: Record<string, string> = {
  paragon: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  skyslope: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  radar: 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300',
  webforms: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  outlook: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  forms: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
};
const panel = 'home-panel min-w-0';

export default function AgentWorkspace() {
  const user = usePortalUser();
  const { preferences, update } = useWorkspacePreferences(user?.email || '');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ToolkitLink[]>([]);
  const [formError, setFormError] = useState('');
  const customize = useRef<HTMLButtonElement>(null);
  const openCustomize = () => { setDraft(preferences.tools.map(tool => ({ ...tool }))); setFormError(''); setEditing(true); };
  const closeCustomize = () => { setEditing(false); customize.current?.focus(); };
  const favorites = preferences.tools.filter(tool => tool.favorite);

  return <section aria-labelledby="workspace-heading" className="min-w-0 lg:col-span-2">
    <h2 id="workspace-heading" className="sr-only">Your workspace</h2>
    <section id="agent-toolkit" aria-labelledby="toolkit-heading" className={`${panel} toolkit-panel`} onKeyDown={event => { if (editing && event.key === 'Escape') { event.stopPropagation(); closeCustomize(); } }}>
      <div className="mb-1 flex items-center justify-between gap-3"><h3 id="toolkit-heading" className="home-section-title">Agent toolkit</h3><button ref={customize} type="button" onClick={editing ? closeCustomize : openCustomize} aria-expanded={editing} aria-controls="toolkit-customization" className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300"><Settings2 className="h-4 w-4" />{editing ? 'Close' : 'Customize'}</button></div>
      {!favorites.length && <p className="py-3 text-sm text-slate-500">Choose your favorite tools with Customize.</p>}
      <div className="flex flex-wrap items-center gap-2">{favorites.map(tool => {
        const Icon = icons[tool.id as keyof typeof icons] || FileText;
        const label = !tool.href ? `${tool.name} — set link` : tool.id === 'skyslope' && tool.href.includes('google.com/search') ? `${tool.name} — search shortcut` : tool.name;
        const content = <span data-tool-icon={tool.id} className={`grid h-10 w-10 place-items-center rounded-lg ${toolTones[tool.id] || toolTones.forms}`}><Icon aria-hidden="true" className="h-5 w-5" /></span>;
        const style = 'portal-interactive rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';
        return tool.href ? <a key={tool.id} href={tool.href} aria-label={label} title={label} target={tool.href.startsWith('/') ? undefined : '_blank'} rel="noreferrer" className={style}>{content}</a> : <button key={tool.id} type="button" aria-label={label} title={label} onClick={openCustomize} className={style}>{content}</button>;
      })}</div>
      {editing && <form id="toolkit-customization" className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700" onSubmit={event => {
        event.preventDefault();
        if (draft.some(tool => !validWorkspaceUrl(tool.href.trim()))) { setFormError('Use a valid HTTP or HTTPS link for each tool, or leave it blank.'); return; }
        update(current => ({ ...current, tools: draft.map(tool => ({ ...tool, href: tool.href.trim() })) })); closeCustomize();
      }}>
        <p className="mb-3 text-xs text-slate-500">Choose favorites and edit links. Saved for your account on this browser.</p>
        <div className="space-y-3">{draft.map((tool, index) => <div key={tool.id} className="flex flex-wrap items-center gap-2"><label className="flex w-40 items-center gap-2 text-sm"><input type="checkbox" checked={tool.favorite} onChange={event => setDraft(items => items.map((item, i) => i === index ? { ...item, favorite: event.target.checked } : item))} />{tool.name}</label><input aria-label={`${tool.name} URL`} value={tool.href} onChange={event => setDraft(items => items.map((item, i) => i === index ? { ...item, href: event.target.value } : item))} placeholder="https://…" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800" /></div>)}</div>
        {formError && <p role="alert" className="mt-3 text-sm font-semibold">{formError}</p>}
        <div className="mt-4 flex gap-2"><button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Save favorites</button><button type="button" onClick={closeCustomize} className="rounded-lg px-3 py-2 text-sm text-slate-500">Cancel</button></div>
      </form>}
    </section>
    <div className="mt-4">

      <MiniCalculators />
    </div>
  </section>;
}
