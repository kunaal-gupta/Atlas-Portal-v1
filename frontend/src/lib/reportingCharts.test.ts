import assert from 'node:assert/strict';
import test from 'node:test';
import { parseNumbersPayload } from './reporting.ts';
const totals = { activeListings: 10, pendingTransactions: 2, closedThisMonth: 4, salesVolume: 2000000 };

test('current totals do not invent history or listing categories', () => {
  const value = parseNumbersPayload(totals);
  assert.equal(value.history, undefined);
  assert.equal(value.listingMix, undefined);
});
test('monthly source records are sorted and absent months remain absent', () => {
  const value = parseNumbersPayload({ ...totals, history: [{ month: '2026-10', closedDeals: 4, salesVolume: 2000000 }, { month: '2026-08', closedDeals: 2, salesVolume: 900000 }] });
  assert.deepEqual(value.history?.map(row => row.month), ['2026-08', '2026-10']);
});
test('invalid or duplicate monthly records cannot become a misleading trend', () => {
  const row = { month: '2026-10', closedDeals: 4, salesVolume: 2000000 };
  for (const history of [[row, row], [{ ...row, month: '2026-13' }], [{ ...row, closedDeals: -1 }], [{ ...row, closedDeals: 1.5 }], [{ ...row, salesVolume: Infinity }], [null]]) {
    const value = parseNumbersPayload({ ...totals, history });
    assert.equal(value.history, undefined);
    assert.equal(value.activeListings, 10);
  }
});
test('listing categories must partition the active inventory including unspecified values', () => {
  const propertyTypes = [{ label: 'Detached', count: 6 }, { label: 'Condo', count: 3 }, { label: 'Unspecified', count: 1 }];
  const value = parseNumbersPayload({ ...totals, listingMix: { propertyTypes } });
  assert.deepEqual(value.listingMix?.propertyTypes, propertyTypes);
  assert.equal(value.listingMix?.bedrooms, undefined);
  assert.equal(parseNumbersPayload({ ...totals, listingMix: { propertyTypes: propertyTypes.slice(0, 2) } }).listingMix?.propertyTypes, undefined);
});
test('ambiguous, negative and fractional listing categories are rejected independently', () => {
  for (const propertyTypes of [[{ label: 'Detached', count: 5 }, { label: ' detached ', count: 5 }], [{ label: '', count: 10 }], [{ label: 'A', count: -1 }, { label: 'B', count: 11 }], [{ label: 'A', count: 1.5 }, { label: 'B', count: 8.5 }]]) {
    const value = parseNumbersPayload({ ...totals, listingMix: { propertyTypes, bedrooms: [{ label: '3 bedrooms', count: 10 }] } });
    assert.equal(value.listingMix?.propertyTypes, undefined);
    assert.equal(value.listingMix?.bedrooms?.[0].count, 10);
  }
});
test('valid zero-valued source records and empty history are preserved', () => {
  const value = parseNumbersPayload({ ...totals, activeListings: 0, history: [], listingMix: { bedrooms: [{ label: 'Unspecified', count: 0 }] } });
  assert.deepEqual(value.history, []);
  assert.equal(value.listingMix?.bedrooms?.[0].count, 0);
});
