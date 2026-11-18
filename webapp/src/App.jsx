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
  LogIn,
  LogOut,
  User,
  Sparkles,
  Flame,
  HardHat,
  Car
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_REPORTS, MCG_ZONES } from './data/gurugramData';
import ReportCard from './components/ReportCard';
import CivicMap from './components/CivicMap';
import NewReportModal from './components/NewReportModal';
import ReportDetailModal from './components/ReportDetailModal';
import VerificationModal from './components/VerificationModal';
import DisputeModal from './components/DisputeModal';
import AuthModal from './components/AuthModal';
import AnalyticsView from './components/AnalyticsView';
import CiviQLogo from './components/CiviQLogo';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, signOut, isSupabaseConfigured } = useAuth();

  const [reports, setReports] = useState(() => {
    // Always use full 110 initial dataset if storage is small
    const saved = localStorage.getItem('civiq_reports_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length >= 100) return parsed;
    }
    return INITIAL_REPORTS;
  });

  // Main UI Mode Switch: 'all' | 'garbage' | 'roads' | 'analytics'
  const [activeDomain, setActiveDomain] = useState('garbage'); // Default focused on Solid Waste or Roads
  const [activeView, setActiveView] = useState('feed'); // 'feed' | 'map'
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [verifyingReport, setVerifyingReport] = useState(null);
  const [disputingReport, setDisputingReport] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [seenReports, setSeenReports] = useState(() => {
    const saved = localStorage.getItem('civiq_seen_reports');
    return saved ? JSON.parse(saved) : {};
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('civiq_reports_v2', JSON.stringify(reports));
  }, [reports]);

  // Handlers
  const handleAddReport = (newReport) => {
    const reportWithUser = {
      ...newReport,
      reportedBy: user ? (user.user_metadata?.full_name || user.email) : 'Citizen Reporter'
    };
    setReports(prev => [reportWithUser, ...prev]);
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.65 }
    });
  };

  const handleOpenReportModal = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsNewModalOpen(true);
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

  const handleCompleteVerification = (verificationData) => {
    setReports(prev => prev.map(r => {
      if (r.id === verificationData.reportId) {
        return {
          ...r,
          status: 'resolved',
          cleanedImageUrl: verificationData.cleanedImageUrl,
          verifiedBy: verificationData.verifiedBy,
          role: verificationData.role,
          notes: verificationData.notes,
          verifiedAt: verificationData.verifiedAt,
          disputed: false
        };
      }
      return r;
    }));

    if (selectedReport && selectedReport.id === verificationData.reportId) {
      setSelectedReport(prev => ({
        ...prev,
        status: 'resolved',
        cleanedImageUrl: verificationData.cleanedImageUrl,
        verifiedBy: verificationData.verifiedBy,
        role: verificationData.role,
        notes: verificationData.notes,
        verifiedAt: verificationData.verifiedAt,
        disputed: false
      }));
    }

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleCompleteDispute = (disputeData) => {
    setReports(prev => prev.map(r => {
      if (r.id === disputeData.reportId) {
        return {
          ...r,
          status: 'in-progress',
          disputed: true,
          disputeReason: disputeData.reason,
          disputeDescription: disputeData.description,
          disputedAt: disputeData.disputedAt
        };
      }
      return r;
    }));

    if (selectedReport && selectedReport.id === disputeData.reportId) {
      setSelectedReport(prev => ({
        ...prev,
        status: 'in-progress',
        disputed: true,
        disputeReason: disputeData.reason,
        disputeDescription: disputeData.description,
        disputedAt: disputeData.disputedAt
      }));
    }
  };

  const handleSawThisToo = (id) => {
    const nextSeen = !seenReports[id];
    setSeenReports(prev => {
      const updated = { ...prev, [id]: nextSeen };
      localStorage.setItem('civiq_seen_reports', JSON.stringify(updated));
      return updated;
    });

    setReports(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, upvotes: nextSeen ? r.upvotes + 1 : Math.max(1, r.upvotes - 1) };
      }
      return r;
    }));

    if (selectedReport && selectedReport.id === id) {
      setSelectedReport(prev => ({
        ...prev,
        upvotes: nextSeen ? prev.upvotes + 1 : Math.max(1, prev.upvotes - 1)
      }));
    }
  };

  // Filtered reports based on activeDomain (Garbage vs Roads)
  const domainReports = reports.filter(r => {
    if (activeDomain === 'garbage') return r.type === 'garbage';
    if (activeDomain === 'roads') return r.type === 'pothole';
    return true;
  });

  const filteredReports = domainReports.filter(r => {
    if (statusFilter === 'active' && r.status === 'resolved') return false;
    if (statusFilter === 'resolved' && r.status !== 'resolved') return false;
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    if (zoneFilter !== 'all' && r.zoneId !== zoneFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${r.title} ${r.landmark} ${r.sector} ${r.officialAssigned} ${r.contractorAssigned || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Domain-specific Severity tiers
  const currentSeverityOptions = activeDomain === 'garbage' ? [
    { id: 'all', label: 'All Severities' },
    { id: 'small', label: 'Minor Litter (<1m²)' },
    { id: 'medium', label: 'Moderate Heap' },
    { id: 'large', label: 'Severe Obstruction' },
    { id: 'massive', label: 'Critical Dump (Plot/Road)' }
  ] : [
    { id: 'all', label: 'All Severities' },
    { id: 'small', label: 'Surface Cracks' },
    { id: 'medium', label: '4-6 inch Crater' },
    { id: 'large', label: 'Rim/Axle Hazard' },
    { id: 'massive', label: 'Lethal Road Cave-in' }
  ];

  // Counts
  const totalInDomain = domainReports.length;
  const resolvedInDomain = domainReports.filter(r => r.status === 'resolved').length;
  const openInDomain = totalInDomain - resolvedInDomain;
  const rateInDomain = Math.round((resolvedInDomain / (totalInDomain || 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 md:pb-6 antialiased selection:bg-rose-500 selection:text-white">
      
      {/* Dynamic Background Glow Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[128px] opacity-25 transition-colors duration-700 ${
          activeDomain === 'garbage' ? 'bg-rose-600' : (activeDomain === 'roads' ? 'bg-amber-500' : 'bg-blue-600')
        }`} />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px]" />
      </div>

      {/* Top Banner & Main Nav */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <CiviQLogo size="md" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                GURUGRAM CIVIC AUDIT
              </span>
              <span className="text-xs text-slate-500">
                110+ Active Ground Hazards
              </span>
            </div>
          </div>

          {/* User & Report Trigger */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full text-xs font-semibold text-slate-200 border border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="max-w-[120px] truncate">{user.user_metadata?.full_name || user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="p-2 sm:px-3 sm:py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                <LogIn size={14} />
                <span>Citizen Sign In</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenReportModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-lg shadow-rose-600/30 transition-all cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>Report Hazard</span>
            </button>
          </div>
        </div>

        {/* DOMAIN SEPARATION BAR: Garbage Blackspots vs. Road & Potholes UI */}
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800/80 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          
          {/* Primary Domain Switcher */}
          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => { setActiveDomain('garbage'); setActiveView('feed'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeDomain === 'garbage'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-400/50'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Trash2 size={15} />
              <span>Garbage & Waste ({reports.filter(r => r.type === 'garbage').length})</span>
            </button>

            <button
              onClick={() => { setActiveDomain('roads'); setActiveView('feed'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeDomain === 'roads'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 border border-amber-300'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <AlertTriangle size={15} />
              <span>Roads & Potholes ({reports.filter(r => r.type === 'pothole').length})</span>
            </button>

            <button
              onClick={() => setActiveDomain('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeDomain === 'analytics'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/50'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <BarChart3 size={15} />
              <span>Audit & Analytics</span>
            </button>
          </div>

          {/* Sub-view toggle (List vs Map) when in domain */}
          {activeDomain !== 'analytics' && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => setActiveView('feed')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'feed' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                List Feed
              </button>
              <button
                onClick={() => setActiveView('map')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'map' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Map
              </button>
            </div>
          )}

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 py-6 flex-1 z-10">
        
        {/* DOMAIN KPI BANNER */}
        {activeDomain !== 'analytics' && (
          <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full animate-ping ${activeDomain === 'garbage' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  {activeDomain === 'garbage' ? 'MCG Solid Waste Tracking' : 'Road Development Cell (RDC) & GMDA'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {activeDomain === 'garbage' ? 'Gurugram Garbage Black Spots & Waste Dumps' : 'Gurugram Potholes & Road Infra Hazards'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {activeDomain === 'garbage' 
                  ? 'Tracking illicit midnight dumping, secondary garbage bin overflow, and concessionaire accountability across all 36 wards.'
                  : 'Monitoring asphalt cave-ins, deep crater hazards, and civil repair contractor SLAs across master and internal sector roads.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="px-4 py-2.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tracked</span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">{totalInDomain}</span>
              </div>
              <div className="px-4 py-2.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Open Action</span>
                <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono mt-0.5 block">{openInDomain}</span>
              </div>
              <div className="px-4 py-2.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Resolution</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5 block">{rateInDomain}%</span>
              </div>
            </div>
          </div>
        )}

        {/* FEED VIEW (Garbage or Roads) */}
        {activeDomain !== 'analytics' && activeView === 'feed' && (
          <div className="space-y-5">
            
            {/* Filter Deck */}
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800/80 shadow-md backdrop-blur-md flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              
              {/* Search */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by sector, landmark, inspector, or contractor..."
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Severity & Status & Zone Selectors */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 focus:outline-none focus:border-slate-600"
                >
                  {currentSeverityOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>

                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 focus:outline-none focus:border-slate-600"
                >
                  <option value="all">All 6 MCG Zones</option>
                  {MCG_ZONES.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 focus:outline-none focus:border-slate-600"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="resolved">Verified Cleared</option>
                </select>
              </div>

            </div>

            {/* Incident Cards Grid */}
            {filteredReports.length === 0 ? (
              <div className="bg-slate-900/60 p-12 text-center rounded-3xl border border-slate-800">
                <p className="text-slate-400 text-sm">No civic hazards match your active filters.</p>
                <button
                  onClick={() => { setStatusFilter('all'); setSeverityFilter('all'); setZoneFilter('all'); setSearchQuery(''); }}
                  className="mt-3 text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

        {/* MAP VIEW */}
        {activeDomain !== 'analytics' && activeView === 'map' && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs flex items-center justify-between">
              <span className="font-bold text-slate-300">
                Showing {filteredReports.length} {activeDomain === 'garbage' ? 'Garbage Black Spots' : 'Road Craters & Potholes'}
              </span>
              <span className="text-slate-500">
                Pulsing reticle pins · Click to inspect attributed contractor & verify
              </span>
            </div>

            <CivicMap
              reports={filteredReports}
              selectedReport={selectedReport}
              onSelectReport={(rep) => setSelectedReport(rep)}
            />
          </div>
        )}

        {/* ANALYTICS VIEW */}
        {activeDomain === 'analytics' && (
          <AnalyticsView reports={reports} />
        )}

      </main>

      {/* Modals */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onUpvote={handleUpvote}
        onOpenVerify={(rep) => {
          setVerifyingReport(rep);
          setIsVerifyModalOpen(true);
        }}
        onOpenDispute={(rep) => {
          setDisputingReport(rep);
          setIsDisputeModalOpen(true);
        }}
        onSawThisToo={handleSawThisToo}
        userSawThis={selectedReport ? Boolean(seenReports[selectedReport.id]) : false}
      />

      <VerificationModal
        report={verifyingReport}
        isOpen={isVerifyModalOpen}
        onClose={() => {
          setIsVerifyModalOpen(false);
          setVerifyingReport(null);
        }}
        onSubmitVerification={handleCompleteVerification}
      />

      <DisputeModal
        report={disputingReport}
        isOpen={isDisputeModalOpen}
        onClose={() => {
          setIsDisputeModalOpen(false);
          setDisputingReport(null);
        }}
        onSubmitDispute={handleCompleteDispute}
      />

      <NewReportModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmitReport={handleAddReport}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
}
