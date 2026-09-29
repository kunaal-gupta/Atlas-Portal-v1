import { Download, FileText, Trash2 } from 'lucide-react';

export function getFileType(href: string) {
  try {
    const fileName = decodeURIComponent(new URL(href, window.location.origin).pathname).split('/').pop() ?? '';
    const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
    return extension && extension.length <= 10 ? extension.toUpperCase() : 'LINK';
  } catch {
    return 'FILE';
  }
}

export function formatModifiedDate(updatedDate: string) {
  const date = new Date(updatedDate);
  if (Number.isNaN(date.getTime())) return 'Modified date unavailable';
  return `Modified ${new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)}`;
}

export default function ResourceCard({ id, title, href, updatedDate }: { id: number; title: string; href: string; updatedDate: string }) {
  return <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
    <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950"><FileText className="h-5 w-5" /></span>
    <a href={href} target="_blank" rel="noreferrer" className="min-w-0 flex-1"><b className="block truncate text-sm">{title}</b><small className="text-slate-500">{getFileType(href)} · {formatModifiedDate(updatedDate)}</small></a>
    <a href={href} target="_blank" rel="noreferrer" aria-label={`Download ${title}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-800"><Download className="h-4 w-4" /></a>
    <a href={`/admin/content/document/${id}/delete/`} aria-label={`Delete ${title}`} title="Delete in admin" className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"><Trash2 className="h-4 w-4" /></a>
  </div>;
}
