import type { MultiPolygon, Polygon } from 'geojson';
import { getJson } from './http';

export type CitySource = 'assessment' | 'property' | 'building' | 'development';
export type CityRow = Record<string, string | number | null>;
export type CityResult = {
  source_url: string;
  year?: string | null;
  totals?: CityRow;
  neighbourhoods?: CityRow[];
  months?: CityRow[];
  records?: CityRow[];
};

export function getCityData(source: CitySource, operation: 'summary' | 'lookup' | 'recent', filters: Record<string, string> = {}) {
  const query = new URLSearchParams(filters);
  return getJson<CityResult>(`/api/city-data/${source}/${operation}/?${query}`);
}

export const citySourceLabels: Record<CitySource, string> = {
  assessment: 'Property assessment',
  property: 'Property information',
  building: 'Building permits',
  development: 'Development permits',
};

export type AssessmentPoint = {
  lat: number;
  lng: number;
  value: number | string | null;
  neighbourhood: string | null;
  address?: string;
  ward?: string | null;
  assessment_class?: string | null;
  garage?: string | null;
  suite?: string | null;
};

export type AssessmentMapResult = {
  points: AssessmentPoint[];
  coverage?: [string, string] | null;
  limited: boolean;
  limit: number;
  year: string | null;
  source_url: string;
};

export function getAssessmentMap(bounds: string, filters: Record<string, string>) {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== ''));
  if (bounds) query.set('bounds', bounds);
  return getJson<AssessmentMapResult>(`/api/city-data/assessment/map/?${query}`);
}

export type CityNeighbourhood = {
  number: string;
  name: string;
  display_name: string;
  description: string;
  start_date: string;
  end_date: string;
  ward: string;
  district: string;
  boundary: Polygon | MultiPolygon | null;
};

type NeighbourhoodResult = { results: CityNeighbourhood[]; source_url: string };
let pendingNeighbourhoods: Promise<NeighbourhoodResult> | undefined;

export function getNeighbourhoods() {
  pendingNeighbourhoods ??= getJson<NeighbourhoodResult>('/api/city-data/neighbourhoods/')
    .finally(() => { pendingNeighbourhoods = undefined; });
  return pendingNeighbourhoods;
}

export function neighbourhoodName(record: CityNeighbourhood) {
  return record.display_name || record.name;
}

export function neighbourhoodKey(record: CityNeighbourhood) {
  return `${record.number}:${record.start_date}:${record.name}`;
}
