import { CalendarDays, Clock3, ExternalLink, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCalendarEvents, type OutlookEvent } from '../api/calendar';
import { validWorkspaceUrl } from '../lib/workspace';

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


export default function UpcomingEvents() {
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
  return (
      <section id="upcoming-events" aria-labelledby="upcoming-heading" className="home-panel min-w-0">
        <div className="mb-3 flex items-center justify-between gap-2"><h2 id="upcoming-heading" className="home-section-title">Upcoming events & training</h2><CalendarDays className="h-5 w-5 text-indigo-600" /></div>
        {calendarState === 'loading' && <p role="status" className="py-4 text-sm text-slate-500">Loading upcoming events…</p>}
        {calendarState === 'error' && <div className="py-3"><p className="text-sm text-slate-500">Upcoming events are unavailable. Check the calendar connection.</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="mt-2 rounded-lg text-sm font-semibold text-indigo-700 dark:text-indigo-300">Try again</button></div>}
        {calendarState === 'ready' && !events.length && <p className="py-4 text-sm text-slate-500">No upcoming events in the next 90 days.</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{events.map(event => <article key={event.id} className="flex min-w-0 items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700"><time dateTime={eventStart(event).toISOString()} className="w-12 shrink-0 rounded-lg bg-indigo-50 px-2 py-2 text-center dark:bg-indigo-950"><span className="block text-xs uppercase text-indigo-700 dark:text-indigo-300">{eventStart(event).toLocaleDateString(undefined, { month: 'short' })}</span><span className="block text-xl font-bold">{eventStart(event).getDate()}</span></time><div className="min-w-0 flex-1"><h4 className="text-sm font-semibold">{event.subject}</h4><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5 shrink-0" />{eventTime(event)}</p><p className="mt-1 flex items-start gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5 shrink-0" />{event.location?.displayName || 'Location to be confirmed'}</p>{event.webLink && validWorkspaceUrl(event.webLink) ? <a href={event.webLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">Open in calendar<ExternalLink className="h-3 w-3" /></a> : <a href="/resources/calendar/" className="mt-2 inline-block text-xs font-semibold text-indigo-700 dark:text-indigo-300">View calendar</a>}</div></article>)}</div>
        <a href="/resources/calendar/" className="mt-3 inline-block text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300">View full calendar</a>
      </section>
  );
}
