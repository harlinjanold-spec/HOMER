import React, { useState } from 'react';
import { Search, UserCheck, ShieldAlert, ArrowRight, Heart, Activity, Monitor } from 'lucide-react';
import { Patient, RiskAssessment } from '../types';

interface PatientDirectoryViewProps {
  patients: Patient[];
  latestAssessments: Record<string, RiskAssessment>;
  onSelectPatient: (patientId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const PatientDirectoryView: React.FC<PatientDirectoryViewProps> = ({
  patients,
  latestAssessments,
  onSelectPatient,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const filtered = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.condition_summary.toLowerCase().includes(searchTerm.toLowerCase());

    const rLevel = latestAssessments[p.id]?.risk_level || 'LOW';
    const matchesRisk = riskFilter === 'ALL' || rLevel === riskFilter;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="p-4 md:p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-6rem)] bg-[#2b3644] text-slate-100 font-sans">
      {/* Header */}
      <div className="clinical-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
        <div>
          <h2 className="text-base md:text-lg font-black text-white tracking-tight flex items-center gap-2 uppercase">
            PATIENT DIRECTORY &amp; POPULATION MONITORING
            <span className="text-[10px] font-mono bg-[#1a2533] text-cyan-300 px-2 py-0.5 rounded border border-cyan-600">
              SYNTHETIC MULTI-PATIENT COHORT
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Strict patient data isolation across 4 distinct home monitoring scenarios.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="clinical-panel p-3 flex flex-col sm:flex-row gap-3 shadow-md">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by patient name, ID, or clinical condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1b242e] border border-[#3b495b] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-400 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-300 font-bold">Risk Filter:</span>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`px-3 py-1 rounded text-xs font-bold transition active:translate-y-0.5 ${
                riskFilter === r
                  ? 'bg-cyan-500 text-slate-950 font-black shadow'
                  : 'bg-[#3b4859] text-slate-200 hover:bg-[#4a5a70] border border-[#2b3644]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p) => {
          const ra = latestAssessments[p.id];
          const riskLevel = ra?.risk_level || 'LOW';
          const riskScore = ra?.risk_score || 14.0;

          return (
            <div
              key={p.id}
              className={`clinical-panel p-4 shadow-xl transition-all duration-200 ${
                riskLevel === 'HIGH'
                  ? 'border-t-2 border-l-2 border-rose-500'
                  : riskLevel === 'MEDIUM'
                  ? 'border-t-2 border-l-2 border-amber-500'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-[#1b242e] px-2 py-0.5 rounded border border-[#3b495b]">
                    {p.id}
                  </span>
                  <span className="font-black text-base text-white">{p.name}</span>
                  <span className="text-xs text-slate-300">({p.age}y, {p.gender})</span>
                </div>

                <span
                  className={`text-[9.5px] font-black px-2 py-0.5 rounded uppercase font-mono tracking-wider ${
                    riskLevel === 'HIGH'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500 animate-pulse'
                      : riskLevel === 'MEDIUM'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                  }`}
                >
                  {riskLevel} RISK ({riskScore.toFixed(1)})
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-3 font-sans bg-[#202a36] p-2 rounded border border-[#3b495b]">
                {p.condition_summary}
              </p>

              {/* Baseline Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 clinical-display p-2.5 text-[11px] font-mono text-center mb-3">
                <div>
                  <div className="text-[10px] text-slate-400">Base HR</div>
                  <div className="text-[#00ff44] font-black">{p.baseline_hr_min}-{p.baseline_hr_max} BPM</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Base BP</div>
                  <div className="text-white font-black">{p.baseline_bp_sys}/{p.baseline_bp_dia}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Base Steps</div>
                  <div className="text-[#00e5ff] font-black">{p.baseline_daily_steps}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-[#3b495b]">
                <span className="text-[10.5px] text-slate-300 font-mono">
                  Assigned RN: <strong className="text-cyan-300">{p.assigned_caregiver_id || 'CG-001'}</strong>
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onSelectPatient(p.id);
                      onNavigateTab('overview');
                    }}
                    className="clinical-btn px-2.5 py-1 text-slate-100 text-xs font-bold flex items-center gap-1 active:translate-y-0.5"
                  >
                    <Monitor className="w-3.5 h-3.5 text-cyan-300" />
                    <span>ICU Monitor</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectPatient(p.id);
                      onNavigateTab('digital_twin');
                    }}
                    className="clinical-btn px-2.5 py-1 text-slate-100 text-xs font-bold flex items-center gap-1 active:translate-y-0.5"
                  >
                    <span>Digital Twin</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
