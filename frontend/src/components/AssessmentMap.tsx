import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import Supercluster from 'supercluster';
import {
  getAssessmentMap, getNeighbourhoods, neighbourhoodName,
  type AssessmentMapResult, type AssessmentPoint, type CityNeighbourhood,
} from '../api/cityData';
import AssessmentCharts, { money, viewNames, type AssessmentView } from './AssessmentCharts';
import 'leaflet/dist/leaflet.css';

const cityBounds = L.latLngBounds([53.25, -113.85], [53.77, -113.15]);
const emptyFilters = { class: 'residential', neighbourhood: '', ward: '', min_value: '', max_value: '' };
const defaults = {
  aggregation: 'clusters', colour: '#e67824', colourBy: 'none', resize: 'none', opacity: 85, size: 10,
  shape: 'filled', hover: true, singular: 'Record', plural: 'Records', title: 'address',
  details: ['value', 'neighbourhood', 'ward', 'assessment_class'], simplify: 1,
};
const detailLabels = {
  value: 'Assessed value', neighbourhood: 'Neighbourhood', ward: 'Civic ward',
  assessment_class: 'Assessment class', garage: 'Garage', suite: 'Suite',
} as const;
const inputClass = 'min-h-8 w-full rounded-md border border-slate-200 bg-transparent px-2 text-sm dark:border-slate-700';
const toggleClass = 'flex items-center gap-2 text-sm';
const panelClass = 'border-t border-slate-200 py-3 dark:border-slate-700';
const summaryClass = 'font-semibold text-sm';

function countLabel(count: number, options: typeof defaults) {
  return `${count.toLocaleString('en-CA')} ${count === 1 ? options.singular.trim() || 'Record' : options.plural.trim() || 'Records'}`;
}

function content(title: string, lines: string[]) {
  const popup = document.createElement('div');
  const heading = document.createElement('strong');
  heading.textContent = title;
  popup.append(heading);
  for (const line of lines) {
    const detail = document.createElement('div');
    detail.textContent = line;
    popup.append(detail);
  }
  return popup;
}

function pointContent(point: AssessmentPoint, options: typeof defaults) {
  const title = options.title === 'neighbourhood' ? point.neighbourhood
    : options.title === 'class' ? point.assessment_class : point.address;
  const lines = options.details.flatMap(key => {
    const field = key as keyof typeof detailLabels;
    const value = point[field];
    if (value == null || value === '') return [];
    return [`${detailLabels[field]}: ${field === 'value' ? money.format(Number(value)) : value}`];
  });
  return content(title || point.neighbourhood || 'Property assessment', lines);
}

function markerStyle(point: AssessmentPoint, options: typeof defaults, maximum: number) {
  const ratio = Math.max(0, Math.min(1, (Number(point.value) || 0) / maximum));
  const color = options.colourBy === 'value' ? (ratio < 1 / 3 ? '#087f91' : ratio < 2 / 3 ? '#e67824' : '#a53e71') : options.colour;
  const size = options.resize === 'value' ? options.size * (0.65 + ratio * 1.1) : options.size;
  const icon = document.createElement('span');
  icon.style.cssText = `display:block;width:100%;height:100%;border-radius:50%;border:2px solid ${color};background:${options.shape === 'outline' ? 'transparent' : color};opacity:${options.opacity / 100}`;
  return L.divIcon({ html: icon, iconSize: [size, size], className: '' });
}

function drawPoints(map: L.Map, result: AssessmentMapResult, options: typeof defaults) {
  const layer = L.layerGroup().addTo(map);
  const maximum = Math.max(1, ...result.points.map(point => Number(point.value) || 0));
  const index = new Supercluster<AssessmentPoint>({ radius: 52, maxZoom: 17 }).load(result.points.map(point => ({
    type: 'Feature', geometry: { type: 'Point', coordinates: [point.lng, point.lat] }, properties: point,
  })));
  const redraw = () => {
    const bounds = map.getBounds();
    layer.clearLayers();
    const bbox: [number, number, number, number] = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
    const visible = index.getClusters(bbox, options.aggregation === 'clusters' ? Math.floor(map.getZoom()) : 18);
    for (const item of visible) {
      const [lng, lat] = item.geometry.coordinates;
      if ('cluster' in item.properties) {
        const { point_count: count, point_count_abbreviated: label, cluster_id: id } = item.properties;
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({ className: 'assessment-map-cluster', html: String(label), iconSize: [38, 38] }),
          title: countLabel(count, options),
        }).on('click', () => map.setView([lat, lng], index.getClusterExpansionZoom(id)));
        if (options.hover) marker.bindTooltip(content(countLabel(count, options), []));
        marker.addTo(layer);
      } else {
        const point = item.properties;
        const marker = L.marker([lat, lng], {
          icon: markerStyle(point, options, maximum), title: point.address || 'Property assessment',
        }).bindPopup(pointContent(point, options));
        if (options.hover) marker.bindTooltip(pointContent(point, options), { direction: 'top' });
        marker.addTo(layer);
      }
    }
  };
  redraw();
  map.on('moveend', redraw);
  return () => { map.off('moveend', redraw); layer.remove(); };
}

