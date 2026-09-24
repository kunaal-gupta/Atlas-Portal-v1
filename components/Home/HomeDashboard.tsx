import React, { useEffect, useState } from 'react';
import {
  ArrowRight, BellRing, Building2, ChevronDown, ChevronLeft, ChevronRight,
  CircleDollarSign, ExternalLink, Home, Newspaper, RefreshCw, TrendingUp,
} from 'lucide-react';

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  source: string;
  date: string;
  type: 'Internal' | 'Outside';
  href: string;
  accent: string;
};

type SkySlopeNumbers = {
  activeListings: number;
  pendingTransactions: number;
  closedThisMonth: number;
  salesVolume: number;
  updatedAt?: string;
};

const fallbackNews: NewsItem[] = [
  { id: 'internal-1', title: 'Atlas fall learning calendar is now live', excerpt: 'Reserve your seat for this month’s workshops, market briefings, and compliance clinics.', source: 'Atlas learning team', date: 'Sep 22', type: 'Internal', href: '/resources/news-and-events/', accent: 'from-indigo-700 via-violet-700 to-fuchsia-600' },
  { id: 'outside-1', title: 'What shifting inventory means for buyers this fall', excerpt: 'A quick field guide to turning current market movement into confident client conversations.', source: 'Market intelligence', date: 'Sep 20', type: 'Outside', href: '/the-numbers/market/', accent: 'from-cyan-700 via-blue-700 to-indigo-800' },
  { id: 'internal-2', title: 'New listing presentation templates available', excerpt: 'The refreshed presentation kit includes editable slides, social assets, and follow-up materials.', source: 'Atlas marketing', date: 'Sep 18', type: 'Internal', href: '/marketing/templates/', accent: 'from-rose-600 via-pink-700 to-violet-800' },
  { id: 'outside-2', title: 'Five neighbourhood trends clients are asking about', excerpt: 'Stay ahead with a concise overview of the local signals shaping this season’s decisions.', source: 'Local market desk', date: 'Sep 16', type: 'Outside', href: '/neighbourhoods/hoodq/', accent: 'from-emerald-700 via-teal-700 to-cyan-800' },
];

const fallbackNumbers: SkySlopeNumbers = { activeListings: 86, pendingTransactions: 31, closedThisMonth: 47, salesVolume: 28400000 };

const announcements = [
  { id: '1', label: 'Action required', title: 'Complete your annual FINTRAC acknowledgement', detail: 'Please review the updated brokerage guidance and submit your acknowledgement by September 30.', time: 'Due Sep 30', urgent: true },
  { id: '2', label: 'Office update', title: 'Downtown office access this Saturday', detail: 'The east entrance will be closed for scheduled maintenance. Please use the main lobby entrance.', time: '2 days ago', urgent: false },
  { id: '3', label: 'Reminder', title: 'October content requests close Friday', detail: 'Send campaign and design requests to the marketing team before 4:00 PM on Friday.', time: '3 days ago', urgent: false },
];

const formatCurrency = (value: number) => `$${new Intl.NumberFormat('en-CA', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`;

