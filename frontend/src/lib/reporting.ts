export type NumbersPayload = { activeListings: number; pendingTransactions: number; closedThisMonth: number; salesVolume: number; updatedAt?: string; dataMode?: 'live' | 'cached' };
export type NumbersStatus = { mode: 'loading' | 'demo' | 'live' | 'cached' | 'snapshot'; updatedAt?: string; fetchedAt?: string };
export function parseNumbersPayload(value: unknown): NumbersPayload {
  if (!value || typeof value !== 'object') throw new Error('No reporting data.');
  const item = value as NumbersPayload;
  if (![item.activeListings, item.pendingTransactions, item.closedThisMonth].every(number => Number.isSafeInteger(number) && number >= 0) || !Number.isFinite(item.salesVolume) || item.salesVolume < 0) throw new Error('Invalid reporting figures.');
  return { activeListings: item.activeListings, pendingTransactions: item.pendingTransactions, closedThisMonth: item.closedThisMonth, salesVolume: item.salesVolume, updatedAt: typeof item.updatedAt === 'string' && /(Z|[+-]\d{2}:\d{2})$/i.test(item.updatedAt) && Number.isFinite(Date.parse(item.updatedAt)) ? item.updatedAt : undefined, dataMode: item.dataMode === 'live' || item.dataMode === 'cached' ? item.dataMode : undefined };
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
