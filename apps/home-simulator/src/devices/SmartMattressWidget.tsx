import React from 'react';
import { Bed, Moon, Activity } from 'lucide-react';

interface SmartMattressWidgetProps {
  isOccupied: boolean;
  sleepHours: number;
  movementEvents: number;
  onToggleOccupancy: () => void;
}

export const SmartMattressWidget: React.FC<SmartMattressWidgetProps> = ({
  isOccupied,
  sleepHours,
  movementEvents,
  onToggleOccupancy,
}) => {
  return (
    <div className="bg-[#0b0f19] rounded-2xl p-3.5 border border-slate-800/90 shadow-lg">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Bed className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Smart Mattress Array</span>
        </div>
        <span
          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border ${
            isOccupied
              ? 'bg-sky-950/80 text-sky-400 border-sky-800/60'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
        >
          {isOccupied ? 'PATIENT IN BED' : 'EMPTY / STANDBY'}
        </span>
      </div>

      {/* Pressure Heatmap Grid (3x5 sensors) */}
      <div className="bg-[#060911] p-2 rounded-xl border border-slate-800/80 mb-2.5">
        <div className="flex justify-between items-center text-[9px] font-mono uppercase text-slate-400 mb-1">
          <span>Piezoelectric Array (Load Profile)</span>
          <span className="font-mono text-sky-400 font-bold">{isOccupied ? 'Active Load: 74.2 kg' : 'Tare: 0.0 kg'}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 h-12">
          {Array.from({ length: 15 }).map((_, idx) => {
            const isCenter = idx >= 5 && idx <= 9;
            const activeColor = isOccupied
              ? isCenter
                ? 'bg-sky-500 shadow-sm shadow-sky-400/50'
                : 'bg-sky-900/80'
              : 'bg-slate-900';
            return (
              <div
                key={idx}
                className={`rounded-sm transition-all duration-300 ${activeColor} border border-slate-800/90`}
              />
            );
          })}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px] tabular-nums">
          <Moon className="w-3 h-3 text-indigo-400" />
          <span>{sleepHours.toFixed(1)} hrs</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px] tabular-nums">
          <Activity className="w-3 h-3 text-sky-400" />
          <span>{movementEvents} ev/h</span>
        </div>
        <button
          onClick={onToggleOccupancy}
          className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80 transition"
        >
          {isOccupied ? 'Exit Bed' : 'Get in Bed'}
        </button>
      </div>
    </div>
  );
};
