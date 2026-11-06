import { Newspaper } from 'lucide-react';
import AnnouncementStatus from '../../components/shared/AnnouncementStatus';
import { announcements } from '../../data/announcements';
import ResourcePage from '../../components/shared/ResourcePage';

export default function NewsEventsPage() {
  return <ResourcePage category="Resources" title="News & Events" description="Company announcements, upcoming sessions, and event updates." icon={Newspaper} accent="from-indigo-600 to-indigo-500" intro={<section id="announcements-list" aria-labelledby="all-announcements-heading" className="mt-5"><h2 id="all-announcements-heading" className="mb-3 text-xl font-bold">All announcements</h2><div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-4 dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900">{announcements.map(item => <article key={item.id} className={`py-4 ${item.urgent ? 'my-2 border-l-2 border-amber-400 bg-amber-50/60 px-3 dark:border-amber-500 dark:bg-amber-950/20' : ''}`}><AnnouncementStatus item={item} /><h3 className="mt-1 text-base font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.detail}</p>{item.actionHref && <a href={item.actionHref} className="mt-2 inline-block text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300">Review now</a>}</article>)}</div></section>} />;
}
