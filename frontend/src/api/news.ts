import type { NewsArticle } from '../types';
import { getJson, resultsFrom } from './http';

export async function getNews(limit = 8): Promise<NewsArticle[]> {
  return resultsFrom(await getJson<NewsArticle[] | { results: NewsArticle[] }>(`/api/news/?limit=${limit}`));
}
