import type { ElementType } from 'react';

interface PageHeaderProps {
  category: string;
  title: string;
  description: string;
  icon: ElementType;
  accent: string;
}

export default function PageHeader({ category, title, description, icon: Icon }: PageHeaderProps) {
  return <header className="px-1 py-3 text-slate-900 dark:text-slate-100">
    <div className="flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"><Icon className="h-6 w-6" /></span>
      <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500 dark:text-slate-400">{category}</p><h1 className="text-3xl font-bold tracking-tight">{title}</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p></div>
    </div>
  </header>;
}
