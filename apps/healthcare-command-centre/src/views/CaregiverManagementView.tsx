import React, { useState } from 'react';
import {
  HeartHandshake,
  Send,
  Plus,
  MessageSquare,
  Clock,
  User,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Patient, Caregiver, CaregiverObservation } from '../types';
import { CommandCentreApi } from '../services/api';

interface CaregiverManagementViewProps {
  patient: Patient;
  caregivers: Caregiver[];
  observations: CaregiverObservation[];
  onObservationAdded: (obs: CaregiverObservation) => void;
}

export const CaregiverManagementView: React.FC<CaregiverManagementViewProps> = ({
  patient,
  caregivers,
  observations,
  onObservationAdded,
}) => {
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string>('CG-001');
  const [noteText, setNoteText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setSubmitting(true);
    const newObs = await CommandCentreApi.addCaregiverObservation(
      patient.id,
      selectedCaregiverId,
      noteText
    );
    if (newObs) {
      onObservationAdded(newObs);
      setNoteText('');
    }
    setSubmitting(false);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            CAREGIVER MANAGEMENT & CLINICAL OBSERVATIONS
            <span className="text-xs font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800">
              ENGLISH NLP INPUT ENGINE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log qualitative nursing observations in English to update the contextual AI risk model in real time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Log New Observation Note Form */}
        <div className="space-y-4">
          <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" /> Log Clinical Observation Note
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Caregiver Author</label>
                <select
                  value={selectedCaregiverId}
                  onChange={(e) => setSelectedCaregiverId(e.target.value)}
                  className="w-full bg-[#121d36] border border-[#1e2d4d] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {caregivers.map((cg) => (
                    <option key={cg.id} value={cg.id} className="bg-[#0d1527] text-white">
                      {cg.id}: {cg.name} ({cg.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Target Patient</label>
                <div className="bg-[#121d36] border border-[#1e2d4d] rounded-xl px-3 py-2 text-cyan-300 font-bold font-mono">
                  {patient.id}: {patient.name}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">
                  Clinical Observation (English)
                </label>
                <textarea
                  rows={4}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="e.g. Patient complained of unusual fatigue and poor sleep this morning. Mild lightheadedness upon standing."
                  className="w-full bg-[#121d36] border border-[#1e2d4d] rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {/* Sample Quick Notes */}
              <div className="text-[10px] text-slate-400 space-y-1">
                <span>Quick Prompts:</span>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setNoteText('Patient reported unusual fatigue and poor sleep today.')}
                    className="p-1 rounded bg-[#121d36] hover:bg-[#182747] text-slate-300 border border-[#1e2d4d]"
                  >
                    "Fatigue & poor sleep"
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteText('Patient completed morning walk cheerfully. Hydration is on target.')}
                    className="p-1 rounded bg-[#121d36] hover:bg-[#182747] text-slate-300 border border-[#1e2d4d]"
                  >
                    "Cheerful & stable"
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteText('Patient dizzy and unsteady on feet after morning meds.')}
                    className="p-1 rounded bg-[#121d36] hover:bg-[#182747] text-slate-300 border border-[#1e2d4d]"
                  >
                    "Dizzy & unsteady"
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !noteText.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold shadow-lg shadow-cyan-950 transition active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Parsing NLP & Updating AI...' : 'Submit Observation & Update AI Risk'}
              </button>
            </form>
          </div>
        </div>

        {/* Right 2 Columns: Past Observations Timeline & Caregiver Directory */}
        <div className="lg:col-span-2 space-y-4">
          {/* Timeline */}
          <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" /> Historical Clinical Notes for {patient.name} ({observations.length})
            </h3>

            <div className="space-y-3">
              {observations.length === 0 ? (
                <div className="text-xs text-slate-500 py-6 text-center">No observations logged yet.</div>
              ) : (
                observations.map((obs) => (
                  <div
                    key={obs.id}
                    className="bg-[#121d36] p-3.5 rounded-xl border border-[#1e2d4d] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-bold text-white">{obs.caregiver_id}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(obs.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                          obs.sentiment === 'high_risk'
                            ? 'bg-red-950 text-red-300 border border-red-700'
                            : obs.sentiment === 'concerning'
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        }`}
                      >
                        {obs.sentiment}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed font-sans text-xs italic">
                      "{obs.note_text}"
                    </p>

                    {obs.clinical_keywords && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono pt-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>NLP Features Extracted:</span>
                        <span className="text-cyan-300 font-bold">{obs.clinical_keywords}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Caregiver Staff Roster */}
          <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-400" /> Caregiver Roster & Availability
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {caregivers.map((cg) => (
                <div
                  key={cg.id}
                  className="bg-[#121d36] p-3 rounded-xl border border-[#1e2d4d] flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white">{cg.name}</div>
                    <div className="text-[11px] text-cyan-400">{cg.role}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{cg.phone} • {cg.email}</div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                      {cg.attendance_status}
                    </span>
                    <div className="text-[9px] text-slate-500 mt-1">Shift: {cg.shift_hours.split(' ')[0]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

