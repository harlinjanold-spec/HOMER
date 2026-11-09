import React from 'react';
import { NavTab } from './TopNav';

interface BottomFunctionBarProps {
  onNavigateTab: (tab: NavTab) => void;
  onTriggerNIBP?: () => void;
  onFreezeSnapshot?: () => void;
  isFrozen?: boolean;
}

export const BottomFunctionBar: React.FC<BottomFunctionBarProps> = ({
  onNavigateTab,
  onTriggerNIBP,
  onFreezeSnapshot,
  isFrozen = false,
}) => {
  return (
    <footer className="h-11 w-full bg-[#414f62] border-t-2 border-[#5c6e86] shadow-2xl flex items-center justify-between px-2 py-1 select-none z-30 shrink-0">
      <div className="flex items-center gap-1.5 w-full justify-between overflow-x-auto">
        {/* 1. Alarm Setup */}
        <button
          onClick={() => onNavigateTab('alerts')}
          className="clinical-btn flex-1 min-w-[80px] h-8 text-[11px] font-bold text-slate-100 flex flex-col items-center justify-center leading-tight tracking-tight active:translate-y-0.5 transition"
        >
          <span>Alarm</span>
          <span className="text-[9.5px] text-slate-300">Setup</span>
        </button>

        {/* 2. Monitor Setup */}
        <button
          onClick={() => onNavigateTab('devices')}
          className="clinical-btn flex-1 min-w-[80px] h-8 text-[11px] font-bold text-slate-100 flex flex-col items-center justify-center leading-tight tracking-tight active:translate-y-0.5 transition"
        >
          <span>Monitor</span>
          <span className="text-[9.5px] text-slate-300">Setup</span>
        </button>

        {/* 3. Procedures */}
        <button
          onClick={() => onNavigateTab('nurse_station')}
          className="clinical-btn flex-1 min-w-[80px] h-8 text-[11px] font-bold text-slate-100 flex items-center justify-center tracking-tight active:translate-y-0.5 transition"
        >
          Procedures
        </button>

        {/* 4. Data & Pages */}
        <button
          onClick={() => onNavigateTab('overview')}
          className="clinical-btn flex-1 min-w-[80px] h-8 text-[11px] font-bold text-slate-100 flex flex-col items-center justify-center leading-tight tracking-tight active:translate-y-0.5 transition"
        >
          <span>Data &amp;</span>
          <span className="text-[9.5px] text-slate-300">Pages</span>
        </button>

        {/* 5. Trends */}
        <button
          onClick={() => onNavigateTab('monitoring')}
          className="clinical-btn flex-1 min-w-[70px] h-8 text-[11px] font-bold text-slate-100 flex items-center justify-center tracking-tight active:translate-y-0.5 transition"
        >
          Trends
        </button>

        {/* 6. Print Waveforms */}
        <button
          onClick={() => window.print()}
          className="clinical-btn flex-1 min-w-[85px] h-8 text-[11px] font-bold text-slate-100 flex flex-col items-center justify-center leading-tight tracking-tight active:translate-y-0.5 transition"
        >
          <span>Print</span>
          <span className="text-[9.5px] text-slate-300">Waveforms</span>
        </button>

        {/* 7. Freeze / Snapshot */}
        <button
          onClick={onFreezeSnapshot}
          className={`clinical-btn flex-1 min-w-[85px] h-8 text-[11px] font-bold flex flex-col items-center justify-center leading-tight tracking-tight active:translate-y-0.5 transition ${
            isFrozen
              ? 'bg-[#1e3a5f] text-cyan-300 border-cyan-400 ring-1 ring-cyan-400'
              : 'text-slate-100'
          }`}
        >
          <span>{isFrozen ? 'Unfreeze' : 'Freeze/'}</span>
          <span className="text-[9.5px] text-slate-300">{isFrozen ? 'Live' : 'Snapshot'}</span>
        </button>

        {/* 8. NIBP Start */}
        <button
          onClick={onTriggerNIBP}
          className="clinical-btn flex-1 min-w-[75px] h-8 text-[11px] font-bold text-slate-100 flex flex-col items-center justify-center leading-tight tracking-tight active:translate-y-0.5 transition"
        >
          <span>NIBP</span>
          <span className="text-[9.5px] text-slate-300">Start</span>
        </button>

        {/* 9. NIBP Auto Start */}
        <button
          onClick={onTriggerNIBP}
          className="clinical-btn flex-1 min-w-[85px] h-8 text-[11px] font-bold text-slate-100 flex flex-col items-center justify-center leading-tight tracking-tight active:translate-y-0.5 transition"
        >
          <span>NIBP Auto</span>
          <span className="text-[9.5px] text-slate-300">Start</span>
        </button>

        {/* 10. Zero All Pressures (Yellow Highlighted in GE/Philips Monitor Reference) */}
        <button
          onClick={() => alert('Calibration: Transducer and cuff zero-pressure baseline calibrated to 0.00 mmHg.')}
          className="flex-1 min-w-[95px] h-8 rounded-md bg-[#facc15] hover:bg-[#eab308] border-t-2 border-l-2 border-[#fef08a] border-r-2 border-b-2 border-[#a16207] text-slate-950 text-[11px] font-black flex flex-col items-center justify-center leading-tight tracking-tight shadow-md active:translate-y-0.5 transition"
        >
          <span>Zero All</span>
          <span className="text-[9.5px] text-slate-900">Pressures</span>
        </button>
      </div>
    </footer>
  );
};

