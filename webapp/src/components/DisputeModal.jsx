import React, { useState } from 'react';
import { X, AlertOctagon, Camera, Upload, ShieldAlert, ArrowRight } from 'lucide-react';

export default function DisputeModal({ report, isOpen, onClose, onSubmitDispute }) {
  const [reason, setReason] = useState('still_dirty'); // 'still_dirty' | 'not_garbage' | 'poor_patch' | 'wrong_location'
  const [description, setDescription] = useState('');
  const [counterPhoto, setCounterPhoto] = useState(null);

  if (!isOpen || !report) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCounterPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitDispute({
      reportId: report.id,
      reason,
      description,
      counterPhoto: counterPhoto || 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
      disputedAt: 'Just now'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/60">
          <div>
            <div className="flex items-center gap-2">
              <AlertOctagon size={18} className="text-rose-600" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Dispute Cleanup: {report.title}
              </h3>
            </div>
            <p className="text-xs text-rose-700 mt-0.5">
              Contest false resolution or report incomplete contractor action
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Why are you disputing this resolution? *
            </label>
            <div className="space-y-2">
              {[
                { id: 'still_dirty', label: 'Waste Still Present', desc: 'Garbage was only partly lifted or pushed to sidewalk.' },
                { id: 'poor_patch', label: 'Poor Quality Repair', desc: 'Pothole filled with loose gravel with no asphalt compaction.' },
                { id: 'not_garbage', label: 'Not a Garbage / Hazard Area', desc: 'Private property, authorized compost pit, or construction site.' }
              ].map(opt => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    reason === opt.id 
                      ? 'bg-rose-50/70 border-rose-300 shadow-xs' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="dispute_reason"
                    checked={reason === opt.id}
                    onChange={() => setReason(opt.id)}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{opt.label}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Details / Citizen Evidence *
            </label>
            <textarea
              required
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the actual ground reality so MCG audit team can penalize the contractor."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              Disputing will reopen this issue, strip the contractor's clearance badge, and notify the Joint Commissioner for Ward {report.ward}.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-600/20"
          >
            <AlertOctagon size={16} />
            <span>Submit Dispute & Reopen Complaint</span>
          </button>
        </form>

      </div>
    </div>
  );
}
