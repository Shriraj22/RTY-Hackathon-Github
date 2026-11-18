import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Map, 
  ListFilter, 
  Trash2, 
  AlertTriangle, 
  Building2, 
  BarChart3, 
  ShieldCheck, 
  Search,
  ExternalLink,
  ChevronRight,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_REPORTS, MCG_ZONES, GURUGRAM_SECTORS } from './data/gurugramData';
import ReportCard from './components/ReportCard';
import CivicMap from './components/CivicMap';
import NewReportModal from './components/NewReportModal';
import ReportDetailModal from './components/ReportDetailModal';

export default function App() {
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('margdarshak_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'map' | 'analytics'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'garbage' | 'pothole'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'resolved'
  const [zoneFilter, setZoneFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('margdarshak_reports', JSON.stringify(reports));
  }, [reports]);

  // Handlers
  const handleAddReport = (newReport) => {
    setReports(prev => [newReport, ...prev]);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 }
    });
  };

  const handleUpvote = (id) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, upvotes: r.upvotes + 1 };
      }
      return r;
    }));

    if (selectedReport && selectedReport.id === id) {
      setSelectedReport(prev => ({ ...prev, upvotes: prev.upvotes + 1 }));
    }
  };

  const handleToggleResolve = (id) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'resolved' ? 'in-progress' : 'resolved';
        return { ...r, status: nextStatus };
      }
      return r;
    }));

    if (selectedReport && selectedReport.id === id) {
      setSelectedReport(prev => ({
        ...prev,
        status: prev.status === 'resolved' ? 'in-progress' : 'resolved'
      }));
    }
  };

  // Filtered reports
  const filteredReports = reports.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (statusFilter === 'active' && r.status === 'resolved') return false;
    if (statusFilter === 'resolved' && r.status !== 'resolved') return false;
    if (zoneFilter !== 'all' && r.zoneId !== zoneFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${r.title} ${r.landmark} ${r.sector} ${r.officialAssigned}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Calculate statistics
  const totalReports = reports.length;
  const garbageCount = reports.filter(r => r.type === 'garbage').length;
  const potholeCount = reports.filter(r => r.type === 'pothole').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const resolutionRate = Math.round((resolvedCount / (totalReports || 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16 md:pb-0">
      {/* Top Banner & Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-rose-500/20">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  MargDarshak <span className="text-rose-600">Gurugram</span>
                </h1>
                <span className="text-[10px] bg-slate-100 font-mono text-slate-600 px-1.5 py-0.5 rounded font-bold">
                  MCG 36 Wards
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Citizen accountability portal for Gurugram garbage black spots & potholes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-sm shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Report Hazard</span>
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="max-w-6xl mx-auto px-4 border-t border-slate-100 flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('feed')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'feed' ? 'border-rose-600 text-rose-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ListFilter size={14} />
            Feed & List ({filteredReports.length})
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'map' ? 'border-rose-600 text-rose-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Map size={14} />
            Live Civic Map
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'analytics' ? 'border-rose-600 text-rose-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BarChart3 size={14} />
            MCG Performance & Wards
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 py-5 flex-1">
        
        {/* Global Civic Stats Summary */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Tracked</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{totalReports} Issues</span>
            <span className="text-[10px] text-slate-500">Across 6 MCG Zones</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block flex items-center gap-1">
              <Trash2 size={12} /> Garbage Spots
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{garbageCount}</span>
            <span className="text-[10px] text-slate-500">Illegal dump points</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block flex items-center gap-1">
              <AlertTriangle size={12} /> Pothole Craters
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{potholeCount}</span>
            <span className="text-[10px] text-slate-500">Road infra hazards</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block flex items-center gap-1">
              <ShieldCheck size={12} /> MCG Action Rate
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{resolutionRate}%</span>
            <span className="text-[10px] text-emerald-600 font-medium">{resolvedCount} cleared so far</span>
          </div>
        </section>

        {/* View Switch: FEED TAB */}
        {activeTab === 'feed' && (
          <div className="space-y-5">
            {/* Filter controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by sector, landmark, or official..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      typeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setTypeFilter('garbage')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      typeFilter === 'garbage' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Garbage
                  </button>
                  <button
                    onClick={() => setTypeFilter('pothole')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      typeFilter === 'pothole' ? 'bg-white text-amber-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Potholes
                  </button>
                </div>

                {/* Zone dropdown */}
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-100 border border-transparent rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-slate-300"
                >
                  <option value="all">All MCG Zones</option>
                  {MCG_ZONES.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>

                {/* Status Toggle */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-100 border border-transparent rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-slate-300"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Reports Grid */}
            {filteredReports.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
                <p className="text-slate-500 text-sm">No civic complaints match your filters.</p>
                <button
                  onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setZoneFilter('all'); setSearchQuery(''); }}
                  className="mt-3 text-xs font-semibold text-rose-600 hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onSelect={(rep) => setSelectedReport(rep)}
                    onUpvote={handleUpvote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* View Switch: MAP TAB */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Displaying {filteredReports.length} geocoded civic hazards across Gurugram
              </span>
              <span className="text-slate-500">
                Click any pin on the map to inspect authority attribution and escalate
              </span>
            </div>

            <div className="h-[600px] w-full">
              <CivicMap
                reports={filteredReports}
                selectedReport={selectedReport}
                onSelectReport={(rep) => setSelectedReport(rep)}
              />
            </div>
          </div>
        )}

        {/* View Switch: ANALYTICS & WARD LEADERBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Municipal Corporation of Gurugram (MCG) Performance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Accountability breakdown by administrative zone and Joint Commissioner charge
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                  Public Scorecard
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MCG_ZONES.map((zone) => {
                  const zoneReports = reports.filter(r => r.zoneId === zone.id);
                  const zoneResolved = zoneReports.filter(r => r.status === 'resolved').length;
                  const rate = zoneReports.length ? Math.round((zoneResolved / zoneReports.length) * 100) : 0;

                  return (
                    <div key={zone.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{zone.name}</h4>
                          <span className="text-[11px] text-slate-500 font-medium block">
                            {zone.cluster} · Wards: {zone.wards.join(', ')}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                          {rate}% cleared
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${rate}%` }}
                        />
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="text-slate-400 block font-medium">Joint Commissioner:</span>
                          <span className="font-semibold text-slate-700">{zone.jointCommissioner}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block font-medium">Open Issues:</span>
                          <span className="font-semibold text-rose-600">{zoneReports.length - zoneResolved}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Citizens callout */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base">Notice a spot in your sector?</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-lg">
                  Every submission is logged under the respective MCG Ward official and shared with citizen resident welfare associations (RWAs).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(true)}
                className="shrink-0 bg-white text-slate-900 font-bold px-4 py-2.5 rounded-full text-xs hover:bg-slate-100 transition-colors"
              >
                Log New Hazard Now
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button on Mobile */}
      <div className="fixed bottom-4 right-4 z-30 md:hidden">
        <button
          type="button"
          onClick={() => setIsNewModalOpen(true)}
          className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 active:scale-95"
          aria-label="Report"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Modals */}
      <NewReportModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmitReport={handleAddReport}
      />

      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onUpvote={handleUpvote}
        onToggleResolve={handleToggleResolve}
      />
    </div>
  );
}
