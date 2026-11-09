import React, { useState } from 'react';
import { Pill, CheckCircle2, Bell, AlertTriangle } from 'lucide-react';

interface SmartPillboxWidgetProps {
  isReminderActive: boolean;
  onTakeMedication: (medName: string, compartment: string) => void;
  onAcknowledgeReminder?: () => void;
}

export const SmartPillboxWidget: React.FC<SmartPillboxWidgetProps> = ({
  isReminderActive,
  onTakeMedication,
  onAcknowledgeReminder,
}) => {
  const [compartments, setCompartments] = useState([
    { id: 'morning', label: 'Morning (08:00)', med: 'Lisinopril 10mg', taken: false, isOpen: false },
    { id: 'noon', label: 'Noon (13:00)', med: 'Metformin 500mg', taken: false, isOpen: false },
    { id: 'night', label: 'Night (20:00)', med: 'Atorvastatin 20mg', taken: false, isOpen: false },
  ]);

  const handleOpenCompartment = (id: string) => {
    setCompartments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isOpen: !c.isOpen } : c))
    );
  };

  const handleConfirmIngestion = (id: string, medName: string) => {
    setCompartments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, taken: true, isOpen: false } : c))
    );
    onTakeMedication(medName, id);
    if (onAcknowledgeReminder) {
      onAcknowledgeReminder();
    }
  };

  return (
    <div
      className={`rounded-2xl p-3.5 border shadow-lg transition-all duration-300 ${
        isReminderActive
          ? 'bg-amber-950/40 border-amber-500/80 ring-2 ring-amber-500/30'
          : 'bg-[#0b0f19] border-slate-800/90'
      }`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Pill className={`w-4 h-4 ${isReminderActive ? 'text-amber-400' : 'text-emerald-400'}`} />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Smart Pillbox Station</span>
        </div>
        {isReminderActive ? (
          <span className="flex items-center gap-1 text-[9px] bg-amber-500 text-black font-extrabold px-2 py-0.5 rounded-md font-mono uppercase">
            <Bell className="w-2.5 h-2.5 animate-bounce" /> DOSE DUE
          </span>
        ) : (
          <span className="text-[9px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
            SCHEDULE SYNCED
          </span>
        )}
      </div>

      {/* 3 Compartments */}
      <div className="grid grid-cols-3 gap-1.5">
        {compartments.map((comp) => (
          <div
            key={comp.id}
            className={`p-2 rounded-xl border text-center transition ${
              comp.taken
                ? 'bg-emerald-950/20 border-emerald-800/60 text-slate-400'
                : comp.isOpen
                ? 'bg-sky-950/60 border-sky-500/80'
                : 'bg-[#060911] border-slate-800/80'
            }`}
          >
            <div className="text-[8.5px] font-mono font-bold text-slate-400 mb-0.5">{comp.label}</div>
            <div className="text-[9.5px] font-semibold text-sky-300 mb-1.5 truncate" title={comp.med}>
              {comp.med}
            </div>

            {comp.taken ? (
              <div className="flex items-center justify-center gap-1 text-[9px] text-emerald-400 font-mono font-bold">
                <CheckCircle2 className="w-3 h-3" /> CONFIRMED
              </div>
            ) : comp.isOpen ? (
              <button
                onClick={() => handleConfirmIngestion(comp.id, comp.med)}
                className="w-full text-[9px] font-mono font-bold py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-sm"
              >
                Ingest & Close
              </button>
            ) : (
              <button
                onClick={() => handleOpenCompartment(comp.id)}
                className="w-full text-[9px] font-mono font-bold py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                Open Pod
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
