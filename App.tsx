import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpen, CalendarDays, CheckCircle2,
  ChevronDown, Download, ExternalLink, FileText, GraduationCap, MapPinned,
  Megaphone, Menu, Moon, Search, ShieldCheck, Sparkles, Sun, X,
} from 'lucide-react';

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
  const current = allLinks.find((item) => item.path === window.location.pathname);
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? allLinks.filter(({ category, link }) => `${category.name} ${link.name} ${link.summary}`.toLowerCase().includes(value)).slice(0, 7) : [];
  }, [query]);

  return <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
    <header className="relative z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex h-20 max-w-[1500px] items-center gap-4 px-5 lg:px-10">
        <a href="/" className="flex shrink-0 items-center gap-3" aria-label="Atlas home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"><Sparkles className="h-5 w-5" /></span>
          <span className="hidden sm:block"><strong className="block text-xl font-extrabold leading-5">Atlas</strong><small className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Agent portal</small></span>
        </a>

        <div className="relative mx-auto w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents, training, resources..." aria-label="Search Atlas" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-indigo-950" />
          {query && <div className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            {results.length ? results.map(({ category, link, path }) => <a key={path} href={path} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700"><span><b className="block text-sm">{link.name}</b><small className="text-slate-500 dark:text-slate-400">{category.name}</small></span><ArrowRight className="h-4 w-4 text-slate-400" /></a>) : <p className="px-4 py-5 text-center text-sm text-slate-500">No resources found.</p>}
          </div>}
        </div>

        <button onClick={() => setDark(!dark)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" aria-label={`Use ${dark ? 'light' : 'dark'} mode`}>{dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 lg:hidden dark:border-slate-700" aria-label="Toggle categories">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
    </header>

    <nav className={`${mobileOpen ? 'block' : 'hidden'} relative z-30 border-b border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900`} aria-label="Resource categories">
      <div className="mx-auto max-w-[1500px] px-5 lg:flex lg:h-14 lg:items-stretch lg:justify-center lg:px-10">
        {categories.map((category) => <div key={category.name} className="group relative border-b border-slate-100 last:border-0 lg:border-0">
          <button className="flex w-full items-center justify-between gap-2 px-3 py-4 text-sm font-bold text-slate-700 group-hover:text-indigo-600 lg:h-full lg:w-auto dark:text-slate-200"><span>{category.name}</span><ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" /></button>
          <div className="hidden pb-3 group-hover:block group-focus-within:block lg:absolute lg:left-0 lg:top-full lg:w-80 lg:rounded-b-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-3 lg:shadow-2xl dark:lg:border-slate-700 dark:lg:bg-slate-800">
            <p className="px-3 pb-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{category.description}</p>
            {category.links.map((link) => <a key={link.name} href={pathFor(category, link)} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-slate-700 dark:hover:text-indigo-300"><span>{link.name}</span>{link.name === 'Calendar' ? <CalendarDays className="h-4 w-4" /> : <ArrowRight className="h-4 w-4 text-slate-300" />}</a>)}
          </div>
        </div>)}
      </div>
    </nav>

    <main>{current ? <ResourcePage {...current} /> : <HomePage />}</main>
    <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-5 text-xs text-slate-500 sm:flex-row sm:justify-between lg:px-10"><span>© {new Date().getFullYear()} Atlas · Internal agent resources</span><a href="/admin/" className="font-bold hover:text-indigo-600">Content administration →</a></div></footer>
  </div>;
};

function HomePage() {
  return <div className="relative mx-auto max-w-[1500px] px-5 py-12 lg:px-10 lg:py-16">
    <div className="pointer-events-none absolute left-0 top-0 -z-0 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-900/20" />
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-7 py-14 text-white shadow-2xl shadow-indigo-200/40 sm:px-12 lg:py-20 dark:shadow-none"><div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" /><div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" /><div className="relative max-w-3xl"><span className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-200 backdrop-blur"><Sparkles className="h-3.5 w-3.5" /> Your company knowledge base</span><h1 className="text-4xl font-black tracking-tight sm:text-6xl">Resources that move your <span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">business forward.</span></h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">One trusted place for company knowledge, agent training, approved marketing, local insights, and the documents you use every day.</p></div></section>
    <div className="mb-6 mt-12 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Explore Atlas</p><h2 className="mt-1 text-2xl font-extrabold">Resource categories</h2></div><span className="text-sm text-slate-500">23 agent resources</span></div>
    <div className="relative grid gap-5 md:grid-cols-2 xl:grid-cols-3">{categories.map((category) => { const Icon = category.icon; const theme = categoryTheme[category.name]; return <section key={category.name} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"><div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl ${theme.glow}`} /><div className={`relative mb-5 grid h-11 w-11 place-items-center rounded-xl ${theme.icon}`}><Icon className="h-5 w-5" /></div><h3 className="relative text-lg font-bold">{category.name}</h3><p className="relative mt-2 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">{category.description}</p><a href={pathFor(category, category.links[0])} className="relative mt-5 flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">Explore resources <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></a></section>; })}</div>
  </div>;
}

function ResourcePage({ category, link }: { category: Category; link: Link }) {
  const Icon = category.icon;
  const related = category.links.filter((item) => item.name !== link.name).slice(0, 3);
  const theme = categoryTheme[category.name];
  return <div className="relative mx-auto max-w-[1200px] px-5 py-10 lg:px-10 lg:py-14">
    <div className={`pointer-events-none absolute right-0 top-0 -z-0 h-80 w-80 rounded-full blur-3xl ${theme.glow}`} />
    <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"><ArrowLeft className="h-4 w-4" /> Back to all resources</a>
    <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-r ${theme.gradient} p-7 text-white shadow-xl sm:p-10`}><div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-white/15 blur-2xl" /><div className="relative flex flex-col gap-6 sm:flex-row sm:items-start"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur"><Icon className="h-7 w-7" /></div><div><p className="text-xs font-bold uppercase tracking-[.18em] text-white/70">{category.name}</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{link.name}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/80">{link.summary} Access company-approved knowledge and materials maintained for Atlas agents.</p></div></div></div>
    <PageWorkspace category={category} link={link} />
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]"><section><h2 className="mb-4 text-xl font-extrabold">{category.name === 'Marketing' ? 'Approved assets' : category.name === 'Training' ? 'Course materials' : category.name === 'The Numbers' ? 'Reports & exports' : 'Featured documents'}</h2><div className="space-y-3">{[`${link.name} — agent guide`, `${link.name} checklist & workflow`, `${link.name} reference library`].map((name, index) => <a key={name} href={`/media/resources/${slugify(link.name)}-${index + 1}.pdf`} className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"><span className={`grid h-11 w-11 place-items-center rounded-xl ${theme.icon}`}><FileText className="h-5 w-5" /></span><span className="min-w-0 flex-1"><b className="block truncate text-sm">{name}</b><small className="text-slate-500">PDF · Company approved · Updated recently</small></span><Download className="h-4 w-4 text-slate-400 transition group-hover:text-indigo-600" /></a>)}</div></section>
      <aside className="space-y-5"><div className="rounded-2xl bg-indigo-600 p-6 text-white"><CheckCircle2 className="h-6 w-6" /><h2 className="mt-4 text-lg font-bold">Need expert help?</h2><p className="mt-2 text-sm leading-6 text-indigo-100">Contact the office team for guidance or to request another resource.</p><a href="mailto:support@atlas.company" className="mt-5 inline-flex items-center gap-2 text-sm font-bold">Contact support <ExternalLink className="h-4 w-4" /></a></div><div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="font-bold">More in {category.name}</h3>{related.map((item) => <a key={item.name} href={pathFor(category, item)} className="mt-3 flex items-center justify-between text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-300"><span>{item.name}</span><ArrowRight className="h-4 w-4" /></a>)}</div></aside>
    </div>
  </div>;
}

function PageWorkspace({ category, link }: { category: Category; link: Link }) {
  if (link.name === 'Calendar') return <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Upcoming</p><h2 className="text-xl font-extrabold">Company calendar</h2></div><button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">View full calendar</button></div><div className="grid gap-4 md:grid-cols-3">{[['SEP', '04', 'Market update briefing'], ['SEP', '12', 'New agent workshop'], ['SEP', '18', 'Compliance clinic']].map(([month, day, title]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-5 flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"><span className="text-[10px] font-black">{month}</span><b className="text-xl leading-5">{day}</b></div><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm text-slate-500">10:00 AM · Atlas Training Room</p></article>)}</div></section>;

  const content: Record<string, { label: string; cards: [string, string][] }> = {
    'The Numbers': { label: `${link.name} performance snapshot`, cards: [['Current reporting', link.name === 'Market' ? 'Monthly market data' : 'Updated this week'], ['Primary view', link.name === 'Agent' ? 'Personal production' : link.name === 'Firm' ? 'Company performance' : 'Regional trends'], ['Export format', 'PDF and spreadsheet']] },
    Training: { label: `${link.name} learning path`, cards: [['Learning format', link.name === 'On-Going' ? 'Live and on-demand' : 'Guided program'], ['Recommended pace', link.name === 'New Agent' ? 'First 90 days' : 'Self-paced'], ['Completion', 'Certificate available']] },
    Resources: { label: `${link.name} toolkit`, cards: [['Curated for', 'Active real estate agents'], ['Content', link.name === 'Trade Partners' ? 'Verified partner directory' : link.name === 'News & Events' ? 'Company updates' : 'Forms and quick guides'], ['Maintained by', 'Atlas office team']] },
    Marketing: { label: `${link.name} asset library`, cards: [['Brand status', 'Approved for agent use'], ['Best for', link.name === 'Logos' ? 'Print and digital' : link.name === 'Templates' ? 'Listings and social' : 'Brand consistency'], ['Available files', link.name === 'Canva Link' ? 'Editable online' : 'Print and web formats']] },
    Neighbourhoods: { label: `${link.name} local intelligence`, cards: [['Coverage', 'Local service areas'], ['Client ready', 'Shareable reports'], ['Information', link.name === 'HoodQ' ? 'Automated insights' : 'Amenities and services']] },
    Compliance: { label: `${link.name} compliance centre`, cards: [['Review status', 'Current and approved'], ['Required action', link.name === 'FINTRAC' ? 'Follow identification rules' : 'Review before submitting'], ['Questions', 'Contact the broker team']] },
  };
  const workspace = content[category.name];
  return <section className="mt-8"><p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">At a glance</p><h2 className="mt-1 text-xl font-extrabold">{workspace.label}</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{workspace.cards.map(([title, value]) => <div key={title} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p><p className="mt-3 font-bold">{value}</p></div>)}</div></section>;
}

export default App;
