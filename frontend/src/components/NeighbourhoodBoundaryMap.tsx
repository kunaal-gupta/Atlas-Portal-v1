import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { neighbourhoodKey, neighbourhoodName, type CityNeighbourhood } from '../api/cityData';
import 'leaflet/dist/leaflet.css';

const ordinary: L.PathOptions = { color: '#f8fbfc', weight: 1.2, fillColor: '#168897', fillOpacity: 0.32 };
const highlighted: L.PathOptions = { color: '#fff', weight: 2.5, fillColor: '#115a68', fillOpacity: 0.72 };

export default function NeighbourhoodBoundaryMap({ records, selected, onSelect }: {
  records: CityNeighbourhood[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const boundaries = useRef<L.GeoJSON | null>(null);
  const selectedKey = useRef(selected);
  const paths = useRef(new Map<string, L.Path>());

  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current, { scrollWheelZoom: false, minZoom: 9, maxZoom: 18 }).setView([53.53, -113.5], 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    mapRef.current = map;
    return () => { mapRef.current = null; map.remove(); };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const byKey = new Map(records.map(record => [neighbourhoodKey(record), record]));
    const layer = L.geoJSON(records.flatMap(record => record.boundary ? [{
      type: 'Feature' as const,
      geometry: record.boundary,
      properties: { key: neighbourhoodKey(record) },
    }] : []), {
      style: ordinary,
      onEachFeature(feature, item) {
        if (!(item instanceof L.Path)) return;
        const key = feature.properties.key;
        const record = byKey.get(key);
        if (!record) return;
        paths.current.set(key, item);
        const title = document.createElement('span');
        title.textContent = neighbourhoodName(record);
        item.bindTooltip(title, { sticky: true });
        item.on({
          mouseover: () => item.setStyle(highlighted),
          mouseout: () => { if (selectedKey.current !== key) item.setStyle(ordinary); },
          click: () => onSelect(key),
        });
      },
    }).addTo(map);
    boundaries.current = layer;
    if (layer.getBounds().isValid()) map.fitBounds(layer.getBounds(), { padding: [15, 15], maxZoom: 14 });
    return () => { paths.current.clear(); boundaries.current = null; layer.remove(); };
  }, [records, onSelect]);

  useEffect(() => {
    selectedKey.current = selected;
    for (const [key, layer] of paths.current) {
      layer.setStyle(key === selected ? highlighted : ordinary);
      if (key === selected) layer.bringToFront();
    }
  }, [selected, records]);

  return (
    <div className="relative">
      <div ref={container} role="region" aria-label="Edmonton neighbourhood boundary map" className="relative z-0 h-[370px] rounded-lg border border-slate-200 sm:h-[510px] dark:border-slate-700" />
      <button type="button" className="absolute right-3 top-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm"
        onClick={() => {
          const bounds = boundaries.current?.getBounds();
          if (bounds?.isValid()) mapRef.current?.fitBounds(bounds, { padding: [15, 15], maxZoom: 14 });
        }}>
        Fit boundaries
      </button>
    </div>
  );
}
