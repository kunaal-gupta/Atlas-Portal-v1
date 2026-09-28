import type { NewsItem } from '../types';
import { getJson, resultsFrom } from './http';

export async function getNews(limit = 8): Promise<NewsItem[]> {
  return resultsFrom(await getJson<NewsItem[] | { results: NewsItem[] }>(`/api/news/?limit=${limit}`));
}
