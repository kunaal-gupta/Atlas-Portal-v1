import { ArrowUpRight } from 'lucide-react';
import { createContext, type ComponentType } from 'react';
import type { NavigationGroup } from '../layout/Sidebar';

export const CategorySectionContext = createContext(false);

export default function CategoryOverview({ group, pages }: { group: NavigationGroup; pages: Record<string, ComponentType> }) {
  return <div className="mx-auto max-w-[1400px] px-5 py-6 lg:px-10">
    <header className="mb-6"><p className="mb-2 text-[10px] font-bold uppercase tracking-[.16em] text-indigo-700 dark:text-indigo-300">Category overview</p><h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{group.name}</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">All {group.name.toLowerCase()} content, organized by topic.</p></header>
    <nav aria-label={`${group.name} topics`} className="mb-6 flex flex-wrap gap-2">{group.links.map((link, index) => <a key={link.path} href={`#topic-${index}`} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{link.name}</a>)}</nav>
    <CategorySectionContext.Provider value={true}>
      <div className="space-y-6">{group.links.map((link, index) => {
        const Page = pages[link.path];
        if (!Page) return null;
        return <section id={`topic-${index}`} key={link.path} aria-label={link.name} className="category-section rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <a href={link.path} className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300">Open {link.name}<ArrowUpRight className="h-3.5 w-3.5" /></a>
          <Page />
        </section>;
      })}</div>
    </CategorySectionContext.Provider>
  </div>;
}
