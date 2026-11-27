import { List, Map, Search } from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { getNeighbourhoods, neighbourhoodKey, neighbourhoodName, type CityNeighbourhood } from '../api/cityData';

const BoundaryMap = lazy(() => import('./NeighbourhoodBoundaryMap'));
const pageSize = 12;
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton', year: 'numeric', month: '2-digit', day: '2-digit' });
const controls = 'rounded-md px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800';
const source = 'https://data.edmonton.ca/d/65fr-66s6';

export default function CityNeighbourhoodDirectory() {
  const [data, setData] = useState<CityNeighbourhood[]>();
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [mode, setMode] = useState<'map' | 'list'>('map');
  const [query, setQuery] = useState('');
  const [historical, setHistorical] = useState(false);
  const [selected, setSelected] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    let active = true;
    getNeighbourhoods().then(({ results }) => {
      if (active) setData(results);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [attempt]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('en-CA');
    const date = today.format(new Date());
    return (data ?? []).filter(record => (
      (historical || ((!record.start_date || record.start_date.slice(0, 10) <= date) && (!record.end_date || record.end_date.slice(0, 10) >= date)))
      && [record.name, record.display_name, record.number, record.ward, record.district].some(value => value.toLocaleLowerCase('en-CA').includes(term))
    ));
  }, [data, query, historical]);
  const activeRecord = filtered.find(record => neighbourhoodKey(record) === selected);
  const start = page * pageSize;
  const fields = activeRecord ? [
    ['Neighbourhood number', activeRecord.number], ['Civic ward', activeRecord.ward],
    ['Planning district', activeRecord.district], ['Effective start', activeRecord.start_date.slice(0, 10)],
    ['Effective end', activeRecord.end_date.slice(0, 10)],
  ] : [];

  return (
    <section className="home-panel mt-4 min-w-0" aria-labelledby="city-neighbourhood-directory">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="city-neighbourhood-directory" className="home-section-title">Edmonton neighbourhoods</h2>
        <div role="group" aria-label="Neighbourhood view" className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
          <button type="button" onClick={() => setMode('map')} aria-pressed={mode === 'map'}
            className={`inline-flex items-center gap-2 ${controls} ${mode === 'map' ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200' : ''}`}>
            <Map aria-hidden="true" className="h-4 w-4" />Map view
          </button>
          <button type="button" onClick={() => setMode('list')} aria-pressed={mode === 'list'}
            className={`inline-flex items-center gap-2 ${controls} ${mode === 'list' ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200' : ''}`}>
            <List aria-hidden="true" className="h-4 w-4" />List view
          </button>
        </div>
      </div>
      <div className="my-3 flex flex-wrap items-center gap-3">
        <label className="relative w-full max-w-sm">
          <Search aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input aria-label="Search Edmonton neighbourhoods" placeholder="Search name, number, ward or district" value={query}
            onChange={event => { setQuery(event.target.value); setPage(0); }}
            className="min-h-10 w-full rounded-md border border-slate-200 bg-transparent pl-9 pr-3 text-sm dark:border-slate-700" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={historical} onChange={event => { setHistorical(event.target.checked); setPage(0); }} />Include historical boundaries
        </label>
      </div>
      {error ? (
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <p role="status">City records are unavailable. Community profiles are still available below.</p>
          <button type="button" className="font-semibold text-indigo-700 hover:underline dark:text-indigo-300"
            onClick={() => { setError(false); setAttempt(value => value + 1); }}>Retry</button>
        </div>
      ) : !data ? <p role="status" className="mb-3 text-sm">Loading City neighbourhoods…</p>
        : <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{filtered.length.toLocaleString('en-CA')} matching records</p>}
      {mode === 'map' ? (
        <Suspense fallback={<p role="status">Loading map…</p>}>
          <BoundaryMap records={filtered} selected={selected} onSelect={setSelected} />
        </Suspense>
      ) : data && (filtered.length ? <>
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800"><tr>{['Neighbourhood', 'Number', 'Civic ward', 'Planning district'].map(label => (
              <th scope="col" key={label} className="px-3 py-2">{label}</th>
            ))}</tr></thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filtered.slice(start, start + pageSize).map(record => {
                const key = neighbourhoodKey(record);
                return <tr key={key} className={key === selected ? 'bg-indigo-50 dark:bg-indigo-950' : ''}>
                  <td className="px-3 py-2"><button type="button" aria-pressed={key === selected} onClick={() => setSelected(key)}
                    className="font-semibold text-indigo-700 hover:underline dark:text-indigo-300">{neighbourhoodName(record)}</button></td>
                  <td className="px-3 py-2 tabular-nums">{record.number}</td>
                  <td className="px-3 py-2">{record.ward || '—'}</td>
                  <td className="px-3 py-2">{record.district || '—'}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > pageSize && <div className="mt-2 flex items-center justify-end gap-2 text-xs">
          <button type="button" disabled={page === 0} onClick={() => setPage(value => value - 1)} className={controls}>Previous</button>
          <span>{start + 1}–{Math.min(start + pageSize, filtered.length)} of {filtered.length}</span>
          <button type="button" disabled={start + pageSize >= filtered.length} onClick={() => setPage(value => value + 1)} className={controls}>Next</button>
        </div>}
      </> : <p className="text-sm text-slate-500">No neighbourhoods match your search.</p>)}
      {activeRecord && <section aria-label="Selected neighbourhood" className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
        <h3 className="font-semibold">{neighbourhoodName(activeRecord)}</h3>
        <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {fields.filter(([, value]) => value).map(([label, value]) => <div key={label}>
            <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt><dd>{value}</dd>
          </div>)}
        </dl>
        {activeRecord.description && <p className="mt-2 text-sm">{activeRecord.description}</p>}
      </section>}
      <a href={source} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300">City of Edmonton neighbourhood dataset</a>
    </section>
  );
}
