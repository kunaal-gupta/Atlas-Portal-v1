import type { ListingMix, MonthlyReport } from '../lib/reporting';
// Examples for chart previews only. Never substitute these for missing fields in a valid API response.
export const demoHistory: MonthlyReport[] = [
  { month: '2026-05', closedDeals: 34, salesVolume: 19500000 },
  { month: '2026-06', closedDeals: 41, salesVolume: 24800000 },
  { month: '2026-07', closedDeals: 38, salesVolume: 22100000 },
  { month: '2026-08', closedDeals: 45, salesVolume: 26300000 },
  { month: '2026-09', closedDeals: 39, salesVolume: 23700000 },
  { month: '2026-10', closedDeals: 43, salesVolume: 25900000 },
];
export const demoListingMix: ListingMix = {
  propertyTypes: [{ label: 'Detached', count: 42 }, { label: 'Duplex', count: 24 }, { label: 'Townhouse', count: 14 }, { label: 'Condo', count: 6 }],
  bedrooms: [{ label: '2 bedrooms', count: 12 }, { label: '3 bedrooms', count: 48 }, { label: '4 bedrooms', count: 22 }, { label: '5+ bedrooms', count: 4 }],
};
