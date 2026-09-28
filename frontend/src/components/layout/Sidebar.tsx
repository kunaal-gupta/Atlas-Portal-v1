import { ChevronDown } from 'lucide-react';

export interface NavigationGroup { name: string; links: { name: string; path: string }[] }

export default function Sidebar({ groups }: { groups: NavigationGroup[] }) {
  return <nav className="border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" aria-label="Resource categories"><div className="mx-auto flex max-w-[1500px] flex-wrap justify-center px-5">{groups.map((group) => <div key={group.name} className="group relative"><button className="flex items-center gap-2 px-4 py-4 text-xs font-bold text-slate-600 dark:text-slate-300">{group.name}<ChevronDown className="h-3.5 w-3.5" /></button><div className="absolute left-0 top-full z-30 hidden w-64 rounded-b-2xl border border-slate-200 bg-white p-2 shadow-xl group-hover:block group-focus-within:block dark:border-slate-700 dark:bg-slate-800">{group.links.map((link) => <a key={link.path} href={link.path} className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-slate-700">{link.name}</a>)}</div></div>)}</div></nav>;
}
