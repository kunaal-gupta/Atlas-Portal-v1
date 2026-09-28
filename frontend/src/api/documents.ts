import type { DocumentItem } from '../types';
import { getJson, resultsFrom } from './http';

export async function getDocuments(category: string): Promise<DocumentItem[]> {
  const payload = await getJson<DocumentItem[] | { results: DocumentItem[] }>(
    `/api/documents/?category=${encodeURIComponent(category)}`,
  );
  return resultsFrom(payload);
}
