import React, { useState } from 'react';
import { 
  X, Camera, MapPin, Upload, AlertCircle, CheckCircle2, 
  ArrowRight, ShieldCheck, RefreshCw 
} from 'lucide-react';

export default function VerificationModal({ report, isOpen, onClose, onSubmitVerification }) {
  const [step, setStep] = useState('distance'); // 'distance' | 'camera' | 'review'
  const [photoPreview, setPhotoPreview] = useState(null);
  const [verifierName, setVerifierName] = useState('');
  const [verifierRole, setVerifierRole] = useState('citizen'); // 'citizen' | 'rwa' | 'contractor'
  const [notes, setNotes] = useState('');
  const [gpsDistance, setGpsDistance] = useState(42); // Simulated realistic distance in meters

  if (!isOpen || !report) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setStep('review');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = () => {
    onSubmitVerification({
      reportId: report.id,
      cleanedImageUrl: photoPreview || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
      verifiedBy: verifierName || 'Verified Citizen Reporter',
      role: verifierRole,
      notes,
      verifiedAt: 'Just now',
      accuracyMeters: gpsDistance
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-extrabold text-slate-900 text-base">
                Verify Cleanup: {report.title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit ground proof photo to certify resolution in Ward {report.ward}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step 1: Distance & Geo-fence Check */}
        {step === 'distance' && (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3">
              <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">
                  Geo-Fence Proximity Verified
                </h4>
                <p className="text-xs text-emerald-800/90 mt-1">
                  You are within <strong>{gpsDistance} meters</strong> of the reported incident spot at <strong>{report.landmark}</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Reported Condition (Before):</span>
                <span className="font-semibold text-slate-800 block mt-1">{report.description}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  placeholder="e.g. Inspector Anil Sharma or Citizen Name"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verification Capacity *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'citizen', label: 'Local Resident' },
                    { id: 'rwa', label: 'RWA Executive' },
                    { id: 'contractor', label: 'MCG Contractor' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setVerifierRole(r.id)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                        verifierRole === r.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep('camera')}
              disabled={!verifierName.trim()}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <span>Next: Capture Cleaned Site Photo</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Step 2: Upload After-Photo */}
        {step === 'camera' && (
          <div className="p-6 space-y-5">
            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100/60 transition-colors">
              <Camera size={40} className="mx-auto text-emerald-600 mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">Take Verification Photo</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
                Capture the spot showing that garbage has been lifted or the pothole filled.
              </p>
              
              <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 active:scale-95 transition-all shadow-md">
                <Upload size={14} />
                <span>Upload Ground Photo</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                // Quick simulated photo if on laptop camera test
                setPhotoPreview('https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80');
                setStep('review');
              }}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 underline text-center block cursor-pointer"
            >
              Use demo verification sample photo
            </button>
          </div>
        )}

        {/* Step 3: Before / After Comparison */}
        {step === 'review' && (
          <div className="p-6 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Side-by-Side Verification Proof
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                  1. Before (Reported)
                </span>
                <div className="h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={report.imageUrl} alt="Before" className="w-full h-full object-cover" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                  2. After (Cleaned)
                </span>
                <div className="h-32 rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50 relative">
                  <img src={photoPreview} alt="After" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/60 text-emerald-300">
                    GPS STAMPED
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resolution Notes / Remarks
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 2 tipper trucks cleared commercial plastics; road surface cold-patched."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('camera')}
                className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={handleComplete}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/25"
              >
                <CheckCircle2 size={16} />
                <span>Submit & Close Complaint</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
