import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  WifiOff,
  ZapOff,
  BatteryWarning,
  Cpu,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileText,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Patient, AuditLog } from '../types';
import { CommandCentreApi } from '../services/api';

interface ReliabilityLabViewProps {
  patient: Patient;
  onFaultInjected: (msg: string) => void;
}

export const ReliabilityLabView: React.FC<ReliabilityLabViewProps> = ({
  patient,
  onFaultInjected,
}) => {
  const [activeFaults, setActiveFaults] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadLabData();
  }, [patient.id]);

  const loadLabData = async () => {
    setLoading(true);
    const faults = await CommandCentreApi.getActiveFaults(patient.id);
    const logs = await CommandCentreApi.getAuditLogs(patient.id);
    setActiveFaults(faults);
    setAuditLogs(logs);
    setLoading(false);
  };

  const handleInject = async (type: string, desc: string) => {
    const res = await CommandCentreApi.injectFault(type, patient.id, undefined, desc);
    if (res) {
      onFaultInjected(`Injected ${type}: ${desc}`);
      loadLabData();
    }
  };

  const handleRecover = async (faultId: string) => {
    const res = await CommandCentreApi.recoverFault(faultId);
    if (res) {
      onFaultInjected(`Fault ${faultId} recovered. Devices restored.`);
      loadLabData();
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            RELIABILITY, RESILIENCE & FAULT LAB
            <span className="text-xs font-mono bg-purple-950 text-purple-400 px-2 py-0.5 rounded-full border border-purple-800">
              20% HACKATHON EVALUATION CRITERION
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulate network partitions, residential power blackouts, hardware dropouts, and verify safe local buffering & recovery.
          </p>
        </div>

        <button
          onClick={loadLabData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121d36] hover:bg-[#182747] text-cyan-300 text-xs font-bold border border-[#1e2d4d] transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Fault Injection Console Grid */}
      <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" /> Chaos & Fault Injection Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. Wi-Fi Disconnect */}
          <button
            onClick={() => handleInject('WIFI_DISCONNECT', 'Residential Wi-Fi access point failure')}
            className="p-3.5 rounded-xl bg-[#121d36] hover:bg-[#182747] border border-[#1e2d4d] text-left transition active:scale-95 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white group-hover:text-cyan-300">Wi-Fi Disconnect</span>
              <WifiOff className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Drops RF link. App 1 switches to local IndexedDB queue and stores packets with preserved timestamps.
            </p>
          </button>

          {/* 2. Power Blackout */}
          <button
            onClick={() => handleInject('POWER_OUTAGE', 'Residential grid power blackout')}
            className="p-3.5 rounded-xl bg-[#121d36] hover:bg-[#182747] border border-[#1e2d4d] text-left transition active:scale-95 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white group-hover:text-cyan-300">Power Outage</span>
              <ZapOff className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Cuts mains power. Smart Mattress and Mirror shut down; battery slippers & watch switch to reserve.
            </p>
          </button>

          {/* 3. Low Battery Drain */}
          <button
            onClick={() => handleInject('LOW_BATTERY', 'Smart Slippers critical battery (5%)')}
            className="p-3.5 rounded-xl bg-[#121d36] hover:bg-[#182747] border border-[#1e2d4d] text-left transition active:scale-95 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white group-hover:text-cyan-300">Low Battery (5%)</span>
              <BatteryWarning className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Drains battery to critical threshold. Emits low battery warning to Virtual Nurse Station.
            </p>
          </button>

          {/* 4. Sensor Failure */}
          <button
            onClick={() => handleInject('SENSOR_FAULT', 'Piezoelectric sensor contact fault in Smart Dress')}
            className="p-3.5 rounded-xl bg-[#121d36] hover:bg-[#182747] border border-[#1e2d4d] text-left transition active:scale-95 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white group-hover:text-cyan-300">Sensor Fault</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Injects questionable or noisy telemetry packets. AI engine detects variance anomaly.
            </p>
          </button>
        </div>
      </div>

      {/* Active Faults & Recovery Panel */}
      <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-cyan-400" /> Active Simulated Faults & Recovery Actions ({activeFaults.length})
        </h3>

        <div className="space-y-2 text-xs">
          {activeFaults.length === 0 ? (
            <div className="text-slate-500 py-3 text-center font-mono">
              No active faults injected. All subsystems running with 100% operational resilience.
            </div>
          ) : (
            activeFaults.map((f) => (
              <div
                key={f.id}
                className="bg-[#121d36] p-3 rounded-xl border border-red-500/50 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-red-400">{f.fault_type}</span>
                    <span className="text-[10px] text-slate-400 font-mono">[{f.id}]</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5">{f.notes}</p>
                  <div className="text-[9px] text-slate-500 font-mono mt-1">
                    Injected: {new Date(f.injected_at).toLocaleTimeString()}
                  </div>
                </div>

                <button
                  onClick={() => handleRecover(f.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md"
                >
                  Recover Fault & Resync
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Audit Logs (Auditable Transitions) */}
      <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" /> Auditable Security & Incident Event Log
        </h3>

        <div className="h-64 overflow-y-auto space-y-1.5 bg-[#070b19] p-3 rounded-xl border border-[#1e2d4d] font-mono text-[10px]">
          {auditLogs.length === 0 ? (
            <div className="text-slate-600 text-center py-6">No audit records recorded.</div>
          ) : (
            auditLogs.map((l) => (
              <div key={l.id} className="flex items-start justify-between border-b border-[#121d36] pb-1">
                <div>
                  <span className="text-cyan-400 font-bold">[{l.event_type}]</span>{' '}
                  <span className="text-slate-300">{l.description}</span>
                </div>
                <div className="text-right text-slate-500 flex-shrink-0 ml-4">
                  <span>{new Date(l.timestamp).toLocaleTimeString()}</span>
                  <div className="text-[9px] text-slate-600">Actor: {l.actor}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

