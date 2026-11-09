import React from 'react';
import {
  Stethoscope,
  Users,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Clock,
  Monitor,
} from 'lucide-react';
import { Patient, Alert, Caregiver, RiskAssessment, VirtualDevice } from '../types';

interface NurseStationViewProps {
  patients: Patient[];
  alerts: Alert[];
  caregivers: Caregiver[];
  devices: VirtualDevice[];
  latestAssessments: Record<string, RiskAssessment>;
  onSelectPatient: (patientId: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const NurseStationView: React.FC<NurseStationViewProps> = ({
  patients,
  alerts,
  caregivers,
  devices,
  latestAssessments,
  onSelectPatient,
  onAcknowledgeAlert,
  onResolveAlert,
  onNavigateTab,
}) => {
  const activeAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const offlineDevices = devices.filter((d) => d.status !== 'online');

  return (
    <div className="p-4 md:p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-6rem)] bg-[#2b3644] text-slate-100 font-sans">
      {/* Header */}
      <div className="clinical-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
        <div>
          <h2 className="text-base md:text-lg font-black text-white tracking-tight flex items-center gap-2 uppercase">
            <Stethoscope className="w-5 h-5 text-cyan-400" />
            VIRTUAL NURSE STATION &amp; ESCALATION DESK
            <span className="text-[10px] font-mono bg-[#1a2533] text-cyan-300 px-2 py-0.5 rounded border border-cyan-600">
              MULTI-BED TRIAGE
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Centralized nursing oversight for monitoring home patients, dispatching caregivers, and managing escalation workflows.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-300 font-bold">Shift Lead:</span>
          <span className="font-bold text-white bg-[#1b242e] px-3 py-1 rounded border border-[#3b495b] font-mono">
            Priya Sharma, RN (Lead Virtual Nurse)
          </span>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Multi-Patient Triage Board */}
        <div className="lg:col-span-2 space-y-4">
          <div className="clinical-panel p-4 shadow-xl">
            <h3 className="text-xs font-mono font-black text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Home Patient Triage Priority Board
            </h3>

            <div className="space-y-3">
              {patients.map((p) => {
                const ra = latestAssessments[p.id];
                const riskLevel = ra?.risk_level || 'LOW';
                const pAlerts = alerts.filter((a) => a.patient_id === p.id && a.status !== 'RESOLVED');

                return (
                  <div
                    key={p.id}
                    className={`clinical-display p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                      riskLevel === 'HIGH'
                        ? 'border-t-2 border-l-2 border-rose-500 ring-1 ring-rose-500/50'
                        : riskLevel === 'MEDIUM'
                        ? 'border-t-2 border-l-2 border-amber-500'
                        : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-black text-cyan-300 bg-[#16202c] px-2 py-0.5 rounded border border-[#384656]">
                          {p.id}
                        </span>
                        <span className="font-black text-white text-sm">{p.name}</span>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded uppercase font-mono ${
                            riskLevel === 'HIGH'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500 animate-pulse'
                              : riskLevel === 'MEDIUM'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                          }`}
                        >
                          {riskLevel} RISK
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 max-w-lg font-sans">{p.condition_summary}</p>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-mono mt-2">
                        <span>Assigned: <strong className="text-slate-200">{p.assigned_caregiver_id || 'CG-001'}</strong></span>
                        <span>•</span>
                        <span>Resting HR: <strong className="text-[#00ff44]">{p.baseline_hr_min}-{p.baseline_hr_max} BPM</strong></span>
                        <span>•</span>
                        <span>Pending Alerts: <strong className={pAlerts.length > 0 ? 'text-rose-400' : 'text-slate-400'}>{pAlerts.length}</strong></span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onSelectPatient(p.id);
                          onNavigateTab('overview');
                        }}
                        className="clinical-btn px-3 py-1.5 text-slate-100 text-xs font-bold flex items-center justify-center gap-1 active:translate-y-0.5"
                      >
                        <Monitor className="w-3.5 h-3.5 text-cyan-300" />
                        <span>ICU Sweep</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectPatient(p.id);
                          onNavigateTab('digital_twin');
                        }}
                        className="clinical-btn px-3 py-1.5 text-slate-100 text-xs font-bold flex items-center justify-center gap-1 active:translate-y-0.5"
                      >
                        <span>Digital Twin</span>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Alerts Action Desk */}
          <div className="clinical-panel p-4 shadow-xl">
            <h3 className="text-xs font-mono font-black text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Active Alert Escalation Desk ({activeAlerts.length})
            </h3>

            <div className="space-y-2">
              {activeAlerts.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center font-mono">All alerts resolved. Ward running smoothly.</div>
              ) : (
                activeAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="clinical-display p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] bg-rose-950 text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-700 uppercase">
                          {alt.priority}
                        </span>
                        <span className="font-bold text-white">{alt.title}</span>
                        <span className="text-[10px] text-cyan-300 font-mono">({alt.patient_id})</span>
                      </div>
                      <p className="text-[11px] text-slate-300 max-w-xl font-sans">{alt.description}</p>
                      <div className="text-[9.5px] text-slate-400 font-mono mt-1">
                        Status: <strong className="text-amber-400">{alt.status}</strong> • Escalation Level: {alt.escalation_level}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {['NEW', 'DELIVERED'].includes(alt.status) && (
                        <button
                          onClick={() => onAcknowledgeAlert(alt.id)}
                          className="clinical-btn px-2.5 py-1 text-slate-900 font-black text-[11px] active:translate-y-0.5 transition shadow"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => onResolveAlert(alt.id)}
                        className="clinical-btn px-2.5 py-1 text-slate-900 font-black text-[11px] active:translate-y-0.5 transition shadow"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Caregiver Availability & Hardware Health */}
        <div className="space-y-4">
          {/* Caregiver Availability */}
          <div className="clinical-panel p-4 shadow-xl">
            <h3 className="text-xs font-mono font-black text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" /> On-Duty Caregiver Staffing
            </h3>

            <div className="space-y-2 text-xs">
              {caregivers.map((cg) => (
                <div
                  key={cg.id}
                  className="clinical-display p-2.5 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white">{cg.name}</div>
                    <div className="text-[10px] text-cyan-300 font-mono">{cg.role}</div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">{cg.phone}</div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[9.5px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                      {cg.attendance_status}
                    </span>
                    <div className="text-[9px] text-slate-400 mt-1">Avg: {cg.response_time_avg_sec}s</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Failure & Disconnection List */}
          <div className="clinical-panel p-4 shadow-xl">
            <h3 className="text-xs font-mono font-black text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Device Attention Queue ({offlineDevices.length})
            </h3>

            <div className="space-y-2 text-xs">
              {offlineDevices.length === 0 ? (
                <div className="text-xs text-slate-400 py-3 text-center font-mono">All devices communicating normally.</div>
              ) : (
                offlineDevices.map((d) => (
                  <div
                    key={d.id}
                    className="clinical-display p-2.5 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{d.name.split('(')[0]}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{d.patient_id} • {d.room}</div>
                    </div>
                    <span className="text-[9px] font-bold bg-rose-950 text-rose-300 px-2 py-0.5 rounded font-mono uppercase border border-rose-700">
                      {d.status}
                    </span>
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
