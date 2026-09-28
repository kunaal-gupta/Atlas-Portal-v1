import type { PortalEvent } from '../types';
import { getJson, resultsFrom } from './http';

export async function getUpcomingEvents(): Promise<PortalEvent[]> {
  return resultsFrom(await getJson<PortalEvent[] | { results: PortalEvent[] }>('/api/events/upcoming/'));
}
