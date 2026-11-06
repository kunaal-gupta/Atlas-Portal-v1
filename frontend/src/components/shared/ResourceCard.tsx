import { Download, ExternalLink, FileText, MoreHorizontal, Trash2 } from 'lucide-react';
import { usePortalUser } from '../auth/AuthContext';

export function getFileType(href: string) {
  try {
    const fileName = decodeURIComponent(new URL(href, window.location.origin).pathname).split('/').pop() ?? '';
    const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
    return extension && extension.length <= 10 ? extension.toUpperCase() : 'LINK';
  } catch { return 'FILE'; }
}
export const isImageFile = (href: string) => ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'AVIF', 'SVG'].includes(getFileType(href));
export function formatModifiedDate(updatedDate: string) {
  const date = new Date(updatedDate);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export function FileActions({ id, title, href }: { id: number; title: string; href: string }) {
  const user = usePortalUser();
  return <div className="flex shrink-0 items-center gap-1">
    <a data-resource-title={title} href={href} target="_blank" rel="noreferrer" aria-label={`Preview ${title}`} title="Preview in a new tab" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-slate-800"><ExternalLink className="h-4 w-4" /></a>
    <a data-resource-title={title} href={href} download target="_blank" rel="noreferrer" aria-label={`Download ${title}`} title="Download file" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-slate-800"><Download className="h-4 w-4" /></a>
    {user?.is_superuser && <details className="relative" onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus(); } }}>
      <summary aria-label={`More actions for ${title}`} className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><MoreHorizontal className="h-4 w-4" /></summary>
      <div className="absolute right-0 top-full z-30 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"><a href={`/admin/content/document/${id}/delete/`} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"><Trash2 className="h-4 w-4" />Delete in admin</a></div>
    </details>}
  </div>;
}

export default function ResourceCard({ id, title, href, updatedDate }: { id: number; title: string; href: string; updatedDate: string }) {
  return <article className="min-w-0 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
    {isImageFile(href) && <a data-resource-title={title} href={href} target="_blank" rel="noreferrer" aria-label={`Preview ${title}`}><img src={href} alt={title} loading="lazy" className="h-36 w-full rounded-t-xl bg-slate-50 object-contain p-3 dark:bg-slate-800" /></a>}
    <div className="flex min-w-0 items-center gap-2 p-3"><FileText className="h-5 w-5 shrink-0 text-indigo-600" /><a data-resource-title={title} href={href} target="_blank" rel="noreferrer" className="min-w-0 flex-1"><b title={title} className="block truncate text-sm font-semibold">{title}</b><span className="block text-xs text-slate-500">{getFileType(href)} · {formatModifiedDate(updatedDate)}</span></a><FileActions id={id} title={title} href={href} /></div>
  </article>;
}
