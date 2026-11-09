import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Clock,
  User,
  AlertTriangle,
  Radio,
  Activity,
} from 'lucide-react';
import { Patient, Alert } from '../types';

interface HeaderProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  unacknowledgedAlerts: Alert[];
  onEscalateCheck: () => void;
  isWsConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  unacknowledgedAlerts,
  onEscalateCheck,
  isWsConnected,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <header className="h-16 border-b border-slate-800/90 bg-[#0b0f19] px-6 flex items-center justify-between z-10 select-none shadow-sm">
      {/* Patient Selector Strip */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#060911] px-3.5 py-1.5 rounded-xl border border-slate-800/90 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <User className="w-3 h-3" />
          </div>
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Patient:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-100 focus:outline-none cursor-pointer font-sans"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0b0f19] text-slate-200">
                {p.id} • {p.name} ({p.age}y, {p.condition_summary.split(',')[0]})
              </option>
            ))}
          </select>
        </div>

        {selectedPatient && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Caregiver: <strong className="text-slate-200 font-sans">{selectedPatient.assigned_caregiver_id || 'CG-001'}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Room: <strong className="text-slate-200 font-sans">{selectedPatient.room_config}</strong></span>
          </div>
        )}
      </div>

      {/* Center: Live Escalation Ticker */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="flex items-center gap-2.5 bg-amber-950/50 border border-amber-600/50 px-3.5 py-1.5 rounded-xl text-xs text-amber-200 shadow-sm animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-mono text-xs">
            <strong className="text-amber-400">{unacknowledgedAlerts.length}</strong> Alert(s) Pending Review
          </span>
          <button
            onClick={onEscalateCheck}
            className="ml-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
            title="Check escalation timers"
          >
            ESCALATE CHECK
          </button>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Clock */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="tabular-nums">{currentTime}</span>
        </div>

        {/* WebSocket Signal */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <Radio className={`w-3.5 h-3.5 ${isWsConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
          <span className={isWsConnected ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            {isWsConnected ? 'LIVE FEED' : 'OFFLINE'}
          </span>
        </div>

        {/* Link to App 1 Home Simulator */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 text-xs font-bold transition shadow-md shadow-sky-950/60"
        >
          <span>Home Simulator (App 1)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
};
