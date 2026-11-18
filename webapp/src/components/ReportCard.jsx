import React from 'react';
import { MapPin, AlertTriangle, Trash2, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

export default function ReportCard({ report, onSelect, onUpvote }) {
  const isGarbage = report.type === 'garbage';
  
  const statusBadge = {
    reported: { label: 'Reported', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    'in-progress': { label: 'In Action', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertTriangle },
    resolved: { label: 'Cleared', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 }
  }[report.status] || { label: report.status, bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: Clock };

  const StatusIcon = statusBadge.icon;

  return (
    <div 
      onClick={() => onSelect(report)}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col justify-between"
    >
      <div>
        {/* Card Header & Media */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          <img 
            src={report.imageUrl} 
            alt={report.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
              isGarbage ? 'bg-rose-500/90 text-white' : 'bg-amber-500/90 text-white'
            }`}>
              {isGarbage ? <Trash2 size={12} /> : <AlertTriangle size={12} />}
              {isGarbage ? 'Garbage Black Spot' : 'Pothole / Road Hazard'}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs backdrop-blur-md ${statusBadge.bg}`}>
              <StatusIcon size={12} />
              {statusBadge.label}
            </span>
          </div>

          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 font-mono bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            <span>MCG Ward {report.ward}</span>
            <span>{report.reportedAt}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 text-base group-hover:text-rose-600 transition-colors line-clamp-1">
            {report.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{report.landmark}, {report.sector}</span>
          </p>

          <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
            {report.description}
          </p>
        </div>
      </div>

      {/* Footer / Authority Attribution */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <div className="text-[11px] truncate pr-2">
          <span className="text-slate-400 block font-medium">Assigned Authority:</span>
          <span className="font-medium text-slate-700 truncate block">{report.officialAssigned}</span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpvote(report.id);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-rose-300 hover:text-rose-600 active:scale-95 text-xs font-semibold transition-all shadow-2xs"
            title="Upvote to escalate"
          >
            <ArrowUpRight size={13} className="text-rose-500" />
            <span>{report.upvotes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
