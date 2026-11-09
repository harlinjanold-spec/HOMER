import React, { useState } from 'react';
import {
  Users,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  ArrowUpRight,
  ChevronRight,
  Monitor,
  Maximize2,
  Minimize2,
  Heart,
  Wind,
  Radio,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Patient, Alert, VirtualDevice, Caregiver, RiskAssessment } from '../types';
import { ICUBedsideMonitor } from '../components/ICUBedsideMonitor';

interface CommandCentreOverviewProps {
  patients: Patient[];
  selectedPatient?: Patient;
  isFrozen?: boolean;
  alerts: Alert[];
  devices: VirtualDevice[];
  caregivers: Caregiver[];
  latestAssessments: Record<string, RiskAssessment>;
  onSelectPatient: (patientId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const CommandCentreOverview: React.FC<CommandCentreOverviewProps> = ({
  patients,
  selectedPatient,
  isFrozen = false,
  alerts,
  devices,
  caregivers,
  latestAssessments,
  onSelectPatient,
  onNavigateTab,
}) => {
  const [isMonitorExpanded, setIsMonitorExpanded] = useState<boolean>(true);

  // Fallback to first patient if none selected
  const activePatient = selectedPatient || patients[0];

  // Compute System KPIs from live data
  const totalPatients = patients.length;

  let highRiskCount = 0;
  let medRiskCount = 0;
  let lowRiskCount = 0;

  Object.values(latestAssessments).forEach((ra) => {
    if (ra.risk_level === 'HIGH') highRiskCount++;
    else if (ra.risk_level === 'MEDIUM') medRiskCount++;
    else lowRiskCount++;
  });

  const activeAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const unacknowledgedAlerts = alerts.filter((a) => ['NEW', 'DELIVERED'].includes(a.status));

  const connectedDevices = devices.filter((d) => d.status === 'online').length;
  const offlineDevices = devices.filter((d) => d.status !== 'online').length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-4 md:p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-6rem)] bg-[#2b3644] text-slate-100 font-sans">
      {/* ================= SECTION 1: ICU BEDSIDE TELEMETRY MONITOR (HERO) ================= */}
      <div className="clinical-panel p-3 shadow-2xl">
        {/* Hardware Monitor Frame Title Bar */}
        <div className="flex flex-wrap items-center justify-between pb-2.5 mb-2.5 border-b-2 border-[#2b3644] text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#202936] border border-[#485669] text-cyan-300 font-bold">
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>ICU BEDSIDE MONITOR</span>
            </div>
            <span className="text-slate-200 font-bold text-sm">{activePatient?.name}</span>
            <span className="text-[11px] text-slate-300 bg-[#354354] px-2 py-0.5 rounded border border-[#52637a]">
              Bed 4A-12 • {activePatient?.id}
            </span>
            {isFrozen && (
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold text-[10px] animate-pulse">
                SNAPSHOT FROZEN
              </span>
            )}
          </div>

          {/* Quick Patient Switcher Pills + Expand/Collapse */}
          <div className="flex items-center gap-2 mt-1 md:mt-0">
            <span className="text-[10px] uppercase text-slate-300 font-bold">Switch Bed:</span>
            <div className="flex items-center gap-1">
              {patients.map((p) => {
                const isSelected = p.id === activePatient?.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPatient(p.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition active:translate-y-0.5 ${
                      isSelected
                        ? 'bg-[#00ff44] text-slate-950 shadow-md font-black'
                        : 'bg-[#4a5a70] text-slate-200 hover:bg-[#5b6e87] border border-[#303d4c]'
                    }`}
                  >
                    {p.id}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsMonitorExpanded(!isMonitorExpanded)}
              className="clinical-btn ml-2 px-2.5 py-1 text-xs font-bold text-slate-200 flex items-center gap-1"
              title={isMonitorExpanded ? 'Collapse Monitor' : 'Expand Monitor'}
            >
              {isMonitorExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Compact</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Expand</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Canvas Waveform & NIBP Bedside Monitor Component */}
        {isMonitorExpanded && activePatient && (
          <ICUBedsideMonitor
            patient={activePatient}
            isFrozen={isFrozen}
            onTriggerAlarm={() => onNavigateTab('alerts')}
          />
        )}
      </div>

      {/* ================= SECTION 2: COMMAND HUB HEADER & NURSE STATION SHORTCUT ================= */}
      <div className="clinical-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base md:text-lg font-black text-white tracking-tight uppercase">
              HOSPITAL-AT-HOME COMMAND HUB
            </h2>
            <span className="text-[10px] bg-[#1a2533] text-cyan-300 border border-cyan-600/80 font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              WARD 4A ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl font-sans">
            Continuous remote biometric telemetry oversight and multi-modal AI clinical decision support across residential patient beds.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('nurse_station')}
            className="clinical-btn px-4 py-2 text-slate-100 text-xs font-black flex items-center gap-2 tracking-wide uppercase shadow-lg active:translate-y-0.5 transition"
          >
            <span>Nurse Station Triage</span>
            <ArrowUpRight className="w-4 h-4 text-cyan-300" />
          </button>
        </div>
      </div>

      {/* ================= SECTION 3: 5 HARDWARE KPI MODULES (CLINICAL DISPLAYS) ================= */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* 1. Total Census */}
        <div className="clinical-panel p-3.5 shadow-md">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[10.5px] font-mono font-bold uppercase text-slate-300">Total Census</span>
            <Users className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="clinical-display p-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white font-mono tabular-nums leading-none">
              {totalPatients}
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% Monitored
            </span>
          </div>
        </div>

        {/* 2. Critical (High Risk) */}
        <div className="clinical-panel p-3.5 shadow-md">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[10.5px] font-mono font-bold uppercase text-rose-300">Critical (High Risk)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="clinical-display p-2 flex items-baseline justify-between">
            <span className={`text-3xl font-black font-mono tabular-nums leading-none ${
              highRiskCount > 0 ? 'text-[#ff3b30] drop-shadow-[0_0_8px_rgba(255,59,48,0.5)] animate-pulse' : 'text-slate-400'
            }`}>
              {highRiskCount}
            </span>
            <span className="text-[10px] font-mono text-rose-400 font-bold">
              {highRiskCount > 0 ? 'Escalation Active' : 'All Clear'}
            </span>
          </div>
        </div>

        {/* 3. Stable / Guardrail */}
        <div className="clinical-panel p-3.5 shadow-md">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[10.5px] font-mono font-bold uppercase text-slate-300">Stable / Guardrail</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="clinical-display p-2 flex items-baseline justify-between font-mono">
            <div className="text-2xl font-black text-white tabular-nums leading-none">
              <span className="text-[#facc15]">{medRiskCount}</span> / <span className="text-[#00ff44]">{lowRiskCount}</span>
            </div>
            <span className="text-[10px] text-slate-400">Med / Low</span>
          </div>
        </div>

        {/* 4. Active Alerts */}
        <div className="clinical-panel p-3.5 shadow-md">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[10.5px] font-mono font-bold uppercase text-amber-300">Active Alerts</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="clinical-display p-2 flex items-baseline justify-between font-mono">
            <div className="text-3xl font-black text-[#facc15] tabular-nums leading-none">
              {activeAlerts.length}
            </div>
            {unacknowledgedAlerts.length > 0 && (
              <span className="text-[10px] text-amber-300 font-bold bg-amber-950 px-1.5 py-0.5 rounded border border-amber-600 animate-pulse">
                {unacknowledgedAlerts.length} unacked
              </span>
            )}
          </div>
        </div>

        {/* 5. Connected IoT Hardware */}
        <div className="clinical-panel p-3.5 shadow-md">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[10.5px] font-mono font-bold uppercase text-slate-300">IoT Hardware</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="clinical-display p-2 flex items-baseline justify-between font-mono">
            <div className="text-2xl font-black text-white tabular-nums leading-none">
              <span className="text-[#00e5ff]">{connectedDevices}</span> / <span className="text-slate-500">{offlineDevices}</span>
            </div>
            <span className="text-[10px] text-cyan-300 font-bold">Online</span>
          </div>
        </div>
      </div>

      {/* ================= SECTION 4: MONITORED HOUSEHOLD PATIENTS GRID ================= */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-mono font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" /> Monitored Household Patients (Bedside Telemetry Units)
          </h3>
          <button
            onClick={() => onNavigateTab('patients')}
            className="text-xs text-cyan-300 hover:text-white flex items-center gap-1 font-bold font-mono transition"
          >
            <span>Full Directory</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {patients.map((p) => {
            const risk = latestAssessments[p.id];
            const riskLevel = risk?.risk_level || 'LOW';
            const riskScore = risk?.risk_score || 18.0;
            const patientAlerts = alerts.filter((a) => a.patient_id === p.id && a.status !== 'RESOLVED');
            const isCurrentlySelected = p.id === activePatient?.id;

            return (
              <div
                key={p.id}
                className={`clinical-panel p-3.5 shadow-xl transition-all duration-200 cursor-pointer ${
                  isCurrentlySelected ? 'ring-2 ring-cyan-400 scale-[1.01]' : 'hover:-translate-y-0.5'
                }`}
                onClick={() => onSelectPatient(p.id)}
              >
                {/* Header with Avatar & Risk Pill */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-[#202936] border border-[#5c6e86] flex items-center justify-center font-mono font-black text-xs text-cyan-300 shadow-inner">
                      {getInitials(p.name)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-300">{p.id}</span>
                      <div className="font-black text-sm text-white leading-tight">{p.name}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                      riskLevel === 'HIGH'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500 animate-pulse'
                        : riskLevel === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                    }`}
                  >
                    {riskLevel}
                  </span>
                </div>

                {/* Condition Summary */}
                <div className="text-[11px] text-slate-300 mb-2.5 bg-[#202a36] px-2.5 py-1 rounded border border-[#3b495b] truncate font-sans">
                  {p.age}y • {p.condition_summary.split(',')[0]}
                </div>

                {/* Recessed Digital Telemetry Box */}
                <div className="clinical-display p-2.5 space-y-1 mb-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Heart className="w-3 h-3 text-[#00ff44]" /> Resting HR:
                    </span>
                    <span className="text-[#00ff44] font-black tabular-nums">
                      {p.baseline_hr_min}-{p.baseline_hr_max} BPM
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Activity className="w-3 h-3 text-[#ff3b30]" /> Baseline BP:
                    </span>
                    <span className="text-white font-bold tabular-nums">
                      {p.baseline_bp_sys}/{p.baseline_bp_dia}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Wind className="w-3 h-3 text-[#00e5ff]" /> SpO2 Base:
                    </span>
                    <span className="text-[#00e5ff] font-bold tabular-nums">
                      {p.baseline_spo2_min || 97}%
                    </span>
                  </div>
                </div>

                {/* Risk Score Progress Bar */}
                <div className="mb-2.5">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-slate-300">AI Risk Index:</span>
                    <span
                      className={`font-black tabular-nums ${
                        riskLevel === 'HIGH'
                          ? 'text-rose-400'
                          : riskLevel === 'MEDIUM'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {riskScore.toFixed(1)} / 100
                    </span>
                  </div>
                  <div className="w-full bg-[#1c2430] h-1.5 rounded-full overflow-hidden border border-[#384656]">
                    <div
                      className={`h-full transition-all duration-500 ${
                        riskLevel === 'HIGH'
                          ? 'bg-rose-500'
                          : riskLevel === 'MEDIUM'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
                    />
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-1 border-t border-[#3b495b] text-[10.5px] font-mono">
                  <span className={`font-bold ${patientAlerts.length > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {patientAlerts.length > 0 ? `🚨 ${patientAlerts.length} Alert(s)` : '0 Alerts'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPatient(p.id);
                      onNavigateTab('digital_twin');
                    }}
                    className="clinical-btn px-2 py-0.5 text-[10px] font-bold text-slate-100 flex items-center gap-1"
                  >
                    <span>Twin</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= SECTION 5: ACTIVE TRIAGE ALERT STREAM ================= */}
      <div className="clinical-panel p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 border-b-2 border-[#2b3644] pb-2.5">
          <h3 className="text-xs font-mono font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Clinical Triage Alert Stream
          </h3>
          <button
            onClick={() => onNavigateTab('alerts')}
            className="clinical-btn px-3 py-1 text-xs font-bold text-slate-200 flex items-center gap-1"
          >
            <span>Manage All Alerts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {alerts.slice(0, 4).map((alt) => (
            <div
              key={alt.id}
              className="clinical-display p-3 flex items-center justify-between text-xs hover:border-slate-500 transition"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-[9.5px] font-black px-2 py-0.5 rounded font-mono uppercase tracking-wider ${
                    alt.priority === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500 animate-pulse'
                      : alt.priority === 'HIGH'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-600'
                  }`}
                >
                  {alt.priority}
                </span>
                <div>
                  <div className="font-bold text-slate-100 flex items-center gap-2">
                    <span>{alt.title}</span>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">[{alt.patient_id}]</span>
                  </div>
                  <div className="text-[11px] text-slate-300 truncate max-w-xl font-sans mt-0.5">
                    {alt.description}
                  </div>
                </div>
              </div>

              <div className="text-right font-mono shrink-0 pl-2">
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                    alt.status === 'RESOLVED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                      : 'bg-amber-950 text-amber-300 border border-amber-500 animate-pulse'
                  }`}
                >
                  {alt.status}
                </span>
                <div className="text-[9px] text-slate-400 mt-1">Caregiver: {alt.assigned_caregiver_id || 'CG-001'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