export default function HomeDashboard() {
  const [news, setNews] = useState(fallbackNews);
  const [slide, setSlide] = useState(0);
  const [numbers, setNumbers] = useState(fallbackNumbers);
  const [numbersLive, setNumbersLive] = useState(false);

  useEffect(() => {
    fetch('/api/news/?limit=8')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => {
        const rows = Array.isArray(payload) ? payload : payload.results;
        if (!Array.isArray(rows) || !rows.length) return;
        const internal = rows.slice(0, 2).map((item: any, index: number): NewsItem => ({
          id: `api-${item.id}`, title: item.title, excerpt: item.excerpt, source: item.department || 'Atlas team',
          date: new Date(item.published_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }), type: 'Internal',
          href: '/resources/news-and-events/', accent: index ? 'from-rose-600 via-pink-700 to-violet-800' : 'from-indigo-700 via-violet-700 to-fuchsia-600',
        }));
        setNews([internal[0], fallbackNews[1], ...(internal[1] ? [internal[1]] : []), fallbackNews[3]]);
      }).catch(() => undefined);

    fetch('/api/skyslope/numbers/')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload: SkySlopeNumbers) => { setNumbers(payload); setNumbersLive(true); })
      .catch(() => undefined);
  }, []);

  const visibleNews = [news[slide % news.length], news[(slide + 1) % news.length]];
  const metrics = [
    { label: 'Active listings', value: numbers.activeListings.toLocaleString(), icon: Home, note: 'Live inventory' },
    { label: 'Pending', value: numbers.pendingTransactions.toLocaleString(), icon: TrendingUp, note: 'Transactions' },
    { label: 'Closed this month', value: numbers.closedThisMonth.toLocaleString(), icon: Building2, note: 'Company wide' },
    { label: 'Sales volume', value: formatCurrency(numbers.salesVolume), icon: CircleDollarSign, note: 'Month to date' },
  ];

  return <div className="mt-10 space-y-8">
    <section aria-labelledby="numbers-heading" className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950"><TrendingUp className="h-4 w-4" /></span><div><h2 id="numbers-heading" className="font-extrabold">The numbers</h2><p className="text-xs text-slate-500">Company performance at a glance</p></div></div>
        <span className="flex items-center gap-2 text-xs font-semibold text-slate-400"><span className={`h-2 w-2 rounded-full ${numbersLive ? 'bg-emerald-500' : 'bg-amber-400'}`} />{numbersLive ? 'Live from SkySlope' : 'SkySlope preview data'} <RefreshCw className="h-3.5 w-3.5" /></span>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon, note }, index) => <div key={label} className={`p-6 ${index ? 'border-t sm:border-l sm:border-t-0' : ''} ${index === 2 ? 'sm:border-l-0 sm:border-t xl:border-l xl:border-t-0' : ''} border-slate-100 dark:border-slate-800`}><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-3xl font-black tracking-tight">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div><Icon className="h-5 w-5 text-indigo-500" /></div></div>)}</div>
    </section>

    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,.75fr)]">
      <section aria-labelledby="news-heading">
        <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">Stay informed</p><h2 id="news-heading" className="mt-1 text-2xl font-extrabold">News for your business</h2></div><div className="flex gap-2"><button onClick={() => setSlide((slide - 2 + news.length) % news.length)} aria-label="Previous news" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900"><ChevronLeft className="h-4 w-4" /></button><button onClick={() => setSlide((slide + 2) % news.length)} aria-label="Next news" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900"><ChevronRight className="h-4 w-4" /></button></div></div>
        <div className="grid gap-5 md:grid-cols-2">{visibleNews.map((item) => <a href={item.href} key={item.id} className={`group relative flex min-h-72 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br ${item.accent} p-7 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl`}><div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" /><div className="relative flex items-center justify-between"><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur"><Newspaper className="h-3.5 w-3.5" />{item.type} news</span>{item.type === 'Outside' && <ExternalLink className="h-4 w-4 text-white/70" />}</div><div className="relative"><p className="mb-3 text-xs font-semibold text-white/65">{item.source} · {item.date}</p><h3 className="text-2xl font-black leading-tight tracking-tight">{item.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-white/75">{item.excerpt}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">Read story <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div></a>)}</div>
      </section>

      <section aria-labelledby="announcements-heading" className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><span className="relative grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950"><BellRing className="h-5 w-5" /><span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500 dark:border-slate-900" /></span><div><h2 id="announcements-heading" className="font-extrabold">Announcements</h2><p className="text-xs text-slate-500">{announcements.length} updates for you</p></div></div></div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">{announcements.map((item, index) => <details key={item.id} open={index === 0} className="group py-4"><summary className="flex cursor-pointer list-none items-start gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.urgent ? 'bg-rose-500' : 'bg-indigo-400'}`} /><span className="min-w-0 flex-1"><span className={`text-[10px] font-black uppercase tracking-wider ${item.urgent ? 'text-rose-600' : 'text-indigo-600 dark:text-indigo-400'}`}>{item.label}</span><span className="mt-1 block text-sm font-bold leading-5">{item.title}</span><span className="mt-1 block text-[11px] text-slate-400">{item.time}</span></span><ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" /></summary><p className="ml-5 mt-3 border-l-2 border-slate-100 pl-4 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">{item.detail}</p></details>)}</div>
        <a href="/resources/news-and-events/" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300">View all announcements <ArrowRight className="h-3.5 w-3.5" /></a>
      </section>
    </div>
  </div>;
}
