import { ArrowRight } from 'lucide-react';

export interface NewsCardItem {
  id: string;
  title: string;
  excerpt: string;
  source: string;
  date: string;
  type: 'Internal' | 'Outside';
  href: string;
}

export default function NewsCard({ item, compact = false }: { item: NewsCardItem; compact?: boolean }) {
  return (
    <a
      href={item.href}
      title={item.title}
      className={`group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-800 dark:bg-slate-900 ${compact ? 'h-48 gap-3 p-3' : 'min-h-52 gap-4 p-6'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-medium">
        <span className={`rounded-md px-1.5 py-1 ${item.type === 'Internal' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'}`}>{item.type} news</span>
        <span className="text-slate-500">{item.date}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <h3 className={`${compact ? 'line-clamp-2 text-sm' : 'text-lg'} shrink-0 font-bold leading-snug tracking-tight text-slate-800 transition group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-300`}>{item.title}</h3>
        <p className={`mt-2 line-clamp-2 shrink-0 leading-5 text-slate-500 ${compact ? 'text-xs' : 'text-sm'}`}>{item.excerpt}</p>
        <div className="mt-auto flex min-w-0 items-center justify-between gap-2 pt-3">
          <span className="truncate text-[10px] text-slate-500">{item.source}</span>
          <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-indigo-500 transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </a>
  );
}
