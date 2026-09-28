import React, { useEffect, useState } from 'react';
import {
  ArrowRight, BellRing, Building2, ChevronDown, ChevronLeft, ChevronRight,
  CircleDollarSign, Home, RefreshCw, TrendingUp,
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

type ApiNewsItem = {
  id: string | number;
  title: string;
  excerpt?: string;
  department?: string;
  published_at: string;
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
        const internal = (rows as ApiNewsItem[]).slice(0, 2).map((item, index): NewsItem => ({
          id: `api-${item.id}`, title: item.title, excerpt: item.excerpt || 'Open this update for the complete story and important details.', source: item.department || 'Atlas team',
          date: new Date(item.published_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }), type: 'Internal',
          href: '/resources/news-and-events/', accent: index ? 'from-rose-600 via-pink-700 to-violet-800' : 'from-indigo-700 via-violet-700 to-fuchsia-600',
        }));
        setNews([internal[0], fallbackNews[1], ...(internal[1] ? [internal[1]] : []), fallbackNews[3]]);
      }).catch(() => undefined);

    fetch('/api/skyslope/numbers/')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload: SkySlopeNumbers) => {
        if ([payload.activeListings, payload.pendingTransactions, payload.closedThisMonth, payload.salesVolume].every(Number.isFinite)) {
          setNumbers(payload);
          setNumbersLive(true);
        }
      })
      .catch(() => undefined);
  }, []);

  const visibleNews = [0, 1, 2].map((offset) => news[(slide + offset) % news.length]);
  const metrics = [
    { label: 'Active listings', value: numbers.activeListings.toLocaleString(), icon: Home, note: 'Live inventory' },
    { label: 'Pending', value: numbers.pendingTransactions.toLocaleString(), icon: TrendingUp, note: 'Transactions' },
    { label: 'Closed this month', value: numbers.closedThisMonth.toLocaleString(), icon: Building2, note: 'Company wide' },
    { label: 'Sales volume', value: formatCurrency(numbers.salesVolume), icon: CircleDollarSign, note: 'Month to date' },
  ];

  return <div className="mt-7 space-y-7">
    <section aria-labelledby="news-heading">
      <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">Latest updates</p><h2 id="news-heading" className="mt-1 text-xl font-extrabold">News for your business</h2></div><div className="flex gap-2"><button onClick={() => setSlide((slide - 1 + news.length) % news.length)} aria-label="Previous news" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900"><ChevronLeft className="h-4 w-4" /></button><button onClick={() => setSlide((slide + 1) % news.length)} aria-label="Next news" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900"><ChevronRight className="h-4 w-4" /></button></div></div>
      <div className="grid gap-4 md:grid-cols-3">{visibleNews.map((item, index) => <a href={item.href} key={`${item.id}-${index}`} className="group flex min-h-52 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider"><span className="text-indigo-600 dark:text-indigo-400">{item.type} news</span><span className="text-slate-400">{item.date}</span></div><div><p className="mb-2 text-xs font-semibold text-slate-400">{item.source}</p><h3 className="text-lg font-extrabold leading-snug tracking-tight">{item.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">{item.excerpt}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">Read update <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></div></a>)}</div>
      <div className="mt-3 flex justify-center gap-1.5" aria-label="News pages">{news.map((_, index) => <button key={index} onClick={() => setSlide(index)} aria-label={`Show news item ${index + 1}`} className={`h-1.5 rounded-full transition-all ${slide === index ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-300 dark:bg-slate-700'}`} />)}</div>
    </section>

    <section aria-labelledby="numbers-heading" className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950"><TrendingUp className="h-4 w-4" /></span><div><h2 id="numbers-heading" className="font-extrabold">The numbers</h2><p className="text-xs text-slate-500">Company performance at a glance</p></div></div>
        <span className="flex items-center gap-2 text-xs font-semibold text-slate-400"><span className={`h-2 w-2 rounded-full ${numbersLive ? 'bg-emerald-500' : 'bg-amber-400'}`} />{numbersLive ? 'Live from SkySlope' : 'SkySlope preview data'} <RefreshCw className="h-3.5 w-3.5" /></span>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon, note }, index) => <div key={label} className={`p-5 ${index ? 'border-t sm:border-l sm:border-t-0' : ''} ${index === 2 ? 'sm:border-l-0 sm:border-t xl:border-l xl:border-t-0' : ''} border-slate-100 dark:border-slate-800`}><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-2xl font-black tracking-tight">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div><Icon className="h-4 w-4 text-slate-400" /></div></div>)}</div>
    </section>

    <div className="grid gap-7 xl:grid-cols-[minmax(0,1.7fr)_360px]">
      <section aria-labelledby="performance-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">12 month trend</p><h2 id="performance-heading" className="mt-1 text-xl font-extrabold">Sales performance</h2><p className="mt-1 text-xs text-slate-500">Closed volume across the company</p></div><select aria-label="Performance period" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"><option>Last 12 months</option><option>Year to date</option></select></div>
        <div className="mt-8 flex h-64 gap-3"><div className="flex flex-col justify-between pb-7 text-[10px] text-slate-400"><span>$30M</span><span>$20M</span><span>$10M</span><span>$0</span></div><div className="relative flex-1 border-b border-l border-slate-200 dark:border-slate-700"><div className="absolute inset-0 flex flex-col justify-between"><span className="border-t border-dashed border-slate-200 dark:border-slate-800" /><span className="border-t border-dashed border-slate-200 dark:border-slate-800" /><span className="border-t border-dashed border-slate-200 dark:border-slate-800" /><span /></div><svg viewBox="0 0 900 240" preserveAspectRatio="none" className="absolute inset-x-0 top-2 h-[calc(100%-2rem)] w-full" role="img" aria-label="Sales performance rises from 12 million to 28.4 million dollars"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity=".22"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0"/></linearGradient></defs><path d="M0 190 L80 176 L165 182 L245 145 L330 154 L410 115 L490 124 L575 86 L655 101 L735 58 L815 70 L900 28 L900 240 L0 240 Z" fill="url(#chartFill)"/><polyline points="0,190 80,176 165,182 245,145 330,154 410,115 490,124 575,86 655,101 735,58 815,70 900,28" fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/></svg><div className="absolute inset-x-0 bottom-1 flex justify-between text-[9px] font-semibold uppercase text-slate-400"><span>Oct</span><span>Jan</span><span>Apr</span><span>Jul</span><span>Sep</span></div></div></div>
      </section>

      <section aria-labelledby="announcements-heading" className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><span className="relative grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950"><BellRing className="h-5 w-5" /><span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500 dark:border-slate-900" /></span><div><h2 id="announcements-heading" className="font-extrabold">Announcements</h2><p className="text-xs text-slate-500">{announcements.length} updates for you</p></div></div></div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">{announcements.map((item, index) => <details key={item.id} open={index === 0} className="group py-4"><summary className="flex cursor-pointer list-none items-start gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.urgent ? 'bg-rose-500' : 'bg-indigo-400'}`} /><span className="min-w-0 flex-1"><span className={`text-[10px] font-black uppercase tracking-wider ${item.urgent ? 'text-rose-600' : 'text-indigo-600 dark:text-indigo-400'}`}>{item.label}</span><span className="mt-1 block text-sm font-bold leading-5">{item.title}</span><span className="mt-1 block text-[11px] text-slate-400">{item.time}</span></span><ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" /></summary><p className="ml-5 mt-3 border-l-2 border-slate-100 pl-4 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">{item.detail}</p></details>)}</div>
        <a href="/resources/news-and-events/" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300">View all announcements <ArrowRight className="h-3.5 w-3.5" /></a>
      </section>
    </div>
  </div>;
}
