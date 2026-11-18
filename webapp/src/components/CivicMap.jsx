import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HeatLayer } from 'leaflet.heat';
import { Flame, Crosshair, ZoomIn, ZoomOut, AlertTriangle, Trash2 } from 'lucide-react';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Guaranteed reliable map tile providers with NO API Key needed
const MAP_THEMES = {
  googleRoadmap: {
    name: 'Google Standard',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps'
  },
  googleSatellite: {
    name: 'Google Satellite',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps Satellite'
  },
  esriDark: {
    name: 'Dark Civic',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    subdomains: ['server'],
    attribution: '&copy; Esri, DeLorme, NAVTEQ'
  }
};

export default function CivicMap({ reports, selectedReport, onSelectReport }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersGroupRef = useRef(null);
  const heatLayerRef = useRef(null);

  const [mapTheme, setMapTheme] = useState('googleRoadmap');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.462, 77.065],
        zoom: 12.5,
        zoomControl: false,
        attributionControl: false,
      });

      const initialConfig = MAP_THEMES.googleRoadmap;
      const baseTile = L.tileLayer(initialConfig.url, {
        maxZoom: 20,
        subdomains: initialConfig.subdomains,
      }).addTo(map);

      tileLayerRef.current = baseTile;
      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Force canvas layout calculation
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }, []);

  // 2. Change Tile Theme
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const config = MAP_THEMES[mapTheme];
    tileLayerRef.current.setUrl(config.url);
    if (config.subdomains) {
      tileLayerRef.current.options.subdomains = config.subdomains;
    }
  }, [mapTheme]);

  // 3. Render Heatmap & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current) return;

    const visibleReports = reports.filter(r => {
      if (activeTypeFilter === 'all') return true;
      return r.type === activeTypeFilter;
    });

    // Heatmap Layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (showHeatmap && typeof HeatLayer !== 'undefined') {
      try {
        const heatPoints = [];
        visibleReports.forEach(r => {
          const intensity = r.status === 'resolved' ? 0.2 : (r.severity === 'critical' ? 1.0 : 0.6);
          heatPoints.push([r.coordinates[0], r.coordinates[1], intensity]);

          // Synthetic density clusters around Gurugram arterial roads for realistic heatmap glow
          if (r.status !== 'resolved') {
            for (let i = 0; i < 3; i++) {
              heatPoints.push([
                r.coordinates[0] + (Math.random() - 0.5) * 0.007,
                r.coordinates[1] + (Math.random() - 0.5) * 0.007,
                0.55
              ]);
            }
          }
        });

        const heat = new HeatLayer(heatPoints, {
          radius: 36,
          blur: 22,
          maxZoom: 16,
          max: 1.0,
          gradient: {
            0.2: '#3b82f6',
            0.4: '#10b981',
            0.6: '#f59e0b',
            0.85: '#f43f5e',
            1.0: '#e11d48'
          }
        }).addTo(map);

        heatLayerRef.current = heat;
      } catch (err) {
        console.warn('Heatmap layer warning:', err);
      }
    }

    // Reticle Markers
    markersGroupRef.current.clearLayers();

    visibleReports.forEach(report => {
      const isGarbage = report.type === 'garbage';
      const isResolved = report.status === 'resolved';

      const color = isResolved ? '#10b981' : (isGarbage ? '#ef4444' : '#f59e0b');
      const pulseColor = isResolved ? 'rgba(16,185,129,0.45)' : (isGarbage ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)');
      const emoji = isResolved ? '✅' : (isGarbage ? '🗑️' : '⚠️');

      const customHtml = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${!isResolved ? `<span style="position: absolute; inset: 0; border-radius: 9999px; background: ${pulseColor}; transform: scale(1.35); opacity: 0.6;"></span>` : ''}
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${color};
            border: 2px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          ">
            ${emoji}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'civic-marker-node',
        html: customHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker(report.coordinates, { icon }).addTo(markersGroupRef.current);
      marker.on('click', () => {
        onSelectReport(report);
      });
    });

  }, [reports, showHeatmap, activeTypeFilter, onSelectReport]);

  // Center on report
  useEffect(() => {
    if (selectedReport && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(selectedReport.coordinates, 15, {
        duration: 1.2
      });
    }
  }, [selectedReport]);

  const handleLocateMe = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          mapInstanceRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 14.5);
        },
        () => {
          mapInstanceRef.current.flyTo([28.462, 77.065], 13);
        }
      );
    }
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[650px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-xl bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Top Floating Glass Control Deck */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl pointer-events-auto">
          <button
            type="button"
            onClick={() => setActiveTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTypeFilter === 'all'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Hazards
          </button>
          <button
            type="button"
            onClick={() => setActiveTypeFilter('garbage')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTypeFilter === 'garbage'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trash2 size={13} />
            Garbage
          </button>
          <button
            type="button"
            onClick={() => setActiveTypeFilter('pothole')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTypeFilter === 'pothole'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle size={13} />
            Potholes
          </button>
        </div>

        {/* Heatmap & Theme toggles */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl border transition-all cursor-pointer shadow-lg ${
              showHeatmap
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-white/95 text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            <Flame size={14} className={showHeatmap ? 'animate-bounce' : ''} />
            <span>Heatmap {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex p-1 rounded-xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-lg">
            {Object.entries(MAP_THEMES).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMapTheme(key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  mapTheme === key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {config.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-5 left-4 z-[400] bg-white/95 backdrop-blur-xl px-4 py-3 rounded-2xl border border-slate-200/80 shadow-xl pointer-events-none hidden sm:block">
        <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-rose-600 mb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          Gurugram Hazard Density Heatmap
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Garbage Blackspot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Pothole / Cave-in</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>MCG Cleared</span>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-5 right-4 z-[400] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleLocateMe}
          className="w-10 h-10 rounded-2xl bg-white/95 text-slate-700 shadow-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          title="Recenter to my location"
        >
          <Crosshair size={18} />
        </button>

        <div className="bg-white/95 rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col backdrop-blur-md">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-10 h-10 text-slate-700 flex items-center justify-center hover:bg-slate-50 border-b border-slate-200 cursor-pointer transition-colors"
          >
            <ZoomIn size={18} />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-10 h-10 text-slate-700 flex items-center justify-center hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <ZoomOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
