import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HeatLayer } from 'leaflet.heat';
import { Flame, Layers, Crosshair, ZoomIn, ZoomOut, AlertTriangle, Trash2 } from 'lucide-react';

// Fix Leaflet default icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MAP_THEMES = {
  dark: {
    name: 'Dark Civic',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO'
  },
  light: {
    name: 'Clean Light',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps'
  }
};

export default function CivicMap({ reports, selectedReport, onSelectReport }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersGroupRef = useRef(null);
  const heatLayerRef = useRef(null);

  const [mapTheme, setMapTheme] = useState('dark');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.462, 77.065],
        zoom: 12.5,
        zoomControl: false,
        attributionControl: false,
      });

      const baseTile = L.tileLayer(MAP_THEMES.dark.url, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      tileLayerRef.current = baseTile;
      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Invalidate size once mounted so canvas renders fully
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      // Map stays alive
    };
  }, []);

  // Update Tile Theme
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(MAP_THEMES[mapTheme].url);
  }, [mapTheme]);

  // Update Heatmap & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current) return;

    const visibleReports = reports.filter(r => {
      if (activeTypeFilter === 'all') return true;
      return r.type === activeTypeFilter;
    });

    // 1. Heatmap Layer using HeatLayer class from leaflet.heat
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
          maxZoom: 15,
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
        console.warn('Heatmap layer init warning:', err);
      }
    }

    // 2. Custom Pins
    markersGroupRef.current.clearLayers();

    visibleReports.forEach(report => {
      const isGarbage = report.type === 'garbage';
      const isResolved = report.status === 'resolved';

      const color = isResolved ? '#10b981' : (isGarbage ? '#ef4444' : '#f59e0b');
      const pulseColor = isResolved ? 'rgba(16,185,129,0.45)' : (isGarbage ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)');
      const emoji = isResolved ? '✅' : (isGarbage ? '🗑️' : '⚠️');

      const customHtml = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${!isResolved ? `<span style="position: absolute; inset: 0; border-radius: 9999px; background: ${pulseColor}; transform: scale(1.4); opacity: 0.6;"></span>` : ''}
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${color};
            border: 2px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
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
    <div className="relative w-full h-[520px] sm:h-[650px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Control Deck */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        
        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-xl pointer-events-auto">
          <button
            type="button"
            onClick={() => setActiveTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTypeFilter === 'all'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
                : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Flame size={14} className={showHeatmap ? 'animate-bounce' : ''} />
            <span>Heatmap {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex p-1 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-lg">
            {Object.entries(MAP_THEMES).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMapTheme(key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  mapTheme === key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {config.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-5 left-4 z-[400] bg-slate-900/90 backdrop-blur-xl px-4 py-3 rounded-2xl border border-slate-700/80 shadow-2xl pointer-events-none hidden sm:block">
        <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-rose-400 mb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          Gurugram Hazard Density Heatmap
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Garbage Blackspot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Pothole / Road Cave-in</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>MCG Cleared</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-5 right-4 z-[400] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleLocateMe}
          className="w-10 h-10 rounded-2xl bg-slate-900/95 text-slate-200 shadow-xl border border-slate-700 flex items-center justify-center hover:bg-slate-800 hover:text-white active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          title="Recenter to my location"
        >
          <Crosshair size={18} />
        </button>

        <div className="bg-slate-900/95 rounded-2xl shadow-xl border border-slate-700 overflow-hidden flex flex-col backdrop-blur-md">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-10 h-10 text-slate-300 flex items-center justify-center hover:bg-slate-800 hover:text-white border-b border-slate-800 cursor-pointer transition-colors"
          >
            <ZoomIn size={18} />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-10 h-10 text-slate-300 flex items-center justify-center hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
          >
            <ZoomOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
