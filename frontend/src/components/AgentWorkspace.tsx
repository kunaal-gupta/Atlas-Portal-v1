import { BarChart3, CalendarDays, FileCheck2, FileText, FolderOpen, Home, Mail, Settings2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getCalendarEvents, type OutlookEvent } from '../api/calendar';
import UpcomingMonth from './UpcomingMonth';
import { usePortalUser } from './auth/AuthContext';
import { useWorkspacePreferences, validWorkspaceUrl, type ToolkitLink } from '../lib/workspace';

const icons = { paragon: Home, skyslope: FileCheck2, radar: BarChart3, webforms: FileText, outlook: Mail, forms: FolderOpen };
const toolLogos: Partial<Record<string, string>> = { outlook: '/images/toolkit/outlook.svg' };
const toolTones: Record<string, string> = {
  paragon: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  skyslope: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  radar: 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300',
  webforms: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  outlook: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  forms: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
};
const panel = 'home-panel min-w-0';
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
      setEvents(data.events.filter(item => Number.isFinite(eventStart(item).getTime()) && (eventStart(item).getTime() >= now.getTime() || eventStart({ ...item, start: item.end }).getTime() > now.getTime())).sort((a, b) => eventStart(a).getTime() - eventStart(b).getTime()));
      setCalendarState('ready');
    }).catch(() => { if (!cancelled) setCalendarState('error'); });
    return () => { cancelled = true; };
  }, [attempt]);
  const openCustomize = () => { setDraft(preferences.tools.map(tool => ({ ...tool }))); setFormError(''); setEditing(true); };
  const closeCustomize = () => { setEditing(false); customize.current?.focus(); };
  const favorites = preferences.tools.filter(tool => tool.favorite);

  return <>
    <section id="agent-toolkit" aria-labelledby="toolkit-heading" className={panel} onKeyDown={event => { if (editing && event.key === 'Escape') { event.stopPropagation(); closeCustomize(); } }}>
      <div className="mb-2 flex items-center justify-between gap-3"><h2 id="toolkit-heading" className="home-section-title">Agent toolkit</h2><button ref={customize} type="button" onClick={editing ? closeCustomize : openCustomize} aria-expanded={editing} aria-controls="toolkit-customization" className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300"><Settings2 className="h-4 w-4" />{editing ? 'Close' : 'Customize'}</button></div>
      {!favorites.length && <p className="py-3 text-sm text-slate-500">Choose your favorite tools with Customize.</p>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{favorites.map(tool => {
        const Icon = icons[tool.id as keyof typeof icons] || FileText;
        const logo = toolLogos[tool.id];
        const content = <><span data-tool-icon={tool.id} className={`grid h-7 w-7 place-items-center rounded-lg ${toolTones[tool.id] || toolTones.forms}`}>{logo ? <img src={logo} alt="" className="h-5 w-5 dark:invert" /> : <Icon aria-hidden="true" className="h-5 w-5" />}</span><span className="text-sm font-semibold">{tool.name}</span>{!tool.href && <span className="text-xs text-indigo-700 dark:text-indigo-300">Set link</span>}{tool.id === 'skyslope' && tool.href.includes('google.com/search') && <span className="text-xs text-slate-500">Search shortcut</span>}</>;
        const style = 'portal-interactive flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border border-transparent px-2 py-1 text-center hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-indigo-950';
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
    <section id="upcoming-events" aria-labelledby="upcoming-heading" className={panel}>
      <div className="mb-3 flex items-center justify-between gap-2"><h2 id="upcoming-heading" className="home-section-title">Upcoming events & training</h2><CalendarDays className="h-5 w-5 text-indigo-600" /></div>
      <UpcomingMonth eventDates={events.map(eventStart)} />
      {calendarState === 'loading' && <p role="status" className="py-4 text-sm text-slate-500">Loading upcoming events…</p>}
      {calendarState === 'error' && <div className="py-3"><p className="text-sm text-slate-500">Outlook events are unavailable.</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="mt-2 rounded-lg text-sm font-semibold text-indigo-700 dark:text-indigo-300">Try again</button></div>}
      {calendarState === 'ready' && !events.length && <p className="py-4 text-sm text-slate-500">No upcoming events in the next 90 days.</p>}
      <div className="grid gap-1.5">
        {events.slice(0, 3).map(event => {
          const date = eventStart(event);
          const outlookLink = event.webLink && validWorkspaceUrl(event.webLink) ? event.webLink : '';
          return (
            <article key={event.id} className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-100 p-2 dark:border-slate-700">
              <time dateTime={date.toISOString()} className="w-10 shrink-0 rounded-lg bg-indigo-50 px-1 py-1 text-center dark:bg-indigo-950">
                <span className="block text-xs uppercase text-indigo-700 dark:text-indigo-300">{date.toLocaleDateString(undefined, { month: 'short' })}</span>
                <span className="block text-base font-bold leading-tight">{date.getDate()}</span>
              </time>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold leading-snug">
                  <a href={outlookLink || '/resources/calendar/'} target={outlookLink ? '_blank' : undefined} rel={outlookLink ? 'noreferrer' : undefined} className="hover:underline">
                    {event.subject}
                  </a>
                </h3>
                <p className="text-xs text-slate-500">
                  {eventTime(event)}{event.location?.displayName && ` · ${event.location.displayName}`}
                </p>
              </div>
            </article>
          );
        })}
      </div>
      <a href="/resources/calendar/" className="mt-3 inline-block text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300">View full calendar</a>
    </section>
  </>;
}
