import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Filter,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { Alert, Caregiver } from '../types';

interface EmergencyAlertsViewProps {
  alerts: Alert[];
  caregivers: Caregiver[];
  onAcknowledgeAlert: (alertId: string, notes?: string) => void;
  onAssignAlert: (alertId: string, caregiverId: string) => void;
  onResolveAlert: (alertId: string, notes: string) => void;
  onEscalateCheck: () => void;
}

export const EmergencyAlertsView: React.FC<EmergencyAlertsViewProps> = ({
  alerts,
  caregivers,
  onAcknowledgeAlert,
  onAssignAlert,
  onResolveAlert,
  onEscalateCheck,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  const filteredAlerts = alerts.filter((a) => {
    if (filterPriority !== 'ALL' && a.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    return true;
  });

  const handleConfirmResolve = (alertId: string) => {
    if (!resolutionNotes.trim()) return;
    onResolveAlert(alertId, resolutionNotes);
    setResolvingAlertId(null);
    setResolutionNotes('');
  };

  return (
    <div className="p-4 md:p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-6rem)] bg-[#2b3644] text-slate-100 font-sans">
      {/* Header */}
      <div className="clinical-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
        <div>
          <h2 className="text-base md:text-lg font-black text-white tracking-tight flex items-center gap-2 uppercase">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            EMERGENCY ALERTS &amp; ESCALATION MANAGEMENT
            <span className="text-[10px] font-mono bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-700">
              AUDITABLE PROTOCOL
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Full compliance lifecycle: NEW → DELIVERED → ACKNOWLEDGED → ASSIGNED → IN_PROGRESS → RESOLVED.
          </p>
        </div>

        <button
          onClick={onEscalateCheck}
          className="clinical-btn px-3 py-1.5 text-xs font-black text-slate-900 flex items-center gap-1.5 active:translate-y-0.5 transition"
        >
          <Clock className="w-4 h-4 text-amber-700" />
          <span>Auto-Escalation Check</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="clinical-panel p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-bold">Priority:</span>
          <div className="flex gap-1 font-mono">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition active:translate-y-0.5 ${
                  filterPriority === p
                    ? 'bg-cyan-500 text-slate-950 font-black shadow'
                    : 'bg-[#3b4859] text-slate-300 hover:bg-[#4a5a70] border border-[#2b3644]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-300 font-bold">Status:</span>
          <div className="flex gap-1 font-mono">
            {['ALL', 'NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition active:translate-y-0.5 ${
                  filterStatus === s
                    ? 'bg-cyan-500 text-slate-950 font-black shadow'
                    : 'bg-[#3b4859] text-slate-300 hover:bg-[#4a5a70] border border-[#2b3644]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="clinical-panel p-8 text-center text-slate-400 font-mono text-xs">
            No alerts matching the selected filters.
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const isCritical = alt.priority === 'CRITICAL';
            const isHigh = alt.priority === 'HIGH';

            return (
              <div
                key={alt.id}
                className={`clinical-panel p-4 shadow-xl transition-all ${
                  isCritical
                    ? 'border-t-2 border-l-2 border-rose-500 ring-1 ring-rose-500/50'
                    : isHigh
                    ? 'border-t-2 border-l-2 border-amber-500'
                    : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Alert Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9.5px] font-black px-2 py-0.5 rounded font-mono uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-950 text-rose-300 border border-rose-500 animate-pulse'
                            : isHigh
                            ? 'bg-amber-950 text-amber-300 border border-amber-500'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-600'
                        }`}
                      >
                        {alt.priority}
                      </span>
                      <span className="font-black text-white text-sm">{alt.title}</span>
                      <span className="text-[10px] text-cyan-300 font-mono font-bold">[{alt.patient_id}]</span>
                      <span className="text-[10px] text-slate-400 font-mono">{alt.id}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{alt.description}</p>

                    {/* Metadata & Audit Trail */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                      <span>Created: {new Date(alt.created_at).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>Category: <strong className="text-slate-200">{alt.category}</strong></span>
                      <span>•</span>
                      <span>Assigned: <strong className="text-cyan-300">{alt.assigned_caregiver_id || 'CG-001'}</strong></span>
                      {alt.escalation_level > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-rose-400 font-bold">Escalation Level {alt.escalation_level}</span>
                        </>
                      )}
                      {alt.acknowledged_by && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">Ack by {alt.acknowledged_by} ({new Date(alt.acknowledged_at!).toLocaleTimeString()})</span>
                        </>
                      )}
                      {alt.resolved_by && (
                        <>
                          <span>•</span>
                          <span className="text-slate-300">Resolved by {alt.resolved_by}: "{alt.resolution_notes}"</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Action Controls */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status Badge */}
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded uppercase ${
                        alt.status === 'RESOLVED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                          : alt.status === 'ACKNOWLEDGED'
                          ? 'bg-blue-950 text-blue-300 border border-blue-600'
                          : alt.status === 'IN_PROGRESS'
                          ? 'bg-purple-950 text-purple-300 border border-purple-600'
                          : 'bg-rose-950 text-rose-300 border border-rose-500 animate-pulse'
                      }`}
                    >
                      {alt.status}
                    </span>

                    {/* Acknowledge Button */}
                    {['NEW', 'DELIVERED'].includes(alt.status) && (
                      <button
                        onClick={() => onAcknowledgeAlert(alt.id, 'Reviewed in Emergency Alerts Feed')}
                        className="clinical-btn px-3 py-1.5 text-slate-900 text-xs font-black active:translate-y-0.5 transition shadow"
                      >
                        Acknowledge
                      </button>
                    )}

                    {/* Resolve Button */}
                    {alt.status !== 'RESOLVED' && (
                      <button
                        onClick={() => setResolvingAlertId(alt.id)}
                        className="clinical-btn px-3 py-1.5 text-slate-900 text-xs font-black active:translate-y-0.5 transition shadow"
                      >
                        Resolve...
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Resolution Modal Prompt if clicked */}
                {resolvingAlertId === alt.id && (
                  <div className="mt-3 pt-3 border-t border-[#3b495b] flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter clinical resolution notes (mandatory)..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="flex-1 bg-[#1b242e] border border-[#3b495b] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-400 font-mono"
                    />
                    <button
                      onClick={() => handleConfirmResolve(alt.id)}
                      className="clinical-btn px-3 py-1.5 text-emerald-950 bg-emerald-400 hover:bg-emerald-300 font-black text-xs active:translate-y-0.5 transition"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setResolvingAlertId(null)}
                      className="clinical-btn px-3 py-1.5 text-slate-300 font-bold text-xs active:translate-y-0.5 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
