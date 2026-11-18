import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  AlertTriangle, Trash2, CheckCircle2, Clock, ShieldAlert, 
  ArrowUpRight, Download, HelpCircle, Flame, Building, TrendingUp 
} from 'lucide-react';
import { MCG_ZONES, WARD_PERFORMANCE_METRICS, REPEAT_HOTSPOTS } from '../data/gurugramData';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

export default function AnalyticsView({ reports }) {
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  // Aggregated data calculations
  const total = reports.length || 1;
  const resolved = reports.filter(r => r.status === 'resolved').length;
  const open = total - resolved;
  const resolutionPct = Math.round((resolved / total) * 100);

  // Stale calculation metrics
  const totalStale7d = WARD_PERFORMANCE_METRICS.reduce((acc, w) => acc + w.stale7d, 0);
  const totalStale14d = WARD_PERFORMANCE_METRICS.reduce((acc, w) => acc + w.stale14d, 0);
  const totalStale30d = WARD_PERFORMANCE_METRICS.reduce((acc, w) => acc + w.stale30d, 0);

  // Zone chart data
  const zoneChartData = MCG_ZONES.map(z => {
    const zoneReps = reports.filter(r => r.zoneId === z.id);
    const zResolved = zoneReps.filter(r => r.status === 'resolved').length;
    return {
      name: z.name.split(' ')[0] + ' ' + z.name.split(' ')[1],
      total: zoneReps.length,
      open: zoneReps.length - zResolved,
      resolved: zResolved,
      rate: zoneReps.length ? Math.round((zResolved / zoneReps.length) * 100) : 0
    };
  });

  // Type Breakdown Data
  const typePieData = [
    { name: 'Garbage Spots', value: reports.filter(r => r.type === 'garbage').length, color: '#ef4444' },
    { name: 'Road Potholes', value: reports.filter(r => r.type === 'pothole').length, color: '#f59e0b' }
  ];

  const handleDownloadCSV = () => {
    const headers = "ID,Title,Type,Severity,Status,Landmark,Sector,Ward,Assigned Official,Upvotes\n";
    const rows = reports.map(r => 
      `"${r.id}","${r.title}","${r.type}","${r.severity}","${r.status}","${r.landmark}","${r.sector}","${r.ward}","${r.officialAssigned}","${r.upvotes}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CiviQ_Gurugram_Civic_Data_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/30">
                LIVE MCG AUDIT & SCORECARD
              </span>
              <span className="text-xs text-slate-400">All 36 Municipal Wards</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              Gurugram Civic Health & Backlog Analytics
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Transparent, public tracking of garbage clearance backlogs and pothole repairs across all 6 administrative zones, attributed directly to ward inspectors and MLAs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Download size={14} />
              <span>Download Open Data (.CSV)</span>
            </button>
          </div>
        </div>

        {/* Key KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Total Reports</span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-0.5 block">{total}</span>
            <span className="text-[10px] text-slate-400">Across Gurugram</span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-rose-400 block font-semibold">Open Backlog</span>
            <span className="text-2xl sm:text-3xl font-black text-rose-400 mt-0.5 block">{open}</span>
            <span className="text-[10px] text-rose-300/80">Pending MCG Action</span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold">Cleared / Fixed</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5 block">{resolved}</span>
            <span className="text-[10px] text-emerald-400/80">{resolutionPct}% Resolution Rate</span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-amber-400 block font-semibold">Avg. Resolution</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5 block">54 hrs</span>
            <span className="text-[10px] text-slate-400">Target SLA: &lt; 48 hrs</span>
          </div>
        </div>
      </div>

      {/* 2. Stale Backlog Tier Strip (Reference-App Feature) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              Stale Backlog: Reports Left Waiting
            </h3>
            <p className="text-xs text-slate-500">
              Civic hazards categorized by how long they have remained unaddressed by MCG.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200/60 self-start sm:self-auto">
            Escalation Aging
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 py-4 border-y border-slate-100 text-center">
          <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">{totalStale7d}</span>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mt-1">7+ Days Waiting</span>
          </div>
          <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">{totalStale14d}</span>
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block mt-1">14+ Days Ignored</span>
          </div>
          <div className="p-3 bg-red-100/50 rounded-2xl border border-red-200">
            <span className="text-2xl sm:text-3xl font-black text-red-950 font-mono">{totalStale30d}</span>
            <span className="text-[10px] font-bold text-red-900 uppercase tracking-wider block mt-1">30+ Days Critical</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
          * Reports exceeding 7 days without field-action are automatically submitted to the MCG Municipal Commissioner's weekly grievance review agenda.
        </p>
      </div>

      {/* 3. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Zone Resolution Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              MCG Zone Clearance Volume
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Open vs. Cleared complaints by administrative zone
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="open" fill="#ef4444" name="Open Hazards" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" fill="#10b981" name="Cleared" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs font-semibold pt-4 border-t border-slate-100 mt-2">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 bg-rose-500 rounded-sm"></span> Open Hazards
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Cleared by MCG
            </span>
          </div>
        </div>

        {/* Hazard Category Split */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Hazard Distribution by Category
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ratio of illegal waste black spots vs. road & asphalt hazards
            </p>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs font-semibold pt-4 border-t border-slate-100 mt-2">
            {typePieData.map(item => (
              <span key={item.name} className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                {item.name}: {item.value} ({Math.round((item.value / total) * 100)}%)
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Repeat Hot Spots Section (Reference-App Core Component) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Flame size={18} className="text-rose-500" />
              Repeat Civic Hot Spots
            </h3>
            <p className="text-xs text-slate-500">
              Locations repeatedly reported by citizen commuters within 50m radius in the past 30 days.
            </p>
          </div>
          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            High Recurrence
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {REPEAT_HOTSPOTS.map((spot, idx) => (
            <div key={spot.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors px-2 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-black text-sm flex items-center justify-center shrink-0">
                  #{idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{spot.location}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Ward {spot.ward}</span>
                    <span>•</span>
                    <span className="text-rose-600 font-semibold">{spot.category}</span>
                    <span>•</span>
                    <span>Peak: {spot.worstTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <span className="font-mono font-black text-slate-900 text-base block">{spot.count} Reports</span>
                  <span className="text-[10px] text-rose-600 font-bold uppercase">{spot.unresolved} Unresolved</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Detailed Ward Leaderboard with MLA Accountability */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Building size={18} className="text-blue-600" />
              MCG Ward Leaderboard & MLA Attribution
            </h3>
            <p className="text-xs text-slate-500">
              Clearance metrics sorted by reporting density and citizen activity
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Ward & Locality</th>
                <th className="pb-3">Elected MLA</th>
                <th className="pb-3 text-center">Reports</th>
                <th className="pb-3 text-center">Open Backlog</th>
                <th className="pb-3 text-center">Cleared</th>
                <th className="pb-3 text-right pr-2">Clearance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {WARD_PERFORMANCE_METRICS.map(w => (
                <tr key={w.ward} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="font-bold text-slate-900 text-sm">Ward {w.ward}</div>
                    <div className="text-slate-500 text-[11px]">{w.name}</div>
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-slate-800">{w.mla}</div>
                    <div className="text-[10px] text-blue-600 font-medium">Haryana Vidhan Sabha</div>
                  </td>
                  <td className="py-3 text-center font-mono font-bold text-slate-800">{w.totalReports}</td>
                  <td className="py-3 text-center font-mono font-bold text-rose-600">{w.open}</td>
                  <td className="py-3 text-center font-mono font-bold text-emerald-600">{w.resolved}</td>
                  <td className="py-3 text-right pr-2">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${w.rate}%` }}
                        />
                      </div>
                      <span className="font-mono font-extrabold text-slate-900 text-xs">{w.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Modal */}
      <div className="text-center pt-2">
        <button
          onClick={() => setMethodologyOpen(!methodologyOpen)}
          className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 cursor-pointer font-medium"
        >
          {methodologyOpen ? 'Hide Methodology' : 'See Audit Methodology & SLA Standards'}
        </button>

        {methodologyOpen && (
          <div className="mt-4 p-5 max-w-2xl mx-auto rounded-2xl bg-slate-100 text-left text-xs text-slate-600 leading-relaxed border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">CiviQ Audit & Scoring Methodology</h4>
            <p className="mb-2">
              1. <strong>Spatial Clustering</strong>: Complaints within ~50 meters of each other are deduplicated and categorized into Repeat Hot Spots to avoid artificial inflation.
            </p>
            <p className="mb-2">
              2. <strong>MCG SLA Escalation</strong>: MCG citizen charter mandates solid waste clearance within 24 hours and pothole patching within 48 hours. Items waiting &gt; 7 days are categorized into Stale Backlog tiers.
            </p>
            <p>
              3. <strong>Open Data Integrity</strong>: All complaints are public record, timestamped, GPS-verified, and exportable via standard CSV formats for citizen RWAs and journalists.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
