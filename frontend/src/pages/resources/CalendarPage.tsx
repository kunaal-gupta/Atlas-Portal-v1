import { useEffect, useState } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { getUpcomingEvents } from '../../api/events';
import EmptyState from '../../components/shared/EmptyState';
import PageHeader from '../../components/shared/PageHeader';
import type { PortalEvent } from '../../types';

export default function CalendarPage() {
  const [events, setEvents] = useState<PortalEvent[]>([]);
  useEffect(() => { getUpcomingEvents().then(setEvents).catch(() => undefined); }, []);
  return <div className="mx-auto max-w-[1400px] px-5 py-7 lg:px-10"><PageHeader category="Resources" title="Calendar" description="Training, company, compliance, and community events." icon={CalendarDays} accent="from-emerald-600 to-teal-500" />
    <section className="mt-8"><h2 className="text-2xl font-extrabold">Upcoming events</h2>{events.length ? <div className="mt-5 grid gap-4 md:grid-cols-3">{events.map((event) => <article key={event.id} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><time className="text-xs font-bold text-indigo-600">{new Date(event.start_time).toLocaleDateString()}</time><h3 className="mt-3 font-bold">{event.title}</h3><p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{event.location}</p></article>)}</div> : <div className="mt-5"><EmptyState title="No upcoming events" message="New company events will appear here." /></div>}</section>
  </div>;
}
