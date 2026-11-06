import { ArrowRight, CircleAlert, X } from 'lucide-react';
import { useState } from 'react';
import { announcements, announcementStatus } from '../data/announcements';
import { usePortalUser } from './auth/AuthContext';

export default function RequiredActionBanner() {
  const user = usePortalUser();
  const storageKey = `atlas-action-dismissed:${encodeURIComponent(user?.email.toLowerCase() || '')}`;
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try { const saved = JSON.parse(sessionStorage.getItem(storageKey) || '[]'); return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : []; }
    catch { return []; }
  });
  // Dismissing only hides the reminder for this browser session; it does not acknowledge it.
  const action = announcements.find(item => item.urgent && item.actionHref && !dismissed.includes(`${item.id}:${item.title}:${item.dueDate || ''}`));
  if (!action) return null;
  const status = announcementStatus(action);
  return <section aria-label="Required brokerage action" className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-amber-200 border-l-4 border-l-amber-500 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:border-l-amber-400 dark:bg-amber-950">
    <CircleAlert aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
    <div className="min-w-0 flex-1"><h2 className="text-sm font-semibold text-slate-950 dark:text-white">{status.label}: {action.title}</h2><p className="text-xs text-slate-600 dark:text-slate-300">Review the updated brokerage guidance.{action.deadlineVerified && action.dueDate ? ` ${status.deadline}.` : ''}</p></div>
    <a href={action.actionHref} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300">Review now<ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
    <button type="button" aria-label="Dismiss action reminder for this session" title="Dismiss for this session; available in notifications" onClick={() => {
      const next = [...dismissed, `${action.id}:${action.title}:${action.dueDate || ''}`];
      setDismissed(next);
      try { sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Keep dismissal in memory if storage is unavailable. */ }
    }} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-amber-100 dark:text-slate-300 dark:hover:bg-amber-900"><X aria-hidden="true" className="h-4 w-4" /></button>
  </section>;
}
