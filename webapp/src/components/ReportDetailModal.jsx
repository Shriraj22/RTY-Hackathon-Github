import React, { useState } from 'react';
import { X, MapPin, Share2, Phone, Mail, CheckCircle, ArrowUpRight, Copy, ExternalLink, ShieldAlert } from 'lucide-react';
import { MCG_ZONES } from '../data/gurugramData';

export default function ReportDetailModal({ report, onClose, onUpvote, onToggleResolve }) {
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const zone = MCG_ZONES.find(z => z.id === report.zoneId) || MCG_ZONES[0];
  const isGarbage = report.type === 'garbage';
  const isResolved = report.status === 'resolved';

  const shareText = `⚠️ Civic Issue in Gurugram: "${report.title}" at ${report.landmark}, ${report.sector} (MCG Ward ${report.ward}). CC: @mcg_gurgaon @DC_Gurugram. Public complaint: ${report.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Modal Image Header */}
        <div className="relative h-64 w-full bg-slate-900">
          <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <button 
            type="button" 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center backdrop-blur-md transition-colors"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isGarbage ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {isGarbage ? 'Garbage Blackspot' : 'Pothole Issue'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isResolved ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-900'
              }`}>
                {isResolved ? 'Resolved' : 'Active Complaint'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white drop-shadow-sm leading-snug">
              {report.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pb-4 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-rose-500" />
              <span className="font-medium text-slate-800">{report.landmark}, {report.sector}</span>
            </div>
            <div className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              ID: {report.id}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Incident Report</h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
              {report.description}
            </p>
          </div>

          {/* MCG Official Accountability Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-100/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-blue-600" />
                MCG Municipal Accountability
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full">
                Ward {report.ward} · {zone.cluster}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Field Officer</span>
                <span className="text-slate-800 font-semibold block mt-0.5">{report.officialAssigned}</span>
                <span className="text-slate-500 flex items-center gap-1 mt-1 text-[11px]">
                  <Phone size={11} /> {report.officialPhone}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Joint Commissioner</span>
                <span className="text-slate-800 font-semibold block mt-0.5">{zone.jointCommissioner}</span>
                <span className="text-slate-500 flex items-center gap-1 mt-1 text-[11px]">
                  <Mail size={11} /> {zone.email}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onUpvote(report.id)}
              className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <ArrowUpRight size={15} className="text-rose-400" />
              Upvote Priority ({report.upvotes})
            </button>

            <button
              type="button"
              onClick={() => onToggleResolve(report.id)}
              className={`w-full sm:w-auto flex-1 py-3 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all border ${
                isResolved
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
              }`}
            >
              <CheckCircle size={15} />
              {isResolved ? 'Mark as Reopened' : 'Mark as Cleared / Fixed'}
            </button>
          </div>

          {/* Social Amplification / Pressure Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
            <p className="text-xs font-semibold text-slate-700 mb-2.5">
              Escalate to MCG & Ward Officials on Social Media
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleShareTwitter}
                className="px-3.5 py-2 rounded-xl bg-black text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-transform active:scale-95 shadow-xs"
              >
                Post on X (Twitter)
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-3.5 py-2 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba5a] text-xs font-semibold flex items-center gap-1.5 transition-transform active:scale-95 shadow-xs"
              >
                Share on WhatsApp
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Copy size={13} />
                {copied ? 'Copied!' : 'Copy Summary'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
