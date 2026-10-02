import { Bell, FileText, LogOut, Moon, Newspaper, Search, Sun, UserRound, Users, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { searchPortal, type SearchRecommendation } from '../../api/search';
import type { NavigationGroup } from './Sidebar';
import { logout, type PortalUser } from '../../api/auth';

const typeIcons = { Page: Search, Document: FileText, Agent: Users, News: Newspaper };

export default function Header({ groups, user, onLogout }: { groups: NavigationGroup[]; user: PortalUser; onLogout: () => void }) {
  const [dark, setDark] = useState(() => localStorage.getItem('atlas-theme') === 'dark');
  const [query, setQuery] = useState('');
  const [remoteResults, setRemoteResults] = useState<SearchRecommendation[]>([]);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);
  const searchArea = useRef<HTMLDivElement>(null);

  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('atlas-theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!searchArea.current?.contains(event.target as Node)) setFocused(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  useEffect(() => {
    if (!query.trim()) { setRemoteResults([]); setSearching(false); return; }
    let active = true;
    setSearching(true);
    const timer = window.setTimeout(() => {
      searchPortal(query.trim())
        .then((results) => { if (active) setRemoteResults(results); })
        .catch(() => { if (active) setRemoteResults([]); })
        .finally(() => { if (active) setSearching(false); });
    }, 180);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query]);

  const pageResults = useMemo<SearchRecommendation[]>(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return groups.flatMap((group) => group.links.map((link) => ({
      type: 'Page' as const,
      title: link.name,
      subtitle: group.name,
      url: link.path,
    }))).filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(term));
  }, [groups, query]);
  const results = [...pageResults, ...remoteResults].slice(0, 12);
  const showResults = focused && Boolean(query.trim());

  return <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90"><div className="mx-auto flex h-20 max-w-[1500px] items-center gap-4 px-5 lg:px-10"><a href="/" className="flex shrink-0 items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-[14px] bg-slate-950 text-lg font-extrabold text-white dark:bg-white dark:text-slate-950">A</span><span className="hidden sm:block"><strong className="block text-xl">Atlas</strong><small className="text-[9px] uppercase tracking-[.22em] text-slate-400">Intelligence portal</small></span></a><div ref={searchArea} className="relative mx-auto w-full max-w-2xl"><label className="relative block"><Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setFocused(true)} onKeyDown={(event) => { if (event.key === 'Escape') setFocused(false); }} placeholder="Search pages, files, agents, and news…" aria-label="Search Atlas" aria-expanded={showResults} className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-indigo-950" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-3 rounded p-1 text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>}</label>{showResults && <div className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"><div className="border-b border-slate-100 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">{searching ? 'Searching…' : `${results.length} recommendations`}</div><div className="max-h-96 overflow-y-auto p-2">{results.map((item, index) => { const Icon = typeIcons[item.type]; return <a key={`${item.type}-${item.url}-${index}`} href={item.url} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-indigo-50 dark:hover:bg-slate-800"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><b className="block truncate text-sm">{item.title}</b><small className="block truncate text-slate-500">{item.type} · {item.subtitle}</small></span></a>; })}{!searching && !results.length && <p className="px-3 py-8 text-center text-sm text-slate-500">No matches found. Try another word.</p>}</div></div>}</div><button aria-label="Notifications" className="hidden h-11 w-11 place-items-center rounded-xl border border-slate-200 sm:grid dark:border-slate-700"><Bell className="h-4 w-4" /></button><button onClick={() => setDark(!dark)} aria-label="Toggle colour theme" className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 dark:border-slate-700">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button><div className="group relative"><button aria-label={`Account for ${user.name}`} className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-white"><UserRound className="h-5 w-5" /></button><div className="absolute right-0 top-full hidden w-56 pt-2 group-hover:block group-focus-within:block"><div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900"><p className="truncate text-sm font-bold">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p><span className="mt-2 inline-block rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{user.can_write ? 'Write access' : 'Read-only'}</span><button onClick={async () => { await logout(); onLogout(); }} className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><LogOut className="h-4 w-4" /> Sign out</button></div></div></div></div></header>;
}
