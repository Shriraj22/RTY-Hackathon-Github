import React, { useState } from 'react';
import { Camera, MapPin, Upload, X, AlertTriangle, Trash2, Check, Sparkles } from 'lucide-react';
import { MCG_ZONES, GURUGRAM_SECTORS } from '../data/gurugramData';

export default function NewReportModal({ isOpen, onClose, onSubmitReport }) {
  const [issueType, setIssueType] = useState('garbage');
  const [severity, setSeverity] = useState('critical');
  const [title, setTitle] = useState('');
  const [selectedSector, setSelectedSector] = useState(GURUGRAM_SECTORS[0].sector);
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState('https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80');
  const [isGpsStamped, setIsGpsStamped] = useState(true);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !landmark.trim()) return;

    // Small jitter to simulate real geolocation within the sector
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
      status: 'reported',
      landmark,
      sector: selectedSector,
      ward: currentSectorData.ward,
      zoneId: currentSectorData.zoneId,
      coordinates: jittered,
      description: description || `Civic grievance filed via citizen portal near ${landmark}, ${selectedSector}. Immediate MCG intervention required.`,
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              Report Civic Hazard in Gurugram
            </h2>
            <p className="text-xs text-slate-500">Takes under 30 seconds · Automatically routed to MCG Zone officials</p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Issue Category Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Issue Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIssueType('garbage')}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border-2 transition-all font-semibold text-sm ${
                  issueType === 'garbage'
                    ? 'border-rose-500 bg-rose-50/50 text-rose-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Trash2 size={18} className={issueType === 'garbage' ? 'text-rose-500' : 'text-slate-400'} />
                Garbage Black Spot
              </button>

              <button
                type="button"
                onClick={() => setIssueType('pothole')}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border-2 transition-all font-semibold text-sm ${
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

          {/* Photo Preview & Geo-stamp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Photo Evidence (GPS Stamped)
            </label>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-40 flex items-center justify-center">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <label className="cursor-pointer bg-white/90 hover:bg-white text-slate-800 px-4 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2">
                  <Upload size={14} />
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              {isGpsStamped && (
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-emerald-300 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  GPS: 28.4595° N, 77.0266° E (Gurugram)
                </div>
              )}
            </div>
          </div>

          {/* Title & Landmark */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Headline / Problem Summary *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={issueType === 'garbage' ? 'e.g. Unattended dump near market gate' : 'e.g. 8-inch deep crater on main road'}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gurugram Sector / Area *
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
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
                  Nearest Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Pillar 52 / Metro gate"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* MCG Authority Preview Banner */}
          <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-sm font-bold">
              MCG
            </div>
            <div className="text-xs">
              <span className="font-semibold text-blue-900 block">
                Auto-Attributed to: {assignedZone?.name}
              </span>
              <span className="text-blue-700/80 block mt-0.5">
                Ward {currentSectorData.ward} · Joint Commissioner: {assignedZone?.jointCommissioner}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe hazards (e.g., accidents observed, foul odor, waterlogging)"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-semibold rounded-2xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Sparkles size={16} />
            Publish & Escalate to MCG
          </button>
        </form>
      </div>
    </div>
  );
}
