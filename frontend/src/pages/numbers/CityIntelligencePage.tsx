import { Building2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { citySourceLabels, getCityData, type CityResult, type CityRow, type CitySource } from '../../api/cityData';
import PageHeader from '../../components/shared/PageHeader';

const sources: CitySource[] = ['assessment', 'property', 'building', 'development'];
const snapshotSources = ['assessment', 'building', 'development'] as const;
const currentYear = Number(new Intl.DateTimeFormat('en-CA', { year: 'numeric', timeZone: 'America/Edmonton' }).format());
const years = Array.from({ length: 7 }, (_, index) => currentYear - index);
const currency = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-CA');
const card = 'home-panel min-w-0';
const fields: Record<string, string> = {
  suite: 'Unit', neighbourhood: 'Neighbourhood', value: 'Municipal assessment',
  year: 'Assessment year', assessment_class: 'Assessment class', lot_area: 'Lot area (as reported)',
  building_type: 'Building type', built_year: 'Year built', issued: 'Permit date',
  permit_number: 'Permit number', description: 'Description',
};

function formatted(value: CityRow[string] | undefined, money = false) {
  if (value == null || value === '' || !Number.isFinite(Number(value))) return 'Unavailable';
  return money ? currency.format(Number(value)) : number.format(Number(value));
}

function SourceLink({ result }: { result: CityResult }) {
  return <a className="mt-3 inline-block text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300" href={result.source_url} target="_blank" rel="noreferrer">City of Edmonton dataset</a>;
}

export default function CityIntelligencePage() {
  const [year, setYear] = useState(String(currentYear));
  const [snapshots, setSnapshots] = useState<Partial<Record<CitySource, CityResult | null>>>({});
  const [address, setAddress] = useState('');
  const [lookup, setLookup] = useState<Partial<Record<CitySource, CityResult | null>> | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let active = true;
    setSnapshots({});
    for (const source of snapshotSources) {
      getCityData(source, 'summary', { year })
        .then(result => { if (active) setSnapshots(current => ({ ...current, [source]: result })); })
        .catch(() => { if (active) setSnapshots(current => ({ ...current, [source]: null })); });
    }
    return () => { active = false; };
  }, [year]);

  const assessment = snapshots.assessment;
  return (
    <div className="mx-auto max-w-[1400px] space-y-4 px-5 py-4 lg:px-10">
      <PageHeader category="Market" title="Edmonton City Intelligence" description="Municipal assessments, permits, and address research." icon={Building2} accent="from-indigo-600 to-indigo-500" />
      <section className={card} aria-labelledby="city-address-heading">
        <h2 id="city-address-heading" className="home-section-title">Property and permit lookup</h2>
        <form className="mt-3 flex flex-wrap gap-2" onSubmit={async event => {
          event.preventDefault();
          setSearching(true);
          setLookup(null);
          const results = await Promise.all(sources.map(async source => {
            try { return [source, await getCityData(source, 'lookup', { address: address.trim() })] as const; }
            catch { return [source, null] as const; }
          }));
          setLookup(Object.fromEntries(results));
          setSearching(false);
        }}>
          <input required aria-label="Edmonton address" placeholder="Street number and street name" value={address} onChange={event => setAddress(event.target.value)}
            maxLength={90} className="min-h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
          <button disabled={searching} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-indigo-700 px-3 text-sm font-semibold text-white"><Search className="h-4 w-4" />{searching ? 'Searching…' : 'Search'}</button>
        </form>
        {lookup && <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {sources.map(source => {
            const result = lookup[source];
            return <section key={source} className="min-w-0 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <h3 className="text-sm font-semibold">{citySourceLabels[source]}</h3>
              {!result ? <p className="text-sm text-slate-500">Dataset unavailable for this search.</p> : <>
                {result.records?.length ? <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {result.records.map((row, index) => <li key={index} className="py-2 text-sm">
                    <p className="font-semibold">{row.address || [row.number, row.street].filter(Boolean).join(' ')}</p>
                    <dl className="mt-1 space-y-1">{Object.entries(fields).map(([key, label]) => row[key] != null && row[key] !== '' && (
                      <div key={key} className="flex flex-wrap gap-x-2"><dt className="text-slate-500">{label}</dt><dd>{key === 'value' ? formatted(row[key], true) : key === 'issued' ? String(row[key]).slice(0, 10) : row[key]}</dd></div>
                    ))}</dl>
                  </li>)}
                </ul> : <p className="text-sm text-slate-500">No matching city records.</p>}
                <SourceLink result={result} />
              </>}
            </section>;
          })}
        </div>}
      </section>

      <section className={card} aria-labelledby="city-assessments-heading">
        <h2 id="city-assessments-heading" className="home-section-title">Residential assessments</h2>
        {assessment === undefined ? <p role="status">Loading assessments…</p> : !assessment ? <p className="text-sm text-slate-500">City assessment data is unavailable.</p> : <>
          <p className="text-sm text-slate-500">{assessment.year ? `Assessment year ${assessment.year}` : 'The dataset does not identify the assessment year.'} Municipal assessments differ from sale prices.</p>
          <dl className="my-3 flex flex-wrap gap-6">
            <div><dt className="text-xs">Assessment records</dt><dd className="text-xl font-semibold">{formatted(assessment.totals?.records)}</dd></div>
            <div><dt className="text-xs">Average assessed value</dt><dd className="text-xl font-semibold">{formatted(assessment.totals?.average_assessment, true)}</dd></div>
          </dl>
          {!!assessment.neighbourhoods?.length && <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <caption className="sr-only">Neighbourhoods with the most residential assessment records</caption>
            <thead><tr><th scope="col">Neighbourhood</th><th scope="col" className="text-right">Records</th><th scope="col" className="text-right">Average assessment</th></tr></thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">{assessment.neighbourhoods.map(row => <tr key={row.neighbourhood}><td className="py-1 pr-2">{row.neighbourhood}</td><td className="text-right tabular-nums">{formatted(row.records)}</td><td className="text-right tabular-nums">{formatted(row.average_assessment, true)}</td></tr>)}</tbody>
          </table></div>}
          <SourceLink result={assessment} />
        </>}
      </section>

      <section aria-labelledby="city-permit-heading">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 id="city-permit-heading" className="home-section-title">Monthly permit activity</h2>
          <label className="flex items-center gap-2 text-sm">Permit year <select value={year} onChange={event => setYear(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">{years.map(value => <option key={value}>{value}</option>)}</select></label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">{(['building', 'development'] as const).map(source => {
          const snapshot = snapshots[source];
          const months = snapshot?.months ?? [];
          const maximum = Math.max(1, ...months.map(month => Number(month.permits)));
          return <section key={source} className={card}>
            <h3 className="font-semibold">{citySourceLabels[source]}</h3>
            {snapshot === undefined ? <p role="status">Loading permits…</p> : !snapshot ? <p className="text-sm text-slate-500">City permit data is unavailable.</p> : <>
              {months.length ? <ul className="mt-2 space-y-2">{months.map(month => <li key={month.month} className="grid grid-cols-[3rem_minmax(0,1fr)_4rem] items-center gap-2 text-xs">
                <span>{new Intl.DateTimeFormat('en-CA', { month: 'short' }).format(new Date(2000, Number(month.month) - 1, 1))}</span>
                <span className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><span aria-hidden="true" className="block h-full rounded-full bg-indigo-600" style={{ width: `${Number(month.permits) / maximum * 100}%` }} /></span>
                <span className="text-right tabular-nums">{formatted(month.permits)}</span>
              </li>)}</ul> : <p className="text-sm text-slate-500">No permit records returned for {year}.</p>}
              {months.some(month => month.declared_value != null) && <p className="mt-2 text-sm">Declared construction value {currency.format(months.reduce((total, month) => total + Number(month.declared_value ?? 0), 0))}</p>}
              <SourceLink result={snapshot} />
            </>}
          </section>;
        })}</div>
      </section>
    </div>
  );
}
