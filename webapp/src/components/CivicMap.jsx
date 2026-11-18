import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Crosshair, ZoomIn, ZoomOut } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Google Maps Tile URLs (High Quality Standard and Satellite)
const TILE_PROVIDERS = {
  googleRoadmap: {
    name: 'Google Standard',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps'
  },
  googleHybrid: {
    name: 'Google Satellite',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satellite'
  },
  osmClean: {
    name: 'Clean Vector',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO'
  }
};

export default function CivicMap({ reports, selectedReport, onSelectReport }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});
  const [currentLayer, setCurrentLayer] = useState('googleRoadmap');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.465, 77.065],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      const initialLayer = L.tileLayer(TILE_PROVIDERS.googleRoadmap.url, {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      tileLayerRef.current = initialLayer;
      mapInstanceRef.current = map;
    }
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const provider = TILE_PROVIDERS[currentLayer];
    tileLayerRef.current.setUrl(provider.url);
  }, [currentLayer]);

  // Render Custom Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    reports.forEach((report) => {
      const isGarbage = report.type === 'garbage';
      const isResolved = report.status === 'resolved';

      const color = isResolved ? '#10b981' : (isGarbage ? '#ef4444' : '#f59e0b');
      const pulseColor = isResolved ? 'rgba(16, 185, 129, 0.4)' : (isGarbage ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)');
      const emoji = isGarbage ? '🗑️' : '⚠️';

      const customIcon = L.divIcon({
        className: 'custom-civic-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <span class="absolute w-9 h-9 rounded-full animate-ping opacity-60" style="background-color: ${pulseColor}"></span>
            <div style="
              background-color: ${color};
              width: 36px;
              height: 36px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
              font-size: 15px;
              transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            " class="hover:scale-110">
              ${isResolved ? '✅' : emoji}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker(report.coordinates, { icon: customIcon }).addTo(map);

      // Popup styled like Google Maps Place card
      const popupContent = `
        <div style="font-family: -apple-system, sans-serif; min-width: 190px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">
            MCG Ward ${report.ward} · ${report.sector}
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 3px;">
            ${report.title}
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">
            📍 ${report.landmark}
          </div>
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #0284c7; font-weight: 600;">
            Click pin to view full details & escalate
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { offset: [0, -10] });

      marker.on('click', () => {
        onSelectReport(report);
      });

      markersRef.current[report.id] = marker;
    });
  }, [reports, onSelectReport]);

  // Center on selected report
  useEffect(() => {
    if (selectedReport && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(selectedReport.coordinates, 15, {
        duration: 1.2
      });
      if (markersRef.current[selectedReport.id]) {
        markersRef.current[selectedReport.id].openPopup();
      }
    }
  }, [selectedReport]);

  const handleLocateMe = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapInstanceRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 14);
        },
        () => {
          // Fallback to Gurugram center
          mapInstanceRef.current.flyTo([28.4595, 77.0266], 13);
        }
      );
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[550px] rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200/80 shadow-md">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Layer Switcher (Google Map styling) */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-md">
        {Object.entries(TILE_PROVIDERS).map(([key, provider]) => (
          <button
            key={key}
            type="button"
            onClick={() => setCurrentLayer(key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentLayer === key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {provider.name}
          </button>
        ))}
      </div>

      {/* Map Control Tools (Zoom & Location) */}
      <div className="absolute bottom-6 right-4 z-[400] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleLocateMe}
          className="w-10 h-10 rounded-xl bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          title="Center on my location"
        >
          <Crosshair size={18} />
        </button>
        
        <div className="bg-white rounded-xl shadow-md border border-slate-200/80 overflow-hidden flex flex-col">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-10 h-10 text-slate-700 flex items-center justify-center hover:bg-slate-50 border-b border-slate-100 cursor-pointer"
          >
            <ZoomIn size={18} />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-10 h-10 text-slate-700 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
          >
            <ZoomOut size={18} />
          </button>
        </div>
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-6 left-4 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-md text-xs font-semibold space-y-1.5 pointer-events-none hidden sm:block">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Gurugram Map Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-xs"></span>
          <span className="text-slate-700">Garbage Black Spot</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs"></span>
          <span className="text-slate-700">Pothole / Road Cave-in</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-xs"></span>
          <span className="text-slate-700">Cleared by MCG</span>
        </div>
      </div>
    </div>
  );
}
