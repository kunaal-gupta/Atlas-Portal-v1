import { ArrowUpRight } from 'lucide-react';
import { useCompanyReporting } from './CompanyReporting';
import MonthlyActivityChart from './charts/MonthlyActivityChart';
import ListingMixChart from './charts/ListingMixChart';
import { demoHistory, demoListingMix } from '../data/demoReporting';
import { formatReportingTime, reportingDescription, reportingLabel } from '../lib/reporting';

export default function BusinessInsights() {
  const { numbers, status } = useCompanyReporting();
  const preview = status.mode === 'demo';
  const loading = status.mode === 'loading';
  const average = numbers.closedThisMonth > 0 ? numbers.salesVolume / numbers.closedThisMonth : null;
  const money = (value: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(value);
  return <section aria-labelledby="business-insights-heading" className="min-w-0">
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 id="business-insights-heading" className="home-section-title">Business insights</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Explore monthly activity and the homes in your active inventory.</p></div><span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{reportingLabel(status)}</span></div>
    <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <MonthlyActivityChart history={preview ? demoHistory : numbers.history} preview={preview} loading={loading} />
      <ListingMixChart mix={preview ? demoListingMix : numbers.listingMix} preview={preview} loading={loading} />
    </div>
    <div className="mt-3 flex flex-wrap items-start justify-between gap-3 px-1 text-xs text-slate-500 dark:text-slate-400"><div><p>Current monthly snapshot average: <strong className="font-semibold text-slate-700 dark:text-slate-200">{average === null ? 'Not available' : money(average)}</strong> per closed deal.</p><p className="mt-1">Monthly volume ÷ closed count; not a median price or property valuation.</p></div><a href="/the-numbers/firm/" className="inline-flex min-h-8 items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-300">Company resources<ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></a></div>
    <details className="mt-3 px-1 text-xs text-slate-500 dark:text-slate-400"><summary className="w-fit cursor-pointer rounded-lg font-medium text-indigo-700 dark:text-indigo-300">Data & interpretation</summary><p className="mt-2 leading-5">{reportingDescription(status)}</p><p className="mt-1">Last updated: {status.updatedAt ? formatReportingTime(status.updatedAt) : preview || loading ? 'Not applicable — illustrative figures' : 'Not provided'}</p><p className="mt-1 leading-5">Monthly charts use dated source records. Listing categories must sum to the active listing total. Missing history and breakdowns in API responses are shown as unavailable, with no estimated replacements. Demonstration charts use separate illustrative history and categories.</p></details>
  </section>;
}
