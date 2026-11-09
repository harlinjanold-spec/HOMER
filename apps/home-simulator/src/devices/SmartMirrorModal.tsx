import React from 'react';
import { X, Calendar, MessageSquare, AlertCircle, Sparkles, Heart, Activity } from 'lucide-react';
import { Patient } from '../types';

interface SmartMirrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  heartRate: number;
  bp: string;
  onTriggerSOS: () => void;
}

export const SmartMirrorModal: React.FC<SmartMirrorModalProps> = ({
  isOpen,
  onClose,
  patient,
  heartRate,
  bp,
  onTriggerSOS,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/50 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">SMART DIGITAL MIRROR</h2>
              <p className="text-[10px] text-cyan-400 font-mono">Good Morning, {patient.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mirror Daily Briefing */}
        <div className="space-y-4">
          {/* Vitals Summary Strip */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-red-950/80 text-red-400">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Heart Rate</div>
                <div className="text-base font-mono font-bold text-white">{heartRate} BPM</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-950/80 text-blue-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Blood Pressure</div>
                <div className="text-base font-mono font-bold text-white">{bp} mmHg</div>
              </div>
            </div>
          </div>

          {/* Today's Schedule & Reminders */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> Today's Care Protocol
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center justify-between">
                <span>💊 Morning Lisinopril 10mg</span>
                <span className="text-[10px] text-emerald-400 font-mono">08:00 AM</span>
              </li>
              <li className="flex items-center justify-between">
                <span>🚶‍♂️ Light 20-min Hallway Walk</span>
                <span className="text-[10px] text-cyan-400 font-mono">11:00 AM</span>
              </li>
              <li className="flex items-center justify-between">
                <span>🩺 Nurse Station Video Check-in</span>
                <span className="text-[10px] text-purple-400 font-mono">04:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Caregiver Note */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <div className="font-semibold text-slate-200">Message from Priya Sharma, RN:</div>
              <p className="text-slate-400 italic text-[11px] mt-0.5">
                "Keep hydrated during your afternoon walk, Raghav! You're meeting all your recovery goals."
              </p>
            </div>
          </div>

          {/* Emergency SOS Button */}
          <button
            onClick={() => {
              onTriggerSOS();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white shadow-lg shadow-red-950 transition active:scale-95"
          >
            <AlertCircle className="w-5 h-5" /> EMERGENCY CALL NURSE STATION (SOS)
          </button>
        </div>
      </div>
    </div>
  );
};

