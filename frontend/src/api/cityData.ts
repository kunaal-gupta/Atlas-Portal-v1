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
