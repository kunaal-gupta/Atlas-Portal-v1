export type PaymentFrequency = 'monthly' | 'biweekly' | 'weekly' | 'accelerated-biweekly' | 'accelerated-weekly';
export type MortgageInput = {
  price: number; downPayment: number; rate: number; amortizationYears: number; termYears: number;
  frequency: PaymentFrequency; compounding: 'semiannual' | 'monthly'; insurancePremium: number;
  extraMonthly: number; propertyTaxAnnual: number; homeInsuranceAnnual: number; condoMonthly: number; utilitiesMonthly: number;
};
export type MortgageYear = { year: number; opening: number; principal: number; interest: number; payments: number; closing: number };
function range(value: number, min: number, max: number, label: string) {
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${label} must be between ${min.toLocaleString()} and ${max.toLocaleString()}.`);
}
function periodicRate(rate: number, periods: number, compounding: MortgageInput['compounding']) {
  const compounds = compounding === 'semiannual' ? 2 : 12;
  return Math.expm1(compounds / periods * Math.log1p(rate / 100 / compounds));
}
function payment(principal: number, rate: number, periods: number) {
  return rate === 0 ? principal / periods : principal * rate / -Math.expm1(-periods * Math.log1p(rate));
}
export function calculateMortgage(input: MortgageInput) {
  range(input.price, 1, 1e10, 'Purchase price'); range(input.downPayment, 0, input.price, 'Down payment');
  range(input.rate, 0, 100, 'Interest rate'); range(input.amortizationYears, 1, 50, 'Amortization');
  range(input.termYears, 1 / 12, input.amortizationYears, 'Mortgage term');
  for (const key of ['insurancePremium', 'extraMonthly', 'propertyTaxAnnual', 'homeInsuranceAnnual', 'condoMonthly', 'utilitiesMonthly'] as const) range(input[key], 0, 1e9, key.replace(/[A-Z]/g, value => ` ${value.toLowerCase()}`));
  const frequency = input.frequency;
  if (!['monthly', 'biweekly', 'weekly', 'accelerated-biweekly', 'accelerated-weekly'].includes(frequency)) throw new Error('Choose a supported payment frequency.');
  if (!['semiannual', 'monthly'].includes(input.compounding)) throw new Error('Choose a supported compounding method.');
  const periods = frequency === 'monthly' ? 12 : frequency.includes('biweekly') ? 26 : 52;
  const principal = input.price - input.downPayment + input.insurancePremium;
  if (input.price === input.downPayment && input.insurancePremium > 0) throw new Error('A fully paid purchase does not need a financed insurance premium.');
  const rate = periodicRate(input.rate, periods, input.compounding);
  const monthlyBase = payment(principal, periodicRate(input.rate, 12, input.compounding), input.amortizationYears * 12);
  const basePayment = frequency.startsWith('accelerated') ? monthlyBase / (periods === 26 ? 2 : 4) : payment(principal, rate, input.amortizationYears * periods);
  const extraPayment = input.extraMonthly * 12 / periods;
  const scheduledPayment = principal > 0 ? basePayment + extraPayment : 0;
  const years: MortgageYear[] = [];
  let balance = principal, totalInterest = 0, totalPayments = 0, paymentCount = 0, termInterest = 0, termPrincipal = 0;
  let termBalance = principal;
  const termPeriods = Math.round(input.termYears * periods);
  for (let n = 1; balance > 0.000001 && n <= Math.ceil(input.amortizationYears * periods) + 1; n++) {
    const yearIndex = Math.floor((n - 1) / periods);
    if (!years[yearIndex]) years[yearIndex] = { year: yearIndex + 1, opening: balance, principal: 0, interest: 0, payments: 0, closing: balance };
    const interest = balance * rate;
    const amount = Math.min(scheduledPayment, balance + interest);
    const paidPrincipal = amount - interest;
    if (paidPrincipal <= 0) throw new Error('Payments do not cover interest. Review the loan assumptions.');
    balance = Math.max(0, balance - paidPrincipal);
    const year = years[yearIndex]; year.principal += paidPrincipal; year.interest += interest; year.payments += amount; year.closing = balance;
    totalInterest += interest; totalPayments += amount; paymentCount = n;
    if (n <= termPeriods) { termInterest += interest; termPrincipal += paidPrincipal; termBalance = balance; }
  }
  const monthlyMortgage = scheduledPayment * periods / 12;
  const monthlyCosts = input.propertyTaxAnnual / 12 + input.homeInsuranceAnnual / 12 + input.condoMonthly + input.utilitiesMonthly;
  return { principal, basePayment, extraPayment, scheduledPayment, periods, monthlyMortgage, monthlyCosts, monthlyTotal: monthlyMortgage + monthlyCosts, termBalance, termInterest, termPrincipal, totalInterest, totalPayments, payoffYears: paymentCount / periods, paymentCount, years };
}
export type CommissionInput = {
  salePrice: number; mode: 'tiered' | 'flat'; flatRate: number; threshold: number; firstRate: number; remainingRate: number;
  taxRate: number; listingShare: number; agentSide: 'listing' | 'buyer'; agentShare: number; referralRate: number;
  brokerageFee: number; agentExpenses: number; mortgagePayoff: number; closingCosts: number;
};
export function calculateCommission(input: CommissionInput) {
  range(input.salePrice, 1, 1e10, 'Sale price');
  for (const key of ['flatRate', 'firstRate', 'remainingRate', 'taxRate', 'listingShare', 'agentShare', 'referralRate'] as const) range(input[key], 0, 100, key.replace(/[A-Z]/g, value => ` ${value.toLowerCase()}`));
  for (const key of ['threshold', 'brokerageFee', 'agentExpenses', 'mortgagePayoff', 'closingCosts'] as const) range(input[key], 0, 1e10, key.replace(/[A-Z]/g, value => ` ${value.toLowerCase()}`));
  if (!['tiered', 'flat'].includes(input.mode) || !['listing', 'buyer'].includes(input.agentSide)) throw new Error('Choose a valid commission structure and agent side.');
  const firstTier = input.mode === 'tiered' ? Math.min(input.salePrice, input.threshold) * input.firstRate / 100 : 0;
  const remainingTier = input.mode === 'tiered' ? Math.max(0, input.salePrice - input.threshold) * input.remainingRate / 100 : 0;
  const commission = input.mode === 'flat' ? input.salePrice * input.flatRate / 100 : firstTier + remainingTier;
  const tax = commission * input.taxRate / 100;
  const listingGross = commission * input.listingShare / 100, buyerGross = commission - listingGross;
  const sideGross = input.agentSide === 'listing' ? listingGross : buyerGross;
  const referral = sideGross * input.referralRate / 100;
  const afterReferral = sideGross - referral;
  const agentGross = afterReferral * input.agentShare / 100;
  const brokerageShare = afterReferral - agentGross;
  const agentNet = agentGross - input.brokerageFee - input.agentExpenses;
  const sellerNet = input.salePrice - commission - tax - input.mortgagePayoff - input.closingCosts;
  return { commission, tax, sellerCommissionCost: commission + tax, effectiveRate: commission / input.salePrice * 100, firstTier, remainingTier, listingGross, buyerGross, sideGross, referral, brokerageShare, agentGross, agentNet, sellerNet };
}
