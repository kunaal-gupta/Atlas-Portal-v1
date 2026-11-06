import { useCompanyReporting } from './CompanyReporting';
import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatReportingTime, reportingDescription, reportingLabel } from '../lib/reporting';

export default function WelcomeMetrics() {
  const { numbers, status } = useCompanyReporting();
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!(event.target instanceof Element) || !event.target.closest('[data-welcome-metric]')) setActive(null); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  const metrics = [
    { id: 'active', label: 'Active listings', value: numbers.activeListings.toLocaleString(), detail: 'Properties currently listed for sale across the company.' },
    { id: 'pending', label: 'Pending', value: numbers.pendingTransactions.toLocaleString(), detail: 'Transactions with an accepted offer that have not yet closed.' },
    { id: 'closed', label: 'Closed this month', value: numbers.closedThisMonth.toLocaleString(), detail: 'Transactions completed across the company this month.' },
    { id: 'volume', label: 'Sales volume', value: new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', notation: 'compact', maximumFractionDigits: 1 }).format(numbers.salesVolume), detail: 'Total closed sales volume for the current month.' },
  ];
  return <section id="numbers" aria-label="Company metrics" className="min-w-0">
    <div className="mb-1 flex flex-wrap items-start justify-between gap-x-2 gap-y-1 px-1"><h2 className="text-xs font-semibold text-slate-600 dark:text-slate-300">Company metrics</h2><details className="text-xs"><summary className="flex cursor-pointer list-none items-center gap-1 text-indigo-700 dark:text-indigo-300"><Info aria-hidden="true" className="h-3 w-3" />{reportingLabel(status)}</summary><div className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400"><p>{reportingDescription(status)}</p><p className="mt-1">Last updated: {status.updatedAt ? formatReportingTime(status.updatedAt) : status.mode === 'demo' || status.mode === 'loading' ? 'Not applicable — illustrative figures' : 'Not provided'}</p>{status.fetchedAt && <p className="mt-1">Retrieved: {formatReportingTime(status.fetchedAt)} (browser time zone).</p>}</div></details></div>
    <div className="grid grid-cols-4 gap-0">{metrics.map((metric, index) => <div key={metric.id} data-welcome-metric className={`relative min-w-0 ${index ? 'border-l border-indigo-100 dark:border-slate-600' : ''} ${active === metric.id ? 'z-20' : ''}`} onPointerEnter={event => { if (event.pointerType === 'mouse') setActive(metric.id); }} onPointerLeave={event => { if (event.pointerType === 'mouse') setActive(null); }}>
      <button type="button" aria-label={`${metric.label}: ${metric.value}`} aria-expanded={active === metric.id} aria-describedby={active === metric.id ? `welcome-metric-${metric.id}` : undefined} onFocus={() => setActive(metric.id)} onBlur={() => setActive(null)} onClick={() => setActive(metric.id)} onKeyDown={event => { if (event.key === 'Escape') setActive(null); }} className="w-full rounded-lg px-1 py-1 text-left hover:bg-indigo-50 focus-visible:bg-indigo-50 dark:hover:bg-indigo-950 dark:focus-visible:bg-indigo-950">
        <span className="block text-xs text-slate-500 dark:text-slate-400">{metric.label}</span><span className="mt-0.5 block break-words text-base font-bold sm:text-lg tabular-nums text-slate-950 dark:text-white">{metric.value}</span>
      </button>
      {active === metric.id && <div role="tooltip" id={`welcome-metric-${metric.id}`} className={`absolute top-full z-50 mt-1 w-52 max-w-[calc(100vw-2.5rem)] rounded-xl bg-slate-950 px-3 py-2 text-xs leading-5 text-white shadow-lg ${index >= 2 ? 'right-0' : 'left-0'}`}>{metric.detail}<span className="mt-1 block text-slate-300">{reportingLabel(status)}</span></div>}
    </div>)}
    </div>

    {status.updatedAt && <p className="mt-1 px-2 text-xs text-slate-500 dark:text-slate-400">Updated <time dateTime={status.updatedAt}>{formatReportingTime(status.updatedAt)}</time></p>}
  </section>;
}
