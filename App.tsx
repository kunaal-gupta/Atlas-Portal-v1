import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BarChart3, Bell, BookOpen, CalendarDays, Check, CheckCircle2,
  ChevronDown, Download, ExternalLink, FileText, GraduationCap, MapPinned,
  Command, Grid2X2, List, Mail, MapPin, Megaphone, Menu, Moon, Phone, Search,
  ShieldCheck, Sparkles, Sun, UserRound, X,
} from 'lucide-react';
import HomeDashboard from './components/Home/HomeDashboard';
import type { Agent } from './types';

type Link = { name: string; summary: string };
type Category = { name: string; description: string; icon: React.ElementType; links: Link[] };

const categoryTheme: Record<string, { icon: string; glow: string; gradient: string }> = {
  'The Numbers': { icon: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', glow: 'bg-blue-500/20', gradient: 'from-blue-600 to-cyan-500' },
  Training: { icon: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300', glow: 'bg-violet-500/20', gradient: 'from-violet-600 to-fuchsia-500' },
  Resources: { icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', glow: 'bg-emerald-500/20', gradient: 'from-emerald-600 to-teal-500' },
  Marketing: { icon: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', glow: 'bg-amber-500/20', gradient: 'from-orange-500 to-rose-500' },
  Neighbourhoods: { icon: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300', glow: 'bg-rose-500/20', gradient: 'from-rose-600 to-pink-500' },
  Compliance: { icon: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300', glow: 'bg-cyan-500/20', gradient: 'from-cyan-600 to-blue-500' },
};

const categories: Category[] = [
  { name: 'The Numbers', description: 'Company performance, production, and current market intelligence.', icon: BarChart3, links: [
    { name: 'Market', summary: 'Market snapshots, trends, statistics, and monthly reports.' },
    { name: 'Agent', summary: 'Your production dashboard, goals, and performance resources.' },
    { name: 'Firm', summary: 'Brokerage-wide results, milestones, and company reporting.' },
  ] },
  { name: 'Training', description: 'Practical learning designed for every stage of an agent’s career.', icon: GraduationCap, links: [
    { name: 'New Agent', summary: 'Onboarding, systems, fundamentals, and your first 90-day plan.' },
    { name: 'New Construction', summary: 'Builder relationships, contracts, and new-home sales training.' },
    { name: 'On-Going', summary: 'Workshops, recorded sessions, and continuing education.' },
  ] },
  { name: 'Resources', description: 'Everyday documents and tools that keep your business moving.', icon: BookOpen, links: [
    { name: 'New Agent', summary: 'Essential setup documents, checklists, and quick-start resources.' },
    { name: 'Trade Partners', summary: 'Trusted inspectors, lawyers, lenders, and service providers.' },
    { name: 'Condo', summary: 'Condominium forms, guides, clauses, and reference documents.' },
    { name: 'General', summary: 'Frequently used forms, office documents, and reference material.' },
    { name: 'Tips', summary: 'Field-tested advice, scripts, checklists, and productivity ideas.' },
    { name: 'News & Events', summary: 'Company announcements, upcoming sessions, and event updates.' },
    { name: 'Calendar', summary: 'Training, company, compliance, and community event calendar.' },
  ] },
  { name: 'Marketing', description: 'Approved brand assets and templates for polished campaigns.', icon: Megaphone, links: [
    { name: 'Logos', summary: 'Current company and team logos in print and digital formats.' },
    { name: 'Brand Book Summary', summary: 'A practical guide to colours, typography, voice, and usage.' },
    { name: 'Templates', summary: 'Ready-to-use social, print, presentation, and listing templates.' },
    { name: 'Canva Link', summary: 'Open the company’s shared, editable Canva template library.' },
  ] },
  { name: 'Neighbourhoods', description: 'Local knowledge for confident, useful client conversations.', icon: MapPinned, links: [
    { name: 'HoodQ', summary: 'Create client-ready neighbourhood reports and local insights.' },
    { name: 'Schools, Shopping, Hospitals', summary: 'Quick access to important community amenities and services.' },
  ] },
  { name: 'Compliance', description: 'Brokerage policy and regulatory guidance that protects your business.', icon: ShieldCheck, links: [
    { name: 'Brokerage Manual', summary: 'Company policies, procedures, standards, and responsibilities.' },
    { name: 'FINTRAC', summary: 'Identification, record keeping, reporting, and compliance resources.' },
    { name: 'Tips', summary: 'Plain-language reminders for complete and compliant files.' },
    { name: 'Other', summary: 'Additional regulatory notices, forms, and reference documents.' },
  ] },
];

const slugify = (text: string) => text.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const pathFor = (category: Category, link: Link) => `/${slugify(category.name)}/${slugify(link.name)}/`;
const allLinks = categories.flatMap((category) => category.links.map((link) => ({ category, link, path: pathFor(category, link) })));

function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('atlas-theme') === 'dark' || (!localStorage.getItem('atlas-theme') && matchMedia('(prefers-color-scheme: dark)').matches));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('atlas-theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, setDark] as const;
}

const App: React.FC = () => {
  const [dark, setDark] = useTheme();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const current = allLinks.find((item) => item.path === window.location.pathname);
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? allLinks.filter(({ category, link }) => `${category.name} ${link.name} ${link.summary}`.toLowerCase().includes(value)).slice(0, 7) : [];
  }, [query]);
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setQuery('');
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  return <div className="app-grid min-h-screen bg-[#f7f8fc] text-slate-950 transition-colors dark:bg-[#080b12] dark:text-slate-100">
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
      <div className="mx-auto flex h-20 max-w-[1500px] items-center gap-4 px-5 lg:px-10">
        <a href="/" className="flex shrink-0 items-center gap-3.5" aria-label="Atlas home">
          <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-[14px] bg-slate-950 text-lg font-extrabold text-white shadow-lg shadow-slate-300/70 dark:bg-white dark:text-slate-950 dark:shadow-none"><span className="relative z-10">A</span><span className="absolute -bottom-3 -right-3 h-7 w-7 rounded-full bg-indigo-500 blur-md" /></span>
          <span className="hidden sm:block"><strong className="block text-xl font-extrabold leading-5 tracking-[-.04em]">Atlas</strong><small className="text-[9px] font-bold uppercase tracking-[.22em] text-slate-400">Intelligence portal</small></span>
        </a>

        <div className="relative mx-auto w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Atlas..." aria-label="Search Atlas" className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 py-3 pl-11 pr-20 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100/70 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-indigo-950" />
          <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-400 md:flex dark:border-slate-700 dark:bg-slate-800"><Command className="h-3 w-3" /> K</span>
          {query && <div className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            {results.length ? results.map(({ category, link, path }) => <a key={path} href={path} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700"><span><b className="block text-sm">{link.name}</b><small className="text-slate-500 dark:text-slate-400">{category.name}</small></span><ArrowRight className="h-4 w-4 text-slate-400" /></a>) : <p className="px-4 py-5 text-center text-sm text-slate-500">No resources found.</p>}
          </div>}
        </div>

        <div className="relative hidden sm:block"><button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" aria-label="Notifications" aria-expanded={notificationsOpen}><Bell className="h-4.5 w-4.5" /><span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-rose-500 dark:border-slate-950" /></button>{notificationsOpen && <div className="absolute right-0 top-14 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800"><div><b className="text-sm">Notifications</b><p className="text-[11px] text-slate-400">Two items need your attention</p></div><span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950">2 new</span></div>{['FINTRAC acknowledgement is due soon', 'New October marketing assets are ready'].map((notice, index) => <a href="/resources/news-and-events/" key={notice} className="flex gap-3 border-b border-slate-100 p-4 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${index ? 'bg-indigo-500' : 'bg-rose-500'}`} /><span><b className="block text-xs leading-5">{notice}</b><small className="text-[10px] text-slate-400">{index ? 'Yesterday' : 'Today'}</small></span></a>)}</div>}</div>
        <button onClick={() => setDark(!dark)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" aria-label={`Use ${dark ? 'light' : 'dark'} mode`}>{dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}</button>
        <button className="hidden items-center gap-2.5 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3 sm:flex dark:border-slate-700"><span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white"><UserRound className="h-4 w-4" /></span><span className="text-left"><b className="block text-[11px] leading-4">Alex Morgan</b><small className="block text-[9px] text-slate-400">Senior agent</small></span></button>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 lg:hidden dark:border-slate-700" aria-label="Toggle categories">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
    </header>

    <nav className={`${mobileOpen ? 'block' : 'hidden'} relative z-30 border-b border-slate-300/80 bg-slate-100/95 shadow-sm lg:block dark:border-white/10 dark:bg-slate-900/95`} aria-label="Resource categories">
      <div className="mx-auto max-w-[1500px] px-5 lg:flex lg:h-14 lg:items-stretch lg:justify-center lg:px-10">
        {categories.map((category) => <div key={category.name} className="group relative border-b border-slate-100 last:border-0 lg:border-0">
          <button className="flex w-full items-center justify-between gap-2 px-4 py-4 text-[12px] font-bold text-slate-600 group-hover:text-indigo-600 lg:h-full lg:w-auto dark:text-slate-300"><span>{category.name}</span><ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" /></button>
          <div className="hidden pb-3 group-hover:block group-focus-within:block lg:absolute lg:left-0 lg:top-full lg:w-80 lg:rounded-b-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-3 lg:shadow-2xl dark:lg:border-slate-700 dark:lg:bg-slate-800">
            <p className="px-3 pb-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{category.description}</p>
            {category.links.map((link) => <a key={link.name} href={pathFor(category, link)} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-slate-700 dark:hover:text-indigo-300"><span>{link.name}</span>{link.name === 'Calendar' ? <CalendarDays className="h-4 w-4" /> : <ArrowRight className="h-4 w-4 text-slate-300" />}</a>)}
          </div>
        </div>)}
      </div>
    </nav>

    <main>{current ? <ResourcePage {...current} /> : <HomePage />}</main>
    <footer className="border-t border-slate-200/70 bg-white/80 py-10 backdrop-blur dark:border-white/10 dark:bg-slate-950/80"><div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-10"><span className="flex items-center gap-3"><b className="text-sm text-slate-900 dark:text-white">Atlas</b><span className="h-4 w-px bg-slate-200 dark:bg-slate-700" />© {new Date().getFullYear()} Internal agent intelligence</span><div className="flex gap-6"><a href="mailto:support@atlas.company" className="font-bold hover:text-indigo-600">Get support</a><a href="/admin/" className="font-bold hover:text-indigo-600">Content administration</a></div></div></footer>
  </div>;
};

function HomePage() {
  return <div className="relative mx-auto max-w-[1500px] px-5 py-6 lg:px-10 lg:py-8">
    <div className="pointer-events-none absolute left-0 top-0 -z-0 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-900/20" />
    <section className="relative overflow-hidden rounded-3xl bg-[#111827] px-7 py-8 text-white shadow-[0_20px_60px_-35px_rgba(15,23,42,.8)] sm:px-10 lg:px-12 lg:py-10"><div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(99,102,241,.28),transparent_32%)]" /><div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end"><div className="max-w-2xl"><span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-indigo-300"><Sparkles className="h-3.5 w-3.5" /> Atlas intelligence</span><h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-.04em] sm:text-4xl lg:text-5xl">Good morning, Alex.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Your market pulse, company news, and important updates—all in one focused view.</p></div><div className="flex shrink-0 gap-3"><a href="/the-numbers/market/" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950">View market <ArrowRight className="h-4 w-4" /></a><a href="/resources/calendar/" className="inline-flex items-center rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold">Open calendar</a></div></div></section>
    <HomeDashboard />
  </div>;
}

function ResourcePage({ category, link }: { category: Category; link: Link }) {
  const Icon = category.icon;
  const related = category.links.filter((item) => item.name !== link.name).slice(0, 3);
  const theme = categoryTheme[category.name];
  return <div className="relative mx-auto max-w-[1400px] px-5 py-5 lg:px-10 lg:py-7">
    <div className={`pointer-events-none absolute right-0 top-0 -z-0 h-80 w-80 rounded-full blur-3xl ${theme.glow}`} />
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${theme.gradient} px-5 py-4 text-white shadow-lg sm:px-6`}><div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" /><div className="relative flex items-center gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20"><Icon className="h-5 w-5" /></div><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/70">{category.name}</p><h1 className="text-2xl font-extrabold tracking-[-.03em]">{link.name}</h1></div></div></div>
    <div className="mt-6 grid gap-8 xl:grid-cols-[230px_minmax(0,1fr)]"><aside className="hidden xl:block"><div className="sticky top-40 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"><p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">In this collection</p>{category.links.map((item) => <a key={item.name} href={pathFor(category, item)} className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${item.name === link.name ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white'}`}><span>{item.name}</span>{item.name === link.name ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5 opacity-40" />}</a>)}</div></aside><div>{category.name === 'The Numbers' && link.name === 'Agent' ? <AgentDirectory /> : <><PageWorkspace category={category} link={link} />
    <div id="library" className="mt-10 grid gap-6 lg:grid-cols-[1fr_300px]"><section><div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600">Curated for you</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight">{category.name === 'Marketing' ? 'Approved assets' : category.name === 'Training' ? 'Course materials' : category.name === 'The Numbers' ? 'Reports & exports' : 'Resource library'}</h2></div><span className="text-xs text-slate-400">3 files</span></div><div className="grid gap-3">{[`${link.name} — agent guide`, `${link.name} checklist & workflow`, `${link.name} reference library`].map((name, index) => <a key={name} href={`/media/resources/${slugify(link.name)}-${index + 1}.pdf`} className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/90"><span className={`grid h-12 w-12 place-items-center rounded-xl ${theme.icon}`}><FileText className="h-5 w-5" /></span><span className="min-w-0 flex-1"><b className="block truncate text-sm">{name}</b><small className="mt-1 block text-slate-500">PDF · Company approved · Updated Sep 2026</small></span><span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-50 text-slate-400 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-800"><Download className="h-4 w-4" /></span></a>)}</div></section>
      <aside className="space-y-5"><div className="relative overflow-hidden rounded-3xl bg-[#0b1020] p-6 text-white"><div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-indigo-500/30 blur-2xl" /><CheckCircle2 className="relative h-6 w-6 text-indigo-300" /><h2 className="relative mt-5 text-lg font-bold">Expert guidance</h2><p className="relative mt-2 text-sm leading-6 text-slate-300">Get an answer from the office team or request a resource for this collection.</p><a href="mailto:support@atlas.company" className="relative mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider">Contact support <ExternalLink className="h-4 w-4" /></a></div><div className="rounded-2xl border border-slate-200 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-900/90"><h3 className="text-sm font-bold">Continue exploring</h3>{related.map((item) => <a key={item.name} href={pathFor(category, item)} className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-300"><span>{item.name}</span><ArrowRight className="h-3.5 w-3.5" /></a>)}</div></aside>
    </div></> }</div>
    </div>
  </div>;
}

