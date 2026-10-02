import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, ExternalLink, LoaderCircle, MapPin, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import { createCalendarEvent, deleteCalendarEvent, getCalendarEvents, updateCalendarEvent, type EventInput, type OutlookEvent } from '../../api/calendar';
import { usePortalUser } from '../../components/auth/AuthContext';

// Microsoft Graph's Windows time-zone identifier for Toronto.
const timeZone = 'Eastern Standard Time';
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (value: number) => String(value).padStart(2, '0');
const localInput = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
const dateKey = (value: string) => value.slice(0, 10);

function freshForm(date = new Date()): EventInput {
  const start = new Date(date); start.setHours(9, 0, 0, 0);
  const end = new Date(start); end.setHours(10);
  return { subject: '', start: localInput(start), end: localInput(end), timeZone, isAllDay: false, location: '', description: '' };
}

function EventModal({ event, selectedDate, onClose, onSaved }: { event: OutlookEvent | null; selectedDate: Date; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<EventInput>(() => event ? {
    subject: event.subject, start: event.start.dateTime.slice(0, 16), end: event.end.dateTime.slice(0, 16), timeZone,
    isAllDay: event.isAllDay, location: event.location?.displayName || '', description: event.bodyPreview || '',
  } : freshForm(selectedDate));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (key: keyof EventInput, value: string | boolean) => setForm(current => ({ ...current, [key]: value }));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    try { event ? await updateCalendarEvent(event.id, form) : await createCalendarEvent(form); onSaved(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save this event.'); setSaving(false); }
  }
  async function remove() {
    if (!event || !window.confirm(`Delete “${event.subject}” from Outlook?`)) return;
    setSaving(true); setError('');
    try { await deleteCalendarEvent(event.id); onSaved(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to delete this event.'); setSaving(false); }
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <form onSubmit={submit} className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-600">Outlook calendar</p><h2 className="mt-1 text-xl font-extrabold">{event ? 'Edit event' : 'Create an event'}</h2></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close"><X className="h-5 w-5" /></button></div>
      <div className="space-y-5 p-6">
        <label className="block"><span className="mb-2 block text-sm font-bold">Event title</span><input autoFocus required value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Team meeting" className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700" /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-bold">Starts</span><input required type="datetime-local" value={form.start} onChange={e => set('start', e.target.value)} className="w-full rounded-xl border border-slate-300 bg-transparent px-3 py-3 dark:border-slate-700" /></label><label><span className="mb-2 block text-sm font-bold">Ends</span><input required type="datetime-local" min={form.start} value={form.end} onChange={e => set('end', e.target.value)} className="w-full rounded-xl border border-slate-300 bg-transparent px-3 py-3 dark:border-slate-700" /></label></div>
        <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={form.isAllDay} onChange={e => set('isAllDay', e.target.checked)} className="h-4 w-4 accent-emerald-600" /> All-day event</label>
        <label className="block"><span className="mb-2 block text-sm font-bold">Location</span><input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Office or Microsoft Teams" className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 dark:border-slate-700" /></label>
        <label className="block"><span className="mb-2 block text-sm font-bold">Notes</span><textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Add an agenda or helpful context…" className="w-full resize-none rounded-xl border border-slate-300 bg-transparent px-4 py-3 dark:border-slate-700" /></label>
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
      </div>
      <div className="flex items-center gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">{event && <button type="button" disabled={saving} onClick={remove} className="mr-auto inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /> Delete</button>}<button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600">Cancel</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-60">{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}{event ? 'Save changes' : 'Create event'}</button></div>
    </form>
  </div>;
}

export default function CalendarPage() {
  const user = usePortalUser();
  const canWrite = Boolean(user?.can_write);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [events, setEvents] = useState<OutlookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mailbox, setMailbox] = useState('technology@mozaicrealty.ca');
  const [modal, setModal] = useState<{ event: OutlookEvent | null; date: Date } | null>(null);
  const start = useMemo(() => new Date(month.getFullYear(), month.getMonth(), 1 - month.getDay()), [month]);
  const days = useMemo(() => Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)), [start]);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 42);
    try { const data = await getCalendarEvents(start.toISOString(), end.toISOString()); setEvents(data.events); setMailbox(data.mailbox); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load Outlook events.'); }
    finally { setLoading(false); }
  }, [start]);
  useEffect(() => { load(); }, [load]);
  const grouped = useMemo(() => events.reduce<Record<string, OutlookEvent[]>>((map, event) => { (map[dateKey(event.start.dateTime)] ||= []).push(event); return map; }, {}), [events]);
  const today = dateKey(localInput(new Date()));
  return <div className="mx-auto max-w-[1500px] px-5 py-7 lg:px-10">
    <PageHeader category="Resources" title="Calendar" description="One shared calendar for training, company, compliance, and community events." icon={CalendarDays} accent="from-emerald-600 to-teal-500" />
    <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 lg:px-7"><div className="mr-auto"><h2 className="text-xl font-extrabold">{month.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}</h2><p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Live sync with {mailbox}{!canWrite && ' · Read-only'}</p></div><button onClick={() => setMonth(new Date())} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold hover:bg-slate-50 dark:border-slate-700">Today</button><div className="flex rounded-xl border border-slate-200 dark:border-slate-700"><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="p-2.5" aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="border-l border-slate-200 p-2.5 dark:border-slate-700" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button></div><button onClick={load} disabled={loading} className="rounded-xl border border-slate-200 p-2.5 dark:border-slate-700" aria-label="Refresh Outlook events"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>{canWrite && <button onClick={() => setModal({ event: null, date: new Date() })} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"><Plus className="h-4 w-4" /> New event</button>}</div>
      {error && <div className="m-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><CalendarDays className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-bold">Calendar connection needs attention</p><p className="mt-1">{error}</p></div></div>}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/30">{dayNames.map(day => <div key={day} className="px-2 py-3 text-center text-[11px] font-extrabold uppercase tracking-widest text-slate-500">{day}</div>)}</div>
      <div className="grid grid-cols-7">{days.map(day => { const key = dateKey(localInput(day)); const items = grouped[key] || []; const muted = day.getMonth() !== month.getMonth(); return <button key={key} onClick={() => canWrite && setModal({ event: null, date: day })} className={`group min-h-28 border-b border-r border-slate-100 p-2 text-left transition hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-emerald-950/20 lg:min-h-36 ${muted ? 'bg-slate-50/50 dark:bg-slate-950/20' : ''}`}><span className={`inline-grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${key === today ? 'bg-emerald-600 text-white' : muted ? 'text-slate-400' : ''}`}>{day.getDate()}</span><div className="mt-1 space-y-1">{items.slice(0, 3).map(event => <span key={event.id} onClick={e => { e.stopPropagation(); if (canWrite) setModal({ event, date: day }); }} className="block truncate rounded-md border-l-2 border-emerald-500 bg-emerald-50 px-1.5 py-1 text-[10px] font-bold text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-200">{!event.isAllDay && <>{new Date(event.start.dateTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · </>}{event.subject}</span>)}{items.length > 3 && <span className="block px-1 text-[10px] font-bold text-slate-500">+{items.length - 3} more</span>}</div></button>; })}</div>
    </section>
    <section className="mt-7"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Coming up</p><h2 className="mt-1 text-2xl font-extrabold">Event agenda</h2></div>{loading && <LoaderCircle className="h-5 w-5 animate-spin text-emerald-600" />}</div><div className="grid gap-3">{events.slice(0, 8).map(event => <button key={event.id} onClick={() => canWrite && setModal({ event, date: new Date(event.start.dateTime) })} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-emerald-50 text-center dark:bg-emerald-950/40"><span><b className="block text-lg leading-none text-emerald-700 dark:text-emerald-300">{new Date(event.start.dateTime).getDate()}</b><small className="font-bold uppercase text-emerald-600">{new Date(event.start.dateTime).toLocaleDateString('en-CA', { month: 'short' })}</small></span></div><div className="min-w-0 flex-1"><h3 className="truncate font-extrabold">{event.subject}</h3><p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{event.isAllDay ? 'All day' : new Date(event.start.dateTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>{event.location?.displayName && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.location.displayName}</span>}</p></div>{event.webLink && <a href={event.webLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="rounded-lg p-2 text-slate-400 hover:text-emerald-600" aria-label="Open in Outlook"><ExternalLink className="h-4 w-4" /></a>}</button>)}{!loading && !error && events.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">No events in this calendar range.{canWrite && ' Select a day to create one.'}</div>}</div></section>
    {modal && <EventModal event={modal.event} selectedDate={modal.date} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
  </div>;
}
