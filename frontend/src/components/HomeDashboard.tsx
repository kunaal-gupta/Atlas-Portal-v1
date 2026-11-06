import React, { useEffect, useState } from 'react';
import {
  ArrowRight, BellRing, Building2, ChevronDown, ChevronLeft, ChevronRight,
  CircleDollarSign, Home, RefreshCw, TrendingUp,
} from 'lucide-react';
import { getNews } from '../api/news';
import NewsCard, { type NewsCardItem } from './news/NewsCard';

type NewsItem = NewsCardItem & { accent: string };

type SkySlopeNumbers = {
  activeListings: number;
  pendingTransactions: number;
  closedThisMonth: number;
  salesVolume: number;
  updatedAt?: string;
};

const fallbackNews: NewsItem[] = [
  { id: 'internal-1', title: 'Atlas fall learning calendar is now live', excerpt: 'Reserve your seat for this month’s workshops, market briefings, and compliance clinics.', source: 'Atlas learning team', date: 'Sep 22', type: 'Internal', href: '/resources/news-and-events/', accent: 'from-indigo-700 via-indigo-700 to-indigo-600' },
  { id: 'outside-1', title: 'What shifting inventory means for buyers this fall', excerpt: 'A quick field guide to turning current market movement into confident client conversations.', source: 'Market intelligence', date: 'Sep 20', type: 'Outside', href: '/the-numbers/market/', accent: 'from-indigo-700 via-indigo-700 to-indigo-800' },
  { id: 'internal-2', title: 'New listing presentation templates available', excerpt: 'The refreshed presentation kit includes editable slides, social assets, and follow-up materials.', source: 'Atlas marketing', date: 'Sep 18', type: 'Internal', href: '/marketing/templates/', accent: 'from-slate-600 via-indigo-700 to-indigo-800' },
  { id: 'outside-2', title: 'Five neighbourhood trends clients are asking about', excerpt: 'Stay ahead with a concise overview of the local signals shaping this season’s decisions.', source: 'Local market desk', date: 'Sep 16', type: 'Outside', href: '/neighbourhoods/hoodq/', accent: 'from-indigo-700 via-indigo-700 to-indigo-800' },
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
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const [tooltipAbove, setTooltipAbove] = useState(false);
  const showMetric = (label: string, element: HTMLElement) => {
    setTooltipAbove(element.getBoundingClientRect().bottom + 120 > window.innerHeight);
    setActiveMetric(label);
  };

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('[data-metric]')) setActiveMetric(null);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);

  useEffect(() => {
    getNews().then((rows) => {
      if (!rows.length) return;
      const internal = rows.slice(0, 2).map((item, index): NewsItem => ({
        id: `api-${item.id}`, title: item.title, excerpt: item.summary || 'Open this update for the complete story and important details.', source: 'Atlas team',
        date: new Date(item.published_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }), type: 'Internal',
        href: item.url || '/resources/news-and-events/', accent: index ? 'from-slate-600 via-indigo-700 to-indigo-800' : 'from-indigo-700 via-indigo-700 to-indigo-600',
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

  const visibleNews = [0, 1, 2, 3].map((offset) => news[(slide + offset) % news.length]);
  const metrics = [
    { label: 'Active listings', value: numbers.activeListings.toLocaleString(), icon: Home, note: 'Live inventory', description: 'Properties currently listed for sale across the company.' },
    { label: 'Pending', value: numbers.pendingTransactions.toLocaleString(), icon: TrendingUp, note: 'Transactions', description: 'Transactions with an accepted offer that have not yet closed.' },
    { label: 'Closed this month', value: numbers.closedThisMonth.toLocaleString(), icon: Building2, note: 'Company wide', description: 'Transactions completed across the company this month.' },
    { label: 'Sales volume', value: formatCurrency(numbers.salesVolume), icon: CircleDollarSign, note: 'Month to date', description: 'Total closed sales volume for the current month.' },
  ];

  return <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,4fr)_minmax(0,1fr)]">
    <div className="min-w-0 space-y-3">
    <section aria-labelledby="news-heading" className="min-w-0">
      <div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">Latest updates</p><h2 id="news-heading" className="mt-1 text-lg font-bold tracking-tight">News for your business</h2></div><div className="flex gap-2"><button onClick={() => setSlide((slide - 1 + news.length) % news.length)} aria-label="Previous news" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900"><ChevronLeft className="h-4 w-4" /></button><button onClick={() => setSlide((slide + 1) % news.length)} aria-label="Next news" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900"><ChevronRight className="h-4 w-4" /></button></div></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{visibleNews.map((item, index) => <NewsCard compact item={item} key={`${item.id}-${index}`} />)}</div>
      <div className="mt-2 flex justify-center gap-1.5" aria-label="News pages">{news.map((_, index) => <button key={index} onClick={() => setSlide(index)} aria-label={`Show news item ${index + 1}`} aria-current={slide === index ? 'true' : undefined} className="group grid h-5 w-6 place-items-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"><span className={`h-1 rounded-full transition-all ${slide === index ? 'w-5 bg-indigo-600' : 'w-1.5 bg-slate-300 group-hover:bg-indigo-400 dark:bg-slate-700'}`} /></button>)}</div>
    </section>

    <section aria-labelledby="numbers-heading" className="min-w-0 rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-2xl border-b border-indigo-100 bg-white px-4 py-2 dark:border-slate-800 dark:bg-indigo-950/40">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-indigo-600 dark:bg-indigo-950"><TrendingUp className="h-4 w-4" /></span><div><h2 id="numbers-heading" className="text-sm font-bold">The numbers</h2><p className="text-xs text-slate-500">Company performance at a glance</p></div></div>
        <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500 dark:bg-slate-800"><span className={`h-2 w-2 rounded-full ${numbersLive ? 'bg-indigo-500' : 'bg-slate-400'}`} />{numbersLive ? 'Live from SkySlope' : 'SkySlope preview data'} <RefreshCw className="h-3.5 w-3.5" /></span>
      </div>
      <div className="grid grid-cols-2 gap-2 p-2 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, note, description }, index) => {
          const expanded = activeMetric === label;
          return <div key={label} data-metric onPointerEnter={event => { if (event.pointerType === 'mouse') showMetric(label, event.currentTarget); }} onPointerLeave={event => { if (event.pointerType === 'mouse') setActiveMetric(null); }} className={`relative min-w-0 ${expanded ? 'z-20' : ''}`}>
            <button
              type="button"
              aria-label={`${label}: ${value}`}
              aria-expanded={expanded}
              aria-describedby={expanded ? `metric-detail-${index}` : undefined}
              onFocus={event => showMetric(label, event.currentTarget)}
              onBlur={() => setActiveMetric(null)}
              onClick={event => showMetric(label, event.currentTarget)}
              onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); setActiveMetric(null); } }}
              className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 motion-safe:transition-[background-color,box-shadow,transform] motion-safe:duration-200 motion-safe:active:scale-[0.98] ${expanded ? 'bg-indigo-50 shadow-md motion-safe:scale-[1.02] dark:bg-indigo-950' : 'bg-white dark:bg-slate-900'}`}
            >
              <Icon className="mt-1 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-300" />
              <span className="min-w-0"><span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">{label}</span><span className="mt-1 block break-words text-xl font-bold tabular-nums tracking-tight">{value}</span><span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-400">{note}</span></span>
            </button>
            {expanded && <div id={`metric-detail-${index}`} role="tooltip" className={`absolute ${tooltipAbove ? 'bottom-full' : 'top-full'} z-50 w-56 max-w-[calc(100vw-3rem)] rounded-2xl bg-slate-950 px-4 py-3 text-xs leading-5 text-white shadow-lg ${index % 2 ? 'right-0 lg:left-0 lg:right-auto' : 'left-0'} ${index === 3 ? 'lg:!left-auto lg:!right-0' : ''}`}>
              {description}{!numbersLive && <span className="mt-1 block text-slate-300">Showing preview data.</span>}
            </div>}
          </div>;
        })}
      </div>
    </section>

    </div>

      <div className="min-w-0 lg:relative lg:self-stretch">
      <section id="announcements" aria-labelledby="announcements-heading" className="flex min-h-0 min-w-0 max-h-96 flex-col overflow-hidden lg:absolute lg:inset-0 lg:max-h-none rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2 flex shrink-0 items-center justify-between"><div className="flex min-w-0 flex-wrap items-center gap-2"><span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950"><BellRing className="h-5 w-5" /><span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-500 dark:border-slate-900" /></span><div><h2 id="announcements-heading" className="text-sm font-extrabold">Announcements</h2><p className="text-xs text-slate-500">{announcements.length} updates for you</p></div></div></div>
        <div role="region" aria-label="Announcement updates" tabIndex={0} className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 divide-y divide-slate-100 dark:divide-slate-800">{announcements.map((item, index) => <details key={item.id} open={index === 0} className="group py-3 first:pt-1"><summary className="flex cursor-pointer list-none items-start gap-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.urgent ? 'bg-slate-500' : 'bg-indigo-400'}`} /><span className="min-w-0 flex-1"><span className={`text-[10px] font-black uppercase tracking-wider ${item.urgent ? 'text-slate-600' : 'text-indigo-600 dark:text-indigo-400'}`}>{item.label}</span><span className="mt-1 block text-xs font-semibold leading-5 text-slate-700 dark:text-slate-200">{item.title}</span><span className="mt-1 block text-[11px] text-slate-400">{item.time}</span></span><ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" /></summary><p className="ml-5 mt-3 border-l-2 border-slate-100 pl-4 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">{item.detail}</p></details>)}</div>
        <a href="/resources/news-and-events/" className="mt-3 flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-white py-3 text-xs font-bold text-indigo-800 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300">View all announcements <ArrowRight className="h-3.5 w-3.5" /></a>
      </section>

      </div>

      <section aria-labelledby="performance-heading" className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">12 month trend</p><h2 id="performance-heading" className="mt-1 text-xl font-extrabold">Sales performance</h2><p className="mt-1 text-xs text-slate-500">Closed volume across the company</p></div><span className="shrink-0 rounded-full bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-700 dark:bg-slate-950 dark:text-slate-300">Preview · Last 12 months</span></div>
        <div className="mt-8 flex h-64 gap-3"><div className="flex flex-col justify-between pb-7 text-[10px] text-slate-400"><span>$30M</span><span>$20M</span><span>$10M</span><span>$0</span></div><div className="relative flex-1 border-b border-l border-slate-200 dark:border-slate-700"><div className="absolute inset-0 flex flex-col justify-between"><span className="border-t border-dashed border-slate-200 dark:border-slate-800" /><span className="border-t border-dashed border-slate-200 dark:border-slate-800" /><span className="border-t border-dashed border-slate-200 dark:border-slate-800" /><span /></div><svg viewBox="0 0 900 240" preserveAspectRatio="none" className="absolute inset-x-0 top-2 h-[calc(100%-2rem)] w-full" role="img" aria-label="Sales performance rises from 12 million to 28.4 million dollars"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#21a4b4" stopOpacity=".22"/><stop offset="100%" stopColor="#21a4b4" stopOpacity="0"/></linearGradient></defs><path d="M0 190 L80 176 L165 182 L245 145 L330 154 L410 115 L490 124 L575 86 L655 101 L735 58 L815 70 L900 28 L900 240 L0 240 Z" fill="url(#chartFill)"/><polyline points="0,190 80,176 165,182 245,145 330,154 410,115 490,124 575,86 655,101 735,58 815,70 900,28" fill="none" stroke="#137f86" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/></svg><div className="absolute inset-x-0 bottom-1 flex justify-between text-[9px] font-semibold uppercase text-slate-400"><span>Oct</span><span>Jan</span><span>Apr</span><span>Jul</span><span>Sep</span></div></div></div>
      </section>
  </div>;
}
