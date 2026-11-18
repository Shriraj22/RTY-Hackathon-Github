import React, { useState } from 'react';
import { 
  Camera, MapPin, Upload, X, AlertTriangle, Trash2, Check, 
  ArrowRight, ArrowLeft, Sparkles, AlertCircle 
} from 'lucide-react';
import { MCG_ZONES, GURUGRAM_SECTORS } from '../data/gurugramData';

// Severity Options with Reference Visual Hierarchy
const SEVERITY_LEVELS = [
  { id: 'small', label: 'Minor Hazard', desc: 'Loose litter, a few bags, or minor surface cracks (< 1 sq meter)', badge: 'Low' },
  { id: 'medium', label: 'Moderate Heap', desc: 'Roughly size of an auto-rickshaw or 4-6 inch potholes (1 - 5 sq meters)', badge: 'Moderate' },
  { id: 'large', label: 'Severe Obstruction', desc: 'Spilling into roadway or blocking pedestrian footpath completely (5 - 20 sq meters)', badge: 'High' },
  { id: 'massive', label: 'Critical Black Spot', desc: 'Vacant plot dump or deep multi-car crater cave-in (20+ sq meters)', badge: 'Critical' }
];

// Waste / Infra Hazard Type Options
const WASTE_TYPES = [
  { id: 'household', label: 'Household Kitchen & Plastic', desc: 'Food waste, packaging bags, single-use containers' },
  { id: 'construction', label: 'C&D Debris (Malba)', desc: 'Bricks, concrete chunks, plaster, tiles dumped illicitly' },
  { id: 'road_crater', label: 'Road Crater / Pothole', desc: 'Broken bitumen, sunken asphalt, exposed manhole ring' },
  { id: 'commercial', label: 'Commercial Market Dump', desc: 'Hotel waste, fruit/vegetable mandis, cardboard scrap' },
  { id: 'sewage_leak', label: 'Sewage / Drain Overflow', desc: 'Stagnant wastewater pooling into street and eroding asphalt' }
];

export default function NewReportModal({ isOpen, onClose, onSubmitReport }) {
  const [step, setStep] = useState(1); // 1: Photo & Category | 2: Severity | 3: Specific Hazard | 4: Location & Submit

  const [issueType, setIssueType] = useState('garbage');
  const [severity, setSeverity] = useState('medium');
  const [wasteType, setWasteType] = useState('household');
  const [title, setTitle] = useState('');
  const [selectedSector, setSelectedSector] = useState(GURUGRAM_SECTORS[0].sector);
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState('https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80');

  if (!isOpen) return null;

  const currentSectorData = GURUGRAM_SECTORS.find(s => s.sector === selectedSector) || GURUGRAM_SECTORS[0];
  const assignedZone = MCG_ZONES.find(z => z.id === currentSectorData.zoneId);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !landmark.trim()) return;

    const baseCoords = currentSectorData.defaultCoords;
    const jittered = [
      baseCoords[0] + (Math.random() - 0.5) * 0.005,
      baseCoords[1] + (Math.random() - 0.5) * 0.005
    ];

    const newReport = {
      id: `GGN-2026-W${String(currentSectorData.ward).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      title,
      type: issueType,
      severity,
      wasteType,
      status: 'reported',
      landmark,
      sector: selectedSector,
      ward: currentSectorData.ward,
      zoneId: currentSectorData.zoneId,
      coordinates: jittered,
      description: description || `Civic grievance filed via CiviQ citizen audit near ${landmark}, ${selectedSector}. Immediate MCG field intervention requested.`,
      reportedAt: 'Just now',
      upvotes: 1,
      officialAssigned: issueType === 'garbage' 
        ? `Ward ${currentSectorData.ward} Sanitary Inspector` 
        : `Executive Engineer (Roads), MCG ${assignedZone?.name.split('(')[0]}`,
      officialPhone: assignedZone?.contactPhone || '+91 124 2370601',
      escalatedTo: `${assignedZone?.jointCommissioner} (${assignedZone?.cluster})`,
      imageUrl: imagePreview
    };

    onSubmitReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Step Progress Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Step {step} of 4
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">
                Report Civic Hazard
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mapped directly to MCG Ward {currentSectorData.ward} Jurisdictional Officials
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* STEP 1: Photo & Category */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Hazard Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIssueType('garbage')}
                  className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border-2 transition-all font-bold text-xs sm:text-sm cursor-pointer ${
                    issueType === 'garbage'
                      ? 'border-rose-500 bg-rose-50/50 text-rose-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Trash2 size={18} className={issueType === 'garbage' ? 'text-rose-500' : 'text-slate-400'} />
                  Garbage Dump
                </button>

                <button
                  type="button"
                  onClick={() => setIssueType('pothole')}
                  className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border-2 transition-all font-bold text-xs sm:text-sm cursor-pointer ${
                    issueType === 'pothole'
                      ? 'border-amber-500 bg-amber-50/50 text-amber-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <AlertTriangle size={18} className={issueType === 'pothole' ? 'text-amber-500' : 'text-slate-400'} />
                  Pothole / Road Cave-in
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Photo Evidence (GPS Locked)
              </label>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-44 flex items-center justify-center">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <label className="cursor-pointer bg-white text-slate-800 px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-2">
                    <Upload size={14} />
                    Choose Custom Photo
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-emerald-300 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  GPS: 28.4595° N, 77.0266° E (Gurugram)
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <span>Continue: Rate Hazard Severity</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* STEP 2: How Bad Is It? (Severity) */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">
                How bad is it?
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Pick the closest physical footprint to prioritize contractor dispatch.
              </p>
            </div>

            <div className="space-y-2.5">
              {SEVERITY_LEVELS.map(sev => (
                <div
                  key={sev.id}
                  onClick={() => setSeverity(sev.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    severity === sev.id
                      ? 'border-rose-500 bg-rose-50/40 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{sev.label}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      sev.badge === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {sev.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sev.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Continue: Type of Waste</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: What Kind of Hazard / Waste? */}
        {step === 3 && (
          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">
                What kind of hazard or waste?
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Helps route between Sanitary Teams, Road JCBs, or C&D Enforcement.
              </p>
            </div>

            <div className="space-y-2">
              {WASTE_TYPES.map(wt => (
                <div
                  key={wt.id}
                  onClick={() => setWasteType(wt.id)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    wasteType === wt.id
                      ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs text-slate-900 block">{wt.label}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{wt.desc}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Continue: Address & Landmark</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Location, Landmark & Final MCG Routing */}
        {step === 4 && (
          <form onSubmit={handleFinalSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Summary Headline *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken pavement & open dumping near main gate"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gurugram Sector *
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                >
                  {GURUGRAM_SECTORS.map((s) => (
                    <option key={s.sector} value={s.sector}>
                      {s.sector} (Ward {s.ward})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nearest Landmark / Street *
                </label>
                <input
                  type="text"
                  required
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Pillar 42 / Huda Market"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Official MCG Routing Alert Card */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-2xl text-xs">
              <span className="font-bold text-blue-950 block">
                Jurisdictional Assignment: {assignedZone?.name}
              </span>
              <span className="text-blue-800 text-[11px] block mt-0.5">
                Ward {currentSectorData.ward} · Joint Commissioner: {assignedZone?.jointCommissioner}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Observations (Optional)
              </label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention traffic risk, school zone, foul odor, or accident hazards..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-600/25"
              >
                <Sparkles size={16} />
                <span>Publish Report to MCG Map</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
