import {
  BarChart3, BookOpen, Building, Building2, Calculator, CalendarDays, ChevronDown,
  ClipboardCheck, Compass, ContactRound, FileText, FolderOpen, GraduationCap,
  Handshake, HardHat, House, Lightbulb, MapPin, Menu, Newspaper, Palette,
  PanelsTopLeft, Scale, ShieldCheck, Target, X, type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface NavigationGroup { name: string; links: { name: string; path: string }[] }

export const categoryPath = (group: NavigationGroup) => `/${group.links[0].path.split('/')[1]}/`;

const pageIcons: Record<string, LucideIcon> = {
  '/the-numbers/market/': BarChart3,
  '/the-numbers/agent/': ContactRound,
  '/the-numbers/firm/': Building2,
  '/the-numbers/calculators/': Calculator,
  '/training/new-agent/': GraduationCap,
  '/training/new-construction/': HardHat,
  '/training/on-going/': BookOpen,
  '/resources/trade-partners/': Handshake,
  '/resources/condo/': Building,
  '/resources/general/': FolderOpen,
  '/resources/tips/': Lightbulb,
  '/resources/news-and-events/': Newspaper,
  '/resources/calendar/': CalendarDays,
  '/marketing/logos/': Target,
  '/marketing/brand-book-summary/': BookOpen,
  '/marketing/templates/': PanelsTopLeft,
  '/marketing/canva-link/': Palette,
  '/neighbourhoods/intelligence/': Compass,
  '/neighbourhoods/hoodq/': House,
  '/neighbourhoods/schools-shopping-hospitals/': MapPin,
  '/compliance/brokerage-manual/': Scale,
  '/compliance/fintrac/': ShieldCheck,
  '/compliance/tips/': ClipboardCheck,
  '/compliance/other/': FileText,
};

function NavigationTile({ link, current }: { link: NavigationGroup['links'][number]; current: boolean }) {
  const Icon = pageIcons[link.path] ?? FolderOpen;
  return (
    <a href={link.path} aria-current={current ? 'page' : undefined}
      className={`group flex min-h-24 min-w-0 flex-col items-center justify-center gap-2 rounded-xl p-2 text-center text-xs font-semibold transition-colors ${current ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700'}`}>
      <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:bg-slate-800 dark:text-indigo-300 dark:group-hover:bg-indigo-950">
        <Icon className="h-5 w-5" strokeWidth={1.7} />
      </span>
      <span className="break-words px-1 pb-1">{link.name}</span>
    </a>
  );
}

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

  useEffect(() => {
    const element = navigation.current;
    if (!element) return;
    const update = () => document.documentElement.style.setProperty('--portal-navigation-bottom', `${76 + element.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty('--portal-navigation-bottom'); };
  }, []);

  return (
    <nav ref={navigation} className="sticky top-[76px] z-30 border-b border-white/10 bg-[#101827] px-5 pb-3 shadow-md lg:px-10" aria-label="Resource categories" onKeyDown={event => {
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
        <div className="relative hidden justify-center sm:flex sm:flex-wrap">
          {groups.map((group, index) => {
            const expanded = openGroup === group.name;
            const selected = activeGroup?.name === group.name;
            return <div key={group.name} onPointerEnter={event => { if (event.pointerType === 'mouse') setOpenGroup(group.name); }} onPointerLeave={event => { if (event.pointerType === 'mouse') setOpenGroup(null); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpenGroup(null); }}>
              <div className={`flex items-center rounded-lg ${selected ? 'bg-white/5 shadow-[inset_0_-2px_0_0_#087F91]' : ''}`}><a href={categoryPath(group)} aria-current={path === categoryPath(group) ? 'page' : undefined} className="flex min-h-10 items-center rounded-lg py-1 pl-4 pr-2 text-xs font-semibold text-white/90 hover:text-white">{group.name}</a><button type="button" aria-label={`Show ${group.name} pages`} aria-expanded={expanded} aria-controls={`portal-category-${index}`} onClick={() => setOpenGroup(expanded ? null : group.name)} className={`flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs font-semibold transition-colors ${selected || expanded ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}>
                <ChevronDown className={`h-3.5 w-3.5 motion-safe:transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button></div>
              {expanded && <div id={`portal-category-${index}`} className="absolute left-1/2 top-full z-30 w-[36rem] max-w-full -translate-x-1/2 pt-2">
                <div className="grid grid-cols-4 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  {group.links.map(link => <NavigationTile key={link.path} link={link} current={path === link.path} />)}
                </div>
              </div>}
            </div>;
          })}
        </div>
      </div>
      {mobileOpen && <div id="portal-mobile-navigation" className="absolute left-5 right-5 top-full max-h-[65dvh] overflow-y-auto overscroll-contain rounded-2xl border border-slate-100 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:hidden">
        {groups.map(group => <section key={group.name} className="mb-3 last:mb-0"><h2><a href={categoryPath(group)} aria-current={path === categoryPath(group) ? 'page' : undefined} className="block rounded-xl px-3 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300">{group.name} overview</a></h2><div className="grid grid-cols-2 gap-1">{group.links.map(link => <NavigationTile key={link.path} link={link} current={path === link.path} />)}</div></section>)}
      </div>}
    </nav>
  );
}
