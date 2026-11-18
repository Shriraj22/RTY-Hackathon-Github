import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { Flame, Layers, Crosshair, ZoomIn, ZoomOut, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Crisp high-resolution tile layers
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
  googleHybrid: {
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
  const [showPins, setShowPins] = useState(true);
  const [activeTypeFilter, setActiveTypeFilter] = useState('all'); // 'all' | 'garbage' | 'pothole'

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
    }
  }, []);

  // Handle Tile Theme Switch
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(MAP_THEMES[mapTheme].url);
  }, [mapTheme]);

  // Update Heatmap and Pin Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current) return;

    // Filter reports according to local map filter
    const visibleReports = reports.filter(r => {
      if (activeTypeFilter === 'all') return true;
      return r.type === activeTypeFilter;
    });

    // 1. Heatmap layer configuration
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (showHeatmap && window.L && L.heatLayer) {
      // Points format: [lat, lng, intensity]
      const heatPoints = visibleReports.map(r => {
        // High severity gets heavier weight on the heat gradient
        const intensity = r.status === 'resolved' ? 0.2 : (r.severity === 'critical' ? 1.0 : 0.6);
        return [r.coordinates[0], r.coordinates[1], intensity];
      });

      // Add extra jitter clusters to generate realistic civic density hotspots around Gurugram arterial roads
      visibleReports.forEach(r => {
        if (r.status !== 'resolved') {
          for (let i = 0; i < 4; i++) {
            heatPoints.push([
              r.coordinates[0] + (Math.random() - 0.5) * 0.008,
              r.coordinates[1] + (Math.random() - 0.5) * 0.008,
              0.55
            ]);
          }
        }
      });

      const heat = L.heatLayer(heatPoints, {
        radius: 35,
        blur: 24,
        maxZoom: 15,
        max: 1.0,
        gradient: {
          0.2: '#3b82f6', // low blue
          0.4: '#10b981', // green
          0.6: '#f59e0b', // warning amber
          0.85: '#f43f5e', // severe rose
          1.0: '#e11d48'  // critical red
        }
      }).addTo(map);

      heatLayerRef.current = heat;
    }

    // 2. Pins Layer
    markersGroupRef.current.clearLayers();

    if (showPins) {
      visibleReports.forEach(report => {
        const isGarbage = report.type === 'garbage';
        const isResolved = report.status === 'resolved';

        const color = isResolved ? '#10b981' : (isGarbage ? '#ef4444' : '#f59e0b');
        const glow = isResolved ? 'rgba(16,185,129,0.45)' : (isGarbage ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)');
        const iconSvg = isResolved 
          ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`
          : (isGarbage
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/></svg>`
            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
          );

        const customMarkerHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; cursor: pointer;">
            ${!isResolved ? `<span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background: ${glow}; animation: ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></span>` : ''}
            <div style="
              position: relative;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: ${color};
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 14px rgba(0,0,0,0.5);
              border: 2px solid #ffffff;
              transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            ">
              ${iconSvg}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'civic-density-marker',
          html: customMarkerHtml,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker(report.coordinates, { icon }).addTo(markersGroupRef.current);

        marker.on('click', () => {
          onSelectReport(report);
        });
      });
    }

  }, [reports, showHeatmap, showPins, activeTypeFilter, onSelectReport]);

  // Center when selected report changes
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
    <div className="relative w-full h-full min-h-[460px] md:min-h-[620px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Top Floating Glass Control Deck */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Issue Density Toggles */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 shadow-xl pointer-events-auto">
          <button
            type="button"
            onClick={() => setActiveTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTypeFilter === 'all'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Hazards
          </button>
          <button
            type="button"
            onClick={() => setActiveTypeFilter('garbage')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTypeFilter === 'garbage'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trash2 size={13} />
            Garbage
          </button>
          <button
            type="button"
            onClick={() => setActiveTypeFilter('pothole')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTypeFilter === 'pothole'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle size={13} />
            Potholes
          </button>
        </div>

        {/* Right: Layer controls & Heatmap switch */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Heatmap intensity toggle */}
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl border transition-all cursor-pointer shadow-lg ${
              showHeatmap
                ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/25'
                : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Flame size={14} className={showHeatmap ? 'animate-bounce' : ''} />
            <span>Heatmap {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>

          {/* Theme switcher */}
          <div className="flex p-1 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 shadow-lg">
            {Object.entries(MAP_THEMES).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMapTheme(key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  mapTheme === key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {config.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Floating Stats & Reticle Control */}
      <div className="absolute bottom-5 left-4 z-[400] bg-slate-900/90 backdrop-blur-xl px-4 py-3 rounded-2xl border border-slate-700/80 shadow-2xl pointer-events-none hidden sm:block">
        <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-rose-400 mb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          Gurugram Heatmap & Hazard Density
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-xs"></span>
            <span>Critical Hotspot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-xs"></span>
            <span>Moderate Hazard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs"></span>
            <span>MCG Cleared</span>
          </div>
        </div>
      </div>

      {/* Zoom and Locate Me Floating Panel */}
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
