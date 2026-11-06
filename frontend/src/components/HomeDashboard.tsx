import React, { useEffect, useState } from 'react';
import {
  ArrowRight, BellRing, Building2, ChevronLeft, ChevronRight,
  CircleDollarSign, Home, Info, TrendingUp,
} from 'lucide-react';
import { getNews } from '../api/news';
import AnnouncementStatus from './shared/AnnouncementStatus';
import { parseNumbersPayload, reportingLabel, reportingDescription, formatReportingTime, type NumbersStatus } from '../lib/reporting';
import { announcements } from '../data/announcements';
import AgentWorkspace from './AgentWorkspace';
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



const formatCurrency = (value: number) => `$${new Intl.NumberFormat('en-CA', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`;

export default function HomeDashboard() {
  const [news, setNews] = useState(fallbackNews);
  const [slide, setSlide] = useState(0);
  const [numbers, setNumbers] = useState(fallbackNumbers);
  const [numbersStatus, setNumbersStatus] = useState<NumbersStatus>({ mode: 'loading' });
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

    let cancelled = false;
    fetch('/api/skyslope/numbers/')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(raw => {
        const payload = parseNumbersPayload(raw);
        if (!cancelled) {
          setNumbers(payload);
          setNumbersStatus({ mode: payload.dataMode || 'snapshot', updatedAt: payload.updatedAt, fetchedAt: new Date().toISOString() });
        }
      })
      .catch(() => { if (!cancelled) setNumbersStatus({ mode: 'demo' }); });
    return () => { cancelled = true; };
  }, []);

  const visibleNews = [0, 1, 2].map((offset) => news[(slide + offset) % news.length]);
  const priorityAnnouncement = announcements.find(item => item.urgent) ?? announcements[0];
  const metrics = [
    { label: 'Active listings', value: numbers.activeListings.toLocaleString(), icon: Home, note: 'Listed properties', description: 'Properties currently listed for sale across the company.' },
    { label: 'Pending', value: numbers.pendingTransactions.toLocaleString(), icon: TrendingUp, note: 'Transactions', description: 'Transactions with an accepted offer that have not yet closed.' },
    { label: 'Closed this month', value: numbers.closedThisMonth.toLocaleString(), icon: Building2, note: 'Company wide', description: 'Transactions completed across the company this month.' },
    { label: 'Sales volume', value: formatCurrency(numbers.salesVolume), icon: CircleDollarSign, note: 'Month to date', description: 'Total closed sales volume for the current month.' },
  ];

  return <div className="mt-2 grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
    <div className="min-w-0 space-y-3">

    <section aria-labelledby="numbers-heading" className="flex min-w-0 flex-col rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-2xl border-b border-indigo-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-indigo-950/40">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-indigo-600 dark:bg-indigo-950"><TrendingUp className="h-4 w-4" /></span><div><h2 id="numbers-heading" className="text-xl font-bold">The numbers</h2><p className="text-xs text-slate-500">Company performance at a glance</p></div></div>
        <div className="min-w-0 text-xs"><details><summary className="flex cursor-pointer list-none items-center gap-1.5 font-semibold text-indigo-700 dark:text-indigo-300"><Info className="h-3.5 w-3.5" />{reportingLabel(numbersStatus)}</summary><p className="mt-2 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">{reportingDescription(numbersStatus)}{numbersStatus.fetchedAt && <span className="mt-1 block">Retrieved: {formatReportingTime(numbersStatus.fetchedAt)} (browser time zone).</span>}</p></details><p className="mt-1 text-slate-500 dark:text-slate-400">Last updated: {numbersStatus.mode === 'demo' || numbersStatus.mode === 'loading' ? 'Not applicable — illustrative figures' : formatReportingTime(numbersStatus.updatedAt)}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-2 px-2 py-3 lg:grid-cols-4">
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
              {description}<span className="mt-1 block text-slate-300">{reportingLabel(numbersStatus)}</span>
            </div>}
          </div>;
        })}
      </div>
    </section>

    </div>

    <section id="announcements" aria-labelledby="announcements-heading" className="min-w-0 self-stretch rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><BellRing className="h-5 w-5 text-indigo-600 dark:text-indigo-300" /><h2 id="announcements-heading" className="text-xl font-bold">Announcements</h2></div><a href="/resources/news-and-events/#announcements-list" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300">View all ({announcements.length})<ArrowRight className="h-3.5 w-3.5" /></a></div>
      {priorityAnnouncement && <article aria-label="Priority announcement"><AnnouncementStatus item={priorityAnnouncement} /><h3 className="mt-1 text-sm font-semibold leading-6 text-slate-800 dark:text-slate-100">{priorityAnnouncement.title}</h3><a href={priorityAnnouncement.actionHref || '/resources/news-and-events/#announcements-list'} className="mt-2 inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300">Review now<ArrowRight className="h-3.5 w-3.5" /></a></article>}
    </section>

    <section aria-labelledby="news-heading" className="min-w-0 lg:col-span-2">
      <div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">Latest updates</p><h2 id="news-heading" className="mt-1 text-xl font-bold tracking-tight">News for your business</h2></div><div className="flex gap-2"><button onClick={() => setSlide((slide - 1 + news.length) % news.length)} aria-label="Previous news" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900"><ChevronLeft className="h-4 w-4" /></button><button onClick={() => setSlide((slide + 1) % news.length)} aria-label="Next news" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900"><ChevronRight className="h-4 w-4" /></button></div></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visibleNews.map((item, index) => <NewsCard compact item={item} key={`${item.id}-${index}`} />)}</div>
      <div className="mt-2 flex justify-center gap-1.5" aria-label="News pages">{news.map((_, index) => <button key={index} onClick={() => setSlide(index)} aria-label={`Show news item ${index + 1}`} aria-current={slide === index ? 'true' : undefined} className="group grid h-5 w-6 place-items-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"><span className={`h-1 rounded-full transition-all ${slide === index ? 'w-5 bg-indigo-600' : 'w-1.5 bg-slate-300 group-hover:bg-indigo-400 dark:bg-slate-700'}`} /></button>)}</div>
    </section>

    <AgentWorkspace />


  </div>;
}
