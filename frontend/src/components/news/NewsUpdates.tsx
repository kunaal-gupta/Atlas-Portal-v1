import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getEdmontonNews, getNews, type EdmontonHeadline } from '../../api/news';
import DevelopmentWatch from '../DevelopmentWatch';
import type { NewsItem } from '../../types';

const tabs = ['Real Estate', 'Brokerage', 'Training', 'Development Watch'] as const;
const trainingPattern = /\b(training|workshops?|learning|clinics?|webinars?)\b/i;
const edmontonSearch = 'https://news.google.com/search?q=Edmonton+real+estate&hl=en-CA&gl=CA&ceid=CA:en';
const dateFormat = new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric', timeZone: 'America/Edmonton' });

type Feed<T> = { items: T[]; status: 'loading' | 'ready' | 'error' };

export default function NewsUpdates({ expanded = false }: { expanded?: boolean }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Real Estate');
  const [market, setMarket] = useState<Feed<EdmontonHeadline> & { stale?: boolean }>({ items: [], status: 'loading' });
  const [internal, setInternal] = useState<Feed<NewsItem>>({ items: [], status: 'loading' });

  useEffect(() => {
    let active = true;
    getEdmontonNews().then(({ results, stale }) => {
      if (active) setMarket({ items: results, stale, status: 'ready' });
    }).catch(() => { if (active) setMarket({ items: [], status: 'error' }); });
    getNews().then(items => {
      if (active) setInternal({ items, status: 'ready' });
    }).catch(() => { if (active) setInternal({ items: [], status: 'error' }); });
    return () => { active = false; };
  }, []);

  const external = tab === 'Real Estate';
  const status = external ? market.status : internal.status;
  const items = external ? market.items.map(article => ({
    title: article.title, url: article.url, publisher: article.publisher, publishedAt: article.published_at,
  })) : internal.items
    .filter(item => trainingPattern.test(`${item.title} ${item.keywords || ''}`) === (tab === 'Training'))
    .map(item => ({ title: item.title, url: item.url || '/resources/news-and-events/', publisher: 'Atlas', publishedAt: item.published_at }));

  return (
    <section id="news" aria-labelledby="news-heading" className={`home-panel min-w-0 ${expanded ? 'mt-5' : 'md:col-span-2 lg:col-span-1'}`}>
      <h2 id="news-heading" className="home-section-title">News &amp; updates</h2>
      <div role="group" aria-label="News category" className="my-2 flex flex-wrap gap-1">
        {tabs.map(name => (
          <button key={name} type="button" aria-pressed={tab === name} onClick={() => setTab(name)}
            className={`min-h-8 rounded-md px-2 text-xs font-semibold ${tab === name ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
            {name}
          </button>
        ))}
      </div>
      {tab === 'Development Watch' ? <DevelopmentWatch /> : <>
        {status === 'loading' && <p role="status" className="py-2 text-sm text-slate-500">Loading news…</p>}
        {status === 'error' && <p role="status" className="py-2 text-sm text-slate-500">{external ? 'Edmonton headlines are unavailable.' : 'Atlas updates are unavailable.'}</p>}
        {status === 'ready' && !items.length && <p className="py-2 text-sm text-slate-500">No recent articles in this category.</p>}
        {external && market.stale && <p className="text-xs text-slate-500">Showing previously fetched headlines.</p>}
        {!!items.length && <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {items.slice(0, expanded ? 10 : 3).map(({ title, url, publishedAt, publisher }, index) => {
            const date = publishedAt ? new Date(publishedAt) : null;
            return (
              <li key={`${url}-${index}`}>
                <a href={url} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}
                  className="block rounded-md px-1 py-2 text-sm leading-snug hover:bg-slate-50 dark:hover:bg-slate-800">
                  <span className="flex justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="min-w-0 truncate">{publisher}</span>
                    {date && Number.isFinite(date.getTime()) && <time className="shrink-0" dateTime={date.toISOString()}>{dateFormat.format(date)}</time>}
                  </span>
                  <span className="mt-1 line-clamp-2 font-semibold">{title}</span>
                </a>
              </li>
            );
          })}
        </ul>}
        {(!expanded || external) && (
          <a href={expanded && external ? edmontonSearch : '/resources/news-and-events/#news'}
            target={expanded && external ? '_blank' : undefined} rel={expanded && external ? 'noreferrer' : undefined}
            className="mt-2 inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300">
            {external ? 'View all Edmonton real estate news' : 'View all Atlas updates'}
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
        )}
      </>}
    </section>
  );
}
