import type { NewsItem } from '../types';
import { getJson, resultsFrom } from './http';

export async function getNews(limit = 8): Promise<NewsItem[]> {
  return resultsFrom(await getJson<NewsItem[] | { results: NewsItem[] }>(`/api/news/?limit=${limit}`));
}

export type EdmontonHeadline = {
  title: string;
  url: string;
  publisher: string;
  published_at: string | null;
};

export async function getEdmontonNews() {
  return getJson<{ results: EdmontonHeadline[]; stale: boolean }>('/api/market-news/edmonton/');
}
