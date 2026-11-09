import React from 'react';
import { Droplet, Plus } from 'lucide-react';

interface SmartWaterBottleWidgetProps {
  currentVolumeMl: number;
  dailyTotalMl: number;
  targetDailyMl?: number;
  onDrinkWater: (amountMl: number) => void;
}

export const SmartWaterBottleWidget: React.FC<SmartWaterBottleWidgetProps> = ({
  currentVolumeMl,
  dailyTotalMl,
  targetDailyMl = 2000,
  onDrinkWater,
}) => {
  const percentage = Math.min(100, Math.round((dailyTotalMl / targetDailyMl) * 100));

  return (
    <div className="bg-slate-800/90 backdrop-blur rounded-xl p-3 border border-slate-700 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Droplet className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200">Smart Water Bottle</span>
        </div>
        <span className="text-[10px] text-cyan-300 font-mono font-semibold">
          {percentage}% Target
        </span>
      </div>

      {/* Bottle Visual & Metrics */}
      <div className="flex items-center gap-3">
        {/* Visual Bottle Gauge */}
        <div className="w-8 h-16 bg-slate-950 rounded-lg p-0.5 border border-slate-800 flex flex-col justify-end overflow-hidden relative">
          <div
            className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-b transition-all duration-500"
            style={{ height: `${(currentVolumeMl / 750) * 100}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-white/90">
            {currentVolumeMl}ml
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Total Drank Today:</span>
            <span className="font-mono font-bold text-cyan-400">{dailyTotalMl} ml</span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 mb-2 overflow-hidden border border-slate-800">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onDrinkWater(250)}
              className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-1 px-2 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 transition"
            >
              <Plus className="w-3 h-3" /> Drink 250ml
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

