import type { Agent } from '../types';
import { getJson, resultsFrom } from './http';

export async function getAgents(search = ''): Promise<Agent[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return resultsFrom(await getJson<Agent[] | { results: Agent[] }>(`/api/agents/${query}`));
}
