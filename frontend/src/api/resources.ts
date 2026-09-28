import type { ResourceCategory } from '../types';
import { getJson, resultsFrom } from './http';

export async function getResourceCategories(): Promise<ResourceCategory[]> {
  return resultsFrom(await getJson<ResourceCategory[] | { results: ResourceCategory[] }>('/api/categories/'));
}
