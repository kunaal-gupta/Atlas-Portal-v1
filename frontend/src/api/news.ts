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

type EdmontonFeed = { results: EdmontonHeadline[]; stale: boolean };
let pendingEdmontonFeed: Promise<EdmontonFeed> | undefined;

export function getEdmontonNews() {
  pendingEdmontonFeed ??= getJson<EdmontonFeed>('/api/market-news/edmonton/')
    .finally(() => { pendingEdmontonFeed = undefined; });
  return pendingEdmontonFeed;
}
