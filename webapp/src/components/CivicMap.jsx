import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix Leaflet's default icon missing paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function CivicMap({ reports, selectedReport, onSelectReport }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Gurugram Central Coordinates ~ 28.4595, 77.0266
      const map = L.map(mapContainerRef.current, {
        center: [28.465, 77.065],
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    reports.forEach((report) => {
      const isGarbage = report.type === 'garbage';
      const isResolved = report.status === 'resolved';

      const color = isResolved ? '#10b981' : (isGarbage ? '#ef4444' : '#f59e0b');
      const emoji = isGarbage ? '🗑️' : '⚠️';

      const customIcon = L.divIcon({
        className: 'custom-civic-pin',
        html: `
          <div style="
            background-color: ${color};
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2.5px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            font-size: 14px;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            ${isResolved ? '✅' : emoji}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker(report.coordinates, { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        onSelectReport(report);
      });

      markersRef.current[report.id] = marker;
    });

    return () => {
      // keep map instance alive across rerenders
    };
  }, [reports, onSelectReport]);

  // Pan to selected report if changed
  useEffect(() => {
    if (selectedReport && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(selectedReport.coordinates, 14, {
        duration: 1.2
      });
    }
  }, [selectedReport]);

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Overlay legend */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/80 shadow-sm text-xs font-medium space-y-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
          <span className="text-slate-700">Garbage Hotspot</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-slate-700">Road Pothole</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-700">Cleared / Repaired</span>
        </div>
      </div>
    </div>
  );
}
