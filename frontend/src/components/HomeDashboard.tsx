import React, { useEffect, useState } from 'react';
import {
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { getNews } from '../api/news';
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

  return <div className="mt-4 space-y-4">
    <section id="news" aria-labelledby="news-heading" className="home-panel min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3"><div><h2 id="news-heading" className="home-section-title">News & updates</h2></div><div className="flex gap-2"><button onClick={() => setSlide((slide - 1 + news.length) % news.length)} aria-label="Previous news" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900"><ChevronLeft className="h-4 w-4" /></button><button onClick={() => setSlide((slide + 1) % news.length)} aria-label="Next news" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900"><ChevronRight className="h-4 w-4" /></button></div></div>
      <div className="grid gap-3 sm:grid-cols-3">{visibleNews.map((item, index) => <NewsCard compact item={item} key={`${item.id}-${index}`} />)}</div>
      <div className="mt-1 flex justify-center gap-1.5" aria-label="News pages">{news.map((_, index) => <button key={index} onClick={() => setSlide(index)} aria-label={`Show news item ${index + 1}`} aria-current={slide === index ? 'true' : undefined} className="group grid h-5 w-6 place-items-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"><span className={`h-1 rounded-full transition-all ${slide === index ? 'w-5 bg-indigo-600' : 'w-1.5 bg-slate-300 group-hover:bg-indigo-400 dark:bg-slate-700'}`} /></button>)}</div>
    </section>

    <AgentWorkspace />
    <HomeFaq />

  </div>;
}
