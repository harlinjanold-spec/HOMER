import React, { useState, useEffect } from 'react';
import {
  Binary,
  Heart,
  Activity,
  Droplet,
  Thermometer,
  Wind,
  ShieldCheck,
  Clock,
  Database,
  FileText,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Patient, DigitalTwin } from '../types';
import { CommandCentreApi } from '../services/api';

interface DigitalTwinViewProps {
  patient: Patient;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({ patient }) => {
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTwin();
  }, [patient.id]);

  const loadTwin = async () => {
    setLoading(true);
    const data = await CommandCentreApi.getDigitalTwin(patient.id);
    setTwin(data);
    setLoading(false);
  };

  if (loading || !twin) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-sm">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
        Synchronizing Patient Digital Twin...
      </div>
    );
  }

  const vitals = twin.latest_vitals;
  const comp = twin.baseline_comparison;
  const prov = twin.provenance_breakdown;

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            PATIENT DIGITAL TWIN ARCHITECTURE
            <span className="text-xs font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800">
              {twin.patient.id}: {twin.patient.name}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Holistic computational twin synthesizing real-time biometric streams, baselines, activity telemetry, and clinical notes.
          </p>
        </div>

        <button
          onClick={loadTwin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121d36] hover:bg-[#182747] text-cyan-300 text-xs font-bold border border-[#1e2d4d] transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Twin</span>
        </button>
      </div>

      {/* Grid: 3 Main Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Live Biometric Twin State vs Baseline */}
        <div className="space-y-4">
          <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" /> Current Vitals vs. Personal Baseline
            </h3>

            <div className="space-y-2.5">
              {/* Heart Rate */}
              <div className="bg-[#121d36] p-3 rounded-xl border border-[#1e2d4d]">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-400" /> Heart Rate
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    {vitals.heart_rate?.value ? `${vitals.heart_rate.value} BPM` : 'N/A'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                  <span>Baseline: {comp.heart_rate?.baseline_range}</span>
                  <span className={comp.heart_rate?.is_abnormal ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {comp.heart_rate?.is_abnormal ? 'Deviation Detected' : 'Optimal Target'}
                  </span>
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="bg-[#121d36] p-3 rounded-xl border border-[#1e2d4d]">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-blue-400" /> Blood Pressure
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    {comp.blood_pressure?.current}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                  <span>Baseline: {comp.blood_pressure?.baseline}</span>
                  <span className={comp.blood_pressure?.is_abnormal ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {comp.blood_pressure?.is_abnormal ? 'Elevated Systolic' : 'Normal Range'}
                  </span>
                </div>
              </div>

              {/* SpO2 */}
              <div className="bg-[#121d36] p-3 rounded-xl border border-[#1e2d4d]">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-cyan-400" /> Oxygen Saturation
                  </span>
                  <span className="font-mono font-bold text-cyan-300 text-sm">
                    {vitals.spo2?.value ? `${vitals.spo2.value}%` : 'N/A'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                  <span>Target: {comp.spo2?.baseline_min}</span>
                  <span className={comp.spo2?.is_abnormal ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {comp.spo2?.is_abnormal ? 'Hypoxemia' : 'Normal Saturation'}
                  </span>
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-[#121d36] p-3 rounded-xl border border-[#1e2d4d]">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Skin Temperature
                  </span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {vitals.temperature?.value ? `${vitals.temperature.value}°C` : 'N/A'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                  <span>Baseline: {comp.temperature?.baseline}</span>
                  <span className="text-emerald-400 font-bold">Normothermic</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Data Provenance & Activity / Sleep Dimensions */}
        <div className="space-y-4">
          {/* Data Provenance Breakdown (Mandatory Criterion) */}
          <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" /> Telemetry Data Provenance Attribution
            </h3>

            <p className="text-[11px] text-slate-400 mb-3">
              Ward Zero strictly separates simulated sensor packets, clinical caregiver notes, derived mathematical estimates, and laboratory-style inputs:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#121d36] border border-[#1e2d4d]">
                <span className="text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Simulated Sensors
                </span>
                <span className="font-bold text-white">{prov.simulation || 0} packets</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#121d36] border border-[#1e2d4d]">
                <span className="text-blue-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" /> Caregiver Manual Notes
                </span>
                <span className="font-bold text-white">{prov.manual || 0} entries</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#121d36] border border-[#1e2d4d]">
                <span className="text-purple-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> Derived AI Estimates
                </span>
                <span className="font-bold text-white">{prov.derived || 0} events</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#121d36] border border-[#1e2d4d]">
                <span className="text-amber-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Laboratory-Style Inputs
                </span>
                <span className="font-bold text-white">{prov.laboratory || 0} records</span>
              </div>
            </div>
          </div>

          {/* Activity & Sleep Twin Metrics */}
          <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Mobility & Sleep Twin Features
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#121d36] p-3 rounded-xl border border-[#1e2d4d]">
                <div className="text-[10px] text-slate-400 mb-1">Daily Steps Target</div>
                <div className="text-lg font-mono font-bold text-emerald-400">
                  {twin.activity_metrics.steps || 0}
                </div>
                <div className="text-[10px] text-slate-500">
                  {comp.steps?.achievement_pct || 0}% of {twin.patient.baseline_daily_steps}
                </div>
              </div>

              <div className="bg-[#121d36] p-3 rounded-xl border border-[#1e2d4d]">
                <div className="text-[10px] text-slate-400 mb-1">Gait Speed</div>
                <div className="text-lg font-mono font-bold text-cyan-400">
                  {twin.activity_metrics.gait_speed_m_s} m/s
                </div>
                <div className="text-[10px] text-slate-500">Slippers Accelerometer</div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Caregiver Observations & Explainable Risk Summary */}
        <div className="space-y-4">
          <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Recent Caregiver Observations
            </h3>

            <div className="space-y-2">
              {twin.recent_observations.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 text-center">No observation notes recorded.</div>
              ) : (
                twin.recent_observations.map((obs) => (
                  <div
                    key={obs.id}
                    className="bg-[#121d36] p-3 rounded-xl border border-[#1e2d4d] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-cyan-400 font-bold">{obs.caregiver_id}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                          obs.sentiment === 'high_risk'
                            ? 'bg-red-950 text-red-400'
                            : obs.sentiment === 'concerning'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-emerald-950 text-emerald-400'
                        }`}
                      >
                        {obs.sentiment}
                      </span>
                    </div>
                    <p className="text-slate-300 italic text-[11px]">"{obs.note_text}"</p>
                    {obs.clinical_keywords && (
                      <div className="text-[9px] text-slate-500 font-mono">
                        Keywords: {obs.clinical_keywords}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

