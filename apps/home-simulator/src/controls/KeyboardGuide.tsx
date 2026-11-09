import React from 'react';
import {
  Keyboard,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Coffee,
  Pill,
  Bed,
  Droplet,
  ShieldAlert,
  Play,
  Armchair,
} from 'lucide-react';

interface KeyboardGuideProps {
  onMove: (dx: number, dy: number, dir: 'up' | 'down' | 'left' | 'right') => void;
  onSitStand: () => void;
  onSleepWake: () => void;
  onInteract: () => void;
  onPillbox: () => void;
  onDrinkWater: () => void;
  onBathroom: () => void;
  onFall: () => void;
  onDailyRoutine: () => void;
}

export const KeyboardGuide: React.FC<KeyboardGuideProps> = ({
  onMove,
  onSitStand,
  onSleepWake,
  onInteract,
  onPillbox,
  onDrinkWater,
  onBathroom,
  onFall,
  onDailyRoutine,
}) => {
  return (
    <div className="bg-[#0b0f19] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3 mb-3.5">
        <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <Keyboard className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Patient Kinematics & Controls
          </h3>
          <p className="text-[10px] text-slate-400">Interactive Keyboard & Tactile Dispatch</p>
        </div>
      </div>

      {/* Tactile Virtual D-Pad / Movement Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Directional Pad */}
        <div className="flex flex-col items-center gap-1.5 p-2 bg-[#060911] rounded-xl border border-slate-800/90">
          <button
            onClick={() => onMove(0, -20, 'up')}
            className="w-9 h-9 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-sky-600 flex items-center justify-center text-slate-200 border border-slate-700/80 font-mono font-bold transition shadow-sm active:translate-y-0.5"
            title="Move Up (W)"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            <button
              onClick={() => onMove(-20, 0, 'left')}
              className="w-9 h-9 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-sky-600 flex items-center justify-center text-slate-200 border border-slate-700/80 font-mono font-bold transition shadow-sm active:translate-y-0.5"
              title="Move Left (A)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onMove(0, 20, 'down')}
              className="w-9 h-9 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-sky-600 flex items-center justify-center text-slate-200 border border-slate-700/80 font-mono font-bold transition shadow-sm active:translate-y-0.5"
              title="Move Down (S)"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => onMove(20, 0, 'right')}
              className="w-9 h-9 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-sky-600 flex items-center justify-center text-slate-200 border border-slate-700/80 font-mono font-bold transition shadow-sm active:translate-y-0.5"
              title="Move Right (D)"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 gap-1.5 flex-1 ml-3.5 text-[10px]">
          <button
            onClick={onSitStand}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-1.5">
              <Armchair className="w-3.5 h-3.5 text-sky-400" />
              <span>Sit/Stand</span>
            </div>
            <kbd className="font-mono bg-slate-800 text-[9px] px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">SPC</kbd>
          </button>

          <button
            onClick={onSleepWake}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sleep/Bed</span>
            </div>
            <kbd className="font-mono bg-slate-800 text-[9px] px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">B</kbd>
          </button>

          <button
            onClick={onDrinkWater}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Drink</span>
            </div>
            <kbd className="font-mono bg-slate-800 text-[9px] px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">K</kbd>
          </button>

          <button
            onClick={onPillbox}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pillbox</span>
            </div>
            <kbd className="font-mono bg-slate-800 text-[9px] px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">M</kbd>
          </button>

          <button
            onClick={onBathroom}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>Bath/Scale</span>
            </div>
            <kbd className="font-mono bg-slate-800 text-[9px] px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">U</kbd>
          </button>

          <button
            onClick={onFall}
            className="flex items-center justify-between p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/80 text-rose-200 border border-rose-800/80 transition"
          >
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-bold">Simulate Fall</span>
            </div>
            <kbd className="font-mono bg-rose-900 text-[9px] px-1.5 py-0.5 rounded text-rose-200 border border-rose-700">F</kbd>
          </button>
        </div>
      </div>

      {/* Autonomous Routine Dispatcher */}
      <button
        onClick={onDailyRoutine}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 font-bold text-xs text-slate-950 shadow-md shadow-sky-950/60 transition active:scale-[0.98]"
      >
        <Play className="w-3.5 h-3.5 fill-slate-950" />
        <span>Execute Autonomous Daily Routine</span>
        <kbd className="font-mono bg-slate-950/30 px-1.5 py-0.5 rounded text-[9px] text-slate-950 font-black">R</kbd>
      </button>
    </div>
  );
};
