import React from 'react';
import { Footprints, BatteryCharging, ShieldAlert } from 'lucide-react';

interface SmartSlippersWidgetProps {
  steps: number;
  speed: number;
  footPressureL: number;
  footPressureR: number;
  gaitVariation: number;
  batteryPct: number;
  onSimulateFall: () => void;
}

export const SmartSlippersWidget: React.FC<SmartSlippersWidgetProps> = ({
  steps,
  speed,
  footPressureL,
  footPressureR,
  gaitVariation,
  batteryPct,
  onSimulateFall,
}) => {
  return (
    <div className="bg-[#0b0f19] rounded-2xl p-3.5 border border-slate-800/90 shadow-lg">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Footprints className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Smart Slippers Hub</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
          <BatteryCharging className="w-3 h-3" />
          {batteryPct}%
        </div>
      </div>

      {/* Pressure Bar & Gait */}
      <div className="grid grid-cols-2 gap-2 mb-2.5">
        <div className="bg-[#060911] p-2 rounded-xl border border-slate-800/80">
          <div className="text-[9px] text-slate-400 font-mono uppercase mb-1 flex justify-between">
            <span>Foot Pressure</span>
            <span className="text-sky-400 font-bold">L / R</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold font-mono tabular-nums">
            <span className="text-sky-300">{footPressureL} kPa</span>
            <span className="text-slate-600">/</span>
            <span className="text-sky-300">{footPressureR} kPa</span>
          </div>
        </div>

        <div className="bg-[#060911] p-2 rounded-xl border border-slate-800/80">
          <div className="text-[9px] text-slate-400 font-mono uppercase mb-1 flex justify-between">
            <span>Gait Variation</span>
            <span className="text-amber-400 font-bold">±%</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold font-mono tabular-nums">
            <span className={gaitVariation > 8 ? 'text-amber-400' : 'text-slate-200'}>
              {gaitVariation}%
            </span>
            <span className="text-[9px] font-mono uppercase text-slate-500 font-normal">
              {gaitVariation > 8 ? 'Unsteady' : 'Normal'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics & Fall Trigger */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
          <span className="text-slate-200 font-bold">{steps.toLocaleString()}</span>
          <span className="text-slate-500 text-[10px]">steps</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-200 font-bold">{speed.toFixed(2)}</span>
          <span className="text-slate-500 text-[10px]">m/s</span>
        </div>

        <button
          onClick={onSimulateFall}
          className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/80 transition"
        >
          <ShieldAlert className="w-3 h-3 text-rose-400" /> Simulate Fall
        </button>
      </div>
    </div>
  );
};
