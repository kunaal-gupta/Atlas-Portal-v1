import { Newspaper } from 'lucide-react';
import { announcements } from '../../data/announcements';
import ResourcePage from '../../components/shared/ResourcePage';

export default function NewsEventsPage() {
  return <ResourcePage category="Resources" title="News & Events" description="Company announcements, upcoming sessions, and event updates." icon={Newspaper} accent="from-indigo-600 to-indigo-500" intro={<section id="announcements-list" aria-labelledby="all-announcements-heading" className="mt-5"><h2 id="all-announcements-heading" className="mb-3 text-xl font-bold">All announcements</h2><div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-4 dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900">{announcements.map(item => <article key={item.id} className="py-4"><p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">{item.label} · {item.time}</p><h3 className="mt-1 text-base font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.detail}</p></article>)}</div></section>} />;
}
