import { MapPin, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import Supercluster from 'supercluster';
import { getAssessmentMap, type AssessmentMapResult, type AssessmentPoint } from '../api/cityData';
import 'leaflet/dist/leaflet.css';

const cityBounds = L.latLngBounds([53.25, -113.85], [53.77, -113.15]);
const dollars = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

function popupFor(point: AssessmentPoint) {
  const popup = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = point.neighbourhood || 'Residential assessment';
  const detail = document.createElement('p');
  const value = Number(point.value);
  detail.textContent = point.value != null && Number.isFinite(value) ? `Assessed value ${dollars.format(value)}` : 'Assessed value unavailable';
  popup.append(title, detail);
  return popup;
}

export default function AssessmentMap() {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [query, setQuery] = useState({ bounds: '' });
  const [result, setResult] = useState<AssessmentMapResult | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current, { minZoom: 10, maxZoom: 18, scrollWheelZoom: false, maxBounds: cityBounds.pad(0.25) });
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
    getAssessmentMap(query.bounds)
      .then(data => { if (active) setResult(data); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [query]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !result) return;
    const clusters = new Supercluster<AssessmentPoint>({ radius: 52, maxZoom: 17 });
    clusters.load(result.points.map(point => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
      properties: point,
    })));
    const markers = L.layerGroup().addTo(map);
    const redraw = () => {
      const bounds = map.getBounds();
      markers.clearLayers();
      const visible = clusters.getClusters(
        [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()], Math.floor(map.getZoom()),
      );
      for (const item of visible) {
        const [lng, lat] = item.geometry.coordinates;
        if ('cluster' in item.properties) {
          const { point_count: count, point_count_abbreviated: label, cluster_id: id } = item.properties;
          L.marker([lat, lng], {
            icon: L.divIcon({
              className: 'assessment-map-cluster',
              html: String(label),
              iconSize: [38, 38],
            }),
            title: `${count} loaded assessment records`,
          }).on('click', () => map.setView([lat, lng], clusters.getClusterExpansionZoom(id))).addTo(markers);
        } else {
          L.marker([lat, lng], {
            icon: L.divIcon({ className: 'assessment-map-point', iconSize: [14, 14] }),
            title: 'Residential assessment',
          }).bindPopup(popupFor(item.properties)).addTo(markers);
        }
      }
    };
    redraw();
    map.on('moveend', redraw);
    return () => { map.off('moveend', redraw); markers.remove(); };
  }, [result]);

  const searchArea = () => {
    const visible = mapRef.current?.getBounds();
    if (!visible) return;
    const bounds = [
      Math.max(cityBounds.getSouth(), visible.getSouth()),
      Math.max(cityBounds.getWest(), visible.getWest()),
      Math.min(cityBounds.getNorth(), visible.getNorth()),
      Math.min(cityBounds.getEast(), visible.getEast()),
    ];
    setResult(null);
    setError(false);
    setQuery({ bounds: bounds.every(Number.isFinite) && bounds[0] < bounds[2] && bounds[1] < bounds[3] ? bounds.map(value => value.toFixed(3)).join(',') : '' });
  };

  return (
    <section aria-labelledby="assessment-map-heading" className="home-panel min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin aria-hidden="true" className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />
          <h2 id="assessment-map-heading" className="home-section-title">Residential assessment map</h2>
        </div>
        <button type="button" onClick={searchArea} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-slate-700 dark:text-indigo-300 dark:hover:bg-indigo-950">
          <Search aria-hidden="true" className="h-4 w-4" />Search this area
        </button>
      </div>
      <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
        Zoom in or select a cluster to explore City assessment records. Cluster counts reflect the records loaded for this map.
      </p>
      <div ref={container} role="region" aria-label="Interactive map of Edmonton assessments" className="relative z-0 h-[340px] rounded-lg border border-slate-200 sm:h-[420px] dark:border-slate-700" />
      <div className="mt-2 flex flex-wrap items-start justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <p role="status">{error ? 'City assessment points could not be loaded.' : !result ? 'Loading assessment points…'
          : !result.points.length ? 'No mappable assessments returned for this area.'
          : `${result.points.length.toLocaleString('en-CA')} records loaded${result.year ? ` · Assessment year ${result.year}` : ''}${result.limited ? ` · Limited to ${result.limit.toLocaleString('en-CA')} records. Zoom in and search again for a smaller area.` : ''}`}</p>
        {result && <a href={result.source_url} target="_blank" rel="noreferrer" className="font-semibold text-indigo-700 hover:underline dark:text-indigo-300">City of Edmonton dataset</a>}
      </div>
    </section>
  );
}
