import { useContext, type ElementType } from 'react';
import { CategorySectionContext } from './CategoryOverview';

interface PageHeaderProps {
  category: string;
  title: string;
  description: string;
  icon: ElementType;
  accent: string;
}

export default function PageHeader({ category, title, description, icon: Icon }: PageHeaderProps) {
  const embedded = useContext(CategorySectionContext);
  const Heading = embedded ? 'h2' : 'h1';
  return <header className="px-1 py-1 text-slate-900 dark:text-slate-100">
    <div className="flex items-start gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"><Icon className="h-4 w-4" /></span>
      <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500 dark:text-slate-400">{category}</p><Heading className={`${embedded ? 'text-xl' : 'text-2xl'} font-bold tracking-tight`}>{title}</Heading><p className="mt-0.5 max-w-4xl text-sm leading-5 text-slate-500 dark:text-slate-400">{description}</p></div>
    </div>
  </header>;
}
