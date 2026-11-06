import { Bell, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { announcements } from '../../data/announcements';
import AnnouncementStatus from '../shared/AnnouncementStatus';

export default function HeaderAnnouncements() {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const close = (restoreFocus = false) => { setOpen(false); if (restoreFocus) toggle.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const outside = (event: PointerEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <div ref={container} className="relative shrink-0" onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
    <button ref={toggle} type="button" aria-label="Announcements" title="Announcements" aria-haspopup="dialog" aria-expanded={open} aria-controls="header-announcements" onClick={() => setOpen(!open)} className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/5 text-slate-100 hover:bg-white/10"><Bell aria-hidden="true" className="h-4 w-4" />{announcements.some(item => item.urgent) && <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />}</button>
    {open && <div ref={panel} id="header-announcements" role="dialog" aria-labelledby="header-announcements-heading" tabIndex={-1} className="fixed left-4 right-4 top-[68px] z-50 max-h-[calc(100dvh-88px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-lg outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:absolute sm:left-auto sm:top-[calc(100%+12px)] sm:w-[420px]">
      <div className="mb-3 flex items-center justify-between gap-3"><h2 id="header-announcements-heading" className="text-lg font-semibold">Announcements</h2><button type="button" aria-label="Close announcements" onClick={() => close(true)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X aria-hidden="true" className="h-4 w-4" /></button></div>
      <div className="space-y-3">{announcements.map(item => <article key={item.id} className={`rounded-xl border p-3 ${item.urgent ? 'border-amber-200 border-l-2 border-l-amber-400 bg-amber-50/60 dark:border-amber-900 dark:border-l-amber-500 dark:bg-amber-950/20' : 'border-slate-100 dark:border-slate-700'}`}><AnnouncementStatus item={item} /><h3 className="mt-2 text-sm font-semibold leading-5">{item.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.detail}</p>{item.actionHref && <a href={item.actionHref} className="mt-2 inline-block text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300">Review now</a>}</article>)}</div>
      <a href="/resources/news-and-events/#announcements-list" className="mt-3 inline-block text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300">View all announcements</a>
    </div>}
  </div>;
}
