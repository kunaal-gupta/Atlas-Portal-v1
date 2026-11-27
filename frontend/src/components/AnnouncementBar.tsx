import { ChevronLeft, ChevronRight, Megaphone, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { announcements, announcementStatus } from '../data/announcements';

const notices = [...announcements.filter(item => item.urgent), ...announcements.filter(item => !item.urgent)];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (notices.length < 2 || paused || hovered || focused) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timer = window.setInterval(() => {
      if (!document.hidden && !reducedMotion.matches) {
        setIndex(current => (current + 1) % notices.length);
      }
    }, 7000);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused]);

  const notice = notices[index];
  if (!notice) return null;

  const status = announcementStatus(notice);
  const change = (step: number) => setIndex(current => (current + step + notices.length) % notices.length);
  const control = 'grid h-9 w-9 place-items-center rounded-md hover:bg-slate-200 dark:hover:bg-slate-800';

  return (
    <section aria-label="Brokerage announcements"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      className={`mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-3 py-1.5 ${notice.urgent ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'}`}>
      <Megaphone className="h-4 w-4 shrink-0" aria-hidden="true" />
      <div aria-live={paused || hovered || focused ? 'polite' : 'off'} className="min-w-[min(100%,12rem)] flex-1 text-sm">
        <span className="mr-2 font-semibold">{status.label}</span>
        <span>{notice.title}</span>
        {notice.deadlineVerified && notice.dueDate && <span className="ml-2">· {status.deadline}</span>}
      </div>
      <a href={notice.actionHref || '/resources/news-and-events/#announcements-list'}
        className="inline-flex min-h-9 items-center text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300">
        {notice.actionHref ? 'Review now' : 'View announcements'}
      </a>
      {notices.length > 1 && (
        <div className="ml-auto flex items-center gap-1">
          <button type="button" className={control} aria-label={paused ? 'Resume announcements' : 'Pause announcements'}
            onClick={() => setPaused(value => !value)}>
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button type="button" className={control} aria-label="Previous announcement" onClick={() => change(-1)}><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-xs tabular-nums">{index + 1} / {notices.length}</span>
          <button type="button" className={control} aria-label="Next announcement" onClick={() => change(1)}><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </section>
  );
}
