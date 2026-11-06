export type MonthlyReport = { month: string; closedDeals: number; salesVolume: number };
export type ListingBucket = { label: string; count: number };
export type ListingMix = { propertyTypes?: ListingBucket[]; bedrooms?: ListingBucket[] };
export type NumbersPayload = { history?: MonthlyReport[]; listingMix?: ListingMix; activeListings: number; pendingTransactions: number; closedThisMonth: number; salesVolume: number; updatedAt?: string; dataMode?: 'live' | 'cached' };
export type NumbersStatus = { mode: 'loading' | 'demo' | 'live' | 'cached' | 'snapshot'; updatedAt?: string; fetchedAt?: string };
function parseHistory(value: unknown): MonthlyReport[] | undefined {
  if (!Array.isArray(value) || value.length > 60) return undefined;
  const seen = new Set<string>();
  for (const row of value) {
    if (!row || typeof row.month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(row.month) || seen.has(row.month) || !Number.isSafeInteger(row.closedDeals) || row.closedDeals < 0 || !Number.isFinite(row.salesVolume) || row.salesVolume < 0) return undefined;
    seen.add(row.month);
  }
  return value.map(row => ({ month: row.month, closedDeals: row.closedDeals, salesVolume: row.salesVolume })).sort((a, b) => a.month.localeCompare(b.month));
}
function parseBuckets(value: unknown, total: number): ListingBucket[] | undefined {
  if (!Array.isArray(value) || !value.length || value.length > 12) return undefined;
  const labels = new Set<string>();
  for (const row of value) {
    if (!row || typeof row.label !== 'string' || !row.label.trim() || row.label.length > 60 || labels.has(row.label.trim().toLowerCase()) || !Number.isSafeInteger(row.count) || row.count < 0) return undefined;
    labels.add(row.label.trim().toLowerCase());
  }
  // Categories must partition the active inventory; include an Unspecified bucket when needed.
  if (value.reduce((sum, row) => sum + row.count, 0) !== total) return undefined;
  return value.map(row => ({ label: row.label.trim(), count: row.count }));
}
export function parseNumbersPayload(value: unknown): NumbersPayload {
  if (!value || typeof value !== 'object') throw new Error('No reporting data.');
  const item = value as NumbersPayload;
  if (![item.activeListings, item.pendingTransactions, item.closedThisMonth].every(number => Number.isSafeInteger(number) && number >= 0) || !Number.isFinite(item.salesVolume) || item.salesVolume < 0) throw new Error('Invalid reporting figures.');
  return { history: parseHistory(item.history), listingMix: item.listingMix && { propertyTypes: parseBuckets(item.listingMix.propertyTypes, item.activeListings), bedrooms: parseBuckets(item.listingMix.bedrooms, item.activeListings) }, activeListings: item.activeListings, pendingTransactions: item.pendingTransactions, closedThisMonth: item.closedThisMonth, salesVolume: item.salesVolume, updatedAt: typeof item.updatedAt === 'string' && /(Z|[+-]\d{2}:\d{2})$/i.test(item.updatedAt) && Number.isFinite(Date.parse(item.updatedAt)) ? item.updatedAt : undefined, dataMode: item.dataMode === 'live' || item.dataMode === 'cached' ? item.dataMode : undefined };
}
export function reportingLabel(status: NumbersStatus) {
  return { loading: 'Checking data source', demo: 'Demonstration data', live: 'Live-source snapshot', cached: 'Cached snapshot', snapshot: 'API snapshot · freshness unknown' }[status.mode];
}
export function reportingDescription(status: NumbersStatus) {
  if (status.mode === 'loading') return 'Checking the reporting connection. The displayed figures are illustrative until a valid response is received.';
  if (status.mode === 'demo') return 'Illustrative figures only. No connected SkySlope reporting data was received. These values are not live or cached brokerage records and must not be used for brokerage reporting.';
  if (status.mode === 'cached') return 'The API identifies these figures as cached. Last updated is the source timestamp, not the time this page was opened. This page does not refresh automatically.';
  if (status.mode === 'live') return 'The API identifies this as a live-source response. It is a point-in-time snapshot, not a continuously updating feed. This page does not refresh automatically.';
  return 'The reporting API returned these figures without identifying whether they are live or cached. Freshness is unknown unless a source timestamp is supplied; do not assume real-time reporting.';
}
export function formatReportingTime(value?: string) {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not provided';
}
