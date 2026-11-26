import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { getNews } from '../api/news';
import AgentWorkspace from './AgentWorkspace';
import NewsCard, { type NewsCardItem } from './news/NewsCard';

const fallbackNews: NewsCardItem[] = [
  { id: 'internal-1', title: 'Atlas fall learning calendar is now live', excerpt: 'Reserve your seat for this month’s workshops, market briefings, and compliance clinics.', source: 'Atlas learning team', date: 'Sep 22', type: 'Training', href: '/resources/news-and-events/' },
  { id: 'outside-1', title: 'What shifting inventory means for buyers this fall', excerpt: 'A quick field guide to turning current market movement into confident client conversations.', source: 'Market intelligence', date: 'Sep 20', type: 'Outside', href: '/the-numbers/market/' },
  { id: 'internal-2', title: 'New listing presentation templates available', excerpt: 'The refreshed presentation kit includes editable slides, social assets, and follow-up materials.', source: 'Atlas marketing', date: 'Sep 18', type: 'Internal', href: '/marketing/templates/' },
  { id: 'outside-2', title: 'Five neighbourhood trends clients are asking about', excerpt: 'Stay ahead with a concise overview of the local signals shaping this season’s decisions.', source: 'Local market desk', date: 'Sep 16', type: 'Outside', href: '/neighbourhoods/hoodq/' },
];

export default function HomeDashboard() {
  const [news, setNews] = useState(fallbackNews);
  useEffect(() => {
    getNews().then((rows) => {
      if (!rows.length) return;
      const internal = rows.slice(0, 2).map((item): NewsCardItem => ({
        id: `api-${item.id}`, title: item.title, excerpt: item.summary || 'Open this update for the complete story and important details.', source: 'Atlas team',
        date: new Date(item.published_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }), type: /training|workshop|learning|clinic/i.test(`${item.title} ${item.keywords || ''}`) ? 'Training' : 'Internal',
        href: item.url || '/resources/news-and-events/',
      }));
      setNews([internal[0], fallbackNews[1], ...(internal[1] ? [internal[1]] : []), fallbackNews[3]]);
    }).catch(() => undefined);

  }, []);

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <section id="news" aria-labelledby="news-heading" className="home-panel min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="news-heading" className="home-section-title">News &amp; updates</h2>
          <a href="/resources/news-and-events/" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300">
            View all news<ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
        <div className="grid gap-3">
          {news.map(item => <NewsCard compact item={item} key={item.id} />)}
        </div>
      </section>
      <AgentWorkspace />
    </div>
  );
}
