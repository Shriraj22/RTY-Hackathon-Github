import React from 'react';
import { MapPin, AlertTriangle, Trash2, ArrowUpRight, CheckCircle2, Clock, Wrench, HardHat } from 'lucide-react';

export default function ReportCard({ report, onSelect, onUpvote }) {
  const isGarbage = report.type === 'garbage';
  
  const statusBadge = {
    reported: { label: 'Reported', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Clock },
    'in-progress': { label: 'In Action', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: AlertTriangle },
    resolved: { label: 'Cleared', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 }
  }[report.status] || { label: report.status, bg: 'bg-slate-500/10 text-slate-300 border-slate-500/30', icon: Clock };

  const StatusIcon = statusBadge.icon;

  // Domain-specific severity labels
  const severityBadge = isGarbage ? {
    small: { text: 'Minor Litter', color: 'bg-amber-400/20 text-amber-300 border-amber-400/30' },
    medium: { text: 'Moderate Heap', color: 'bg-orange-400/20 text-orange-300 border-orange-400/30' },
    large: { text: 'Severe Obstruction', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    massive: { text: 'Critical Black Spot', color: 'bg-red-600/30 text-red-300 border-red-500/40' }
  }[report.severity] : {
    small: { text: 'Minor Crack', color: 'bg-amber-400/20 text-amber-300 border-amber-400/30' },
    medium: { text: '4-inch Crater', color: 'bg-orange-400/20 text-orange-300 border-orange-400/30' },
    large: { text: 'Deep Rim Hazard', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    massive: { text: 'Lethal Road Cave-in', color: 'bg-red-600/30 text-red-300 border-red-500/40' }
  }[report.severity];

  return (
    <div 
      onClick={() => onSelect(report)}
      className="bg-slate-900/90 rounded-3xl border border-slate-800/80 shadow-lg hover:shadow-2xl hover:border-slate-700/90 transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col justify-between backdrop-blur-md"
    >
      <div>
        {/* Card Media Header */}
        <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
          <img 
            src={report.imageUrl} 
            alt={report.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/40" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-md ${
              isGarbage ? 'bg-rose-600/90 text-white' : 'bg-amber-500/90 text-slate-950'
            }`}>
              {isGarbage ? <Trash2 size={13} /> : <AlertTriangle size={13} />}
              {isGarbage ? 'Solid Waste' : 'Road Infra'}
            </span>

            {severityBadge && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md font-mono ${severityBadge.color}`}>
                {severityBadge.text}
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${statusBadge.bg}`}>
              <StatusIcon size={12} />
              {statusBadge.label}
            </span>
          </div>

          {/* Bottom Overlay Info */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 font-mono bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
            <span>MCG Ward {report.ward}</span>
            <span>{report.reportedAt}</span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 sm:p-5">
          <h3 className="font-extrabold text-white text-base group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
            {report.title}
          </h3>
          
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <MapPin size={13} className="text-rose-500 shrink-0" />
            <span className="truncate">{report.landmark}, {report.sector}</span>
          </p>

          <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
            {report.description}
          </p>
        </div>
      </div>

      {/* Footer / Contractor & MCG Attribution */}
      <div className="px-4 py-3 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="text-[11px] truncate pr-2">
          <span className="text-slate-400 block font-semibold text-[10px] uppercase flex items-center gap-1">
            <HardHat size={11} className="text-amber-400" /> Contracted Agency:
          </span>
          <span className="font-bold text-slate-200 truncate block mt-0.5">
            {report.contractorAssigned || report.officialAssigned}
          </span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpvote(report.id);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white active:scale-95 text-xs font-bold transition-all shadow-md"
            title="Upvote priority"
          >
            <ArrowUpRight size={13} className="text-rose-400" />
            <span>{report.upvotes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
