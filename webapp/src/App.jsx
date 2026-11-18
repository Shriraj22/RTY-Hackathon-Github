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
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_REPORTS, MCG_ZONES } from './data/gurugramData';
import ReportCard from './components/ReportCard';
import CivicMap from './components/CivicMap';
import NewReportModal from './components/NewReportModal';
import ReportDetailModal from './components/ReportDetailModal';
import AuthModal from './components/AuthModal';
import CiviQLogo from './components/CiviQLogo';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, signOut, isSupabaseConfigured } = useAuth();

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('margdarshak_reports', JSON.stringify(reports));
  }, [reports]);

  // Handlers
  const handleAddReport = (newReport) => {
    const reportWithUser = {
      ...newReport,
      reportedBy: user ? (user.user_metadata?.full_name || user.email) : 'Citizen Reporter'
    };
    setReports(prev => [reportWithUser, ...prev]);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 }
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20 md:pb-0">
      {/* Top Banner & Header - Fully Responsive */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <CiviQLogo size="md" />
            <div className="hidden xs:flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Gurugram
              </span>
              <span className="text-[9px] sm:text-[10px] bg-slate-100 font-mono text-slate-600 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                MCG 36 Wards
              </span>
            </div>
          </div>

          {/* User & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="max-w-[120px] truncate">{user.user_metadata?.full_name || user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="p-2 sm:px-3 sm:py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
              >
                <LogIn size={14} />
                <span>Citizen Sign In</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenReportModal}
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-sm shadow-rose-600/20 transition-all cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span className="hidden xs:inline">Report Hazard</span>
              <span className="xs:hidden">Report</span>
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 border-t border-slate-100 flex items-center gap-4 sm:gap-8 text-xs font-semibold text-slate-600 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('feed')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'feed' ? 'border-rose-600 text-rose-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ListFilter size={14} />
            Feed & List ({filteredReports.length})
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'map' ? 'border-rose-600 text-rose-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Map size={14} />
            Google Maps View
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'analytics' ? 'border-rose-600 text-rose-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BarChart3 size={14} />
            MCG Scorecard & Wards
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1">
        
        {/* Global Civic Stats Summary */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Tracked</span>
            <span className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-0.5 block">{totalReports} Issues</span>
            <span className="text-[10px] text-slate-500">Across 6 MCG Zones</span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-rose-500 uppercase tracking-wider block flex items-center gap-1">
              <Trash2 size={12} /> Garbage Spots
            </span>
            <span className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-0.5 block">{garbageCount}</span>
            <span className="text-[10px] text-slate-500">Illegal dump points</span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 uppercase tracking-wider block flex items-center gap-1">
              <AlertTriangle size={12} /> Potholes & Craters
            </span>
            <span className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-0.5 block">{potholeCount}</span>
            <span className="text-[10px] text-slate-500">Road infra hazards</span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-wider block flex items-center gap-1">
              <ShieldCheck size={12} /> MCG Action Rate
            </span>
            <span className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-0.5 block">{resolutionRate}%</span>
            <span className="text-[10px] text-emerald-600 font-medium">{resolvedCount} cleared so far</span>
          </div>
        </section>

        {/* FEED TAB */}
        {activeTab === 'feed' && (
          <div className="space-y-4 sm:space-y-5">
            {/* Filter controls */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by sector, landmark, or official..."
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Category Pills & Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all ${
                      typeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setTypeFilter('garbage')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all ${
                      typeFilter === 'garbage' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Garbage
                  </button>
                  <button
                    onClick={() => setTypeFilter('pothole')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all ${
                      typeFilter === 'pothole' ? 'bg-white text-amber-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Potholes
                  </button>
                </div>

                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="flex-1 sm:flex-initial px-3 py-2 bg-slate-100 border border-transparent rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-slate-300"
                >
                  <option value="all">All MCG Zones</option>
                  {MCG_ZONES.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 sm:flex-initial px-3 py-2 bg-slate-100 border border-transparent rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-slate-300"
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
                  className="mt-3 text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

        {/* MAP TAB */}
        {activeTab === 'map' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
              <span className="font-semibold text-slate-800">
                Displaying {filteredReports.length} geocoded civic hazards across Gurugram
              </span>
              <span className="text-slate-500">
                Google Maps layout · Click any pin to inspect MCG officials & amplify
              </span>
            </div>

            <div className="h-[500px] sm:h-[650px] w-full">
              <CivicMap
                reports={filteredReports}
                selectedReport={selectedReport}
                onSelectReport={(rep) => setSelectedReport(rep)}
              />
            </div>
          </div>
        )}

        {/* ANALYTICS & WARD LEADERBOARD TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Municipal Corporation of Gurugram (MCG) Accountability Scorecard
                  </h3>
                  <p className="text-xs text-slate-500">
                    Resolution metric by administrative zone and Joint Commissioner charge
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full self-start sm:self-auto border border-rose-100">
                  Public Scorecard
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MCG_ZONES.map((zone) => {
                  const zoneReports = reports.filter(r => r.zoneId === zone.id);
                  const zoneResolved = zoneReports.filter(r => r.status === 'resolved').length;
                  const rate = zoneReports.length ? Math.round((zoneResolved / zoneReports.length) * 100) : 0;

                  return (
                    <div key={zone.id} className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">{zone.name}</h4>
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                            {zone.cluster} · Wards: {zone.wards.join(', ')}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shrink-0">
                          {rate}% cleared
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 h-2 rounded-full mt-3.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${rate}%` }}
                        />
                      </div>

                      <div className="mt-3.5 pt-3.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="text-slate-400 block font-medium">Joint Commissioner:</span>
                          <span className="font-semibold text-slate-700">{zone.jointCommissioner}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block font-medium">Open Issues:</span>
                          <span className="font-bold text-rose-600">{zoneReports.length - zoneResolved}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Citizen Callout */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base">Notice a spot in your sector?</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-lg">
                  Every submission is logged under the respective MCG Ward official and shared with resident welfare associations (RWAs).
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenReportModal}
                className="shrink-0 bg-white text-slate-900 font-bold px-5 py-2.5 rounded-full text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Log New Hazard Now
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden flex items-center justify-around py-2 px-2">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            activeTab === 'feed' ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          <ListFilter size={18} />
          <span>Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            activeTab === 'map' ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          <Map size={18} />
          <span>Map</span>
        </button>

        {/* Center Floating Plus */}
        <button
          onClick={handleOpenReportModal}
          className="w-12 h-12 -mt-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 active:scale-95"
          aria-label="Report"
        >
          <Plus size={22} />
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            activeTab === 'analytics' ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          <BarChart3 size={18} />
          <span>Scorecard</span>
        </button>

        {user ? (
          <button
            onClick={signOut}
            className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-500"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-500"
          >
            <LogIn size={18} />
            <span>Login</span>
          </button>
        )}
      </nav>

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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
