import { BarChart3, CalendarDays, Clock3, ExternalLink, FileCheck2, FileText, FolderOpen, Home, Mail, MapPin, Settings2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getCalendarEvents, type OutlookEvent } from '../api/calendar';
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
const panel = 'min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5';
function eventStart(event: OutlookEvent) {
  const raw = event.start.dateTime;
  if (event.isAllDay) return new Date(`${raw.slice(0, 10)}T12:00:00`);
  return new Date(raw + (!/(Z|[+-]\d{2}:\d{2})$/i.test(raw) && event.start.timeZone === 'UTC' ? 'Z' : ''));
}
function eventTime(event: OutlookEvent) {
  if (event.isAllDay) return 'All day';
  const raw = event.start.dateTime;
  const naiveNonUtc = !/(Z|[+-]\d{2}:\d{2})$/i.test(raw) && event.start.timeZone !== 'UTC';
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', ...(naiveNonUtc ? {} : { timeZoneName: 'short' as const }) }).format(eventStart(event)) + (naiveNonUtc ? ` (${event.start.timeZone})` : '');
}

export default function AgentWorkspace() {
  const user = usePortalUser();
  const { preferences, update } = useWorkspacePreferences(user?.email || '');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ToolkitLink[]>([]);
  const [formError, setFormError] = useState('');
  const customize = useRef<HTMLButtonElement>(null);
  const [events, setEvents] = useState<OutlookEvent[]>([]);
  const [calendarState, setCalendarState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const now = new Date();
    const until = new Date(now); until.setDate(until.getDate() + 90);
    setCalendarState('loading');
    getCalendarEvents(now.toISOString(), until.toISOString()).then(data => {
      if (cancelled) return;
      setEvents(data.events.filter(item => Number.isFinite(eventStart(item).getTime()) && (eventStart(item).getTime() >= now.getTime() || eventStart({ ...item, start: item.end }).getTime() > now.getTime())).sort((a, b) => eventStart(a).getTime() - eventStart(b).getTime()).slice(0, 3));
      setCalendarState('ready');
    }).catch(() => { if (!cancelled) setCalendarState('error'); });
    return () => { cancelled = true; };
  }, [attempt]);
  const openCustomize = () => { setDraft(preferences.tools.map(tool => ({ ...tool }))); setFormError(''); setEditing(true); };
  const closeCustomize = () => { setEditing(false); customize.current?.focus(); };
  const favorites = preferences.tools.filter(tool => tool.favorite);

  return <section aria-labelledby="workspace-heading" className="min-w-0 lg:col-span-2">
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><h2 id="workspace-heading" className="text-xl font-bold">Your workspace</h2><p className="text-xs text-slate-500 dark:text-slate-400">Personalized tools and resources</p></div>
    <section id="agent-toolkit" aria-labelledby="toolkit-heading" className={`${panel} !p-3 sm:!p-4`} onKeyDown={event => { if (editing && event.key === 'Escape') { event.stopPropagation(); closeCustomize(); } }}>
      <div className="mb-2 flex items-center justify-between gap-3"><h3 id="toolkit-heading" className="text-lg font-semibold">Quick access / Agent toolkit</h3><button ref={customize} type="button" onClick={editing ? closeCustomize : openCustomize} aria-expanded={editing} aria-controls="toolkit-customization" className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300"><Settings2 className="h-4 w-4" />{editing ? 'Close' : 'Customize'}</button></div>
      {!favorites.length && <p className="py-3 text-sm text-slate-500">Choose your favorite tools with Customize.</p>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">{favorites.map(tool => {
        const Icon = icons[tool.id as keyof typeof icons] || FileText;
        const content = <><span data-tool-icon={tool.id} className={`grid h-8 w-8 place-items-center rounded-lg ${toolTones[tool.id] || toolTones.forms}`}><Icon className="h-5 w-5" /></span><span className="text-sm font-semibold">{tool.name}</span>{!tool.href && <span className="text-xs text-indigo-700 dark:text-indigo-300">Set link</span>}{tool.id === 'skyslope' && tool.href.includes('google.com/search') && <span className="text-xs text-slate-500">Search shortcut</span>}</>;
        const style = 'portal-interactive flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-lg border border-transparent px-2 py-1 text-center hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-indigo-950';
        return tool.href ? <a key={tool.id} href={tool.href} target={tool.href.startsWith('/') ? undefined : '_blank'} rel="noreferrer" className={style}>{content}</a> : <button key={tool.id} type="button" onClick={openCustomize} className={style}>{content}</button>;
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
    <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
      <section id="upcoming-events" aria-labelledby="upcoming-heading" className={panel}>
        <div className="mb-3 flex items-center justify-between gap-2"><h3 id="upcoming-heading" className="text-lg font-semibold">Upcoming events & training</h3><CalendarDays className="h-5 w-5 text-indigo-600" /></div>
        {calendarState === 'loading' && <p role="status" className="py-4 text-sm text-slate-500">Loading upcoming events…</p>}
        {calendarState === 'error' && <div className="py-3"><p className="text-sm text-slate-500">Upcoming events are unavailable. Check the calendar connection.</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="mt-2 rounded-lg text-sm font-semibold text-indigo-700 dark:text-indigo-300">Try again</button></div>}
        {calendarState === 'ready' && !events.length && <p className="py-4 text-sm text-slate-500">No upcoming events in the next 90 days.</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{events.map(event => <article key={event.id} className="flex min-w-0 items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700"><time dateTime={eventStart(event).toISOString()} className="w-12 shrink-0 rounded-lg bg-indigo-50 px-2 py-2 text-center dark:bg-indigo-950"><span className="block text-xs uppercase text-indigo-700 dark:text-indigo-300">{eventStart(event).toLocaleDateString(undefined, { month: 'short' })}</span><span className="block text-xl font-bold">{eventStart(event).getDate()}</span></time><div className="min-w-0 flex-1"><h4 className="text-sm font-semibold">{event.subject}</h4><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5 shrink-0" />{eventTime(event)}</p><p className="mt-1 flex items-start gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5 shrink-0" />{event.location?.displayName || 'Location to be confirmed'}</p>{event.webLink && validWorkspaceUrl(event.webLink) ? <a href={event.webLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">Open in calendar<ExternalLink className="h-3 w-3" /></a> : <a href="/resources/calendar/" className="mt-2 inline-block text-xs font-semibold text-indigo-700 dark:text-indigo-300">View calendar</a>}</div></article>)}</div>
        <a href="/resources/calendar/" className="mt-3 inline-block text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300">View full calendar</a>
      </section>
      <MiniCalculators />
    </div>
  </section>;
}
