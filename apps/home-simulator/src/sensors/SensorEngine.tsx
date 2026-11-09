import React, { useState, useEffect } from 'react';
import { Sliders, Play, Pause, Activity, Radio, Cpu, ShieldCheck } from 'lucide-react';
import { TelemetryPayload } from '../types';
import { ApiService } from '../services/api';

interface SensorEngineProps {
  patientId: string;
  heartRate: number;
  bpSys: number;
  bpDia: number;
  spo2: number;
  temperature: number;
  respiratoryRate: number;
  onUpdateVital: (metric: string, value: number) => void;
  onTelemetryEmitted: (event: TelemetryPayload) => void;
}

export const SensorEngine: React.FC<SensorEngineProps> = ({
  patientId,
  heartRate,
  bpSys,
  bpDia,
  spo2,
  temperature,
  respiratoryRate,
  onUpdateVital,
  onTelemetryEmitted,
}) => {
  const [isRunning, setIsRunning] = useState(true);
  const [quality, setQuality] = useState<'valid' | 'questionable' | 'fault' | 'stale'>('valid');
  const [streamLog, setStreamLog] = useState<TelemetryPayload[]>([]);

  // Continuous realistic telemetry stream
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Small natural micro-fluctuations
      const hrJitter = Math.round((Math.random() - 0.5) * 2);
      const newHr = Math.max(45, Math.min(180, heartRate + hrJitter));
      onUpdateVital('heart_rate', newHr);

      const now = new Date().toISOString();
      const payload: TelemetryPayload = {
        event_id: `EVT-SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        patient_id: patientId,
        device_id: `DEV-${patientId}-DRESS`,
        sensor_id: `SEN-${patientId}-DRESS-HEART_RATE`,
        source: 'simulation',
        measurement: 'heart_rate',
        value: newHr,
        unit: 'BPM',
        quality: quality,
        timestamp: now,
      };

      ApiService.sendTelemetry(payload);
      onTelemetryEmitted(payload);

      setStreamLog((prev) => [payload, ...prev.slice(0, 19)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isRunning, heartRate, patientId, quality]);

  const handleManualEmit = (metric: string, val: number, unit: string, devSuffix: string, senSuffix: string) => {
    const now = new Date().toISOString();
    const payload: TelemetryPayload = {
      event_id: `EVT-MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patient_id: patientId,
      device_id: `DEV-${patientId}-${devSuffix}`,
      sensor_id: `SEN-${patientId}-${devSuffix}-${senSuffix}`,
      source: 'simulation',
      measurement: metric,
      value: val,
      unit: unit,
      quality: quality,
      timestamp: now,
    };

    ApiService.sendTelemetry(payload);
    onTelemetryEmitted(payload);
    setStreamLog((prev) => [payload, ...prev.slice(0, 19)]);
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Telemetry Calibration Rack
            </h3>
            <p className="text-[10px] text-slate-400">Dynamic Multi-channel Sensor Simulation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1 rounded-lg transition-all ${
              isRunning
                ? 'bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-700/60'
                : 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60'
            }`}
          >
            {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isRunning ? 'PAUSE ENGINE' : 'RESUME ENGINE'}
          </button>
        </div>
      </div>

      {/* Signal Quality Selector */}
      <div className="flex items-center justify-between bg-[#060911] p-2 rounded-xl border border-slate-800/90 mb-3.5 text-xs">
        <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase tracking-wider">
          Transducer Quality:
        </span>
        <div className="flex gap-1 text-[10px]">
          {(['valid', 'questionable', 'fault', 'stale'] as const).map((q) => {
            const isSelected = quality === q;
            return (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] uppercase font-bold transition-all ${
                  isSelected
                    ? q === 'valid'
                      ? 'bg-emerald-500 text-black shadow-sm shadow-emerald-950'
                      : q === 'fault'
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-950'
                      : 'bg-amber-500 text-black shadow-sm shadow-amber-950'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {q}
              </button>
            );
          })}
        </div>
      </div>

      {/* High-Precision Sliders */}
      <div className="space-y-3.5 mb-4">
        {/* Heart Rate */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Heart Rate (Dress ECG)
            </span>
            <span className="font-mono font-bold text-rose-400 tabular-nums">
              {heartRate} <span className="text-[10px] text-slate-500 font-normal">BPM</span>
            </span>
          </div>
          <input
            type="range"
            min="45"
            max="160"
            value={heartRate}
            onChange={(e) => {
              const val = Number(e.target.value);
              onUpdateVital('heart_rate', val);
              handleManualEmit('heart_rate', val, 'BPM', 'DRESS', 'HEART_RATE');
            }}
            className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
            <span>45 (Bradycardia)</span>
            <span className="text-emerald-500/80 font-bold">Target: 60-100</span>
            <span>160 (Tachycardia)</span>
          </div>
        </div>

        {/* Systolic BP */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Systolic Blood Pressure
            </span>
            <span className="font-mono font-bold text-sky-400 tabular-nums">
              {bpSys} <span className="text-[10px] text-slate-500 font-normal">mmHg</span>
            </span>
          </div>
          <input
            type="range"
            min="90"
            max="195"
            value={bpSys}
            onChange={(e) => {
              const val = Number(e.target.value);
              onUpdateVital('blood_pressure_sys', val);
              handleManualEmit('blood_pressure_sys', val, 'mmHg', 'DRESS', 'BLOOD_PRESSURE_SYS');
            }}
            className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
            <span>90 (Hypotension)</span>
            <span className="text-emerald-500/80 font-bold">Target: 110-130</span>
            <span>195 (Hypertensive Crisis)</span>
          </div>
        </div>

        {/* SpO2 */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Oxygen Saturation (SpO2)
            </span>
            <span className="font-mono font-bold text-cyan-300 tabular-nums">
              {spo2} <span className="text-[10px] text-slate-500 font-normal">%</span>
            </span>
          </div>
          <input
            type="range"
            min="82"
            max="100"
            value={spo2}
            onChange={(e) => {
              const val = Number(e.target.value);
              onUpdateVital('spo2', val);
              handleManualEmit('spo2', val, '%', 'WATCH', 'SPO2');
            }}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
            <span>82% (Hypoxia)</span>
            <span className="text-emerald-500/80 font-bold">Normal: 95-100%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Skin Temperature */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Skin Temperature
            </span>
            <span className="font-mono font-bold text-amber-300 tabular-nums">
              {temperature.toFixed(1)} <span className="text-[10px] text-slate-500 font-normal">°C</span>
            </span>
          </div>
          <input
            type="range"
            min="35.0"
            max="40.5"
            step="0.1"
            value={temperature}
            onChange={(e) => {
              const val = Number(e.target.value);
              onUpdateVital('temperature', val);
              handleManualEmit('temperature', val, '°C', 'DRESS', 'SKIN_TEMPERATURE');
            }}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
            <span>35.0°C</span>
            <span className="text-emerald-500/80 font-bold">Normothermic: 36.5-37.5°C</span>
            <span>40.5°C (Febrile)</span>
          </div>
        </div>

        {/* Respiratory Rate */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              Respiratory Rate
            </span>
            <span className="font-mono font-bold text-indigo-300 tabular-nums">
              {respiratoryRate} <span className="text-[10px] text-slate-500 font-normal">br/min</span>
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="32"
            value={respiratoryRate}
            onChange={(e) => {
              const val = Number(e.target.value);
              onUpdateVital('respiratory_rate', val);
              handleManualEmit('respiratory_rate', val, 'br/min', 'DRESS', 'RESPIRATORY_RATE');
            }}
            className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
            <span>10 br/min</span>
            <span className="text-emerald-500/80 font-bold">Normal: 12-20 br/min</span>
            <span>32 (Tachypnea)</span>
          </div>
        </div>
      </div>

      {/* Live Ingestion Stream */}
      <div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-mono">
          <span className="font-bold uppercase tracking-wider text-slate-300">Outbound Telemetry Stream</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE PIPELINE
          </span>
        </div>
        <div className="h-28 overflow-y-auto space-y-1 bg-[#060911] p-2.5 rounded-xl border border-slate-800/90 font-mono text-[9px]">
          {streamLog.length === 0 ? (
            <div className="text-slate-600 text-center py-4">Awaiting telemetry synchronization...</div>
          ) : (
            streamLog.map((pkt) => (
              <div key={pkt.event_id} className="flex items-center justify-between border-b border-slate-900 pb-1">
                <span className="text-sky-400 font-bold">{pkt.measurement}</span>
                <span className="text-slate-200 tabular-nums font-semibold">{pkt.value} {pkt.unit}</span>
                <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  pkt.quality === 'valid' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                }`}>
                  {pkt.quality}
                </span>
                <span className="text-slate-600 text-[8px] truncate max-w-[90px]">{pkt.event_id.replace('EVT-', '')}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
