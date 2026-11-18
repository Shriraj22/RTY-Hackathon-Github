import React, { useState } from 'react';
import { 
  X, MapPin, Share2, Phone, Mail, CheckCircle2, ArrowUpRight, 
  Copy, ExternalLink, ShieldAlert, AlertOctagon, Eye, Clock, MessageSquare 
} from 'lucide-react';
import { MCG_ZONES } from '../data/gurugramData';

export default function ReportDetailModal({ 
  report, 
  onClose, 
  onUpvote, 
  onOpenVerify, 
  onOpenDispute,
  onSawThisToo,
  userSawThis
}) {
  const [copied, setCopied] = useState(false);
  const [activePhotoTab, setActivePhotoTab] = useState('before'); // 'before' | 'after'

  if (!report) return null;

  const zone = MCG_ZONES.find(z => z.id === report.zoneId) || MCG_ZONES[0];
  const isGarbage = report.type === 'garbage';
  const isResolved = report.status === 'resolved';

  const shareText = `⚠️ Civic Hazard in Gurugram: "${report.title}" at ${report.landmark}, ${report.sector} (MCG Ward ${report.ward}). CC: @mcg_gurgaon @DC_Gurugram. Public tracking ID: ${report.id}`;

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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Photo Header with Before/After Switcher if resolved */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900">
          <img 
            src={activePhotoTab === 'after' && report.cleanedImageUrl ? report.cleanedImageUrl : report.imageUrl} 
            alt={report.title} 
            className="w-full h-full object-cover transition-all duration-300" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          
          <button 
            type="button" 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Before / After Photo Switcher Pill (if verified) */}
          {report.cleanedImageUrl && (
            <div className="absolute top-4 left-4 z-20 flex p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/20">
              <button
                onClick={() => setActivePhotoTab('before')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activePhotoTab === 'before' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                1. Before (Reported)
              </button>
              <button
                onClick={() => setActivePhotoTab('after')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activePhotoTab === 'after' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                2. After (Cleaned)
              </button>
            </div>
          )}

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isGarbage ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {isGarbage ? 'Garbage Black Spot' : 'Road Hazard / Pothole'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isResolved ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-900'
              }`}>
                {isResolved ? '✅ Verified Cleared' : '⏳ Action Pending'}
              </span>
              {report.disputed && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white flex items-center gap-1">
                  <AlertOctagon size={11} /> Disputed by Citizens
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm leading-snug">
              {report.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pb-4 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-rose-500 shrink-0" />
              <span className="font-semibold text-slate-800">{report.landmark}, {report.sector}</span>
            </div>
            <div className="font-mono bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-bold text-[11px]">
              ID: {report.id}
            </div>
          </div>

          {/* Social Proof ("I Saw This Too" - Reference Core Feature) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-blue-600" />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">
                  {report.upvotes || 1} citizens confirmed this spot
                </span>
                <span className="text-slate-500 text-[11px]">
                  Higher witness volume pushes this spot to the top of MCG daily sweeps
                </span>
              </div>
            </div>

            <button
              onClick={() => onSawThisToo(report.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                userSawThis
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {userSawThis ? '✓ I Saw This Too' : '+ I Saw This Too'}
            </button>
          </div>

          {/* Problem Narrative */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Incident Context & Citizen Report
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              {report.description}
            </p>
          </div>

          {/* Resolution Audit Card (If verified) */}
          {report.verifiedBy && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Resolution Verification Certificate
                </span>
                <span className="font-mono text-emerald-800 text-[10px]">
                  {report.verifiedAt || 'Verified today'}
                </span>
              </div>
              <div className="text-emerald-950 font-semibold">
                Inspected on-ground by: <strong>{report.verifiedBy}</strong> ({report.role || 'Citizen Auditor'})
              </div>
              {report.notes && (
                <p className="text-emerald-800 mt-1 italic">
                  "{report.notes}"
                </p>
              )}
            </div>
          )}

          {/* MCG Administrative Accountability Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-100/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-blue-600" />
                MCG Municipal Jurisdiction
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/60 px-2.5 py-0.5 rounded-full">
                Ward {report.ward} · {zone.name.split('(')[0]}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Field Officer in Charge</span>
                <span className="text-slate-800 font-semibold block mt-0.5">{report.officialAssigned}</span>
                <span className="text-slate-500 flex items-center gap-1 mt-1 text-[11px]">
                  <Phone size={11} /> {report.officialPhone}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Joint Commissioner</span>
                <span className="text-slate-800 font-semibold block mt-0.5">{zone.jointCommissioner}</span>
                <span className="text-slate-500 flex items-center gap-1 mt-1 text-[11px]">
                  <Mail size={11} /> {zone.email}
                </span>
              </div>
            </div>
          </div>

          {/* Core Action Pipeline: Verify vs Dispute */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {!isResolved ? (
              <button
                type="button"
                onClick={() => onOpenVerify(report)}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all active:scale-95"
              >
                <CheckCircle2 size={16} />
                <span>Verify Cleanup & Upload Proof Photo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenDispute(report)}
                className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <AlertOctagon size={16} />
                <span>Dispute Resolution (Not Cleaned / Poor Patch)</span>
              </button>
            )}
          </div>

          {/* Social Escalation / Pressure Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
            <p className="text-xs font-bold text-slate-700 mb-2.5">
              Escalate to MCG & Gurugram Administration
            </p>
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleShareTwitter}
                className="px-3.5 py-2 rounded-xl bg-black text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-transform active:scale-95 shadow-xs cursor-pointer"
              >
                Post on X (Twitter)
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-3.5 py-2 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba5a] text-xs font-semibold flex items-center gap-1.5 transition-transform active:scale-95 shadow-xs cursor-pointer"
              >
                Share on WhatsApp
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Copy size={13} />
                {copied ? 'Copied Link' : 'Copy Tracking Link'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
