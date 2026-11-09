import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Activity,
  Home,
  Binary,
  BrainCircuit,
  TrendingUp,
  Stethoscope,
  HeartHandshake,
  AlertOctagon,
  Cpu,
  ShieldCheck,
  Clock,
  Radio,
  ExternalLink,
  AlertTriangle,
  User,
  Shield,
} from 'lucide-react';
import { Patient, Alert } from '../types';

export type NavTab =
  | 'overview'
  | 'patients'
  | 'monitoring'
  | 'home_monitor'
  | 'digital_twin'
  | 'ai_risk'
  | 'predictive'
  | 'nurse_station'
  | 'caregivers'
  | 'alerts'
  | 'devices'
  | 'reliability';

interface TopNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  unacknowledgedAlerts: Alert[];
  highRiskCount: number;
  onEscalateCheck: () => void;
  isWsConnected: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  patients,
  selectedPatientId,
  onSelectPatient,
  unacknowledgedAlerts,
  highRiskCount,
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

  // Grouped Navigation Structure for the Top Bar
  const navGroups = [
    {
      group: 'CENSUS',
      items: [
        { id: 'overview' as NavTab, label: 'Command Centre', icon: LayoutDashboard },
        { id: 'patients' as NavTab, label: 'Patient Directory', icon: Users },
        { id: 'monitoring' as NavTab, label: 'Live Monitoring', icon: Activity },
        { id: 'home_monitor' as NavTab, label: 'Virtual Home Monitor', icon: Home },
      ],
    },
    {
      group: 'CLINICAL AI',
      items: [
        { id: 'digital_twin' as NavTab, label: 'Patient Digital Twin', icon: Binary },
        {
          id: 'ai_risk' as NavTab,
          label: 'AI Risk Engine',
          icon: BrainCircuit,
          badge: highRiskCount > 0 ? highRiskCount : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        { id: 'predictive' as NavTab, label: 'Predictive Analytics', icon: TrendingUp },
        { id: 'nurse_station' as NavTab, label: 'Virtual Nurse Station', icon: Stethoscope },
      ],
    },
    {
      group: 'OPERATIONS',
      items: [
        { id: 'caregivers' as NavTab, label: 'Caregivers Roster', icon: HeartHandshake },
        {
          id: 'alerts' as NavTab,
          label: 'Emergency & Alerts',
          icon: AlertOctagon,
          badge: unacknowledgedAlerts.length > 0 ? unacknowledgedAlerts.length : undefined,
          badgeColor: 'bg-amber-400 text-slate-950 font-black',
        },
        { id: 'devices' as NavTab, label: 'IoT Infrastructure', icon: Cpu },
        { id: 'reliability' as NavTab, label: 'Reliability & Fault Lab', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <header className="w-full bg-[#46566c] border-b-2 border-[#2b3644] select-none z-30 shadow-xl">
      {/* ================= ROW 1: MASTER CLINICAL HOSPITAL TOPBAR ================= */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#364456] bg-gradient-to-b from-[#566880] to-[#435368]">
        {/* Left: Hospital Equipment Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#8799b2] to-[#5a6a81] border border-[#a4b5cc] flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
            W0
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-black tracking-wider text-white drop-shadow-sm">WARD ZERO</h1>
            <span className="text-[10px] text-cyan-200 font-mono font-bold tracking-tight px-2 py-0.5 rounded bg-[#2a3646] border border-[#4d6077] shadow-inner">
              ICU TELEMETRY COMMAND CENTRE
            </span>
          </div>
        </div>

        {/* Center: Clinical Patient Tag Quick Selector */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[#232c38] px-3 py-1 rounded-md border-t border-l border-[#19202a] border-r border-b border-[#51647a] shadow-inner">
            <span className="text-[10px] text-cyan-300 font-mono font-black uppercase tracking-wider">ADMIT:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => onSelectPatient(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer font-mono"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#2a3646] text-white">
                  {p.id} • {p.name} ({p.age}y, {p.condition_summary.split(',')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Pending Alerts Banner */}
          {unacknowledgedAlerts.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#78350f] border border-amber-400 px-2.5 py-1 rounded-md text-xs text-amber-100 shadow-md animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="font-mono text-xs font-bold">
                <strong>{unacknowledgedAlerts.length}</strong> ALARM(S)
              </span>
              <button
                onClick={onEscalateCheck}
                className="ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm transition"
              >
                ESCALATE
              </button>
            </div>
          )}
        </div>

        {/* Right Controls: Clinical Digital Clock, Live Stream status, Link to App 1 */}
        <div className="flex items-center gap-3">
          {/* UTC Clock in Clinical Digital Display */}
          <div className="flex items-center gap-1.5 bg-[#1a232f] px-2.5 py-1 rounded border border-[#334255] text-xs text-cyan-300 font-mono shadow-inner">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="tabular-nums font-bold tracking-wider">{currentTime}</span>
          </div>

          {/* Telemetry Stream Signal */}
          <div className="flex items-center gap-1.5 text-xs font-mono bg-[#1a232f] px-2.5 py-1 rounded border border-[#334255]">
            <Radio className={`w-3.5 h-3.5 ${isWsConnected ? 'text-[#00ff44] animate-pulse' : 'text-rose-500'}`} />
            <span className={isWsConnected ? 'text-[#00ff44] font-black tracking-wider' : 'text-rose-400 font-black'}>
              {isWsConnected ? 'LIVE FEED' : 'OFFLINE'}
            </span>
          </div>

          {/* Link to App 1 Home Simulator (Clinical Tactile Button) */}
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="clinical-btn flex items-center gap-1.5 px-3 py-1.5 text-slate-900 text-xs font-black active:translate-y-0.5 transition"
          >
            <span>Home Simulator (App 1)</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-800" />
          </a>
        </div>
      </div>

      {/* ================= ROW 2: ALL NAVIGATION TABS AS TACTILE CLINICAL KEYS ================= */}
      <div className="h-10 px-3 bg-[#334152] border-t border-[#62748c] flex items-center justify-between overflow-x-auto scrollbar-none shadow-inner">
        <div className="flex items-center gap-1 w-full justify-between">
          {navGroups.map((group, gIdx) => (
            <React.Fragment key={group.group}>
              {gIdx > 0 && <div className="h-5 w-px bg-[#202936] mx-1" />}

              <div className="flex items-center gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`h-7 px-2.5 text-[11px] font-bold rounded flex items-center gap-1.5 whitespace-nowrap transition active:translate-y-0.5 ${
                        isActive
                          ? 'bg-[#1e2a38] text-cyan-300 border border-cyan-400 shadow-inner font-black ring-1 ring-cyan-400/40'
                          : 'clinical-btn text-slate-100 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-3 h-3 ${isActive ? 'text-cyan-300' : 'text-slate-300'}`} />
                      <span>{item.label}</span>

                      {item.badge !== undefined && (
                        <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </header>
  );
};
