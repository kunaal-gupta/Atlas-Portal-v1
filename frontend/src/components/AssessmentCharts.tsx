import type { AssessmentMapResult } from '../api/cityData';

export const money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
export const viewNames = ['Map', 'Bar chart', 'Column chart', 'Pie chart', 'Timeline chart', 'Histogram', 'Combo chart', 'Scatter chart', 'Table'] as const;
export type AssessmentView = (typeof viewNames)[number];
const palette = ['#087f91', '#e39238', '#5477a2', '#9b6289', '#788349', '#627984'];

type Group = { label: string; count: number; total: number; valued: number };
function groupsBy(result: AssessmentMapResult, key: 'neighbourhood' | 'assessment_class') {
  const groups = new Map<string, Group>();
  for (const point of result.points) {
    const label = point[key] || 'Unspecified';
    const group = groups.get(label) ?? { label, count: 0, total: 0, valued: 0 };
    group.count += 1;
    if (point.value != null && Number.isFinite(Number(point.value))) {
      group.total += Number(point.value);
      group.valued += 1;
    }
    groups.set(label, group);
  }
  return [...groups.values()].sort((a, b) => b.count - a.count);
}

const mean = (group: Group) => group.valued ? group.total / group.valued : 0;

export default function AssessmentCharts({ view, result }: { view: AssessmentView; result: AssessmentMapResult }) {
  const areas = groupsBy(result, 'neighbourhood').slice(0, 8);
  const values = result.points.flatMap(point => point.value != null && Number.isFinite(Number(point.value)) ? [Number(point.value)] : []);
  const maxValue = Math.max(1, ...values);
  const maxCount = Math.max(1, ...areas.map(area => area.count));
  const maxMean = Math.max(1, ...areas.map(mean));

  if (view === 'Timeline chart') {
    return <section className="space-y-3" aria-label="Assessment coverage timeline">
      <h3 className="font-semibold">Dataset coverage</h3>
      {result.coverage ? <>
        <div aria-hidden="true" className="h-3 rounded-full bg-indigo-600" />
        <div className="flex justify-between text-sm"><time>{result.coverage[0]}</time><time>{result.coverage[1]}</time></div>
      </> : <p>{result.year ? `Assessment year ${result.year}` : 'The City has not supplied a coverage period.'}</p>}
      <p className="text-sm text-slate-500">This dataset contains one assessment snapshot.</p>
    </section>;
  }
  if (!result.points.length) return <p>No assessment records match the current filters.</p>;

  if (view === 'Bar chart') {
    return <section aria-label="Average assessed value by neighbourhood"><h3 className="mb-3 font-semibold">Average assessed value by neighbourhood</h3>
      <ul className="space-y-3">{areas.filter(area => area.valued).map(area => <li key={area.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] items-center gap-2 text-xs">
        <span>{area.label}</span><span className="h-3 rounded bg-indigo-600" style={{ width: `${mean(area) / maxMean * 100}%` }} /><span>{money.format(mean(area))}</span>
      </li>)}</ul>
    </section>;
  }

  if (view === 'Pie chart') {
    const groups = groupsBy(result, 'assessment_class');
    const total = result.points.length;
    let offset = 0;
    const stops = groups.map((group, index) => {
      const from = offset;
      offset += group.count / total * 100;
      return `${palette[index % palette.length]} ${from}% ${offset}%`;
    });
    return <section aria-label="Assessment class share"><h3 className="mb-3 font-semibold">Assessment class share</h3>
      <div className="flex flex-wrap items-center gap-5">
        <div aria-hidden="true" className="h-40 w-40 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops.join(',')})` }} />
        <ul className="space-y-2 text-sm">{groups.map((group, index) => <li key={group.label} className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-3 rounded" style={{ backgroundColor: palette[index % palette.length] }} />{group.label} · {group.count} ({Math.round(group.count / total * 100)}%)
        </li>)}</ul>
      </div>
    </section>;
  }

  if (view === 'Scatter chart') {
    const priced = result.points.filter(point => point.value != null && Number.isFinite(Number(point.value)));
    if (!priced.length) return <p>No assessed values are available for this view.</p>;
    const west = Math.min(...priced.map(point => point.lng));
    const east = Math.max(...priced.map(point => point.lng));
    return <section aria-label="Assessed value by longitude"><h3 className="mb-2 font-semibold">Assessed value by longitude</h3>
      <p className="mb-2 text-xs text-slate-500">Vertical axis: assessed value up to {money.format(maxValue)}.</p>
      <div className="relative h-60 overflow-hidden rounded border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
        {priced.map((point, index) => <span key={index} title={`${point.address || point.neighbourhood || 'Assessment'} · ${money.format(Number(point.value))}`} className="absolute h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-600/60"
          style={{ left: `${3 + (east === west ? 0.5 : (point.lng - west) / (east - west)) * 94}%`, bottom: `${4 + Math.max(0, Number(point.value)) / maxValue * 92}%` }} />)}
      </div>
      <p className="mt-1 flex justify-between text-xs"><span>{west.toFixed(3)}°</span><span>Longitude</span><span>{east.toFixed(3)}°</span></p>
    </section>;
  }

  if (view === 'Table') {
    return <div className="max-h-96 overflow-auto rounded border border-slate-200 dark:border-slate-700">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800"><tr>{['Property address', 'Neighbourhood', 'Class', 'Assessed value'].map(label => <th scope="col" key={label} className="p-2">{label}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">{result.points.map((point, index) => <tr key={index}>
          <td className="p-2">{point.address || '—'}</td><td className="p-2">{point.neighbourhood || '—'}</td><td className="p-2">{point.assessment_class || '—'}</td><td className="p-2 tabular-nums">{point.value != null ? money.format(Number(point.value)) : '—'}</td>
        </tr>)}</tbody>
      </table>
    </div>;
  }

  const histogram = view === 'Histogram';
  const combo = view === 'Combo chart';
  const step = Math.max(100000, Math.ceil(maxValue / 8 / 100000) * 100000);
  const bins = Array.from({ length: 8 }, (_, index) => ({ label: money.format(index * step), count: 0 }));
  for (const value of values) bins[Math.min(7, Math.max(0, Math.floor(value / step)))].count += 1;
  const series = histogram ? bins : areas;
  const peak = histogram ? Math.max(1, ...series.map(item => item.count)) : maxCount;
  return <section aria-label={view}>
    <h3 className="font-semibold">{histogram ? 'Distribution of assessed values' : combo ? 'Record count and average assessment by neighbourhood' : 'Records by neighbourhood'}</h3>
    {combo && <p className="text-xs text-slate-500">Bars: records up to {maxCount}. Line: average assessed value up to {money.format(maxMean)}.</p>}
    {histogram && <p className="text-xs text-slate-500">Value bands are {money.format(step)} wide. Labels show each band’s lower bound.</p>}
    <div className="mt-3 overflow-x-auto">
      <div className="min-w-[450px]">
        <div className="relative flex h-44 items-end border-b border-slate-300">
          {series.map(item => <div key={item.label} className="flex h-full min-w-0 flex-1 items-end justify-center px-1">
            <span title={`${item.label}: ${item.count} records`} className="w-3/5 rounded-t bg-indigo-600" style={{ height: `${item.count / peak * 92}%` }} />
          </div>)}
          {combo && <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline fill="none" stroke="#e39238" strokeWidth="2" vectorEffect="non-scaling-stroke"
              points={areas.map((item, index) => `${(index + 0.5) / areas.length * 100},${100 - mean(item) / maxMean * 92}`).join(' ')} />
          </svg>}
        </div>
        <ul className="flex pt-1">{series.map((item, index) => <li key={item.label} className="min-w-0 flex-1 break-words px-1 text-center text-xs">
          <span className="block">{item.label}</span><strong>{item.count}</strong>
          {combo && <span className="block">{areas[index]?.valued ? money.format(mean(areas[index])) : '—'}</span>}
        </li>)}</ul>
      </div>
    </div>
  </section>;
}
