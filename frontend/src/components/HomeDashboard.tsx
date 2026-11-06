import React, { useEffect, useState } from 'react';
import {
  ArrowRight, BellRing, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { getNews } from '../api/news';
import AnnouncementStatus from './shared/AnnouncementStatus';
import { announcements } from '../data/announcements';
import AgentWorkspace from './AgentWorkspace';
import HomeFaq from './HomeFaq';
import NewsCard, { type NewsCardItem } from './news/NewsCard';

type NewsItem = NewsCardItem & { accent: string };

const fallbackNews: NewsItem[] = [
  { id: 'internal-1', title: 'Atlas fall learning calendar is now live', excerpt: 'Reserve your seat for this month’s workshops, market briefings, and compliance clinics.', source: 'Atlas learning team', date: 'Sep 22', type: 'Training', href: '/resources/news-and-events/', accent: 'from-indigo-700 via-indigo-700 to-indigo-600' },
  { id: 'outside-1', title: 'What shifting inventory means for buyers this fall', excerpt: 'A quick field guide to turning current market movement into confident client conversations.', source: 'Market intelligence', date: 'Sep 20', type: 'Outside', href: '/the-numbers/market/', accent: 'from-indigo-700 via-indigo-700 to-indigo-800' },
  { id: 'internal-2', title: 'New listing presentation templates available', excerpt: 'The refreshed presentation kit includes editable slides, social assets, and follow-up materials.', source: 'Atlas marketing', date: 'Sep 18', type: 'Internal', href: '/marketing/templates/', accent: 'from-slate-600 via-indigo-700 to-indigo-800' },
  { id: 'outside-2', title: 'Five neighbourhood trends clients are asking about', excerpt: 'Stay ahead with a concise overview of the local signals shaping this season’s decisions.', source: 'Local market desk', date: 'Sep 16', type: 'Outside', href: '/neighbourhoods/hoodq/', accent: 'from-indigo-700 via-indigo-700 to-indigo-800' },
];

export default function HomeDashboard() {
  const [news, setNews] = useState(fallbackNews);
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    getNews().then((rows) => {
      if (!rows.length) return;
      const internal = rows.slice(0, 2).map((item, index): NewsItem => ({
        id: `api-${item.id}`, title: item.title, excerpt: item.summary || 'Open this update for the complete story and important details.', source: 'Atlas team',
        date: new Date(item.published_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }), type: /training|workshop|learning|clinic/i.test(`${item.title} ${item.keywords || ''}`) ? 'Training' : 'Internal',
        href: item.url || '/resources/news-and-events/', accent: index ? 'from-slate-600 via-indigo-700 to-indigo-800' : 'from-indigo-700 via-indigo-700 to-indigo-600',
      }));
      setNews([internal[0], fallbackNews[1], ...(internal[1] ? [internal[1]] : []), fallbackNews[3]]);
    }).catch(() => undefined);


  }, []);

  const visibleNews = [0, 1, 2].map((offset) => news[(slide + offset) % news.length]);
  const priorityAnnouncement = announcements.find(item => item.urgent) ?? announcements[0];


  return <div className="mt-2 grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
    <section id="news" aria-labelledby="news-heading" className="min-w-0">
      <div className="mb-2 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">Latest updates</p><h2 id="news-heading" className="mt-1 text-xl font-bold tracking-tight">News for your business</h2></div><div className="flex gap-2"><button onClick={() => setSlide((slide - 1 + news.length) % news.length)} aria-label="Previous news" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900"><ChevronLeft className="h-4 w-4" /></button><button onClick={() => setSlide((slide + 1) % news.length)} aria-label="Next news" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900"><ChevronRight className="h-4 w-4" /></button></div></div>
      <div className="grid gap-2 sm:grid-cols-3">{visibleNews.map((item, index) => <NewsCard compact item={item} key={`${item.id}-${index}`} />)}</div>
      <div className="mt-2 flex justify-center gap-1.5" aria-label="News pages">{news.map((_, index) => <button key={index} onClick={() => setSlide(index)} aria-label={`Show news item ${index + 1}`} aria-current={slide === index ? 'true' : undefined} className="group grid h-5 w-6 place-items-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"><span className={`h-1 rounded-full transition-all ${slide === index ? 'w-5 bg-indigo-600' : 'w-1.5 bg-slate-300 group-hover:bg-indigo-400 dark:bg-slate-700'}`} /></button>)}</div>
    </section>

    <section id="announcements" aria-labelledby="announcements-heading" className={`min-w-0 self-stretch rounded-2xl border p-4 shadow-sm ${priorityAnnouncement?.urgent ? 'border-amber-200 border-l-4 border-l-amber-400 bg-amber-50/70 dark:border-amber-900 dark:border-l-amber-500 dark:bg-amber-950/20' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><BellRing className="h-5 w-5 text-indigo-600 dark:text-indigo-300" /><h2 id="announcements-heading" className="text-xl font-bold">Announcements</h2></div><a href="/resources/news-and-events/#announcements-list" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300">View all ({announcements.length})<ArrowRight className="h-3.5 w-3.5" /></a></div>
      {priorityAnnouncement && <article aria-label="Priority announcement"><AnnouncementStatus item={priorityAnnouncement} /><h3 className="mt-1 text-sm font-semibold leading-6 text-slate-800 dark:text-slate-100">{priorityAnnouncement.title}</h3><a href={priorityAnnouncement.actionHref || '/resources/news-and-events/#announcements-list'} className="mt-2 inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300">Review now<ArrowRight className="h-3.5 w-3.5" /></a></article>}
    </section>


    <AgentWorkspace />
    <HomeFaq />


  </div>;
}
