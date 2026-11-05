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
  return <a href={item.href} className={`group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 ${compact ? 'min-h-44 gap-3 p-3' : 'min-h-52 p-6'}`}><div className="flex flex-wrap justify-between gap-1 text-[10px] font-bold uppercase tracking-wider"><span className="text-indigo-600">{item.type} news</span><span className="text-slate-400">{item.date}</span></div><div><p className="mb-2 text-xs font-semibold text-slate-400">{item.source}</p><h3 className={`${compact ? 'line-clamp-2 text-sm' : 'text-lg'} font-extrabold leading-snug`}>{item.title}</h3><p className={`mt-2 line-clamp-2 text-slate-500 ${compact ? 'text-xs' : 'text-sm'}`}>{item.excerpt}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold">Read update <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></div></a>;
}
