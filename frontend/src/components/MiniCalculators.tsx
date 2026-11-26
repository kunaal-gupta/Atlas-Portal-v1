import { ArrowUpRight, Calculator } from 'lucide-react';
import { useId, useState } from 'react';
import { calculateCommission, calculateMortgage, commissionDefaults, mortgageDefaults } from '../lib/calculators';

const money = (value: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 2 }).format(value);
function Field({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const id = useId();
  return <div className="min-w-0"><label htmlFor={id} className="block text-xs font-medium text-slate-600 dark:text-slate-300">{label}</label><input id={id} type="number" inputMode="decimal" min="0" step="any" value={Number.isFinite(value) ? value : ''} onChange={event => onChange(event.target.valueAsNumber)} className="mt-1 h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-slate-600 dark:bg-slate-800" /></div>;
}
export default function MiniCalculators() {
  const [mode, setMode] = useState<'mortgage' | 'commission'>('mortgage');
  const [price, setPrice] = useState(mortgageDefaults.price);
  const [downPercent, setDownPercent] = useState(20);
  const [rate, setRate] = useState(mortgageDefaults.rate);
  const [years, setYears] = useState(mortgageDefaults.amortizationYears);
  const [commissionRate, setCommissionRate] = useState(commissionDefaults.flatRate);
  const [taxRate, setTaxRate] = useState(commissionDefaults.taxRate);
  let result: { label: string; amount: number; note: string } | null = null;
  let error = '';
  try {
    if (mode === 'mortgage') {
      const estimate = calculateMortgage({ ...mortgageDefaults, price, downPayment: price * downPercent / 100, rate, amortizationYears: years, termYears: Math.min(mortgageDefaults.termYears, years) });
      result = { label: 'Estimated monthly payment', amount: estimate.basePayment, note: `Loan ${money(estimate.principal)} · principal & interest only` };
    } else {
      const estimate = calculateCommission({ ...commissionDefaults, mode: 'flat', salePrice: price, flatRate: commissionRate, taxRate });
      result = { label: 'Total commission before tax', amount: estimate.commission, note: `${money(estimate.sellerCommissionCost)} including GST / HST` };
    }
  } catch (reason) { error = reason instanceof Error ? reason.message : 'Review your inputs.'; }
  return <section aria-labelledby="mini-calculators-heading" className="home-panel min-w-0">
    <div className="mb-3 flex items-start gap-2"><Calculator aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-300" /><h3 id="mini-calculators-heading" className="home-section-title">Mortgage & commission calculators</h3></div>
    <div className="mb-3 flex gap-1" role="group" aria-label="Quick calculator type">{(['mortgage', 'commission'] as const).map(value => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)} className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${mode === value ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{value === 'mortgage' ? 'Mortgage' : 'Commission'}</button>)}</div>
    <div className="grid grid-cols-2 gap-3"><Field label={mode === 'mortgage' ? 'Purchase price ($)' : 'Sale price ($)'} value={price} onChange={setPrice} />{mode === 'mortgage' ? <><Field label="Down payment (%)" value={downPercent} onChange={setDownPercent} /><Field label="Interest rate (%)" value={rate} onChange={setRate} /><Field label="Amortization (years)" value={years} onChange={setYears} /></> : <><Field label="Total commission (%)" value={commissionRate} onChange={setCommissionRate} /><Field label="GST / HST (%)" value={taxRate} onChange={setTaxRate} /></>}</div>
    {error ? <p role="alert" className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm">{error}</p> : result && <div className="mt-3 rounded-xl bg-indigo-50 p-3 dark:bg-indigo-950"><p className="text-xs text-indigo-700 dark:text-indigo-300">{result.label}</p><p data-mini-estimate className="mt-1 break-words text-2xl font-bold tabular-nums">{money(result.amount)}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{result.note}</p></div>}
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-slate-500">CAD estimates · editable example rates</p><a href={`/the-numbers/calculators/?calculator=${mode}`} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300" aria-label={`Open full ${mode} calculator`}>Full calculator<ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></a></div>
    <p className="mt-2 text-xs leading-5 text-slate-500">{mode === 'mortgage' ? 'Canadian semiannual compounding. Taxes, fees, and mortgage insurance are excluded here; add them in the full tool.' : 'Both transaction sides combined. Rates are negotiable; model agent splits and expenses in the full tool.'}</p>
  </section>;
}
