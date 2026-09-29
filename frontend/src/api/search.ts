import { getJson } from './http';

export interface SearchRecommendation {
  type: 'Page' | 'Document' | 'Agent' | 'News';
  title: string;
  subtitle: string;
  url: string;
}

export function searchPortal(query: string) {
  return getJson<SearchRecommendation[]>(`/api/search/?q=${encodeURIComponent(query)}`);
}
