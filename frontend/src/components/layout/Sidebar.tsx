import { ChevronDown } from 'lucide-react';

export interface NavigationGroup { name: string; links: { name: string; path: string }[] }

export default function Sidebar({ groups }: { groups: NavigationGroup[] }) {
  return (
    <nav className="sticky top-20 z-30 bg-[#f5f7f9]/95 px-5 py-3 backdrop-blur-md dark:bg-slate-950/95 lg:px-10" aria-label="Resource categories">
      <div className="mx-auto flex max-w-[1420px] flex-wrap justify-center rounded-full bg-white px-2 shadow-md dark:bg-slate-900">
        {groups.map((group) => (
          <div key={group.name} className="group relative">
            <button className="flex items-center gap-2 rounded-full px-4 py-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-200 dark:hover:bg-slate-800">
              {group.name}<ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="absolute left-0 top-full z-30 hidden w-64 pt-2 group-hover:block group-focus-within:block">
              <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {group.links.map((link) => <a key={link.path} href={link.path} className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:hover:bg-slate-700">{link.name}</a>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
