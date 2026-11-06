import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMortgage, calculateCommission, type MortgageInput, type CommissionInput } from './calculators.ts';
const mortgage: MortgageInput = { price: 500000, downPayment: 100000, rate: 5, amortizationYears: 25, termYears: 5, frequency: 'monthly', compounding: 'semiannual', insurancePremium: 0, extraMonthly: 0, propertyTaxAnnual: 3600, homeInsuranceAnnual: 1200, condoMonthly: 100, utilitiesMonthly: 200 };
const commission: CommissionInput = { salePrice: 500000, mode: 'tiered', flatRate: 5, threshold: 100000, firstRate: 7, remainingRate: 3, taxRate: 5, listingShare: 50, agentSide: 'listing', agentShare: 80, referralRate: 0, brokerageFee: 100, agentExpenses: 200, mortgagePayoff: 300000, closingCosts: 2000 };
test('Canadian mortgage reference payment and principal conservation', () => {
  const result = calculateMortgage(mortgage);
  assert.ok(Math.abs(result.basePayment - 2326.42) < 0.01);
  assert.equal(result.paymentCount, 300);
  assert.ok(Math.abs(result.years.reduce((sum, row) => sum + row.principal, 0) - 400000) < 0.01);
  assert.ok(Math.abs(result.totalPayments - result.totalInterest - 400000) < 0.01);
  assert.equal(result.monthlyCosts, 700);
  assert.ok(result.termBalance > 350000 && result.termBalance < 360000);
});
test('zero interest, extra payments, and fully paid purchase', () => {
  const zero = calculateMortgage({ ...mortgage, rate: 0 });
  assert.equal(zero.totalInterest, 0);
  assert.ok(Math.abs(zero.basePayment - 400000 / 300) < 0.00001);
  const extra = calculateMortgage({ ...mortgage, extraMonthly: 500 });
  assert.ok(extra.paymentCount < 300 && extra.totalInterest < calculateMortgage(mortgage).totalInterest);
  const paid = calculateMortgage({ ...mortgage, downPayment: 500000 });
  assert.equal(paid.scheduledPayment, 0); assert.equal(paid.termBalance, 0); assert.equal(paid.monthlyTotal, 700);
});
test('accelerated frequency reduces payoff period; premium is financed', () => {
  const accelerated = calculateMortgage({ ...mortgage, frequency: 'accelerated-biweekly' });
  assert.ok(Math.abs(accelerated.basePayment - calculateMortgage(mortgage).basePayment / 2) < 0.001);
  assert.ok(accelerated.payoffYears < 25);
  assert.equal(calculateMortgage({ ...mortgage, insurancePremium: 10000 }).principal, 410000);
});
test('mortgage rejects invalid financial inputs', () => {
  for (const input of [{ ...mortgage, downPayment: 600000 }, { ...mortgage, rate: NaN }, { ...mortgage, amortizationYears: 0 }, { ...mortgage, termYears: 30 }, { ...mortgage, extraMonthly: -1 }]) assert.throws(() => calculateMortgage(input));
});
test('tiered commission, sales tax, agent and seller breakdown', () => {
  const result = calculateCommission(commission);
  assert.equal(result.commission, 19000); assert.equal(result.tax, 950);
  assert.equal(result.listingGross, 9500); assert.equal(result.buyerGross, 9500);
  assert.equal(result.agentNet, 7300); assert.equal(result.sellerNet, 178050);
});
test('tier threshold, flat rate, referral before brokerage split, and negative proceeds', () => {
  assert.equal(calculateCommission({ ...commission, salePrice: 80000 }).commission, 5600);
  assert.equal(calculateCommission({ ...commission, salePrice: 100000 }).remainingTier, 0);
  assert.equal(calculateCommission({ ...commission, mode: 'flat' }).commission, 25000);
  const referral = calculateCommission({ ...commission, referralRate: 20 });
  assert.equal(referral.referral, 1900); assert.equal(referral.agentGross, 6080);
  assert.ok(calculateCommission({ ...commission, mortgagePayoff: 600000 }).sellerNet < 0);
  assert.throws(() => calculateCommission({ ...commission, taxRate: -1 }));
});

// Reporting and deadline labels must not imply freshness or overdue status without metadata.
import { parseNumbersPayload, reportingLabel, reportingDescription } from './reporting.ts';
import { announcementStatus } from '../data/announcements.ts';
test('reporting rejects invalid data and does not infer live status', () => {
  const payload = parseNumbersPayload({ activeListings: 10, pendingTransactions: 2, closedThisMonth: 5, salesVolume: 1000000, updatedAt: 'bad-date' });
  assert.equal(payload.updatedAt, undefined); assert.equal(payload.dataMode, undefined);
  assert.match(reportingLabel({ mode: 'snapshot' }), /unknown/);
  assert.match(reportingDescription({ mode: 'demo' }), /must not be used for brokerage reporting/);
  assert.throws(() => parseNumbersPayload({ ...payload, activeListings: -1 }));
  assert.throws(() => parseNumbersPayload({ ...payload, pendingTransactions: 1.5 }));
});
test('only confirmed dates become overdue, at the brokerage date boundary', () => {
  const item = { id: 'test', label: 'Action required', title: 'Review', detail: '', time: '', urgent: true, dueDate: '2026-09-30', deadlineVerified: false };
  assert.equal(announcementStatus(item, new Date('2026-11-06T12:00:00Z')).overdue, false);
  assert.equal(announcementStatus({ ...item, deadlineVerified: true }, new Date('2026-10-01T05:59:00Z')).overdue, false);
  assert.equal(announcementStatus({ ...item, deadlineVerified: true }, new Date('2026-10-01T06:00:00Z')).overdue, true);
  assert.equal(announcementStatus({ ...item, deadlineVerified: true, dueDate: '2026-02-31' }).overdue, false);
});
