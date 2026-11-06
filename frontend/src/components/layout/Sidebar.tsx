import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface NavigationGroup { name: string; links: { name: string; path: string }[] }

export const categoryPath = (group: NavigationGroup) => `/${group.links[0].path.split('/')[1]}/`;

export default function Sidebar({ groups }: { groups: NavigationGroup[] }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigation = useRef<HTMLElement>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);
  const path = window.location.pathname;
  const activeGroup = groups.find(group => categoryPath(group) === path || group.links.some(link => link.path === path));

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!navigation.current?.contains(event.target as Node)) {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);

  const linkStyle = (selected: boolean) => `block rounded-xl px-3 py-3 text-sm transition-colors ${selected ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200' : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-700'}`;

  return (
    <nav ref={navigation} className="sticky top-20 z-30 border-b border-white/10 bg-[#101523] px-5 pb-3 shadow-md lg:px-10" aria-label="Resource categories" onKeyDown={event => {
      if (event.key === 'Escape') {
        if (mobileOpen) mobileToggle.current?.focus();
        else navigation.current?.querySelector<HTMLButtonElement>('[aria-expanded="true"]')?.focus();
        setOpenGroup(null);
        setMobileOpen(false);
      }
    }}>
      <div className="mx-auto max-w-[1420px] rounded-2xl bg-white/5 px-2 sm:rounded-lg">
        <button ref={mobileToggle} type="button" aria-expanded={mobileOpen} aria-controls="portal-mobile-navigation" onClick={() => setMobileOpen(!mobileOpen)} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-sm font-semibold text-slate-200 sm:hidden">
          <span className="flex items-center gap-2"><Menu className="h-4 w-4 text-indigo-600" />{activeGroup?.name || 'Browse portal'}</span>{mobileOpen ? <X className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <div className="hidden justify-center sm:flex sm:flex-wrap">
          {groups.map((group, index) => {
            const expanded = openGroup === group.name;
            const selected = activeGroup?.name === group.name;
            return <div key={group.name} className="relative" onPointerEnter={event => { if (event.pointerType === 'mouse') setOpenGroup(group.name); }} onPointerLeave={event => { if (event.pointerType === 'mouse') setOpenGroup(null); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpenGroup(null); }}>
              <div className={`flex items-center rounded-lg ${selected ? 'bg-white/10' : ''}`}><a href={categoryPath(group)} aria-current={path === categoryPath(group) ? 'page' : undefined} className="flex min-h-11 items-center rounded-lg py-2 pl-4 pr-2 text-xs font-semibold text-slate-200 hover:text-white">{group.name}</a><button type="button" aria-label={`Show ${group.name} pages`} aria-expanded={expanded} aria-controls={`portal-category-${index}`} onClick={() => setOpenGroup(expanded ? null : group.name)} className={`flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs font-semibold transition-colors ${selected || expanded ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                <ChevronDown className={`h-3.5 w-3.5 motion-safe:transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button></div>
              {expanded && <div id={`portal-category-${index}`} className={`absolute top-full z-30 w-64 max-w-[calc(100vw-2.5rem)] pt-2 ${index >= groups.length / 2 ? 'right-0' : 'left-0'}`}>
                <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  {group.links.map(link => <a key={link.path} href={link.path} aria-current={path === link.path ? 'page' : undefined} className={linkStyle(path === link.path)}>{link.name}</a>)}
                </div>
              </div>}
            </div>;
          })}
        </div>
      </div>
      {mobileOpen && <div id="portal-mobile-navigation" className="absolute left-5 right-5 top-full max-h-[65dvh] overflow-y-auto overscroll-contain rounded-2xl border border-slate-100 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:hidden">
        {groups.map(group => <section key={group.name} className="mb-3 last:mb-0"><h2><a href={categoryPath(group)} aria-current={path === categoryPath(group) ? 'page' : undefined} className="block rounded-xl px-3 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300">{group.name} overview</a></h2>{group.links.map(link => <a key={link.path} href={link.path} aria-current={path === link.path ? 'page' : undefined} className={linkStyle(path === link.path)}>{link.name}</a>)}</section>)}
      </div>}
    </nav>
  );
}
