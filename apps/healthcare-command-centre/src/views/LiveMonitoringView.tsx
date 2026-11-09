import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Activity, Heart, Droplet, Thermometer, Wind, Footprints, Clock, RefreshCw, Monitor } from 'lucide-react';
import { Patient } from '../types';
import { CommandCentreApi } from '../services/api';
import { ICUBedsideMonitor } from '../components/ICUBedsideMonitor';

interface LiveMonitoringViewProps {
  patient: Patient;
  isFrozen?: boolean;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({ patient, isFrozen = false }) => {
  const [hours, setHours] = useState<number>(24);
  const [selectedMetric, setSelectedMetric] = useState<string>('heart_rate');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [patient.id, hours, selectedMetric]);

  const loadData = async () => {
    setLoading(true);
    const events = await CommandCentreApi.getTelemetryHistory(patient.id, selectedMetric, hours);
    if (events && events.length > 0) {
      const formatted = events.map((e) => ({
        time: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: e.value,
        quality: e.quality,
        unit: e.unit,
      }));
      setChartData(formatted);
    } else {
      setChartData([]);
    }
    setLoading(false);
  };

  const metricConfigs: Record<string, { label: string; unit: string; color: string; baselineMin: number; baselineMax: number; icon: any }> = {
    heart_rate: { label: 'Heart Rate', unit: 'BPM', color: '#00ff44', baselineMin: patient.baseline_hr_min, baselineMax: patient.baseline_hr_max, icon: Heart },
    blood_pressure_sys: { label: 'Systolic BP', unit: 'mmHg', color: '#ff3b30', baselineMin: 110, baselineMax: patient.baseline_bp_sys + 10, icon: Activity },
    spo2: { label: 'Oxygen Saturation', unit: '%', color: '#00e5ff', baselineMin: patient.baseline_spo2_min || 95, baselineMax: 100, icon: Wind },
    temperature: { label: 'Skin Temperature', unit: '°C', color: '#facc15', baselineMin: 36.2, baselineMax: 37.4, icon: Thermometer },
    respiratory_rate: { label: 'Respiratory Rate', unit: 'br/min', color: '#a78bfa', baselineMin: 12, baselineMax: 20, icon: Wind },
    steps: { label: 'Walking Steps', unit: 'steps', color: '#38bdf8', baselineMin: 0, baselineMax: patient.baseline_daily_steps, icon: Footprints },
    daily_water_ml: { label: 'Hydration Intake', unit: 'ml', color: '#60a5fa', baselineMin: 0, baselineMax: 2200, icon: Droplet },
  };

  const activeConfig = metricConfigs[selectedMetric] || metricConfigs.heart_rate;

  return (
    <div className="p-4 md:p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-6rem)] bg-[#2b3644] text-slate-100 font-sans">
      {/* ================= REAL-TIME ICU BEDSIDE TELEMETRY SWEEP ================= */}
      <div className="clinical-panel p-3 shadow-2xl">
        <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-[#2b3644] text-xs font-mono">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-100 uppercase">Live Multi-Lead Bedside Sweep: {patient.name}</span>
            <span className="text-[10px] bg-[#1a2533] text-cyan-300 px-2 py-0.5 rounded border border-cyan-700">
              {patient.id} • Bed 4A-12
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            TELEMETRY ACTIVE
          </span>
        </div>

        <ICUBedsideMonitor patient={patient} isFrozen={isFrozen} />
      </div>

      {/* ================= 24-HOUR TRENDS & HISTORICAL TELEMETRY ================= */}
      <div className="clinical-panel p-4 shadow-xl space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#2b3644] pb-3">
          <div>
            <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2 uppercase">
              Physiological Trend Logs &amp; Historical Analysis
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Time-series aggregate telemetry received from wearable Smart Dress, Slippers, Watch, and Mattress.
            </p>
          </div>

          {/* Time Horizon Selector with Clinical Buttons */}
          <div className="flex items-center gap-1.5 bg-[#202936] p-1 rounded-lg border border-[#485669]">
            {[6, 12, 24, 48].map((h) => (
              <button
                key={h}
                onClick={() => setHours(h)}
                className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition active:translate-y-0.5 ${
                  hours === h ? 'bg-cyan-500 text-slate-950 font-black shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                {h}h
              </button>
            ))}
            <button
              onClick={loadData}
              className="clinical-btn p-1.5 text-slate-200 hover:text-white transition ml-1"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {Object.entries(metricConfigs).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isSelected = selectedMetric === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`p-2.5 rounded-lg border text-left transition active:translate-y-0.5 ${
                  isSelected
                    ? 'bg-[#1a2533] border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg'
                    : 'bg-[#3b4859] border-[#293543] hover:bg-[#46566c]'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  <span className="text-[10px] font-mono">{cfg.unit}</span>
                </div>
                <div className="text-xs font-bold text-white truncate">{cfg.label}</div>
              </button>
            );
          })}
        </div>

        {/* Recessed Black Telemetry Graph Display */}
        <div className="clinical-display p-4">
          <div className="flex items-center justify-between mb-3 border-b border-[#1b2533] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shadow" style={{ backgroundColor: activeConfig.color }} />
              <h3 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wide">
                {activeConfig.label} ({hours}h Window)
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Normal Baseline: <strong className="text-emerald-400">{activeConfig.baselineMin} - {activeConfig.baselineMax} {activeConfig.unit}</strong>
            </div>
          </div>

          {/* The Recharts Graph */}
          <div className="h-72 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                Loading telemetry time-series from database...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2533" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070b14', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#00e5ff', fontWeight: 'bold' }}
                  />
                  <ReferenceLine
                    y={activeConfig.baselineMin}
                    stroke="#00ff44"
                    strokeDasharray="4 4"
                    label={{ value: 'Min', fill: '#00ff44', fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={activeConfig.baselineMax}
                    stroke="#ff3b30"
                    strokeDasharray="4 4"
                    label={{ value: 'Max', fill: '#ff3b30', fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={activeConfig.color}
                    strokeWidth={2.2}
                    dot={{ r: 2.5, fill: activeConfig.color }}
                    activeDot={{ r: 5 }}
                    name={activeConfig.label}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
