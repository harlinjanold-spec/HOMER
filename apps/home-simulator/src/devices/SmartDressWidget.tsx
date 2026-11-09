import React from 'react';
import { Activity, Thermometer, Wind, Zap } from 'lucide-react';

interface SmartDressWidgetProps {
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  posture: string;
  isOnline: boolean;
}

export const SmartDressWidget: React.FC<SmartDressWidgetProps> = ({
  heartRate,
  temperature,
  respiratoryRate,
  posture,
  isOnline,
}) => {
  return (
    <div className="bg-[#0b0f19] rounded-2xl p-3.5 border border-slate-800/90 shadow-lg">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Smart Home Dress</span>
        </div>
        <span className="text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-800/60">
          LEADS 100%
        </span>
      </div>

      {/* Dynamic Animated ECG Oscilloscope */}
      <div className="bg-[#060911] rounded-xl p-2 mb-2.5 relative overflow-hidden border border-slate-800/80">
        <svg viewBox="0 0 200 40" className="w-full h-8">
          <path
            d="M 0 20 L 30 20 L 35 12 L 40 28 L 45 6 L 50 34 L 55 20 L 80 20 L 85 12 L 90 28 L 95 6 L 100 34 L 105 20 L 140 20 L 145 12 L 150 28 L 155 6 L 160 34 L 165 20 L 200 20"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="absolute top-1.5 right-2 flex items-center gap-1.5 bg-[#060911]/90 px-1.5 py-0.5 rounded border border-slate-800">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-300 font-bold tabular-nums">{heartRate} BPM</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
        <div className="bg-[#060911] p-1.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[9px] font-mono uppercase">
            <Thermometer className="w-2.5 h-2.5 text-amber-400" /> Temp
          </div>
          <span className="font-mono font-bold text-slate-200 text-xs tabular-nums">{temperature.toFixed(1)}°C</span>
        </div>

        <div className="bg-[#060911] p-1.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[9px] font-mono uppercase">
            <Wind className="w-2.5 h-2.5 text-sky-400" /> Resp
          </div>
          <span className="font-mono font-bold text-slate-200 text-xs tabular-nums">{respiratoryRate} /m</span>
        </div>

        <div className="bg-[#060911] p-1.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[9px] font-mono uppercase">
            <Zap className="w-2.5 h-2.5 text-indigo-400" /> Posture
          </div>
          <span className="font-mono font-bold text-sky-300 text-[10px] uppercase truncate block">{posture}</span>
        </div>
      </div>
    </div>
  );
};