function drawHeat(map: L.Map, points: AssessmentPoint[], options: typeof defaults) {
  const canvas = document.createElement('canvas');
  canvas.className = 'pointer-events-none absolute inset-0 z-[410]';
  canvas.setAttribute('aria-hidden', 'true');
  map.getContainer().append(canvas);
  const draw = () => {
    const { x, y } = map.getSize();
    canvas.width = x;
    canvas.height = y;
    const context = canvas.getContext('2d');
    if (!context) return;
    const radius = Math.max(12, options.size * 2);
    for (const point of points) {
      const { x: left, y: top } = map.latLngToContainerPoint([point.lat, point.lng]);
      if (left < -radius || left > x + radius || top < -radius || top > y + radius) continue;
      const gradient = context.createRadialGradient(left, top, 0, left, top, radius);
      const alpha = Math.round(options.opacity * 0.8).toString(16).padStart(2, '0');
      gradient.addColorStop(0, options.colour + alpha);
      gradient.addColorStop(1, options.colour + '00');
      context.fillStyle = gradient;
      context.fillRect(left - radius, top - radius, radius * 2, radius * 2);
    }
  };
  draw();
  map.on('move zoom resize', draw);
  return () => { map.off('move zoom resize', draw); canvas.remove(); };
}

function drawRegions(map: L.Map, points: AssessmentPoint[], regions: CityNeighbourhood[], options: typeof defaults) {
  const counts = new Map<string, number>();
  for (const point of points) {
    if (!point.neighbourhood) continue;
    const key = point.neighbourhood.toUpperCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const maximum = Math.max(1, ...counts.values());
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton', dateStyle: 'short' }).format();
  const features = regions.flatMap(region => {
    if (!region.boundary || (region.end_date && region.end_date.slice(0, 10) < today)) return [];
    return [{
      type: 'Feature' as const, geometry: region.boundary,
      properties: {
        name: neighbourhoodName(region),
        count: counts.get(region.name.toUpperCase()) ?? counts.get(neighbourhoodName(region).toUpperCase()) ?? 0,
      },
    }];
  });
  const layerOptions: L.GeoJSONOptions & Pick<L.PolylineOptions, 'smoothFactor'> = {
    smoothFactor: options.simplify,
    style: feature => ({
      color: '#f8fbfc', weight: 1,
      fillColor: options.colour,
      fillOpacity: feature?.properties.count ? (0.2 + 0.8 * feature.properties.count / maximum) * options.opacity / 100 : 0.04,
    }),
    onEachFeature: (feature, path) => {
      const label = countLabel(feature.properties.count, options);
      path.bindPopup(content(feature.properties.name, [label]));
      if (options.hover) path.bindTooltip(content(feature.properties.name, [label]), { sticky: true });
    },
  };
  const layer = L.geoJSON(features, layerOptions).addTo(map);
  return () => { layer.remove(); };
}

export default function AssessmentMap() {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [view, setView] = useState<AssessmentView>('Map');
  const [filters, setFilters] = useState(emptyFilters);
  const [query, setQuery] = useState({ bounds: '', filters: emptyFilters });
  const [options, setOptions] = useState(defaults);
  const [result, setResult] = useState<AssessmentMapResult | null>(null);
  const [regions, setRegions] = useState<CityNeighbourhood[] | null>();
  const [error, setError] = useState(false);
  const setOption = <K extends keyof typeof defaults,>(key: K, value: (typeof defaults)[K]) =>
    setOptions(current => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current, { minZoom: 10, maxZoom: 18, scrollWheelZoom: true, maxBounds: cityBounds.pad(0.25) });
    map.fitBounds(cityBounds);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => { mapRef.current = null; map.remove(); };
  }, []);

  useEffect(() => {
    let active = true;
    getAssessmentMap(query.bounds, query.filters)
      .then(data => { if (active) setResult(data); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [query]);

  useEffect(() => {
    if (options.aggregation !== 'region' || regions !== undefined) return;
    let active = true;
    getNeighbourhoods().then(({ results }) => { if (active) setRegions(results); })
      .catch(() => { if (active) setRegions(null); });
    return () => { active = false; };
  }, [options.aggregation, regions]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !result || view !== 'Map') return;
    map.invalidateSize({ pan: false });
    if (options.aggregation === 'region') return regions ? drawRegions(map, result.points, regions, options) : undefined;
    return options.aggregation === 'heat' ? drawHeat(map, result.points, options) : drawPoints(map, result, options);
  }, [result, options, view, regions]);

  const load = (bounds: string, nextFilters = filters) => {
    setResult(null);
    setError(false);
    setQuery({ bounds, filters: nextFilters });
  };
  const searchArea = () => {
    const visible = mapRef.current?.getBounds();
    if (!visible) return;
    const bounds = [
      Math.max(cityBounds.getSouth(), visible.getSouth()), Math.max(cityBounds.getWest(), visible.getWest()),
      Math.min(cityBounds.getNorth(), visible.getNorth()), Math.min(cityBounds.getEast(), visible.getEast()),
    ].map(value => value.toFixed(3));
    if (Number(bounds[0]) < Number(bounds[2]) && Number(bounds[1]) < Number(bounds[3])) load(bounds.join(','), query.filters);
  };

  return (
    <section aria-labelledby="assessment-map-heading" className="home-panel min-w-0">
      <h2 id="assessment-map-heading" className="home-section-title">Property assessment data</h2>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">City of Edmonton assessments. Values are for assessment interpretation.</p>
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside aria-label="Assessment visualization settings" className="space-y-1 rounded-lg border border-slate-200 px-3 dark:border-slate-700">
          <details open className="py-3"><summary className={summaryClass}>Data selection</summary>
            <form className="mt-2 space-y-2 text-xs" onSubmit={event => { event.preventDefault(); load(query.bounds); }}>
              <label className="block">Geo column<input readOnly value="Point Location" className={inputClass} /></label>
              <label className="block">Assessment class<select value={filters.class} onChange={event => setFilters(current => ({ ...current, class: event.target.value }))} className={inputClass}>
                <option value="residential">Residential</option><option value="non-residential">Non-residential</option><option value="all">All classes</option>
              </select></label>
              {(['neighbourhood', 'ward'] as const).map(key => <label key={key} className="block">{key === 'ward' ? 'Civic ward' : 'Neighbourhood'}
                <input value={filters[key]} maxLength={80} onChange={event => setFilters(current => ({ ...current, [key]: event.target.value }))} className={inputClass} />
              </label>)}
              <div className="grid grid-cols-2 gap-2">{(['min_value', 'max_value'] as const).map(key => <label key={key}>{key === 'min_value' ? 'Min. value' : 'Max. value'}
                <input type="number" min="0" max="999999999999" value={filters[key]} onChange={event => setFilters(current => ({ ...current, [key]: event.target.value }))} className={inputClass} />
              </label>)}</div>
              <button className="rounded-md bg-indigo-700 px-3 py-2 font-semibold text-white">Apply filters</button>
              <label className="block">Resize points by value<select value={options.resize} onChange={event => setOption('resize', event.target.value)} className={inputClass}><option value="none">None</option><option value="value">Assessed value</option></select></label>
              <label className="block">Style by value<select value={options.colourBy} onChange={event => setOption('colourBy', event.target.value)} className={inputClass}><option value="none">None</option><option value="value">Assessed value</option></select></label>
            </form>
          </details>
          <details className={panelClass}><summary className={summaryClass}>Point aggregation</summary>
            <fieldset className="mt-2 space-y-1">{[['none', 'None'], ['clusters', 'Clusters'], ['heat', 'Heat map'], ['region', 'Region map']].map(([value, label]) => (
              <label key={value} className={toggleClass}><input type="radio" name="assessment-aggregation" value={value} checked={options.aggregation === value} onChange={() => setOption('aggregation', value)} />{label}</label>
            ))}</fieldset>
          </details>
          <details className={panelClass}><summary className={summaryClass}>Color</summary>
            <div className="mt-2 space-y-2 text-xs">
              <label className="flex items-center justify-between gap-1">Point color<input type="color" value={options.colour} onChange={event => setOption('colour', event.target.value)} /></label>
              <label className="block">Point style<select value={options.shape} onChange={event => setOption('shape', event.target.value)} className={inputClass}><option value="filled">Filled</option><option value="outline">Outline</option></select></label>
              <label className="block">Point opacity <span className="float-right">{options.opacity}%</span><input className="w-full" type="range" min="15" max="100" value={options.opacity} onChange={event => setOption('opacity', Number(event.target.value))} /></label>
            </div>
          </details>
          <details className={panelClass}><summary className={summaryClass}>Point size</summary>
            <label className="mt-2 block text-xs">Size <span className="float-right">{options.size}px</span><input className="w-full" type="range" min="5" max="24" value={options.size} onChange={event => setOption('size', Number(event.target.value))} /></label>
          </details>
          <details className={panelClass}><summary className={summaryClass}>Flyout unit label</summary>
            <div className="mt-2 space-y-2 text-xs">{(['singular', 'plural'] as const).map(key => <label key={key} className="block capitalize">{key}
              <input maxLength={24} value={options[key]} onChange={event => setOption(key, event.target.value)} className={inputClass} />
            </label>)}</div>
          </details>
          <details className={panelClass}><summary className={summaryClass}>Flyout details</summary>
            <div className="mt-2 space-y-2 text-xs">
              <label className="block">Flyout title<select value={options.title} onChange={event => setOption('title', event.target.value)} className={inputClass}><option value="address">Property address</option><option value="neighbourhood">Neighbourhood</option><option value="class">Assessment class</option></select></label>
              <label className={toggleClass}><input type="checkbox" checked={options.hover} onChange={event => setOption('hover', event.target.checked)} />Show on hover</label>
              <fieldset><legend className="font-semibold">Additional flyout values</legend>{Object.entries(detailLabels).map(([key, label]) => <label key={key} className={toggleClass}>
                <input type="checkbox" checked={options.details.includes(key)} onChange={event => setOption('details', event.target.checked ? [...options.details, key] : options.details.filter(field => field !== key))} />{label}
              </label>)}</fieldset>
            </div>
          </details>
          <details className={panelClass}><summary className={summaryClass}>Advanced options</summary>
            <label className="mt-2 block text-xs">Region simplification level <span className="float-right">{options.simplify}</span><input className="w-full" type="range" min="0" max="5" step="0.5" value={options.simplify} onChange={event => setOption('simplify', Number(event.target.value))} /></label>
          </details>
          <button type="button" className="pb-3 text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300" onClick={() => {
            setFilters(emptyFilters); setOptions(defaults); setView('Map'); mapRef.current?.fitBounds(cityBounds); load('', emptyFilters);
          }}>Reset settings</button>
        </aside>

        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold">Visualization
              <select aria-label="Visualization" value={view} onChange={event => setView(event.target.value as AssessmentView)} className={inputClass}>
                {viewNames.map(name => <option key={name}>{name}</option>)}
              </select>
            </label>
            {view === 'Map' && <button type="button" onClick={searchArea} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-slate-700 dark:text-indigo-300 dark:hover:bg-indigo-950">
              <Search aria-hidden="true" className="h-4 w-4" />Search this area
            </button>}
          </div>
          <div hidden={view !== 'Map'}>
            <div ref={container} role="region" aria-label="Interactive map of Edmonton assessments" className="relative z-0 h-[360px] overflow-hidden rounded-lg border border-slate-200 sm:h-[460px] dark:border-slate-700" />
            {options.aggregation === 'region' && <p className="mt-1 text-xs text-slate-500">
              {regions === null ? 'Neighbourhood boundaries are unavailable.' : regions === undefined ? 'Loading neighbourhood boundaries…' : 'Region shading shows the number of loaded records.'}
            </p>}
            {options.aggregation === 'heat' && <p className="mt-1 text-xs text-slate-500">Stronger shading marks areas with more loaded records.</p>}
            {['none', 'clusters'].includes(options.aggregation) && options.colourBy === 'value' && <p className="mt-1 text-xs text-slate-500">Value colors from low to high: teal, orange, plum.</p>}
          </div>
          {view !== 'Map' && result && <div className="min-h-48 rounded-lg border border-slate-200 p-3 dark:border-slate-700"><AssessmentCharts view={view} result={result} /></div>}
          <div className="mt-2 flex flex-wrap items-start justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <p role="status">{error ? 'City assessments could not be loaded. Check your filters and try again.' : !result ? 'Loading assessment records…'
              : `${result.points.length.toLocaleString('en-CA')} records loaded${result.year ? ` · Assessment year ${result.year}` : ''}${result.limited ? ` · Limited to ${result.limit.toLocaleString('en-CA')} records. Refine filters or search a smaller area.` : ''}`}</p>
            {result && <a href={result.source_url} target="_blank" rel="noreferrer" className="font-semibold text-indigo-700 hover:underline dark:text-indigo-300">City of Edmonton dataset</a>}
          </div>
        </div>
      </div>
    </section>
  );
}
