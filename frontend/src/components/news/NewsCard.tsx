import { ArrowRight } from 'lucide-react';

export interface NewsCardItem {
  id: string;
  title: string;
  excerpt: string;
  source: string;
  date: string;
  type: 'Internal' | 'Outside' | 'Market' | 'Training';
  href: string;
}

export default function NewsCard({ item, compact = false }: { item: NewsCardItem; compact?: boolean }) {
  const category = item.type === 'Outside' ? 'Market' : item.type;
  const tagTone = category === 'Training' ? 'bg-amber-700 text-white dark:bg-amber-300 dark:text-amber-950' : category === 'Market' ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-950' : 'bg-indigo-700 text-white dark:bg-indigo-300 dark:text-indigo-950';
  return (
    <a
      href={item.href}
      title={item.title}
      className={`portal-interactive group flex min-w-0 flex-col rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:border-indigo-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-800 dark:bg-slate-900 ${compact ? 'min-h-40 gap-2 p-3' : 'min-h-52 gap-4 p-6'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-medium">
        <span className={`rounded-md px-2 py-1 font-semibold shadow-sm ${tagTone}`}>{category} news</span>
        <span className="flex items-center gap-1 text-slate-500">{item.date}<ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-indigo-500 motion-safe:transition-transform group-hover:translate-x-0.5" /></span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <h3 className={`${compact ? 'line-clamp-2 text-base' : 'text-lg'} shrink-0 font-bold leading-snug tracking-tight text-slate-800 transition group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-300`}>{item.title}</h3>
        <p className={`mt-2 line-clamp-2 shrink-0 leading-5 text-slate-500 ${compact ? 'text-sm' : 'text-sm'}`}>{item.excerpt}</p>

      </div>
    </a>
  );
}
