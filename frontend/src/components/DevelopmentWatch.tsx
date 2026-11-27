import { useEffect, useState } from 'react';
import { citySourceLabels, getCityData, type CityResult } from '../api/cityData';

const sources = ['building', 'development'] as const;

export default function DevelopmentWatch() {
  const [results, setResults] = useState<Partial<Record<(typeof sources)[number], CityResult | null>>>({});
  useEffect(() => {
    let active = true;
    for (const source of sources) {
      getCityData(source, 'recent')
        .then(result => { if (active) setResults(current => ({ ...current, [source]: result })); })
        .catch(() => { if (active) setResults(current => ({ ...current, [source]: null })); });
    }
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-3">
      {sources.map(source => {
        const result = results[source];
        return (
          <section key={source}>
            <h3 className="text-sm font-semibold">{citySourceLabels[source]}</h3>
            {result === undefined ? <p role="status" className="text-xs">Loading permits…</p>
              : !result ? <p className="text-xs text-slate-500">City data unavailable.</p>
              : <><ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {(result.records ?? []).slice(0, 3).map((record, index) => (
                  <li key={index} className="py-2 text-sm">
                    <p className="line-clamp-2 font-semibold">{record.description || record.building_type || citySourceLabels[source]}</p>
                    <p className="text-xs text-slate-500">{[record.neighbourhood, String(record.issued ?? '').slice(0, 10), record.permit_number].filter(Boolean).join(' · ')}</p>
                  </li>
                ))}
              </ul>
              {!result.records?.length && <p className="text-xs text-slate-500">No recent records returned.</p>}
              <a href={result.source_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300">City of Edmonton dataset</a></>}
          </section>
        );
      })}
    </div>
  );
}
