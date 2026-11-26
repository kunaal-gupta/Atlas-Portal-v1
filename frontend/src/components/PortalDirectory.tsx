import {
  BarChart3, BookOpen, Building, Building2, Calculator, CalendarDays,
  ClipboardCheck, Compass, ContactRound, FileText, FolderOpen, GraduationCap,
  Handshake, HardHat, House, Lightbulb, MapPin, Newspaper, Palette,
  PanelsTopLeft, Scale, ShieldCheck, Target, type LucideIcon,
} from 'lucide-react';
import type { NavigationGroup } from './layout/Sidebar';

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

export default function PortalDirectory({ groups }: { groups: NavigationGroup[] }) {
  return (
    <nav aria-labelledby="portal-directory-heading" className="home-panel mt-4 min-w-0">
      <h3 id="portal-directory-heading" className="home-section-title">Portal directory</h3>
      <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-700">
        {groups.map(group => (
          <section key={group.name} className="py-3">
            <h4 className="mb-2 text-sm font-semibold">{group.name}</h4>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {group.links.map(link => {
                const Icon = pageIcons[link.path] ?? FolderOpen;
                return (
                  <li key={link.path} className="min-w-0">
                    <a href={link.path} className="portal-interactive flex h-full min-h-20 flex-col items-center justify-center gap-1 rounded-lg border border-transparent px-2 py-2 text-center text-sm font-semibold hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-indigo-950">
                      <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="break-words">{link.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
