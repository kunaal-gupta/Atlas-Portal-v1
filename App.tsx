import React, { useMemo, useState } from 'react';
import { ArrowUpRight, BarChart3, BookOpen, CheckCircle2, GraduationCap, MapPinned, Megaphone, Menu, Search, ShieldCheck, Sparkles, X } from 'lucide-react';

type Category = { title: string; description: string; icon: React.ElementType; accent: string; links: string[] };

const categories: Category[] = [
  { title: 'The Numbers', description: 'Performance reporting and business insights.', icon: BarChart3, accent: 'bg-blue-50 text-blue-700', links: ['Market', 'Agent', 'Firm'] },
  { title: 'Training', description: 'Learning paths for every stage of your career.', icon: GraduationCap, accent: 'bg-violet-50 text-violet-700', links: ['New Agent', 'New Construction', 'On-Going'] },
  { title: 'Resources', description: 'The everyday tools that keep your work moving.', icon: BookOpen, accent: 'bg-emerald-50 text-emerald-700', links: ['New Agent', 'Trade Partners', 'Condo', 'General', 'Tips', 'News & Events'] },
  { title: 'Marketing', description: 'On-brand assets ready for your next campaign.', icon: Megaphone, accent: 'bg-amber-50 text-amber-700', links: ['Logos', 'Brand book summary', 'Templates', 'Canva link'] },
  { title: 'Neighbourhoods', description: 'Local knowledge for better client conversations.', icon: MapPinned, accent: 'bg-rose-50 text-rose-700', links: ['HoodQ', 'Schools, Shopping, Hospitals'] },
  { title: 'Compliance', description: 'Policies, procedures, and regulatory guidance.', icon: ShieldCheck, accent: 'bg-cyan-50 text-cyan-700', links: ['Brokerage Manual', 'Fintrac', 'Tips', 'Other'] },
];

const slugify = (value: string) => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return categories;
    return categories.map((category) => ({ ...category, links: category.links.filter((link) => `${category.title} ${link}`.toLowerCase().includes(search)) }))
      .filter((category) => category.title.toLowerCase().includes(search) || category.links.length);
  }, [query]);

  const navigation = <>
    <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[.18em] text-slate-400">Categories</p>
    <div className="space-y-1">{categories.map((category) => { const Icon = category.icon; return (
      <a key={category.title} href={`#${slugify(category.title)}`} onClick={() => setMenuOpen(false)} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
        <Icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />{category.title}
      </a>
    ); })}</div>
  </>;

  return <div className="min-h-screen bg-[#f7f8fc] text-slate-950">
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <a href="#top" className="flex items-center gap-3" aria-label="Atlas home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white shadow-lg"><Sparkles className="h-5 w-5" /></span>
          <span><strong className="block text-xl font-extrabold tracking-tight">Atlas</strong><span className="block text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">Agent portal</span></span>
        </a>
        <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex"><CheckCircle2 className="h-4 w-4" /> All systems available</div>
        <button onClick={() => setMenuOpen(true)} className="rounded-xl border border-slate-200 p-2.5 lg:hidden" aria-label="Open categories"><Menu className="h-5 w-5" /></button>
      </div>
    </header>

    {menuOpen && <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)}>
      <aside className="h-full w-72 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-8 flex items-center justify-between"><strong className="text-xl">Atlas</strong><button onClick={() => setMenuOpen(false)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close categories"><X className="h-5 w-5" /></button></div>{navigation}
      </aside>
    </div>}

    <div id="top" className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[220px_1fr]">
      <aside className="hidden border-r border-slate-200/80 px-5 py-12 lg:block"><div className="sticky top-8">{navigation}</div></aside>
      <main className="min-w-0 px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <section className="relative mb-12 overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-2xl shadow-slate-300/50 sm:px-10 sm:py-12">
          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="relative max-w-2xl"><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-indigo-300">Everything in one place</p><h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Welcome to Atlas.</h1><p className="mt-4 text-base leading-7 text-slate-300">Find the reporting, training, resources, and tools you need to do your best work.</p>
            <label className="mt-8 flex max-w-xl items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-slate-950 shadow-xl"><Search className="h-5 w-5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search Atlas resources..." aria-label="Search Atlas resources" /></label>
          </div>
        </section>
        <div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Directory</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight">Browse categories</h2></div><p className="hidden text-sm text-slate-500 sm:block">22 resources</p></div>
        {visible.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visible.map((category) => { const Icon = category.icon; return (
          <section id={slugify(category.title)} key={category.title} className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className={`mb-5 grid h-11 w-11 place-items-center rounded-xl ${category.accent}`}><Icon className="h-5 w-5" /></div><h3 className="text-lg font-bold">{category.title}</h3><p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">{category.description}</p>
            <div className="mt-5 border-t border-slate-100 pt-3">{category.links.map((link) => <a key={link} href={`/${slugify(category.title)}/${slugify(link)}/`} className="group flex items-center justify-between rounded-xl px-2 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-700"><span>{link}</span><ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600" /></a>)}</div>
          </section>
        ); })}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center"><p className="font-semibold">No resources match “{query}”</p><button onClick={() => setQuery('')} className="mt-2 text-sm font-semibold text-indigo-600">Clear search</button></div>}
      </main>
    </div>
    <footer className="border-t border-slate-200 bg-white py-7"><div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 text-xs text-slate-500 sm:flex-row sm:justify-between lg:px-10"><span>© {new Date().getFullYear()} Atlas. Internal agent resources.</span><a href="/admin/" className="font-semibold text-slate-700 hover:text-indigo-600">Content administration →</a></div></footer>
  </div>;
};

export default App;