function AgentDirectory() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'tiles' | 'list'>(() => localStorage.getItem('atlas-agent-view') === 'list' ? 'list' : 'tiles');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/agents/')
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load agents');
        return response.json();
      })
      .then((data) => setAgents(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const visibleAgents = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return agents;
    return agents.filter((agent) => [agent.full_name, agent.email, agent.job_title, agent.professional_role, agent.location, agent.company].some((field) => field?.toLowerCase().includes(value)));
  }, [agents, query]);

  const selectView = (nextView: 'tiles' | 'list') => {
    setView(nextView);
    localStorage.setItem('atlas-agent-view', nextView);
  };

  const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const role = (agent: Agent) => agent.job_title || agent.professional_role || agent.access_role;

  return <section aria-labelledby="agent-directory-title">
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-slate-800">
      <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">Company directory</p><h2 id="agent-directory-title" className="mt-1 text-2xl font-extrabold tracking-tight">All agents</h2><p className="mt-1 text-sm text-slate-500">{loading ? 'Loading directory…' : `${visibleAgents.length} of ${agents.length} agents`}</p></div>
      <div className="flex gap-2"><label className="relative min-w-0 flex-1 sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agents" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-indigo-950" /></label><div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900" aria-label="Directory view"><button onClick={() => selectView('tiles')} className={`grid h-9 w-9 place-items-center rounded-lg ${view === 'tiles' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-400'}`} aria-label="Tile view" aria-pressed={view === 'tiles'}><Grid2X2 className="h-4 w-4" /></button><button onClick={() => selectView('list')} className={`grid h-9 w-9 place-items-center rounded-lg ${view === 'list' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-400'}`} aria-label="List view" aria-pressed={view === 'list'}><List className="h-4 w-4" /></button></div></div>
    </div>
    {error ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">The agent directory could not be loaded. Please try again shortly.</div> : loading ? <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800" />)}</div> : visibleAgents.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700"><UserRound className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 font-bold">No agents found</h3><p className="mt-1 text-sm text-slate-500">{query ? 'Try a different name, role, or location.' : 'Agent profiles added in Atlas Administration will appear here.'}</p></div> : view === 'tiles' ? <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visibleAgents.map((agent) => <article key={agent.userid} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="h-16 bg-gradient-to-r from-indigo-600 to-cyan-500" style={agent.company_banner ? { backgroundImage: `url(${agent.company_banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} /><div className="px-5 pb-5"><AgentAvatar agent={agent} initials={initials(agent.full_name)} className="-mt-8" /><div className="mt-3 flex items-start justify-between gap-3"><div><h3 className="font-extrabold">{agent.full_name}</h3><p className="text-xs text-slate-500">{role(agent)}</p></div><StatusPill status={agent.status} /></div><div className="mt-5 space-y-2 text-xs text-slate-500"><a href={`mailto:${agent.email}`} className="flex items-center gap-2 truncate hover:text-indigo-600"><Mail className="h-3.5 w-3.5" />{agent.email}</a>{agent.phone_number && <a href={`tel:${agent.phone_number}`} className="flex items-center gap-2 hover:text-indigo-600"><Phone className="h-3.5 w-3.5" />{agent.phone_number}</a>}{agent.location && <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{agent.location}</p>}</div></div></article>)}</div> : <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950"><tr><th className="px-5 py-3">Agent</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{visibleAgents.map((agent) => <tr key={agent.userid} className="hover:bg-slate-50 dark:hover:bg-slate-800/50"><td className="px-5 py-4"><div className="flex items-center gap-3"><AgentAvatar agent={agent} initials={initials(agent.full_name)} className="h-10 w-10" /><div><b className="block text-sm">{agent.full_name}</b><span className="text-xs text-slate-500">{agent.company}</span></div></div></td><td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{role(agent)}</td><td className="px-5 py-4 text-sm text-slate-500">{agent.location || '—'}</td><td className="px-5 py-4"><a href={`mailto:${agent.email}`} className="block text-sm text-indigo-600 hover:underline dark:text-indigo-400">{agent.email}</a><span className="text-xs text-slate-500">{agent.phone_number}</span></td><td className="px-5 py-4"><StatusPill status={agent.status} /></td></tr>)}</tbody></table></div>}
  </section>;
}

function AgentAvatar({ agent, initials, className = '' }: { agent: Agent; initials: string; className?: string }) {
  return agent.profile_photo ? <img src={agent.profile_photo} alt="" className={`h-16 w-16 rounded-2xl border-4 border-white object-cover shadow-sm dark:border-slate-900 ${className}`} /> : <span className={`grid h-16 w-16 place-items-center rounded-2xl border-4 border-white bg-slate-950 text-sm font-extrabold text-white shadow-sm dark:border-slate-900 dark:bg-white dark:text-slate-950 ${className}`}>{initials}</span>;
}

function StatusPill({ status }: { status: string }) {
  const active = status.toLowerCase() === 'active';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{status}</span>;
}

function PageWorkspace({ category, link }: { category: Category; link: Link }) {
  if (link.name === 'Calendar') return <section><div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600">Coming up</p><h2 className="mt-1 text-2xl font-extrabold">Company calendar</h2></div><button className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white dark:bg-white dark:text-slate-950">Full calendar</button></div><div className="grid gap-4 md:grid-cols-3">{[['SEP', '04', 'Market update briefing'], ['SEP', '12', 'New agent workshop'], ['SEP', '18', 'Compliance clinic']].map(([month, day, title]) => <article key={title} className="group rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/90"><div className="mb-8 flex items-start justify-between"><div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"><span className="text-[9px] font-black tracking-wider">{month}</span><b className="text-xl leading-5">{day}</b></div><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" /></div><h3 className="font-bold">{title}</h3><p className="mt-2 text-xs text-slate-500">10:00 AM · Atlas Training Room</p></article>)}</div></section>;

  const content: Record<string, { label: string; cards: [string, string][] }> = {
    'The Numbers': { label: `${link.name} performance snapshot`, cards: [['Current reporting', link.name === 'Market' ? 'Monthly market data' : 'Updated this week'], ['Primary view', link.name === 'Agent' ? 'Personal production' : link.name === 'Firm' ? 'Company performance' : 'Regional trends'], ['Export format', 'PDF and spreadsheet']] },
    Training: { label: `${link.name} learning path`, cards: [['Learning format', link.name === 'On-Going' ? 'Live and on-demand' : 'Guided program'], ['Recommended pace', link.name === 'New Agent' ? 'First 90 days' : 'Self-paced'], ['Completion', 'Certificate available']] },
    Resources: { label: `${link.name} toolkit`, cards: [['Curated for', 'Active real estate agents'], ['Content', link.name === 'Trade Partners' ? 'Verified partner directory' : link.name === 'News & Events' ? 'Company updates' : 'Forms and quick guides'], ['Maintained by', 'Atlas office team']] },
    Marketing: { label: `${link.name} asset library`, cards: [['Brand status', 'Approved for agent use'], ['Best for', link.name === 'Logos' ? 'Print and digital' : link.name === 'Templates' ? 'Listings and social' : 'Brand consistency'], ['Available files', link.name === 'Canva Link' ? 'Editable online' : 'Print and web formats']] },
    Neighbourhoods: { label: `${link.name} local intelligence`, cards: [['Coverage', 'Local service areas'], ['Client ready', 'Shareable reports'], ['Information', link.name === 'HoodQ' ? 'Automated insights' : 'Amenities and services']] },
    Compliance: { label: `${link.name} compliance centre`, cards: [['Review status', 'Current and approved'], ['Required action', link.name === 'FINTRAC' ? 'Follow identification rules' : 'Review before submitting'], ['Questions', 'Contact the broker team']] },
  };
  const workspace = content[category.name];
  return <section><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">At a glance</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight">{workspace.label}</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{workspace.cards.map(([title, value], index) => <div key={title} className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90"><span className="absolute right-5 top-4 text-4xl font-extrabold text-slate-100 dark:text-slate-800">0{index + 1}</span><p className="relative text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">{title}</p><p className="relative mt-5 font-bold">{value}</p></div>)}</div></section>;
}

export default App;
