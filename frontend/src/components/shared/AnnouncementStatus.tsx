import { AlertCircle, Clock3 } from 'lucide-react';
import { announcementStatus, type Announcement } from '../../data/announcements';

export default function AnnouncementStatus({ item }: { item: Announcement }) {
  const status = announcementStatus(item);
  return <div className="flex flex-wrap items-center gap-2 text-xs"><span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold ${status.overdue ? 'bg-amber-800 text-white dark:bg-amber-200 dark:text-amber-950' : item.urgent ? 'border border-amber-200 bg-amber-100/80 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200' : 'text-slate-500'}`}>{item.urgent ? <AlertCircle className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}{status.label}</span><span className="text-slate-500 dark:text-slate-400">{status.deadline}</span></div>;
}
