import { AlertCircle, Clock3 } from 'lucide-react';
import { announcementStatus, type Announcement } from '../../data/announcements';

export default function AnnouncementStatus({ item }: { item: Announcement }) {
  const status = announcementStatus(item);
  return <div className="flex flex-wrap items-center gap-2 text-xs"><span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold ${status.overdue ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950' : item.urgent ? 'border border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-200' : 'text-slate-500'}`}>{item.urgent ? <AlertCircle className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}{status.label}</span><span className="text-slate-500 dark:text-slate-400">{status.deadline}</span></div>;
}
